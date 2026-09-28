"use client";
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
const subscribe = () => () => {};
export function SourceExample({kind,title,view=0}:{kind:'inspection'|'project';title:string;view?:number}) {
 const {resolvedTheme}=useTheme();
 const mounted=useSyncExternalStore(subscribe,()=>true,()=>false);
 const url=`/examples/${kind}/index.html?theme=${mounted&&resolvedTheme==='dark'?'dark':'light'}&view=${view}`;
 return <div className="source-example"><div className="source-example-bar"><span>Working application · Fictional data</span><a href={url} target="_blank" rel="noopener noreferrer">Open full workspace ↗</a></div><iframe key={url} src={url} title={title} className="source-example-frame" sandbox="allow-scripts allow-same-origin allow-downloads" loading="eager"/></div>;
}
