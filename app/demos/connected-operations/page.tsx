import Link from 'next/link';
import {WorkExplained} from '@/components/work-explained';
import {PageShell} from '@/components/consulting';
import {SourceExample} from '@/components/demos/source-example';
export const metadata={title:'Connected Operations Workspace',description:'Explore deterministic time-entry matching, manual reconciliation and applied-hours reporting with fictional data.',alternates:{canonical:'/demos/connected-operations'}};
export default function Page(){return <PageShell><header className="source-page-intro"><h1>Connected operations</h1><p>Follow time entries from source records into the project hierarchy. Review automatic matches, resolve exceptions, and inspect applied hours using fictional data. This workflow is adapted from my Workday-connected project-controls application.</p><p><Link href="/consulting/integrations#workday">Read about the API, database, and access-control work ↗</Link></p></header><SourceExample kind="project" view={3} title="Interactive hours reconciliation application"/><WorkExplained kind="integration"/></PageShell>}
