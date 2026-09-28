const {test}=require('node:test'),assert=require('node:assert/strict')
const {pressureDrop,npsh,pipeSizing}=require('../../.test-engivault/engineering.js')
test('laminar Darcy result matches Hagen–Poiseuille independently',()=>{const x={Q:1e-6,L:10,D:0.01,roughness:0,density:1000,viscosity:0.001};const expected=128*x.viscosity*x.L*x.Q/(Math.PI*x.D**4);assert.ok(Math.abs(pressureDrop(x).pressureDrop-expected)<1e-9)})
test('zero flow has zero pressure loss and finite results',()=>{assert.equal(pressureDrop({Q:0,L:10,D:.1,roughness:0,density:1000,viscosity:.001}).pressureDrop,0)})
test('roughness increases turbulent losses',()=>{const x={Q:.01,L:100,D:.1,roughness:0,density:998,viscosity:.001};assert.ok(pressureDrop({...x,roughness:.001}).pressureDrop>pressureDrop(x).pressureDrop)})
test('NPSH uses reservoir elevation and supplied manufacturer requirement',()=>{const result=npsh({atmosphericPressure:101325,vaporPressure:2300,density:1000,elevation:2,frictionLosses:1,npshRequired:3});assert.ok(Math.abs(result.npshAvailable-(99025/9806.65+1))<1e-10);assert.equal(result.npshMargin,result.npshAvailable-3)})
test('pipe bore meets both velocity and pressure-gradient limits',()=>{const x={flowRate:.05,targetVelocity:2,maxPressureDrop:100,density:998,viscosity:.001,roughness:.000045};const r=pipeSizing(x);assert.ok(r.actualVelocity<=2.000001);assert.ok(r.actualPressureDrop<=100.000001)})
test('invalid dimensions and nonfinite inputs are rejected',()=>{assert.throws(()=>pressureDrop({Q:1,L:1,D:0,roughness:0,density:1,viscosity:1}));assert.throws(()=>pipeSizing({flowRate:NaN}));assert.throws(()=>npsh({density:-1}))})
const {hydrostaticPressure,dynamicPressure}=require('../../.test-engivault/engineering.js')
test('hydrostatic example separates absolute and surface-relative pressure',()=>{assert.deepEqual(hydrostaticPressure({density:1000,depth:10,surfacePressure:101325,gravity:9.80665}),{pressureIncrease:98066.5,absolutePressure:199391.5})})
test('surface pressure shifts absolute pressure without changing hydrostatic increment',()=>{const x={density:800,depth:5,surfacePressure:0,gravity:10};const a=hydrostaticPressure(x),b=hydrostaticPressure({...x,surfacePressure:200000});assert.equal(a.pressureIncrease,b.pressureIncrease);assert.equal(b.absolutePressure-a.absolutePressure,200000)})
test('dynamic pressure matches energy per volume and scales quadratically',()=>{assert.ok(Math.abs(dynamicPressure({density:1.225,velocity:20}).dynamicPressure-245)<1e-10);assert.ok(Math.abs(dynamicPressure({density:1.225,velocity:40}).dynamicPressure-980)<1e-10)})
test('pressure tools reject invalid domain and overflow',()=>{assert.throws(()=>hydrostaticPressure({density:1000,depth:-1,surfacePressure:0,gravity:10}));assert.throws(()=>dynamicPressure({density:1,velocity:-1}));assert.throws(()=>dynamicPressure({density:1e308,velocity:1e308}));assert.throws(()=>hydrostaticPressure({density:1e308,depth:1e308,surfacePressure:0,gravity:10}))})
const {wallConduction}=require('../../.test-engivault/engineering.js')
test('wall conduction example and reversed gradient conserve magnitude',()=>{const x={conductivity:.04,area:10,thickness:.1,temperatureDifference:20};assert.deepEqual(wallConduction(x),{heatRate:80,heatFlux:8,thermalResistance:.25});assert.equal(wallConduction({...x,temperatureDifference:-20}).heatRate,-80);assert.equal(wallConduction({...x,temperatureDifference:0}).heatRate,0)})
test('doubling wall thickness halves conduction and doubles resistance',()=>{const x={conductivity:2,area:3,thickness:.2,temperatureDifference:30};const a=wallConduction(x),b=wallConduction({...x,thickness:.4});assert.equal(a.heatRate/2,b.heatRate);assert.equal(a.thermalResistance*2,b.thermalResistance);assert.throws(()=>wallConduction({...x,thickness:0}))})
const {dcResistor}=require('../../.test-engivault/engineering.js')
test('DC resistor example obeys power balance under reversed polarity',()=>{assert.deepEqual(dcResistor({voltage:12,resistance:100}),{current:.12,power:1.44});assert.deepEqual(dcResistor({voltage:-12,resistance:100}),{current:-.12,power:1.44});assert.equal(dcResistor({voltage:0,resistance:100}).power,0)})
test('DC resistor rejects zero resistance and overflowing outputs',()=>{assert.throws(()=>dcResistor({voltage:12,resistance:0}));assert.throws(()=>dcResistor({voltage:1e308,resistance:1e-308}))})
const {axialBar}=require('../../.test-engivault/engineering.js')
test('axial bar example and compression sign convention',()=>{const x={force:10000,area:.001,length:2,youngModulus:200e9};assert.deepEqual(axialBar(x),{stress:10e6,strain:.00005,extension:.0001});assert.equal(axialBar({...x,force:-10000}).extension,-.0001);assert.equal(axialBar({...x,force:0}).stress,0)})
test('bar extension scales with length but stress does not',()=>{const x={force:500,area:.01,length:2,youngModulus:70e9};const a=axialBar(x),b=axialBar({...x,length:4});assert.equal(b.extension,2*a.extension);assert.equal(b.stress,a.stress);assert.throws(()=>axialBar({...x,area:0}))})
const {idealGasDensity}=require('../../.test-engivault/engineering.js')
test('ideal gas density and volume obey the equation of state',()=>{const x={absolutePressure:90000,absoluteTemperature:300,specificGasConstant:300};assert.deepEqual(idealGasDensity(x),{density:1,specificVolume:1});assert.equal(idealGasDensity({...x,absolutePressure:180000}).density,2);assert.equal(idealGasDensity({...x,absoluteTemperature:600}).density,.5)})
test('ideal gas rejects nonphysical absolute states',()=>{assert.throws(()=>idealGasDensity({absolutePressure:100000,absoluteTemperature:0,specificGasConstant:287}));assert.throws(()=>idealGasDensity({absolutePressure:-1,absoluteTemperature:300,specificGasConstant:287}))})
const {sensibleHeat,linearExpansion}=require('../../.test-engivault/engineering.js')
test('sensible heat example and cooling sign',()=>{assert.deepEqual(sensibleHeat({mass:10,specificHeat:1000,temperatureChange:20}),{heat:200000,heatCapacity:10000});assert.equal(sensibleHeat({mass:10,specificHeat:1000,temperatureChange:-20}).heat,-200000)})
test('free expansion example and temperature reversal',()=>{const x={originalLength:10,coefficient:.000012,temperatureChange:50};assert.ok(Math.abs(linearExpansion(x).lengthChange-.006)<1e-12);assert.ok(Math.abs(linearExpansion({...x,temperatureChange:-50}).finalLength-9.994)<1e-12);assert.throws(()=>linearExpansion({...x,originalLength:0}))})

test('surface convection balances rate, flux and resistance with signed heat flow',()=>{
 const {surfaceConvection}=require('../../.test-engivault/engineering.js')
 const x={coefficient:10,area:2,temperatureDifference:30}
 assert.deepEqual(surfaceConvection(x),{heatRate:600,heatFlux:300,thermalResistance:0.05})
 assert.equal(surfaceConvection({...x,temperatureDifference:-30}).heatRate,-600)
 assert.equal(surfaceConvection({...x,temperatureDifference:0}).heatRate,0)
 assert.throws(()=>surfaceConvection({...x,coefficient:0}))
})
test('radiation benchmark, reciprocity and area scaling',()=>{
 const {enclosureRadiation}=require('../../.test-engivault/engineering.js')
 const x={emissivity:0.8,area:1,surfaceTemperature:400,surroundingsTemperature:300}
 const r=enclosureRadiation(x)
 assert.ok(Math.abs(r.heatRate-793.85241866)<1e-7)
 assert.equal(enclosureRadiation({...x,area:2}).heatRate,2*r.heatRate)
 assert.equal(enclosureRadiation({...x,surfaceTemperature:300,surroundingsTemperature:400}).heatRate,-r.heatRate)
 assert.equal(enclosureRadiation({...x,surfaceTemperature:300}).heatRate,0)
 assert.equal(enclosureRadiation({...x,emissivity:0}).heatRate,0)
})
test('radiation rejects invalid emissivity, kelvin temperatures and numeric overflow',()=>{
 const {enclosureRadiation}=require('../../.test-engivault/engineering.js')
 const x={emissivity:0.8,area:1,surfaceTemperature:400,surroundingsTemperature:300}
 for(const patch of [{emissivity:-0.1},{emissivity:1.1},{surfaceTemperature:-1},{area:0},{surroundingsTemperature:NaN},{surfaceTemperature:1e200}]) assert.throws(()=>enclosureRadiation({...x,...patch}))
})

test('hydraulic numeric overflow is rejected instead of returning nonfinite results',()=>{
 const {pressureDrop,npsh,pipeSizing}=require('../../.test-engivault/engineering.js')
 assert.throws(()=>pressureDrop({Q:1e308,L:1,D:0.1,roughness:0,density:1000,viscosity:0.001}))
 assert.throws(()=>npsh({atmosphericPressure:1e308,vaporPressure:0,density:1e-308,elevation:0,frictionLosses:0,npshRequired:0}))
 assert.throws(()=>pipeSizing({flowRate:1e308,targetVelocity:1,maxPressureDrop:1,density:1000,viscosity:0.001,roughness:0}))
})

