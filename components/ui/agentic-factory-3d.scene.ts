import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {
  EX, HOUSTON, ROW, WEEK, boxEdges, coreGeometry, curvesGeometry, databaseGeometry, exchangerParts,
  globeGeometry, gyroRing, integrationLayout, latLon, portalGeometry, scheduleBars, scheduleFrame,
  tubeOffsets, tubesGeometry,
} from '@/components/journey/geometry'

/* The workshop machine as a line drawing: every part is a paper-coloured fill
   that hides what is behind it, outlined in the page's ink, with the signal
   green for the parts that matter. Same look as the rest of the site's
   scenes. Five stations on one plate, a belt carrying the work between them:
   brief (Intake), build (TEN21), data (Integrations), calculation
   (Engineering), report (Controls). Everything is procedural. */

export type MachineStationId = 'engine' | 'admin' | 'storefront' | 'cabinet' | 'cashdesk'
export type MachineMode = 'assembled' | 'cutaway' | 'stations' | 'order'
export type MachineCamera = 'overview' | 'side' | 'top' | 'station' | 'flight'

export type MachineApi = {
  setMode: (name: string) => boolean
  focusStation: (id: string) => boolean
  setCamera: (name: string) => boolean
  play: () => boolean
  pause: () => boolean
  halt: (halted: boolean) => void
}

export type MachineSceneOptions = {
  /** Clean hero: panels hidden, wheel and touch scroll the page. */
  embedded: boolean
  onStation?: (id: MachineStationId) => void
  onReady?: () => void
}

