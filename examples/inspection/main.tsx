import React from 'react';
import {createRoot} from 'react-dom/client';
import Workbench from './app/workbench';
/* Mount into any element: the standalone page uses #root; site pages mount
   natively inside their own DOM via window.__demos. */
function mount(el: HTMLElement) { const root = createRoot(el); root.render(<Workbench/>); return () => root.unmount(); }
const registry = window as unknown as { __demos?: Record<string, { mount: typeof mount }> };
registry.__demos = { ...(registry.__demos || {}), inspection: { mount } };
const standalone = document.getElementById('root');
if (standalone) mount(standalone);