test('sound intensity level handles reference, decades and extreme ratios',()=>{
 const {soundIntensityLevel}=require('../../.test-engivault/engineering.js')
 assert.equal(soundIntensityLevel({intensity:1e-12,referenceIntensity:1e-12}).intensityLevel,0)
 assert.equal(soundIntensityLevel({intensity:1e-6,referenceIntensity:1e-12}).intensityLevel,60)
 assert.equal(soundIntensityLevel({intensity:1e-13,referenceIntensity:1e-12}).intensityLevel,-10)
 assert.equal(soundIntensityLevel({intensity:1e300,referenceIntensity:1e-300}).intensityLevel,6000)
 for(const intensity of [0,-1,NaN,Infinity])assert.throws(()=>soundIntensityLevel({intensity,referenceIntensity:1e-12}))
})
test('spherical sound conserves power and drops six decibels when distance doubles',()=>{
 const {sphericalSound}=require('../../.test-engivault/engineering.js')
 const x={acousticPower:0.01,distance:10,referenceIntensity:1e-12}
 const a=sphericalSound(x),b=sphericalSound({...x,distance:20})
 assert.ok(Math.abs(a.intensity*4*Math.PI*100-0.01)<1e-12)
 assert.ok(Math.abs(a.intensityLevel-69.0079013598)<1e-8)
 assert.equal(b.intensity,a.intensity/4)
 assert.ok(Math.abs(a.intensityLevel-b.intensityLevel-6.02059991328)<1e-8)
 assert.throws(()=>sphericalSound({...x,distance:0}))
 assert.throws(()=>sphericalSound({...x,acousticPower:0}))
 assert.throws(()=>sphericalSound({...x,distance:1e300}))
})

test('pump duty converts a pure static lift into hydraulic, shaft and electrical power',()=>{
 const {pumpDuty}=require('../../.test-engivault/engineering.js')
 const x={flowRate:0.01,length:0,diameter:0.1,roughness:0,density:1000,viscosity:0.001,elevationRise:10,pressureDifference:0,lossCoefficient:0,pumpEfficiency:0.5,motorEfficiency:0.8}
 const r=pumpDuty(x)
 assert.equal(r.systemHead,10);assert.equal(r.frictionHead,0);assert.equal(r.fittingHead,0)
 assert.ok(Math.abs(r.hydraulicPower-980.665)<1e-9)
 assert.ok(Math.abs(r.shaftPower-1961.33)<1e-9)
 assert.ok(Math.abs(r.electricalPower-2451.6625)<1e-9)
 const gravity=pumpDuty({...x,elevationRise:-10})
 assert.equal(gravity.pumpHead,0);assert.equal(gravity.surplusHead,10);assert.equal(gravity.electricalPower,0)
 for(const patch of [{pumpEfficiency:0},{motorEfficiency:1.1},{flowRate:0},{lossCoefficient:-1}])assert.throws(()=>pumpDuty({...x,...patch}))
})
test('pump duty combines independent laminar pipe and local-loss benchmarks',()=>{
 const {pumpDuty}=require('../../.test-engivault/engineering.js')
 const x={flowRate:1e-5,length:10,diameter:0.01,roughness:0,density:1000,viscosity:0.01,elevationRise:2,pressureDifference:9806.65,lossCoefficient:2,pumpEfficiency:1,motorEfficiency:1}
 const r=pumpDuty(x),v=4*x.flowRate/(Math.PI*x.diameter**2)
 const pipeHead=128*x.viscosity*x.length*x.flowRate/(Math.PI*x.diameter**4*x.density*9.80665)
 assert.ok(Math.abs(r.frictionHead-pipeHead)<1e-9)
 assert.ok(Math.abs(r.fittingHead-2*v*v/(2*9.80665))<1e-12)
 assert.ok(Math.abs(r.systemHead-(3+pipeHead+r.fittingHead))<1e-9)
 assert.equal(r.flowRegime,'Laminar')
})

test('composite wall balances every layer and both convection films',()=>{
 const {compositeWall}=require('../../.test-engivault/engineering.js')
 const x={area:10,temperature1:300,temperature2:280,film1:10,film2:20,thickness1:.1,conductivity1:1,thickness2:.2,conductivity2:2,thickness3:.3,conductivity3:3}
 const r=compositeWall(x), near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9)
 near(r.resistancePerArea,.45);near(r.heatRate,4000/9)
 const fluxes=[10*(300-r.surface1),(r.surface1-r.interface12)/.1,(r.interface12-r.interface23)/.1,(r.interface23-r.surface2)/.1,20*(r.surface2-280)]
 fluxes.forEach(v=>near(v,r.heatFlux))
 const reversed=compositeWall({...x,temperature1:280,temperature2:300});near(reversed.heatRate,-r.heatRate)
 near(compositeWall({...x,area:20}).heatRate,2*r.heatRate)
})
test('composite wall handles omitted layers and equilibrium, rejects invalid domain',()=>{
 const {compositeWall}=require('../../.test-engivault/engineering.js')
 const x={area:1,temperature1:300,temperature2:300,film1:10,film2:10,thickness1:0,conductivity1:1,thickness2:0,conductivity2:1,thickness3:0,conductivity3:1}
 const r=compositeWall(x);assert.equal(r.heatRate,0);assert.equal(r.surface1,300);assert.equal(r.surface2,300);assert.equal(r.interface12,300)
 for(const patch of [{area:0},{film1:0},{thickness2:-1},{conductivity3:0},{temperature1:-1},{film2:Infinity},{area:1e308,temperature1:1e308}])assert.throws(()=>compositeWall({...x,...patch}))
})

test('humid-air saturation agrees with published PsychroLib ASHRAE reference cases',()=>{
 const {saturationPressure,humidAir}=require('../../.test-engivault/engineering.js')
 for(const [t,p] of [[-20,103.24],[-5,401.74],[5,872.6],[25,3169.7],[50,12351.3]]) assert.ok(Math.abs(saturationPressure(t)/p-1)<.0003)
 const r=humidAir({dryBulb:25,relativeHumidity:100,pressure:101325})
 assert.ok(Math.abs(r.humidityRatio/.020173-1)<.005)
 assert.ok(Math.abs(r.enthalpy/76504-1)<.01)
 assert.ok(Math.abs(r.dewFrostPoint-25)<1e-8)
})
test('humid air preserves phase, mass basis, dry limits and inverse saturation balance',()=>{
 const {humidAir,saturationPressure}=require('../../.test-engivault/engineering.js')
 for(const t of [-50,-20,0,.01,.02,25,80])for(const rh of [1,50,100]){
  const r=humidAir({dryBulb:t,relativeHumidity:rh,pressure:101325})
  assert.ok(r.dewFrostPoint<=t+1e-8)
  assert.ok(Math.abs(saturationPressure(r.dewFrostPoint)/r.vaporPressure-1)<1e-7)
  assert.ok(Math.abs(r.density*r.specificVolume-1-r.humidityRatio)<1e-12)
  assert.equal(r.specificHumidity,r.humidityRatio/(1+r.humidityRatio))
 }
 const dry=humidAir({dryBulb:25,relativeHumidity:0,pressure:101325})
 assert.equal(dry.humidityRatio,0);assert.equal(dry.dewFrostPoint,'Undefined for dry air');assert.equal(dry.enthalpy,25150)
 assert.equal(humidAir({dryBulb:-50,relativeHumidity:1e-20,pressure:101325}).dewFrostPoint,'Below −100 °C model limit')
 const x={dryBulb:25,relativeHumidity:50,pressure:101325}
 for(const patch of [{dryBulb:-51},{dryBulb:81},{relativeHumidity:-1},{relativeHumidity:101},{pressure:0},{pressure:Infinity},{dryBulb:80,pressure:20000}])assert.throws(()=>humidAir({...x,...patch}))
})

test('rectangular beam conserves force and moment for both supports and combined loads',()=>{
 const {rectangularBeam}=require('../../.test-engivault/engineering.js')
 const x={span:3,width:.1,depth:.2,youngModulus:200e9,pointLoad:1000,lineLoad:500}
 for(const support of [0,1]){
  const r=rectangularBeam({...x,support}),loadArm=support===0?1.5:3
  assert.equal(r.leftReaction+r.rightReaction,2500)
  assert.equal(r.fixedReactionMoment+r.rightReaction*3,1000*loadArm+500*3*1.5)
  assert.ok(Math.abs(r.secondMoment-1/15000)<1e-15)
  assert.equal(r.maximumMoment,support===0?1312.5:5250)
 }
})
test('beam deflection matches independent virtual-work integration for four load cases',()=>{
 const {rectangularBeam}=require('../../.test-engivault/engineering.js')
 for(const support of [0,1])for(const point of [true,false]){
  const L=4,P=point?1200:0,q=point?0:300
  const r=rectangularBeam({support,span:L,width:.08,depth:.16,youngModulus:70e9,pointLoad:P,lineLoad:q})
  // Unit-load work at midspan for simple supports, tip for cantilever.
  let integral=0;const n=10000,dx=L/n
  for(let i=0;i<n;i++){
   const x=(i+.5)*dx
   const unit=support===0?Math.min(x,L-x)/2:L-x
   const moment=support===0?(P+q*L)*x/2-q*x*x/2-(x>L/2?P*(x-L/2):0):P*(L-x)+q*(L-x)**2/2
   integral+=moment*unit*dx/r.rigidity
  }
  assert.ok(Math.abs(integral/r.maximumDeflection-1)<1e-7)
 }
})
test('beam dimensions, zero load and invalid support are handled explicitly',()=>{
 const {rectangularBeam}=require('../../.test-engivault/engineering.js')
 const x={support:0,span:3,width:.1,depth:.2,youngModulus:200e9,pointLoad:1000,lineLoad:500}
 const a=rectangularBeam(x),b=rectangularBeam({...x,depth:.4})
 assert.equal(b.maximumBendingStress,a.maximumBendingStress/4);assert.equal(b.maximumDeflection,a.maximumDeflection/8)
 assert.equal(rectangularBeam({...x,pointLoad:0,lineLoad:0}).maximumDeflection,0)
 for(const patch of [{support:2},{support:.5},{depth:0},{youngModulus:-1},{pointLoad:-1},{span:Infinity},{span:1e100}])assert.throws(()=>rectangularBeam({...x,...patch}))
})

