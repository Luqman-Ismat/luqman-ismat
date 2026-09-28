/*!
The MIT License (MIT)

Copyright (c) 2018-2020 The PsychroLib Contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
// SI coefficients adapted from PsychroLib commit 3066345dc8cf91bf59134147cf917f982c1fce13.
// ASHRAE 2017 Fundamentals ch. 1 equations 5, 6, 20, 26, 30, 33 and 35.
// Dew/frost point inversion and input limits are Engivault-specific.
export function saturationPressure(temperature: number): number {
  if (!Number.isFinite(temperature) || temperature < -100 || temperature > 200) throw new Error('Saturation temperature must be between -100 and 200 °C.')
  const t = temperature + 273.15
  const ln = temperature <= .01
    ? -5674.5359/t + 6.3925247 - .009677843*t + 6.2215701e-7*t*t + 2.0747825e-9*t**3 - 9.484024e-13*t**4 + 4.1635019*Math.log(t)
    : -5800.2206/t + 1.3914993 - .048640239*t + 4.1764768e-5*t*t - 1.4452093e-8*t**3 + 6.5459673*Math.log(t)
  return Math.exp(ln)
}

export function humidAir(x: Record<string, number>): Record<string, number | string> {
  const {dryBulb, relativeHumidity, pressure} = x
  if (![dryBulb,relativeHumidity,pressure].every(Number.isFinite) || dryBulb < -50 || dryBulb > 80 || relativeHumidity < 0 || relativeHumidity > 100 || pressure < 20000 || pressure > 120000) throw new Error('Use dry-bulb temperature from -50 to 80 °C, relative humidity from 0 to 100 percent, and absolute pressure from 20,000 to 120,000 Pa.')
  const saturationVaporPressure = saturationPressure(dryBulb)
  if (saturationVaporPressure >= pressure) throw new Error('This calculator requires total pressure above saturation vapor pressure at the dry-bulb temperature.')
  const vaporPressure = relativeHumidity/100*saturationVaporPressure
  const humidityRatio = .621945*vaporPressure/(pressure-vaporPressure)
  const specificHumidity = humidityRatio/(1+humidityRatio)
  const enthalpy = (1.006*dryBulb+humidityRatio*(2501+1.86*dryBulb))*1000
  const specificVolume = 287.042*(dryBulb+273.15)*(1+1.607858*humidityRatio)/pressure
  const density = (1+humidityRatio)/specificVolume
  let dewFrostPoint: number | string
  if (vaporPressure === 0) dewFrostPoint = 'Undefined for dry air'
  else if (vaporPressure < saturationPressure(-100)) dewFrostPoint = 'Below −100 °C model limit'
  else {
    let lower = -100, upper = dryBulb
    for(let i=0;i<70;i++) {
      const middle = (lower+upper)/2
      if(saturationPressure(middle)>vaporPressure) upper=middle
      else lower=middle
    }
    dewFrostPoint = (lower+upper)/2
  }
  const numeric = {saturationVaporPressure,vaporPressure,humidityRatio,specificHumidity,enthalpy,specificVolume,density}
  if(!Object.values(numeric).every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  return {...numeric,dewFrostPoint,saturationBasis:dryBulb<=.01?'Ice':'Liquid water'}
}

/** ASHRAE eqs. 33/35 via MIT-licensed PsychroLib, with explicit domain rejection. */
export function humidAirWetBulb(x: Record<string, number>): Record<string, number | string> {
  const { dryBulb, wetBulb, pressure } = x
  const dryState = humidAir({ dryBulb, pressure, relativeHumidity: 0 })
  if (!Number.isFinite(wetBulb) || wetBulb < -50 || wetBulb > dryBulb) {
    throw new Error('Wet-bulb temperature must be at least -50 °C and no greater than dry-bulb temperature.')
  }
  const ps = saturationPressure(wetBulb)
  const ws = .621945 * ps / (pressure - ps)
  const w = wetBulb >= 0
    ? ((2501 - 2.326 * wetBulb) * ws - 1.006 * (dryBulb - wetBulb)) / (2501 + 1.86 * dryBulb - 4.186 * wetBulb)
    : ((2830 - .24 * wetBulb) * ws - 1.006 * (dryBulb - wetBulb)) / (2830 + 1.86 * dryBulb - 2.1 * wetBulb)
  if (!Number.isFinite(w) || w < 0) throw new Error('This dry/wet-bulb pair implies negative moisture content. Check the temperatures and pressure.')
  const pv = pressure * w / (.621945 + w)
  const rh = wetBulb === dryBulb ? 100 : 100 * pv / Number(dryState.saturationVaporPressure)
  if (!Number.isFinite(rh) || rh > 100 + 1e-9) throw new Error('This dry/wet-bulb pair is outside the unsaturated moist-air model.')
  const relativeHumidity = Math.min(100, rh)
  return {
    ...humidAir({ dryBulb, pressure, relativeHumidity }),
    relativeHumidity,
    wetBulbDepression: dryBulb - wetBulb,
    wetBulbBasis: wetBulb >= 0 ? 'Liquid water' : 'Ice',
  }
}

