/**
 * Correlations and coefficients: International Association for the Properties of Water and Steam.
 * IAPWS SR6-08(2011), equations 1–3, Tables 1–4, equations 7–8; SR1-86(1992), equations 1–9.
 * https://iapws.org/technical-guidance/release/LiquidWater.download
 * https://iapws.org/public/documents/6dGkr/Supp-sat.pdf
 * IAPWS permits publication with attribution. Original implementation; not IAPWS-certified software.
 */
const R = 461.51805, TR = 10, P0 = 100000
const ag = [-1.661470539e5, 2.708781640e6, -1.557191544e8]
const ng = [4, 5, 7]
const bg = [-.8237426256, 1.908956353, -2.017597384, .8546361348]
const mg = [2, 3, 4, 5]
const av = [6.74458446e3, -2.22521604e5, 1.00231247e8, -1.63552118e9, 8.32299658e9]
const nv = [4, 5, 7, 8, 9]
const bv = [5.78545292e-3, -1.53195665e-2, 3.11337859e-2, -4.23546241e-2, 3.38713507e-2, -1.19946761e-2]
const mv = [1, 2, 3, 4, 5, 6]
const ap = [-7.5245878e-6, -1.3767418e-2, 1.0627293e1, -2.0457795e2, 1.2037414e3]
const np = [1, 3, 5, 6, 7]
const bp = [-3.1091470e-6, 2.8964919e-5, -1.3112763e-4, 3.0410453e-4, -3.9034594e-4, 2.3403117e-4, -4.8510101e-5]
const mp = [1, 3, 4, 5, 6, 7, 9]
function series(c: number[], n: number[], z: number, derivative = 0) {
  return c.reduce((sum, a, i) => sum + a * (derivative === 0 ? 1 : derivative === 1 ? n[i] : n[i] * (n[i] + 1)) * z ** (n[i] + derivative), 0)
}

/** Internal reference correlation, including metastable states for release-table verification. */
export function waterReferenceState(T: number) {
  if (!Number.isFinite(T) || T < 253.15 || T > 383.15) throw new Error('Reference correlation requires 253.15–383.15 K.')
  const alpha = TR / (593 - T), beta = TR / (T - 232), tau = T / TR
  const v0 = R * TR / P0 * (.0193763157 + series(av,nv,alpha) + series(bv,mv,beta))
  const vT0 = R / P0 * (series(av,nv,alpha,1) - series(bv,mv,beta,1))
  const vTT0 = R / (P0 * TR) * (series(av,nv,alpha,2) + series(bv,mv,beta,2))
  const vp0 = R * TR / P0 ** 2 * (series(ap,np,alpha) + series(bp,mp,beta))
  const vpT0 = R / P0 ** 2 * (series(ap,np,alpha,1) - series(bp,mp,beta,1))
  const cp0 = -T * R / TR * (-8.983025854 / tau + series(ag,ng,alpha,2) + series(bg,mg,beta,2))
  const viscosity = 1e-6 * [280.68,511.45,61.131,.45903].reduce((sum,a,i)=>sum+a*(T/300)**[-1.9,-7.7,-19.6,-40][i],0)
  const conductivity = [1.663,-1.7781,1.1567,-.432115].reduce((sum,a,i)=>sum+a*(T/300)**[-1.15,-3.4,-6,-7.6][i],0)
  const soundSpeed = Math.sqrt(-(v0 ** 2) / (vp0 + T * vT0 ** 2 / cp0))
  return { v0, vT0, vTT0, vp0, vpT0, cp0, viscosity, conductivity, soundSpeed }
}

export function waterVaporPressure(T: number) {
  if (!Number.isFinite(T) || T < 273.16 || T > 647.096) throw new Error('Water saturation correlation requires 273.16–647.096 K.')
  const theta = 1 - T / 647.096
  const sum = [-7.85951783,1.84408259,-11.7866497,22.6807411,-15.9618719,1.80122502].reduce((s,a,i)=>s+a*theta**[1,1.5,3,3.5,4,7.5][i],0)
  return 22064000 * Math.exp(647.096 / T * sum)
}