test('pipe heat transfer resolves four equal resistances and interface temperatures',()=>{
 const {insulatedPipe}=require('../../.test-engivault/engineering.js')
 // Each resistance per metre is exactly 1 K·m/W in this constructed analytical case.
 const x={length:2,innerDiameter:2,pipeOuterDiameter:2*Math.E,pipeConductivity:1/(2*Math.PI),insulationThickness:Math.E**2-Math.E,insulationConductivity:1/(2*Math.PI),innerFilm:1/(2*Math.PI),outerFilm:1/(2*Math.PI*Math.E**2),fluidTemperature:400,ambientTemperature:300}
 const r=insulatedPipe(x)
 for(const [key,value] of Object.entries({heatRate:50,heatPerLength:25,thermalResistance:2,innerSurface:375,pipeOuterSurface:350,outerSurface:325}))assert.ok(Math.abs(r[key]-value)<1e-10,key)
 assert.ok(Math.abs(r.bareHeatRate-200/(2+Math.E))<1e-10)
 const reversed=insulatedPipe({...x,fluidTemperature:300,ambientTemperature:400})
 assert.equal(reversed.heatRate,-r.heatRate)
 assert.equal(reversed.innerSurface,325);assert.equal(reversed.outerSurface,375)
})
test('pipe heat flow satisfies independently integrated radial conduction and convection balances',()=>{
 const {insulatedPipe}=require('../../.test-engivault/engineering.js')
 const x={length:10,innerDiameter:.02,pipeOuterDiameter:.022,pipeConductivity:380,insulationThickness:.02,insulationConductivity:.04,innerFilm:1000,outerFilm:10,fluidTemperature:333.15,ambientTemperature:293.15}
 const r=insulatedPipe(x)
 const integral=(a,b,k)=>{let sum=0;const n=10000,dr=(b-a)/n;for(let i=0;i<n;i++)sum+=dr/(2*Math.PI*(a+(i+.5)*dr)*k*x.length);return sum}
 const wallR=integral(.01,.011,380),insR=integral(.011,.031,.04)
 for(const q of [(r.innerSurface-r.pipeOuterSurface)/wallR,(r.pipeOuterSurface-r.outerSurface)/insR,x.innerFilm*Math.PI*.02*10*(333.15-r.innerSurface),x.outerFilm*Math.PI*.062*10*(r.outerSurface-293.15)])assert.ok(Math.abs(q/r.heatRate-1)<1e-7)
 const longer=insulatedPipe({...x,length:20});assert.equal(longer.heatRate,2*r.heatRate);assert.equal(longer.outerSurface,r.outerSurface)
 const bare=insulatedPipe({...x,insulationThickness:0});assert.equal(bare.heatRate,bare.bareHeatRate);assert.ok(Math.abs(bare.pipeOuterSurface-bare.outerSurface)<1e-10);assert.equal(bare.magnitudeReduction,0)
 const equilibrium=insulatedPipe({...x,fluidTemperature:293.15});assert.equal(equilibrium.heatRate,0);assert.equal(equilibrium.outerSurface,293.15)
 // For a tiny cylinder below k/h, adding a thin layer can increase heat flow.
 const small=insulatedPipe({...x,innerDiameter:.001,pipeOuterDiameter:.002,insulationThickness:.001})
 assert.ok(small.magnitudeReduction<0)
 for(const patch of [{length:0},{innerDiameter:0},{pipeOuterDiameter:.01},{insulationThickness:-1},{insulationConductivity:0},{pipeConductivity:Infinity},{outerFilm:0},{fluidTemperature:-1},{length:1e308,fluidTemperature:1e308},{pipeOuterDiameter:1e308,insulationThickness:1e308}])assert.throws(()=>insulatedPipe({...x,...patch}))
})

test('liquid valve preserves Kv definition and density and flow scaling',()=>{
 const {liquidValve}=require('../../.test-engivault/engineering.js')
 const x={flowRate:1/3600,density:1000,inletPressure:1000000,outletPressure:900000,vaporPressure:0,criticalPressure:22064000,recoveryFactor:1}
 const r=liquidValve(x);assert.equal(r.kv,1);assert.equal(r.uncorrectedKv,1)
 assert.equal(liquidValve({...x,density:4000}).kv,2)
 assert.equal(liquidValve({...x,flowRate:2/3600}).kv,2)
 assert.ok(Math.abs(liquidValve({...x,flowRate:.005,outletPressure:950000}).kv-18*Math.sqrt(2))<1e-12)
})
test('liquid valve caps sizing differential and distinguishes flashing from choking',()=>{
 const {liquidValve}=require('../../.test-engivault/engineering.js')
 const x={flowRate:.005,density:1000,inletPressure:300000,outletPressure:10000,vaporPressure:3000,criticalPressure:22064000,recoveryFactor:.9}
 const r=liquidValve(x),ff=.96-.28*Math.sqrt(3000/22064000)
 assert.equal(r.chokedPressureDrop,.81*(300000-ff*3000));assert.equal(r.effectivePressureDrop,r.chokedPressureDrop)
 assert.ok(r.kv>r.uncorrectedKv);assert.match(r.regime,/At or above/);assert.match(r.phaseAssessment,/above vapor/)
 const flash=liquidValve({...x,outletPressure:1000});assert.equal(flash.kv,r.kv);assert.match(flash.phaseAssessment,/Flashing indicated/)
 assert.match(liquidValve({...x,outletPressure:3000}).phaseAssessment,/boundary/)
 assert.match(liquidValve({...x,outletPressure:250000}).regime,/cavitation not ruled out/)
 const lowerRecovery=liquidValve({...x,recoveryFactor:.5});assert.ok(lowerRecovery.kv>r.kv)
 for(const patch of [{flowRate:0},{density:0},{inletPressure:1000},{outletPressure:0},{outletPressure:400000},{vaporPressure:-1},{criticalPressure:3000},{recoveryFactor:0},{recoveryFactor:1.01},{density:Infinity},{flowRate:1e308}])assert.throws(()=>liquidValve({...x,...patch}))
})

test('water reference implementation matches all three IAPWS SR6 Table 8 verification states',()=>{
 const {waterReferenceState}=require('../../.test-engivault/engineering.js')
 // Source: IAPWS SR6-08(2011), Table 8. End states are metastable and not exposed by public liquid API.
 const cases=[
  [260,997.068360,4300.17472,-3.86550941e-7,3.27442503e-8,-5.82096820e-13,7.80938294e-15,1324.87258,3058.36075e-6,.515628010],
  [298.15,997.047013,4181.44618,2.58054178e-7,.97202076e-8,-4.53803340e-13,1.00038567e-15,1496.69922,889.996774e-6,.606502308],
  [375,957.009710,4217.74697,7.94706623e-7,.62024104e-8,-5.15666528e-13,-2.27073594e-15,1541.46611,276.207245e-6,.677913788],
 ]
 for(const [T,rho,cp,vT,vTT,vp,vpT,w,mu,k] of cases){const r=waterReferenceState(T);for(const [key,expected] of Object.entries({v0:1/rho,cp0:cp,vT0:vT,vTT0:vTT,vp0:vp,vpT0:vpT,soundSpeed:w,viscosity:mu,conductivity:k}))assert.ok(Math.abs(r[key]/expected-1)<5e-8,T+' '+key)}
})
test('water properties enforce phase and pressure limits and preserve derived-property identities',()=>{
 const {waterProperties,waterVaporPressure}=require('../../.test-engivault/engineering.js')
 assert.ok(Math.abs(waterVaporPressure(273.16)-611.657)<.001)
 assert.ok(Math.abs(waterVaporPressure(373.15)-101417.99666)<.01)
 assert.equal(waterVaporPressure(647.096),22064000)
 for(const temperature of [.01,4,25,80,110]){const r=waterProperties({temperature,pressure:300000});assert.ok(Math.abs(r.density*r.specificVolume-1)<1e-14);assert.ok(Math.abs(r.kinematicViscosity/r.thermalDiffusivity/r.prandtlNumber-1)<1e-14)}
 const x={temperature:25,pressure:100000},a=waterProperties(x),b=waterProperties({...x,pressure:300000})
 assert.ok(Math.abs(b.density/(1/(1/997.047013-4.53803340e-13*200000))-1)<5e-8)
 assert.ok(Math.abs(b.specificHeat/(4181.44618-298.15*.97202076e-8*200000)-1)<5e-8)
 assert.ok(b.density>a.density);assert.ok(waterProperties({temperature:.01,pressure:100000}).thermalExpansion<0)
 for(const patch of [{temperature:0},{temperature:111},{temperature:110,pressure:100000},{pressure:0},{pressure:300001},{pressure:Infinity},{temperature:NaN}])assert.throws(()=>waterProperties({...x,...patch}))
})
test('temperature-coupled water pipe loss agrees with laminar analytical balance and rejects phase crossing',()=>{
 const {waterPipeLoss}=require('../../.test-engivault/engineering.js')
 const x={temperature:20,inletPressure:200000,flowRate:1e-5,length:10,diameter:.02,roughness:0}
 const r=waterPipeLoss(x),expected=128*r.viscosity*10*1e-5/(Math.PI*.02**4)
 assert.ok(Math.abs(r.pressureDrop/expected-1)<1e-12);assert.equal(r.outletPressure,200000-r.pressureDrop)
 assert.ok(waterPipeLoss({...x,temperature:80}).pressureDrop<r.pressureDrop)
 assert.throws(()=>waterPipeLoss({...x,inletPressure:3000,flowRate:.01}))
})

