import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import WbsPage from './WbsPage';import Heatmaps from './Heatmaps';import Mapping from './Mapping';import ImportPlan from './ImportPlan';import Forecast from './Forecast';import Quality from './Quality';import Reporting from './Reporting';import RiskPage from './RiskPage';import {Guide,Overview,views} from './Guide';
function App({initialView}:{initialView?:number}){const initial=initialView??Number(new URLSearchParams(location.search).get('view')??9);const [view,setView]=useState(views[initial]?initial:9),[visited,setVisited]=useState(new Set([views[initial]?initial:9])),[revision,setRevision]=useState(0);
 function select(n:number){if(!views[n])return;setView(n);setVisited(old=>new Set([...old,n]));const q=new URLSearchParams(location.search);q.set('view',String(n));history.replaceState(null,'','?'+q)}
 useEffect(()=>{const changed=()=>setRevision(r=>r+1);const follow=()=>{const match=location.hash.match(/^#view-(\d+)$/);if(match)select(Number(match[1]))};window.addEventListener('demo-data-change',changed);window.addEventListener('hashchange',follow);follow();return()=>{window.removeEventListener('demo-data-change',changed);window.removeEventListener('hashchange',follow)}},[]);
 const content=[<WbsPage key={revision}/>,<Heatmaps/>,<ImportPlan onOpenSchedule={()=>select(0)}/>,<Mapping/>,<Forecast/>,<Quality/>,<Reporting kind="cost"/>,<Reporting kind="productivity"/>,<RiskPage/>,<Overview onSelect={select}/>];
 return <><header className="example-head"><small>PROJECT DELIVERY WORKSPACE / FICTIONAL DATA</small><div className="workspace-heading"><h1>Atlas project controls</h1><span>Explore · Change · Trace</span></div><nav className="example-tabs" aria-label="Project workspace">{[9,0,1,2,3,4,5,6,7,8].map(n=><button key={n} aria-pressed={view===n} onClick={()=>select(n)}>{views[n]}</button>)}</nav></header><Guide view={view}/>{content.map((element,n)=>visited.has(n)?<div key={n} hidden={view!==n}>{element}</div>:null)}</>
}
/* Mount into any element: the standalone page uses #root; site pages mount
   natively inside their own DOM via window.__demos. */
function mount(el: HTMLElement, options: { view?: number } = {}) { const root = createRoot(el); root.render(<App initialView={options.view}/>); return () => root.unmount(); }
const registry = window as unknown as { __demos?: Record<string, { mount: typeof mount }> };
registry.__demos = { ...(registry.__demos || {}), project: { mount } };
const standalone = document.getElementById('root');
if (standalone) mount(standalone);

