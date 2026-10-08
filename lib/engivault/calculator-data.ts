import { wetSteamProperties, steamQualityEnthalpy, waterSaturationPressure, waterSaturationTemperature } from "./water-properties"
import { thermalTransport, measurementUncertainty, firstOrderResponse, currentLoopBudget, currentLoopScale, currentLoopOutput, sectionBeam, rectangularSection, circularSection, normalShock, gasFlowState, shaftTorsion, pressureDrop, npsh, pipeSizing, hydrostaticPressure, dynamicPressure, wallConduction, dcResistor, axialBar, idealGasDensity, sensibleHeat, linearExpansion, surfaceConvection, enclosureRadiation, soundIntensityLevel, sphericalSound, pumpDuty, compositeWall, humidAir, rectangularBeam, insulatedPipe, liquidValve, waterProperties, waterPipeLoss, acPower, seriesRlc, humidAirWetBulb, mixHumidAir, airTemperatureProcess } from "./engineering"
export type CalculatorConfig = {
  title: string
  category: string
  sources?: { title: string; url: string; accessed: string }[]
  inputs: InputField[]
  results: ResultField[]
  calculate: (inputs: Record<string, number>) => Record<string, number | string>
  steps: string[]
  generateDynamicSteps?: (inputs: Record<string, number>, results: Record<string, number | string>) => string[]
  apiEndpoint?: string // Added API endpoint for ENGiVault integration
  apiCalculationType?: string // Added calculation type for API calls
}

type InputField = {
  id: string
  label: string
  unit: string
  defaultValue: string
  type?: string
  options?: { value: string; label: string }[]
}

type ResultField = {
  significantDigits?: number
  id: string
  label: string
  unit: string
}

const steamMixtureResults: ResultField[] = [
 {id:"pressure",label:"Absolute saturation pressure",unit:"Pa",significantDigits:9},
 {id:"temperature",label:"Saturation temperature",unit:"K",significantDigits:9},
 {id:"celsius",label:"Saturation temperature",unit:"°C",significantDigits:9},
 {id:"quality",label:"Vapor mass fraction (quality)",unit:"kg vapor / kg mixture",significantDigits:8},
 {id:"moisture",label:"Liquid mass fraction (moisture)",unit:"kg liquid / kg mixture",significantDigits:8},
 {id:"vaporVolumeFraction",label:"Vapor volume fraction",unit:"m³ vapor / m³ mixture",significantDigits:8},
 {id:"specificVolume",label:"Mixture specific volume",unit:"m³/kg",significantDigits:8},
 {id:"density",label:"Mixture density",unit:"kg/m³",significantDigits:8},
 {id:"enthalpy",label:"Mixture specific enthalpy",unit:"J/kg",significantDigits:8},
 {id:"entropy",label:"Mixture specific entropy",unit:"J/(kg·K)",significantDigits:8},
 {id:"internalEnergy",label:"Mixture specific internal energy",unit:"J/kg",significantDigits:8},
 {id:"liquidEnthalpy",label:"Saturated liquid specific enthalpy",unit:"J/kg",significantDigits:8},
 {id:"vaporEnthalpy",label:"Saturated vapor specific enthalpy",unit:"J/kg",significantDigits:8},
 {id:"latentHeat",label:"Latent heat of vaporization",unit:"J/kg",significantDigits:8},
 {id:"phase",label:"Equilibrium phase",unit:""},
]
const steamMixtureSteps = [
 "Pure water at liquid-vapor equilibrium, using absolute pressure in Pa. The range is 611.657 Pa through pressures strictly below 22064000 Pa. Quality is undefined at the critical point; numerically unresolved phase boundaries are rejected.",
 "Saturation temperature and separate liquid/vapor properties use IAPWS SR1-86(1992). The release’s rounded lower pressure endpoint maps to the triple-point temperature. Ice and dissolved substances are excluded.",
 "Quality x is vapor mass divided by total mixture mass. Enter a fraction, such as 0.9 for 90%. Specific volume, enthalpy and entropy are mass-weighted: y = (1 − x)y_liquid + x y_vapor. Density is 1/v, not a mass-weighted average of the two densities.",
 "Vapor volume fraction = x v_vapor / v_mixture. This describes a saturated inventory. It is not a flowing-pipe void-fraction prediction from vapor mass flow fraction; phase slip and flow patterns are not modeled.",
 "Mixture internal energy u = h − pv. Enthalpy and entropy retain the IAPWS reference convention. For the inverse calculation, x = (h − h_liquid)/(h_vapor − h_liquid); values outside the model’s saturated enthalpy interval are rejected rather than clamped. Near-critical inversion is sensitive as the enthalpy gap shrinks.",
]
const steamMixtureSources = [
 {title:"IAPWS SR1-86(1992): Saturation phase properties",url:"https://iapws.org/public/documents/6dGkr/Supp-sat.pdf",accessed:"2026-09-08"},
 {title:"DOE Thermodynamics Volume 1: quality, mixture properties and enthalpy definitions, pages 18, 34 and 49",url:"https://www.energy.gov/sites/default/files/2026-04/DOE-HDBK-1012-92_VOL1.pdf",accessed:"2026-09-08"},
]

const thermalTransportSteps = [
  "Calculate dimensionless transport groups and diffusivities from fluid properties, a speed and a characteristic length. Defaults are an illustrative property set, not a certified fluid state.",
  "Supply positive scalar properties for the same fluid and evaluation state. Dynamic viscosity μ is in Pa·s, not cP or m²/s; specific heat cp is in J/(kg·K), not kJ/(kg·K). This tool does not evaluate properties from temperature or pressure.",
  "Kinematic viscosity ν = μ/ρ and thermal diffusivity α = k/(ρ cp), both in m²/s. Prandtl number Pr = ν/α = μ cp/k compares momentum and thermal diffusion.",
  "Reynolds number Re = UL/ν. Choose the speed and length required by your intended model, such as bulk speed and inside diameter for a circular pipe. A plate length, hydraulic diameter and computational-cell size are different choices and are not automatically interchangeable.",
  "Thermal Péclet number Pe = UL/α = Re × Pr when the same speed and length are used. It compares advection and thermal diffusion on those scales. This is not a mass-transfer Péclet number; that uses a mass diffusivity instead.",
  "Zero speed gives Re = Pe = 0 while the material diffusivities and Pr remain defined. No universal laminar/turbulent classification, Nusselt correlation, heat-transfer coefficient or boundary-layer thickness is inferred. Match geometry, boundary conditions, property evaluation and validity range when selecting a correlation.",
 ]