test('AC load power preserves triangle, leading sign and balanced line-to-phase relation',()=>{
 const {acPower}=require('../../.test-engivault/engineering.js')
 const x={phases:3,voltage:400,current:10,powerFactor:.8,reactiveDirection:0}
 const a=acPower(x),b=acPower({...x,reactiveDirection:1})
 assert.ok(Math.abs(a.activePower-5542.562584220407)<1e-9);assert.equal(a.reactivePower,-b.reactivePower)
 assert.ok(Math.abs(Math.hypot(a.activePower,a.reactivePower)/a.apparentPower-1)<1e-14)
 const perPhase=acPower({...x,phases:1,voltage:400/Math.sqrt(3)})
 assert.ok(Math.abs(3*perPhase.activePower-a.activePower)<1e-9)
 assert.equal(acPower({...x,current:0}).apparentPower,0);assert.equal(acPower({...x,powerFactor:1}).reactivePower,0)
 for(const patch of [{phases:2},{powerFactor:1.1},{current:-1},{reactiveDirection:2},{voltage:Infinity},{voltage:1e308,current:1e308}])assert.throws(()=>acPower({...x,...patch}))
})
test('series RLC matches a 3-4-5 impedance case and independent time-averaged power',()=>{
 const {seriesRlc}=require('../../.test-engivault/engineering.js')
 const x={voltage:100,frequency:1/(2*Math.PI),resistance:4,inductance:4,capacitance:1}
 const r=seriesRlc(x)
 for(const [key,expected] of Object.entries({reactance:3,impedance:5,current:20,powerFactor:.8,activePower:1600,reactivePower:1200,apparentPower:2000,resistorVoltage:80,inductorVoltage:80,capacitorVoltage:20}))assert.ok(Math.abs(r[key]-expected)<1e-10,key)
 let mean=0;const n=10000,phi=r.phaseAngle*Math.PI/180
 for(let i=0;i<n;i++){const t=2*Math.PI*(i+.5)/n;mean+=Math.SQRT2*x.voltage*Math.cos(t)*Math.SQRT2*r.current*Math.cos(t-phi)/n}
 assert.ok(Math.abs(mean-r.activePower)<1e-8)
 assert.ok(Math.abs(Math.hypot(r.resistorVoltage,r.inductorVoltage-r.capacitorVoltage)-x.voltage)<1e-10)
})
test('series RLC handles capacitive sign, resonance and omitted components',()=>{
 const {seriesRlc}=require('../../.test-engivault/engineering.js')
 const x={voltage:100,frequency:1/(2*Math.PI),resistance:2,inductance:4,capacitance:.25}
 const r=seriesRlc(x);assert.equal(r.reactance,0);assert.equal(r.current,50);assert.equal(r.powerFactor,1);assert.equal(r.inductorVoltage,200);assert.equal(r.capacitorVoltage,200)
 assert.ok(seriesRlc({...x,inductance:0}).reactivePower<0)
 const ohmic=seriesRlc({...x,inductance:0,capacitance:0});assert.equal(ohmic.current,50);assert.equal(ohmic.resonanceFrequency,'No LC pair')
 assert.equal(seriesRlc({...x,voltage:0}).activePower,0)
 for(const patch of [{resistance:0},{frequency:0},{capacitance:-1},{inductance:-1},{voltage:Infinity},{frequency:1e308}])assert.throws(()=>seriesRlc({...x,...patch}))
})

test('wet bulb matches upstream warm and subfreezing benchmark moisture ratios',()=>{
 const {humidAirWetBulb}=require('../../.test-engivault/engineering.js')
 // PsychroLib 2.5.0 SI tests, MIT licensed; relative tolerance includes rounded reference values.
 for(const [dryBulb,wetBulb,expected] of [[30,25,.0192281274241096],[-1,-5,.00120399819933844]]){
  const r=humidAirWetBulb({dryBulb,wetBulb,pressure:95461})
  assert.ok(Math.abs(r.humidityRatio/expected-1)<.0003)
  assert.ok(r.relativeHumidity>0&&r.relativeHumidity<100)
  assert.equal(r.wetBulbBasis,wetBulb<0?'Ice':'Liquid water')
 }
})
test('wet bulb satisfies adiabatic saturation energy balance for water and ice',()=>{
 const {humidAirWetBulb,saturationPressure}=require('../../.test-engivault/engineering.js')
 for(const [td,tw] of [[30,25],[-1,-5],[5,-1],[5,0]]){
  const p=101325,r=humidAirWetBulb({dryBulb:td,wetBulb:tw,pressure:p})
  const ps=saturationPressure(tw),ws=.621945*ps/(p-ps)
  const makeupEnthalpy=tw>=0?4.186*tw:-329+2.1*tw
  const finalEnthalpy=1.006*tw+ws*(2501+1.86*tw)
  assert.ok(Math.abs(r.enthalpy/1000+(ws-r.humidityRatio)*makeupEnthalpy-finalEnthalpy)<1e-10)
 }
})
test('wet bulb preserves saturation and rejects inconsistent states',()=>{
 const {humidAirWetBulb,humidAir}=require('../../.test-engivault/engineering.js')
 for(const t of [-50,-1,0,.01,25,80]){
  const r=humidAirWetBulb({dryBulb:t,wetBulb:t,pressure:120000})
  assert.equal(r.relativeHumidity,100);assert.equal(r.wetBulbDepression,0)
  assert.equal(r.humidityRatio,humidAir({dryBulb:t,relativeHumidity:100,pressure:120000}).humidityRatio)
 }
 const x={dryBulb:30,wetBulb:25,pressure:95461}
 for(const change of [{dryBulb:25,wetBulb:0},{wetBulb:31},{wetBulb:-51},{wetBulb:NaN},{wetBulb:-30},{dryBulb:81},{pressure:0},{dryBulb:80,pressure:20000}])assert.throws(()=>humidAirWetBulb({...x,...change}))
})

test('air mixing preserves dry-air, water and energy balances without averaging RH',()=>{
 const {mixHumidAir,humidAir}=require('../../.test-engivault/engineering.js')
 const x={dryAirFlow1:1,dryBulb1:10,relativeHumidity1:60,dryAirFlow2:3,dryBulb2:25,relativeHumidity2:50,pressure:101325}
 const a=humidAir({dryBulb:10,relativeHumidity:60,pressure:x.pressure}),b=humidAir({dryBulb:25,relativeHumidity:50,pressure:x.pressure}),r=mixHumidAir(x)
 assert.equal(r.totalDryAirFlow,4)
 assert.ok(Math.abs(r.vaporMassFlow-(a.humidityRatio+3*b.humidityRatio))<1e-12)
 assert.ok(Math.abs(r.enthalpyFlow-(a.enthalpy+3*b.enthalpy))<1e-8)
 assert.ok(Math.abs(r.moistAirFlow-(4+r.vaporMassFlow))<1e-12)
 assert.ok(Math.abs(r.volumeFlow/r.specificVolume-4)<1e-12)
 assert.ok(Math.abs(r.relativeHumidity-52.5)>1)
 const reversed=mixHumidAir({...x,dryAirFlow1:3,dryBulb1:25,relativeHumidity1:50,dryAirFlow2:1,dryBulb2:10,relativeHumidity2:60})
 assert.ok(Math.abs(r.dryBulb-reversed.dryBulb)<1e-12)
 assert.ok(Math.abs(r.humidityRatio-reversed.humidityRatio)<1e-12)
})
test('air mixing limiting cases and invalid or condensing mixtures',()=>{
 const {mixHumidAir}=require('../../.test-engivault/engineering.js')
 const x={dryAirFlow1:1,dryBulb1:10,relativeHumidity1:0,dryAirFlow2:1,dryBulb2:30,relativeHumidity2:0,pressure:101325}
 const r=mixHumidAir(x);assert.equal(r.dryBulb,20);assert.equal(r.vaporMassFlow,0);assert.equal(r.enthalpyFlow,40240)
 assert.equal(mixHumidAir({...x,dryAirFlow1:0}).dryBulb,30)
 assert.ok(Math.abs(mixHumidAir({...x,dryBulb1:30,relativeHumidity1:100,relativeHumidity2:100}).relativeHumidity-100)<1e-12)
 for(const change of [{dryAirFlow1:-1},{dryAirFlow1:0,dryAirFlow2:0},{dryAirFlow1:Infinity},{relativeHumidity1:101},{pressure:0},{dryBulb1:0,relativeHumidity1:100,relativeHumidity2:100}])assert.throws(()=>mixHumidAir({...x,...change}))
})
test('air mixing agrees with the ASHRAE chart example after inlet volume-to-dry-mass conversion',()=>{
 const {mixHumidAir,humidAir,humidAirWetBulb}=require('../../.test-engivault/engineering.js')
 const pressure=101325,a=humidAirWetBulb({dryBulb:4,wetBulb:2,pressure}),b=humidAir({dryBulb:25,relativeHumidity:50,pressure})
 const r=mixHumidAir({dryAirFlow1:2/a.specificVolume,dryBulb1:4,relativeHumidity1:a.relativeHumidity,dryAirFlow2:6.25/b.specificVolume,dryBulb2:25,relativeHumidity2:50,pressure})
 assert.ok(Math.abs(r.dryBulb-19.5)<.2)
})

