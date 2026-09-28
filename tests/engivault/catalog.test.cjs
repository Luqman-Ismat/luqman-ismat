const test=require('node:test');const assert=require('node:assert/strict');
const {calculators}=require('../../.test-engivault/calculator-data.js');
for(const [slug,c] of Object.entries(calculators))test(`${slug}: example inputs produce every declared result and review steps`,()=>{const x=Object.fromEntries(c.inputs.map(i=>[i.id,Number(i.defaultValue)]));const r=c.calculate(x);for(const f of c.results){assert.ok(Object.hasOwn(r,f.id),f.id);if(typeof r[f.id]==='number')assert.ok(Number.isFinite(r[f.id]));}const steps=c.generateDynamicSteps?.(x,r)??c.steps;assert.ok(steps.length);assert.ok(steps.every(s=>typeof s==='string'&&s.length));});
const {convertQuantity}=require('../../.test-engivault/convert.js');
const {unitCategories}=require('../../.test-engivault/unit-converter-data.js');
const index=(c,id)=>unitCategories.find(u=>u.id===c).units.findIndex(u=>u.id===id);
test('converter dispatch applies temperature offsets, distinguishes intervals, and rejects below absolute zero',()=>{const convert=(cat,n,a,b)=>convertQuantity(cat,n,index(cat,a),index(cat,b));assert.ok(Math.abs(convert('temperature',100,'celsius','fahrenheit')-212)<1e-9);assert.ok(Math.abs(convert('temperature',32,'fahrenheit','celsius'))<1e-9);assert.equal(convert('temperature_difference',100,'delta_celsius','delta_fahrenheit'),180);assert.throws(()=>convert('temperature',-300,'celsius','kelvin'));});