/** Stable liquid branch only, 0.01–110 °C, saturation pressure through 0.3 MPa absolute. */
export function waterProperties(x: Record<string, number>) {
  const { temperature, pressure } = x
  if (!Number.isFinite(temperature) || !Number.isFinite(pressure) || temperature < .01 || temperature > 110 || pressure <= 0 || pressure > 300000) throw new Error('Use water temperature from 0.01 to 110 °C and absolute pressure no greater than 300000 Pa, at or above saturation pressure.')
  // The validated 0.01 °C endpoint can round just below 273.16 K on addition.
  const T = Math.max(273.16, temperature + 273.15), vaporPressure = waterVaporPressure(T)
  if (pressure < vaporPressure) throw new Error('Pressure is below water saturation pressure at this temperature; the stable liquid model does not apply.')
  const r = waterReferenceState(T), dp = pressure - P0
  const specificVolume = r.v0 + r.vp0 * dp
  const specificHeat = r.cp0 - T * r.vTT0 * dp
  const vT = r.vT0 + r.vpT0 * dp
  const vp = r.vp0 + (3.24e-10 * R * TR / P0 ** 3) * dp
  const density = 1 / specificVolume
  const kinematicViscosity = r.viscosity / density
  const thermalDiffusivity = r.conductivity / (density * specificHeat)
  const prandtlNumber = r.viscosity * specificHeat / r.conductivity
  const thermalExpansion = vT / specificVolume
  const compressibility = -vp / specificVolume
  const soundSpeed = Math.sqrt(-(specificVolume ** 2) / (vp + T * vT ** 2 / specificHeat))
  const result = { density, viscosity:r.viscosity, kinematicViscosity, specificHeat, conductivity:r.conductivity, thermalDiffusivity, prandtlNumber, thermalExpansion, compressibility, soundSpeed, vaporPressure, specificVolume }
  if (!Object.values(result).every(Number.isFinite) || density <= 0 || specificHeat <= 0 || soundSpeed <= 0) throw new Error('Water property calculation exceeded its numerical range.')
  return result
}

/** SR1-86(1992) liquid–vapor equilibrium curve; no off-saturation properties. */
export function waterSaturationPressure(x:Record<string,number>) {
  const pressure=waterVaporPressure(x.temperature)
  const theta=1-x.temperature/647.096
  const liquidDensity=322*(1+[1.99274064,1.09965342,-.510839303,-1.75493479,-45.5170352,-6.74694450e5].reduce((sum,b,i)=>sum+b*theta**[1/3,2/3,5/3,16/3,43/3,110/3][i],0))
  const vaporDensity=322*Math.exp([-2.03150240,-2.68302940,-5.38626492,-17.2991605,-44.7586581,-63.9201063].reduce((sum,c,i)=>sum+c*theta**[2/6,4/6,8/6,18/6,37/6,71/6][i],0))
  const T=x.temperature,t=T/647.096
  const a=[-7.85951783,1.84408259,-11.7866497,22.6807411,-15.9618719,1.80122502],powers=[1,1.5,3,3.5,4,7.5]
  const sum=a.reduce((v,c,i)=>v+c*theta**powers[i],0)
  const derivative=a.reduce((v,c,i)=>v+c*powers[i]*theta**(powers[i]-1),0)
  const pressureSlope=pressure*(-647.096*sum/T**2-derivative/T)
  // SR1-86(1992), equations (4)–(9). Keep all printed digits of d_alpha.
  const d1=-5.65134998e-8,d2=2690.66631,d3=127.287297,d4=-135.003439,d5=.981825814
  const alpha=1000*(-1135.905627715+d1*t**-19+d2*t+d3*t**4.5+d4*t**5+d5*t**54.5)
  const phi=1000/647.096*(2319.5246+19/20*d1*t**-20+d2*Math.log(t)+9/7*d3*t**3.5+5/4*d4*t**4+109/107*d5*t**53.5)
  const liquidEnthalpy=alpha+T*pressureSlope/liquidDensity,vaporEnthalpy=alpha+T*pressureSlope/vaporDensity
  const liquidEntropy=phi+pressureSlope/liquidDensity,vaporEntropy=phi+pressureSlope/vaporDensity
  const latentHeat=T*pressureSlope*(1/vaporDensity-1/liquidDensity)
  const result={temperature:T,celsius:T-273.15,pressure,liquidDensity,vaporDensity,liquidSpecificVolume:1/liquidDensity,vaporSpecificVolume:1/vaporDensity,pressureSlope,liquidEnthalpy,vaporEnthalpy,liquidEntropy,vaporEntropy,latentHeat}
  if(!Object.values(result).every(Number.isFinite)) throw new Error('Saturation properties exceed the numerical range.')
  return result
}

