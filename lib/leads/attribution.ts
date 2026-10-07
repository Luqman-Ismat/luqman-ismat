/* First-touch attribution, kept in sessionStorage: the page someone landed
   on, where they came from and any campaign tags. Read by the inquiry form. */
const KEY = "li-first-touch";
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
export type Touch = { sourcePath: string; referrer: string; utm: Record<string, string> };

export function recordFirstTouch() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const params = new URLSearchParams(location.search);
    const utm: Record<string, string> = {};
    for (const k of UTM) { const v = params.get(k); if (v) utm[k] = v.slice(0, 120); }
    const ref = document.referrer && new URL(document.referrer).host !== location.host ? document.referrer : "";
    const touch: Touch = { sourcePath: (location.pathname + location.search).slice(0, 300), referrer: ref.slice(0, 500), utm };
    sessionStorage.setItem(KEY, JSON.stringify(touch));
  } catch { /* storage unavailable: attribution is optional */ }
}

export function readFirstTouch(): Touch {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Touch;
  } catch { /* ignore */ }
  return { sourcePath: "", referrer: "", utm: {} };
}

/** The same capture as recordFirstTouch(), inlined in <head> so it runs before
    hydration and a quick click-through still records where a visit began. */
export const FIRST_TOUCH_SCRIPT = `(function(){try{var k="${KEY}";if(sessionStorage.getItem(k))return;var p=new URLSearchParams(location.search),u={};${JSON.stringify(UTM)}.forEach(function(n){var v=p.get(n);if(v)u[n]=v.slice(0,120)});var r="";try{if(document.referrer&&new URL(document.referrer).host!==location.host)r=document.referrer.slice(0,500)}catch(e){}sessionStorage.setItem(k,JSON.stringify({sourcePath:(location.pathname+location.search).slice(0,300),referrer:r,utm:u}))}catch(e){}})();`;