test('air temperature process conserves moisture and includes condensate energy',()=>{
 const {airTemperatureProcess,humidAir}=require('../../.test-engivault/engineering.js')
 const x={dryAirFlow:2,inletTemperature:30,inletRelativeHumidity:50,outletTemperature:10,pressure:101325}
 const r=airTemperatureProcess(x)
 assert.equal(r.outletRelativeHumidity,100);assert.ok(r.condensateFlow>0)
 assert.ok(Math.abs(2*r.inletHumidityRatio-(2*r.outletHumidityRatio+r.condensateFlow))<1e-14)
 assert.ok(Math.abs(2*r.inletEnthalpy-(2*r.outletEnthalpy+r.condensateEnthalpyFlow+r.heatRemoved))<1e-8)
 assert.equal(r.condensateEnthalpyFlow,r.condensateFlow*4186*10)
 assert.ok(r.heatRemoved<r.airEnthalpyReduction)
 assert.equal(r.outletHumidityRatio,humidAir({dryBulb:10,relativeHumidity:100,pressure:101325}).humidityRatio)
})
test('air heating and dry cooling keep moisture and use moist-air sensible capacity',()=>{
 const {airTemperatureProcess}=require('../../.test-engivault/engineering.js')
 const x={dryAirFlow:1,inletTemperature:25,inletRelativeHumidity:30,outletTemperature:40,pressure:101325}
 for(const t of [20,25,40]){
  const r=airTemperatureProcess({...x,outletTemperature:t})
  assert.equal(r.condensateFlow,0);assert.equal(r.inletHumidityRatio,r.outletHumidityRatio)
  assert.ok(Math.abs(r.heatRemoved-(1006+1860*r.inletHumidityRatio)*(25-t))<1e-8)
  if(t===25)assert.equal(r.heatRemoved,0)
 }
 const dry=airTemperatureProcess({...x,inletRelativeHumidity:0,outletTemperature:0})
 assert.equal(dry.heatRemoved,25150);assert.equal(dry.outletRelativeHumidity,0)
 for(const change of [{dryAirFlow:0},{dryAirFlow:-1},{dryAirFlow:Infinity},{outletTemperature:-1},{outletTemperature:81},{outletTemperature:NaN},{inletRelativeHumidity:101},{pressure:0},{outletTemperature:80,pressure:20000}])assert.throws(()=>airTemperatureProcess({...x,...change}))
})
test('cooling example agrees with ASHRAE rounded chart quantities within one percent',()=>{
 const {airTemperatureProcess,humidAir}=require('../../.test-engivault/engineering.js')
 const inlet=humidAir({dryBulb:30,relativeHumidity:50,pressure:101325})
 const r=airTemperatureProcess({dryAirFlow:5/inlet.specificVolume,inletTemperature:30,inletRelativeHumidity:50,outletTemperature:10,pressure:101325})
 const chartEstimate=5/.877*((64.3-29.5)-(.0133-.00766)*42.02)*1000
 assert.ok(Math.abs(r.heatRemoved/chartEstimate-1)<.01)
})


test('shaft stress field integrates to applied torque and stored energy',()=>{
 const {shaftTorsion}=require('../../.test-engivault/engineering.js')
 const x={outerDiameter:.05,innerDiameter:.03,length:1,shearModulus:80e9,torque:500,speed:1500},r=shaftTorsion(x)
 let moment=0,energy=0
 const dr=(.025-.015)/10000
 for(let i=0;i<10000;i++){
  const radius=.015+(i+.5)*dr,area=2*Math.PI*radius*dr
  const stress=x.shearModulus*radius*r.twistRadians/x.length
  moment+=stress*radius*area
  energy+=stress*stress/(2*x.shearModulus)*area*x.length
 }
 assert.ok(Math.abs(moment/x.torque-1)<1e-8)
 assert.ok(Math.abs(energy/r.strainEnergy-1)<1e-8)
 assert.ok(Math.abs(r.power-25000*Math.PI)<1e-8)
})
test('shaft torsion solid limit, diameter scaling and signed reversal',()=>{
 const {shaftTorsion}=require('../../.test-engivault/engineering.js')
 const x={outerDiameter:2,innerDiameter:0,length:1,shearModulus:1,torque:Math.PI/2,speed:0},r=shaftTorsion(x)
 assert.equal(r.polarMoment,Math.PI/2);assert.equal(r.twistRadians,1);assert.equal(r.maximumShearStress,1);assert.equal(r.power,0)
 const doubled=shaftTorsion({...x,outerDiameter:4})
 assert.equal(doubled.twistRadians,1/16);assert.equal(doubled.maximumShearStress,1/8)
 const reverse=shaftTorsion({...x,torque:-x.torque,speed:60})
 assert.equal(reverse.twistRadians,-1);assert.equal(reverse.maximumShearStress,1);assert.equal(reverse.strainEnergy,r.strainEnergy);assert.ok(reverse.power<0)
 const zero=shaftTorsion({...x,torque:0});assert.equal(zero.strainEnergy,0);assert.equal(zero.maximumShearStress,0)
})
test('shaft torsion rejects invalid geometry and non-finite or underflowed sections',()=>{
 const {shaftTorsion}=require('../../.test-engivault/engineering.js')
 const x={outerDiameter:.05,innerDiameter:.03,length:1,shearModulus:80e9,torque:500,speed:1500}
 for(const change of [{innerDiameter:.05},{innerDiameter:-1},{length:0},{shearModulus:0},{torque:NaN},{speed:Infinity},{outerDiameter:1e-100,innerDiameter:0},{outerDiameter:1e100}])assert.throws(()=>shaftTorsion({...x,...change}))
 assert.ok(shaftTorsion({...x,innerDiameter:.05-1e-12}).polarMoment>0)
})

test('gas stagnation state satisfies energy, equation of state and entropy identities',()=>{
 const {gasFlowState}=require('../../.test-engivault/engineering.js')
 const x={absolutePressure:101325,absoluteTemperature:288.15,specificGasConstant:287.05,heatCapacityRatio:1.4,speed:500},r=gasFlowState(x)
 assert.ok(Math.abs(r.specificHeat*(r.stagnationTemperature-x.absoluteTemperature)-x.speed*x.speed/2)<1e-8)
 assert.ok(Math.abs(r.stagnationPressure/(r.stagnationDensity*x.specificGasConstant*r.stagnationTemperature)-1)<1e-12)
 const entropyChange=r.specificHeat*Math.log(r.temperatureRatio)-x.specificGasConstant*Math.log(r.pressureRatio)
 assert.ok(Math.abs(entropyChange)<1e-10)
 assert.ok(r.stagnationPressureRise>r.dynamicPressure)
})
test('gas stagnation sonic benchmark, rest and low-Mach limits',()=>{
 const {gasFlowState}=require('../../.test-engivault/engineering.js')
 const x={absolutePressure:1,absoluteTemperature:1,specificGasConstant:.5,heatCapacityRatio:2,speed:1},r=gasFlowState(x)
 assert.equal(r.mach,1);assert.equal(r.temperatureRatio,1.5);assert.equal(r.pressureRatio,2.25);assert.equal(r.densityRatio,1.5)
 const rest=gasFlowState({...x,speed:0});assert.equal(rest.stagnationPressureRise,0);assert.equal(rest.stagnationTemperature,1);assert.equal(rest.pressureRatio,1)
 const slow=gasFlowState({...x,speed:1e-8});assert.ok(slow.stagnationPressureRise>0);assert.ok(Math.abs(slow.stagnationPressureRise/slow.dynamicPressure-1)<1e-12)
 const hot=gasFlowState({...x,absoluteTemperature:4});assert.equal(hot.soundSpeed/r.soundSpeed,2);assert.equal(hot.mach/r.mach,.5)
})
test('gas state rejects impossible inputs and non-finite derived quantities',()=>{
 const {gasFlowState}=require('../../.test-engivault/engineering.js')
 const x={absolutePressure:101325,absoluteTemperature:288.15,specificGasConstant:287.05,heatCapacityRatio:1.4,speed:100}
 for(const change of [{absolutePressure:0},{absoluteTemperature:0},{specificGasConstant:0},{heatCapacityRatio:1},{heatCapacityRatio:NaN},{speed:-1},{speed:Infinity},{speed:1e308}])assert.throws(()=>gasFlowState({...x,...change}))
})

test('normal shock matches analytical Mach 2 ratios and loses total pressure',()=>{
 const {normalShock}=require('../../.test-engivault/engineering.js')
 const r=normalShock({absolutePressure:101325,absoluteTemperature:288.15,specificGasConstant:287.05,heatCapacityRatio:1.4,upstreamMach:2})
 const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`)
 close(r.downstreamMach,Math.sqrt(1/3));close(r.pressureRatio,4.5);close(r.densityRatio,8/3);close(r.temperatureRatio,27/16)
 close(r.stagnationPressureRatio,0.7208738614847455)
 assert.ok(r.entropyIncrease>0 && r.stagnationPressureLoss>0)
})
test('normal shock independently conserves mass momentum and total enthalpy',()=>{
 const {normalShock}=require('../../.test-engivault/engineering.js')
 const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`)
 for(const g of [1.2,1.4,5/3])for(const m of [1,1.01,2,5]){
  const p=85000,t=250,R=300,rho=p/(R*t),cp=g*R/(g-1)
  const r=normalShock({absolutePressure:p,absoluteTemperature:t,specificGasConstant:R,heatCapacityRatio:g,upstreamMach:m})
  close(rho*r.upstreamSpeed,r.downstreamDensity*r.downstreamSpeed)
  close(p+rho*r.upstreamSpeed**2,r.downstreamPressure+r.downstreamDensity*r.downstreamSpeed**2)
  close(cp*t+r.upstreamSpeed**2/2,cp*r.downstreamTemperature+r.downstreamSpeed**2/2)
  close(r.downstreamPressure,r.downstreamDensity*R*r.downstreamTemperature)
  close(r.downstreamMach,r.downstreamSpeed/Math.sqrt(g*R*r.downstreamTemperature))
  close(r.entropyIncrease,cp*Math.log(r.downstreamTemperature/t)-R*Math.log(r.downstreamPressure/p))
  assert.ok(r.downstreamMach<=1 && r.stagnationPressureRatio<=1)
 }
})
test('normal shock handles sonic limit scaling and rejects invalid states',()=>{
 const {normalShock}=require('../../.test-engivault/engineering.js')
 const x={absolutePressure:100000,absoluteTemperature:300,specificGasConstant:287,heatCapacityRatio:1.4,upstreamMach:1}
 const r=normalShock(x);assert.equal(r.pressureRatio,1);assert.equal(r.downstreamMach,1);assert.equal(r.stagnationPressureRatio,1);assert.equal(r.stagnationPressureLoss,0)
 const a=normalShock({...x,upstreamMach:2}),b=normalShock({...x,upstreamMach:2,absolutePressure:200000})
 assert.equal(b.downstreamPressure,2*a.downstreamPressure);assert.equal(b.stagnationPressureRatio,a.stagnationPressureRatio)
 for(const c of [{upstreamMach:.9},{upstreamMach:NaN},{upstreamMach:1e308},{absolutePressure:0},{absoluteTemperature:0},{specificGasConstant:0},{heatCapacityRatio:1},{heatCapacityRatio:Infinity}])assert.throws(()=>normalShock({...x,...c}))
})

