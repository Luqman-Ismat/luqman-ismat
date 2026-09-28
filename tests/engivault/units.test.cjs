const {test}=require('node:test'),assert=require('node:assert/strict')
const {unitCategories,convertUnit,convertTemperature}=require('../../.test-engivault/unit-converter-data.js')
const category=id=>unitCategories.find(x=>x.id===id)
const unit=(c,id)=>category(c).units.find(x=>x.id===id)
test('temperature points and intervals have different conversions',()=>{
 assert.ok(Math.abs(convertTemperature(10,unit('temperature','celsius'),unit('temperature','fahrenheit'))-50)<1e-10)
 assert.equal(convertUnit(10,unit('temperature_difference','delta_celsius'),unit('temperature_difference','delta_fahrenheit')),18)
 assert.equal(convertUnit(-10,unit('temperature_difference','delta_celsius'),unit('temperature_difference','delta_kelvin')),-10)
})
test('absorbed and equivalent radiation dose cannot be selected in the same category',()=>{
 for(const c of unitCategories)assert.ok(!(c.units.some(u=>u.id==='Gy')&&c.units.some(u=>u.id==='Sv')))
 assert.equal(convertUnit(1,unit('radiation_dose','Gy'),unit('radiation_dose','rad')),100)
 assert.equal(convertUnit(1,unit('dose_equivalent','Sv'),unit('dose_equivalent','rem')),100)
})

test('area and volume scale by powers of length, with distinct gallon definitions',()=>{
 const c=(n,cat,a,b)=>convertUnit(n,unit(cat,a),unit(cat,b))
 assert.ok(Math.abs(c(1,'area','ft2','in2')-144)<1e-12)
 assert.ok(Math.abs(c(1,'volume','ft3','in3')-1728)<1e-10)
 assert.ok(Math.abs(c(1,'volume','gal_us','in3')-231)<1e-12)
 assert.ok(Math.abs(c(1,'volume','gal_us','L')-3.785411784)<1e-12)
 assert.ok(Math.abs(c(1,'volume','gal_imp','L')-4.54609)<1e-12)
 assert.equal(c(1,'volume','mL','cm3'),1)
})
test('flow factors preserve the volume or mass over one hour without rounded divisors',()=>{
 const c=(n,cat,a,b)=>convertUnit(n,unit(cat,a),unit(cat,b))
 assert.ok(Math.abs(c(60,'flow_volumetric','L_min','L_s')-1)<1e-14)
 assert.ok(Math.abs(c(3600,'flow_volumetric','m3_hr','m3_s')-1)<1e-14)
 assert.ok(Math.abs(c(1,'flow_volumetric','gpm','L_min')-3.785411784)<1e-12)
 assert.ok(Math.abs(c(1,'flow_volumetric','gpm_imp','L_min')-4.54609)<1e-12)
 assert.ok(Math.abs(c(3600,'flow_mass','lb_hr','kg_s')-.45359237)<1e-14)
 assert.ok(Math.abs(c(3.6,'flow_mass','t_hr','kg_s')-1)<1e-14)
})
test('viscosity prefixes and types remain distinct',()=>{
 assert.equal(convertUnit(1,unit('dynamic_viscosity','cP'),unit('dynamic_viscosity','mPa_s')),1)
 assert.equal(convertUnit(1,unit('dynamic_viscosity','poise'),unit('dynamic_viscosity','Pa_s')),.1)
 assert.equal(convertUnit(1,unit('kinematic_viscosity','cSt'),unit('kinematic_viscosity','mm2_s')),1)
 assert.equal(convertUnit(1,unit('kinematic_viscosity','stokes'),unit('kinematic_viscosity','m2_s')),1e-4)
 assert.ok(!category('dynamic_viscosity').units.some(u=>u.id==='cSt'))
 assert.ok(!category('kinematic_viscosity').units.some(u=>u.id==='cP'))
})
test('torr follows the standard atmosphere definition rather than conventional mercury',()=>{
 assert.equal(convertUnit(760,unit('pressure','torr'),unit('pressure','Pa')),101325)
 assert.notEqual(unit('pressure','torr').toBase,unit('pressure','mmHg').toBase)
 assert.ok(Math.abs(convertUnit(1,unit('pressure','psi'),unit('pressure','Pa'))-6894.757)<.001)
})