export const calculators: Record<string, CalculatorConfig> = {
"thermal-transport-numbers": {
 title:"Reynolds, Prandtl and Péclet Numbers",category:"Thermal",apiEndpoint:"/api/thermal/transport-numbers",
 inputs:[
  {id:"density",label:"Fluid density",unit:"kg/m³",defaultValue:"1000"},
  {id:"viscosity",label:"Dynamic viscosity",unit:"Pa·s",defaultValue:"0.001"},
  {id:"specificHeat",label:"Specific heat at constant pressure",unit:"J/(kg·K)",defaultValue:"4000"},
  {id:"conductivity",label:"Thermal conductivity",unit:"W/(m·K)",defaultValue:"0.5"},
  {id:"speed",label:"Characteristic speed",unit:"m/s",defaultValue:"1"},
  {id:"length",label:"Characteristic length",unit:"m",defaultValue:"0.01"},
 ],
 results:[
  {id:"kinematicViscosity",label:"Kinematic viscosity (momentum diffusivity)",unit:"m²/s",significantDigits:8},
  {id:"thermalDiffusivity",label:"Thermal diffusivity",unit:"m²/s",significantDigits:8},
  {id:"reynoldsNumber",label:"Reynolds number Re",unit:"",significantDigits:8},
  {id:"prandtlNumber",label:"Prandtl number Pr",unit:"",significantDigits:8},
  {id:"pecletNumber",label:"Thermal Péclet number Pe",unit:"",significantDigits:8},
 ],calculate:thermalTransport,
 steps:thermalTransportSteps,
 generateDynamicSteps:(x,r)=>[
  ...thermalTransportSteps,
  `ν = μ/ρ = ${Number(r.kinematicViscosity).toPrecision(6)} m²/s; α = k/(ρ cp) = ${Number(r.thermalDiffusivity).toPrecision(6)} m²/s.`,
  `Using U = ${x.speed} m/s and L = ${x.length} m: Re = ${Number(r.reynoldsNumber).toPrecision(6)}, Pr = ${Number(r.prandtlNumber).toPrecision(6)}, Pe = ${Number(r.pecletNumber).toPrecision(6)}.`,
  "Doubling U or L with fixed properties doubles Re and Pe, but leaves Pr unchanged. These calculated groups are inputs to a selected physical model, not a heat-transfer prediction by themselves.",
 ],
 sources:[
  {title:"NASA Glenn: Reynolds number and kinematic viscosity",url:"https://www.grc.nasa.gov/WWW/k-12/airplane/reynolds.html",accessed:"2026-09-08"},
  {title:"MIT Unified Engineering: Prandtl number and thermal diffusivity, equation 17.7",url:"https://web.mit.edu/16.unified/www/FALL/thermodynamics/notes/node122.html",accessed:"2026-09-08"},
  {title:"Idaho National Laboratory MOOSE: Péclet number UL/alpha (cell-length application)",url:"https://mooseframework.inl.gov/source/auxkernels/PecletNumberFunctorAux.html",accessed:"2026-09-08"},
 ],
},
"measurement-uncertainty": {
 title:"Two-Input Measurement Uncertainty",category:"Measurement & Control",apiEndpoint:"/api/controls/measurement-uncertainty",
 inputs:[
  {id:"operation",label:"Measurement equation",unit:"",defaultValue:"2",type:"select",options:[{value:"0",label:"A + B"},{value:"1",label:"A − B"},{value:"2",label:"A × B"},{value:"3",label:"A / B"}]},
  {id:"valueA",label:"Estimate A",unit:"A unit",defaultValue:"10"},
  {id:"valueB",label:"Estimate B",unit:"B unit",defaultValue:"2"},
  {id:"uncertaintyA",label:"Standard uncertainty of A",unit:"A unit",defaultValue:"0.1"},
  {id:"uncertaintyB",label:"Standard uncertainty of B",unit:"B unit",defaultValue:"0.02"},
  {id:"correlation",label:"Correlation coefficient",unit:"−1 to 1",defaultValue:"0"},
  {id:"coverageFactor",label:"Coverage factor k",unit:"",defaultValue:"2"},
 ],
 results:[
  {id:"estimate",label:"Output estimate",unit:"output unit",significantDigits:8},
  {id:"sensitivityA",label:"Sensitivity to A",unit:"output unit / A unit",significantDigits:8},
  {id:"sensitivityB",label:"Sensitivity to B",unit:"output unit / B unit",significantDigits:8},
  {id:"standardUncertainty",label:"Combined standard uncertainty",unit:"output unit",significantDigits:8},
  {id:"relativeStandardUncertainty",label:"Relative standard uncertainty",unit:"%",significantDigits:8},
  {id:"coverageFactor",label:"Coverage factor k",unit:"",significantDigits:8},
  {id:"expandedUncertainty",label:"Expanded uncertainty U",unit:"output unit",significantDigits:8},
  {id:"lowerEstimate",label:"Estimate minus U",unit:"output unit",significantDigits:8},
  {id:"upperEstimate",label:"Estimate plus U",unit:"output unit",significantDigits:8},
  {id:"method",label:"Method",unit:""},
 ],calculate:measurementUncertainty,
 steps:[
  "Propagate two input standard uncertainties through addition, subtraction, multiplication or division. Standard uncertainty is expressed as a standard deviation; do not enter a tolerance bound or expanded uncertainty unchanged.",
  "Use the same unit for A and B in addition/subtraction. For multiplication the output unit is A-unit × B-unit; for division it is A-unit / B-unit. Enter each absolute standard uncertainty in the same unit as its corresponding estimate. No unit conversion is performed.",
  "Let cA = ∂f/∂A and cB = ∂f/∂B. Combined variance uc² = (cA uA)² + (cB uB)² + 2r cA cB uA uB, where r is the correlation coefficient. A value of zero specifies uncorrelated inputs; it is not inferred from the data.",
  "Sensitivities are (1, 1) for a sum, (1, −1) for a difference, (B, A) for a product and (1/B, −A/B²) for a quotient. This is first-order propagation; nonlinear effects can matter for products and ratios, especially with a denominator near zero. A zero first-order result does not prove zero uncertainty for a nonlinear model. No Monte Carlo propagation, distribution or degrees-of-freedom estimate is provided.",
  "Expanded uncertainty U = k uc. The displayed estimate ± U does not have an automatically assigned confidence level. Choosing k = 2 alone does not establish 95% coverage. Relative standard uncertainty is 100 uc/|estimate| and is undefined at a zero estimate.",
 ],sources:[
  {title:"NIST TN 1297 Appendix A: Law of Propagation of Uncertainty",url:"https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-appendix-law-propagation-uncertainty",accessed:"2026-09-08"},
  {title:"NIST TN 1297 Section 6: Expanded Uncertainty",url:"https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-6-expanded-uncertainty",accessed:"2026-09-08"},
 ],
},
"wet-steam-properties": {
 title:"Wet Steam Mixture Properties",category:"Thermal",apiEndpoint:"/api/thermal/wet-steam-properties",
 inputs:[{id:"pressure",label:"Absolute saturation pressure",unit:"Pa",defaultValue:"101325"},{id:"quality",label:"Vapor mass fraction (quality, 0 to 1)",unit:"kg vapor / kg mixture",defaultValue:"0.9"}],
 results:steamMixtureResults,calculate:wetSteamProperties,steps:steamMixtureSteps,sources:steamMixtureSources,
},
"steam-quality-enthalpy": {
 title:"Steam Quality from Enthalpy",category:"Thermal",apiEndpoint:"/api/thermal/steam-quality-enthalpy",
 inputs:[{id:"pressure",label:"Absolute saturation pressure",unit:"Pa",defaultValue:"101325"},{id:"enthalpy",label:"Mixture specific enthalpy",unit:"J/kg",defaultValue:"2450000"}],
 results:steamMixtureResults,calculate:steamQualityEnthalpy,steps:steamMixtureSteps,sources:steamMixtureSources,
},
"water-saturation-pressure": {
 title:"Water Saturation Pressure",category:"Thermal",apiEndpoint:"/api/thermal/water-saturation-pressure",
 inputs:[{id:"temperature",label:"Saturation temperature",unit:"K",defaultValue:"373.15"}],
 results:[{id:"temperature",label:"Saturation temperature",unit:"K",significantDigits:9},{id:"celsius",label:"Saturation temperature",unit:"°C",significantDigits:9},{id:"pressure",label:"Absolute saturation pressure",unit:"Pa",significantDigits:9},
 {id:"liquidDensity",label:"Saturated liquid density",unit:"kg/m³",significantDigits:8},
 {id:"vaporDensity",label:"Saturated vapor density",unit:"kg/m³",significantDigits:8},
 {id:"liquidSpecificVolume",label:"Saturated liquid specific volume",unit:"m³/kg",significantDigits:8},
 {id:"vaporSpecificVolume",label:"Saturated vapor specific volume",unit:"m³/kg",significantDigits:8},
 {id:"liquidEnthalpy",label:"Saturated liquid specific enthalpy",unit:"J/kg",significantDigits:8},
 {id:"vaporEnthalpy",label:"Saturated vapor specific enthalpy",unit:"J/kg",significantDigits:8},
 {id:"liquidEntropy",label:"Saturated liquid specific entropy",unit:"J/(kg·K)",significantDigits:8},
 {id:"vaporEntropy",label:"Saturated vapor specific entropy",unit:"J/(kg·K)",significantDigits:8},
 {id:"latentHeat",label:"Latent heat of vaporization",unit:"J/kg",significantDigits:8},
 {id:"pressureSlope",label:"Slope of saturation pressure with temperature",unit:"Pa/K",significantDigits:8}],
 calculate:waterSaturationPressure,
 steps:[
  "Pure water liquid-vapor equilibrium from the triple-point temperature 273.16 K to the critical point 647.096 K. Pressure is absolute, never gauge; temperature input uses kelvin.",
  "Uses IAPWS SR1-86(1992), equation (1), with critical temperature 647.096 K and pressure 22.064 MPa. Pressure-to-temperature conversion numerically inverts the same monotonic correlation.",
  "The lower pressure input limit is the release table’s rounded triple-point pressure, 611.657 Pa. The tiny interval up to the equation’s approximately 611.657070 Pa endpoint maps to 273.16 K. The upper limit is 22064000 Pa.",
  "At 101325 Pa, saturation temperature is approximately 373.1243 K (99.9743 °C). This is equilibrium for pure water, not a boiling-temperature prediction for solutions or transient heating.",
  "At a saturation pair, pressure and temperature do not specify vapor fraction or mixture enthalpy. The two densities and reciprocal specific volumes describe separate saturated phases using IAPWS equations (2) and (3), not mixture density. Enthalpy and entropy use equations (4)-(9) and the release reference convention: liquid internal energy and entropy are zero at the triple point, subject to coefficient rounding. Latent heat is the vapor-minus-liquid enthalpy difference. This tool does not calculate steam quality, superheat or subcooled-liquid properties. At the critical endpoint the distinct liquid and vapor phases merge.",
 ],sources:[{title:"IAPWS SR1-86(1992): Saturation Properties, equations (1)-(9) and Table 1",url:"https://iapws.org/public/documents/6dGkr/Supp-sat.pdf",accessed:"2026-09-08"}],
},
"water-saturation-temperature": {
 title:"Water Saturation Temperature",category:"Thermal",apiEndpoint:"/api/thermal/water-saturation-temperature",
 inputs:[{id:"pressure",label:"Absolute saturation pressure",unit:"Pa",defaultValue:"101325"}],
 results:[{id:"temperature",label:"Saturation temperature",unit:"K",significantDigits:9},{id:"celsius",label:"Saturation temperature",unit:"°C",significantDigits:9},{id:"pressure",label:"Absolute saturation pressure",unit:"Pa",significantDigits:9},
 {id:"liquidDensity",label:"Saturated liquid density",unit:"kg/m³",significantDigits:8},
 {id:"vaporDensity",label:"Saturated vapor density",unit:"kg/m³",significantDigits:8},
 {id:"liquidSpecificVolume",label:"Saturated liquid specific volume",unit:"m³/kg",significantDigits:8},
 {id:"vaporSpecificVolume",label:"Saturated vapor specific volume",unit:"m³/kg",significantDigits:8},
 {id:"liquidEnthalpy",label:"Saturated liquid specific enthalpy",unit:"J/kg",significantDigits:8},
 {id:"vaporEnthalpy",label:"Saturated vapor specific enthalpy",unit:"J/kg",significantDigits:8},
 {id:"liquidEntropy",label:"Saturated liquid specific entropy",unit:"J/(kg·K)",significantDigits:8},
 {id:"vaporEntropy",label:"Saturated vapor specific entropy",unit:"J/(kg·K)",significantDigits:8},
 {id:"latentHeat",label:"Latent heat of vaporization",unit:"J/kg",significantDigits:8},
 {id:"pressureSlope",label:"Slope of saturation pressure with temperature",unit:"Pa/K",significantDigits:8}],
 calculate:waterSaturationTemperature,
 steps:[
  "Pure water liquid-vapor equilibrium from the triple-point temperature 273.16 K to the critical point 647.096 K. Pressure is absolute, never gauge; temperature input uses kelvin.",
  "Uses IAPWS SR1-86(1992), equation (1), with critical temperature 647.096 K and pressure 22.064 MPa. Pressure-to-temperature conversion numerically inverts the same monotonic correlation.",
  "The lower pressure input limit is the release table’s rounded triple-point pressure, 611.657 Pa. The tiny interval up to the equation’s approximately 611.657070 Pa endpoint maps to 273.16 K. The upper limit is 22064000 Pa.",
  "At 101325 Pa, saturation temperature is approximately 373.1243 K (99.9743 °C). This is equilibrium for pure water, not a boiling-temperature prediction for solutions or transient heating.",
  "At a saturation pair, pressure and temperature do not specify vapor fraction or mixture enthalpy. The two densities and reciprocal specific volumes describe separate saturated phases using IAPWS equations (2) and (3), not mixture density. Enthalpy and entropy use equations (4)-(9) and the release reference convention: liquid internal energy and entropy are zero at the triple point, subject to coefficient rounding. Latent heat is the vapor-minus-liquid enthalpy difference. This tool does not calculate steam quality, superheat or subcooled-liquid properties. At the critical endpoint the distinct liquid and vapor phases merge.",
 ],sources:[{title:"IAPWS SR1-86(1992): Saturation Properties, equations (1)-(9) and Table 1",url:"https://iapws.org/public/documents/6dGkr/Supp-sat.pdf",accessed:"2026-09-08"}],
},
"first-order-response": {
 title:"First-Order Process Response with Delay",category:"Measurement & Control",apiEndpoint:"/api/controls/first-order-response",
 inputs:[
  {id:"initialValue",label:"Initial equilibrium output",unit:"output EU",defaultValue:"20"},
  {id:"gain",label:"Process gain",unit:"output EU / input EU",defaultValue:"2"},
  {id:"inputStep",label:"Input step change at time zero",unit:"input EU",defaultValue:"10"},
  {id:"timeConstant",label:"Time constant",unit:"s",defaultValue:"30"},
  {id:"deadTime",label:"Response delay",unit:"s",defaultValue:"5"},
  {id:"time",label:"Time since input step",unit:"s",defaultValue:"35"},
 ],
 results:[
  {id:"outputValue",label:"Output at observation time",unit:"output EU",significantDigits:8},
  {id:"finalValue",label:"Final equilibrium output",unit:"output EU",significantDigits:8},
  {id:"finalChange",label:"Final output change",unit:"output EU",significantDigits:8},
  {id:"percentResponse",label:"Completed fraction of final change",unit:"%",significantDigits:8},
  {id:"responseRate",label:"Output rate (right-hand value at delay boundary)",unit:"output EU/s",significantDigits:8},
  {id:"timeTo90",label:"Time from input step to 90% response",unit:"s",significantDigits:8},
  {id:"timeTo95",label:"Time from input step to 95% response",unit:"s",significantDigits:8},
  {id:"timeTo98",label:"Time from input step to 98% response",unit:"s",significantDigits:8},
  {id:"phase",label:"Response phase",unit:""},
 ],calculate:firstOrderResponse,
 steps:[
  "EU means engineering unit. Use consistent input/output units; gain is output-unit change divided by input-unit change. This is a stable linear first-order-plus-dead-time process initially at equilibrium, with one sustained step at time zero.",
  "Final change = gain × input step; final output = initial output + final change. Negative gains and steps are allowed.",
  "Before delay θ, output stays at its initial value. At and after θ: y = y_initial + final_change × [1 − exp(−(t − θ)/τ)], with positive time constant τ. At θ + τ, 63.212% of the final change is complete.",
  "After the delay, output rate = (final_change/τ) × exp(−(t − θ)/τ). At the delay boundary the tool reports the right-hand derivative; the derivative jumps from zero for a nonzero step.",
  "Time to fraction f is θ − τ ln(1 − f), measured from the input step. For this monotonic model, 90%, 95% and 98% correspond to remaining-error bands of 10%, 5% and 2% of the final change, not of the absolute output.",
  "If the final change is zero, output stays constant, rate and response times are zero, and percent completion is not applicable. Exact final equilibrium is approached asymptotically for a nonzero change; displayed numbers eventually round to it.",
  "This does not fit parameters, tune a controller or simulate a closed loop, oscillation, actuator saturation, multiple steps, nonlinear behavior or an unstable/integrating process. Use identified model parameters valid around the operating point.",
 ],sources:[{title:"APMonitor Process Dynamics and Control: First Order Plus Dead Time",url:"https://www.apmonitor.com/pdc/index.php/Main/FirstOrderSystems",accessed:"2026-09-08"}],
},
"current-loop-budget": {
 title:"Current-Loop Voltage Budget", category:"Measurement & Control", apiEndpoint:"/api/controls/current-loop-budget",
 inputs:[
  {id:"supplyVoltage",label:"Available supply voltage",unit:"V",defaultValue:"24"},
  {id:"transmitterMinimum",label:"Transmitter minimum operating voltage",unit:"V",defaultValue:"12"},
  {id:"current",label:"Required loop current",unit:"mA",defaultValue:"20"},
  {id:"receiverResistance",label:"Total receiver resistance",unit:"Ω",defaultValue:"250"},
  {id:"wireResistance",label:"Total outgoing and return wire resistance",unit:"Ω",defaultValue:"100"},
  {id:"otherDrop",label:"Other series voltage drops at this current",unit:"V",defaultValue:"1"},
 ],
 results:[
  {id:"budgetStatus",label:"Voltage-budget check",unit:""},
  {id:"requiredSupply",label:"Minimum calculated supply",unit:"V",significantDigits:8},
  {id:"voltageMargin",label:"Supply voltage margin",unit:"V",significantDigits:8},
  {id:"transmitterVoltage",label:"Voltage left for transmitter at requested current",unit:"V",significantDigits:8},
  {id:"receiverDrop",label:"Receiver voltage drop",unit:"V",significantDigits:8},
  {id:"wireDrop",label:"Total wire voltage drop",unit:"V",significantDigits:8},
  {id:"resistanceHeadroom",label:"Additional series resistance headroom (negative means deficit)",unit:"Ω",significantDigits:8},
  {id:"receiverPower",label:"Receiver resistive dissipation at requested current",unit:"W",significantDigits:8},
  {id:"wirePower",label:"Wire resistive dissipation at requested current",unit:"W",significantDigits:8},
 ],calculate:currentLoopBudget,
 steps:[
  "Model one DC series loop with a two-wire loop-powered transmitter, resistive receiver and total outgoing-plus-return cable resistance. Use the lowest available supply and worst-case device data for your selected current.",
  "Convert mA to A by dividing by 1000. Receiver and cable voltage drops are I × R. Include additional series device drops separately without counting the same resistance twice.",
  "Minimum supply = transmitter minimum + receiver drop + wire drop + other drops. Voltage margin = available supply − minimum supply. Negative margin means the requested current cannot be supported under these assumptions; this tool does not predict the actual saturated current.",
  "Additional resistance headroom = voltage margin / I. A negative result is a deficit, not an allowable resistance. Receiver and cable dissipation each equal I²R; select physical ratings with the applicable derating.",
  "Original example: 24 V supply, 12 V transmitter minimum, 20 mA, 250 Ω receiver, 100 Ω total wire and 1 V other drop require 20 V and leave 4 V margin. Include both cable conductors.",
  "Check the greatest operating or alarm current you require, which may exceed 20 mA. Also check transmitter maximum voltage at low current, receiver ratings, supply tolerance/current capacity, temperature effects, isolation and grounding. A positive margin is not a complete device or hazardous-area approval.",
 ],sources:[{title:"NI: Current-loop system design and power supply selection",url:"https://www.ni.com/en/shop/data-acquisition/fundamentals--system-design--and-setup-for-the-4-to-20-ma-curren.html",accessed:"2026-09-08"}],
},

"current-loop-scale": {
 title: "4-20 mA to Engineering Value", category: "Measurement & Control", apiEndpoint: "/api/controls/current-loop-scale",
 inputs: [
  {id:"current",label:"Measured current",unit:"mA",defaultValue:"12"},
  {id:"valueAt4",label:"Engineering value at 4 mA",unit:"EU",defaultValue:"0"},
  {id:"valueAt20",label:"Engineering value at 20 mA",unit:"EU",defaultValue:"100"},
 ],
 results: [
  {id:"value",label:"Engineering value, unclamped",unit:"EU",significantDigits:8},
  {id:"current",label:"Current, unclamped",unit:"mA",significantDigits:8},
  {id:"percentSpan",label:"Position along configured signal span",unit:"%",significantDigits:8},
  {id:"rangeStatus",label:"Nominal current-range check",unit:""},
 ], calculate: currentLoopScale,
 steps: [
  "EU means your chosen engineering unit: use the same unit for both endpoint values and the engineering input/output. No unit conversion is performed. Current is in mA, not A.",
  "Configure the engineering values corresponding to exactly 4 mA and 20 mA. They must differ; decreasing scales are supported. This assumes a linear transmitter output.",
  "Forward: fraction = (current − 4)/16; value = valueAt4 + fraction × (valueAt20 − valueAt4). Inverse: fraction = (value − valueAt4)/(valueAt20 − valueAt4); current = 4 + 16 × fraction. Percent span = 100 × fraction.",
  "Example: a −50 to 150 °C linear scale gives 50 °C at 12 mA and 75% span at 16 mA. Percent span is measured from the 4 mA endpoint, not from zero engineering value.",
  "Results outside 4-20 mA are mathematical extrapolations, not valid process readings or feasible output commands. They are flagged and never clamped. Check device-specific alarms and configured limits; this is not a fault diagnosis or NAMUR compliance test.",
  "No square-root extraction, sensor linearization, calibration uncertainty, loop supply/burden check, hardware communication or safety-interlock validation is included.",
 ],
 sources: [{title:"NI: Custom Scales, linear input/output scaling",url:"https://www.ni.com/en/support/documentation/supplemental/18/ni-daqmx-custom-scales-and-usage-explained.html",accessed:"2026-09-08"}],
},
"current-loop-output": {
 title: "Engineering Value to 4-20 mA", category: "Measurement & Control", apiEndpoint: "/api/controls/current-loop-output",
 inputs: [
  {id:"value",label:"Engineering value",unit:"EU",defaultValue:"50"},
  {id:"valueAt4",label:"Engineering value at 4 mA",unit:"EU",defaultValue:"0"},
  {id:"valueAt20",label:"Engineering value at 20 mA",unit:"EU",defaultValue:"100"},
 ],
 results: [
  {id:"value",label:"Engineering value, unclamped",unit:"EU",significantDigits:8},
  {id:"current",label:"Current, unclamped",unit:"mA",significantDigits:8},
  {id:"percentSpan",label:"Position along configured signal span",unit:"%",significantDigits:8},
  {id:"rangeStatus",label:"Nominal current-range check",unit:""},
 ], calculate: currentLoopOutput,
 steps: [
  "EU means your chosen engineering unit: use the same unit for both endpoint values and the engineering input/output. No unit conversion is performed. Current is in mA, not A.",
  "Configure the engineering values corresponding to exactly 4 mA and 20 mA. They must differ; decreasing scales are supported. This assumes a linear transmitter output.",
  "Forward: fraction = (current − 4)/16; value = valueAt4 + fraction × (valueAt20 − valueAt4). Inverse: fraction = (value − valueAt4)/(valueAt20 − valueAt4); current = 4 + 16 × fraction. Percent span = 100 × fraction.",
  "Example: a −50 to 150 °C linear scale gives 50 °C at 12 mA and 75% span at 16 mA. Percent span is measured from the 4 mA endpoint, not from zero engineering value.",
  "Results outside 4-20 mA are mathematical extrapolations, not valid process readings or feasible output commands. They are flagged and never clamped. Check device-specific alarms and configured limits; this is not a fault diagnosis or NAMUR compliance test.",
  "No square-root extraction, sensor linearization, calibration uncertainty, loop supply/burden check, hardware communication or safety-interlock validation is included.",
 ],
 sources: [{title:"NI: Custom Scales, linear input/output scaling",url:"https://www.ni.com/en/support/documentation/supplemental/18/ni-daqmx-custom-scales-and-usage-explained.html",accessed:"2026-09-08"}],
},
"section-beam": {
  "title": "Beam Bending from Section Properties",
  "category": "Mechanics",
  "apiEndpoint": "/api/mechanics/section-beam",
  "inputs": [
    {
      "id": "support",
      "label": "Support and point-load location",
      "unit": "",
      "defaultValue": "0",
      "type": "select",
      "options": [
        {
          "value": "0",
          "label": "Simply supported; point load at center"
        },
        {
          "value": "1",
          "label": "Cantilever; point load at free tip"
        }
      ]
    },
    {
      "id": "span",
      "label": "Span",
      "unit": "m",
      "defaultValue": "3"
    },
    {
      "id": "secondMoment",
      "label": "Second moment about the bending axis",
      "unit": "m⁴",
      "defaultValue": "0.000027786666666666686"
    },
    {
      "id": "extremeDistance",
      "label": "Farthest fibre from neutral axis",
      "unit": "m",
      "defaultValue": "0.1"
    },
    {
      "id": "youngModulus",
      "label": "Young’s modulus",
      "unit": "Pa",
      "defaultValue": "200000000000"
    },
    {
      "id": "pointLoad",
      "label": "Downward point load",
      "unit": "N",
      "defaultValue": "1000"
    },
    {
      "id": "lineLoad",
      "label": "Downward load per length over full span",
      "unit": "N/m",
      "defaultValue": "500"
    }
  ],
  "results": [
    {
      "id": "sectionModulus",
      "label": "Elastic section modulus",
      "unit": "m³",
      "significantDigits": 7
    },
    {
      "id": "rigidity",
      "label": "Flexural rigidity EI",
      "unit": "N·m²",
      "significantDigits": 7
    },
    {
      "id": "totalLoad",
      "label": "Total downward load",
      "unit": "N",
      "significantDigits": 7
    },
    {
      "id": "leftReaction",
      "label": "Upward left reaction",
      "unit": "N",
      "significantDigits": 7
    },
    {
      "id": "rightReaction",
      "label": "Upward right reaction",
      "unit": "N",
      "significantDigits": 7
    },
    {
      "id": "fixedReactionMoment",
      "label": "Counterclockwise fixed-end reaction moment",
      "unit": "N·m",
      "significantDigits": 7
    },
    {
      "id": "maximumMoment",
      "label": "Maximum bending moment magnitude",
      "unit": "N·m",
      "significantDigits": 7
    },
    {
      "id": "maximumBendingStress",
      "label": "Maximum bending stress magnitude",
      "unit": "Pa",
      "significantDigits": 7
    },
    {
      "id": "maximumShear",
      "label": "Maximum shear force magnitude",
      "unit": "N",
      "significantDigits": 7
    },
    {
      "id": "maximumDeflection",
      "label": "Maximum downward deflection",
      "unit": "m",
      "significantDigits": 7
    },
    {
      "id": "deflectionSpanRatio",
      "label": "Deflection / span",
      "unit": "",
      "significantDigits": 7
    },
    {
      "id": "criticalLocations",
      "label": "Critical locations",
      "unit": "",
      "significantDigits": 7
    }
  ],
  "steps": [
    "Uniform homogeneous linear-elastic slender beam, constant EI, small deflection and principal-axis bending. Loads act in the bending plane without torsion. I is the area second moment about that axis, not polar or mass inertia; c is the farthest material fibre from the neutral axis.",
    "S = I/c; stress magnitude = Mmax/S. Use the larger extreme distance for an asymmetric section. The tool cannot validate a supplied I and c against a real section. Shear force is reported; no shape-independent shear stress is inferred.",
    "Simply supported: Rleft = Rright = (P + wL)/2; Mmax = PL/4 + wL²/8; δmax = PL³/(48EI) + 5wL⁴/(384EI), both at midspan.",
    "Cantilever: Rleft = P + wL, Rright = 0; reaction moment magnitude = PL + wL²/2; δmax = PL³/(3EI) + wL⁴/(8EI). Moment is largest at the root, deflection at the tip.",
    "Include self-weight in w if relevant. No shear deformation, torsion, yielding, fatigue, local/lateral buckling, connection or design-code assessment. Transferred geometry does not establish a material grade, load or safe capacity."
  ],
  "sources": [
    {
      "title": "MIT Solid Mechanics: Deflections due to Bending, standard cases",
      "url": "https://ocw.mit.edu/courses/1-050-solid-mechanics-fall-2004/f9a4d5764b9b0f51ffaacbdf69f7aed8_emech10_04.pdf#page=6",
      "accessed": "2026-09-08"
    },
    {
      "title": "MIT Solid Mechanics: Stresses, Beams in Bending",
      "url": "https://ocw.mit.edu/courses/1-050-solid-mechanics-fall-2004/8f0200f4ca3236383a2ef048c7ec4c40_emech9_04.pdf",
      "accessed": "2026-09-08"
    }
  ]
, "calculate": sectionBeam
},
"circular-section": {
  "title": "Circular Section Properties",
  "category": "Mechanics",
  "apiEndpoint": "/api/mechanics/circular-section",
  "inputs": [
    {
      "id": "outerDiameter",
      "label": "Outer diameter",
      "unit": "m",
      "defaultValue": "0.05"
    },
    {
      "id": "innerDiameter",
      "label": "Inner diameter (0 for solid)",
      "unit": "m",
      "defaultValue": "0.03"
    }
  ],
  "results": [
    {
      "id": "area",
      "label": "Material area",
      "unit": "m²",
      "significantDigits": 7
    },
    {
      "id": "centroidX",
      "label": "Centroid x from left of outer bounding box",
      "unit": "m",
      "significantDigits": 7
    },
    {
      "id": "centroidY",
      "label": "Centroid y from bottom of outer bounding box",
      "unit": "m",
      "significantDigits": 7
    },
    {
      "id": "secondMomentX",
      "label": "Second moment about horizontal centroidal x-axis",
      "unit": "m⁴",
      "significantDigits": 7
    },
    {
      "id": "secondMomentY",
      "label": "Second moment about vertical centroidal y-axis",
      "unit": "m⁴",
      "significantDigits": 7
    },
    {
      "id": "polarAreaMoment",
      "label": "Polar second moment of area Ix + Iy",
      "unit": "m⁴",
      "significantDigits": 7
    },
    {
      "id": "sectionModulusX",
      "label": "Elastic section modulus about x-axis",
      "unit": "m³",
      "significantDigits": 7
    },
    {
      "id": "sectionModulusY",
      "label": "Elastic section modulus about y-axis",
      "unit": "m³",
      "significantDigits": 7
    },
    {
      "id": "radiusOfGyrationX",
      "label": "Area radius of gyration about x-axis",
      "unit": "m",
      "significantDigits": 7
    },
    {
      "id": "radiusOfGyrationY",
      "label": "Area radius of gyration about y-axis",
      "unit": "m",
      "significantDigits": 7
    }
  ],
  "steps": [
    "Concentric circular opening; zero inner diameter selects solid. A = π(Do² − Di²)/4; Ix = Iy = π(Do⁴ − Di⁴)/64. A circle has the same centroidal second moment about every in-plane diameter.",
    "All dimensions in metres. Axes pass through the centroid: x horizontal, y vertical. Centroid coordinates are measured from the bottom-left of the outer bounding box. These are area properties, not mass moments of inertia.",
    "Sx = Ix/(outer height/2), Sy = Iy/(outer width/2); rx = √(Ix/A), ry = √(Iy/A). The section modulus has dimensions of length cubed, but is not a volume of material.",
    "Polar area moment Jp = Ix + Iy. It equals the Saint-Venant torsion constant for a circular solid/annulus, not for a rectangle. No rounded corners, eccentric void, strength rating, local buckling or design-code check is included."
  ],
  "sources": [
    {
      "title": "Engineering Statics: Moments of Inertia of Common Shapes",
      "url": "https://engineeringstatics.org/MOI-common-shapes.html",
      "accessed": "2026-09-08"
    },
    {
      "title": "Engineering Statics: Radius of Gyration",
      "url": "https://engineeringstatics.org/radius-of-gyration-sec.html",
      "accessed": "2026-09-08"
    },
    {
      "title": "MIT Engineering Beam Theory, Appendix A",
      "url": "https://ocw.mit.edu/courses/1-101-introduction-to-civil-and-environmental-engineering-design-i-fall-2005/6f99034868d8868ff7b170782cffbaca_lab2.pdf#page=11",
      "accessed": "2026-09-08"
    }
  ]
, "calculate": circularSection
},
"rectangular-section": {
  "title": "Rectangular Section Properties",
  "category": "Mechanics",
  "apiEndpoint": "/api/mechanics/rectangular-section",
  "inputs": [
    {
      "id": "width",
      "label": "Outer width",
      "unit": "m",
      "defaultValue": "0.1"
    },
    {
      "id": "height",
      "label": "Outer height",
      "unit": "m",
      "defaultValue": "0.2"
    },
    {
      "id": "innerWidth",
      "label": "Inner width (0 for solid)",
      "unit": "m",
      "defaultValue": "0.08"
    },
    {
      "id": "innerHeight",
      "label": "Inner height (0 for solid)",
      "unit": "m",
      "defaultValue": "0.18"
    }
  ],
  "results": [
    {
      "id": "area",
      "label": "Material area",
      "unit": "m²",
      "significantDigits": 7
    },
    {
      "id": "centroidX",
      "label": "Centroid x from left of outer bounding box",
      "unit": "m",
      "significantDigits": 7
    },
    {
      "id": "centroidY",
      "label": "Centroid y from bottom of outer bounding box",
      "unit": "m",
      "significantDigits": 7
    },
    {
      "id": "secondMomentX",
      "label": "Second moment about horizontal centroidal x-axis",
      "unit": "m⁴",
      "significantDigits": 7
    },
    {
      "id": "secondMomentY",
      "label": "Second moment about vertical centroidal y-axis",
      "unit": "m⁴",
      "significantDigits": 7
    },
    {
      "id": "polarAreaMoment",
      "label": "Polar second moment of area Ix + Iy",
      "unit": "m⁴",
      "significantDigits": 7
    },
    {
      "id": "sectionModulusX",
      "label": "Elastic section modulus about x-axis",
      "unit": "m³",
      "significantDigits": 7
    },
    {
      "id": "sectionModulusY",
      "label": "Elastic section modulus about y-axis",
      "unit": "m³",
      "significantDigits": 7
    },
    {
      "id": "radiusOfGyrationX",
      "label": "Area radius of gyration about x-axis",
      "unit": "m",
      "significantDigits": 7
    },
    {
      "id": "radiusOfGyrationY",
      "label": "Area radius of gyration about y-axis",
      "unit": "m",
      "significantDigits": 7
    }
  ],
  "steps": [
    "Concentric rectangular opening with sharp corners. Set both inner dimensions to zero for solid. A = bh − bi hi; Ix = (b h³ − bi hi³)/12; Iy = (h b³ − hi bi³)/12. Wall thickness may differ horizontally and vertically.",
    "All dimensions in metres. Axes pass through the centroid: x horizontal, y vertical. Centroid coordinates are measured from the bottom-left of the outer bounding box. These are area properties, not mass moments of inertia.",
    "Sx = Ix/(outer height/2), Sy = Iy/(outer width/2); rx = √(Ix/A), ry = √(Iy/A). The section modulus has dimensions of length cubed, but is not a volume of material.",
    "Polar area moment Jp = Ix + Iy. It equals the Saint-Venant torsion constant for a circular solid/annulus, not for a rectangle. No rounded corners, eccentric void, strength rating, local buckling or design-code check is included."
  ],
  "sources": [
    {
      "title": "Engineering Statics: Moments of Inertia of Common Shapes",
      "url": "https://engineeringstatics.org/MOI-common-shapes.html",
      "accessed": "2026-09-08"
    },
    {
      "title": "Engineering Statics: Radius of Gyration",
      "url": "https://engineeringstatics.org/radius-of-gyration-sec.html",
      "accessed": "2026-09-08"
    },
    {
      "title": "MIT Engineering Beam Theory, Appendix A",
      "url": "https://ocw.mit.edu/courses/1-101-introduction-to-civil-and-environmental-engineering-design-i-fall-2005/6f99034868d8868ff7b170782cffbaca_lab2.pdf#page=11",
      "accessed": "2026-09-08"
    }
  ]
, "calculate": rectangularSection
},
"normal-shock": {
  "title": "Normal Shock: Downstream State and Pressure Loss",
  "category": "Fluid Mechanics",
  "apiEndpoint": "/api/fluids/normal-shock",
  "inputs": [
    {
      "id": "absolutePressure",
      "label": "Upstream static absolute pressure",
      "unit": "Pa",
      "defaultValue": "101325"
    },
    {
      "id": "absoluteTemperature",
      "label": "Upstream static temperature",
      "unit": "K",
      "defaultValue": "288.15"
    },
    {
      "id": "specificGasConstant",
      "label": "Specific gas constant",
      "unit": "J/(kg·K)",
      "defaultValue": "287.05"
    },
    {
      "id": "heatCapacityRatio",
      "label": "Constant heat-capacity ratio γ",
      "unit": "",
      "defaultValue": "1.4"
    },
    {
      "id": "upstreamMach",
      "label": "Upstream Mach (1 = zero-strength limit)",
      "unit": "",
      "defaultValue": "2"
    }
  ],
  "results": [
    {
      "id": "upstreamSpeed",
      "label": "Upstream speed",
      "unit": "m/s",
      "significantDigits": 7
    },
    {
      "id": "downstreamMach",
      "label": "Downstream Mach",
      "unit": "",
      "significantDigits": 7
    },
    {
      "id": "pressureRatio",
      "label": "Static pressure ratio p₂/p₁",
      "unit": "",
      "significantDigits": 7
    },
    {
      "id": "densityRatio",
      "label": "Density ratio ρ₂/ρ₁",
      "unit": "",
      "significantDigits": 7
    },
    {
      "id": "temperatureRatio",
      "label": "Static temperature ratio T₂/T₁",
      "unit": "",
      "significantDigits": 7
    },
    {
      "id": "downstreamPressure",
      "label": "Downstream static absolute pressure",
      "unit": "Pa",
      "significantDigits": 7
    },
    {
      "id": "downstreamTemperature",
      "label": "Downstream static temperature",
      "unit": "K",
      "significantDigits": 7
    },
    {
      "id": "downstreamDensity",
      "label": "Downstream density",
      "unit": "kg/m³",
      "significantDigits": 7
    },
    {
      "id": "downstreamSpeed",
      "label": "Downstream speed",
      "unit": "m/s",
      "significantDigits": 7
    },
    {
      "id": "stagnationPressureRatio",
      "label": "Stagnation pressure ratio p₀₂/p₀₁",
      "unit": "",
      "significantDigits": 7
    },
    {
      "id": "upstreamStagnationPressure",
      "label": "Upstream stagnation absolute pressure",
      "unit": "Pa",
      "significantDigits": 7
    },
    {
      "id": "downstreamStagnationPressure",
      "label": "Downstream stagnation absolute pressure",
      "unit": "Pa",
      "significantDigits": 7
    },
    {
      "id": "stagnationPressureLoss",
      "label": "Stagnation pressure loss",
      "unit": "Pa",
      "significantDigits": 7
    },
    {
      "id": "stagnationTemperature",
      "label": "Conserved stagnation temperature",
      "unit": "K",
      "significantDigits": 7
    },
    {
      "id": "entropyIncrease",
      "label": "Specific entropy increase",
      "unit": "J/(kg·K)",
      "significantDigits": 7
    }
  ],
  "steps": [
    "Stationary, one-dimensional normal shock; calorically perfect ideal gas, constant R and γ. Upstream Mach must exceed 1 for a shock; exactly 1 is the zero-strength limit. Inputs use the shock-fixed frame, absolute pressure and Kelvin.",
    "With stations 1 upstream and 2 downstream: p₂/p₁ = 1 + 2γ(M₁² − 1)/(γ + 1); ρ₂/ρ₁ = (γ + 1)M₁²/[(γ − 1)M₁² + 2]; T₂/T₁ = (p₂/p₁)/(ρ₂/ρ₁).",
    "M₂² = [(γ − 1)M₁² + 2]/[2γM₁² − (γ − 1)]. Mass conservation gives V₂/V₁ = ρ₁/ρ₂. Total temperature is conserved; total pressure falls and entropy rises.",
    "p₀₂/p₀₁ = [(ρ₂/ρ₁)^γ/(p₂/p₁)]^[1/(γ − 1)]; Δs = −R ln(p₀₂/p₀₁). Extremely weak shocks may display zero loss at floating-point precision.",
    "No oblique shock, boundary-layer interaction, nozzle location, moving-shock frame conversion, heat transfer, real gas or variable heat capacity. This tool does not determine whether a shock forms. Check the constant-property assumption against the calculated temperatures."
  ],
  "sources": [
    {
      "title": "NASA Glenn: Normal Shock Wave Equations",
      "url": "https://www.grc.nasa.gov/www/k-12/airplane/normal.html",
      "accessed": "2026-09-08"
    }
  ]
, "calculate": normalShock
},
"gas-flow-state": {
  title: "Gas Speed of Sound, Mach and Stagnation State", category: "Fluid Mechanics",
  apiEndpoint: "/api/fluids/gas-flow-state",
  inputs: [
    {id:"absolutePressure",label:"Static absolute pressure",unit:"Pa",defaultValue:"101325"},
    {id:"absoluteTemperature",label:"Static absolute temperature",unit:"K",defaultValue:"288.15"},
    {id:"specificGasConstant",label:"Specific gas constant",unit:"J/(kg·K)",defaultValue:"287.05"},
    {id:"heatCapacityRatio",label:"Constant heat-capacity ratio γ = cp/cv",unit:"",defaultValue:"1.4"},
    {id:"speed",label:"Flow speed",unit:"m/s",defaultValue:"100"},
  ],
  results: [
    {id:"density",label:"Static density",unit:"kg/m³"},
    {id:"soundSpeed",label:"Local speed of sound",unit:"m/s"},
    {id:"mach",label:"Mach number",unit:"",significantDigits:7},
    {id:"specificHeat",label:"Implied constant-pressure specific heat",unit:"J/(kg·K)"},
    {id:"temperatureRatio",label:"Stagnation / static temperature",unit:"",significantDigits:8},
    {id:"pressureRatio",label:"Stagnation / static pressure",unit:"",significantDigits:8},
    {id:"densityRatio",label:"Stagnation / static density",unit:"",significantDigits:8},
    {id:"stagnationTemperature",label:"Ideal stagnation temperature",unit:"K"},
    {id:"stagnationPressure",label:"Ideal stagnation absolute pressure",unit:"Pa"},
    {id:"stagnationDensity",label:"Ideal stagnation density",unit:"kg/m³"},
    {id:"stagnationPressureRise",label:"Ideal stagnation minus static pressure",unit:"Pa",significantDigits:7},
    {id:"dynamicPressure",label:"Dynamic pressure ½ρv²",unit:"Pa",significantDigits:7},
  ], calculate: gasFlowState,
  steps: [
    "Calorically perfect ideal gas with constant specific gas constant R and γ > 1. Enter static absolute pressure and Kelvin temperature, not stagnation conditions. Defaults approximate dry air; no atmospheric or composition lookup is performed.",
    "ρ = p/(RT); a = √(γRT); M = v/a. Mach depends on the local gas state, not a universal speed factor. R is per kilogram, not the universal molar gas constant.",
    "Let F = 1 + (γ − 1)M²/2. Then T0/T = F, p0/p = F^[γ/(γ − 1)], and ρ0/ρ = F^[1/(γ − 1)]. The stagnation state represents ideal isentropic deceleration to rest.",
    "cp = γR/(γ − 1) and cp(T0 − T) = v²/2. Dynamic pressure q = ρv²/2 is generally different from p0 − p in compressible flow; they approach one another at low Mach number.",
    "No shocks, friction, heat exchange, nozzle solution, variable heat capacities, condensation, dissociation or real-gas effects. The ideal p0 is not the downstream reading of a supersonic Pitot probe across a shock. Check constant-property validity over the calculated temperature range.",
  ],
  sources: [
    {title:"NASA Glenn: Isentropic Flow Equations",url:"https://www.grc.nasa.gov/www/k-12/airplane/isentrop.html",accessed:"2026-09-08"},
    {title:"NASA Glenn: Speed of Sound",url:"https://www.grc.nasa.gov/WWW/k-12/VirtualAero/BottleRocket/airplane/sound.html",accessed:"2026-09-08"},
  ],
},

"shaft-torsion": {
  title: "Circular Shaft Torsion and Power", category: "Mechanics",
  apiEndpoint: "/api/mechanics/shaft-torsion",
  inputs: [
    {id:"outerDiameter",label:"Outer diameter",unit:"m",defaultValue:"0.05"},
    {id:"innerDiameter",label:"Inner diameter (0 for solid)",unit:"m",defaultValue:"0.03"},
    {id:"length",label:"Shaft length",unit:"m",defaultValue:"1"},
    {id:"shearModulus",label:"Shear modulus",unit:"Pa",defaultValue:"80000000000"},
    {id:"torque",label:"Signed torque",unit:"N·m",defaultValue:"500"},
    {id:"speed",label:"Signed rotational speed",unit:"rpm",defaultValue:"1500"},
  ],
  results: [
    {id:"polarMoment",label:"Polar second moment of area",unit:"m⁴",significantDigits:7},
    {id:"torsionalStiffness",label:"Torsional stiffness",unit:"N·m/rad"},
    {id:"twistRadians",label:"Signed end-to-end twist",unit:"rad"},
    {id:"twistDegrees",label:"Signed end-to-end twist",unit:"°"},
    {id:"maximumShearStress",label:"Maximum shear stress magnitude",unit:"Pa"},
    {id:"maximumShearStrain",label:"Maximum engineering shear strain",unit:"",significantDigits:7},
    {id:"angularSpeed",label:"Signed angular speed",unit:"rad/s"},
    {id:"power",label:"Signed mechanical power",unit:"W"},
    {id:"strainEnergy",label:"Stored elastic strain energy",unit:"J"},
  ], calculate: shaftTorsion,
  steps: [
    "Uniform circular shaft with concentric bore, homogeneous isotropic material, constant torque and linear elastic small-strain response. Enter diameters, not radii. Inner diameter zero selects a solid shaft.",
    "J = π(Do⁴ − Di⁴)/32; τmax = |T|Do/(2J). J is a second moment of area, not a mass moment of inertia.",
    "Twist θ = TL/(GJ), stiffness = GJ/L, γmax = τmax/G, elastic energy = Tθ/2. θ is relative end rotation, not the total rotation of the running shaft.",
    "Angular speed ω = 2πn/60 and mechanical power P = Tω. Use the same positive axis for torque and speed. Opposite signs give negative power; reversing torque reverses twist but preserves stress magnitude and elastic energy.",
    "Does not assess keyways, stress concentrations, yielding, combined bending, fatigue, buckling, critical speed, bearings or losses. A noncircular section cannot use this J as its torsion constant. No safe torque or equipment rating is inferred.",
  ],
  sources: [{title:"MIT OpenCourseWare, David Roylance: Shear and Torsion, equations 8 and 12-14 and strain energy",url:"https://ocw.mit.edu/courses/3-11-mechanics-of-materials-fall-1999/0e0845a9e3abe430080eaffb0c5015ba_MIT3_11F99_torsion.pdf",accessed:"2026-09-08"}],
},

"ac-power": {
  title: "AC Power: Single and Balanced Three Phase", category: "Electrical",
  apiEndpoint: "/api/electrical/ac-power",
  inputs: [
    {id: "phases", label: "Supply configuration", unit: "", defaultValue: "3", type: "select", options: [{value:"1",label:"Single phase"},{value:"3",label:"Balanced three phase"}]},
    {id: "voltage", label: "RMS voltage (line-to-line for three phase)", unit: "V", defaultValue: "400"},
    {id: "current", label: "RMS current (line current for three phase)", unit: "A", defaultValue: "10"},
    {id: "powerFactor", label: "Displacement power factor", unit: "", defaultValue: "0.8"},
    {id: "reactiveDirection", label: "Load behavior", unit: "", defaultValue: "0", type: "select", options: [{value:"0",label:"Lagging, inductive load"},{value:"1",label:"Leading, capacitive load"}]},
  ],
  results: [
    {id:"activePower",label:"Total active power",unit:"W"},
    {id:"reactivePower",label:"Total reactive power, positive inductive",unit:"var"},
    {id:"apparentPower",label:"Total apparent power",unit:"VA"},
    {id:"phaseAngle",label:"Specified phase angle, positive lagging",unit:"°"},
    {id:"activePerPhase",label:"Active power per phase",unit:"W"},
  ], calculate: acPower,
  steps: [
    "Sinusoidal steady-state AC power for a passive single-phase load or a balanced three-phase load. Enter RMS values and displacement power factor from 0 to 1.",
    "Single phase: S = VI. Balanced three phase: S = √3 VL IL, where VL is line-to-line RMS voltage and IL is line RMS current. The latter applies to balanced wye or delta loads without substituting phase values for line values.",
    "P = S cosφ = S PF. Q = ±S√(1 − PF²); positive for lagging inductive current and negative for leading capacitive current. Specified angle φ = ±acos(PF) is the per-phase impedance angle, not the angle between a line-to-line voltage and line current. At zero current, all powers are zero; the angle only reflects the specified input.",
    "P is in watts, Q in var and S in volt-amperes. For balanced three phase, active power per phase is P/3. Unity power factor gives Q = 0.",
    "Does not model harmonic distortion, unbalanced phases, exported active power, transients or motor efficiency. Displacement power factor need not equal true power factor for distorted waveforms. Results are not conductor ampacity, protection or equipment-rating selections.",
  ],
  sources: [{title:"US DOE Electrical Science Volume 3, ES-09: power triangle and balanced three-phase loads",url:"https://www.energy.gov/sites/default/files/2026-04/DOE-HDBK-1011-92_VOL3.pdf",accessed:"2026-09-08"}],
},
"series-rlc": {
  title: "Series RLC Circuit and Resonance", category: "Electrical",
  apiEndpoint: "/api/electrical/series-rlc",
  inputs: [
    {id:"voltage",label:"Source RMS voltage",unit:"V",defaultValue:"120"},
    {id:"frequency",label:"Source frequency",unit:"Hz",defaultValue:"60"},
    {id:"resistance",label:"Total series resistance",unit:"Ω",defaultValue:"30"},
    {id:"inductance",label:"Series inductance (0 omits inductor)",unit:"H",defaultValue:"0.1"},
    {id:"capacitance",label:"Series capacitance (0 bypasses capacitor)",unit:"F",defaultValue:"0.0001"},
  ],
  results: [
    {id:"current",label:"Series RMS current",unit:"A"},
    {id:"impedance",label:"Impedance magnitude",unit:"Ω"},
    {id:"reactance",label:"Net reactance, positive inductive",unit:"Ω"},
    {id:"inductiveReactance",label:"Inductive reactance",unit:"Ω"},
    {id:"capacitiveReactance",label:"Capacitive reactance magnitude",unit:"Ω"},
    {id:"phaseAngle",label:"Voltage phase relative to current",unit:"°"},
    {id:"powerFactor",label:"Displacement power factor",unit:""},
    {id:"activePower",label:"Active power in resistance",unit:"W"},
    {id:"reactivePower",label:"Net reactive power",unit:"var"},
    {id:"apparentPower",label:"Apparent power",unit:"VA"},
    {id:"resistorVoltage",label:"Resistor RMS voltage",unit:"V"},
    {id:"inductorVoltage",label:"Inductor RMS voltage",unit:"V"},
    {id:"capacitorVoltage",label:"Capacitor RMS voltage",unit:"V"},
    {id:"resonanceFrequency",label:"Ideal LC resonance frequency",unit:"Hz"},
  ], calculate: seriesRlc,
  steps: [
    "Sinusoidal steady-state series RLC circuit with ideal linear components and positive total series resistance. Enter RMS source voltage, frequency in Hz, inductance in henries and capacitance in farads.",
    "ω = 2πf; XL = ωL; XC = 1/(ωC); X = XL − XC. The special input C = 0 bypasses the capacitor (XC = 0); it does not represent a physical zero-capacitance component. L = 0 omits the inductor.",
    "Z = R + jX, |Z| = √(R² + X²), I = V/|Z|, φ = atan2(X,R), PF = R/|Z|. Positive φ means inductive impedance and lagging current; negative φ means capacitive impedance and leading current.",
    "P = I²R; Q = I²X; S = VI. Component RMS voltages are IR, IXL and IXC. They add as phasors: V² = VR² + (VL − VC)², not as scalar magnitudes.",
    "With both L and C present, f0 = 1/(2π√(LC)). At resonance the net reactance vanishes, but the individual L/C voltages can exceed the source voltage. Finite positive resistance is required; the ideal zero-resistance resonance singularity is excluded.",
    "No switching transient, parasitics beyond the supplied series resistance, saturation, frequency-dependent losses, nonlinear load, harmonics or thermal rating calculation. Component and source ratings require a separate assessment.",
  ],
  sources: [{title:"MIT OpenCourseWare Physics II: AC Circuits, series RLC and average power, sections 12.3-12.4",url:"https://ocw.mit.edu/courses/8-02-physics-ii-electricity-and-magnetism-spring-2007/e7fd966c84001f4e8fc0f58a6751013e_cha12ac_circuits.pdf",accessed:"2026-09-08"}],
},

"water-properties": {
  title: "Liquid Water Properties by Temperature and Pressure",
  category: "Hydraulics",
  apiEndpoint: "/api/fluids/water-properties",
  inputs: [
    {id: "temperature", label: "Water temperature (0.01-110 °C)", unit: "°C", defaultValue: "20"},
    {id: "pressure", label: "Absolute pressure (maximum 300000 Pa)", unit: "Pa", defaultValue: "100000"},
  ],
  results: [
    {id: "density", label: "Density", unit: "kg/m³", significantDigits: 7},
    {id: "viscosity", label: "Dynamic viscosity", unit: "Pa·s", significantDigits: 6},
    {id: "kinematicViscosity", label: "Kinematic viscosity", unit: "m²/s", significantDigits: 6},
    {id: "specificHeat", label: "Specific heat at constant pressure", unit: "J/(kg·K)", significantDigits: 6},
    {id: "conductivity", label: "Thermal conductivity", unit: "W/(m·K)", significantDigits: 6},
    {id: "thermalDiffusivity", label: "Thermal diffusivity", unit: "m²/s", significantDigits: 6},
    {id: "prandtlNumber", label: "Prandtl number", unit: "", significantDigits: 6},
    {id: "thermalExpansion", label: "Volumetric thermal expansion coefficient", unit: "1/K", significantDigits: 6},
    {id: "compressibility", label: "Isothermal compressibility", unit: "1/Pa", significantDigits: 6},
    {id: "soundSpeed", label: "Speed of sound", unit: "m/s", significantDigits: 6},
    {id: "vaporPressure", label: "Saturation vapor pressure", unit: "Pa", significantDigits: 6},
    {id: "specificVolume", label: "Specific volume", unit: "m³/kg", significantDigits: 7},
  ],
  calculate: waterProperties,
  steps: [
    "Pure liquid water properties from temperature and absolute pressure, using IAPWS SR6-08(2011) and SR1-86(1992). Supported range: 0.01-110 °C, pressure at or above saturation and no greater than 0.3 MPa (300000 Pa).",
    "Calculate the 0.1 MPa reference specific volume and derivatives from SR6 equations 2-3, heat capacity from Table 2, then apply the limited-pressure corrections in Table 4. Density is the reciprocal of specific volume. Table 3 gives expansivity, compressibility and sound speed.",
    "Dynamic viscosity and thermal conductivity use SR6 equations 7-8; section 6 permits these temperature correlations throughout the supported pressure range. Kinematic viscosity = μ/ρ, thermal diffusivity = k/(ρ cp), and Prandtl number = μ cp/k.",
    "Saturation pressure uses SR1 equation 1. Below-saturation pressure, freezing-range temperatures and pressures above 0.3 MPa are rejected. At saturation, outputs describe the liquid branch, not a liquid-vapor mixture.",
    "SR6 reports stable-region uncertainties of about 0.0001% for density, 0.1% for heat capacity, 0.005% for sound speed, 1% for viscosity and 1.5% for conductivity. Extra displayed digits aid reproducibility; they do not imply matching measurement accuracy.",
    "Ordinary pure water only. Salinity, glycol, dissolved additives, steam, ice, supercooled liquid and high-pressure service require other property models. This implementation is independently verified against release tables, not certified by IAPWS.",
  ],
  sources: [
    {title: "IAPWS SR6-08(2011): Properties of Liquid Water, coefficients, pressure corrections and verification Table 8", url: "https://iapws.org/technical-guidance/release/LiquidWater.download", accessed: "2026-09-08"},
    {title: "IAPWS SR1-86(1992): Saturation Properties, vapor pressure equation 1", url: "https://iapws.org/public/documents/6dGkr/Supp-sat.pdf", accessed: "2026-09-08"},
  ],
},
"water-pipe-loss": {
  title: "Water Pipe Pressure Loss with Temperature",
  category: "Hydraulics",
  apiEndpoint: "/api/hydraulics/water-pipe-loss",
  inputs: [
    {id: "temperature", label: "Water temperature (0.01-110 °C)", unit: "°C", defaultValue: "20"},
    {id: "inletPressure", label: "Absolute inlet pressure (maximum 300000 Pa)", unit: "Pa", defaultValue: "200000"},
    {id: "flowRate", label: "Volume flow rate", unit: "m³/s", defaultValue: "0.001"},
    {id: "length", label: "Straight horizontal pipe length", unit: "m", defaultValue: "20"},
    {id: "diameter", label: "Actual internal diameter", unit: "m", defaultValue: "0.025"},
    {id: "roughness", label: "Absolute pipe roughness", unit: "m", defaultValue: "0.000015"},
  ],
  results: [
    {id: "pressureDrop", label: "Friction pressure loss", unit: "Pa"},
    {id: "headLoss", label: "Friction head loss", unit: "m"},
    {id: "outletPressure", label: "Estimated absolute outlet pressure", unit: "Pa"},
    {id: "velocity", label: "Mean velocity", unit: "m/s"},
    {id: "reynoldsNumber", label: "Reynolds number", unit: ""},
    {id: "frictionFactor", label: "Darcy friction factor", unit: ""},
    {id: "density", label: "Calculated inlet water density", unit: "kg/m³", significantDigits: 7},
    {id: "viscosity", label: "Calculated water dynamic viscosity", unit: "Pa·s", significantDigits: 6},
    {id: "vaporPressure", label: "Water saturation pressure", unit: "Pa", significantDigits: 6},
    {id: "flowRegime", label: "Flow regime", unit: ""},
  ],
  calculate: waterPipeLoss,
  steps: [
    "Calculate pure-water density and viscosity from temperature and inlet pressure, then estimate straight horizontal pipe friction. Liquid-water range: 0.01-110 °C and saturation pressure through 300000 Pa absolute.",
    "IAPWS SR6-08(2011) supplies temperature-dependent water properties with limited-pressure corrections. Properties are held at their inlet values along this constant-diameter, isothermal pipe.",
    "Velocity = 4Q/(πD²), Re = ρvD/μ. Darcy f = 64/Re below Re 2300, otherwise the Swamee-Jain approximation. The transitional range 2300-4000 is flagged as uncertain; EPANET transitional interpolation is not implemented. Q = 0 gives zero loss.",
    "ΔP = f(L/D)ρv²/2; head loss = ΔP/(ρg), g = 9.80665 m/s². Outlet pressure = inlet pressure − ΔP. Reject a predicted outlet pressure below saturation rather than applying a single-phase result there.",
    "No fittings, valves, elevation change, pump, developing-flow correction, water hammer or heat transfer. Use actual internal diameter and a documented roughness; defaults are illustrative. A passing saturation check is not a cavitation assessment of other system components.",
  ],
  sources: [
    {title: "IAPWS SR6-08(2011): Liquid water density and viscosity with pressure corrections", url: "https://iapws.org/technical-guidance/release/LiquidWater.download", accessed: "2026-09-08"},
    {title: "IAPWS SR1-86(1992): Saturation vapor pressure", url: "https://iapws.org/public/documents/6dGkr/Supp-sat.pdf", accessed: "2026-09-08"},
    {title: "US EPA: EPANET 2.2 User Manual, Darcy-Weisbach and friction-factor methods", url: "https://usepa.github.io/EPANET2.2/3_network_model.html", accessed: "2026-09-08"},
  ],
},

"liquid-valve": {
  title: "Liquid Control Valve Kv and Choking",
  category: "Valves",
  apiEndpoint: "/api/valves/liquid-sizing",
  inputs: [
    {id: "flowRate", label: "Required upstream liquid flow", unit: "m³/s", defaultValue: "0.005"},
    {id: "density", label: "Liquid density at inlet conditions", unit: "kg/m³", defaultValue: "1000"},
    {id: "inletPressure", label: "Absolute inlet pressure", unit: "Pa", defaultValue: "300000"},
    {id: "outletPressure", label: "Absolute outlet pressure", unit: "Pa", defaultValue: "250000"},
    {id: "vaporPressure", label: "Absolute vapor pressure at inlet temperature", unit: "Pa", defaultValue: "3000"},
    {id: "criticalPressure", label: "Fluid absolute critical pressure", unit: "Pa", defaultValue: "22064000"},
    {id: "recoveryFactor", label: "Manufacturer pressure recovery factor, FL", unit: "", defaultValue: "0.9"},
  ],
  results: [
    {id: "kv", label: "Required Kv using limiting pressure drop", unit: "m³/h"},
    {id: "uncorrectedKv", label: "Kv ignoring choking, for comparison only", unit: "m³/h"},
    {id: "pressureDrop", label: "Actual pressure drop", unit: "Pa"},
    {id: "chokedPressureDrop", label: "Calculated choking pressure drop", unit: "Pa"},
    {id: "effectivePressureDrop", label: "Pressure drop used for sizing", unit: "Pa"},
    {id: "criticalRatio", label: "Liquid critical pressure ratio factor, FF", unit: ""},
    {id: "regime", label: "Choking assessment", unit: ""},
    {id: "phaseAssessment", label: "Outlet phase screening", unit: ""},
  ],
  calculate: liquidValve,
  steps: [
    "For turbulent liquid flow with no attached fittings correction: ΔP = P1 − P2; FF = 0.96 − 0.28√(Pv/Pc); ΔPchoked = FL²(P1 − FF Pv). All pressures must be absolute and use the same units.",
    "Use ΔPeffective = min(ΔP, ΔPchoked). Convert Q from m³/s to m³/h and ΔPeffective from Pa to bar. Kv = Q(m³/h)√[(ρ/1000)/(ΔPeffective in bar)]. Kv is a flow coefficient referenced to water and 1 bar, not the actual service flow.",
    "Assumes turbulent service, liquid at the inlet and piping geometry factor FP = 1. No Reynolds/viscosity correction, attached reducers, staged trim, gas, steam or inlet two-phase sizing is implemented.",
    "FL must match manufacturer data for the candidate valve, trim and travel. Defaults are teaching assumptions, not a selected valve or verified fluid-property state. Repeat at minimum, normal and maximum operating cases.",
    "Below the choking limit does not establish cavitation-free operation. Outlet pressure below vapor pressure indicates flashing; damage and noise are not predicted. Assess pressure recovery, materials and service limits with manufacturer data.",
    "Kv alone does not determine nominal valve size, opening, rangeability, actuator capability or control stability. The comparison ignoring choking must not replace the limiting-pressure result.",
  ],
  sources: [
    {title: "Bürkert: Fluid Calculator, liquid Kv equation", url: "https://www.burkert.com/en/service-support/knowledge-center/glossary/fluid-calculator", accessed: "2026-09-08"},
    {title: "Emerson: Understanding Choked Flow in Fisher Valves, D104173X012, September 2017", url: "https://www.emerson.com/is/content/emerson/en/final-control/flow-controls/documents/d104173x012.pdf", accessed: "2026-09-08"},
    {title: "Emerson: Control Valve Sourcebook, liquid sizing and limiting pressure drop", url: "https://www.emerson.com/is/content/emerson/en/final-control/flow-controls/documents/d103540x012.pdf", accessed: "2026-09-08"},
  ],
},

"insulated-pipe": {
  title: "Pipe Heat Transfer and Insulation",
  category: "Thermal",
  apiEndpoint: "/api/thermal/insulated-pipe",
  inputs: [
    {id: "length", label: "Pipe length", unit: "m", defaultValue: "10"},
    {id: "innerDiameter", label: "Actual pipe inner diameter", unit: "m", defaultValue: "0.020"},
    {id: "pipeOuterDiameter", label: "Actual pipe outer diameter", unit: "m", defaultValue: "0.022"},
    {id: "pipeConductivity", label: "Pipe thermal conductivity", unit: "W/(m·K)", defaultValue: "380"},
    {id: "insulationThickness", label: "Radial insulation thickness (0 for bare pipe)", unit: "m", defaultValue: "0.020"},
    {id: "insulationConductivity", label: "Insulation thermal conductivity", unit: "W/(m·K)", defaultValue: "0.040"},
    {id: "innerFilm", label: "Inside convection coefficient", unit: "W/(m²·K)", defaultValue: "1000"},
    {id: "outerFilm", label: "Outside convection coefficient", unit: "W/(m²·K)", defaultValue: "10"},
    {id: "fluidTemperature", label: "Bulk fluid temperature", unit: "K", defaultValue: "333.15"},
    {id: "ambientTemperature", label: "Ambient fluid temperature", unit: "K", defaultValue: "293.15"},
  ],
  results: [
    {id: "heatRate", label: "Heat transfer, positive outward", unit: "W"},
    {id: "heatPerLength", label: "Heat transfer per length", unit: "W/m"},
    {id: "thermalResistance", label: "Total thermal resistance", unit: "K/W"},
    {id: "innerSurface", label: "Pipe inner surface temperature", unit: "K"},
    {id: "pipeOuterSurface", label: "Pipe outer surface temperature", unit: "K"},
    {id: "outerSurface", label: "Exposed surface temperature", unit: "K"},
    {id: "bareHeatRate", label: "Bare pipe heat transfer, same film coefficients", unit: "W"},
    {id: "magnitudeReduction", label: "Reduction in heat-transfer magnitude vs bare pipe", unit: "W"},
    {id: "outerDiameter", label: "Diameter including insulation", unit: "m"},
  ],
  calculate: insulatedPipe,
  steps: [
    "Steady one-dimensional radial heat flow, constant properties and bulk temperatures along the length; perfect layer contact, no internal heat generation. Actual diameters are required, not nominal pipe sizes.",
    "For length L: inner-film resistance = 1/(hi π Di L); pipe resistance = ln(Do/Di)/(2π kp L); insulation resistance = ln((Do + 2t)/Do)/(2π ki L); outer-film resistance = 1/(ho π (Do + 2t) L).",
    "Add the four resistances. Q = (Tfluid − Tambient)/Rtotal; heat per length = Q/L. Each surface temperature follows from the preceding temperature minus Q times that layer resistance. Negative Q means heat enters the pipe.",
    "Bare comparison removes insulation and uses the bare outer surface area with the same film coefficients. Magnitude reduction = |Qbare| − |Q|; a negative result means increased heat transfer. Added insulation need not reduce heat transfer for every radius and fixed coefficient.",
    "Defaults are a constructed teaching case, not certified copper or insulation properties. Supply conductivities at the relevant temperatures and convection coefficients for the actual flow conditions. The comparison assumes these coefficients remain unchanged.",
    "Radiation, axial fluid cooling, fittings/supports, thermal bridges, fouling/contact resistance, moisture, condensation and transient effects are excluded. This is not an insulation product selection, minimum thickness requirement or economic optimum.",
  ],
  sources: [{title: "US DOE Fundamentals Handbook, Heat Transfer: cylindrical conduction pp. 11-17 and combined convection pp. 20-23", url: "https://www.energy.gov/sites/default/files/2026-04/DOE-HDBK-1012-92_VOL2.pdf", accessed: "2026-09-08"}],
},

"rectangular-beam": {
  "title": "Rectangular Beam Stress and Deflection",
  "category": "Mechanics",
  "apiEndpoint": "/api/mechanics/rectangular-beam",
  "inputs": [
    {
      "id": "support",
      "label": "Support and point-load location",
      "unit": "",
      "defaultValue": "0",
      "type": "select",
      "options": [
        {
          "value": "0",
          "label": "Simply supported; point load at center"
        },
        {
          "value": "1",
          "label": "Cantilever; point load at free tip"
        }
      ]
    },
    {
      "id": "span",
      "label": "Span from left support to right end",
      "unit": "m",
      "defaultValue": "3"
    },
    {
      "id": "width",
      "label": "Rectangle width, parallel to neutral axis",
      "unit": "m",
      "defaultValue": "0.1"
    },
    {
      "id": "depth",
      "label": "Rectangle depth, in bending direction",
      "unit": "m",
      "defaultValue": "0.2"
    },
    {
      "id": "youngModulus",
      "label": "Young’s modulus",
      "unit": "Pa",
      "defaultValue": "200000000000"
    },
    {
      "id": "pointLoad",
      "label": "Downward concentrated load",
      "unit": "N",
      "defaultValue": "1000"
    },
    {
      "id": "lineLoad",
      "label": "Downward load per length over full span",
      "unit": "N/m",
      "defaultValue": "500"
    }
  ],
  "results": [
    {
      "id": "area",
      "label": "Section area",
      "unit": "m²"
    },
    {
      "id": "secondMoment",
      "label": "Second moment of area about bending axis",
      "unit": "m⁴"
    },
    {
      "id": "sectionModulus",
      "label": "Elastic section modulus",
      "unit": "m³"
    },
    {
      "id": "rigidity",
      "label": "Flexural rigidity EI",
      "unit": "N·m²"
    },
    {
      "id": "totalLoad",
      "label": "Total downward load",
      "unit": "N"
    },
    {
      "id": "leftReaction",
      "label": "Left support reaction, upward",
      "unit": "N"
    },
    {
      "id": "rightReaction",
      "label": "Right support reaction, upward",
      "unit": "N"
    },
    {
      "id": "fixedReactionMoment",
      "label": "Fixed-end external reaction, counterclockwise",
      "unit": "N·m"
    },
    {
      "id": "maximumMoment",
      "label": "Maximum bending moment magnitude",
      "unit": "N·m"
    },
    {
      "id": "maximumBendingStress",
      "label": "Maximum elastic bending stress magnitude",
      "unit": "Pa"
    },
    {
      "id": "maximumShear",
      "label": "Maximum shear force magnitude",
      "unit": "N"
    },
    {
      "id": "maximumShearStress",
      "label": "Maximum rectangular-section shear stress",
      "unit": "Pa"
    },
    {
      "id": "maximumDeflection",
      "label": "Maximum downward bending deflection",
      "unit": "m"
    },
    {
      "id": "deflectionSpanRatio",
      "label": "Deflection / span",
      "unit": "1"
    },
    {
      "id": "criticalLocations",
      "label": "Critical locations",
      "unit": ""
    }
  ],
  "sources": [
    {
      "title": "MIT Solid Mechanics: beam displacement formulas, page 2",
      "url": "https://ocw.mit.edu/courses/1-050-solid-mechanics-fall-2004/fd4eff39aec922b8c07660006f40686e_pset04_11.pdf",
      "accessed": "2026-09-08"
    },
    {
      "title": "MIT Mechanics of Materials: stresses in beams",
      "url": "https://web.mit.edu/course/3/3.11/www/modules/bstress.pdf",
      "accessed": "2026-09-08"
    }
  ],
  "steps": [
    "Analyze a solid rectangular beam under a downward point load plus a uniform full-span load. Choose simple supports with a central point load, or a left-fixed cantilever with a tip load.",
    "Dimensions define the bending axis: I = bd³/12, S = bd²/6, A = bd. Depth is the dimension in the direction of transverse deflection.",
    "For simple supports: each reaction = (P + qL)/2; Mmax = PL/4 + qL²/8; δmax = PL³/(48EI) + 5qL⁴/(384EI).",
    "For a cantilever: upward reaction = P + qL; external reaction moment = PL + qL²/2; δmax = PL³/(3EI) + qL⁴/(8EI).",
    "Bending stress magnitude = Mmax/S; maximum rectangular-section shear stress = 1.5Vmax/A. These maxima occur at different section locations and are not a combined failure criterion.",
    "Assumes a straight, prismatic, homogeneous beam with linear elasticity, small deflections and ideal supports. Deflection includes bending only; shear deformation, torsion, axial force and support settlement are excluded.",
    "Enter total service loads, including self-weight in the uniform load if needed. Both loads are downward and may be zero. No material strength, buckling, fatigue, connection, deflection-limit or building-code check is performed.",
    "With the illustrative defaults: each support carries 1250 N, maximum moment is 1312.5 N·m, and maximum deflection is 0.0000817383 m. The modulus is an example, not a verified material selection."
  ],
  "calculate": rectangularBeam
},
"humid-air": {
  "title": "Humid Air Properties",
  "category": "HVAC",
  "apiEndpoint": "/api/hvac/humid-air",
  "inputs": [
    {
      "id": "dryBulb",
      "label": "Dry-bulb temperature",
      "unit": "°C",
      "defaultValue": "25"
    },
    {
      "id": "relativeHumidity",
      "label": "Relative humidity",
      "unit": "%",
      "defaultValue": "50"
    },
    {
      "id": "pressure",
      "label": "Total absolute pressure",
      "unit": "Pa",
      "defaultValue": "101325"
    }
  ],
  "results": [
    {
      "id": "humidityRatio",
      "label": "Humidity ratio",
      "unit": "kg water/kg dry air"
    },
    {
      "id": "specificHumidity",
      "label": "Specific humidity",
      "unit": "kg water/kg moist air"
    },
    {
      "id": "dewFrostPoint",
      "label": "Dew point over water / frost point over ice",
      "unit": "°C"
    },
    {
      "id": "enthalpy",
      "label": "Enthalpy per mass of dry air",
      "unit": "J/kg dry air"
    },
    {
      "id": "specificVolume",
      "label": "Volume per mass of dry air",
      "unit": "m³/kg dry air"
    },
    {
      "id": "density",
      "label": "Total moist-air density",
      "unit": "kg/m³"
    },
    {
      "id": "vaporPressure",
      "label": "Water-vapor partial pressure",
      "unit": "Pa"
    },
    {
      "id": "saturationVaporPressure",
      "label": "Saturation vapor pressure",
      "unit": "Pa"
    },
    {
      "id": "saturationBasis",
      "label": "Relative humidity reference phase",
      "unit": ""
    }
  ],
  "sources": [
    {
      "title": "PsychroLib: ASHRAE-based psychrometric equations and documentation",
      "url": "https://psychrometrics.github.io/psychrolib/api_docs.html",
      "accessed": "2026-09-08"
    },
    {
      "title": "PsychroLib MIT license and adaptation attribution",
      "url": "/licenses/psychrolib.txt",
      "accessed": "2026-09-08"
    }
  ],
  "steps": [
    "Calculate humidity ratio, dew/frost point, enthalpy, specific volume and moist-air density from temperature, relative humidity and absolute pressure.",
    "Supported inputs: −50 to 80 °C, 0-100% RH and 20-120 kPa absolute. Total pressure must exceed saturation vapor pressure at the dry-bulb temperature.",
    "ASHRAE saturation equations use ice at or below 0.01 °C and liquid water above it. RH is relative to that phase; subfreezing RH reported relative to liquid water must be converted before use.",
    "Water-vapor pressure is RH/100 times saturation pressure. W = 0.621945 pv/(p − pv); specific humidity = W/(1 + W).",
    "Enthalpy h = 1000[1.006T + W(2501 + 1.86T)] J/kg dry air, with T in °C and the conventional dry-air/liquid-water zero at 0 °C. It is not enthalpy per kg of moist air.",
    "v = 287.042(T + 273.15)(1 + 1.607858W)/p; total density = (1 + W)/v. Assumes ideal moist air with no liquid droplets or real-gas corrections.",
    "Dew/frost point inverts the saturation equation. Dry air has no finite dew point; results below −100 °C are reported outside the model range. These labels are returned as strings in the API.",
    "Adapted coefficients from MIT-licensed PsychroLib; the numerical inversion, exact zero-humidity behavior and restricted operating domain differ from that library."
  ],
  "calculate": humidAir
},
"air-temperature-process": {
  title: "Air Heating, Cooling and Condensate", category: "HVAC", apiEndpoint: "/api/hvac/air-temperature-process",
  inputs: [
    {id:"dryAirFlow",label:"Dry-air mass flow",unit:"kg dry air/s",defaultValue:"1"},
    {id:"inletTemperature",label:"Inlet dry-bulb temperature",unit:"°C",defaultValue:"30"},
    {id:"inletRelativeHumidity",label:"Inlet relative humidity",unit:"%",defaultValue:"50"},
    {id:"outletTemperature",label:"Target outlet temperature (0-80 °C)",unit:"°C",defaultValue:"10"},
    {id:"pressure",label:"Common absolute pressure",unit:"Pa",defaultValue:"101325"},
  ],
  results: [
    {id:"heatRemoved",label:"Heat removed, negative for heat added",unit:"W"},
    {id:"airEnthalpyReduction",label:"Air-stream enthalpy reduction",unit:"W"},
    {id:"condensateEnthalpyFlow",label:"Energy leaving in drained water",unit:"W"},
    {id:"condensateFlow",label:"Condensate mass flow",unit:"kg/s",significantDigits:6},
    {id:"condensateHourly",label:"Hourly condensate mass",unit:"kg/h"},
    {id:"inletHumidityRatio",label:"Inlet humidity ratio",unit:"kg water/kg dry air",significantDigits:6},
    {id:"outletHumidityRatio",label:"Outlet humidity ratio",unit:"kg water/kg dry air",significantDigits:6},
    {id:"outletRelativeHumidity",label:"Outlet relative humidity",unit:"%"},
    {id:"inletEnthalpy",label:"Inlet enthalpy",unit:"J/kg dry air"},
    {id:"outletEnthalpy",label:"Outlet enthalpy",unit:"J/kg dry air"},
    {id:"inletVolumeFlow",label:"Inlet volume flow",unit:"m³/s"},
    {id:"outletVolumeFlow",label:"Outlet volume flow",unit:"m³/s"},
    {id:"process",label:"Ideal process",unit:""},
  ],
  calculate: airTemperatureProcess,
  steps: [
    "Uniformly heat or cool an ideal moist-air stream at constant pressure to a specified outlet temperature. If cooling reaches saturation, remove liquid water and return saturated outlet air. No bypass or added moisture is modeled.",
    "Dry-air mass flow must be positive. Inlet: −50 to 80 °C and 0-100% RH. Outlet: 0-80 °C, excluding ice/frost processing. Pressure: 20-120 kPa absolute and above saturation pressure at both temperatures.",
    "Wout = min(Win, Wsat(Tout)). Without condensation, W is unchanged and RH changes with temperature. With condensation, outlet RH is 100%. Condensate flow = mda(Win − Wout).",
    "Heat removed = mda(hin − hout) − mcond hw,out. Here h is in J/kg dry air, and liquid-water enthalpy is approximated as hw,out = 4186 Tout J/kg relative to liquid water at 0 °C. Condensate leaves at outlet temperature.",
    "Positive heatRemoved means cooling; negative means heating. It is thermal transfer, not electrical input, compressor power or a selected equipment capacity. No arbitrary sensible/latent split is imposed.",
    "Convert measured inlet volume flow to dry-air mass flow with mda = Qin/vin using the inlet specific volume. Moist-air mass flow is a different basis. The output shows both inlet and outlet volume flows.",
    "No coil bypass factor, apparatus dew point, fan heat, heat leakage, pressure drop, frost, re-evaporation, humidity control or real-gas correction. A real coil can produce an unsaturated outlet; this ideal saturation model does not predict its detailed performance.",
  ],
  sources: [
    {title:"ASHRAE Fundamentals 2025, Chapter 1: sensible heating/cooling and cooling with dehumidification",url:"https://handbook.ashrae.org/Handbooks/F25/SI/F25_Ch01/F25_Ch01_si.aspx",accessed:"2026-09-08"},
    {title:"PsychroLib moist-air enthalpy, saturation and volume relationships",url:"https://psychrometrics.github.io/psychrolib/api_docs.html",accessed:"2026-09-08"},
    {title:"PsychroLib MIT license and adaptation attribution",url:"/licenses/psychrolib.txt",accessed:"2026-09-08"},
  ],
},
"air-mixing": {
  title: "Adiabatic Mixing of Two Humid Airstreams", category: "HVAC", apiEndpoint: "/api/hvac/air-mixing",
  inputs: [
    {id:"dryAirFlow1",label:"Stream 1 dry-air mass flow",unit:"kg dry air/s",defaultValue:"1"},
    {id:"dryBulb1",label:"Stream 1 dry-bulb temperature",unit:"°C",defaultValue:"10"},
    {id:"relativeHumidity1",label:"Stream 1 relative humidity",unit:"%",defaultValue:"60"},
    {id:"dryAirFlow2",label:"Stream 2 dry-air mass flow",unit:"kg dry air/s",defaultValue:"3"},
    {id:"dryBulb2",label:"Stream 2 dry-bulb temperature",unit:"°C",defaultValue:"25"},
    {id:"relativeHumidity2",label:"Stream 2 relative humidity",unit:"%",defaultValue:"50"},
    {id:"pressure",label:"Common absolute pressure",unit:"Pa",defaultValue:"101325"},
  ],
  results: [
    {id:"dryBulb",label:"Mixed dry-bulb temperature",unit:"°C"},
    {id:"relativeHumidity",label:"Mixed relative humidity",unit:"%"},
    {id:"totalDryAirFlow",label:"Total dry-air mass flow",unit:"kg dry air/s"},
    {id:"stream1DryAirFraction",label:"Stream 1 dry-air mass fraction",unit:""},
    {id:"moistAirFlow",label:"Total moist-air mass flow",unit:"kg/s"},
    {id:"vaporMassFlow",label:"Water-vapor mass flow",unit:"kg water/s",significantDigits:6},
    {id:"volumeFlow",label:"Mixed volume flow",unit:"m³/s"},
    {id:"enthalpyFlow",label:"Mixed enthalpy flow (0°C reference)",unit:"W"},

    {id:"humidityRatio",label:"Humidity ratio",unit:"kg water/kg dry air",significantDigits:6},
    {id:"specificHumidity",label:"Specific humidity",unit:"kg water/kg moist air",significantDigits:6},
    {id:"dewFrostPoint",label:"Dew point over water / frost point over ice",unit:"°C"},
    {id:"enthalpy",label:"Enthalpy per mass of dry air",unit:"J/kg dry air"},
    {id:"specificVolume",label:"Volume per mass of dry air",unit:"m³/kg dry air"},
    {id:"density",label:"Total moist-air density",unit:"kg/m³"},
    {id:"vaporPressure",label:"Water-vapor partial pressure",unit:"Pa"},
    {id:"saturationVaporPressure",label:"Saturation pressure at dry bulb",unit:"Pa"},
    {id:"saturationBasis",label:"RH reference phase at dry bulb",unit:""},
  ],
  calculate: mixHumidAir,
  steps: [
    "Mix two ideal moist-air streams adiabatically at a common pressure, with no work, heat transfer, added water or condensation. Inputs are dry-air mass flows, not total moist-air mass flows or volume flows.",
    "Each inlet uses −50 to 80 °C, 0-100% RH and 20-120 kPa absolute, with pressure above saturation pressure at dry bulb. Both inlet states must be valid even if one flow is zero. Flows must be nonnegative and their sum positive.",
    "Using dry-air flows m1 and m2, W = (m1W1 + m2W2)/(m1 + m2) and h = (m1h1 + m2h2)/(m1 + m2). Dry-air mass, water-vapor mass and enthalpy are conserved.",
    "For h in J/kg dry air, T = (h − 2501000W)/(1006 + 1860W) °C. Relative humidity follows from vapor pressure at this mixed temperature. Do not average inlet RH or use volume-flow fractions directly.",
    "Convert an inlet volume flow Q to dry-air flow with m = Q/v, using that inlet's specific volume in m³/kg dry air. Mixed volume flow is the total dry-air flow times mixed specific volume; total moist-air flow includes vapor mass.",
    "RH uses ice saturation at or below 0.01 °C and liquid water above it. A supersaturated vapor-only prediction is rejected: condensation or ice and their energy effects require a separate equilibrium model.",
    "Enthalpy flow is referenced to the model's 0 °C datum and is not a heating or cooling load. Pressure losses, fans, stratification and incomplete mixing are excluded.",
  ],
  sources: [
    {title:"ASHRAE Fundamentals 2025, Chapter 1: Adiabatic Mixing of Two Moist Airstreams",url:"https://handbook.ashrae.org/Handbooks/F25/SI/F25_Ch01/F25_Ch01_si.aspx",accessed:"2026-09-08"},
    {title:"PsychroLib ideal moist-air property relationships",url:"https://psychrometrics.github.io/psychrolib/api_docs.html",accessed:"2026-09-08"},
    {title:"PsychroLib MIT license and adaptation attribution",url:"/licenses/psychrolib.txt",accessed:"2026-09-08"},
  ],
},
"humid-air-wet-bulb": {
  title: "Humid Air from Dry and Wet Bulb", category: "HVAC",
  apiEndpoint: "/api/hvac/humid-air-wet-bulb",
  inputs: [
    {id:"dryBulb",label:"Dry-bulb temperature",unit:"°C",defaultValue:"30"},
    {id:"wetBulb",label:"Thermodynamic wet-bulb temperature",unit:"°C",defaultValue:"25"},
    {id:"pressure",label:"Total absolute pressure",unit:"Pa",defaultValue:"95461"},
  ],
  results: [
    {id:"relativeHumidity",label:"Relative humidity at dry bulb",unit:"%"},
    {id:"humidityRatio",label:"Humidity ratio",unit:"kg water/kg dry air",significantDigits:6},
    {id:"specificHumidity",label:"Specific humidity",unit:"kg water/kg moist air",significantDigits:6},
    {id:"dewFrostPoint",label:"Dew point over water / frost point over ice",unit:"°C"},
    {id:"enthalpy",label:"Enthalpy per mass of dry air",unit:"J/kg dry air"},
    {id:"specificVolume",label:"Volume per mass of dry air",unit:"m³/kg dry air"},
    {id:"density",label:"Total moist-air density",unit:"kg/m³"},
    {id:"vaporPressure",label:"Water-vapor partial pressure",unit:"Pa"},
    {id:"saturationVaporPressure",label:"Saturation pressure at dry bulb",unit:"Pa"},
    {id:"saturationBasis",label:"RH reference phase at dry bulb",unit:""},
    {id:"wetBulbDepression",label:"Dry minus wet bulb",unit:"°C"},
    {id:"wetBulbBasis",label:"Wet-bulb energy-balance phase",unit:""},
  ],
  calculate: humidAirWetBulb,
  steps: [
    "Calculate an ideal moist-air state from dry bulb, thermodynamic wet bulb and absolute pressure, using ASHRAE relationships adapted from MIT-licensed PsychroLib.",
    "Dry bulb: −50 to 80 °C. Wet bulb: −50 °C through the dry-bulb temperature. Pressure: 20-120 kPa absolute, above saturation pressure at dry bulb. Pairs implying negative moisture content are rejected rather than clamped to a small positive value.",
    "Let Ws = 0.621945 ps(Tw)/(p − ps(Tw)). For Tw ≥ 0 °C, W = [(2501 − 2.326Tw)Ws − 1.006(Td − Tw)] / [2501 + 1.86Td − 4.186Tw].",
    "For Tw < 0 °C, use the ice balance: W = [(2830 − 0.24Tw)Ws − 1.006(Td − Tw)] / [2830 + 1.86Td − 2.1Tw]. The wet-bulb energy-balance branch changes at 0 °C; the saturation-pressure function changes at the 0.01 °C triple point.",
    "pv = pW/(0.621945 + W); RH = 100pv/ps(Td). RH uses the saturation reference phase at dry bulb, which can differ from the wet-bulb balance phase. Enthalpy and specific volume are per kg of dry air; specific humidity and total density include water vapor.",
    "Thermodynamic wet bulb is an adiabatic-saturation property. A physical wet-bulb thermometer can be affected by ventilation, radiation, wick condition and ice formation; this tool does not correct an instrument reading. No fog, liquid droplets, supersaturation or real-gas correction is included.",
    "For a state given by relative humidity instead, use the Humid Air Properties calculator. Neither tool solves a full HVAC process or selects equipment.",
  ],
  sources: [
    {title:"PsychroLib: humidity ratio from wet bulb, ASHRAE equations 33 and 35",url:"https://psychrometrics.github.io/psychrolib/api_docs.html#psychrolib.GetHumRatioFromTWetBulb",accessed:"2026-09-08"},
    {title:"PsychroLib MIT license and adaptation attribution",url:"/licenses/psychrolib.txt",accessed:"2026-09-08"},
  ],
},
"composite-wall": {
  "title": "Composite Wall Heat Transfer",
  "category": "Thermal",
  "inputs": [
    {
      "id": "area",
      "label": "Common wall area",
      "unit": "m²",
      "defaultValue": "10"
    },
    {
      "id": "temperature1",
      "label": "Side 1 bulk fluid temperature",
      "unit": "K",
      "defaultValue": "293.15"
    },
    {
      "id": "temperature2",
      "label": "Side 2 bulk fluid temperature",
      "unit": "K",
      "defaultValue": "273.15"
    },
    {
      "id": "film1",
      "label": "Side 1 convection coefficient",
      "unit": "W/(m²·K)",
      "defaultValue": "10"
    },
    {
      "id": "film2",
      "label": "Side 2 convection coefficient",
      "unit": "W/(m²·K)",
      "defaultValue": "25"
    },
    {
      "id": "thickness1",
      "label": "Layer 1 thickness (zero to omit)",
      "unit": "m",
      "defaultValue": ".1"
    },
    {
      "id": "conductivity1",
      "label": "Layer 1 conductivity",
      "unit": "W/(m·K)",
      "defaultValue": "1"
    },
    {
      "id": "thickness2",
      "label": "Layer 2 thickness (zero to omit)",
      "unit": "m",
      "defaultValue": ".05"
    },
    {
      "id": "conductivity2",
      "label": "Layer 2 conductivity",
      "unit": "W/(m·K)",
      "defaultValue": ".04"
    },
    {
      "id": "thickness3",
      "label": "Layer 3 thickness (zero to omit)",
      "unit": "m",
      "defaultValue": "0"
    },
    {
      "id": "conductivity3",
      "label": "Layer 3 conductivity",
      "unit": "W/(m·K)",
      "defaultValue": "1"
    }
  ],
  "results": [
    {
      "id": "heatRate",
      "label": "Heat rate, side 1 toward side 2",
      "unit": "W"
    },
    {
      "id": "heatFlux",
      "label": "Heat flux, side 1 toward side 2",
      "unit": "W/m²"
    },
    {
      "id": "overallCoefficient",
      "label": "Overall heat-transfer coefficient",
      "unit": "W/(m²·K)"
    },
    {
      "id": "resistancePerArea",
      "label": "Area-normalized thermal resistance",
      "unit": "m²·K/W"
    },
    {
      "id": "thermalResistance",
      "label": "Total thermal resistance",
      "unit": "K/W"
    },
    {
      "id": "surface1",
      "label": "Side 1 wall surface",
      "unit": "K"
    },
    {
      "id": "interface12",
      "label": "Layer 1 / 2 interface",
      "unit": "K"
    },
    {
      "id": "interface23",
      "label": "Layer 2 / 3 interface",
      "unit": "K"
    },
    {
      "id": "surface2",
      "label": "Side 2 wall surface",
      "unit": "K"
    }
  ],
  "apiEndpoint": "/api/thermal/composite-wall",
  "sources": [
    {
      "title": "US DOE Fundamentals Handbook: conduction and convection, HT-02 pages 9-10 and 20-22",
      "url": "https://www.energy.gov/sites/default/files/2026-04/DOE-HDBK-1012-92_VOL2.pdf",
      "accessed": "2026-09-08"
    }
  ],
  "steps": [
    "Model up to three solid layers between two fluids. Number layers from side 1 toward side 2; set unused layer thicknesses to zero and retain positive conductivity inputs.",
    "R″ = 1/h₁ + Σ(Lᵢ/kᵢ) + 1/h₂; U = 1/R″. Each term uses the same wall area.",
    "q″ = U(T₁ − T₂); Q = Aq″. Positive heat flow is from side 1 toward side 2.",
    "Subtract q″ times each successive resistance to obtain surface and interface temperatures. Zero-thickness layers have no temperature drop.",
    "Assumes steady one-dimensional heat flow, constant properties and perfect layer contact, without heat generation, radiation, air gaps, thermal bridges or phase change. Supply coefficients and conductivities appropriate to the operating conditions.",
    "Illustrative inputs are not specified material properties or regulatory U-values. At the defaults, R″ = 1.49 m²·K/W and Q = 134.2282 W."
  ],
  "calculate": compositeWall
},
"pump-duty": {
  "title": "Reservoir-to-Reservoir Pump Duty",
  "category": "Pumps",
  "inputs": [
    {
      "id": "flowRate",
      "label": "Imposed liquid flow",
      "unit": "m³/s",
      "defaultValue": "0.01"
    },
    {
      "id": "length",
      "label": "Total straight-pipe length",
      "unit": "m",
      "defaultValue": "100"
    },
    {
      "id": "diameter",
      "label": "Uniform internal diameter",
      "unit": "m",
      "defaultValue": "0.1"
    },
    {
      "id": "roughness",
      "label": "Absolute pipe roughness",
      "unit": "m",
      "defaultValue": "0.000045"
    },
    {
      "id": "density",
      "label": "Liquid density",
      "unit": "kg/m³",
      "defaultValue": "998"
    },
    {
      "id": "viscosity",
      "label": "Dynamic viscosity",
      "unit": "Pa·s",
      "defaultValue": "0.001"
    },
    {
      "id": "elevationRise",
      "label": "Destination minus source surface elevation",
      "unit": "m",
      "defaultValue": "10"
    },
    {
      "id": "pressureDifference",
      "label": "Destination minus source surface pressure",
      "unit": "Pa",
      "defaultValue": "0"
    },
    {
      "id": "lossCoefficient",
      "label": "Total fitting and entry/exit loss coefficient",
      "unit": "1",
      "defaultValue": "5"
    },
    {
      "id": "pumpEfficiency",
      "label": "Pump efficiency, fraction",
      "unit": "0-1",
      "defaultValue": "0.7"
    },
    {
      "id": "motorEfficiency",
      "label": "Motor efficiency, fraction",
      "unit": "0-1",
      "defaultValue": "0.9"
    }
  ],
  "results": [
    {
      "id": "systemHead",
      "label": "Signed system head",
      "unit": "m"
    },
    {
      "id": "pumpHead",
      "label": "Head to add by pumping",
      "unit": "m"
    },
    {
      "id": "surplusHead",
      "label": "Surplus head requiring dissipation",
      "unit": "m"
    },
    {
      "id": "frictionHead",
      "label": "Straight-pipe friction head",
      "unit": "m"
    },
    {
      "id": "fittingHead",
      "label": "Local-loss head",
      "unit": "m"
    },
    {
      "id": "pressureHead",
      "label": "Reservoir pressure head difference",
      "unit": "m"
    },
    {
      "id": "hydraulicPower",
      "label": "Hydraulic power",
      "unit": "W"
    },
    {
      "id": "shaftPower",
      "label": "Pump shaft power",
      "unit": "W"
    },
    {
      "id": "electricalPower",
      "label": "Motor electrical input",
      "unit": "W"
    },
    {
      "id": "velocity",
      "label": "Pipe velocity",
      "unit": "m/s"
    },
    {
      "id": "reynoldsNumber",
      "label": "Reynolds number",
      "unit": "1"
    },
    {
      "id": "flowRegime",
      "label": "Flow regime",
      "unit": ""
    }
  ],
  "apiEndpoint": "/api/pumps/duty",
  "sources": [
    {
      "title": "US EPA EPANET 2.2: Pipe friction and minor losses",
      "url": "https://usepa.github.io/EPANET2.2/3_network_model.html",
      "accessed": "2026-09-08"
    },
    {
      "title": "KSB: Pump power input",
      "url": "https://www.ksb.com/en-global/centrifugal-pump-lexicon/article/power-input-1117260",
      "accessed": "2026-09-08"
    },
    {
      "title": "KSB: Pump efficiency",
      "url": "https://www.ksb.com/en-global/centrifugal-pump-lexicon/article/pump-efficiency-1116510",
      "accessed": "2026-09-08"
    }
  ],
  "steps": [
    "Combine reservoir elevation and pressure differences with pipe and local losses at an entered flow rate.",
    "Hsystem = Δz + Δp/(ρg) + hf + K v²/(2g). Reservoir velocities are negligible; all loss coefficients must refer to the same pipe velocity.",
    "Pipe friction uses Darcy-Weisbach with 64/Re below Re 2300 and Swamee-Jain otherwise. The transition range is uncertain.",
    "For positive head: Phydraulic = ρgQH, Pshaft = Phydraulic/ηpump, Pelectrical = Pshaft/ηmotor. Enter efficiencies as fractions, not percentages.",
    "Negative system head indicates surplus driving head at the imposed flow. Pumping power is zero in that case; control or dissipation would be needed. This is not turbine-output prediction.",
    "Use liquid properties for the operating temperature and pressure. Assumes steady incompressible single-phase flow and one uniform pipe bore; include entrance, exit, valve and fitting losses in K.",
    "This is a duty estimate, not a pump selection, actual operating-point solution, motor nameplate rating or NPSH/cavitation check. Use manufacturer curves and an application-specific margin separately."
  ]
,"calculate": pumpDuty
},

"sound-intensity-level": {
  "title": "Sound Intensity Level",
  "inputs": [
    {
      "id": "intensity",
      "label": "Sound intensity",
      "unit": "W/m²",
      "defaultValue": "0.000001"
    },
    {
      "id": "referenceIntensity",
      "label": "Reference intensity",
      "unit": "W/m²",
      "defaultValue": "1e-12"
    }
  ],
  "results": [
    {
      "id": "intensityLevel",
      "label": "Intensity level relative to reference",
      "unit": "dB"
    }
  ],
  "steps": [
    "Convert positive intensity to level: L = 10 log₁₀(I/Iref).",
    "Default reference: 10⁻¹² W/m². Example: I = 10⁻⁶ W/m² gives 60 dB.",
    "Negative levels are valid below the reference. Zero intensity corresponds to negative infinity and is excluded.",
    "This is intensity level, not sound-pressure level, A-weighted level or perceived loudness."
  ],
  "category": "Acoustics",
  "sources": [
    {
      "title": "OpenStax University Physics: Sound Intensity",
      "url": "https://openstax.org/books/university-physics-volume-1/pages/17-3-sound-intensity",
      "accessed": "2026-09-08"
    }
  ],
  "apiEndpoint": "/api/acoustics/sound-intensity-level"
,"calculate": soundIntensityLevel
},
"spherical-sound-spreading": {
  "title": "Spherical Sound Spreading",
  "inputs": [
    {
      "id": "acousticPower",
      "label": "Radiated acoustic power",
      "unit": "W",
      "defaultValue": "0.01"
    },
    {
      "id": "distance",
      "label": "Distance from point source",
      "unit": "m",
      "defaultValue": "10"
    },
    {
      "id": "referenceIntensity",
      "label": "Reference intensity",
      "unit": "W/m²",
      "defaultValue": "1e-12"
    }
  ],
  "results": [
    {
      "id": "intensity",
      "label": "Sound intensity",
      "unit": "W/m²"
    },
    {
      "id": "intensityLevel",
      "label": "Intensity level relative to reference",
      "unit": "dB"
    }
  ],
  "steps": [
    "Ideal full-sphere spreading: I = P/(4πr²), then L = 10 log₁₀(I/Iref).",
    "Example: 0.01 W at 10 m gives about 7.958 × 10⁻⁶ W/m², or 69.01 dB relative to 10⁻¹² W/m².",
    "Assumes an isotropic point source in a lossless free field. Excludes reflections, ground effects, barriers, atmospheric absorption and near-field effects.",
    "Use radiated acoustic power, not electrical input power. This model is not a noise-exposure assessment."
  ],
  "category": "Acoustics",
  "sources": [
    {
      "title": "OpenStax University Physics: Sound Intensity",
      "url": "https://openstax.org/books/university-physics-volume-1/pages/17-3-sound-intensity",
      "accessed": "2026-09-08"
    }
  ],
  "apiEndpoint": "/api/acoustics/spherical-sound-spreading"
,"calculate": sphericalSound
},

"surface-convection": {
  "title": "Surface Convection",
  "category": "Thermal",
  "inputs": [
    {
      "id": "coefficient",
      "label": "Mean convection coefficient",
      "unit": "W/(m²·K)",
      "defaultValue": "10"
    },
    {
      "id": "area",
      "label": "Heat transfer area",
      "unit": "m²",
      "defaultValue": "2"
    },
    {
      "id": "temperatureDifference",
      "label": "Surface minus bulk fluid temperature",
      "unit": "K",
      "defaultValue": "30"
    }
  ],
  "results": [
    {
      "id": "heatRate",
      "label": "Heat transfer rate",
      "unit": "W"
    },
    {
      "id": "heatFlux",
      "label": "Heat flux",
      "unit": "W/m²"
    },
    {
      "id": "thermalResistance",
      "label": "Convection resistance",
      "unit": "K/W"
    }
  ],
  "sources": [
    {
      "title": "MIT Unified Engineering: Convective Heat Transfer",
      "url": "https://web.mit.edu/16.unified/OldFiles/www/FALL/thermodynamics/notes/node121.html",
      "accessed": "2026-09-08"
    }
  ],
  "steps": [
    "Calculate surface convection using Q̇ = hAΔT and q″ = hΔT.",
    "Positive results mean heat leaves the surface; negative results mean heat enters it. R = 1/(hA).",
    "Example: h = 10 W/(m²·K), A = 2 m² and ΔT = 30 K give 600 W, 300 W/m² and 0.05 K/W.",
    "Supply a mean coefficient appropriate to the geometry, fluid and flow conditions. This calculator does not estimate h or model variation along the surface.",
    "Assumes a uniform surface temperature and a defined bulk-fluid temperature. Conduction, radiation and transient temperature changes are excluded."
  ],
  "apiEndpoint": "/api/thermal/surface-convection"
,"calculate": surfaceConvection
},
"enclosure-radiation": {
  "title": "Thermal Radiation to Large Surroundings",
  "category": "Thermal",
  "inputs": [
    {
      "id": "emissivity",
      "label": "Surface emissivity",
      "unit": "0-1",
      "defaultValue": "0.8"
    },
    {
      "id": "area",
      "label": "Radiating surface area",
      "unit": "m²",
      "defaultValue": "1"
    },
    {
      "id": "surfaceTemperature",
      "label": "Surface absolute temperature",
      "unit": "K",
      "defaultValue": "400"
    },
    {
      "id": "surroundingsTemperature",
      "label": "Surroundings absolute temperature",
      "unit": "K",
      "defaultValue": "300"
    }
  ],
  "results": [
    {
      "id": "heatRate",
      "label": "Net radiation heat rate",
      "unit": "W"
    },
    {
      "id": "heatFlux",
      "label": "Net radiation heat flux",
      "unit": "W/m²"
    }
  ],
  "sources": [
    {
      "title": "OpenStax: Mechanisms of Heat Transfer",
      "url": "https://openstax.org/books/university-physics-volume-2/pages/1-6-mechanisms-of-heat-transfer",
      "accessed": "2026-09-08"
    },
    {
      "title": "NIST fundamental physical constants",
      "url": "https://physics.nist.gov/cuu/Constants/index.html",
      "accessed": "2026-09-08"
    }
  ],
  "steps": [
    "Net thermal radiation: Q̇ = εσA(Ts⁴ − Tsur⁴). Absolute temperatures must be entered in kelvin.",
    "Uses σ = 5.670374419 × 10⁻⁸ W/(m²·K⁴), rounded from the Stefan-Boltzmann constant.",
    "Positive heat rate leaves the surface; hotter surroundings produce a negative result. Equal temperatures give zero net exchange.",
    "Example: ε = 0.8, A = 1 m², Ts = 400 K and Tsur = 300 K give approximately 793.85 W outward.",
    "Model: a gray surface surrounded by a much larger isothermal enclosure, with view factor one and a nonparticipating intervening medium.",
    "Does not solve exchange between finite surfaces, solar absorption, semitransparent materials, participating gases or combined convection. Select emissivity for the actual surface condition."
  ],
  "apiEndpoint": "/api/thermal/enclosure-radiation"
,"calculate": enclosureRadiation
},

"sensible-heat": {
  "category": "Thermal",
  "title": "Sensible Heat",
  "sources": [
    {
      "title": "OpenStax University Physics Volume 2: Sensible Heat",
      "url": "https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry",
      "accessed": "2026-09-08"
    }
  ],
  "inputs": [
    {
      "id": "mass",
      "label": "Mass",
      "unit": "kg",
      "defaultValue": "10"
    },
    {
      "id": "specificHeat",
      "label": "Specific heat capacity",
      "unit": "J/(kg·K)",
      "defaultValue": "1000"
    },
    {
      "id": "temperatureChange",
      "label": "Final minus initial temperature",
      "unit": "K",
      "defaultValue": "20"
    }
  ],
  "results": [
    {
      "id": "heat",
      "label": "Heat added",
      "unit": "J"
    },
    {
      "id": "heatCapacity",
      "label": "Total heat capacity",
      "unit": "J/K"
    }
  ],
  "steps": [
    "Q = mcΔT; heat capacity C = mc. Negative Q represents heat removed.",
    "Example: 10 kg, 1000 J/(kg·K), and a 20 K rise requires 200,000 J. The specific heat is illustrative.",
    "Assumes constant specific heat and no phase change. Choose the specific heat appropriate to the process, such as constant pressure or constant volume. Excludes equipment heat capacity and environmental losses.",
    "Source: https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry"
  ],
  "apiEndpoint": "/api/thermal/sensible-heat"
,"calculate": sensibleHeat
},
"linear-expansion": {
  "category": "Thermal",
  "title": "Free Linear Thermal Expansion",
  "sources": [
    {
      "title": "OpenStax University Physics Volume 2: Free Linear Thermal Expansion",
      "url": "https://openstax.org/books/university-physics-volume-2/pages/1-3-thermal-expansion",
      "accessed": "2026-09-08"
    }
  ],
  "inputs": [
    {
      "id": "originalLength",
      "label": "Original length",
      "unit": "m",
      "defaultValue": "10"
    },
    {
      "id": "coefficient",
      "label": "Mean linear expansion coefficient",
      "unit": "1/K",
      "defaultValue": "0.000012"
    },
    {
      "id": "temperatureChange",
      "label": "Final minus initial temperature",
      "unit": "K",
      "defaultValue": "50"
    }
  ],
  "results": [
    {
      "id": "lengthChange",
      "label": "Length change",
      "unit": "m"
    },
    {
      "id": "finalLength",
      "label": "Final length",
      "unit": "m"
    }
  ],
  "steps": [
    "ΔL = αL₀ΔT; final length = L₀ + ΔL. Cooling or a negative expansion coefficient can produce contraction.",
    "Example: 10 m, α = 0.000012/K and 50 K gives 0.006 m expansion. The coefficient is illustrative.",
    "Assumes uniform temperature and free expansion with a suitable mean coefficient over the temperature interval. It does not calculate restraint forces, thermal stress, buckling or joint capacity.",
    "Source: https://openstax.org/books/university-physics-volume-2/pages/1-3-thermal-expansion"
  ],
  "apiEndpoint": "/api/thermal/linear-expansion"
,"calculate": linearExpansion
},
  "ideal-gas-density": {
    category:"Gases",
    title:"Ideal Gas Density",
    sources:[{title:"NASA Glenn: Equation of State",url:"https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/equation-of-state/",accessed:"2026-09-08"}],
    inputs:[{id:"absolutePressure",label:"Absolute pressure",unit:"Pa",defaultValue:"101325"},{id:"absoluteTemperature",label:"Absolute temperature",unit:"K",defaultValue:"300"},{id:"specificGasConstant",label:"Specific gas constant",unit:"J/(kg·K)",defaultValue:"287"}],
    results:[{id:"density",label:"Density",unit:"kg/m³"},{id:"specificVolume",label:"Specific volume",unit:"m³/kg"}],
    calculate:idealGasDensity,
    steps:["Ideal gas relation p = ρRT gives density ρ = p/(RT). Specific volume is 1/ρ.","Pressure must be absolute and temperature must be in kelvins. R is the mass-based gas constant for the gas or mixture, not the universal molar constant.","Example: 101325 Pa, 300 K and R = 287 J/(kg·K) gives approximately 1.17683 kg/m³. The example R is a rounded dry-air assumption.","This is an ideal-gas estimate. Dense gases, conditions near condensation or the critical point, and mixtures with changing composition require appropriate real-fluid property data.","Source: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/equation-of-state/"],
    apiEndpoint:"/api/gases/ideal-gas-density",
  },
  "axial-bar": {
    category: "Mechanics",
    title: "Axial Bar Stress and Extension",
    sources: [{title:"OpenStax University Physics Volume 1 §12.3",url:"https://openstax.org/books/university-physics-volume-1/pages/12-3-stress-strain-and-elastic-modulus",accessed:"2026-09-08"}],
    inputs: [{id:"force",label:"Axial force (tension positive)",unit:"N",defaultValue:"10000"},{id:"area",label:"Cross-sectional area",unit:"m²",defaultValue:"0.001"},{id:"length",label:"Original bar length",unit:"m",defaultValue:"2"},{id:"youngModulus",label:"Young’s modulus",unit:"Pa",defaultValue:"200000000000"}],
    results: [{id:"stress",label:"Axial stress",unit:"Pa"},{id:"strain",label:"Axial strain",unit:"m/m"},{id:"extension",label:"Length change",unit:"m"}],
    calculate: axialBar,
    steps: ["For a uniform bar under centered axial load, stress σ = F/A, strain ε = σ/E, and length change δ = εL.", "Example: 10,000 N, 0.001 m², 2 m and E = 200 GPa gives 10 MPa stress, 0.00005 strain and 0.0001 m extension. The modulus is illustrative; use material- and temperature-appropriate data.", "Negative force represents compression and produces negative strain and shortening in this model.", "Valid only for small linear-elastic deformation. Does not check yield, buckling, fatigue, connections, stress concentrations or eccentric loading. Compression results do not establish column stability.", "Source: https://openstax.org/books/university-physics-volume-1/pages/12-3-stress-strain-and-elastic-modulus"],
    apiEndpoint:"/api/mechanics/axial-bar",
  },
  "dc-resistor": {
    category: "Electrical",
    title: "DC Resistor Current and Power",
    sources: [{title:"OpenStax University Physics Volume 2 §9.5",url:"https://openstax.org/books/university-physics-volume-2/pages/9-5-electrical-energy-and-power",accessed:"2026-09-08"}],
    inputs: [{id:"voltage",label:"Voltage across resistor",unit:"V",defaultValue:"12"},{id:"resistance",label:"Resistance",unit:"Ω",defaultValue:"100"}],
    results: [{id:"current",label:"Current",unit:"A"},{id:"power",label:"Dissipated power",unit:"W"}],
    calculate: dcResistor,
    steps: ["For an ideal ohmic resistor, I = V/R and P = VI = V²/R.", "Example: 12 V across 100 Ω gives 0.12 A and 1.44 W. Reversing voltage reverses current but leaves dissipated power positive.", "Assumes constant DC voltage and resistance. Does not model resistance changing with temperature, reactive AC loads, source impedance or nonlinear devices.", "Calculated dissipation is not a selected component rating; consult the component’s thermal derating and operating limits.", "Source: https://openstax.org/books/university-physics-volume-2/pages/9-5-electrical-energy-and-power"],
    apiEndpoint:"/api/electrical/dc-resistor",
  },
  "wall-conduction": {
    category: "Thermal",
    title: "Plane Wall Heat Conduction",
    sources: [{title:"OpenStax University Physics Volume 2 §1.6",url:"https://openstax.org/books/university-physics-volume-2/pages/1-6-mechanisms-of-heat-transfer",accessed:"2026-09-08"}],
    inputs: [
      {id:"conductivity",label:"Thermal conductivity",unit:"W/(m·K)",defaultValue:"0.04"},
      {id:"area",label:"Area normal to heat flow",unit:"m²",defaultValue:"10"},
      {id:"thickness",label:"Wall thickness",unit:"m",defaultValue:"0.1"},
      {id:"temperatureDifference",label:"Surface 1 minus surface 2 temperature",unit:"K",defaultValue:"20"},
    ],
    results: [{id:"heatRate",label:"Heat rate from surface 1 to 2",unit:"W"},{id:"heatFlux",label:"Heat flux from surface 1 to 2",unit:"W/m²"},{id:"thermalResistance",label:"Wall thermal resistance",unit:"K/W"}],
    calculate: wallConduction,
    steps: ["For steady one-dimensional conduction, heat rate = kAΔT/L and wall resistance = L/(kA).", "Example: k = 0.04 W/(m·K), A = 10 m², L = 0.1 m and ΔT = 20 K gives 80 W, 8 W/m² and 0.25 K/W. Conductivity here is illustrative; use a value appropriate to the material and operating temperature.", "The temperature difference is between wall surfaces, not surrounding air. A negative difference reverses the heat-flow direction.", "Assumes constant conductivity, no internal heat generation and negligible edge effects. Excludes surface convection, radiation, contact resistance and thermal bridges.", "Source: https://openstax.org/books/university-physics-volume-2/pages/1-6-mechanisms-of-heat-transfer"],
    apiEndpoint:"/api/thermal/wall-conduction",
  },
  "hydrostatic-pressure": {
    category: "Hydraulics",
    title: "Hydrostatic Pressure",
    sources: [{title:"OpenStax College Physics 2e §11.4",url:"https://openstax.org/books/college-physics-2e/pages/11-4-variation-of-pressure-with-depth-in-a-fluid",accessed:"2026-09-08"}],
    inputs: [
      {id:"density",label:"Fluid density",unit:"kg/m³",defaultValue:"1000"},
      {id:"depth",label:"Depth below surface",unit:"m",defaultValue:"10"},
      {id:"surfacePressure",label:"Absolute pressure at surface",unit:"Pa",defaultValue:"101325"},
      {id:"gravity",label:"Gravitational acceleration",unit:"m/s²",defaultValue:"9.80665"},
    ],
    results: [{id:"pressureIncrease",label:"Pressure increase below surface",unit:"Pa"},{id:"absolutePressure",label:"Absolute pressure at depth",unit:"Pa"}],
    calculate: hydrostaticPressure,
    steps: ["For a fluid at rest with constant density and gravity: Δp = ρgh.", "Absolute pressure at depth is surface absolute pressure + Δp. The increase is gauge pressure only when the reference is the surface pressure.", "Example: 1000 kg/m³ at 10 m and g = 9.80665 m/s² gives 98,066.5 Pa increase; with 101,325 Pa at the surface, absolute pressure is 199,391.5 Pa.", "Not applicable to a flowing system or a deep gas column with appreciably varying density.", "Source: OpenStax, College Physics 2e §11.4: https://openstax.org/books/college-physics-2e/pages/11-4-variation-of-pressure-with-depth-in-a-fluid"],
    apiEndpoint: "/api/hydraulics/hydrostatic-pressure",
  },
  "dynamic-pressure": {
    category: "Hydraulics",
    title: "Dynamic Pressure",
    sources: [{title:"NASA Glenn: Dynamic Pressure",url:"https://www.grc.nasa.gov/www/BGH/dynpress.html",accessed:"2026-09-08"}],
    inputs: [{id:"density",label:"Fluid density",unit:"kg/m³",defaultValue:"1.225"},{id:"velocity",label:"Flow speed",unit:"m/s",defaultValue:"20"}],
    results: [{id:"dynamicPressure",label:"Dynamic pressure",unit:"Pa"}],
    calculate: dynamicPressure,
    steps: ["Dynamic pressure q = ½ρv² is kinetic energy per unit volume.", "Example: density 1.225 kg/m³ and speed 20 m/s gives 245 Pa. The example density is an input assumption, not an atmospheric property lookup.", "Equating q with stagnation pressure minus static pressure requires the incompressible, lossless Bernoulli assumptions. Compressible Pitot measurements need a different relation.", "Source: NASA Glenn, Dynamic Pressure: https://www.grc.nasa.gov/www/BGH/dynpress.html"],
    apiEndpoint: "/api/hydraulics/dynamic-pressure",
  },
  "unit-converter": {
    category: "General & Utilities",
    title: "Engineering Unit Converter",
    inputs: [
      { id: "value", label: "Value", unit: "", defaultValue: "1" },
      {
        id: "fromUnit",
        label: "From Unit",
        unit: "",
        defaultValue: "1",
        type: "select",
        options: [
          { value: "1", label: "Meters (m)" },
          { value: "2", label: "Feet (ft)" },
          { value: "3", label: "Inches (in)" },
          { value: "4", label: "Yards (yd)" },
          { value: "5", label: "Millimeters (mm)" },
          { value: "6", label: "Centimeters (cm)" },
          { value: "7", label: "Kilometers (km)" },
        ],
      },
      {
        id: "toUnit",
        label: "To Unit",
        unit: "",
        defaultValue: "2",
        type: "select",
        options: [
          { value: "1", label: "Meters (m)" },
          { value: "2", label: "Feet (ft)" },
          { value: "3", label: "Inches (in)" },
          { value: "4", label: "Yards (yd)" },
          { value: "5", label: "Millimeters (mm)" },
          { value: "6", label: "Centimeters (cm)" },
          { value: "7", label: "Kilometers (km)" },
        ],
      },
    ],
    results: [{ id: "convertedValue", label: "Converted Value", unit: "" }],
    calculate: ({ value, fromUnit, toUnit }) => {
      const conversions: Record<number, { name: string; toMeters: number }> = {
        1: { name: "meters", toMeters: 1 },
        2: { name: "feet", toMeters: 0.3048 },
        3: { name: "inches", toMeters: 0.0254 },
        4: { name: "yards", toMeters: 0.9144 },
        5: { name: "millimeters", toMeters: 0.001 },
        6: { name: "centimeters", toMeters: 0.01 },
        7: { name: "kilometers", toMeters: 1000 },
      }

      const fromUnitNum = typeof fromUnit === "string" ? Number.parseInt(fromUnit) : fromUnit
      const toUnitNum = typeof toUnit === "string" ? Number.parseInt(toUnit) : toUnit

      if (!conversions[fromUnitNum] || !conversions[toUnitNum]) {
        return { convertedValue: "Invalid unit selection" }
      }

      const valueInMeters = value * conversions[fromUnitNum].toMeters
      const convertedValue = valueInMeters / conversions[toUnitNum].toMeters

      return {
        convertedValue: `${convertedValue.toFixed(6)} ${conversions[toUnitNum].name}`,
      }
    },
    steps: [
      "This calculator converts between common engineering length units.",
      "Units: 1=meters, 2=feet, 3=inches, 4=yards, 5=mm, 6=cm, 7=km",
      "First converts the input value to meters as a base unit.",
      "Then converts from meters to the target unit.",
      "Formula: Value_target = Value_input × (FromUnit_to_meters / ToUnit_to_meters)",
    ],
    generateDynamicSteps: (inputs, results) => {
      const conversions: Record<number, { name: string; toMeters: number }> = {
        1: { name: "meters", toMeters: 1 },
        2: { name: "feet", toMeters: 0.3048 },
        3: { name: "inches", toMeters: 0.0254 },
        4: { name: "yards", toMeters: 0.9144 },
        5: { name: "millimeters", toMeters: 0.001 },
        6: { name: "centimeters", toMeters: 0.01 },
        7: { name: "kilometers", toMeters: 1000 },
      }

      const fromUnit = conversions[inputs.fromUnit]
      const toUnit = conversions[inputs.toUnit]

      if (!fromUnit || !toUnit) {
        return ["Invalid unit selection - please check your input units."]
      }

      const valueInMeters = inputs.value * fromUnit.toMeters

      return [
        `Step 1: Convert ${inputs.value} ${fromUnit.name} to meters (base unit)`,
        `${inputs.value} × ${fromUnit.toMeters} = ${valueInMeters.toFixed(6)} meters`,
        `Step 2: Convert ${valueInMeters.toFixed(6)} meters to ${toUnit.name}`,
        `${valueInMeters.toFixed(6)} ÷ ${toUnit.toMeters} = ${(valueInMeters / toUnit.toMeters).toFixed(6)} ${toUnit.name}`,
        `Final Result: ${inputs.value} ${fromUnit.name} = ${results.convertedValue}`,
      ]
    },
  },
  "pressure-drop": {
    sources: [{"title": "US EPA EPANET 2.2: Pipe head loss and friction factors", "url": "https://usepa.github.io/EPANET2.2/3_network_model.html", "accessed": "2026-09-08"}],
    category: "Hydraulics",
    title: "Pressure Drop Calculator",
    apiEndpoint: "/api/hydraulics/pressure-drop",
    apiCalculationType: "pressure-drop",
    inputs: [
      { id: "Q", label: "Flow Rate", unit: "m³/s", defaultValue: "0.1" },
      { id: "L", label: "Pipe Length", unit: "m", defaultValue: "100" },
      { id: "D", label: "Pipe Diameter", unit: "m", defaultValue: "0.1" },
      { id: "roughness", label: "Pipe Roughness", unit: "m", defaultValue: "0.000045" },
      { id: "density", label: "Fluid Density", unit: "kg/m³", defaultValue: "998" },
      { id: "viscosity", label: "Dynamic Viscosity", unit: "Pa·s", defaultValue: "0.001" },
    ],
    results: [
      { id: "pressureDrop", label: "Pressure Drop", unit: "Pa" },
      { id: "frictionFactor", label: "Friction Factor", unit: "" },
      { id: "reynoldsNumber", label: "Reynolds Number", unit: "" },
      { id: "velocity", label: "Mean Velocity", unit: "m/s" },
    ],
    calculate: pressureDrop,
    steps: [
      "Calculates pressure drop using the Darcy-Weisbach equation",
      "Uses Darcy friction factor: 64/Re below Re 2300, otherwise the Swamee-Jain approximation. The 2300-4000 transition range is uncertain; this implementation does not reproduce EPANET’s transitional interpolation.",
      "Assumes steady, fully developed, single-phase incompressible flow in a full circular pipe. Input dynamic viscosity, density and roughness for the operating conditions.",
      "Returns straight-pipe friction loss only. Fittings, valves, elevation changes and acceleration are excluded. The friction factor is Darcy, not Fanning.",
    ],
  },
  "npsh-calculator": {
    sources: [{"title": "KSB Centrifugal Pump Lexicon: NPSH and cavitation criteria", "url": "https://www.ksb.com/en-global/centrifugal-pump-lexicon/article/npsh-1116954", "accessed": "2026-09-08"}],
    category: "Pumps",
    title: "NPSH Calculator",
    apiEndpoint: "/api/pumps/npsh",
    apiCalculationType: "npsh",
    inputs: [
      { id: "elevation", label: "Liquid Surface Above Pump", unit: "m", defaultValue: "2" },
      { id: "atmosphericPressure", label: "Reservoir Surface Absolute Pressure", unit: "Pa absolute", defaultValue: "101325" },
      { id: "vaporPressure", label: "Vapor Pressure", unit: "Pa", defaultValue: "2300" },
      { id: "density", label: "Liquid Density", unit: "kg/m³", defaultValue: "998" },
      { id: "npshRequired", label: "Required NPSH (manufacturer curve)", unit: "m", defaultValue: "3" },
      { id: "frictionLosses", label: "Total Suction Losses (pipe, fittings and entry)", unit: "m", defaultValue: "2.1" },
    ],
    results: [
      { id: "npshAvailable", label: "NPSH Available", unit: "m" },
      { id: "npshRequired", label: "NPSH Required", unit: "m" },
      { id: "npshMargin", label: "NPSH Margin", unit: "m" },
    ],
    calculate: npsh,
    steps: [
      "Reservoir model: NPSHA = (surface absolute pressure − vapor pressure)/(density × g) + liquid elevation − suction losses; negligible reservoir velocity",
      "Uses the required NPSH entered from the manufacturer curve; it cannot be inferred from suction conditions",
      "Returns the arithmetic margin NPSHA minus the supplied NPSHR. A positive margin alone does not establish cavitation-free operation or an adequate application-specific margin.",
      "Check the pump curve at the actual flow and speed and confirm its cavitation criterion. NPSH3 refers to a 3% head-drop criterion, not the onset of cavitation. Include suction entry, valve and fitting losses.",
    ],
  },
  "pipe-sizing": {
    sources: [{"title": "US EPA EPANET 2.2: Pipe head loss and friction factors", "url": "https://usepa.github.io/EPANET2.2/3_network_model.html", "accessed": "2026-09-08"}],
    category: "Hydraulics",
    title: "Pipe Sizing Calculator",
    apiEndpoint: "/api/hydraulics/pipe-sizing",
    apiCalculationType: "pipe-sizing",
    inputs: [
      { id: "flowRate", label: "Flow Rate", unit: "m³/s", defaultValue: "0.05" },
      { id: "targetVelocity", label: "Target Velocity", unit: "m/s", defaultValue: "2.0" },
      { id: "maxPressureDrop", label: "Max Pressure Drop", unit: "Pa/m", defaultValue: "100" },
      { id: "density", label: "Liquid Density", unit: "kg/m³", defaultValue: "998" },
      { id: "viscosity", label: "Dynamic Viscosity", unit: "Pa·s", defaultValue: "0.001" },
      { id: "roughness", label: "Pipe Roughness", unit: "m", defaultValue: "0.000045" },
    ],
    results: [
      { id: "recommendedDiameter", label: "Recommended Diameter", unit: "m" },
      { id: "actualVelocity", label: "Actual Velocity", unit: "m/s" },
      { id: "actualPressureDrop", label: "Actual Pressure Drop", unit: "Pa/m" },
    ],
    calculate: pipeSizing,
    steps: [
      "Finds a minimum internal bore satisfying the supplied mean-velocity and straight-pipe pressure-gradient limits.",
      "Considers velocity constraints and pressure drop limits",
      "Uses the pressure-drop calculator’s Darcy friction model and limitations. Transition-region results are uncertain. It does not select wall thickness, pressure class or a pipe-network design.",
      "Returns minimum internal diameter; choose a commercial size with an equal or larger bore",
    ],
  },
}

export async function fetchCalculatorsFromAPI(): Promise<Record<string, CalculatorConfig>> { return calculators }
export async function fetchCalculatorCategoriesFromAPI() {
  const categories = new Map<string, string[]>()
  for (const [slug, calculator] of Object.entries(calculators)) {
    const entries = categories.get(calculator.category) || []
    entries.push(slug)
    categories.set(calculator.category, entries)
  }
  return Array.from(categories, ([name, calculators]) => ({name, calculators}))
}

export function isApiCalculator(calculatorId: string): boolean {
  const calculator = calculators[calculatorId]
  return !!(calculator?.apiEndpoint || calculator?.apiCalculationType)
}

export function getApiCalculationType(calculatorId: string): string | null {
  const calculator = calculators[calculatorId]
  return calculator?.apiCalculationType || null
}