test('section moments agree with independent numerical area integration',()=>{
 const {rectangularSection,circularSection}=require('../../.test-engivault/engineering.js')
 const close=(a,b,tol=1e-4)=>assert.ok(Math.abs(a/b-1)<tol,`${a} != ${b}`)
 // Integrate the four non-overlapping walls using midpoint area elements.
 const b=.1,h=.2,bi=.08,hi=.18,r=rectangularSection({width:b,height:h,innerWidth:bi,innerHeight:hi})
 let area=0,ix=0,iy=0
 const panels=[[-b/2,-bi/2,-h/2,h/2],[bi/2,b/2,-h/2,h/2],[-bi/2,bi/2,-h/2,-hi/2],[-bi/2,bi/2,hi/2,h/2]]
 for(const [x0,x1,y0,y1] of panels){const n=200,dx=(x1-x0)/n,dy=(y1-y0)/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=x0+(i+.5)*dx,y=y0+(j+.5)*dy,da=dx*dy;area+=da;ix+=y*y*da;iy+=x*x*da}}
 close(r.area,area);close(r.secondMomentX,ix);close(r.secondMomentY,iy)
 // Integrate an annulus in polar coordinates without invoking its closed-form inertia.
 const c=circularSection({outerDiameter:.05,innerDiameter:.03});area=0;ix=0;iy=0
 const dr=(.025-.015)/200,dt=2*Math.PI/360
 for(let i=0;i<200;i++)for(let j=0;j<360;j++){const rad=.015+(i+.5)*dr,angle=(j+.5)*dt,da=rad*dr*dt;area+=da;ix+=(rad*Math.sin(angle))**2*da;iy+=(rad*Math.cos(angle))**2*da}
 close(c.area,area);close(c.secondMomentX,ix);close(c.secondMomentY,iy)
})
test('section properties preserve solid limits rotation and dimensional scaling',()=>{
 const {rectangularSection,circularSection}=require('../../.test-engivault/engineering.js')
 const close=(a,b)=>assert.ok(Math.abs(a/b-1)<1e-12)
 const x={width:2,height:4,innerWidth:0,innerHeight:0},r=rectangularSection(x)
 close(r.area,8);close(r.secondMomentX,32/3);close(r.sectionModulusX,16/3);close(r.radiusOfGyrationX,4/Math.sqrt(12))
 const turn=rectangularSection({width:4,height:2,innerWidth:0,innerHeight:0});close(turn.secondMomentX,r.secondMomentY)
 const bigger=rectangularSection({width:4,height:8,innerWidth:0,innerHeight:0});close(bigger.area,4*r.area);close(bigger.secondMomentX,16*r.secondMomentX);close(bigger.sectionModulusX,8*r.sectionModulusX);close(bigger.radiusOfGyrationX,2*r.radiusOfGyrationX)
 const c=circularSection({outerDiameter:2,innerDiameter:0});close(c.area,Math.PI);close(c.secondMomentX,Math.PI/4);close(c.polarAreaMoment,Math.PI/2)
})
test('section geometry rejects ambiguous holes and numerical overflow or underflow',()=>{
 const {rectangularSection,circularSection}=require('../../.test-engivault/engineering.js')
 const x={width:1,height:1,innerWidth:0,innerHeight:0}
 for(const c of [{innerWidth:.5},{innerWidth:1,innerHeight:.5},{height:0},{width:NaN},{width:1e308},{width:1e-200,height:1e-200}])assert.throws(()=>rectangularSection({...x,...c}))
 for(const x of [{outerDiameter:1,innerDiameter:1},{outerDiameter:0,innerDiameter:0},{outerDiameter:1,innerDiameter:-1},{outerDiameter:1e308,innerDiameter:0},{outerDiameter:1e-200,innerDiameter:0}])assert.throws(()=>circularSection(x))
 assert.ok(rectangularSection({width:1,height:1,innerWidth:1-1e-12,innerHeight:1-1e-12}).area>0)
 assert.ok(circularSection({outerDiameter:1,innerDiameter:1-1e-12}).secondMomentX>0)
})

test('section beam matches virtual-work integration and static equilibrium',()=>{
 const {sectionBeam}=require('../../.test-engivault/engineering.js')
 for(const support of [0,1]){
  const x={support,span:3,secondMoment:2e-5,extremeDistance:.1,youngModulus:200e9,pointLoad:1000,lineLoad:500},r=sectionBeam(x),L=x.span,n=10000,dx=L/n
  let deflection=0
  for(let j=0;j<n;j++){
   const z=(j+.5)*dx
   const M=support===1?x.pointLoad*(L-z)+x.lineLoad*(L-z)**2/2:(x.pointLoad+x.lineLoad*L)/2*z-x.lineLoad*z*z/2-x.pointLoad*Math.max(0,z-L/2)
   const unitMoment=support===1?L-z:Math.min(z,L-z)/2
   deflection+=M*unitMoment*dx/(x.youngModulus*x.secondMoment)
  }
  assert.ok(Math.abs(r.maximumDeflection/deflection-1)<1e-7)
  assert.equal(r.leftReaction+r.rightReaction,r.totalLoad)
  assert.ok(Math.abs(r.rightReaction*L+r.fixedReactionMoment-x.pointLoad*(support?L:L/2)-x.lineLoad*L*L/2)<1e-10)
  assert.ok(Math.abs(r.maximumBendingStress/(r.maximumMoment*x.extremeDistance/x.secondMoment)-1)<1e-12)
  assert.ok(!('maximumShearStress' in r))
 }
})
test('section beam preserves solid rectangle results and geometry scaling',()=>{
 const {sectionBeam,rectangularBeam,rectangularSection}=require('../../.test-engivault/engineering.js')
 for(const support of [0,1]){
  const x={support,span:3,width:.1,depth:.2,youngModulus:200e9,pointLoad:1000,lineLoad:500},old=rectangularBeam(x)
  const r=sectionBeam({...x,secondMoment:old.secondMoment,extremeDistance:x.depth/2})
  for(const key of ['maximumDeflection','maximumMoment','maximumBendingStress','maximumShear'])assert.ok(Math.abs(r[key]/old[key]-1)<1e-12)
 }
 const x={support:0,span:3,secondMoment:2e-5,extremeDistance:.1,youngModulus:200e9,pointLoad:1000,lineLoad:500},a=sectionBeam(x),b=sectionBeam({...x,secondMoment:4e-5})
 assert.equal(b.maximumDeflection,a.maximumDeflection/2);assert.equal(b.maximumBendingStress,a.maximumBendingStress/2)
 const zero=sectionBeam({...x,pointLoad:0,lineLoad:0});assert.equal(zero.maximumDeflection,0)
 for(const c of [{secondMoment:0},{extremeDistance:0},{extremeDistance:NaN},{pointLoad:-1},{youngModulus:1e308,secondMoment:1e308}])assert.throws(()=>sectionBeam({...x,...c}))
})
test('geometry handoff preserves axes and rejects incomplete or nonfinite URL values',()=>{
 const {readSectionTransfer,sectionBeamHref}=require('../../.test-engivault/section-transfer.js')
 const r={secondMomentX:2e-5,secondMomentY:7e-6,centroidX:.05,centroidY:.1}
 for(const axis of ['X','Y']){
  const q=new URL(sectionBeamHref(r,axis),'https://engivault.com').searchParams,t=readSectionTransfer(q)
  assert.equal(Number(t.secondMoment),r['secondMoment'+axis]);assert.equal(Number(t.extremeDistance),r[axis==='X'?'centroidY':'centroidX'])
  assert.equal(Object.keys(t).length,2)
 }
 assert.equal(readSectionTransfer(new URLSearchParams()),null)
 for(const q of ['secondMoment=1','secondMoment=1&extremeDistance=0','secondMoment=NaN&extremeDistance=1','secondMoment=1&secondMoment=2&extremeDistance=1','secondMoment=1e999&extremeDistance=1'])assert.throws(()=>readSectionTransfer(new URLSearchParams(q)))
})

const {currentLoopScale,currentLoopOutput}=require('../../.test-engivault/engineering.js')
test('4–20 mA scale matches an independently specified temperature calibration table',()=>{
 const range={valueAt4:-50,valueAt20:150}
 for(const [current,value,percentSpan] of [[4,-50,0],[8,0,25],[12,50,50],[16,100,75],[20,150,100]]){
  const r=currentLoopScale({...range,current});assert.equal(r.value,value);assert.equal(r.percentSpan,percentSpan)
  assert.equal(currentLoopOutput({...range,value}).current,current)
 }
})
test('current-loop inverse supports reversed scales, unit changes and out-of-range readings without clipping',()=>{
 for(const range of [{valueAt4:100,valueAt20:-100},{valueAt4:0,valueAt20:1e6},{valueAt4:273.15,valueAt20:373.15}]){
  for(const current of [-1,0,3.6,4,7.25,12,20,21,24]){
   const r=currentLoopScale({...range,current}),back=currentLoopOutput({...range,value:r.value})
   assert.ok(Math.abs(back.current-current)<1e-10)
   assert.match(r.rangeStatus,current<4?/Below/:current>20?/Above/:/Within/)
  }
 }
 assert.equal(currentLoopScale({valueAt4:0,valueAt20:100,current:0}).value,-25)
 assert.equal(currentLoopOutput({valueAt4:0,valueAt20:100,value:125}).current,24)
})
test('current-loop scaling rejects degenerate ranges, nonfinite data and numeric overflow',()=>{
 for(const fn of [currentLoopScale,currentLoopOutput]){
  for(const bad of [{valueAt20:0},{valueAt4:NaN},{valueAt20:Infinity},{valueAt4:-1e308,valueAt20:1e308}]) assert.throws(()=>fn({current:12,value:50,valueAt4:0,valueAt20:100,...bad}))
 }
 assert.throws(()=>currentLoopScale({current:Infinity,valueAt4:0,valueAt20:100}))
 assert.throws(()=>currentLoopScale({current:1e308,valueAt4:0,valueAt20:1e308}))
 assert.throws(()=>currentLoopOutput({value:NaN,valueAt4:0,valueAt20:100}))
 assert.throws(()=>currentLoopOutput({value:1e308,valueAt4:0,valueAt20:1e-308}))
})

