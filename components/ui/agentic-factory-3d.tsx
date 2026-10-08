'use client'

import { useEffect, useRef, useState } from 'react'
import { initMachineScene, type MachineApi, type MachineStationId } from './agentic-factory-3d.scene'
import { Box, ClipboardList, Columns2, Factory, Layers, Mouse, Pause, Play } from 'lucide-react'

/**
 * Agentic Factory: an interactive 3D machine, redone as Luqman's workshop.
 *
 * One machine you can spin: a brief comes in at Intake, gets built in the TEN21
 * workshop, synced at Integrations, calculated at Engineering and reported at
 * Controls. Four modes (Assembled, Cutaway, Stations, One brief), five cameras,
 * hover and click stations. Procedural three.js drawn as hidden-line
 * wireframe in the page's ink and signal colours: no models, no images.
 *
 * Based on the Agentic Factory 3D component by Eugene Shilow (21st.dev,
 * github.com/eugeneshilow/agentic-3d-templates), built by OpenAI Codex and
 * ported to React by Claude. Changes for this site: site copy on every screen,
 * new station objects (dress form, databases, pipe spool, filing cabinet,
 * Gantt board), a line-drawing look with colours read from the shadcn
 * tokens and re-read when the theme switches, lucide icons, and `focus` /
 * `paused` props so a page can drive the camera. The scene lives in
 * agentic-factory-3d.scene.ts.
 *
 * Fills its box: give it a height (default 100vh). The `embed` prop hides the
 * panels for a landing-page hero: on a frame wider than 900 px the machine
 * moves to the right 58 % and leaves the left side for a headline.
 *
 * Type arguments are written `Foo< Bar>` with a space after `<` on purpose: the
 * 21st.dev publish scanner reads `<Bar` as a JSX tag. Prettier tidies it back.
 */

export type { MachineApi, MachineCamera, MachineMode, MachineStationId } from './agentic-factory-3d.scene'

export type AgenticFactory3DProps = {
  /** Height of the scene box, e.g. 720 or '100vh'. Default '100vh'. */
  height?: number | string
  className?: string
  /** Clean hero mode: no panels, the machine on the right of a wide frame. */
  embed?: boolean
  /** Fly the camera to a station; null returns to the overview. */
  focus?: MachineStationId | null
  /** Stop rendering (for example while a dialog covers the scene). */
  paused?: boolean
  /** A station was clicked. */
  onStation?: (id: MachineStationId) => void
  /** The first real frame is drawn. */
  onReady?: () => void
}