/** Resolve a shadcn colour token (an HSL triplet) to an rgb() string. */
function tokenColor(root: HTMLElement, name: string, fallback: string) {
  if (!getComputedStyle(root).getPropertyValue(name).trim()) return fallback
  const probe = document.createElement('span')
  probe.style.color = `hsl(var(${name}))`
  probe.style.display = 'none'
  root.appendChild(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value || fallback
}

type Vec3 = [number, number, number]
type LineKind = 'ink' | 'acc' | 'faint'

export function initMachineScene(
  root: HTMLElement,
  fontFamily: string,
  options: MachineSceneOptions
): { dispose: () => void; api: MachineApi } {
  const cleanups: Array<() => void> = []
  const frameWidth = () => root.clientWidth
  const frameHeight = () => root.clientHeight
  const listen = (target: EventTarget, type: string, handler: (event: never) => void) => {
    const fn = handler as unknown as EventListener
    target.addEventListener(type, fn)
    cleanups.push(() => target.removeEventListener(type, fn))
  }
  function $< T extends HTMLElement = HTMLElement>(id: string): T {
    const el = root.querySelector< T>(`#${id}`)
    if (!el) throw new Error(`Scene markup is missing #${id}`)
    return el
  }
  function showError(message?: string) {
    $('loading').classList.add('done')
    $('error').style.display = 'block'
    if (message) $('error').querySelector('p')!.textContent = message
  }
  const dispose = () => {
    for (const fn of cleanups.reverse()) fn()
    cleanups.length = 0
  }
  const noop = () => false
  let api: MachineApi = {
    setMode: noop,
    focusStation: noop,
    setCamera: noop,
    play: noop,
    pause: noop,
    halt: () => {},
  }
  try {
    const TAU = Math.PI * 2
    const embedded = options.embedded
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    const C = {
      ink: tokenColor(root, '--foreground', 'rgb(26, 26, 26)'),
      paper: tokenColor(root, '--background', 'rgb(251, 251, 251)'),
      card: tokenColor(root, '--card', 'rgb(255, 255, 255)'),
      muted: tokenColor(root, '--muted', 'rgb(242, 242, 238)'),
      sub: tokenColor(root, '--muted-foreground', 'rgb(95, 95, 95)'),
      acc: tokenColor(root, '--primary', 'rgb(11, 91, 62)'),
      accInk: tokenColor(root, '--primary-foreground', 'rgb(255, 255, 255)'),
    }
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(33, frameWidth() / frameHeight(), 0.1, 150)
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch (e) {
      showError('WebGL is not available. Turn on hardware acceleration in your browser settings and reload the page.')
      throw e
    }
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(devicePixelRatio, frameWidth() < 900 ? 1.75 : 2))
    renderer.setSize(frameWidth(), frameHeight())
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.localClippingEnabled = true
    $('scene').appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.065
    controls.enablePan = false
    controls.minDistance = 7
    controls.maxDistance = 55
    controls.minPolarAngle = 0.09
    controls.maxPolarAngle = Math.PI * 0.475
    controls.rotateSpeed = 0.48
    controls.zoomSpeed = 0.7
    if (embedded) {
      controls.enableZoom = false
      if (matchMedia('(pointer:coarse)').matches) controls.enableRotate = false
    }

    // ---- materials: fills hide what is behind, lines carry the drawing ----
    const cutPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10)
    const fill = (color: string, line: LineKind, clip = false) => {
      const m = new THREE.MeshBasicMaterial({
        color,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      })
      m.userData.line = line
      if (clip) {
        m.clippingPlanes = [cutPlane]
        m.side = THREE.DoubleSide
      }
      return m
    }
    const P = fill(C.paper, 'ink') // a part
    const A = fill(C.paper, 'acc') // a part that matters
    const F = fill(C.acc, 'acc') // a solid signal mark
    const Q = fill(C.paper, 'faint') // small hardware
    const SP = fill(C.paper, 'ink', true) // shells, cut open in Cutaway
    const SA = fill(C.paper, 'acc', true)
    const lines: Record< LineKind, THREE.LineBasicMaterial> = {
      ink: new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.82 }),
      acc: new THREE.LineBasicMaterial({ color: C.acc }),
      faint: new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.3 }),
    }
    const clipped = new Map< THREE.LineBasicMaterial, THREE.LineBasicMaterial>()
    const clipLine = (m: THREE.LineBasicMaterial) => {
      if (!clipped.has(m)) {
        const c = m.clone()
        c.clippingPlanes = [cutPlane]
        clipped.set(m, c)
      }
      return clipped.get(m)!
    }

    // ---- geometry helpers ----
    const geometries = new Map< string, THREE.BufferGeometry>()
    const cached = (k: string, make: () => THREE.BufferGeometry) => {
      if (!geometries.has(k)) geometries.set(k, make())
      return geometries.get(k)!
    }
    function mesh(parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) {
      const o = new THREE.Mesh(g, m)
      o.position.set(x, y, z)
      parent.add(o)
      return o
    }
    const box = (parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material = P) =>
      mesh(parent, cached(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)), m, x, y, z)
    const cyl = (parent: THREE.Object3D, r: number, h: number, x: number, y: number, z: number, m: THREE.Material = P, r2 = r, seg = 28) =>
      mesh(parent, cached(`c${r},${r2},${h},${seg}`, () => new THREE.CylinderGeometry(r, r2, h, seg)), m, x, y, z)
    const ring = (parent: THREE.Object3D, R: number, r: number, x: number, y: number, z: number, m: THREE.Material = P) =>
      mesh(parent, cached(`t${R},${r}`, () => new THREE.TorusGeometry(R, r, 6, 36)), m, x, y, z)
    function polyline(parent: THREE.Object3D, pts: THREE.Vector3[], kind: LineKind = 'ink', closed = false) {
      const g = new THREE.BufferGeometry().setFromPoints(closed ? [...pts, pts[0]] : pts)
      const l = new THREE.Line(g, lines[kind])
      l.raycast = () => {}
      parent.add(l)
      return l
    }
    function segs(parent: THREE.Object3D, g: THREE.BufferGeometry, kind: LineKind = 'ink') {
      const l = new THREE.LineSegments(g, lines[kind])
      l.raycast = () => {}
      parent.add(l)
      return l
    }
    const curve = (parent: THREE.Object3D, pts: Vec3[], kind: LineKind = 'ink') =>
      polyline(parent, new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))).getPoints(Math.max(16, pts.length * 10)), kind)
    function screw(parent: THREE.Object3D, x: number, y: number, z: number) {
      cyl(parent, 0.05, 0.024, x, y, z, Q, undefined, 12)
    }
    type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void
    function canvasTexture(w: number, h: number, draw: Draw) {
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')!
      draw(ctx, w, h)
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())
      return { texture: t, canvas: c, ctx }
    }
    function print(ctx: CanvasRenderingContext2D, txt: string, x: number, y: number, size = 20, color = C.ink, weight = 500) {
      ctx.fillStyle = color
      ctx.font = `${weight} ${size}px ${fontFamily}`
      ctx.fillText(txt, x, y)
    }
    function panel(c: CanvasRenderingContext2D, w: number, h: number) {
      c.fillStyle = C.card
      c.fillRect(0, 0, w, h)
      c.strokeStyle = C.ink
      c.globalAlpha = 0.25
      c.lineWidth = 3
      c.strokeRect(1.5, 1.5, w - 3, h - 3)
      c.globalAlpha = 1
    }
    type Painted = THREE.Texture | { texture: THREE.Texture }
    function screen(parent: THREE.Object3D, w: number, h: number, x: number, y: number, z: number, tex: Painted) {
      const map = 'texture' in tex ? tex.texture : tex
      const m = new THREE.MeshBasicMaterial({ map, toneMapped: false })
      m.userData.line = 'ink'
      return mesh(parent, new THREE.PlaneGeometry(w, h), m, x, y, z) as THREE.Mesh< THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    }
    const moving = < T extends THREE.Object3D>(o: T) => {
      o.userData.moving = true
      return o
    }

    // ---- the plate ----
    const machine = new THREE.Group()
    scene.add(machine)
    box(machine, 12.8, 0.38, 8.25, 0, -0.09, 0)
    box(machine, 12.6, 0.055, 8.08, 0, 0.13, 0)
    box(machine, 12.49, 0.09, 7.96, 0, 0.19, 0)
    box(machine, 11.9, 0.026, 0.032, 0, -0.17, 4.115, F)
    for (const x of [-5.6, 5.6])
      for (const z of [-3.35, 3.35]) {
        cyl(machine, 0.39, 0.25, x, -0.31, z)
        screw(machine, x, 0.253, z)
      }
    for (const x of [-6.02, 6.02]) for (const z of [-3.73, 3.73]) screw(machine, x, 0.255, z)
    const engraving = canvasTexture(1536, 176, (c, w, h) => {
      panel(c, w, h)
      print(c, 'LUQMAN ISMAT', 45, 79, 40, C.ink, 650)
      print(c, 'schedules  ·  data  ·  engineering tools', 395, 79, 34, C.sub, 450)
      print(c, 'INDEPENDENT CONSULTING    /    HOUSTON, TX', 47, 133, 19, C.sub, 500)
      print(c, 'No. 2026', 1345, 130, 23, C.acc, 600)
    })
    const plate = screen(machine, 7.35, 0.84, -0.4, 0.25, 3.51, engraving)
    plate.rotation.x = -Math.PI / 2
    for (let i = 0; i < 16; i++) box(machine, 0.015, 0.009, 0.11 + (i % 4) * 0.035, -5.6 + i * 0.09, 0.249, 3.5, Q)

    // Drafting marks on the floor: two ellipses with ticks and a faint grid.
    const floorMat = new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.07 })
    const pts: THREE.Vector3[] = []
    for (const r of [7.5, 8.1])
      for (let i = 0; i < 120; i++)
        for (const j of [i, i + 1]) {
          const a = (j / 120) * TAU
          pts.push(new THREE.Vector3(Math.cos(a) * r, -0.4, Math.sin(a) * r * 0.72))
        }
    for (let i = 0; i < 52; i++) {
      const a = (i / 52) * TAU,
        r = 8.1,
        o = i % 4 === 0 ? 0.16 : 0.07
      pts.push(
        new THREE.Vector3(Math.cos(a) * r, -0.4, Math.sin(a) * r * 0.72),
        new THREE.Vector3(Math.cos(a) * (r + o), -0.4, Math.sin(a) * (r + o) * 0.72)
      )
    }
    for (let i = -8; i <= 8; i++) {
      pts.push(new THREE.Vector3(i * 1.2, -0.42, -9.6), new THREE.Vector3(i * 1.2, -0.42, 9.6))
      pts.push(new THREE.Vector3(-9.6, -0.42, i * 1.2), new THREE.Vector3(9.6, -0.42, i * 1.2))
    }
    const floor = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), floorMat)
    floor.raycast = () => {}
    scene.add(floor)

    // ---- stations ----
    type StationDef = { id: MachineStationId; name: string; step: number; output: string; pos: Vec3; desc: string }
    type Station = StationDef & {
      group: THREE.Group
      base: THREE.Vector3
      line: THREE.LineBasicMaterial
      label: HTMLDivElement
      index: number
      anchor: THREE.Vector3
    }
    const definitions: StationDef[] = [
      { id: 'engine', name: 'TEN21', step: 2, output: 'build', pos: [-4.15, 0.29, -0.65], desc: 'My apparel label. Flats, embroidery placement and fit, drawn before anything is cut.' },
      { id: 'admin', name: 'Integrations', step: 3, output: 'data', pos: [-1.65, 0.29, -2.03], desc: 'Workday, schedules and spreadsheets synced into one database you can trust.' },
      { id: 'storefront', name: 'Engineering', step: 4, output: 'calculation', pos: [1.5, 0.29, -2.08], desc: 'EngiVault calculators with the method and the sources shown.' },
      { id: 'cabinet', name: 'Intake', step: 1, output: 'brief', pos: [4.03, 0.29, 0.12], desc: 'Where a project starts: the brief, the data you have and the deadline.' },
      { id: 'cashdesk', name: 'Controls', step: 5, output: 'report', pos: [0.93, 0.29, 1.85], desc: 'Schedules, earned value and the weekly report your team actually reads.' },
    ]
    const stations: Station[] = definitions.map((d, i) => {
      const group = new THREE.Group()
      group.position.fromArray(d.pos)
      machine.add(group)
      box(group, 2.05, 0.12, 1.78, 0, 0.03, 0)
      box(group, 1.97, 0.03, 1.7, 0, 0.12, 0, A)
      box(group, 2.03, 0.17, 1.75, 0, 0.215, 0)
      for (const x of [-0.85, 0.85]) for (const z of [-0.7, 0.7]) screw(group, x, 0.311, z)
      const plaque = canvasTexture(512, 116, (c, w, h) => {
        panel(c, w, h)
        print(c, String(i + 1).padStart(2, '0'), 24, 76, 42, C.acc, 600)
        print(c, d.name.toUpperCase(), 111, 73, 35, C.ink, 600)
      })
      screen(group, 1.54, 0.345, 0, 0.215, 0.876, plaque)
      const label = document.createElement('div')
      label.className = 'station-label'
      label.innerHTML = `<div class="stem"></div><div class="label-card"><div class="label-title">${d.name}</div><div class="label-meta">Step ${d.step}: ${d.output}</div></div>`
      $('labels').appendChild(label)
      cleanups.push(() => label.remove())
      return { ...d, group, base: new THREE.Vector3(...d.pos), line: lines.ink.clone(), label, index: i, anchor: new THREE.Vector3(0, 2.5, 0) }
    })
    const TOP = 0.3 // deck height inside a station

    // TEN21: a dress form, a sewing machine, thread cones and the spec card.
    const ten21 = stations[0].group
    {
      const fx = -0.48,
        fz = -0.12
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * TAU + 0.5
        const leg = box(ten21, 0.5, 0.03, 0.04, fx + Math.cos(a) * 0.22, TOP + 0.04, fz + Math.sin(a) * 0.22, Q)
        leg.rotation.y = -a
      }
      cyl(ten21, 0.028, 0.95, fx, TOP + 0.5, fz)
      // Torso: a lathe for the fill, contour rings and meridians for the drawing.
      const profile: [number, number][] = [
        [0.0, 0.0], [0.24, 0.0], [0.31, 0.16], [0.25, 0.46], [0.33, 0.76], [0.29, 0.96], [0.12, 1.06], [0.07, 1.1], [0.075, 1.2], [0.0, 1.2],
      ]
      const torso = new THREE.Group()
      torso.position.set(fx, TOP + 0.95, fz)
      torso.scale.set(1, 1, 0.74)
      ten21.add(torso)
      const lathe = mesh(torso, new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 32), P, 0, 0, 0)
      lathe.userData.noEdges = true
      const ringAt = (r: number, y: number, kind: LineKind = 'ink') => {
        const ps = []
        for (let s = 0; s < 48; s++) {
          const a = (s / 48) * TAU
          ps.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r))
        }
        polyline(torso, ps, kind, true)
      }
      profile.slice(1, -1).forEach(([r, y], k) => ringAt(r, y, k === 3 ? 'acc' : 'ink'))
      for (let m = 0; m < 8; m++) {
        const a = (m / 8) * TAU
        polyline(torso, new THREE.CatmullRomCurve3(profile.slice(1, -1).map(([r, y]) => new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r))).getPoints(40), m % 4 === 0 ? 'ink' : 'faint')
      }
      // Embroidery zone on the left chest, dashed in the signal colour.
      const zone = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.14, 0.1)),
        new THREE.LineDashedMaterial({ color: C.acc, dashSize: 0.02, gapSize: 0.015 })
      )
      zone.computeLineDistances()
      zone.raycast = () => {}
      zone.position.set(0.12, 0.8, 0.33)
      torso.add(zone)
    }
    // Sewing machine: bed, pillar, arm, head with a needle bar that runs.
    const sewing = new THREE.Group()
    sewing.position.set(0.42, TOP, 0.18)
    ten21.add(sewing)
    box(sewing, 0.9, 0.12, 0.46, 0, 0.06, 0, SP)
    box(sewing, 0.16, 0.5, 0.3, 0.3, 0.37, 0, SP)
    box(sewing, 0.78, 0.15, 0.28, -0.02, 0.69, 0, SP)
    box(sewing, 0.18, 0.24, 0.3, -0.33, 0.58, 0, SA)
    const needle = moving(new THREE.Group())
    needle.position.set(-0.33, 0.4, 0.02)
    sewing.add(needle)
    box(needle, 0.025, 0.2, 0.025, 0, 0, 0, F)
    const handwheel = moving(new THREE.Group())
    handwheel.position.set(0.42, 0.62, 0)
    handwheel.rotation.y = Math.PI / 2
    sewing.add(handwheel)
    ring(handwheel, 0.12, 0.018, 0, 0, 0)
    box(handwheel, 0.22, 0.02, 0.02, 0, 0, 0, Q)
    const spools: THREE.Group[] = []
    for (const x of [-0.12, 0.12]) {
      const s = moving(new THREE.Group())
      s.position.set(x, 0.86, 0)
      sewing.add(s)
      cyl(s, 0.06, 0.12, 0, 0, 0, x < 0 ? A : P)
      cyl(s, 0.075, 0.015, 0, 0.065, 0, Q)
      cyl(s, 0.075, 0.015, 0, -0.065, 0, Q)
      spools.push(s)
    }
    curve(sewing, [[-0.12, 0.92, 0], [-0.24, 0.88, 0.05], [-0.33, 0.72, 0.1]], 'acc')
    for (let k = 0; k < 3; k++) cyl(ten21, 0.09, 0.24, -0.82 + k * 0.2, TOP + 0.12, 0.56, k === 1 ? A : P, 0.035)
    // The spec card: a coat flat that redraws itself.
    const specTexture = canvasTexture(384, 640, () => {})
    function drawSpec(t: number) {
      const c = specTexture.ctx,
        w = 384,
        h = 640
      panel(c, w, h)
      c.strokeStyle = C.ink
      c.lineWidth = 5
      c.lineJoin = 'round'
      c.beginPath()
      for (const [x, y] of [[150, 150], [90, 175], [52, 330], [92, 340], [112, 245], [112, 430], [272, 430], [272, 245], [292, 340], [332, 330], [294, 175], [234, 150], [192, 200]] as const) c.lineTo(x, y)
      c.closePath()
      c.stroke()
      c.beginPath()
      c.moveTo(192, 200)
      c.lineTo(192, 430)
      c.stroke()
      c.strokeStyle = C.acc
      c.setLineDash([9, 8])
      c.lineWidth = 3
      c.lineDashOffset = -t * 18
      c.strokeRect(126, 236, 52, 40)
      c.setLineDash([])
      print(c, 'TEN21', 28, 57, 24, C.acc, 650)
      print(c, 'PASHK COAT', 24, 103, 36, C.ink, 700)
      c.fillStyle = C.muted
      c.fillRect(25, 465, 334, 123)
      const texts = ['Cut in Pakistan.', 'Specced in Houston.', 'Embroidery sits', 'on the left chest.']
      const n = Math.floor(t * 0.7) % 4
      print(c, texts[n], 45, 505, 25, C.ink, 550)
      print(c, texts[(n + 1) % 4], 45, 547, 25, C.ink, 550)
      c.fillStyle = C.acc
      c.fillRect(27, 615, Math.max(10, ((t * 0.13) % 1) * 330), 5)
      specTexture.texture.needsUpdate = true
    }
    drawSpec(0)
    const specCard = moving(new THREE.Group())
    ten21.add(specCard)
    box(specCard, 0.62, 1.08, 0.04, 0.6, 1.5, -0.5)
    screen(specCard, 0.56, 0.98, 0.6, 1.5, -0.478, specTexture)
    cyl(ten21, 0.02, 0.9, 0.6, TOP + 0.45, -0.52, Q)

    // Integrations: three databases, the sync queue and data moving between them.
    const integrations = stations[1].group
    const dbX = [-0.62, 0, 0.62]
    dbX.forEach((x, k) => {
      for (let s = 0; s < 3; s++) cyl(integrations, 0.21, 0.13, x, TOP + 0.1 + s * 0.17, -0.4, k === 1 ? SA : SP)
      cyl(integrations, 0.21, 0.02, x, TOP + 0.6, -0.4, k === 1 ? A : P)
    })
    curve(integrations, [[-0.41, TOP + 0.35, -0.4], [-0.21, TOP + 0.42, -0.4]], 'acc')
    curve(integrations, [[0.21, TOP + 0.35, -0.4], [0.41, TOP + 0.42, -0.4]], 'acc')
    const pulses: THREE.Mesh[] = []
    for (let k = 0; k < 3; k++) pulses.push(moving(box(integrations, 0.06, 0.06, 0.06, 0, TOP + 0.38, -0.4, F)))
    const consoleTop = new THREE.Group()
    consoleTop.position.set(0, TOP + 0.3, 0.38)
    consoleTop.rotation.x = -0.55
    integrations.add(consoleTop)
    box(integrations, 1.6, 0.3, 0.5, 0, TOP + 0.15, 0.38, SP)
    box(consoleTop, 1.62, 0.07, 0.78, 0, 0, 0)
    const queue = canvasTexture(640, 340, () => {})
    function drawQueue(t: number) {
      const c = queue.ctx
      panel(c, 640, 340)
      print(c, 'SYNC QUEUE', 25, 45, 21, C.sub, 600)
      print(c, '03 / 08', 497, 45, 20, C.acc, 600)
      for (let i = 0; i < 3; i++) {
        const y = 74 + i * 76
        c.fillStyle = C.muted
        c.fillRect(21, y, 598, 61)
        c.fillStyle = i === 0 ? C.acc : C.sub
        c.fillRect(34, y + 10, 6, 41)
        print(c, ['Workday to PostgreSQL', 'Timesheet reconcile', 'Cost report refresh'][i], 58, y + 29, 19, C.ink)
        print(c, i === 0 ? 'SYNCING' : 'QUEUED', 58, y + 49, 11, i === 0 ? C.acc : C.sub, 600)
        c.fillStyle = C.paper
        c.fillRect(377, y + 26, 214, 7)
        c.fillStyle = i === 0 ? C.acc : C.sub
        c.fillRect(377, y + 26, i === 0 ? ((t * 0.15) % 1) * 214 : 41 + i * 27, 7)
      }
      queue.texture.needsUpdate = true
    }
    drawQueue(0)
    const qs = screen(consoleTop, 1.5, 0.7, 0, 0.037, 0, queue)
    qs.rotation.x = -Math.PI / 2

    // Engineering: a pipe spool with a gate valve and a pressure gauge, and the calculator on a monitor.
    const engineering = stations[2].group
    const py = TOP + 0.45,
      pz = 0.3
    const pipe = cyl(engineering, 0.1, 1.76, 0, py, pz)
    pipe.rotation.z = Math.PI / 2
    // Smooth surfaces have no edges to draw: give the pipe its silhouette strokes.
    for (const [dy, dz] of [[0.1, 0], [-0.1, 0], [0, 0.1], [0, -0.1]])
      polyline(engineering, [new THREE.Vector3(-0.88, py + dy, pz + dz), new THREE.Vector3(0.88, py + dy, pz + dz)], dz > 0 ? 'ink' : 'faint')
    for (const x of [-0.62, 0.62, -0.88, 0.88]) {
      const f = cyl(engineering, 0.18, 0.05, x, py, pz, Math.abs(x) < 0.7 ? P : Q)
      f.rotation.z = Math.PI / 2
    }
    for (const x of [-0.45, 0.45]) box(engineering, 0.12, py - TOP - 0.1, 0.2, x, TOP + (py - TOP - 0.1) / 2, pz)
    box(engineering, 0.3, 0.32, 0.3, -0.05, py, pz, SA)
    cyl(engineering, 0.06, 0.36, -0.05, py + 0.33, pz)
    const valveWheel = moving(new THREE.Group())
    valveWheel.position.set(-0.05, py + 0.53, pz)
    valveWheel.rotation.x = Math.PI / 2
    engineering.add(valveWheel)
    ring(valveWheel, 0.17, 0.016, 0, 0, 0, A)
    box(valveWheel, 0.34, 0.016, 0.016, 0, 0, 0, Q)
    box(valveWheel, 0.016, 0.34, 0.016, 0, 0, 0, Q)
    cyl(engineering, 0.022, 0.22, 0.5, py + 0.2, pz)
    const dial = cyl(engineering, 0.14, 0.05, 0.5, py + 0.42, pz)
    dial.rotation.x = Math.PI / 2
    const gaugeTex = canvasTexture(128, 128, (c) => {
      c.fillStyle = C.card
      c.beginPath()
      c.arc(64, 64, 62, 0, TAU)
      c.fill()
      c.strokeStyle = C.ink
      c.lineWidth = 3
      for (let k = 0; k <= 10; k++) {
        const a = Math.PI * 0.75 + (k / 10) * Math.PI * 1.5
        c.beginPath()
        c.moveTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50)
        c.lineTo(64 + Math.cos(a) * (k % 5 ? 42 : 36), 64 + Math.sin(a) * (k % 5 ? 42 : 36))
        c.stroke()
      }
      c.strokeStyle = C.acc
      c.lineWidth = 6
      c.beginPath()
      c.arc(64, 64, 50, Math.PI * 0.75 + Math.PI * 1.05, Math.PI * 2.25)
      c.stroke()
    })
    const face = screen(engineering, 0.26, 0.26, 0.5, py + 0.42, pz + 0.027, gaugeTex)
    face.userData.noEdges = true
    face.material.transparent = true
    const gaugeNeedle = moving(new THREE.Group())
    gaugeNeedle.position.set(0.5, py + 0.42, pz + 0.032)
    engineering.add(gaugeNeedle)
    box(gaugeNeedle, 0.012, 0.1, 0.006, 0, 0.04, 0, F)
    cyl(engineering, 0.04, 0.9, 0, TOP + 0.45, -0.55, Q)
    box(engineering, 1.9, 1.2, 0.07, 0, TOP + 1.45, -0.55, SP)
    const webTexture = canvasTexture(896, 592, (c, w, h) => {
      panel(c, w, h)
      c.fillStyle = C.muted
      c.fillRect(0, 0, w, 56)
      print(c, 'ENGIVAULT', 33, 100, 22, C.ink, 650)
      print(c, 'Fluids    Heat    Piping', 560, 98, 14, C.sub)
      c.strokeStyle = C.acc
      c.lineWidth = 6
      c.strokeRect(32, 131, 287, 401)
      c.lineWidth = 8
      c.beginPath()
      c.arc(175, 340, 92, 0, TAU)
      c.stroke()
      c.lineWidth = 4
      c.beginPath()
      c.arc(175, 340, 70, 0, TAU)
      c.moveTo(118, 340)
      c.lineTo(232, 340)
      c.lineTo(214, 324)
      c.moveTo(232, 340)
      c.lineTo(214, 356)
      c.stroke()
      print(c, 'PRESSURE', 52, 181, 29, C.acc, 700)
      print(c, 'DROP.', 52, 220, 29, C.acc, 700)
      print(c, 'Pipe flow.', 359, 197, 41, C.ink, 600)
      print(c, 'Method shown.', 359, 252, 41, C.ink, 600)
      print(c, 'Darcy-Weisbach with the', 362, 300, 19, C.sub)
      print(c, 'sources cited under it.', 362, 329, 19, C.sub)
      c.fillStyle = C.acc
      c.fillRect(359, 447, 279, 62)
      print(c, 'Open calculator  ↗', 384, 486, 22, C.accInk, 600)
      print(c, 'LUQMANISMAT.COM/ENGIVAULT', 33, 571, 12, C.sub)
    })
    screen(engineering, 1.8, 1.1, 0, TOP + 1.45, -0.514, webTexture)
    const calcTex = canvasTexture(220, 290, (c, w, h) => {
      panel(c, w, h)
      c.strokeStyle = C.ink
      c.lineWidth = 2
      c.strokeRect(15, 16, 190, 168)
      c.fillStyle = C.acc
      for (let i = 0; i < 5; i++) c.fillRect(36 + i * 32, 170 - (i * 19 + 22), 20, i * 19 + 22)
      print(c, 'RESULT', 17, 225, 23, C.ink, 600)
      c.fillStyle = C.muted
      c.fillRect(17, 244, 153, 6)
      c.fillRect(17, 258, 104, 5)
    })
    const resultCard = moving(new THREE.Group())
    engineering.add(resultCard)
    box(resultCard, 0.44, 0.58, 0.03, -0.72, TOP + 0.62, 0.62)
    screen(resultCard, 0.4, 0.53, -0.72, TOP + 0.62, 0.637, calcTex)

    // Intake: a filing cabinet with an inbox tray, and the briefs on a tablet.
    const intake = stations[3].group
    box(intake, 0.95, 1.36, 0.78, -0.3, TOP + 0.68, -0.1, SP)
    for (let k = 0; k < 3; k++) {
      box(intake, 0.85, 0.38, 0.03, -0.3, TOP + 0.24 + k * 0.44, 0.305)
      box(intake, 0.26, 0.035, 0.04, -0.3, TOP + 0.33 + k * 0.44, 0.33, A)
    }
    box(intake, 0.82, 0.04, 0.6, -0.3, TOP + 1.38, -0.1)
    for (const x of [-0.7, 0.1]) box(intake, 0.02, 0.1, 0.6, x, TOP + 1.43, -0.1, Q)
    box(intake, 0.82, 0.1, 0.02, -0.3, TOP + 1.43, -0.4, Q)
    const briefsTex = canvasTexture(480, 460, (c, w, h) => {
      panel(c, w, h)
      print(c, 'INCOMING BRIEFS', 30, 51, 27, C.ink, 600)
      print(c, 'This week · 3 new', 30, 81, 16, C.sub)
      ;['Turnaround schedule', 'Workday sync', 'Pressure drop check'].forEach((n, i) => {
        const y = 110 + i * 100
        c.fillStyle = C.muted
        c.fillRect(22, y, 436, 83)
        c.strokeStyle = i === 0 ? C.acc : C.sub
        c.lineWidth = 3
        c.beginPath()
        c.arc(58, y + 40, 18, 0, TAU)
        c.stroke()
        print(c, n[0], 51, y + 47, 20, i === 0 ? C.acc : C.sub, 600)
        print(c, n, 93, y + 33, 23, C.ink, 550)
        print(c, ['New', 'Scoping', 'In progress'][i], 93, y + 58, 15, C.sub)
        print(c, '↗', 410, y + 49, 25, C.acc)
      })
    })
    const tablet = new THREE.Group()
    tablet.position.set(0.55, TOP, 0.2)
    tablet.rotation.y = -0.35
    intake.add(tablet)
    cyl(tablet, 0.03, 0.75, 0, 0.375, -0.1, Q)
    box(tablet, 0.72, 0.7, 0.04, 0, 1.0, -0.1)
    screen(tablet, 0.66, 0.63, 0, 1.0, -0.078, briefsTex)
    const incoming = moving(new THREE.Group())
    intake.add(incoming)
    const newBriefTex = canvasTexture(432, 204, (c, w, h) => {
      c.fillStyle = C.acc
      c.fillRect(0, 0, w, h)
      c.strokeStyle = C.accInk
      c.lineWidth = 4
      c.beginPath()
      c.arc(58, 98, 30, 0, TAU)
      c.stroke()
      print(c, 'B', 47, 111, 32, C.accInk, 600)
      print(c, 'Your brief', 108, 91, 38, C.accInk, 600)
      print(c, 'New project  +', 108, 138, 23, C.accInk, 500)
    })
    box(incoming, 0.6, 0.3, 0.025, 0, 0, 0)
    screen(incoming, 0.58, 0.28, 0, 0, 0.014, newBriefTex)

    // Controls: a Gantt board with a moving today line, a status display and the report printer.
    const controlsSt = stations[4].group
    for (const x of [-0.92, 0.92]) cyl(controlsSt, 0.03, 1.55, x, TOP + 0.775, -0.42, Q)
    box(controlsSt, 1.95, 1.05, 0.05, 0, TOP + 1.18, -0.42, SP)
    // The living Gantt from the old scene, drawn on the board: bars fill as
    // the today line sweeps, and the critical path lights up when it lands.
    const gantt = moving(new THREE.Group())
    gantt.position.set(-0.82, TOP + 1.64, -0.39)
    gantt.scale.set(1.64 / (15 * WEEK), 0.95 / (scheduleBars.length * ROW), 1)
    controlsSt.add(gantt)
    segs(gantt, scheduleFrame(), 'faint')
    const barFillGeo = new THREE.BoxGeometry(1, ROW * 0.56, 0.04)
    const barFills = scheduleBars.map((b) => {
      const y = -b.row * ROW - ROW / 2
      segs(gantt, boxEdges(b.len * WEEK, ROW * 0.56, 0.04), 'ink').position.set(b.start * WEEK + (b.len * WEEK) / 2, y, 0.03)
      const m = new THREE.MeshBasicMaterial({ color: C.ink, transparent: true, opacity: 0.28, depthWrite: false })
      const mesh = new THREE.Mesh(barFillGeo, m)
      mesh.userData.noEdges = true
      mesh.position.set(b.start * WEEK, y, 0.03)
      gantt.add(mesh)
      return { b, mesh, m }
    })
    const todayLine = segs(
      gantt,
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.2, 0.06), new THREE.Vector3(0, -scheduleBars.length * ROW - 0.1, 0.06)]),
      'acc'
    )
    box(controlsSt, 0.9, 0.34, 0.06, -0.5, TOP + 0.42, 0.42)
    const statusTex = canvasTexture(512, 176, (c) => {
      panel(c, 512, 176)
      print(c, 'WEEK 41 STATUS', 22, 44, 23, C.sub, 600)
      print(c, 'On track', 26, 131, 66, C.acc, 600)
    })
    screen(controlsSt, 0.84, 0.29, -0.5, TOP + 0.42, 0.452, statusTex)
    box(controlsSt, 0.62, 0.3, 0.46, 0.5, TOP + 0.15, 0.35, SP)
    box(controlsSt, 0.44, 0.02, 0.05, 0.5, TOP + 0.31, 0.45, Q)
    const report = moving(new THREE.Group())
    report.position.set(0.5, TOP + 0.31, 0.46)
    report.rotation.x = -0.18
    controlsSt.add(report)
    const reportTex = canvasTexture(280, 540, (c, w, h) => {
      panel(c, w, h)
      print(c, 'STATUS REPORT', 25, 52, 24, C.ink, 650)
      print(c, 'Week 41', 25, 87, 19, C.sub)
      c.strokeStyle = C.sub
      c.setLineDash([5, 6])
      c.beginPath()
      c.moveTo(22, 115)
      c.lineTo(258, 115)
      c.stroke()
      c.setLineDash([])
      print(c, 'Critical path', 25, 154, 22, C.ink)
      print(c, 'Float: 3 days', 25, 190, 21, C.ink)
      print(c, 'ON TRACK', 25, 263, 31, C.acc, 650)
      print(c, 'Sent Friday', 25, 317, 24, C.sub)
      c.strokeStyle = C.ink
      c.lineWidth = 2
      c.beginPath()
      for (let i = 0; i < 9; i++) c.lineTo(25 + i * 27, 450 - Math.pow(i / 8, 1.6) * 80)
      c.stroke()
      print(c, 'No. 0041', 81, 496, 17, C.sub)
    })
    const rp = screen(report, 0.36, 0.7, 0, 0.35, 0, reportTex)
    rp.material.side = THREE.DoubleSide


    // ---- pieces carried over from the old scenes, built into the plate ----
    // Gyroscope core: the centrepiece inside the belt loop.
    cyl(machine, 0.34, 0.07, -1.55, 0.275, 0.95)
    cyl(machine, 0.028, 0.6, -1.55, 0.6, 0.95, Q)
    const coreGroup = moving(new THREE.Group())
    coreGroup.position.set(-1.55, 1.55, 0.95)
    coreGroup.scale.setScalar(0.4)
    machine.add(coreGroup)
    const coreMesh = segs(coreGroup, coreGeometry(), 'ink')
    const gyro = [gyroRing(1.7), gyroRing(2.15), gyroRing(2.6)].map((g, i) => segs(coreGroup, g, i === 0 ? 'acc' : 'faint'))

    // Heat exchanger: on its saddles at the back right, fed from the Engineering spool.
    const exchanger = moving(new THREE.Group())
    exchanger.position.set(4.5, 0.83, -2.75)
    exchanger.scale.setScalar(0.55)
    machine.add(exchanger)
    const ex = exchangerParts()
    segs(exchanger, ex.shell, 'ink')
    segs(exchanger, ex.nozzles, 'ink')
    segs(exchanger, ex.baffles, 'ink')
    segs(exchanger, ex.saddles, 'ink')
    segs(exchanger, ex.heads, 'ink')
    segs(exchanger, ex.heads, 'faint').scale.x = -1
    segs(exchanger, ex.sheets, 'acc')
    segs(exchanger, ex.sheets, 'acc').scale.x = -1
    segs(exchanger, tubesGeometry(), 'faint')
    const FLOW = 480
    const flowGeo = new THREE.BufferGeometry()
    flowGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(FLOW * 3), 3))
    flowGeo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(FLOW * 3), 3))
    const hash = (n: number) => {
      const x = Math.sin(n * 12.9898) * 43758.5453
      return x - Math.floor(x)
    }
    const flowSeeds = Array.from({ length: FLOW }, (_, i) => ({ tube: i < FLOW * 0.6, k: i % tubeOffsets.length, t: hash(i), a: hash(i + 7919) * TAU, r: 0.15 + hash(i + 104729) * 0.4 }))
    const flow = new THREE.Points(flowGeo, new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, depthWrite: false }))
    flow.raycast = () => {}
    flow.frustumCulled = false
    exchanger.add(flow)
    curve(machine, [[2.38, 1.04, -1.78], [2.95, 1.04, -1.78], [3.3, 1.62, -2.35], [3.62, 1.62, -2.75], [3.62, 1.36, -2.75]], 'ink')

    // Data network: sources on stands feed its database, which feeds Integrations.
    const network = new THREE.Group()
    network.position.set(-4.4, 1.15, -2.95)
    network.scale.setScalar(0.38)
    machine.add(network)
    const net = integrationLayout()
    segs(network, curvesGeometry(net.curves), 'faint')
    const nodeGeo = new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.13))
    const standPts: THREE.Vector3[] = []
    for (const n of net.nodes) {
      segs(network, nodeGeo, 'ink').position.copy(n)
      standPts.push(n.clone(), new THREE.Vector3(n.x, (0.27 - 1.15) / 0.38, n.z))
    }
    segs(network, new THREE.BufferGeometry().setFromPoints(standPts), 'faint')
    segs(network, databaseGeometry(), 'acc').position.copy(net.db)
    cyl(machine, 0.2, 0.55, -4.4 + net.db.x * 0.38, 0.52, -2.95, Q)
    curve(machine, [[-4.4 + net.db.x * 0.38 + 0.29, 1.05, -2.95], [-2.9, 1.0, -2.75], [-2.27, 0.95, -2.43]], 'acc')
    const PULSES = 36
    const pulseGeo = new THREE.BufferGeometry()
    pulseGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(PULSES * 3), 3))
    const netPulses = new THREE.Points(pulseGeo, new THREE.PointsMaterial({ color: C.acc, size: 0.14 }))
    netPulses.raycast = () => {}
    netPulses.frustumCulled = false
    network.add(netPulses)
    const pulseSeeds = Array.from({ length: PULSES }, (_, i) => ({ curve: i % net.curves.length, t: (i * 0.137) % 1 }))

    // Desk globe with Houston pinned, on the front-left corner.
    cyl(machine, 0.3, 0.06, -5.3, 0.27, 2.75)
    cyl(machine, 0.025, 0.36, -5.3, 0.48, 2.75, Q)
    const globeTilt = new THREE.Group()
    globeTilt.position.set(-5.3, 1.2, 2.75)
    globeTilt.rotation.z = 0.41
    machine.add(globeTilt)
    polyline(globeTilt, Array.from({ length: 33 }, (_, i) => {
      const a = -Math.PI / 2 + (i / 32) * Math.PI
      return new THREE.Vector3(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0)
    }), 'ink')
    const globe = moving(new THREE.Group())
    globe.scale.setScalar(0.32)
    globeTilt.add(globe)
    segs(globe, globeGeometry(1.7), 'faint')
    const pin = latLon(HOUSTON.lat, HOUSTON.lon, 1.7)
    segs(globe, new THREE.BufferGeometry().setFromPoints([pin, pin.clone().multiplyScalar(1.35)]), 'acc')
    const haloMat = lines.acc.clone()
    haloMat.transparent = true
    const halo = new THREE.LineSegments(gyroRing(0.16), haloMat)
    halo.raycast = () => {}
    halo.position.copy(pin.clone().multiplyScalar(1.01))
    halo.lookAt(0, 0, 0)
    globe.add(halo)

    // Portal: where new briefs come in, at the Intake edge of the plate.
    const portalAt = new THREE.Vector3(5.72, 1.36, 0.12)
    box(machine, 0.5, 0.05, 1.4, 5.85, 0.27, 0.12, Q)
    const portal = moving(new THREE.Group())
    portal.position.copy(portalAt)
    portal.rotation.y = -Math.PI / 2
    portal.scale.setScalar(0.24)
    machine.add(portal)
    const portalRings = new THREE.Group()
    portal.add(portalRings)
    segs(portalRings, portalGeometry(), 'ink')
    const portalCore = segs(portal, new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.42, 1)), 'acc')

    // ---- the belt ----
    const path = new THREE.CatmullRomCurve3(
      ([
        [-3.95, 0.84, 0.65], [-3.1, 0.84, -0.12], [-1.45, 0.84, -0.79], [1.32, 0.84, -0.8], [3.3, 0.84, 0.19],
        [3.43, 0.84, 1.21], [1.35, 0.84, 2.7], [-1.4, 0.84, 2.52], [-3.54, 0.84, 1.65],
      ] as Vec3[]).map((p) => new THREE.Vector3(...p)),
      true,
      'catmullrom',
      0.25
    )
    const belt = new THREE.Group()
    machine.add(belt)
    // Ties drawn as short strokes across the belt, moved along the path.
    const beltCount = 120
    const tiePos = new Float32Array(beltCount * 6)
    const tieGeo = new THREE.BufferGeometry()
    tieGeo.setAttribute('position', new THREE.BufferAttribute(tiePos, 3).setUsage(THREE.DynamicDrawUsage))
    const ties = new THREE.LineSegments(tieGeo, lines.faint)
    ties.raycast = () => {}
    ties.frustumCulled = false
    belt.add(ties)
    const pVec = new THREE.Vector3(),
      tVec = new THREE.Vector3()
    function updateBelt(t: number) {
      for (let i = 0; i < beltCount; i++) {
        const u = (i / beltCount + t * 0.012) % 1
        path.getPointAt(u, pVec)
        path.getTangentAt(u, tVec)
        const nx = -tVec.z * 0.3,
          nz = tVec.x * 0.3
        tiePos.set([pVec.x - nx, pVec.y + 0.06, pVec.z - nz, pVec.x + nx, pVec.y + 0.06, pVec.z + nz], i * 6)
      }
      tieGeo.attributes.position.needsUpdate = true
    }
    updateBelt(0)
    for (const side of [-1, 1])
      for (const dy of [0.09, -0.12]) {
        const ps = []
        for (let i = 0; i <= 200; i++) {
          path.getPointAt(i / 200, pVec)
          path.getTangentAt(i / 200, tVec)
          ps.push(pVec.clone().add(new THREE.Vector3(-tVec.z * 0.36 * side, dy, tVec.x * 0.36 * side)))
        }
        polyline(belt, ps, dy > 0 ? 'ink' : 'faint')
      }
    for (let i = 0; i < 16; i++) {
      const p = path.getPointAt(i / 16)
      cyl(belt, 0.04, 0.43, p.x, 0.53, p.z, Q)
    }
    // Service lines link the station footings, drawn as single strokes.
    const pipes = new THREE.Group()
    machine.add(pipes)
    for (let i = 0; i < 4; i++) {
      const a = stations[i].base,
        b = stations[i + 1].base
      polyline(
        pipes,
        new THREE.CatmullRomCurve3([
          a.clone().add(new THREE.Vector3(0.4, 0.12, 0)),
          a.clone().lerp(b, 0.35).add(new THREE.Vector3(0, 0.1, -0.6)),
          a.clone().lerp(b, 0.65).add(new THREE.Vector3(0, 0.1, -0.6)),
          b.clone().add(new THREE.Vector3(-0.4, 0.12, 0)),
        ]).getPoints(40),
        'faint'
      )
    }

    // ---- the cards that ride the belt: brief, spec, data, calculation, report ----
    const card = (label: string, sub: string, body: (c: CanvasRenderingContext2D) => void) =>
      canvasTexture(256, 352, (c, w, h) => {
        panel(c, w, h)
        print(c, label, 22, 48, 24, C.ink, 650)
        print(c, sub, 22, 82, 15, C.sub)
        body(c)
      })
    const briefCard = card('BRIEF', 'Project / 01', (c) => {
      c.strokeStyle = C.acc
      c.lineWidth = 3
      c.strokeRect(22, 110, 212, 140)
      print(c, 'Scope', 40, 190, 34, C.acc, 600)
    })
    const specCardTex = card('SPEC', 'Drawn first', (c) => {
      for (let i = 0; i < 9; i++) {
        c.fillStyle = i === 4 ? C.acc : C.muted
        c.fillRect(22, 110 + i * 21, 190 - (i % 3) * 24, 7)
      }
      print(c, 'DONE  ✓', 22, 327, 17, C.acc, 600)
    })
    const dataCard = card('DATA', 'One source of truth', (c) => {
      for (let r = 0; r < 8; r++)
        for (let k = 0; k < 3; k++) {
          c.fillStyle = r === 0 ? C.acc : C.muted
          c.fillRect(22 + k * 70, 112 + r * 26, 60, 16)
        }
    })
    const packetTextures = [briefCard, specCardTex, dataCard, calcTex, reportTex]
    const packets: Array<{
      group: THREE.Group
      faces: THREE.Mesh< THREE.PlaneGeometry, THREE.MeshBasicMaterial>[]
      halo: THREE.Mesh
      stage: number
      phase: number
    }> = []
    for (let i = 0; i < 6; i++) {
      const g = moving(new THREE.Group())
      machine.add(g)
      box(g, 0.47, 0.71, 0.03, 0, 0, 0)
      const faces = packetTextures.map((tex) => {
        const s = screen(g, 0.43, 0.665, 0, 0, 0.017, tex)
        s.material.side = THREE.DoubleSide
        s.userData.noEdges = true
        s.visible = false
        return s
      })
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.4, 0.414, 40),
        new THREE.MeshBasicMaterial({ color: C.acc, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })
      )
      halo.rotation.x = -Math.PI / 2
      halo.position.y = -0.37
      halo.userData.noEdges = true
      g.add(halo)
      halo.visible = false
      packets.push({ group: g, faces, halo, stage: -1, phase: 0 })
    }
    function nearestPort(x: number, z: number) {
      let best = 0,
        dist = Infinity
      for (let i = 0; i < 300; i++) {
        const p = path.getPointAt(i / 300),
          d = (p.x - x) ** 2 + (p.z - z) ** 2
        if (d < dist) {
          dist = d
          best = i / 300
        }
      }
      return best
    }
    const adminU = nearestPort(-1.65, -0.7)
    const storeU = nearestPort(1.5, -0.7)
    const cashU = nearestPort(0.93, 2.65)

    // ---- merge static parts, then draw every edge ----
    function compact(group: THREE.Object3D) {
      for (const child of [...group.children]) if ((child as THREE.Group).isGroup && !child.userData.moving) compact(child)
      const buckets = new Map< string, THREE.Mesh< THREE.BufferGeometry, THREE.MeshBasicMaterial>[]>()
      for (const object of group.children) {
        const child = object as THREE.Mesh< THREE.BufferGeometry, THREE.MeshBasicMaterial>
        if (!child.isMesh || (child as unknown as THREE.InstancedMesh).isInstancedMesh || child.userData.moving || child.userData.noEdges || child.material.map) continue
        const k = child.material.uuid
        if (!buckets.has(k)) buckets.set(k, [])
        buckets.get(k)!.push(child)
      }
      for (const list of buckets.values()) {
        if (list.length < 2) continue
        const geos = list.map((m) => {
          m.updateMatrix()
          return (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrix)
        })
        const merged = mergeGeometries(geos, false)
        for (const geo of geos) geo.dispose()
        if (!merged) continue
        for (const m of list) group.remove(m)
        group.add(new THREE.Mesh(merged, list[0].material))
      }
    }
    compact(machine)
    const edgeCache = new Map< string, THREE.EdgesGeometry>()
    function wire(obj: THREE.Object3D, station?: Station) {
      const meshes: THREE.Mesh[] = []
      obj.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.isMesh && !(m as THREE.InstancedMesh).isInstancedMesh && !m.userData.noEdges && !m.userData.wired) meshes.push(m)
      })
      for (const m of meshes) {
        m.userData.wired = true
        const mat = m.material as THREE.Material
        const kind = (mat.userData.line ?? 'ink') as LineKind
        let lm = kind === 'ink' && station ? station.line : lines[kind]
        if (mat.clippingPlanes?.length) lm = clipLine(lm)
        if (!edgeCache.has(m.geometry.uuid)) edgeCache.set(m.geometry.uuid, new THREE.EdgesGeometry(m.geometry, 24))
        const e = new THREE.LineSegments(edgeCache.get(m.geometry.uuid)!, lm)
        e.raycast = () => {}
        m.add(e)
      }
    }
    stations.forEach((s) => wire(s.group, s))
    wire(machine)
    stations.forEach((s) =>
      s.group.traverse((o) => {
        o.userData.station = s.id
      })
    )
    const pickables = stations.map((s) => s.group)

    // ---- state, camera and controls ----
    let mode: MachineMode = 'assembled',
      cameraMode: MachineCamera = 'overview',
      playing = !reduceMotion,
      halted = false,
      simTime = 0,
      spread = 0,
      selected: string = 'engine',
      hovered: string | null = null
    let width = frameWidth(),
      height = frameHeight(),
      mobile = width <= 900,
      lastInteraction = performance.now(),
      dragging = false,
      wasDragged = false,
      downX = 0,
      downY = 0
    let cameraAnimating = true,
      flightTime = 0,
      lastDraw = -1,
      visible = true,
      contextLost = false
    const desiredPosition = new THREE.Vector3(),
      desiredTarget = new THREE.Vector3(0, 1, 0)
    const viewDirection = new THREE.Vector3(10.5, 10.8, 17).normalize()
    const focusLean: Record< MachineStationId, [number, number]> = {
      engine: [0, 0],
      admin: [-0.9, -0.3],
      storefront: [1.2, -0.3],
      cabinet: [0.6, 0],
      cashdesk: [-0.6, -0.2],
    }
    let baseDistance = 25,
      sized = false,
      readySent = false
    function layoutCamera() {
      if (!frameWidth() || !frameHeight()) return
      const first = !sized
      sized = true
      width = frameWidth()
      height = frameHeight()
      mobile = width <= 900
      renderer.setSize(width, height)
      camera.aspect = width / height
      // Embedded in a wide hero, a shifted frustum centres the machine in the
      // right 58 %; on a narrow embed it rises into the top of the frame so
      // copy can sit underneath.
      camera.setViewOffset(width, height, mobile || !embedded ? 0 : -width * 0.21, embedded ? (mobile ? height * 0.17 : 0) : height * 0.025, width, height)
      const aspect = width / height
      const availableWidth = mobile ? 0.91 : Math.min(0.55, aspect > 2 ? 0.54 : 0.57)
      const tan = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      const horizontalFit = 17.3 / (tan * aspect * availableWidth)
      const verticalFit = 11.5 / (tan * (embedded ? 0.85 : 0.62))
      baseDistance = (Math.max(horizontalFit, verticalFit) * (mobile ? 0.97 : 1)) / (embedded ? (mobile ? 1.15 : 1.28) : 1)
      controls.maxDistance = Math.max(55, baseDistance * 1.6)
      camera.updateProjectionMatrix()
      setCameraGoal()
      cameraAnimating = true
      if (first) {
        camera.position.copy(desiredPosition)
        controls.target.copy(desiredTarget)
        controls.update()
        cameraAnimating = false
      }
    }
    function setCameraGoal() {
      const expand = mode === 'stations' ? 1.2 : 1
      if (cameraMode === 'station') {
        const s = stations.find((s) => s.id === selected)!
        // Lean the shot toward the old piece each station shares the plate with.
        const lean = focusLean[s.id]
        desiredTarget.copy(s.group.position).add(new THREE.Vector3(lean[0], 1.1, lean[1]))
        desiredPosition.copy(desiredTarget).addScaledVector(viewDirection, mobile ? 8.5 : 10)
      } else {
        desiredTarget.set(0, 1, 0)
        const distance = baseDistance * expand
        if (cameraMode === 'side') desiredPosition.set(13, 5, 20).normalize().multiplyScalar(distance).add(desiredTarget)
        else if (cameraMode === 'top') desiredPosition.set(0.01, distance, 0.8).add(desiredTarget)
        else desiredPosition.copy(viewDirection).multiplyScalar(distance).add(desiredTarget)
      }
    }
    function syncButtons() {
      root.querySelectorAll< HTMLElement>('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)))
      root.querySelectorAll< HTMLElement>('[data-camera]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.camera === cameraMode)))
      $('journey').classList.toggle('visible', mode === 'order')
    }
    const modes: MachineMode[] = ['assembled', 'cutaway', 'stations', 'order']
    const cameras: MachineCamera[] = ['overview', 'side', 'top', 'station', 'flight']
    function setMode(name: string) {
      if (!modes.includes(name as MachineMode)) return false
      mode = name as MachineMode
      lastInteraction = performance.now()
      if (mode === 'order') {
        simTime = 0
        lastDraw = -1
        play()
        cameraMode = 'overview'
      } else if (cameraMode === 'station') cameraMode = 'overview'
      setCameraGoal()
      cameraAnimating = true
      syncButtons()
      return true
    }
    function focusStation(id: string) {
      if (!stations.some((s) => s.id === id)) return false
      selected = id
      if (mode === 'order') mode = 'assembled'
      cameraMode = 'station'
      lastInteraction = performance.now()
      setCameraGoal()
      cameraAnimating = true
      syncButtons()
      return true
    }
    function setCamera(name: string) {
      if (!cameras.includes(name as MachineCamera)) return false
      cameraMode = name as MachineCamera
      if (mode === 'order') mode = 'assembled'
      lastInteraction = performance.now()
      flightTime = 0
      setCameraGoal()
      cameraAnimating = true
      syncButtons()
      return true
    }
    function syncPlayback() {
      const b = $('play')
      b.setAttribute('aria-label', playing ? 'Pause the animation' : 'Resume the animation')
      b.setAttribute('aria-pressed', String(!playing))
      $('status').classList.toggle('paused', !playing)
      $('status-text').textContent = playing ? 'Machine running' : 'Machine paused'
    }
    function play() {
      playing = true
      syncPlayback()
      return true
    }
    function pause() {
      playing = false
      syncPlayback()
      return true
    }
    function halt(next: boolean) {
      halted = next
      lastFrame = performance.now()
    }
    api = { setMode, focusStation, setCamera, play, pause, halt }
    root.querySelectorAll< HTMLElement>('[data-mode]').forEach((b) => listen(b, 'click', () => setMode(b.dataset.mode ?? '')))
    root.querySelectorAll< HTMLElement>('[data-camera]').forEach((b) => listen(b, 'click', () => setCamera(b.dataset.camera ?? '')))
    listen($('play'), 'click', () => (playing ? pause() : play()))
    syncPlayback()
    layoutCamera()
    camera.position.copy(desiredPosition)
    controls.target.copy(desiredTarget)
    controls.update()
    cameraAnimating = false
    const resizeObserver = new ResizeObserver(() => layoutCamera())
    resizeObserver.observe(root)
    cleanups.push(() => resizeObserver.disconnect())
    controls.addEventListener('start', () => {
      dragging = true
      cameraAnimating = false
      lastInteraction = performance.now()
    })
    controls.addEventListener('end', () => {
      dragging = false
      lastInteraction = performance.now()
    })
    const raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2(),
      tooltip = $('tooltip')
    const local = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      return [e.clientX - r.left, e.clientY - r.top] as const
    }
    function hitStation(x: number, y: number) {
      pointer.set((x / width) * 2 - 1, (-y / height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(pickables, true)
      const id = hits.find((h) => h.object.userData.station)?.object.userData.station
      return id ? stations.find((s) => s.id === id) : null
    }
    listen(renderer.domElement, 'pointermove', (e: PointerEvent) => {
      const [x, y] = local(e)
      if (Math.hypot(x - downX, y - downY) > 5) wasDragged = true
      if (dragging) return
      const s = hitStation(x, y)
      hovered = s ? s.id : null
      renderer.domElement.style.cursor = s ? 'pointer' : 'grab'
      tooltip.classList.toggle('visible', !!s)
      if (s) {
        tooltip.querySelector('strong')!.textContent = s.name
        tooltip.querySelector('p')!.textContent = s.desc
        tooltip.style.left = Math.min(width - 255, Math.max(10, x + 16)) + 'px'
        tooltip.style.top = Math.max(10, Math.min(height - 95, y - 65)) + 'px'
      }
    })
    listen(renderer.domElement, 'pointerleave', () => {
      hovered = null
      tooltip.classList.remove('visible')
    })
    listen(renderer.domElement, 'pointerdown', (e: PointerEvent) => {
      ;[downX, downY] = local(e)
      wasDragged = false
      tooltip.classList.remove('visible')
    })
    listen(renderer.domElement, 'pointerup', (e: PointerEvent) => {
      if (wasDragged) return
      const s = hitStation(...local(e))
      if (!s) return
      focusStation(s.id)
      options.onStation?.(s.id)
    })
    listen(document, 'visibilitychange', () => {
      visible = !document.hidden
      lastFrame = performance.now()
    })
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting && !document.hidden
        lastFrame = performance.now()
      },
      { threshold: 0.01 }
    )
    observer.observe(renderer.domElement)
    cleanups.push(() => observer.disconnect())
    listen(renderer.domElement, 'webglcontextlost', (e: Event) => {
      e.preventDefault()
      contextLost = true
      showError('The graphics context was interrupted. The scene comes back on its own once WebGL is available again.')
    })
    listen(renderer.domElement, 'webglcontextrestored', () => {
      contextLost = false
      $('error').style.display = 'none'
      lastFrame = performance.now()
    })

    // ---- the loop ----
    const scratch = new THREE.Vector3(),
      anchor = new THREE.Vector3(),
      inkColor = new THREE.Color(C.ink),
      accColor = new THREE.Color(C.acc),
      flowColor = new THREE.Color()
    const journeySteps = [
      ['New brief', 'Intake: scope, data and deadline'],
      ['Drawing the spec', 'TEN21 workshop: drawn before it is made'],
      ['Syncing the data', 'Integrations: one source of truth'],
      ['Running the numbers', 'Engineering: method shown'],
      ['Report issued', 'Controls: the team reads it on Friday'],
    ]
    const labelOffsets = {
      mobile: [[-30, 25], [-27, -50], [15, -65], [16, -1], [-5, 52]],
      wide: [[-48, -14], [-8, -64], [30, -12], [30, 20], [-12, 40]],
    }
    let prevJourney = -1,
      lastFrame = performance.now(),
      frameCount = 0,
      measureTime = 0,
      pixelRatio = renderer.getPixelRatio(),
      rafId = 0
    function animate(now: number) {
      rafId = requestAnimationFrame(animate)
      const dt = Math.max(0, Math.min((now - lastFrame) / 1000, 0.045))
      lastFrame = now
      if (!visible || contextLost || halted) return
      if (playing) {
        simTime += dt
        flightTime += dt
      }
      const t = simTime,
        beat = (t / 4) % 1,
        tact = (t * TAU) / 4,
        smooth = 1 - Math.exp(-dt * 5)
      spread = THREE.MathUtils.lerp(spread, mode === 'stations' ? 1 : 0, smooth)
      cutPlane.constant = THREE.MathUtils.lerp(cutPlane.constant, mode === 'cutaway' ? 0.99 : 10, smooth)
      stations.forEach((s, i) => {
        s.group.position.copy(s.base)
        s.group.position.x *= 1 + spread * 0.29
        s.group.position.z *= 1 + spread * 0.37
        s.group.position.y += spread * (i % 2 ? 0.32 : 0.55)
        const on = hovered === s.id || (cameraMode === 'station' && selected === s.id)
        s.line.color.lerp(on ? accColor : inkColor, smooth)
        clipped.get(s.line)?.color.copy(s.line.color)
      })
      belt.scale.set(1 + spread * 0.12, 1, 1 + spread * 0.15)
      pipes.scale.set(1 + spread * 0.25, 1, 1 + spread * 0.3)
      // TEN21: the needle runs, the spools and handwheel turn.
      needle.position.y = 0.4 + Math.abs(Math.sin(t * 7)) * 0.06
      handwheel.rotation.x = t * 2.2
      spools.forEach((s, i) => (s.rotation.y = t * (i ? -1.6 : 1.6)))
      specCard.position.y = Math.sin(tact) * 0.04
      // Integrations: data hops from database to database.
      pulses.forEach((p, i) => {
        const f = (t * 0.5 + i / 3) % 1
        p.position.x = -0.62 + f * 1.24
        p.position.y = TOP + 0.38 + Math.sin(f * Math.PI * 2) * 0.03
        p.visible = Math.abs(p.position.x) > 0.24 || Math.abs(p.position.x) < 0.02
      })
      // Engineering: the handwheel creeps, the gauge needle settles and hunts.
      valveWheel.rotation.z = Math.sin(t * 0.4) * 1.4
      gaugeNeedle.rotation.z = -0.4 + Math.sin(t * 0.9) * 0.35 + Math.sin(t * 3.1) * 0.04
      resultCard.position.y = Math.sin(tact + 1) * 0.04
      // Controls: the today line walks the schedule and the report prints.
      const orderPhase = (t / 24) % 1
      const weekNow = (t * 1.4) % 18
      todayLine.position.x = Math.min(weekNow, 15) * WEEK
      const landed = weekNow > 15.2
      barFills.forEach(({ b, mesh, m }) => {
        const f = Math.max(THREE.MathUtils.clamp((weekNow - b.start) / b.len, 0, 1), 0.001)
        mesh.scale.x = f * b.len * WEEK
        mesh.position.x = b.start * WEEK + (f * b.len * WEEK) / 2
        const lit = b.critical && landed
        m.color.copy(lit ? accColor : inkColor)
        m.opacity = lit ? 0.85 : 0.28
      })
      // Old pieces: the core turns in its rings, records pulse into the network
      // database, the exchanger runs counter-current, the globe turns to Houston.
      coreMesh.rotation.y = t * 0.25
      coreMesh.rotation.x = Math.sin(t * 0.3) * 0.3
      gyro[0].rotation.x = t * 0.35
      gyro[1].rotation.y = t * 0.28
      gyro[2].rotation.x = Math.PI / 2 + Math.sin(t * 0.2) * 0.5
      gyro[2].rotation.z = t * 0.18
      const pp = pulseGeo.attributes.position.array as Float32Array
      const netBeat = 0.5 + 0.5 * Math.sin(t * 0.8)
      pulseSeeds.forEach((sd, i) => {
        sd.t = (sd.t + dt * (playing ? 1 : 0) * (0.18 + netBeat * 0.35) * (0.7 + (i % 5) * 0.12)) % 1
        const q = net.curves[sd.curve].getPointAt(sd.t)
        pp[i * 3] = q.x
        pp[i * 3 + 1] = q.y
        pp[i * 3 + 2] = q.z
      })
      pulseGeo.attributes.position.needsUpdate = true
      const fp = flowGeo.attributes.position.array as Float32Array,
        fc = flowGeo.attributes.color.array as Float32Array
      const L = EX.length,
        flowSpeed = (0.12 + 0.1 * Math.sin(t * 0.5)) * (playing ? 1 : 0)
      flowSeeds.forEach((sd, i) => {
        sd.t = (sd.t + dt * flowSpeed * (sd.tube ? 1 : 0.6)) % 1
        let k: number
        if (sd.tube) {
          const [ty, tz] = tubeOffsets[sd.k]
          fp.set([-L / 2 + sd.t * L, ty, tz], i * 3)
          k = sd.t
        } else {
          fp.set([L / 2 - sd.t * L, Math.cos(sd.a) * sd.r * 0.9 + Math.sin(sd.t * Math.PI * 6) * 0.18, Math.sin(sd.a + sd.t * 4) * sd.r], i * 3)
          k = 1 - sd.t * 0.85
        }
        flowColor.copy(accColor).lerp(inkColor, k)
        fc.set([flowColor.r, flowColor.g, flowColor.b], i * 3)
      })
      flowGeo.attributes.position.needsUpdate = true
      flowGeo.attributes.color.needsUpdate = true
      globe.rotation.y = -Math.atan2(pin.x, pin.z) + 0.6 + Math.sin(t * 0.25) * 0.5
      halo.scale.setScalar(1 + (t % 1.6) * 0.9)
      haloMat.opacity = 1 - (t % 1.6) / 1.7
      portalRings.rotation.z = t * 0.12
      portalCore.rotation.y = t * 0.6
      portalCore.rotation.x = t * 0.3
      const printBeat = mode === 'order' ? THREE.MathUtils.clamp((orderPhase - 0.88) / 0.12, 0, 1) : beat
      report.visible = mode !== 'order' || orderPhase > 0.88
      report.scale.y = 0.15 + Math.min(1, printBeat * 1.4) * 0.85
      // Intake: a new brief drops into the tray.
      const incomingBeat = mode === 'order' ? Math.min(1, orderPhase / 0.15) : beat
      incoming.visible = mode !== 'order' || orderPhase < 0.15
      // From the portal's mouth into the tray.
      incoming.position.set(
        THREE.MathUtils.lerp(portalAt.x - stations[3].base.x, -0.3, incomingBeat),
        THREE.MathUtils.lerp(portalAt.y - stations[3].base.y, TOP + 1.45, incomingBeat) + Math.sin(incomingBeat * Math.PI) * 0.6,
        THREE.MathUtils.lerp(0, -0.1, incomingBeat)
      )
      incoming.rotation.set(-Math.PI / 2 * Math.min(1, incomingBeat * 1.3), Math.PI / 2 * (1 - Math.min(1, incomingBeat * 2)), Math.sin(incomingBeat * Math.PI) * -0.14)
      incoming.scale.setScalar(Math.min(1, incomingBeat * 8 + 0.15, (1 - incomingBeat) * 7 + 0.1))
      if (t - lastDraw > 1 / 18 || lastDraw < 0) {
        drawSpec(t)
        drawQueue(t)
        updateBelt(t)
        lastDraw = t
      }
      packets.forEach((packet, i) => {
        const phase = (t / 24 + i / 6) % 1
        packet.phase = phase
        let stage
        if (phase < 0.15) {
          stage = 0
          const f = phase / 0.15
          packet.group.position.copy(stations[3].group.position).add(new THREE.Vector3(0, 1.6, 0.6))
          scratch.copy(stations[0].group.position).add(new THREE.Vector3(0, 1.3, 0.65))
          packet.group.position.lerp(scratch, f)
          packet.group.position.y += Math.sin(f * Math.PI) * 2
          packet.group.rotation.set(0, Math.sin(f * Math.PI) * 0.28, Math.sin(f * Math.PI) * -0.1)
        } else {
          const u = ((phase - 0.15) / 0.85) * cashU
          path.getPointAt(u, packet.group.position)
          packet.group.position.x *= 1 + spread * 0.12
          packet.group.position.z *= 1 + spread * 0.15
          packet.group.position.y += 0.43
          packet.group.rotation.set(0, 0.18, 0)
          stage = u < adminU * 0.7 ? 1 : u < storeU * 0.96 ? 2 : u < cashU * 0.83 ? 3 : 4
        }
        if (packet.stage !== stage) {
          packet.faces.forEach((f, j) => (f.visible = j === stage))
          packet.stage = stage
        }
        packet.group.visible = mode !== 'order' || i === 0
        packet.halo.visible = mode === 'order' && i === 0
        packet.group.scale.setScalar(mode === 'order' ? 1.35 : 1)
        if (phase > 0.94) packet.group.scale.multiplyScalar(Math.max(0.05, (1 - phase) / 0.06))
      })
      if (mode === 'order') {
        const packet = packets[0],
          step = packet.stage
        if (step !== prevJourney) {
          $('journey-title').textContent = journeySteps[step][0]
          $('journey-detail').textContent = journeySteps[step][1]
          prevJourney = step
        }
        $('journey-progress').style.width = packet.phase * 100 + '%'
        if (!dragging && playing) {
          desiredTarget.copy(packet.group.position)
          desiredPosition.copy(desiredTarget).addScaledVector(viewDirection, mobile ? 10 : 15)
          cameraAnimating = true
        }
      } else if (cameraMode === 'flight' && playing && !dragging) {
        const a = flightTime * 0.12,
          d = baseDistance * (mode === 'stations' ? 1.2 : 1)
        desiredTarget.set(0, 1, 0)
        desiredPosition.set(Math.sin(a + 0.55) * d * 0.83, d * (0.5 + Math.sin(a * 0.7) * 0.09), Math.cos(a + 0.55) * d * 0.83).add(desiredTarget)
        cameraAnimating = true
      } else if (cameraMode === 'station' && cameraAnimating) setCameraGoal()
      if (cameraAnimating && !dragging) {
        const speed = reduceMotion ? 1 : 1 - Math.exp(-dt * (mode === 'order' ? 2.2 : 3))
        camera.position.lerp(desiredPosition, speed)
        controls.target.lerp(desiredTarget, speed)
        if (cameraMode !== 'flight' && mode !== 'order' && camera.position.distanceTo(desiredPosition) < 0.015 && controls.target.distanceTo(desiredTarget) < 0.015)
          cameraAnimating = false
      }
      controls.autoRotate = playing && !reduceMotion && !dragging && !cameraAnimating && mode !== 'order' && cameraMode === 'overview' && now - lastInteraction > 6500
      controls.autoRotateSpeed = 0.24
      controls.update(dt)
      stations.forEach((s, i) => {
        const show = mode === 'stations'
        s.label.classList.toggle('visible', show)
        if (!show) return
        anchor.copy(s.group.position).add(s.anchor).project(camera)
        const [ox, oy] = (mobile ? labelOffsets.mobile : labelOffsets.wide)[i]
        const x = THREE.MathUtils.clamp((anchor.x * 0.5 + 0.5) * width - 40 + ox, mobile || !embedded ? 9 : width * 0.425, width - (mobile ? 123 : 165))
        const y = THREE.MathUtils.clamp((-anchor.y * 0.5 + 0.5) * height - 52 + oy, 130, height - 200)
        s.label.style.transform = `translate(${x}px,${y}px)`
      })
      renderer.render(scene, camera)
      if (!readySent && sized) {
        readySent = true
        options.onReady?.()
      }
      // Reduce only raster resolution on sustained slow devices.
      if (playing) {
        frameCount++
        measureTime += dt
        if (measureTime > 4) {
          if (frameCount / measureTime < 43 && pixelRatio > 1) {
            pixelRatio = Math.max(1, pixelRatio - 0.25)
            renderer.setPixelRatio(pixelRatio)
          }
          frameCount = 0
          measureTime = 0
        }
      }
    }
    rafId = requestAnimationFrame(animate)
    cleanups.push(() => {
      cancelAnimationFrame(rafId)
      controls.dispose()
      const textures = new Set< THREE.Texture>()
      const materials = new Set< THREE.Material>()
      const geos = new Set< THREE.BufferGeometry>()
      scene.traverse((object) => {
        const m = object as THREE.Mesh
        if (m.geometry) geos.add(m.geometry)
        const list = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : []
        for (const material of list) {
          materials.add(material)
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value)
        }
      })
      geos.forEach((g) => g.dispose())
      geometries.forEach((g) => g.dispose())
      edgeCache.forEach((g) => g.dispose())
      materials.forEach((m) => m.dispose())
      textures.forEach((t) => t.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    })
    renderer.compile(scene, camera)
    $('loading').classList.add('done')
    $('error').style.display = 'none'
  } catch (error) {
    console.error('Machine: failed to start', error)
    showError()
  }
  return { dispose, api }
}