const {currentLoopBudget}=require('../../.test-engivault/engineering.js')
const loopBudgetExample={supplyVoltage:24,transmitterMinimum:12,current:20,receiverResistance:250,wireResistance:100,otherDrop:1}
test('current-loop voltage budget matches hand calculation and Kirchhoff balance',()=>{
 const r=currentLoopBudget(loopBudgetExample)
 assert.equal(r.receiverDrop,5);assert.equal(r.wireDrop,2);assert.equal(r.requiredSupply,20);assert.equal(r.voltageMargin,4);assert.equal(r.transmitterVoltage,16);assert.equal(r.resistanceHeadroom,200)
 assert.equal(r.receiverPower,.1);assert.equal(r.wirePower,.04)
 assert.equal(r.transmitterVoltage+r.receiverDrop+r.wireDrop+loopBudgetExample.otherDrop,24)
 for(const current of [4,12,20,22]){
  const q=currentLoopBudget({...loopBudgetExample,current})
  assert.ok(Math.abs(q.receiverPower+q.wirePower+.001*current*(q.transmitterVoltage+1)-24*.001*current)<1e-12)
 }
})
test('current-loop budget identifies zero and negative margin without inventing achievable current',()=>{
 assert.match(currentLoopBudget({...loopBudgetExample,supplyVoltage:20}).budgetStatus,/no voltage margin/)
 const r=currentLoopBudget({...loopBudgetExample,supplyVoltage:18})
 assert.equal(r.voltageMargin,-2);assert.equal(r.resistanceHeadroom,-100);assert.match(r.budgetStatus,/Insufficient/)
 assert.equal('actualCurrent' in r,false)
 const zero=currentLoopBudget({...loopBudgetExample,wireResistance:0,receiverResistance:0,otherDrop:0})
 assert.equal(zero.requiredSupply,12);assert.equal(zero.receiverPower,0)
 const twice=currentLoopBudget({...loopBudgetExample,current:40}),once=currentLoopBudget(loopBudgetExample)
 assert.equal(twice.receiverDrop,2*once.receiverDrop);assert.equal(twice.receiverPower,4*once.receiverPower)
})
test('current-loop budget rejects nonphysical inputs and numerical range failures',()=>{
 for(const key of Object.keys(loopBudgetExample)) assert.throws(()=>currentLoopBudget({...loopBudgetExample,[key]:NaN}))
 for(const key of ['current','supplyVoltage','transmitterMinimum']) assert.throws(()=>currentLoopBudget({...loopBudgetExample,[key]:0}))
 for(const key of ['wireResistance','receiverResistance','otherDrop']) assert.throws(()=>currentLoopBudget({...loopBudgetExample,[key]:-1}))
 assert.throws(()=>currentLoopBudget({...loopBudgetExample,current:5e-324}))
 assert.throws(()=>currentLoopBudget({...loopBudgetExample,current:1e308,receiverResistance:1e308}))
})

const {firstOrderResponse}=require('../../.test-engivault/engineering.js')
const fopdt={initialValue:20,gain:2,inputStep:10,timeConstant:30,deadTime:5,time:35}
test('first-order response obeys initial, delayed and one-time-constant limits',()=>{
 for(const time of [0,4,5]) assert.equal(firstOrderResponse({...fopdt,time}).outputValue,20)
 const r=firstOrderResponse(fopdt)
 assert.ok(Math.abs(r.outputValue-32.64241117657115)<1e-12)
 assert.ok(Math.abs(r.percentResponse-63.212055882855765)<1e-12)
 assert.equal(r.finalValue,40)
 assert.equal(firstOrderResponse({...fopdt,time:4}).responseRate,0)
 assert.equal(firstOrderResponse({...fopdt,time:5}).responseRate,20/30)
 for(const [key,fraction] of [['timeTo90',.9],['timeTo95',.95],['timeTo98',.98]]) assert.ok(Math.abs(firstOrderResponse({...fopdt,time:r[key]}).outputValue-(20+20*fraction))<1e-12)
})
test('first-order solution agrees with independent forward integration of its ODE',()=>{
 for(const gain of [-2,2]){
  const dt=.001,tau=30,target=20+gain*10;let y=20
  for(let i=0;i<30000;i++) y+=dt*(target-y)/tau
  const r=firstOrderResponse({...fopdt,gain})
  assert.ok(Math.abs(y-r.outputValue)<.0002)
  assert.ok(Math.abs(tau*r.responseRate+r.outputValue-target)<1e-12)
 }
 const zero=firstOrderResponse({...fopdt,gain:0});assert.equal(zero.outputValue,20);assert.equal(zero.timeTo98,0);assert.equal(zero.responseRate,0);assert.match(zero.percentResponse,/Not applicable/)
})
test('first-order response rejects invalid domains and nonfinite results',()=>{
 for(const key of Object.keys(fopdt)) assert.throws(()=>firstOrderResponse({...fopdt,[key]:NaN}))
 for(const bad of [{timeConstant:0},{deadTime:-1},{time:-1},{gain:1e308,inputStep:1e308},{timeConstant:1e308}]) assert.throws(()=>firstOrderResponse({...fopdt,...bad}))
 assert.equal(firstOrderResponse({...fopdt,time:1e308}).outputValue,40)
})

const {waterSaturationPressure,waterSaturationTemperature}=require('../../.test-engivault/water-properties.js')
test('saturation tools reproduce IAPWS release table pressures at their printed precision',()=>{
 for(const [temperature,pressure,tolerance] of [[273.16,611.657,.0005],[373.1243,101325,.1],[647.096,22064000,1e-6]]){
  assert.ok(Math.abs(waterSaturationPressure({temperature}).pressure-pressure)<=tolerance)
 }
 assert.equal(waterSaturationTemperature({pressure:611.657}).temperature,273.16)
 assert.equal(waterSaturationTemperature({pressure:22064000}).temperature,647.096)
 assert.ok(Math.abs(waterSaturationTemperature({pressure:101325}).temperature-373.1243)<.0001)
})
test('saturation inversion is monotonic and round trips throughout the phase boundary',()=>{
 let last=0
 for(let i=0;i<=100;i++){
  const temperature=273.16+i*(647.096-273.16)/100
  const r=waterSaturationPressure({temperature});assert.ok(r.pressure>last);last=r.pressure
  assert.ok(Math.abs(waterSaturationTemperature({pressure:r.pressure}).temperature-temperature)<1e-10)
 }
})
test('saturation tools reject outside the liquid-vapor domain and nonfinite values',()=>{
 for(const temperature of [273.15,647.097,0,NaN,Infinity]) assert.throws(()=>waterSaturationPressure({temperature}))
 for(const pressure of [0,611.656,22064001,NaN,Infinity]) assert.throws(()=>waterSaturationTemperature({pressure}))
})

test('saturated phase densities match IAPWS printed verification values',()=>{
 for(const [temperature,liquid,vapor,ltol,vtol] of [[273.16,999.789,.00485426,.0005,5e-9],[373.1243,958.365,.597586,.0005,5e-7],[647.096,322,322,0,0]]){
  const r=waterSaturationPressure({temperature})
  assert.ok(Math.abs(r.liquidDensity-liquid)<=ltol,`${temperature}: liquid ${r.liquidDensity}`)
  assert.ok(Math.abs(r.vaporDensity-vapor)<=vtol,`${temperature}: vapor ${r.vaporDensity}`)
  assert.equal(r.liquidSpecificVolume,1/r.liquidDensity);assert.equal(r.vaporSpecificVolume,1/r.vaporDensity)
 }
})
test('saturation phase densities stay positive, ordered and consistent under pressure inversion',()=>{
 for(let i=0;i<=100;i++){
  const r=waterSaturationPressure({temperature:273.16+i*(647.096-273.16)/100})
  assert.ok(r.liquidDensity>=r.vaporDensity && r.vaporDensity>0)
  const back=waterSaturationTemperature({pressure:r.pressure})
  assert.ok(Math.abs(back.liquidDensity/r.liquidDensity-1)<1e-10)
  assert.ok(Math.abs(back.vaporDensity/r.vaporDensity-1)<1e-10)
 }
})

test('saturated enthalpy and entropy agree with IAPWS Table 1 within its displayed resolution',()=>{
 for(const [temperature,hf,hg,sf,sg,htol,stol] of [[373.1243,419050,2675700,1307,7354,50,1],[647.096,2086600,2086600,4410,4410,50,.5]]){
  const r=waterSaturationPressure({temperature})
  assert.ok(Math.abs(r.liquidEnthalpy-hf)<(temperature===373.1243 ? 5 : htol));assert.ok(Math.abs(r.vaporEnthalpy-hg)<htol)
  assert.ok(Math.abs(r.liquidEntropy-sf)<stol);assert.ok(Math.abs(r.vaporEntropy-sg)<stol)
 }
 const r=waterSaturationPressure({temperature:273.16})
 assert.ok(Math.abs(r.liquidEnthalpy-.611786)<.000001,`triple point h ${r.liquidEnthalpy}`)
 assert.ok(Math.abs(r.liquidEntropy)<.0001)
 assert.ok(Math.abs(r.vaporEnthalpy-2500500)<50)
 assert.ok(Math.abs(r.vaporEntropy-9154)<.5)
})
test('saturation energy properties satisfy Clapeyron and agree with numerical pressure derivatives',()=>{
 for(const temperature of [280,350,450,550,640]){
  const r=waterSaturationPressure({temperature}),dt=.001
  const slope=(waterSaturationPressure({temperature:temperature+dt}).pressure-waterSaturationPressure({temperature:temperature-dt}).pressure)/(2*dt)
  assert.ok(Math.abs(slope/r.pressureSlope-1)<1e-7)
  assert.ok(Math.abs((r.vaporEnthalpy-r.liquidEnthalpy)/r.latentHeat-1)<1e-12)
  assert.ok(Math.abs(temperature*(r.vaporEntropy-r.liquidEntropy)/r.latentHeat-1)<1e-12)
  assert.ok(r.latentHeat>0)
 }
 const critical=waterSaturationPressure({temperature:647.096})
 assert.equal(critical.latentHeat,0);assert.equal(critical.liquidEnthalpy,critical.vaporEnthalpy);assert.equal(critical.liquidEntropy,critical.vaporEntropy)
})

