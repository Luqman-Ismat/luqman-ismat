/** Only a complete finite positive geometry pair may enter the beam form. */
export function readSectionTransfer(query:URLSearchParams) {
  const keys=['secondMoment','extremeDistance'] as const
  if (!keys.some(k=>query.has(k))) return null
  const values:Record<string,string>={}
  for(const key of keys){
    const all=query.getAll(key),value=all[0]
    if (all.length!==1 || !value?.trim() || !Number.isFinite(Number(value)) || Number(value)<=0) throw new Error('The section link contains invalid geometry. Check second moment and fibre distance before calculating.')
    values[key]=String(Number(value))
  }
  return values
}

export function sectionBeamHref(results:Record<string,number|string>,axis:'X'|'Y') {
  const query=new URLSearchParams({secondMoment:String(results['secondMoment'+axis]),extremeDistance:String(results[axis==='X'?'centroidY':'centroidX'])})
  readSectionTransfer(query)
  return '/calculators/section-beam?'+query.toString()
}