/** Which theme is active, so the scene can repaint its colours when it changes. */
function useThemeKey() {
  const [key, setKey] = useState('')
  useEffect(() => {
    const html = document.documentElement
    const read = () => setKey(html.classList.contains('dark') ? 'dark' : 'light')
    read()
    const mo = new MutationObserver(read)
    mo.observe(html, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])
  return key
}

export default function AgenticFactory3D({
  height = '100vh',
  className,
  embed = false,
  focus = null,
  paused = false,
  onStation,
  onReady,
}: AgenticFactory3DProps) {
  const rootRef = useRef< HTMLDivElement>(null)
  const apiRef = useRef< MachineApi | null>(null)
  const latest = useRef({ onStation, onReady, focus, paused })
  const theme = useThemeKey()
  useEffect(() => {
    latest.current = { onStation, onReady, focus, paused }
  }, [onStation, onReady, focus, paused])

  useEffect(() => {
    const root = rootRef.current
    if (!root || !theme) return
    let scene: { dispose: () => void; api: MachineApi } | undefined
    let cancelled = false
    // The in-scene screens are painted on canvases: wait for fonts first.
    document.fonts.ready.then(() => {
      if (cancelled) return
      scene = initMachineScene(root, getComputedStyle(root).fontFamily, {
        embedded: embed,
        onStation: (id) => latest.current.onStation?.(id),
        onReady: () => latest.current.onReady?.(),
      })
      apiRef.current = scene.api
      const { focus: f, paused: p } = latest.current
      if (f) scene.api.focusStation(f)
      scene.api.halt(p)
    })
    return () => {
      cancelled = true
      apiRef.current = null
      scene?.dispose()
    }
  }, [embed, theme])

  useEffect(() => {
    const api = apiRef.current
    if (!api) return
    if (focus) api.focusStation(focus)
    else api.setCamera('overview')
  }, [focus])

  useEffect(() => {
    apiRef.current?.halt(paused)
  }, [paused])

  return (
    <div
      ref={rootRef}
      className={['agentic-factory-3d', embed && 'embed', className].filter(Boolean).join(' ')}
      style={{ height }}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        id="scene"
        role="img"
        aria-label="Interactive 3D machine with five stations: Intake, TEN21, Integrations, Engineering and Controls. Drag to rotate. Hover or tap a station to take a closer look."
      />
      <div className="vignette" />
      <header className="topbar debug-ui">
        <div className="identity">
          <div className="mark">
            <Factory size={16} strokeWidth={1.75} />
          </div>
          <div>
            <strong>Luqman Ismat</strong>
            <small>The workshop</small>
          </div>
        </div>
        <div className="status" id="status">
          <i />
          <span id="status-text">Machine running</span>
        </div>
      </header>
      <div className="scene-heading debug-ui">How a project moves through the shop</div>
      <div id="journey" className="debug-ui">
        <div className="journey-icon">
          <ClipboardList size={13} strokeWidth={1.75} />
        </div>
        <div>
          <strong id="journey-title">New brief</strong>
          <small id="journey-detail">Intake: scope, data and deadline</small>
        </div>
        <div className="track">
          <i id="journey-progress" />
        </div>
      </div>
      <div id="labels" />
      <div id="tooltip" aria-hidden="true">
        <strong />
        <p />
      </div>
      <div className="controls debug-ui">
        <nav className="mode-bar" aria-label="Machine mode">
          <button type="button" data-mode="assembled" aria-pressed="true">
            <Box strokeWidth={1.75} />
            Assembled
          </button>
          <button type="button" data-mode="cutaway" aria-pressed="false">
            <Columns2 strokeWidth={1.75} />
            Cutaway
          </button>
          <button type="button" data-mode="stations" aria-pressed="false">
            <Layers strokeWidth={1.75} />
            Stations
          </button>
          <button type="button" data-mode="order" aria-pressed="false">
            <Play strokeWidth={1.75} />
            One brief
          </button>
        </nav>
        <nav className="camera-row" aria-label="Camera">
          <span className="caption">View</span>
          {(['overview', 'side', 'top', 'station', 'flight'] as const).map((c) => (
            <button key={c} type="button" data-camera={c} aria-pressed={c === 'overview'}>
              {c[0].toUpperCase() + c.slice(1)}
            </button>
          ))}
          <span className="divider" />
          <button type="button" id="play" aria-label="Pause the animation" aria-pressed="false">
            <Pause className="icon-pause" size={12} strokeWidth={2} />
            <Play className="icon-play" size={12} strokeWidth={2} />
          </button>
        </nav>
      </div>
      <footer className="footer debug-ui">
        <span className="hint">
          <Mouse size={14} strokeWidth={1.5} />
          Rotate, zoom and explore.
        </span>
      </footer>
      <div id="loading">
        <i />
        <span>Assembling the machine</span>
      </div>
      <div id="error" role="alert">
        <strong>Could not start the 3D scene</strong>
        <p>Check that WebGL is turned on in your browser.</p>
        <button type="button" onClick={() => location.reload()}>
          Try again
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Styles, scoped to .agentic-factory-3d. Colours come from the shadcn tokens
// with fallbacks, so the component also works outside this site.
// ---------------------------------------------------------------------------

const STYLES = String.raw`
.agentic-factory-3d {
  --af-accent: hsl(var(--primary, 158 78% 20%));
  --af-accent-ink: hsl(var(--primary-foreground, 0 0% 100%));
  --af-fg: hsl(var(--foreground, 0 0% 10%));
  --af-muted: hsl(var(--muted-foreground, 0 0% 37%));
  --af-bg: hsl(var(--background, 0 0% 98%));
  --af-surface: hsl(var(--card, 0 0% 100%) / 0.9);
  --af-line: hsl(var(--border, 60 6% 90%));
  position: relative;
  width: 100%;
  overflow: hidden;
  contain: layout;
  background: var(--af-bg);
  color: var(--af-fg);
  font-family: inherit;
  font-size: 13px;
  -webkit-font-smoothing: antialiased;
}
.agentic-factory-3d.embed { background: transparent; }
.agentic-factory-3d, .agentic-factory-3d * { box-sizing: border-box; }
.agentic-factory-3d button { font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.agentic-factory-3d button:focus-visible { outline: 2px solid var(--af-accent); outline-offset: 4px; }
.agentic-factory-3d #scene { position: absolute; inset: 0; touch-action: none; outline: none; }
.agentic-factory-3d.embed #scene { touch-action: pan-y; }
.agentic-factory-3d #scene canvas { display: block; width: 100%; height: 100%; }
.agentic-factory-3d .vignette {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at 50% 48%, transparent 45%, var(--af-bg) 100%);
}
.agentic-factory-3d.embed .vignette {
  background:
    linear-gradient(90deg, var(--af-bg) 0%, var(--af-bg) 30%, transparent 52%),
    radial-gradient(ellipse at 71% 48%, transparent 50%, var(--af-bg) 100%);
}
.agentic-factory-3d .topbar {
  position: absolute; inset: 28px 32px auto; display: flex; justify-content: space-between; align-items: center; pointer-events: none;
}
.agentic-factory-3d .identity { display: flex; gap: 12px; align-items: center; }
.agentic-factory-3d .mark {
  width: 32px; height: 32px; border-radius: var(--radius, 8px); display: grid; place-items: center;
  color: var(--af-accent-ink); background: var(--af-accent);
}
.agentic-factory-3d .identity strong { display: block; font-weight: 600; font-size: 14px; }
.agentic-factory-3d .identity small { display: block; margin-top: 2px; font-size: 12px; color: var(--af-muted); }
.agentic-factory-3d .status { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--af-muted); }
.agentic-factory-3d .status i { width: 6px; height: 6px; border-radius: 50%; background: var(--af-accent); }
.agentic-factory-3d .status.paused i { background: var(--af-line); }
.agentic-factory-3d .scene-heading {
  position: absolute; top: 96px; left: 32px; pointer-events: none; font-size: 15px; color: var(--af-muted);
}
.agentic-factory-3d .controls {
  position: absolute; bottom: 64px; left: 24px; right: 24px; display: flex; align-items: center; flex-direction: column; gap: 14px; z-index: 5;
}
.agentic-factory-3d .mode-bar {
  display: flex; gap: 2px; align-items: center; padding: 4px; border: 1px solid var(--af-line);
  border-radius: 999px; background: var(--af-surface); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
}
.agentic-factory-3d .mode-bar button {
  border: 0; background: none; color: var(--af-muted); white-space: nowrap; padding: 10px 16px;
  display: flex; gap: 8px; align-items: center; font-size: 13px; font-weight: 500; border-radius: 999px;
  transition: background 0.2s, color 0.2s;
}
.agentic-factory-3d .mode-bar button:hover { color: var(--af-fg); }
.agentic-factory-3d .mode-bar button[aria-pressed='true'] { background: var(--af-accent); color: var(--af-accent-ink); }
.agentic-factory-3d .mode-bar svg { width: 15px; height: 15px; flex-shrink: 0; }
.agentic-factory-3d .camera-row { display: flex; align-items: center; justify-content: center; gap: 2px; }
.agentic-factory-3d .camera-row .caption { font-size: 12px; color: var(--af-muted); margin-right: 8px; }
.agentic-factory-3d .camera-row button {
  border: 0; background: transparent; color: var(--af-muted); padding: 6px 10px; font-size: 12px; border-radius: 999px; transition: color 0.2s, background 0.2s;
}
.agentic-factory-3d .camera-row button:hover { color: var(--af-fg); }
.agentic-factory-3d .camera-row button[aria-pressed='true'] { color: var(--af-fg); background: var(--af-surface); box-shadow: inset 0 0 0 1px var(--af-line); }
.agentic-factory-3d .camera-row .divider { width: 1px; height: 14px; background: var(--af-line); margin: 0 8px; }
.agentic-factory-3d .camera-row #play { width: 30px; height: 30px; padding: 0; display: grid; place-items: center; }
.agentic-factory-3d #play .icon-play, .agentic-factory-3d #play[aria-pressed='true'] .icon-pause { display: none; }
.agentic-factory-3d #play[aria-pressed='true'] .icon-play { display: block; }
.agentic-factory-3d .footer { position: absolute; bottom: 24px; left: 32px; right: 32px; display: flex; justify-content: flex-end; pointer-events: none; }
.agentic-factory-3d .hint { display: flex; align-items: center; gap: 8px; color: var(--af-muted); font-size: 12px; }
.agentic-factory-3d #labels { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.agentic-factory-3d .station-label {
  position: absolute; left: 0; top: 0; opacity: 0; transition: opacity 0.3s; will-change: transform; pointer-events: none; min-width: 130px;
}
.agentic-factory-3d .station-label.visible { opacity: 1; }
.agentic-factory-3d .station-label .stem { height: 24px; width: 1px; background: var(--af-accent); margin: 0 0 0 12px; opacity: 0.6; }
.agentic-factory-3d .station-label .label-card,
.agentic-factory-3d #tooltip {
  background: var(--af-surface); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--af-line); border-radius: var(--radius, 8px); box-shadow: 0 8px 28px rgb(0 0 0 / 0.12);
}
.agentic-factory-3d .station-label .label-card { padding: 9px 12px; }
.agentic-factory-3d .station-label .label-title { font-weight: 600; font-size: 13px; white-space: nowrap; }
.agentic-factory-3d .station-label .label-meta { font-size: 12px; color: var(--af-muted); margin-top: 3px; white-space: nowrap; }
.agentic-factory-3d #tooltip {
  position: absolute; pointer-events: none; z-index: 10; opacity: 0; transition: opacity 0.15s; padding: 12px 14px; max-width: 250px;
}
.agentic-factory-3d #tooltip.visible { opacity: 1; }
.agentic-factory-3d #tooltip strong { font-size: 14px; font-weight: 600; }
.agentic-factory-3d #tooltip p { font-size: 13px; color: var(--af-muted); margin: 4px 0 0; line-height: 1.45; }
.agentic-factory-3d #journey {
  position: absolute; left: 32px; right: 32px; top: 130px; max-width: 520px; opacity: 0; transform: translateY(-4px);
  transition: opacity 0.4s, transform 0.4s; pointer-events: none; display: flex; align-items: center; gap: 12px;
}
.agentic-factory-3d #journey.visible { opacity: 1; transform: none; }
.agentic-factory-3d .journey-icon {
  width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: var(--af-accent); color: var(--af-accent-ink); flex-shrink: 0;
}
.agentic-factory-3d #journey strong { font-size: 13px; font-weight: 600; }
.agentic-factory-3d #journey small { display: block; font-size: 12px; margin-top: 2px; color: var(--af-muted); }
.agentic-factory-3d #journey .track { height: 2px; background: var(--af-line); flex: 1; margin-left: 8px; }
.agentic-factory-3d #journey .track i { display: block; height: 100%; background: var(--af-accent); width: 0; }
.agentic-factory-3d #loading {
  position: absolute; left: 50%; top: 48%; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 12px;
  color: var(--af-muted); font-size: 13px; transition: opacity 0.4s; z-index: 20;
}
.agentic-factory-3d #loading i {
  height: 18px; width: 18px; border-radius: 50%; border: 1.5px solid var(--af-line); border-top-color: var(--af-accent);
  animation: agentic-factory-3d-spin 1s linear infinite;
}
@keyframes agentic-factory-3d-spin { to { transform: rotate(360deg); } }
.agentic-factory-3d #loading.done { opacity: 0; pointer-events: none; }
.agentic-factory-3d #error {
  position: absolute; left: 27.5%; right: 27.5%; top: 40%; border: 1px solid var(--af-line); background: var(--af-surface);
  padding: 24px; border-radius: calc(var(--radius, 8px) * 2); display: none; font-size: 14px; line-height: 1.6;
}
.agentic-factory-3d #error strong { font-weight: 600; }
.agentic-factory-3d #error p { color: var(--af-muted); margin: 6px 0 0; }
.agentic-factory-3d #error button {
  border: 0; background: var(--af-accent); color: var(--af-accent-ink); padding: 9px 16px; border-radius: 999px; margin-top: 14px;
}
.agentic-factory-3d.embed .debug-ui { display: none !important; }
@media (min-width: 901px) {
  .agentic-factory-3d.embed #loading { left: 71%; }
  .agentic-factory-3d.embed #error { left: 48%; right: 7%; }
}
@media (max-width: 900px) {
  .agentic-factory-3d .topbar { inset: 20px 16px auto; }
  .agentic-factory-3d .status { display: none; }
  .agentic-factory-3d .scene-heading { left: 16px; right: 16px; top: 76px; font-size: 14px; }
  .agentic-factory-3d .controls { left: 8px; right: 8px; bottom: 56px; gap: 10px; }
  .agentic-factory-3d .mode-bar button { padding: 9px 10px; font-size: 12px; gap: 6px; }
  .agentic-factory-3d .mode-bar svg { display: none; }
  .agentic-factory-3d .camera-row .caption { display: none; }
  .agentic-factory-3d .camera-row button { padding: 6px 7px; }
  .agentic-factory-3d .footer { left: 16px; right: 16px; bottom: 18px; justify-content: center; }
  .agentic-factory-3d #error { left: 7%; right: 7%; top: 35%; }
  .agentic-factory-3d #journey { left: 16px; right: 16px; top: 108px; }
  .agentic-factory-3d.embed .vignette { background: radial-gradient(ellipse at 50% 30%, transparent 40%, var(--af-bg) 100%); }
  .agentic-factory-3d.embed #loading { top: 32%; }
}
@media (prefers-reduced-motion: reduce) {
  .agentic-factory-3d, .agentic-factory-3d * { transition: none !important; }
  .agentic-factory-3d #loading i { animation: none; }
}
@media (prefers-reduced-transparency: reduce) {
  .agentic-factory-3d .mode-bar, .agentic-factory-3d .station-label .label-card, .agentic-factory-3d #tooltip {
    background: hsl(var(--card, 0 0% 100%)); backdrop-filter: none; -webkit-backdrop-filter: none;
  }
}
`