const {wetSteamProperties,steamQualityEnthalpy}=require('../../.test-engivault/water-properties.js')
test('wet steam mixture conserves mass, volume and energy for a separate-phase inventory',()=>{
 const pressure=101325,liquidMass=2,vaporMass=3,mass=liquidMass+vaporMass
 const phase=waterSaturationTemperature({pressure}),r=wetSteamProperties({pressure,quality:vaporMass/mass})
 const volume=liquidMass/phase.liquidDensity+vaporMass/phase.vaporDensity
 assert.ok(Math.abs(r.density-mass/volume)<1e-12)
 assert.ok(Math.abs(r.specificVolume-volume/mass)<1e-12)
 assert.ok(Math.abs(r.enthalpy*mass-(liquidMass*phase.liquidEnthalpy+vaporMass*phase.vaporEnthalpy))<1e-8)
 assert.ok(Math.abs(r.entropy*mass-(liquidMass*phase.liquidEntropy+vaporMass*phase.vaporEntropy))<1e-10)
 assert.ok(Math.abs(r.internalEnergy*mass+pressure*volume-r.enthalpy*mass)<1e-8)
 assert.ok(Math.abs(r.vaporVolumeFraction-(vaporMass/phase.vaporDensity)/volume)<1e-12)
 assert.equal(r.moisture,.4);assert.ok(r.vaporVolumeFraction>.999)
 // Independent rounded IAPWS Table 1 phase enthalpies at approximately one atmosphere.
 assert.ok(Math.abs(r.enthalpy-(.4*419050+.6*2675700))<20)
 assert.equal(r.phase,'Liquid–vapor mixture')
})
test('wet steam endpoints reproduce pure saturated phases and inverse quality endpoints exactly',()=>{
 for(const pressure of [611.657,101325,1e6,20e6]){
  const phase=waterSaturationTemperature({pressure})
  for(const quality of [0,1]){
   const r=wetSteamProperties({pressure,quality}),prefix=quality ? 'vapor' : 'liquid'
   assert.equal(r.specificVolume,phase[prefix+'SpecificVolume']);assert.equal(r.enthalpy,phase[prefix+'Enthalpy']);assert.equal(r.entropy,phase[prefix+'Entropy'])
   assert.equal(r.vaporVolumeFraction,quality);assert.equal(r.moisture,1-quality)
   assert.equal(steamQualityEnthalpy({pressure,enthalpy:r.enthalpy}).quality,quality)
  }
 }
})
test('steam quality inversion and mixture monotonicity hold over pressure and quality ranges',()=>{
 for(const pressure of [1000,10000,101325,1e6,10e6,22e6,22063999]){
  let previousH=-Infinity,previousDensity=Infinity
  for(let i=0;i<=20;i++){
   const quality=i/20,r=wetSteamProperties({pressure,quality})
   assert.ok(r.enthalpy>previousH);assert.ok(r.density<previousDensity)
   assert.ok(r.vaporVolumeFraction>=quality && r.vaporVolumeFraction<=1)
   assert.ok(Math.abs(steamQualityEnthalpy({pressure,enthalpy:r.enthalpy}).quality-quality)<1e-10)
   previousH=r.enthalpy;previousDensity=r.density
  }
 }
})
test('steam mixtures reject critical, invalid and off-saturation enthalpy inputs without clamping',()=>{
 for(const pressure of [0,611.656,22064000,22064001,NaN,Infinity,undefined]){
  assert.throws(()=>wetSteamProperties({pressure,quality:.5}));assert.throws(()=>steamQualityEnthalpy({pressure,enthalpy:2e6}))
 }
 for(const quality of [-.001,1.001,90,NaN,Infinity,undefined]) assert.throws(()=>wetSteamProperties({pressure:101325,quality}))
 const phase=waterSaturationTemperature({pressure:101325})
 for(const enthalpy of [phase.liquidEnthalpy-1,phase.vaporEnthalpy+1,NaN,Infinity,undefined]) assert.throws(()=>steamQualityEnthalpy({pressure:101325,enthalpy}))
})

const {measurementUncertainty}=require('../../.test-engivault/engineering.js')
const uncertaintyExample={operation:2,valueA:10,valueB:2,uncertaintyA:.1,uncertaintyB:.02,correlation:0,coverageFactor:2}
test('uncertainty propagation gives analytic sum, difference, product and ratio results',()=>{
 const expected=[[12,Math.hypot(.1,.02)], [8,Math.hypot(.1,.02)], [20,Math.sqrt(.08)], [5,Math.sqrt(.005)]]
 for(let operation=0;operation<4;operation++){
  const r=measurementUncertainty({...uncertaintyExample,operation})
  assert.equal(r.estimate,expected[operation][0]);assert.ok(Math.abs(r.standardUncertainty-expected[operation][1])<1e-14)
  assert.equal(r.expandedUncertainty,2*r.standardUncertainty)
  assert.equal(r.lowerEstimate,r.estimate-r.expandedUncertainty);assert.equal(r.upperEstimate,r.estimate+r.expandedUncertainty)
 }
})
test('correlated uncertainty preserves reinforcing and cancelling signed sensitivities',()=>{
 const base={...uncertaintyExample,operation:1,valueA:2,valueB:2,uncertaintyA:.3,uncertaintyB:.3}
 assert.equal(measurementUncertainty({...base,correlation:1}).standardUncertainty,0)
 assert.equal(measurementUncertainty({...base,correlation:-1}).standardUncertainty,.6)
 assert.match(measurementUncertainty(base).relativeStandardUncertainty,/Undefined/)
 // First-order product sensitivities have opposite signs here.
 assert.equal(measurementUncertainty({...base,operation:2,valueA:-2,correlation:1}).standardUncertainty,0)
 const large=measurementUncertainty({...base,valueA:1,valueB:0,uncertaintyA:1e200,uncertaintyB:1e200,coverageFactor:1,correlation:0})
 assert.ok(Math.abs(large.standardUncertainty/1e200-Math.SQRT2)<1e-14)
})
test('uncertainty sensitivities agree with finite differences and covariance evaluation',()=>{
 for(let operation=0;operation<4;operation++) for(const correlation of [-.8,0,.7]){
  const x={...uncertaintyExample,operation,correlation,valueA:-3,valueB:4},r=measurementUncertainty(x),eps=1e-5
  for(const [key,sensitivity] of [['valueA','sensitivityA'],['valueB','sensitivityB']]){
   const numerical=(measurementUncertainty({...x,[key]:x[key]+eps}).estimate-measurementUncertainty({...x,[key]:x[key]-eps}).estimate)/(2*eps)
   assert.ok(Math.abs(numerical-r[sensitivity])<1e-9)
  }
  const a=r.sensitivityA*x.uncertaintyA,b=r.sensitivityB*x.uncertaintyB
  assert.ok(Math.abs(r.standardUncertainty**2-(a*a+b*b+2*correlation*a*b))<1e-14)
 }
})
test('uncertainty propagation rejects invalid inputs and preserves zero uncertainty',()=>{
 for(const key of Object.keys(uncertaintyExample)) assert.throws(()=>measurementUncertainty({...uncertaintyExample,[key]:NaN}))
 for(const bad of [{operation:4},{operation:.5},{uncertaintyA:-1},{uncertaintyB:-1},{correlation:1.01},{correlation:-1.01},{coverageFactor:0},{operation:3,valueB:0},{valueA:1e308,valueB:1e308}]) assert.throws(()=>measurementUncertainty({...uncertaintyExample,...bad}))
 const zero=measurementUncertainty({...uncertaintyExample,uncertaintyA:0,uncertaintyB:0})
 assert.equal(zero.standardUncertainty,0);assert.equal(zero.expandedUncertainty,0)
})

const {thermalTransport}=require('../../.test-engivault/engineering.js')
const transportExample={density:1000,viscosity:.001,specificHeat:4000,conductivity:.5,speed:1,length:.01}
test('thermal transport groups reproduce a hand-calculated reference case',()=>{
 const r=thermalTransport(transportExample)
 assert.equal(r.kinematicViscosity,1e-6);assert.equal(r.thermalDiffusivity,1.25e-7)
 assert.equal(r.reynoldsNumber,10000);assert.equal(r.prandtlNumber,8);assert.equal(r.pecletNumber,80000)
})
test('thermal groups retain independent scaling and the Pe = Re Pr identity',()=>{
 const base=thermalTransport(transportExample)
 for(const key of ['speed','length']){
  const r=thermalTransport({...transportExample,[key]:2*transportExample[key]})
  assert.equal(r.reynoldsNumber,2*base.reynoldsNumber);assert.equal(r.pecletNumber,2*base.pecletNumber);assert.equal(r.prandtlNumber,base.prandtlNumber)
 }
 const r=thermalTransport({...transportExample,viscosity:.002})
 assert.equal(r.reynoldsNumber,base.reynoldsNumber/2);assert.equal(r.prandtlNumber,2*base.prandtlNumber);assert.equal(r.pecletNumber,base.pecletNumber)
 for(const conductivity of [.01,.1,1,100]){
  const r=thermalTransport({...transportExample,conductivity})
  assert.ok(Math.abs(r.pecletNumber-r.reynoldsNumber*r.prandtlNumber)<r.pecletNumber*1e-12)
 }
})
test('thermal transport preserves stagnation and rejects invalid or unresolved states',()=>{
 const r=thermalTransport({...transportExample,speed:0})
 assert.equal(r.reynoldsNumber,0);assert.equal(r.pecletNumber,0);assert.equal(r.prandtlNumber,8)
 for(const key of Object.keys(transportExample))assert.throws(()=>thermalTransport({...transportExample,[key]:NaN}))
 for(const key of ['density','viscosity','specificHeat','conductivity','length'])assert.throws(()=>thermalTransport({...transportExample,[key]:0}))
 for(const bad of [{speed:-1},{length:1e308,speed:1e308},{conductivity:5e-324},{viscosity:1e308,density:1e-308},{speed:5e-324,length:5e-324}])assert.throws(()=>thermalTransport({...transportExample,...bad}))
})
