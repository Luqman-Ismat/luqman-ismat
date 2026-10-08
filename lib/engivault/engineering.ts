/** SI calculations for steady, single-phase incompressible liquid flow. */
export function pressureDrop(x: Record<string, number>) {
  const { Q, L, D, roughness, density, viscosity } = x
  if (![Q,L,D,roughness,density,viscosity].every(Number.isFinite) || Q < 0 || L < 0 || D <= 0 || roughness < 0 || roughness >= D || density <= 0 || viscosity <= 0) throw new Error('Enter finite values: positive diameter, density and viscosity; nonnegative flow, length and roughness smaller than the diameter.')
  const velocity = 4 * Q / (Math.PI * D * D)
  const reynoldsNumber = density * velocity * D / viscosity
  const frictionFactor = Q === 0 ? 0 : reynoldsNumber < 2300 ? 64 / reynoldsNumber : 0.25 / Math.log10(roughness / (3.7 * D) + 5.74 / reynoldsNumber ** 0.9) ** 2
  const pressureDrop = frictionFactor * L / D * density * velocity ** 2 / 2
  if (![pressureDrop,frictionFactor,reynoldsNumber,velocity].every(Number.isFinite)) throw new Error("Inputs exceed the numerical range.")
  return { pressureDrop, frictionFactor, reynoldsNumber, velocity }
}
export function npsh(x: Record<string, number>) {
  const { atmosphericPressure, vaporPressure, density, elevation, frictionLosses, npshRequired } = x
  if (![atmosphericPressure,vaporPressure,density,elevation,frictionLosses,npshRequired].every(Number.isFinite) || atmosphericPressure <= 0 || vaporPressure < 0 || density <= 0 || frictionLosses < 0 || npshRequired < 0) throw new Error('Enter valid absolute pressures, positive density, and nonnegative losses and required NPSH.')
  const npshAvailable = (atmosphericPressure - vaporPressure) / (density * 9.80665) + elevation - frictionLosses
  const npshMargin = npshAvailable - npshRequired
  if (![npshAvailable,npshMargin].every(Number.isFinite)) throw new Error("Inputs exceed the numerical range.")
  return { npshAvailable, npshRequired, npshMargin }
}
export function pipeSizing(x: Record<string, number>) {
  const { flowRate, targetVelocity, maxPressureDrop, density, viscosity, roughness } = x
  if (![flowRate,targetVelocity,maxPressureDrop,density,viscosity,roughness].every(Number.isFinite) || flowRate <= 0 || targetVelocity <= 0 || maxPressureDrop <= 0 || density <= 0 || viscosity <= 0 || roughness < 0) throw new Error('Enter positive flow, velocity, pressure gradient, density and viscosity, with nonnegative roughness.')
  let low = Math.max(Math.sqrt(4 * flowRate / (Math.PI * targetVelocity)), roughness * 1.01)
  const gradient = (D: number) => pressureDrop({Q:flowRate,L:1,D,roughness,density,viscosity})
  let high = low
  for (let i=0; gradient(high).pressureDrop > maxPressureDrop && i<100; i++) high *= 2
  for(let i=0;i<80;i++){const mid=(low+high)/2;if(gradient(mid).pressureDrop>maxPressureDrop)low=mid;else high=mid}
  const result = gradient(high)
  if (result.pressureDrop > maxPressureDrop * (1 + 1e-10) || result.velocity > targetVelocity * (1 + 1e-10)) throw new Error("Could not find a diameter satisfying the supplied limits.")
  return {recommendedDiameter:high,actualVelocity:result.velocity,actualPressureDrop:result.pressureDrop}
}