export function waterSaturationTemperature(x:Record<string,number>) {
  const {pressure}=x
  if (!Number.isFinite(pressure)||pressure<611.657||pressure>22064000) throw new Error('Use absolute saturation pressure from 611.657 to 22064000 Pa (triple-point to critical-point limits).')
  // The release table rounds triple-point pressure to 611.657 Pa; equation (1)
  // gives ~611.657070 Pa. Accept that published endpoint at the triple temperature.
  let low=273.16,high=647.096
  if (pressure<=waterVaporPressure(low)) high=low
  else if (pressure===22064000) low=high
  else for(let i=0;i<60;i++){
    const middle=(low+high)/2
    if(waterVaporPressure(middle)<pressure) low=middle
    else high=middle
  }
  const temperature=(low+high)/2
  return {...waterSaturationPressure({temperature}),pressure}
}

/** Saturated equilibrium inventory; quality is a vapor mass fraction, not a flow quality. */
function mixtureSaturationState(pressure:number) {
  if(!Number.isFinite(pressure)||pressure<611.657||pressure>=22064000) throw new Error('Use absolute pressure from 611.657 Pa up to, but excluding, 22064000 Pa. Steam quality is undefined at the critical point.')
  const state=waterSaturationTemperature({pressure})
  if(state.temperature>=647.096 || state.vaporEnthalpy<=state.liquidEnthalpy || state.vaporSpecificVolume<=state.liquidSpecificVolume) throw new Error('The liquid and vapor branches cannot be resolved at this pressure; use a pressure farther below the critical point.')
  return state
}

function steamMixture(state:ReturnType<typeof waterSaturationTemperature>,quality:number) {
  if(!Number.isFinite(quality)||quality<0||quality>1) throw new Error('Steam quality must be a vapor mass fraction from 0 to 1; enter 0.9 for 90%.')
  // Explicit endpoints preserve the original phase values without cancellation.
  const blend=(liquid:number,vapor:number)=>quality===0 ? liquid : quality===1 ? vapor : (1-quality)*liquid+quality*vapor
  const specificVolume=blend(state.liquidSpecificVolume,state.vaporSpecificVolume)
  const enthalpy=blend(state.liquidEnthalpy,state.vaporEnthalpy)
  const entropy=blend(state.liquidEntropy,state.vaporEntropy)
  const vaporVolumeFraction=quality*state.vaporSpecificVolume/specificVolume
  const result={pressure:state.pressure,temperature:state.temperature,celsius:state.celsius,quality,moisture:1-quality,vaporVolumeFraction,specificVolume,density:1/specificVolume,enthalpy,entropy,internalEnergy:enthalpy-state.pressure*specificVolume,liquidEnthalpy:state.liquidEnthalpy,vaporEnthalpy:state.vaporEnthalpy,latentHeat:state.latentHeat}
  if(!Object.values(result).every(Number.isFinite)||specificVolume<=0) throw new Error('Steam mixture calculation exceeded its numerical range.')
  return {...result,phase:quality===0 ? 'Saturated liquid' : quality===1 ? 'Saturated vapor' : 'Liquid–vapor mixture'}
}

export function wetSteamProperties(x:Record<string,number>) {
  return steamMixture(mixtureSaturationState(x.pressure),x.quality)
}

export function steamQualityEnthalpy(x:Record<string,number>) {
  const state=mixtureSaturationState(x.pressure)
  if(!Number.isFinite(x.enthalpy)||x.enthalpy<state.liquidEnthalpy||x.enthalpy>state.vaporEnthalpy) throw new Error(`At this pressure, enter enthalpy from ${state.liquidEnthalpy} to ${state.vaporEnthalpy} J/kg using the model's reference convention. Outside this interval the saturated-mixture model does not apply.`)
  const quality=(x.enthalpy-state.liquidEnthalpy)/(state.vaporEnthalpy-state.liquidEnthalpy)
  return steamMixture(state,quality)
}
