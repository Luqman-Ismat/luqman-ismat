import {WorkExplained} from '@/components/work-explained';
import {PageShell} from '@/components/consulting';
import {SourceExample} from '@/components/demos/source-example';
export const metadata={title:'Inspection Planning Workbench',description:'Explore the original task timing workbench, calculation engine, risk curves, scenario planning, task credits, acceptance checks, and Excel exports with fictional data.',alternates:{canonical:'/demos/inspection-planning'}};
export default function Page(){return <PageShell><header className="source-page-intro"><h1>Inspection planning workbench</h1><p>Explore the full source workbench: lifetime curves, scenarios, task credits, acceptance checks, cost-benefit analysis, and spreadsheet exports. The asset records and numbers are fictional.</p></header><SourceExample kind="inspection" title="Interactive inspection planning application"/><WorkExplained kind="inspection"/></PageShell>}