/** Constant-density fluid at rest; depth measured down from the surface. */
export function hydrostaticPressure(x: Record<string, number>) {
  const { density, depth, surfacePressure, gravity } = x
  if (![density, depth, surfacePressure, gravity].every(Number.isFinite) || density <= 0 || depth < 0 || surfacePressure < 0 || gravity <= 0) throw new Error('Use positive density and gravity, nonnegative depth, and nonnegative absolute surface pressure.')
  const pressureIncrease = density * gravity * depth
  const absolutePressure = surfacePressure + pressureIncrease
  if (![pressureIncrease, absolutePressure].every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  return { pressureIncrease, absolutePressure }
}

/** Kinetic energy per unit volume; not a compressible Pitot pressure correction. */
export function dynamicPressure(x: Record<string, number>) {
  const { density, velocity } = x
  if (![density, velocity].every(Number.isFinite) || density <= 0 || velocity < 0) throw new Error('Use positive density and nonnegative speed.')
  const dynamicPressure = 0.5 * density * velocity ** 2
  if (!Number.isFinite(dynamicPressure)) throw new Error('Inputs exceed the numerical range.')
  return { dynamicPressure }
}

/** Steady one-dimensional conduction in a homogeneous plane wall. */
export function wallConduction(x: Record<string, number>) {
  const { conductivity, area, thickness, temperatureDifference } = x
  if (![conductivity, area, thickness, temperatureDifference].every(Number.isFinite) || conductivity <= 0 || area <= 0 || thickness <= 0) throw new Error('Use finite values with positive conductivity, area and thickness.')
  const thermalResistance = thickness / (conductivity * area)
  const heatRate = temperatureDifference / thermalResistance
  const heatFlux = heatRate / area
  if (![thermalResistance, heatRate, heatFlux].every(Number.isFinite) || thermalResistance <= 0) throw new Error('Inputs exceed the numerical range.')
  return { heatRate, heatFlux, thermalResistance }
}

/** Constant DC voltage across an ideal positive resistance. */
export function dcResistor(x: Record<string, number>) {
  const { voltage, resistance } = x
  if (![voltage,resistance].every(Number.isFinite) || resistance <= 0) throw new Error('Use a finite voltage and a positive finite resistance.')
  const current = voltage / resistance
  const power = voltage * current
  if (![current,power].every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  return { current, power }
}

/** Uniform prismatic bar, centered axial force, small linear-elastic strain. */
export function axialBar(x: Record<string, number>) {
  const { force, area, length, youngModulus } = x
  if (![force,area,length,youngModulus].every(Number.isFinite) || area <= 0 || length <= 0 || youngModulus <= 0) throw new Error('Use finite force and positive area, length and Young’s modulus.')
  const stress = force / area
  const strain = stress / youngModulus
  const extension = strain * length
  if (![stress,strain,extension].every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  return { stress, strain, extension }
}

/** Ideal gas equation of state using the specific (mass-based) gas constant. */
export function idealGasDensity(x: Record<string, number>) {
  const { absolutePressure, absoluteTemperature, specificGasConstant } = x
  if (![absolutePressure,absoluteTemperature,specificGasConstant].every(Number.isFinite) || absolutePressure <= 0 || absoluteTemperature <= 0 || specificGasConstant <= 0) throw new Error('Use positive absolute pressure, Kelvin temperature and specific gas constant.')
  const density = absolutePressure / specificGasConstant / absoluteTemperature
  const specificVolume = 1 / density
  if (![density,specificVolume].every(Number.isFinite) || density <= 0 || specificVolume <= 0) throw new Error('Inputs exceed the numerical range.')
  return { density, specificVolume }
}

export function sensibleHeat(x: Record<string, number>) {
  const { mass, specificHeat, temperatureChange } = x
  if (![mass,specificHeat,temperatureChange].every(Number.isFinite) || mass <= 0 || specificHeat <= 0) throw new Error('Use positive mass and specific heat, with a finite temperature change.')
  const heatCapacity = mass * specificHeat
  const heat = heatCapacity * temperatureChange
  if (![heatCapacity,heat].every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  return { heat, heatCapacity }
}
export function linearExpansion(x: Record<string, number>) {
  const { originalLength, coefficient, temperatureChange } = x
  if (![originalLength,coefficient,temperatureChange].every(Number.isFinite) || originalLength <= 0) throw new Error('Use positive length and finite coefficient and temperature change.')
  const lengthChange = originalLength * coefficient * temperatureChange
  const finalLength = originalLength + lengthChange
  if (![lengthChange,finalLength].every(Number.isFinite) || finalLength <= 0) throw new Error('Inputs exceed the numerical or physical range of this model.')
  return { lengthChange, finalLength }
}

/** Uniform surface with a supplied mean convective heat-transfer coefficient. */
export function surfaceConvection(x: Record<string, number>) {
  const { coefficient, area, temperatureDifference } = x
  if (![coefficient,area,temperatureDifference].every(Number.isFinite) || coefficient <= 0 || area <= 0) throw new Error('Use positive finite coefficient and area, and a finite surface-minus-fluid temperature difference.')
  const heatFlux = coefficient * temperatureDifference
  const heatRate = area * heatFlux
  const thermalResistance = 1 / coefficient / area
  if (![heatFlux,heatRate,thermalResistance].every(Number.isFinite) || thermalResistance <= 0) throw new Error('Inputs exceed the numerical range.')
  return { heatRate, heatFlux, thermalResistance }
}

/** Gray surface in a large isothermal enclosure; view factor to enclosure is one. */
export function enclosureRadiation(x: Record<string, number>) {
  const { emissivity, area, surfaceTemperature, surroundingsTemperature } = x
  if (![emissivity,area,surfaceTemperature,surroundingsTemperature].every(Number.isFinite) || emissivity < 0 || emissivity > 1 || area <= 0 || surfaceTemperature < 0 || surroundingsTemperature < 0) throw new Error('Use emissivity from 0 to 1, positive area and nonnegative absolute temperatures in kelvin.')
  if (emissivity === 0 || surfaceTemperature === surroundingsTemperature) return { heatRate: 0, heatFlux: 0 }
  // Factored fourth-power difference avoids subtracting nearly equal fourth powers.
  const heatFlux = 5.670374419e-8 * emissivity * (surfaceTemperature - surroundingsTemperature) * (surfaceTemperature + surroundingsTemperature) * (surfaceTemperature ** 2 + surroundingsTemperature ** 2)
  const heatRate = area * heatFlux
  if (![heatFlux,heatRate].every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  return { heatRate, heatFlux }
}

/** Intensity level relative to an explicit positive reference intensity. */
export function soundIntensityLevel(x: Record<string, number>) {
  const { intensity, referenceIntensity } = x
  if (![intensity,referenceIntensity].every(Number.isFinite) || intensity <= 0 || referenceIntensity <= 0) throw new Error('Use positive finite intensity and reference intensity. Zero intensity has no finite decibel level.')
  // Difference of logs avoids overflow or underflow in I/Iref.
  return { intensityLevel: 10 * (Math.log10(intensity) - Math.log10(referenceIntensity)) }
}

/** Isotropic point source, lossless full-sphere spreading. */
export function sphericalSound(x: Record<string, number>) {
  const { acousticPower, distance, referenceIntensity } = x
  if (![acousticPower,distance,referenceIntensity].every(Number.isFinite) || acousticPower <= 0 || distance <= 0 || referenceIntensity <= 0) throw new Error('Use positive finite acoustic power, source distance and reference intensity.')
  const intensity = acousticPower / (4 * Math.PI) / distance / distance
  if (!Number.isFinite(intensity) || intensity <= 0) throw new Error('Inputs exceed the numerical range.')
  return { intensity, ...soundIntensityLevel({intensity,referenceIntensity}) }
}

/** Imposed-flow duty between large reservoirs through a single uniform-bore line. */
export function pumpDuty(x: Record<string, number>) {
  const { flowRate, length, diameter, roughness, density, viscosity, elevationRise, pressureDifference, lossCoefficient, pumpEfficiency, motorEfficiency } = x
  if (![flowRate,length,diameter,roughness,density,viscosity,elevationRise,pressureDifference,lossCoefficient,pumpEfficiency,motorEfficiency].every(Number.isFinite) || flowRate <= 0 || lossCoefficient < 0 || pumpEfficiency <= 0 || pumpEfficiency > 1 || motorEfficiency <= 0 || motorEfficiency > 1) throw new Error('Use positive flow, nonnegative loss coefficient and efficiencies greater than zero and no more than one. All inputs must be finite.')
  const pipe = pressureDrop({Q:flowRate,L:length,D:diameter,roughness,density,viscosity})
  const g = 9.80665
  const frictionHead = pipe.pressureDrop / density / g
  const fittingHead = lossCoefficient * pipe.velocity ** 2 / (2*g)
  const pressureHead = pressureDifference / density / g
  const systemHead = elevationRise + pressureHead + frictionHead + fittingHead
  const pumpHead = Math.max(0,systemHead)
  const surplusHead = Math.max(0,-systemHead)
  const hydraulicPower = density * g * flowRate * pumpHead
  const shaftPower = hydraulicPower / pumpEfficiency
  const electricalPower = shaftPower / motorEfficiency
  const numbers = {frictionHead,fittingHead,pressureHead,systemHead,pumpHead,surplusHead,hydraulicPower,shaftPower,electricalPower,velocity:pipe.velocity,reynoldsNumber:pipe.reynoldsNumber}
  if (!Object.values(numbers).every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  const flowRegime = pipe.reynoldsNumber < 2300 ? 'Laminar' : pipe.reynoldsNumber < 4000 ? 'Transitional: friction estimate uncertain' : 'Turbulent'
  return {...numbers,flowRegime}
}

/** Series conduction through three plane layers with convection at both boundaries. */
export function compositeWall(x: Record<string, number>) {
  const {area, temperature1, temperature2, film1, film2} = x
  const lengths = [x.thickness1, x.thickness2, x.thickness3]
  const conductivities = [x.conductivity1, x.conductivity2, x.conductivity3]
  if (![area,temperature1,temperature2,film1,film2,...lengths,...conductivities].every(Number.isFinite) || area <= 0 || temperature1 < 0 || temperature2 < 0 || film1 <= 0 || film2 <= 0 || lengths.some(v=>v<0) || conductivities.some(v=>v<=0)) throw new Error('Use nonnegative Kelvin temperatures and thicknesses, positive area, conductivities and film coefficients, and finite values.')
  const layers = lengths.map((length,i)=>length/conductivities[i])
  const resistancePerArea = 1/film1 + layers.reduce((a,b)=>a+b,0) + 1/film2
  const overallCoefficient = 1/resistancePerArea
  const heatFlux = (temperature1-temperature2)*overallCoefficient
  const heatRate = heatFlux*area
  const surface1 = temperature1-heatFlux/film1
  const interface12 = surface1-heatFlux*layers[0]
  const interface23 = interface12-heatFlux*layers[1]
  const surface2 = temperature2+heatFlux/film2
  const result = {heatRate,heatFlux,overallCoefficient,resistancePerArea,thermalResistance:resistancePerArea/area,surface1,interface12,interface23,surface2}
  if (!Object.values(result).every(Number.isFinite) || resistancePerArea <= 0 || overallCoefficient <= 0 || result.thermalResistance <= 0) throw new Error('Inputs exceed the numerical range.')
  return result
}

export { humidAir, humidAirWetBulb, mixHumidAir, airTemperatureProcess, saturationPressure } from './psychrometrics'

/** Uniform Euler-Bernoulli beam response, central/tip point load and full-span UDL. */
function beamResponse(x: Record<string, number>) {
  const {support,span,secondMoment,youngModulus,pointLoad,lineLoad}=x
  if (![support,span,secondMoment,youngModulus,pointLoad,lineLoad].every(Number.isFinite) || ![0,1].includes(support) || span<=0 || secondMoment<=0 || youngModulus<=0 || pointLoad<0 || lineLoad<0) throw new Error('Select support 0 (simple) or 1 (cantilever); use positive span, second moment and modulus, with nonnegative downward loads.')
  const rigidity=youngModulus*secondMoment
  const totalLoad=pointLoad+lineLoad*span
  const cantilever=support===1
  const leftReaction=cantilever?totalLoad:totalLoad/2
  const rightReaction=cantilever?0:totalLoad/2
  const fixedReactionMoment=cantilever?pointLoad*span+lineLoad*span**2/2:0
  const maximumMoment=cantilever?fixedReactionMoment:pointLoad*span/4+lineLoad*span**2/8
  const maximumDeflection=cantilever
    ? pointLoad*span**3/(3*rigidity)+lineLoad*span**4/(8*rigidity)
    : pointLoad*span**3/(48*rigidity)+5*lineLoad*span**4/(384*rigidity)
  const result={rigidity,totalLoad,leftReaction,rightReaction,fixedReactionMoment,maximumMoment,maximumShear:leftReaction,maximumDeflection,deflectionSpanRatio:maximumDeflection/span}
  if(!Object.values(result).every(Number.isFinite) || rigidity<=0) throw new Error('Inputs exceed the numerical range.')
  return {...result,criticalLocations:cantilever?'Moment at fixed end; deflection at free tip':'Moment and deflection at midspan'}
}

/** Euler-Bernoulli solid rectangular beam; rectangular shear-stress formula only here. */
export function rectangularBeam(x: Record<string, number>) {
  const {width,depth}=x
  if (![width,depth].every(Number.isFinite)||width<=0||depth<=0) throw new Error('Use positive rectangular dimensions.')
  const area=width*depth,secondMoment=width*depth**3/12,sectionModulus=width*depth**2/6
  const response=beamResponse({...x,secondMoment})
  const maximumBendingStress=response.maximumMoment/sectionModulus
  const maximumShearStress=1.5*response.maximumShear/area
  if (![area,secondMoment,sectionModulus,maximumBendingStress,maximumShearStress].every(Number.isFinite)||area<=0||secondMoment<=0||sectionModulus<=0) throw new Error('Inputs exceed the numerical range.')
  return {area,secondMoment,sectionModulus,...response,maximumBendingStress,maximumShearStress}
}

/** Principal-axis bending using supplied section properties; no general shear-stress inference. */
export function sectionBeam(x:Record<string,number>) {
  const {extremeDistance,secondMoment}=x
  if (!Number.isFinite(extremeDistance)||extremeDistance<=0) throw new Error('Use a positive distance from the neutral axis to the farthest material fibre.')
  const response=beamResponse(x)
  const sectionModulus=secondMoment/extremeDistance
  const maximumBendingStress=response.maximumMoment/sectionModulus
  if (![sectionModulus,maximumBendingStress].every(Number.isFinite)||sectionModulus<=0) throw new Error('Inputs exceed the numerical range.')
  return {sectionModulus,...response,maximumBendingStress}
}

/** Steady radial conduction through a pipe and optional insulation, with two convection films. */
export function insulatedPipe(x: Record<string, number>) {
  const { length, innerDiameter, pipeOuterDiameter, pipeConductivity, insulationThickness, insulationConductivity, innerFilm, outerFilm, fluidTemperature, ambientTemperature } = x
  if (![length, innerDiameter, pipeOuterDiameter, pipeConductivity, insulationThickness, insulationConductivity, innerFilm, outerFilm, fluidTemperature, ambientTemperature].every(Number.isFinite) || length <= 0 || innerDiameter <= 0 || pipeOuterDiameter <= innerDiameter || pipeConductivity <= 0 || insulationThickness < 0 || insulationConductivity <= 0 || innerFilm <= 0 || outerFilm <= 0 || fluidTemperature < 0 || ambientTemperature < 0) throw new Error('Use positive length, conductivities and film coefficients; actual outer diameter larger than inner diameter; nonnegative insulation thickness and Kelvin temperatures.')
  const outerDiameter = pipeOuterDiameter + 2 * insulationThickness
  // Resistances per unit length, in K·m/W. log1p retains precision for thin layers.
  const inner = 1 / (Math.PI * innerDiameter * innerFilm)
  const pipe = Math.log1p((pipeOuterDiameter - innerDiameter) / innerDiameter) / (2 * Math.PI * pipeConductivity)
  const insulation = Math.log1p(2 * insulationThickness / pipeOuterDiameter) / (2 * Math.PI * insulationConductivity)
  const outer = 1 / (Math.PI * outerDiameter * outerFilm)
  const resistancePerLength = inner + pipe + insulation + outer
  const bareResistancePerLength = inner + pipe + 1 / (Math.PI * pipeOuterDiameter * outerFilm)
  if (![outerDiameter, inner, pipe, insulation, outer, resistancePerLength, bareResistancePerLength].every(Number.isFinite) || inner <= 0 || pipe <= 0 || outer <= 0 || (insulationThickness > 0 && insulation <= 0)) throw new Error('Inputs exceed the numerical range.')
  const heatPerLength = (fluidTemperature - ambientTemperature) / resistancePerLength
  const heatRate = heatPerLength * length
  const thermalResistance = resistancePerLength / length
  const innerSurface = fluidTemperature - heatPerLength * inner
  const pipeOuterSurface = innerSurface - heatPerLength * pipe
  const outerSurface = ambientTemperature + heatPerLength * outer
  const bareHeatRate = (fluidTemperature - ambientTemperature) / bareResistancePerLength * length
  const magnitudeReduction = Math.abs(bareHeatRate) - Math.abs(heatRate)
  const result = { heatRate, heatPerLength, thermalResistance, innerSurface, pipeOuterSurface, outerSurface, bareHeatRate, magnitudeReduction, outerDiameter }
  if (!Object.values(result).every(Number.isFinite) || thermalResistance <= 0) throw new Error('Inputs exceed the numerical range.')
  return result
}

/** Turbulent liquid Kv estimate for a valve without attached fitting corrections. */
export function liquidValve(x: Record<string, number>) {
  const { flowRate, density, inletPressure, outletPressure, vaporPressure, criticalPressure, recoveryFactor } = x
  if (![flowRate,density,inletPressure,outletPressure,vaporPressure,criticalPressure,recoveryFactor].every(Number.isFinite) || flowRate <= 0 || density <= 0 || outletPressure <= 0 || inletPressure <= outletPressure || vaporPressure < 0 || inletPressure <= vaporPressure || criticalPressure <= vaporPressure || recoveryFactor <= 0 || recoveryFactor > 1) throw new Error('Use positive flow and density; absolute inlet pressure above outlet and vapor pressures; positive outlet pressure; critical pressure above nonnegative vapor pressure; and FL greater than 0 and no greater than 1.')
  const pressureDrop = inletPressure - outletPressure
  const criticalRatio = .96 - .28 * Math.sqrt(vaporPressure / criticalPressure)
  const chokedPressureDrop = recoveryFactor ** 2 * (inletPressure - criticalRatio * vaporPressure)
  const effectivePressureDrop = Math.min(pressureDrop, chokedPressureDrop)
  const kv = flowRate * 3600 * Math.sqrt((density / 1000) / (effectivePressureDrop / 100000))
  const uncorrectedKv = flowRate * 3600 * Math.sqrt((density / 1000) / (pressureDrop / 100000))
  if (![pressureDrop,criticalRatio,chokedPressureDrop,effectivePressureDrop,kv,uncorrectedKv].every(Number.isFinite) || chokedPressureDrop <= 0 || kv <= 0 || uncorrectedKv <= 0) throw new Error('Inputs exceed the numerical range.')
  const regime = pressureDrop >= chokedPressureDrop ? 'At or above calculated choking limit' : 'Below calculated choking limit; cavitation not ruled out'
  const phaseAssessment = outletPressure < vaporPressure ? 'Flashing indicated: outlet pressure below vapor pressure' : outletPressure === vaporPressure ? 'Outlet at vapor-pressure boundary; further assessment required' : 'Outlet above vapor pressure; assess internal cavitation separately'
  return { kv, uncorrectedKv, pressureDrop, chokedPressureDrop, effectivePressureDrop, criticalRatio, regime, phaseAssessment }
}

export { waterProperties, waterReferenceState, waterVaporPressure } from './water-properties'
import { waterProperties } from './water-properties'
/** Horizontal uniform pipe, constant inlet properties; checks outlet remains on the liquid branch. */
export function waterPipeLoss(x: Record<string, number>) {
  const properties = waterProperties({ temperature:x.temperature, pressure:x.inletPressure })
  const loss = pressureDrop({Q:x.flowRate,L:x.length,D:x.diameter,roughness:x.roughness,density:properties.density,viscosity:properties.viscosity})
  const outletPressure = x.inletPressure - loss.pressureDrop
  if (outletPressure < properties.vaporPressure) throw new Error('Predicted outlet pressure is below water saturation pressure. This single-phase pipe model is not applicable.')
  return { ...loss, outletPressure, headLoss:loss.pressureDrop/(properties.density*9.80665), density:properties.density, viscosity:properties.viscosity, vaporPressure:properties.vaporPressure, flowRegime:loss.reynoldsNumber===0?'No flow':loss.reynoldsNumber<2300?'Laminar':loss.reynoldsNumber<4000?'Transitional: friction estimate uncertain':'Turbulent' }
}

/** Passive sinusoidal load; balanced three-phase option uses line-to-line voltage and line current. */
export function acPower(x: Record<string, number>) {
  const { phases, voltage, current, powerFactor, reactiveDirection } = x
  if (![phases,voltage,current,powerFactor,reactiveDirection].every(Number.isFinite) || ![1,3].includes(phases) || voltage <= 0 || current < 0 || powerFactor < 0 || powerFactor > 1 || ![0,1].includes(reactiveDirection)) throw new Error('Use one or three phases, positive RMS voltage, nonnegative RMS current, power factor from 0 to 1, and a valid leading/lagging choice.')
  const apparentPower = (phases === 3 ? Math.sqrt(3) : 1) * voltage * current
  const activePower = apparentPower * powerFactor
  const sign = reactiveDirection === 0 ? 1 : -1
  const reactivePower = sign * apparentPower * Math.sqrt(Math.max(0,1-powerFactor**2))
  const phaseAngle = sign * Math.acos(powerFactor) * 180 / Math.PI
  const activePerPhase = activePower / phases
  const result = { apparentPower, activePower, reactivePower, phaseAngle, activePerPhase }
  if (!Object.values(result).every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  return result
}

/** Sinusoidal steady-state series RLC with positive resistance; C=0 explicitly bypasses capacitor. */
export function seriesRlc(x: Record<string, number>) {
  const { voltage, frequency, resistance, inductance, capacitance } = x
  if (![voltage,frequency,resistance,inductance,capacitance].every(Number.isFinite) || voltage < 0 || frequency <= 0 || resistance <= 0 || inductance < 0 || capacitance < 0) throw new Error('Use nonnegative RMS voltage, inductance and capacitance, with positive frequency and resistance. Zero capacitance means the capacitor is bypassed.')
  const omega = 2*Math.PI*frequency
  const inductiveReactance = omega*inductance
  const capacitiveReactance = capacitance === 0 ? 0 : 1/(omega*capacitance)
  const reactance = inductiveReactance-capacitiveReactance
  const impedance = Math.hypot(resistance,reactance)
  const current = voltage/impedance
  const phaseAngle = Math.atan2(reactance,resistance)*180/Math.PI
  const powerFactor = resistance/impedance
  const activePower = current**2*resistance
  const reactivePower = current**2*reactance
  const apparentPower = voltage*current
  const resistorVoltage = current*resistance
  const inductorVoltage = current*inductiveReactance
  const capacitorVoltage = current*capacitiveReactance
  const numeric = { inductiveReactance,capacitiveReactance,reactance,impedance,current,phaseAngle,powerFactor,activePower,reactivePower,apparentPower,resistorVoltage,inductorVoltage,capacitorVoltage }
  const resonanceFrequency = inductance>0&&capacitance>0 ? 1/(2*Math.PI*Math.sqrt(inductance)*Math.sqrt(capacitance)) : 'No LC pair'
  if (!Object.values(numeric).every(Number.isFinite) || !Number.isFinite(omega) || (typeof resonanceFrequency==='number'&&(!Number.isFinite(resonanceFrequency)||resonanceFrequency<=0))) throw new Error('Inputs exceed the numerical range.')
  return {...numeric,resonanceFrequency}
}

/** Uniform isotropic circular shaft, linear elastic torsion, SI inputs. */
export function shaftTorsion(x: Record<string, number>) {
  const { outerDiameter: d, innerDiameter: b, length, shearModulus, torque, speed } = x
  if (![d,b,length,shearModulus,torque,speed].every(Number.isFinite) || d <= 0 || b < 0 || b >= d || length <= 0 || shearModulus <= 0) throw new Error('Use positive length and shear modulus, with outer diameter greater than a nonnegative inner diameter. Torque and rotational speed must be finite; zero inner diameter means solid.')
  // Factored difference avoids subtracting nearly equal fourth powers in thin tubes.
  const polarMoment = Math.PI / 32 * (d-b) * (d+b) * (d*d+b*b)
  const torsionalStiffness = shearModulus * polarMoment / length
  const twistRadians = torque / torsionalStiffness
  const twistDegrees = twistRadians * 180 / Math.PI
  const maximumShearStress = Math.abs(torque) / polarMoment * d / 2
  const maximumShearStrain = maximumShearStress / shearModulus
  const angularSpeed = speed * (2*Math.PI/60)
  const power = torque * angularSpeed
  const strainEnergy = torque * twistRadians / 2
  const result = { polarMoment, torsionalStiffness, twistRadians, twistDegrees, maximumShearStress, maximumShearStrain, angularSpeed, power, strainEnergy }
  if (!Object.values(result).every(Number.isFinite) || polarMoment <= 0 || torsionalStiffness <= 0) throw new Error('Inputs exceed the numerical range.')
  return result
}

/** Calorically perfect gas: local static state and ideal isentropic stagnation state. */
export function gasFlowState(x: Record<string, number>) {
  const { absolutePressure, absoluteTemperature, specificGasConstant, heatCapacityRatio: gamma, speed } = x
  const {density}=idealGasDensity(x)
  if (![gamma,speed].every(Number.isFinite) || gamma<=1 || speed<0) throw new Error('Use a finite heat-capacity ratio greater than 1 and a nonnegative flow speed.')
  const soundSpeed=Math.sqrt(gamma*specificGasConstant*absoluteTemperature)
  const mach=speed/soundSpeed
  const specificHeat=gamma*specificGasConstant/(gamma-1)
  const rise=(gamma-1)*mach**2/2
  const temperatureRatio=1+rise
  // log1p/expm1 preserve the small stagnation pressure rise at low Mach number.
  const logTemperatureRatio=Math.log1p(rise)
  const pressureExponent=gamma/(gamma-1)*logTemperatureRatio
  const pressureRatio=Math.exp(pressureExponent)
  const densityRatio=Math.exp(logTemperatureRatio/(gamma-1))
  const stagnationTemperature=absoluteTemperature*temperatureRatio
  const stagnationPressure=absolutePressure*pressureRatio
  const stagnationDensity=density*densityRatio
  const stagnationPressureRise=absolutePressure*Math.expm1(pressureExponent)
  const dynamicPressure=density*speed**2/2
  const result={density,soundSpeed,mach,specificHeat,temperatureRatio,pressureRatio,densityRatio,stagnationTemperature,stagnationPressure,stagnationDensity,stagnationPressureRise,dynamicPressure}
  if (!Object.values(result).every(Number.isFinite) || soundSpeed<=0 || specificHeat<=0 || stagnationDensity<=0) throw new Error('Inputs exceed the numerical range.')
  return result
}

/** Stationary, one-dimensional normal shock in a calorically perfect ideal gas. */
export function normalShock(x: Record<string, number>) {
  const {absolutePressure:p,absoluteTemperature:t,specificGasConstant:R,heatCapacityRatio:g,upstreamMach:m}=x
  if (![p,t,R,g,m].every(Number.isFinite) || p<=0 || t<=0 || R<=0 || g<=1 || m<1) throw new Error('Use positive absolute pressure, Kelvin temperature and gas constant, gamma greater than 1, and upstream Mach at least 1. Mach 1 is the zero-strength limit.')
  const upstreamSpeed=m*Math.sqrt(g*R*t)
  const upstream=gasFlowState({...x,speed:upstreamSpeed})
  const m2=m*m
  const pressureRatio=1+2*g/(g+1)*(m2-1)
  const densityRatio=(g+1)*m2/((g-1)*m2+2)
  const temperatureRatio=pressureRatio/densityRatio
  const downstreamMach=Math.sqrt(((g-1)*m2+2)/(2*g*m2-(g-1)))
  const downstreamPressure=p*pressureRatio
  const downstreamTemperature=t*temperatureRatio
  const downstreamDensity=upstream.density*densityRatio
  const downstreamSpeed=upstreamSpeed/densityRatio
  const rawLogRatio=(g*Math.log(densityRatio)-Math.log(pressureRatio))/(g-1)
  // Weak-shock losses can round to zero; never report a numerical pressure gain.
  if (rawLogRatio>1e-10) throw new Error('Inputs exceed the numerical range.')
  const logRatio=Math.min(0,rawLogRatio)
  const stagnationPressureRatio=Math.exp(logRatio)
  const upstreamStagnationPressure=upstream.stagnationPressure
  const downstreamStagnationPressure=upstreamStagnationPressure*stagnationPressureRatio
  const stagnationPressureLoss=logRatio===0 ? 0 : -upstreamStagnationPressure*Math.expm1(logRatio)
  const stagnationTemperature=upstream.stagnationTemperature
  const entropyIncrease=logRatio===0 ? 0 : -R*logRatio
  const result={upstreamSpeed,downstreamMach,pressureRatio,densityRatio,temperatureRatio,downstreamPressure,downstreamTemperature,downstreamDensity,downstreamSpeed,stagnationPressureRatio,upstreamStagnationPressure,downstreamStagnationPressure,stagnationPressureLoss,stagnationTemperature,entropyIncrease}
  if (!Object.values(result).every(Number.isFinite) || downstreamMach<=0 || downstreamDensity<=0 || downstreamTemperature<=0 || downstreamStagnationPressure<=0 || stagnationPressureRatio<=0) throw new Error('Inputs exceed the numerical range.')
  return result
}

function sectionResults(area:number,ix:number,iy:number,width:number,height:number) {
  const result={area,centroidX:width/2,centroidY:height/2,secondMomentX:ix,secondMomentY:iy,polarAreaMoment:ix+iy,sectionModulusX:ix/(height/2),sectionModulusY:iy/(width/2),radiusOfGyrationX:Math.sqrt(ix/area),radiusOfGyrationY:Math.sqrt(iy/area)}
  if (!Object.values(result).every(v=>Number.isFinite(v)&&v>0)) throw new Error('Dimensions exceed the numerical range.')
  return result
}

/** Concentric rectangular void, sharp corners; both inner dimensions zero selects solid. */
export function rectangularSection(x:Record<string,number>) {
  const {width:b,height:h,innerWidth:bi,innerHeight:hi}=x
  if (![b,h,bi,hi].every(Number.isFinite)||b<=0||h<=0||bi<0||hi<0||bi>=b||hi>=h||(bi===0)!==(hi===0)) throw new Error('Use positive outer dimensions and smaller positive inner dimensions, or set both inner dimensions to zero for a solid rectangle.')
  // Positive factored differences preserve thin-wall geometry without subtracting close powers.
  const area=(b-bi)*h+bi*(h-hi)
  const ix=((b-bi)*h**3+bi*(h-hi)*(h*h+h*hi+hi*hi))/12
  const iy=((h-hi)*b**3+hi*(b-bi)*(b*b+b*bi+bi*bi))/12
  return sectionResults(area,ix,iy,b,h)
}

/** Concentric circular annulus; inner diameter zero selects solid. */
export function circularSection(x:Record<string,number>) {
  const {outerDiameter:d,innerDiameter:di}=x
  if (![d,di].every(Number.isFinite)||d<=0||di<0||di>=d) throw new Error('Use a positive outer diameter and a nonnegative smaller inner diameter. Zero inner diameter selects a solid circle.')
  const area=Math.PI/4*(d-di)*(d+di)
  const inertia=area*(d*d+di*di)/16
  return sectionResults(area,inertia,inertia,d,d)
}

function currentLoopRange(valueAt4:number,valueAt20:number) {
  const span=valueAt20-valueAt4
  if (![valueAt4,valueAt20,span].every(Number.isFinite)||span===0) throw new Error('The values at 4 mA and 20 mA must be finite and different.')
  return span
}
function currentLoopResults(current:number,value:number,fraction:number) {
  const percentSpan=100*fraction
  if (![current,value,percentSpan].every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  const rangeStatus=current<4 ? 'Below 4 mA, extrapolated. Check the instrument' : current>20 ? 'Above 20 mA, extrapolated. Check the instrument' : 'Within nominal 4-20 mA range'
  return {current,value,percentSpan,rangeStatus}
}
/** Linear scale only. Values outside nominal current range are deliberately not clamped. */
export function currentLoopScale(x:Record<string,number>) {
  const {current,valueAt4,valueAt20}=x
  const span=currentLoopRange(valueAt4,valueAt20)
  if (!Number.isFinite(current)) throw new Error('Enter a finite measured current in mA.')
  const fraction=(current-4)/16
  const value=fraction===0 ? valueAt4 : fraction===1 ? valueAt20 : valueAt4+fraction*span
  return currentLoopResults(current,value,fraction)
}
/** Mathematical inverse, not an instruction to transmit an out-of-range current. */
export function currentLoopOutput(x:Record<string,number>) {
  const {value,valueAt4,valueAt20}=x
  const span=currentLoopRange(valueAt4,valueAt20)
  if (!Number.isFinite(value)) throw new Error('Enter a finite engineering value.')
  const fraction=(value-valueAt4)/span
  return currentLoopResults(4+16*fraction,value,fraction)
}

/** Single series loop at a specified positive current; not a nonlinear transmitter solver. */
export function currentLoopBudget(x:Record<string,number>) {
  const {supplyVoltage,transmitterMinimum,current,receiverResistance,wireResistance,otherDrop}=x
  if (![supplyVoltage,transmitterMinimum,current,receiverResistance,wireResistance,otherDrop].every(Number.isFinite) || supplyVoltage<=0 || transmitterMinimum<=0 || current<=0 || receiverResistance<0 || wireResistance<0 || otherDrop<0) throw new Error('Supply, transmitter minimum and current must be positive; resistances and other voltage drop must be nonnegative.')
  const amps=current/1000
  if (amps===0) throw new Error('Current is below the numerical range.')
  const receiverDrop=amps*receiverResistance,wireDrop=amps*wireResistance
  const requiredSupply=transmitterMinimum+receiverDrop+wireDrop+otherDrop
  const voltageMargin=supplyVoltage-requiredSupply
  const transmitterVoltage=supplyVoltage-receiverDrop-wireDrop-otherDrop
  const resistanceHeadroom=voltageMargin/amps
  const receiverPower=receiverDrop*amps,wirePower=wireDrop*amps
  const numbers={receiverDrop,wireDrop,requiredSupply,voltageMargin,transmitterVoltage,resistanceHeadroom,receiverPower,wirePower}
  if (!Object.values(numbers).every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  const budgetStatus=voltageMargin<0 ? 'Insufficient voltage at the requested current' : voltageMargin===0 ? 'At the minimum, with no voltage margin' : 'Positive voltage margin. Other device limits still need checking'
  return {...numbers,budgetStatus}
}

/** Stable FOPDT response to a single step at t=0, initially at equilibrium. */
export function firstOrderResponse(x:Record<string,number>) {
  const {initialValue,gain,inputStep,timeConstant,deadTime,time}=x
  if (![initialValue,gain,inputStep,timeConstant,deadTime,time].every(Number.isFinite)||timeConstant<=0||deadTime<0||time<0) throw new Error('Use finite inputs, a positive time constant, and nonnegative delay and observation time.')
  const finalChange=gain*inputStep,finalValue=initialValue+finalChange
  const elapsed=Math.max(0,time-deadTime),fraction=-Math.expm1(-elapsed/timeConstant)
  const outputValue=initialValue+finalChange*fraction
  // Right-hand derivative at the delay boundary; zero before the delayed step.
  const responseRate=time<deadTime || finalChange===0 ? 0 : (finalChange/timeConstant)*Math.exp(-elapsed/timeConstant)
  const timeTo90=finalChange===0 ? 0 : deadTime+timeConstant*Math.log(10)
  const timeTo95=finalChange===0 ? 0 : deadTime+timeConstant*Math.log(20)
  const timeTo98=finalChange===0 ? 0 : deadTime+timeConstant*Math.log(50)
  const numbers={finalChange,finalValue,outputValue,responseRate,timeTo90,timeTo95,timeTo98}
  if (!Object.values(numbers).every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  return {...numbers,percentResponse:finalChange===0 ? 'Not applicable: zero final change' : 100*fraction,phase:finalChange===0 ? 'No output change' : time<deadTime ? 'Before response delay' : 'Exponential response (rounded at long times)'}
}

/** Two-input first-order law of uncertainty propagation, including covariance. */
export function measurementUncertainty(x:Record<string,number>) {
  const {operation,valueA,valueB,uncertaintyA,uncertaintyB,correlation,coverageFactor}=x
  if(![operation,valueA,valueB,uncertaintyA,uncertaintyB,correlation,coverageFactor].every(Number.isFinite)||![0,1,2,3].includes(operation)||uncertaintyA<0||uncertaintyB<0||Math.abs(correlation)>1||coverageFactor<=0) throw new Error('Choose an operation; use finite estimates, nonnegative standard uncertainties, correlation from −1 to 1, and a positive coverage factor.')
  if(operation===3 && valueB===0) throw new Error('The denominator estimate must be nonzero for division.')
  const estimate=operation===0 ? valueA+valueB : operation===1 ? valueA-valueB : operation===2 ? valueA*valueB : valueA/valueB
  const sensitivityA=operation<2 ? 1 : operation===2 ? valueB : 1/valueB
  const sensitivityB=operation===0 ? 1 : operation===1 ? -1 : operation===2 ? valueA : -estimate/valueB
  const a=sensitivityA*uncertaintyA,b=sensitivityB*uncertaintyB
  // Equivalent to a²+b²+2rab, without squaring large terms or subtracting variances.
  const standardUncertainty=Math.hypot(a+correlation*b,b*Math.sqrt((1-correlation)*(1+correlation)))
  const expandedUncertainty=coverageFactor*standardUncertainty
  const lowerEstimate=estimate-expandedUncertainty,upperEstimate=estimate+expandedUncertainty
  const numbers={estimate,sensitivityA,sensitivityB,standardUncertainty,coverageFactor,expandedUncertainty,lowerEstimate,upperEstimate}
  if(!Object.values(numbers).every(Number.isFinite)) throw new Error('The result or its sensitivity exceeds the numerical range; rescale the input units.')
  // A relative uncertainty is undefined at zero and can overflow for tiny estimates.
  const relative=100*(standardUncertainty/Math.abs(estimate))
  return {...numbers,relativeStandardUncertainty:estimate===0 ? 'Undefined at a zero estimate' : Number.isFinite(relative) ? relative : 'Exceeds numerical range',method:operation<2 ? 'Linear propagation' : 'First-order approximation. Check for nonlinearity'}
}

/** Thermal transport groups using user-supplied scalar properties at a common state. */
export function thermalTransport(x:Record<string,number>) {
  const {density,viscosity,specificHeat,conductivity,speed,length}=x
  if (![density,viscosity,specificHeat,conductivity,speed,length].every(Number.isFinite) || [density,viscosity,specificHeat,conductivity,length].some(value=>value<=0) || speed<0) throw new Error('Use positive density, dynamic viscosity, specific heat, conductivity and length, with nonnegative speed.')
  const kinematicViscosity=viscosity/density
  const thermalDiffusivity=(conductivity/density)/specificHeat
  const reynoldsNumber=(speed*length)/kinematicViscosity
  const prandtlNumber=kinematicViscosity/thermalDiffusivity
  const pecletNumber=(speed*length)/thermalDiffusivity
  const result={kinematicViscosity,thermalDiffusivity,reynoldsNumber,prandtlNumber,pecletNumber}
  if (!Object.values(result).every(Number.isFinite) || kinematicViscosity<=0 || thermalDiffusivity<=0 || prandtlNumber<=0 || (speed>0 && (reynoldsNumber<=0 || pecletNumber<=0))) throw new Error('Inputs exceed the numerical range. Use a consistent, representable property and length scale.')
  return result
}
