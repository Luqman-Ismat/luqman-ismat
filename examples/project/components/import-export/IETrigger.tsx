import {rows,downloadCsv} from '../../data';
export default function IETrigger(){return <button className="btn" onClick={()=>downloadCsv('sample-wbs.csv',rows)}>Export schedule ↓</button>}