/** Steady adiabatic mixing, no condensate, at a common absolute pressure. */
export function mixHumidAir(x: Record<string, number>): Record<string, number | string> {
  const { dryAirFlow1, dryBulb1, relativeHumidity1, dryAirFlow2, dryBulb2, relativeHumidity2, pressure } = x
  if (![dryAirFlow1, dryAirFlow2].every(Number.isFinite) || dryAirFlow1 < 0 || dryAirFlow2 < 0) {
    throw new Error('Use nonnegative dry-air mass flows in kg/s.')
  }
  const totalDryAirFlow = dryAirFlow1 + dryAirFlow2
  if (!Number.isFinite(totalDryAirFlow) || totalDryAirFlow <= 0) throw new Error('Total dry-air flow must be positive and finite.')
  const first = humidAir({ dryBulb: dryBulb1, relativeHumidity: relativeHumidity1, pressure })
  const second = humidAir({ dryBulb: dryBulb2, relativeHumidity: relativeHumidity2, pressure })
  const stream1DryAirFraction = dryAirFlow1 / totalDryAirFlow
  const average = (key: string) => stream1DryAirFraction * Number(first[key]) + (1 - stream1DryAirFraction) * Number(second[key])
  const w = average('humidityRatio'), h = average('enthalpy')
  // The physical solution is bounded by the inlet temperatures; trim roundoff at an endpoint.
  const dryBulb = Math.min(Math.max(dryBulb1, dryBulb2), Math.max(Math.min(dryBulb1, dryBulb2), (h - 2501000 * w) / (1006 + 1860 * w)))
  const pv = pressure * w / (.621945 + w)
  const rawRh = 100 * pv / saturationPressure(dryBulb)
  if (rawRh > 100 + 1e-8) throw new Error('Mixing predicts supersaturation. Condensation or ice formation must be included; this vapor-only calculation cannot give the final equilibrium state.')
  const relativeHumidity = Math.min(100, rawRh)
  const state = humidAir({ dryBulb, relativeHumidity, pressure })
  const flows = {
    totalDryAirFlow, stream1DryAirFraction, dryBulb, relativeHumidity,
    moistAirFlow: totalDryAirFlow * (1 + Number(state.humidityRatio)),
    vaporMassFlow: totalDryAirFlow * Number(state.humidityRatio),
    volumeFlow: totalDryAirFlow * Number(state.specificVolume),
    enthalpyFlow: totalDryAirFlow * Number(state.enthalpy),
  }
  if (!Object.values(flows).every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  return { ...state, ...flows }
}

/** Uniform sensible processing and ideal cooling with liquid condensate drained at outlet temperature. */
export function airTemperatureProcess(x: Record<string, number>): Record<string, number | string> {
  const { dryAirFlow, inletTemperature, inletRelativeHumidity, outletTemperature, pressure } = x
  if (!Number.isFinite(dryAirFlow) || dryAirFlow <= 0) throw new Error('Dry-air mass flow must be positive and finite.')
  if (!Number.isFinite(outletTemperature) || outletTemperature < 0 || outletTemperature > 80) throw new Error('Use an outlet temperature from 0 to 80 °C. Subfreezing processing requires an ice/frost model.')
  const inlet = humidAir({ dryBulb: inletTemperature, relativeHumidity: inletRelativeHumidity, pressure })
  const saturated = humidAir({ dryBulb: outletTemperature, relativeHumidity: 100, pressure })
  const inletHumidityRatio = Number(inlet.humidityRatio)
  const outletHumidityRatio = Math.min(inletHumidityRatio, Number(saturated.humidityRatio))
  const outletRelativeHumidity = outletHumidityRatio === Number(saturated.humidityRatio) ? 100
    : 100 * pressure * outletHumidityRatio / (.621945 + outletHumidityRatio) / Number(saturated.saturationVaporPressure)
  const outlet = outletTemperature === inletTemperature ? inlet : humidAir({ dryBulb: outletTemperature, relativeHumidity: outletRelativeHumidity, pressure })
  const condensateFlow = dryAirFlow * (inletHumidityRatio - outletHumidityRatio)
  const airEnthalpyReduction = dryAirFlow * (Number(inlet.enthalpy) - Number(outlet.enthalpy))
  const condensateEnthalpyFlow = condensateFlow * 4186 * outletTemperature
  const values = {
    heatRemoved: airEnthalpyReduction - condensateEnthalpyFlow,
    airEnthalpyReduction, condensateEnthalpyFlow, condensateFlow,
    condensateHourly: condensateFlow * 3600,
    inletHumidityRatio, outletHumidityRatio, outletRelativeHumidity,
    inletEnthalpy: Number(inlet.enthalpy), outletEnthalpy: Number(outlet.enthalpy),
    inletVolumeFlow: dryAirFlow * Number(inlet.specificVolume),
    outletVolumeFlow: dryAirFlow * Number(outlet.specificVolume),
  }
  if (!Object.values(values).every(Number.isFinite)) throw new Error('Inputs exceed the numerical range.')
  return { ...values, process: condensateFlow > 0 ? 'Cooling with liquid-water removal' : outletTemperature < inletTemperature ? 'Sensible cooling' : outletTemperature > inletTemperature ? 'Sensible heating' : 'No temperature change' }
}
