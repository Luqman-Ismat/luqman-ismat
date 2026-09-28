export type UnitCategory = {
  id: string
  name: string
  units: Unit[]
  calculator?: {href:string;title:string}
  note?: string
  sources?: { title: string; url: string; accessed: string }[]
}

export type Unit = {
  id: string
  name: string
  symbol: string
  toBase: number // Conversion factor to base unit
  offset?: number // For temperature conversions
}

const nistConversionSource = {title:'NIST SP 811: conversion factors and unit definitions',url:'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8',accessed:'2026-09-08'}
const internationalFoot = 0.3048
const internationalInch = 0.0254
const avoirdupoisPound = 0.45359237
const usLiquidGallon = 0.003785411784
const imperialGallon = 0.00454609
const btuIT = 1055.05585262
const fahrenheitInterval = 5/9
const thermalSources = [nistConversionSource,{title:'NIST SP 811 footnote 9: International Table Btu and calorie definitions',url:'https://www.nist.gov/pml/special-publication-811/nist-guide-si-footnotes',accessed:'2026-09-08'}]

export const unitCategories: UnitCategory[] = [
  {
    id:'second_moment_area',name:'Second Moment of Area',sources:[nistConversionSource],
    note:'Area inertia has length to the fourth power. These units also describe polar area moment, but not mass inertia (kg·m²).',
    calculator:{href:'/calculators/rectangular-section',title:'Calculate rectangular section properties'},
    units:[
      {id:'m4',name:'Metres to the fourth power',symbol:'m⁴',toBase:1},
      {id:'mm4',name:'Millimetres to the fourth power',symbol:'mm⁴',toBase:1e-12},
      {id:'cm4',name:'Centimetres to the fourth power',symbol:'cm⁴',toBase:1e-8},
      {id:'in4',name:'Inches to the fourth power',symbol:'in⁴',toBase:internationalInch**4},
      {id:'ft4',name:'Feet to the fourth power',symbol:'ft⁴',toBase:internationalFoot**4},
    ],
  },
  {
    id:'section_modulus',name:'Section Modulus',sources:[nistConversionSource],
    note:'Elastic section modulus I/c has length cubed; it is not a material volume. Conversion does not select a bending axis or calculate a plastic section modulus.',
    units:[
      {id:'m3',name:'Cubic metres',symbol:'m³',toBase:1},
      {id:'mm3',name:'Cubic millimetres',symbol:'mm³',toBase:1e-9},
      {id:'cm3',name:'Cubic centimetres',symbol:'cm³',toBase:1e-6},
      {id:'in3',name:'Cubic inches',symbol:'in³',toBase:internationalInch**3},
      {id:'ft3',name:'Cubic feet',symbol:'ft³',toBase:internationalFoot**3},
    ],
  },
  {
    id:'thermal_conductivity',name:'Thermal Conductivity',sources:thermalSources,
    note:'Conductivity k is not a heat-transfer coefficient. Temperature units here represent differences, with no offset. Btu means International Table Btu.',
    units:[
      {id:'W_m_K',name:'Watts per metre kelvin',symbol:'W/(m·K)',toBase:1},
      {id:'W_m_C',name:'Watts per metre Celsius difference',symbol:'W/(m·°C)',toBase:1},
      {id:'mW_m_K',name:'Milliwatts per metre kelvin',symbol:'mW/(m·K)',toBase:.001},
      {id:'Btu_hr_ft_F',name:'Btu (IT) per hour foot Fahrenheit difference',symbol:'Btu/(h·ft·°F)',toBase:btuIT/(3600*internationalFoot*fahrenheitInterval)},
      {id:'Btu_in_hr_ft2_F',name:'Btu (IT) inch per hour square foot Fahrenheit difference',symbol:'Btu·in/(h·ft²·°F)',toBase:btuIT*internationalInch/(3600*internationalFoot**2*fahrenheitInterval)},
    ],
  },
  {
    id:'heat_transfer_coefficient',name:'Heat-transfer Coefficient',sources:thermalSources,
    note:'Converts units of a specified coefficient h or U; does not calculate it from flow or geometry. Temperature units are differences. Btu means International Table Btu.',
    units:[
      {id:'W_m2_K',name:'Watts per square metre kelvin',symbol:'W/(m²·K)',toBase:1},
      {id:'W_m2_C',name:'Watts per square metre Celsius difference',symbol:'W/(m²·°C)',toBase:1},
      {id:'kW_m2_K',name:'Kilowatts per square metre kelvin',symbol:'kW/(m²·K)',toBase:1000},
      {id:'Btu_hr_ft2_F',name:'Btu (IT) per hour square foot Fahrenheit difference',symbol:'Btu/(h·ft²·°F)',toBase:btuIT/(3600*internationalFoot**2*fahrenheitInterval)},
    ],
  },
  {
    id:'heat_capacity',name:'Heat Capacity',sources:thermalSources,
    note:'Total heat capacity has units of energy per temperature difference. For a value per unit mass, choose Specific Heat Capacity. No temperature offset is used.',
    units:[
      {id:'J_K',name:'Joules per kelvin',symbol:'J/K',toBase:1},
      {id:'kJ_K',name:'Kilojoules per kelvin',symbol:'kJ/K',toBase:1000},
      {id:'Btu_F',name:'Btu (IT) per Fahrenheit difference',symbol:'Btu/°F',toBase:btuIT/fahrenheitInterval},
      {id:'cal_th_K',name:'Thermochemical calories per kelvin',symbol:'cal(th)/K',toBase:4.184},
    ],
  },
  {
    id:'specific_heat',name:'Specific Heat Capacity',sources:thermalSources,
    note:'Mass-specific heat capacity uses temperature differences. This conversion does not change constant-pressure heat capacity into constant-volume heat capacity, or account for temperature dependence.',
    units:[
      {id:'J_kg_K',name:'Joules per kilogram kelvin',symbol:'J/(kg·K)',toBase:1},
      {id:'kJ_kg_K',name:'Kilojoules per kilogram kelvin',symbol:'kJ/(kg·K)',toBase:1000},
      {id:'J_g_K',name:'Joules per gram kelvin',symbol:'J/(g·K)',toBase:1000},
      {id:'Btu_lb_F',name:'Btu (IT) per pound Fahrenheit difference',symbol:'Btu/(lb·°F)',toBase:btuIT/(avoirdupoisPound*fahrenheitInterval)},
      {id:'cal_th_g_K',name:'Thermochemical calories per gram kelvin',symbol:'cal(th)/(g·K)',toBase:4184},
      {id:'cal_IT_g_K',name:'International Table calories per gram kelvin',symbol:'cal(IT)/(g·K)',toBase:4186.8},
    ],
  },
  {
    id:'angle',name:'Plane Angle',sources:[nistConversionSource],
    note:'Signed angles are scaled without wrapping to one revolution. Degrees here describe angle, not temperature; radians here are not the absorbed-dose unit rad.',
    units:[
      {id:'radian',name:'Radians',symbol:'rad',toBase:1},
      {id:'degree',name:'Degrees of angle',symbol:'°',toBase:Math.PI/180},
      {id:'revolution',name:'Revolutions',symbol:'rev',toBase:2*Math.PI},
      {id:'gon',name:'Gons',symbol:'gon',toBase:Math.PI/200},
      {id:'arcminute',name:'Arcminutes',symbol:'arcmin',toBase:Math.PI/10800},
      {id:'arcsecond',name:'Arcseconds',symbol:'arcsec',toBase:Math.PI/648000},
    ],
  },
  {
    id:'angular_speed',name:'Angular Speed',sources:[nistConversionSource],
    note:'Angular speed ω is in rad/s; cyclic frequency f is in cycles/s (Hz). For one revolution per cycle, ω = 2πf. This does not calculate tangential speed, which also requires a radius.',
    units:[
      {id:'rad_s',name:'Radians per second',symbol:'rad/s',toBase:1},
      {id:'degree_s',name:'Degrees per second',symbol:'°/s',toBase:Math.PI/180},
      {id:'rev_s',name:'Revolutions per second',symbol:'rev/s',toBase:2*Math.PI},
      {id:'angular_rpm',name:'Revolutions per minute',symbol:'rpm',toBase:2*Math.PI/60},
    ],
  },

  {
    id:'area', name:'Area', sources:[nistConversionSource],
    note:'Square foot and square inch use the international foot. Area factors square the length factor.',
    units:[
      {id:'m2',name:'Square metres',symbol:'m²',toBase:1},
      {id:'mm2',name:'Square millimetres',symbol:'mm²',toBase:1e-6},
      {id:'cm2',name:'Square centimetres',symbol:'cm²',toBase:1e-4},
      {id:'ft2',name:'Square international feet',symbol:'ft²',toBase:internationalFoot**2},
      {id:'in2',name:'Square inches',symbol:'in²',toBase:internationalInch**2},
      {id:'hectare',name:'Hectares',symbol:'ha',toBase:10000},
    ],
  },
  {
    id:'volume', name:'Volume', sources:[nistConversionSource,{title:'NIST Handbook 44, Appendix C: liquid gallon equals 231 cubic inches',url:'https://www.nist.gov/system/files/documents/2017/05/09/HB44-07-FullDoc-Rev1-LC.pdf#page=311',accessed:'2026-09-08'}],
    note:'US liquid and imperial gallons differ. Dry measures are not included. These are volumes, not gas volumes normalized to reference conditions.',
    units:[
      {id:'m3',name:'Cubic metres',symbol:'m³',toBase:1},
      {id:'L',name:'Litres',symbol:'L',toBase:.001},
      {id:'mL',name:'Millilitres',symbol:'mL',toBase:1e-6},
      {id:'cm3',name:'Cubic centimetres',symbol:'cm³',toBase:1e-6},
      {id:'ft3',name:'Cubic international feet',symbol:'ft³',toBase:internationalFoot**3},
      {id:'in3',name:'Cubic inches',symbol:'in³',toBase:internationalInch**3},
      {id:'gal_us',name:'Gallons (US liquid)',symbol:'US gal',toBase:usLiquidGallon},
      {id:'gal_imp',name:'Gallons (imperial)',symbol:'imp gal',toBase:imperialGallon},
    ],
  },
  {
    id:'dynamic_viscosity',name:'Dynamic Viscosity',sources:[nistConversionSource],
    note:'Dynamic viscosity μ is separate from kinematic viscosity ν. Converting between them requires density: ν = μ/ρ.',
    units:[
      {id:'Pa_s',name:'Pascal seconds',symbol:'Pa·s',toBase:1},
      {id:'mPa_s',name:'Millipascal seconds',symbol:'mPa·s',toBase:.001},
      {id:'poise',name:'Poise',symbol:'P',toBase:.1},
      {id:'cP',name:'Centipoise',symbol:'cP',toBase:.001},
      {id:'lb_ft_s',name:'Pound mass per foot second',symbol:'lb/(ft·s)',toBase:avoirdupoisPound/internationalFoot},
    ],
  },
  {
    id:'kinematic_viscosity',name:'Kinematic Viscosity',sources:[nistConversionSource],
    note:'Kinematic viscosity ν is separate from dynamic viscosity μ. A centistokes is a square millimetre per second, not a centipoise.',
    units:[
      {id:'m2_s',name:'Square metres per second',symbol:'m²/s',toBase:1},
      {id:'mm2_s',name:'Square millimetres per second',symbol:'mm²/s',toBase:1e-6},
      {id:'stokes',name:'Stokes',symbol:'St',toBase:1e-4},
      {id:'cSt',name:'Centistokes',symbol:'cSt',toBase:1e-6},
      {id:'ft2_s',name:'Square feet per second',symbol:'ft²/s',toBase:internationalFoot**2},
    ],
  },

  // Base Dimensions
  {
    id: "length",
    name: "Length",
    units: [
      { id: "m", name: "Meters", symbol: "m", toBase: 1 },
      { id: "ft", name: "Feet", symbol: "ft", toBase: 0.3048 },
      { id: "in", name: "Inches", symbol: "in", toBase: 0.0254 },
      { id: "mi", name: "Miles", symbol: "mi", toBase: 1609.344 },
      { id: "yd", name: "Yards", symbol: "yd", toBase: 0.9144 },
      { id: "nmi", name: "Nautical Miles", symbol: "nmi", toBase: 1852 },
      { id: "angstrom", name: "Angstroms", symbol: "Å", toBase: 1e-10 },
      { id: "micron", name: "Microns", symbol: "μm", toBase: 1e-6 },
      { id: "ly", name: "Light-years", symbol: "ly", toBase: 9.4607304725808e15 },
      { id: "pc", name: "Parsecs", symbol: "pc", toBase: 3.0856775814913673e16 },
      { id: "furlong", name: "Furlongs", symbol: "fur", toBase: 201.168 },
      { id: "cubit", name: "Cubits (assumed 18 inches)", symbol: "cubit", toBase: 0.4572 },
      { id: "mm", name: "Millimeters", symbol: "mm", toBase: 0.001 },
      { id: "cm", name: "Centimeters", symbol: "cm", toBase: 0.01 },
      { id: "km", name: "Kilometers", symbol: "km", toBase: 1000 },
    ],
  },
  {
    id: "mass",
    name: "Mass",
    units: [
      { id: "kg", name: "Kilograms", symbol: "kg", toBase: 1 },
      { id: "lb", name: "Pounds", symbol: "lb", toBase: 0.45359237 },
      { id: "oz", name: "Ounces", symbol: "oz", toBase: 0.028349523125 },
      { id: "g", name: "Grams", symbol: "g", toBase: 0.001 },
      { id: "tonne", name: "Tonnes (Metric Tons)", symbol: "t", toBase: 1000 },
      { id: "ton_us", name: "Tons (US)", symbol: "ton", toBase: 907.18474 },
      { id: "stone", name: "Stone", symbol: "st", toBase: 6.35029318 },
      { id: "slug", name: "Slugs", symbol: "slug", toBase: 14.593903 },
      { id: "carat", name: "Carats", symbol: "ct", toBase: 0.0002 },
      { id: "mg", name: "Milligrams", symbol: "mg", toBase: 1e-6 },
    ],
  },
  {
    id: "time",
    name: "Time",
    units: [
      { id: "s", name: "Seconds", symbol: "s", toBase: 1 },
      { id: "min", name: "Minutes", symbol: "min", toBase: 60 },
      { id: "hr", name: "Hours", symbol: "hr", toBase: 3600 },
      { id: "day", name: "Days", symbol: "day", toBase: 86400 },
      { id: "week", name: "Weeks", symbol: "week", toBase: 604800 },
      { id: "year", name: "Julian years (365.25 days)", symbol: "yr", toBase: 31557600 },
      { id: "ms", name: "Milliseconds", symbol: "ms", toBase: 0.001 },
      { id: "sidereal_day", name: "Sidereal Days", symbol: "sid day", toBase: 86164.0905 },
      { id: "fortnight", name: "Fortnights", symbol: "fortnight", toBase: 1209600 },
      { id: "us", name: "Microseconds", symbol: "μs", toBase: 1e-6 },
      { id: "ns", name: "Nanoseconds", symbol: "ns", toBase: 1e-9 },
    ],
  },
  {
    id: "temperature",
    name: "Temperature",
    note: "Temperature points include offsets. For a rise or drop, choose Temperature Difference instead. The converter performs scale arithmetic, not a physical-state assessment.",
    units: [
      { id: "celsius", name: "Celsius", symbol: "°C", toBase: 1, offset: 273.15 },
      { id: "fahrenheit", name: "Fahrenheit", symbol: "°F", toBase: 5 / 9, offset: 459.67 },
      { id: "kelvin", name: "Kelvin", symbol: "K", toBase: 1, offset: 0 },
      { id: "rankine", name: "Rankine", symbol: "°R", toBase: 5 / 9, offset: 0 },
      { id: "delisle", name: "Delisle", symbol: "°De", toBase: -2 / 3, offset: 373.15 },
    ],
  },
  // Mechanical & Physics
  {
    id: "force",
    name: "Force",
    units: [
      { id: "N", name: "Newtons", symbol: "N", toBase: 1 },
      { id: "lbf", name: "Pounds-force", symbol: "lbf", toBase: 4.4482216152605 },
      { id: "kgf", name: "Kilograms-force", symbol: "kgf", toBase: 9.80665 },
      { id: "dyne", name: "Dynes", symbol: "dyn", toBase: 1e-5 },
      { id: "poundal", name: "Poundals", symbol: "pdl", toBase: 0.138254954376 },
      { id: "kN", name: "Kilonewtons", symbol: "kN", toBase: 1000 },
      { id: "MN", name: "Meganewtons", symbol: "MN", toBase: 1e6 },
    ],
  },
  {
    id: "pressure",
    name: "Pressure & Stress",
    sources: [nistConversionSource,{title:"OIML D 2: units of measurement, torr definition",url:"https://www.oiml.org/en/publications/documents/en/files/pdf_d/d002-e07.pdf",accessed:"2026-09-08"}],
    note: "Unit scaling preserves the pressure reference. It does not convert gauge pressure to absolute pressure; that requires the local atmospheric pressure. Mercury units use conventional definitions.",
    units: [
      { id: "Pa", name: "Pascals", symbol: "Pa", toBase: 1 },
      { id: "psi", name: "Pounds per square inch", symbol: "psi", toBase: 6894.757293168 },
      { id: "bar", name: "Bar", symbol: "bar", toBase: 100000 },
      { id: "atm", name: "Atmospheres", symbol: "atm", toBase: 101325 },
      { id: "torr", name: "Torr", symbol: "Torr", toBase: 101325/760 },
      { id: "inHg", name: "Inches of Mercury (conventional)", symbol: "inHg", toBase: 3386.389 },
      { id: "mmHg", name: "Millimeters of Mercury (conventional)", symbol: "mmHg", toBase: 133.322387415 },
      { id: "kPa", name: "Kilopascals", symbol: "kPa", toBase: 1000 },
      { id: "MPa", name: "Megapascals", symbol: "MPa", toBase: 1e6 },
      { id: "GPa", name: "Gigapascals", symbol: "GPa", toBase: 1e9 },
    ],
  },
  {
    id: "energy",
    name: "Energy, Work & Heat",
    units: [
      { id: "J", name: "Joules", symbol: "J", toBase: 1 },
      { id: "cal", name: "Calories (thermochemical)", symbol: "cal", toBase: 4.184 },
      { id: "Cal", name: "Calories (nutritional)", symbol: "Cal", toBase: 4184 },
      { id: "BTU", name: "British Thermal Units (International Table)", symbol: "BTU", toBase: 1055.05585262 },
      { id: "kWh", name: "Kilowatt-hours", symbol: "kWh", toBase: 3600000 },
      { id: "eV", name: "Electronvolts", symbol: "eV", toBase: 1.602176634e-19 },
      { id: "ft_lbf", name: "Foot-pounds", symbol: "ft·lbf", toBase: 1.3558179483314004 },
      { id: "erg", name: "Ergs", symbol: "erg", toBase: 1e-7 },
      { id: "kJ", name: "Kilojoules", symbol: "kJ", toBase: 1000 },
      { id: "MJ", name: "Megajoules", symbol: "MJ", toBase: 1e6 },
      { id: "Wh", name: "Watt-hours", symbol: "Wh", toBase: 3600 },
    ],
  },
  {
    id: "power",
    name: "Power",
    units: [
      { id: "W", name: "Watts", symbol: "W", toBase: 1 },
      { id: "hp_mech", name: "Horsepower (mechanical)", symbol: "hp", toBase: 745.69987158227022 },
      { id: "hp_metric", name: "Horsepower (metric)", symbol: "PS", toBase: 735.49875 },
      { id: "ft_lbf_min", name: "Foot-pounds per minute", symbol: "ft·lbf/min", toBase: 0.022596965805523 },
      { id: "BTU_hr", name: "BTUs per hour (International Table)", symbol: "BTU/hr", toBase: 0.29307107017222 },
      { id: "kW", name: "Kilowatts", symbol: "kW", toBase: 1000 },
      { id: "MW", name: "Megawatts", symbol: "MW", toBase: 1e6 },
    ],
  },
  {
    id: "density",
    name: "Density",
    units: [
      { id: "kg_m3", name: "Kilograms per cubic meter", symbol: "kg/m³", toBase: 1 },
      { id: "lb_ft3", name: "Pounds per cubic foot", symbol: "lb/ft³", toBase: 16.018463373960142 },
      { id: "g_cm3", name: "Grams per cubic centimeter", symbol: "g/cm³", toBase: 1000 },
      { id: "kg_L", name: "Kilograms per liter", symbol: "kg/L", toBase: 1000 },
      { id: "g_mL", name: "Grams per milliliter", symbol: "g/mL", toBase: 1000 },
      { id: "lb_gal", name: "Pounds per gallon (US)", symbol: "lb/gal", toBase: 119.826427 },
    ],
  },
  {
    id: "velocity",
    name: "Velocity & Speed",
    note: "Mach is a ratio to the local speed of sound, not a fixed speed unit. Use the gas-state calculator with gas properties and temperature.",
    calculator: {href:"/calculators/gas-flow-state",title:"Calculate speed of sound and Mach"},
    units: [
      { id: "m_s", name: "Meters per second", symbol: "m/s", toBase: 1 },
      { id: "mph", name: "Miles per hour", symbol: "mph", toBase: 0.44704 },
      { id: "kph", name: "Kilometers per hour", symbol: "km/h", toBase: 0.277777777778 },
      { id: "knot", name: "Knots", symbol: "kn", toBase: 0.514444444444 },
      { id: "fps", name: "Feet per second", symbol: "ft/s", toBase: 0.3048 },
      { id: "km_s", name: "Kilometers per second", symbol: "km/s", toBase: 1000 },
      { id: "c", name: "Speed of light", symbol: "c", toBase: 299792458 },
    ],
  },
  {
    id: "flow_volumetric",
    name: "Volumetric Flow Rate",
    sources: [nistConversionSource],
    units: [
      { id: "m3_s", name: "Cubic meters per second", symbol: "m³/s", toBase: 1 },
      {id:"gpm_imp",name:"Gallons per minute (imperial)",symbol:"imp gal/min",toBase:imperialGallon/60},
      { id: "gpm", name: "Gallons per minute (US liquid)", symbol: "GPM", toBase: usLiquidGallon/60 },
      { id: "L_s", name: "Liters per second", symbol: "L/s", toBase: 0.001 },
      { id: "L_min", name: "Liters per minute", symbol: "L/min", toBase: .001/60 },
      { id: "ft3_s", name: "Cubic feet per second", symbol: "ft³/s", toBase: 0.028316846592 },
      { id: "ft3_min", name: "Cubic feet per minute", symbol: "CFM", toBase: internationalFoot**3/60 },
      { id: "m3_hr", name: "Cubic meters per hour", symbol: "m³/hr", toBase: 1/3600 },
    ],
  },
  {
    id: "flow_mass",
    name: "Mass Flow Rate",
    sources: [nistConversionSource],
    units: [
      { id: "kg_s", name: "Kilograms per second", symbol: "kg/s", toBase: 1 },
      { id: "lb_hr", name: "Pounds per hour", symbol: "lb/hr", toBase: avoirdupoisPound/3600 },
      { id: "kg_hr", name: "Kilograms per hour", symbol: "kg/hr", toBase: 1/3600 },
      { id: "g_s", name: "Grams per second", symbol: "g/s", toBase: 0.001 },
      { id: "lb_s", name: "Pounds per second", symbol: "lb/s", toBase: 0.45359237 },
      { id: "t_hr", name: "Tonnes per hour", symbol: "t/hr", toBase: 1000/3600 },
    ],
  },
  {
    id: "torque",
    name: "Torque",
    units: [
      { id: "Nm", name: "Newton-meters", symbol: "N·m", toBase: 1 },
      { id: "ft_lbf_torque", name: "Foot-pounds", symbol: "ft·lbf", toBase: 1.3558179483314004 },
      { id: "in_lbf", name: "Inch-pounds", symbol: "in·lbf", toBase: 0.1129848290276167 },
      { id: "kNm", name: "Kilonewton-meters", symbol: "kN·m", toBase: 1000 },
      { id: "dyne_cm", name: "Dyne-centimeters", symbol: "dyn·cm", toBase: 1e-7 },
    ],
  },
  // Electrical & Magnetic
  {
    id: "voltage",
    name: "Voltage",
    units: [
      { id: "V", name: "Volts", symbol: "V", toBase: 1 },
      { id: "mV", name: "Millivolts", symbol: "mV", toBase: 0.001 },
      { id: "kV", name: "Kilovolts", symbol: "kV", toBase: 1000 },
      { id: "MV", name: "Megavolts", symbol: "MV", toBase: 1e6 },
      { id: "uV", name: "Microvolts", symbol: "μV", toBase: 1e-6 },
    ],
  },
  {
    id: "current",
    name: "Current",
    units: [
      { id: "A", name: "Amperes", symbol: "A", toBase: 1 },
      { id: "mA", name: "Milliamperes", symbol: "mA", toBase: 0.001 },
      { id: "kA", name: "Kiloamperes", symbol: "kA", toBase: 1000 },
      { id: "uA", name: "Microamperes", symbol: "μA", toBase: 1e-6 },
      { id: "nA", name: "Nanoamperes", symbol: "nA", toBase: 1e-9 },
    ],
  },
  {
    id: "resistance",
    name: "Resistance",
    units: [
      { id: "ohm", name: "Ohms", symbol: "Ω", toBase: 1 },
      { id: "mohm", name: "Milliohms", symbol: "mΩ", toBase: 0.001 },
      { id: "kohm", name: "Kiloohms", symbol: "kΩ", toBase: 1000 },
      { id: "Mohm", name: "Megohms", symbol: "MΩ", toBase: 1e6 },
      { id: "Gohm", name: "Gigohms", symbol: "GΩ", toBase: 1e9 },
    ],
  },
  {
    id: "capacitance",
    name: "Capacitance",
    units: [
      { id: "F", name: "Farads", symbol: "F", toBase: 1 },
      { id: "mF", name: "Millifarads", symbol: "mF", toBase: 0.001 },
      { id: "uF", name: "Microfarads", symbol: "μF", toBase: 1e-6 },
      { id: "nF", name: "Nanofarads", symbol: "nF", toBase: 1e-9 },
      { id: "pF", name: "Picofarads", symbol: "pF", toBase: 1e-12 },
    ],
  },
  {
    id: "inductance",
    name: "Inductance",
    units: [
      { id: "H", name: "Henries", symbol: "H", toBase: 1 },
      { id: "mH", name: "Millihenries", symbol: "mH", toBase: 0.001 },
      { id: "uH", name: "Microhenries", symbol: "μH", toBase: 1e-6 },
      { id: "nH", name: "Nanohenries", symbol: "nH", toBase: 1e-9 },
    ],
  },
  {
    id: "charge",
    name: "Electric Charge",
    units: [
      { id: "C", name: "Coulombs", symbol: "C", toBase: 1 },
      { id: "mC", name: "Millicoulombs", symbol: "mC", toBase: 0.001 },
      { id: "uC", name: "Microcoulombs", symbol: "μC", toBase: 1e-6 },
      { id: "nC", name: "Nanocoulombs", symbol: "nC", toBase: 1e-9 },
      { id: "Ah", name: "Ampere-hours", symbol: "Ah", toBase: 3600 },
      { id: "mAh", name: "Milliampere-hours", symbol: "mAh", toBase: 3.6 },
    ],
  },
  {
    id: "resistivity",
    name: "Electrical Resistivity",
    units: [
      { id: "ohm_m", name: "Ohm-meters", symbol: "Ω·m", toBase: 1 },
      { id: "ohm_cm", name: "Ohm-centimeters", symbol: "Ω·cm", toBase: 0.01 },
      { id: "ohm_mm", name: "Ohm-millimeters", symbol: "Ω·mm", toBase: 0.001 },
    ],
  },
  {
    id: "conductivity",
    name: "Electrical Conductivity",
    units: [
      { id: "S_m", name: "Siemens per meter", symbol: "S/m", toBase: 1 },
      { id: "mS_m", name: "Millisiemens per meter", symbol: "mS/m", toBase: 0.001 },
      { id: "uS_cm", name: "Microsiemens per centimeter", symbol: "μS/cm", toBase: 0.0001 },
    ],
  },
  {
    id: "magnetic_flux",
    name: "Magnetic Flux",
    units: [
      { id: "Wb", name: "Webers", symbol: "Wb", toBase: 1 },
      { id: "mWb", name: "Milliwebers", symbol: "mWb", toBase: 0.001 },
      { id: "uWb", name: "Microwebers", symbol: "μWb", toBase: 1e-6 },
      { id: "maxwell", name: "Maxwells", symbol: "Mx", toBase: 1e-8 },
    ],
  },
  {
    id: "magnetic_flux_density",
    name: "Magnetic Flux Density",
    units: [
      { id: "T", name: "Tesla", symbol: "T", toBase: 1 },
      { id: "mT", name: "Millitesla", symbol: "mT", toBase: 0.001 },
      { id: "uT", name: "Microtesla", symbol: "μT", toBase: 1e-6 },
      { id: "G", name: "Gauss", symbol: "G", toBase: 1e-4 },
    ],
  },
  // Light & Radiation
  {
    id: "luminous_flux",
    name: "Luminous Flux",
    units: [
      { id: "lm", name: "Lumens", symbol: "lm", toBase: 1 },
      { id: "klm", name: "Kilolumens", symbol: "klm", toBase: 1000 },
    ],
  },
  {
    id: "illuminance",
    name: "Illuminance",
    units: [
      { id: "lx", name: "Lux", symbol: "lx", toBase: 1 },
      { id: "fc", name: "Foot-candles", symbol: "fc", toBase: 10.76391 },
      { id: "klx", name: "Kilolux", symbol: "klx", toBase: 1000 },
    ],
  },
  {
    id: "luminance",
    name: "Luminance",
    units: [
      { id: "cd_m2", name: "Candela per square meter", symbol: "cd/m²", toBase: 1 },
      { id: "nit", name: "Nits", symbol: "nt", toBase: 1 },
      { id: "fL", name: "Foot-lamberts", symbol: "fL", toBase: 3.426259 },
      { id: "sb", name: "Stilbs", symbol: "sb", toBase: 10000 },
    ],
  },
  {
    id: "wavelength",
    name: "Wavelength",
    units: [
      { id: "nm", name: "Nanometers", symbol: "nm", toBase: 1e-9 },
      { id: "angstrom_wave", name: "Angstroms", symbol: "Å", toBase: 1e-10 },
      { id: "um", name: "Micrometers", symbol: "μm", toBase: 1e-6 },
      { id: "mm_wave", name: "Millimeters", symbol: "mm", toBase: 0.001 },
      { id: "cm_wave", name: "Centimeters", symbol: "cm", toBase: 0.01 },
      { id: "m_wave", name: "Meters", symbol: "m", toBase: 1 },
    ],
  },
  {
    id: "frequency",
    name: "Frequency",
    units: [
      { id: "Hz", name: "Hertz", symbol: "Hz", toBase: 1 },
      { id: "kHz", name: "Kilohertz", symbol: "kHz", toBase: 1000 },
      { id: "MHz", name: "Megahertz", symbol: "MHz", toBase: 1e6 },
      { id: "GHz", name: "Gigahertz", symbol: "GHz", toBase: 1e9 },
      { id: "THz", name: "Terahertz", symbol: "THz", toBase: 1e12 },
      { id: "rpm", name: "Revolutions per minute", symbol: "rpm", toBase: 1 / 60 },
    ],
  },
  {
    id: "radiation_dose",
    name: "Absorbed Radiation Dose",
    units: [
      { id: "Gy", name: "Gray", symbol: "Gy", toBase: 1 },
      { id: "rad", name: "Rad", symbol: "rad", toBase: 0.01 },
      { id: "mGy", name: "Milligray", symbol: "mGy", toBase: 0.001 },
    ],
  },
  {
    id: "dose_equivalent",
    name: "Radiation Dose Equivalent",
    units: [
      { id: "Sv", name: "Sievert", symbol: "Sv", toBase: 1 },
      { id: "rem", name: "Rem", symbol: "rem", toBase: 0.01 },
      { id: "mSv", name: "Millisievert", symbol: "mSv", toBase: 0.001 },
    ],
  },
  {
    id: "temperature_difference",
    name: "Temperature Difference",
    units: [
      {id:"delta_celsius",name:"Celsius difference",symbol:"Δ°C",toBase:1},
      {id:"delta_kelvin",name:"Kelvin difference",symbol:"ΔK",toBase:1},
      {id:"delta_fahrenheit",name:"Fahrenheit difference",symbol:"Δ°F",toBase:5/9},
      {id:"delta_rankine",name:"Rankine difference",symbol:"Δ°R",toBase:5/9},
    ],
  },
]

// Special conversion function for temperature
export function convertTemperature(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit.id === toUnit.id) return value

  // Convert to Kelvin first
  let kelvin: number
  switch (fromUnit.id) {
    case "celsius":
      kelvin = value + 273.15
      break
    case "fahrenheit":
      kelvin = (value + 459.67) * (5 / 9)
      break
    case "kelvin":
      kelvin = value
      break
    case "rankine":
      kelvin = value * (5 / 9)
      break
    case "delisle":
      kelvin = 373.15 - value * (2 / 3)
      break
    default:
      kelvin = value
  }

  // Convert from Kelvin to target unit
  switch (toUnit.id) {
    case "celsius":
      return kelvin - 273.15
    case "fahrenheit":
      return kelvin * (9 / 5) - 459.67
    case "kelvin":
      return kelvin
    case "rankine":
      return kelvin * (9 / 5)
    case "delisle":
      return (373.15 - kelvin) * (3 / 2)
    default:
      return kelvin
  }
}

// Standard conversion function for all other units
export function convertUnit(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit.id === toUnit.id) return value

  // Convert to base unit, then to target unit
  const baseValue = value * fromUnit.toBase
  return baseValue / toUnit.toBase
}