test('thermal factors agree with NIST rounded reference values',()=>{
 const c=(cat,a,b)=>convertUnit(1,unit(cat,a),unit(cat,b))
 assert.ok(Math.abs(c('thermal_conductivity','Btu_hr_ft_F','W_m_K')-1.730735)<5e-7)
 assert.ok(Math.abs(c('thermal_conductivity','Btu_in_hr_ft2_F','W_m_K')-.1442279)<5e-8)
 assert.ok(Math.abs(c('heat_transfer_coefficient','Btu_hr_ft2_F','W_m2_K')-5.678263)<5e-7)
 assert.ok(Math.abs(c('specific_heat','Btu_lb_F','J_kg_K')-4186.8)<1e-9)
 assert.notEqual(c('specific_heat','cal_th_g_K','J_kg_K'),c('specific_heat','cal_IT_g_K','J_kg_K'))
})
test('thermal conversions preserve a heat balance across SI and US units',()=>{
 const c=(n,cat,a,b)=>convertUnit(n,unit(cat,a),unit(cat,b))
 // Constructed case: k=2 Btu/(h ft F), area=3 ft², drop=18 F, length=0.5 ft.
 const qUS=2*3*18/.5
 const qSI=c(2,'thermal_conductivity','Btu_hr_ft_F','W_m_K')*c(3,'area','ft2','m2')*c(18,'temperature_difference','delta_fahrenheit','delta_kelvin')/c(.5,'length','ft','m')
 assert.ok(Math.abs(qSI-c(qUS,'power','BTU_hr','W'))<1e-9)
 // 2 lb with 1 Btu/(lb F) over 9 F stores 18 Btu, irrespective of unit system.
 const stored=c(2,'mass','lb','kg')*c(1,'specific_heat','Btu_lb_F','J_kg_K')*c(9,'temperature_difference','delta_fahrenheit','delta_kelvin')
 assert.ok(Math.abs(stored-c(18,'energy','BTU','J'))<1e-8)
 assert.ok(Math.abs(c(2,'heat_capacity','Btu_F','J_K')*5-stored)<1e-8)
})
test('angular conversion preserves revolutions and signed unwrapped angle',()=>{
 const c=(n,cat,a,b)=>convertUnit(n,unit(cat,a),unit(cat,b))
 assert.equal(c(1,'angle','revolution','degree'),360)
 assert.ok(Math.abs(c(3600,'angle','arcsecond','degree')-1)<1e-14)
 assert.equal(c(-2,'angle','revolution','degree'),-720)
 assert.ok(Math.abs(c(60,'angular_speed','angular_rpm','rad_s')-2*Math.PI)<1e-14)
 assert.ok(Math.abs(c(1,'angular_speed','rev_s','degree_s')-360)<1e-12)
})

test('Mach is no longer advertised as a fixed velocity unit',()=>{
 assert.ok(!category('velocity').units.some(u=>u.id==='mach'))
 assert.equal(category('velocity').calculator.href,'/calculators/gas-flow-state')
})

test('section units preserve powers of the exact inch and metric prefixes',()=>{
 const c=(n,cat,a,b)=>convertUnit(n,unit(cat,a),unit(cat,b))
 assert.ok(Math.abs(c(1,'second_moment_area','in4','mm4')/25.4**4-1)<1e-14)
 assert.equal(c(1,'second_moment_area','cm4','mm4'),10000)
 assert.ok(Math.abs(c(1,'section_modulus','in3','mm3')/25.4**3-1)<1e-14)
 assert.ok(Math.abs(c(1,'section_modulus','ft3','in3')-1728)<1e-10)
})
