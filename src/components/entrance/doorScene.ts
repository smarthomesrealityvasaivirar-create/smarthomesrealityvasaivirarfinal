/**
 * Real-time 3D entrance: a carved walnut double door with brass medallion + pulls, modelled in three.js
 * (real geometry, thickness, PBR wood + brass, warm spot lights, soft shadows). No cropped photos.
 * Loaded lazily by DoorEntrance so it never blocks the homepage.
 */
import * as THREE from 'three'

export type DoorScene = { open: () => void; dispose: () => void }

const DOOR_W = 0.92 // one leaf
const DOOR_H = 2.45
const DOOR_T = 0.065
const OPEN_MS = 2700

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t
  const sy = (t: number) => ((ay * t + by) * t + cy) * t
  return (x: number) => {
    let t = x
    for (let i = 0; i < 8; i++) {
      const d = 3 * ax * t * t + 2 * bx * t + cx
      if (Math.abs(d) < 1e-6) break
      t -= (sx(t) - x) / d
    }
    return sy(Math.min(Math.max(t, 0), 1))
  }
}
const heavy = bezier(0.7, 0, 0.2, 1)
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)

/** Procedural walnut grain: vertical figure, pores and colour drift, fast canvas generation. */
const textureCache = new Map<string, THREE.CanvasTexture>()

function woodTexture(seed: number) {
  const cacheKey = `wood-${seed}`
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!.clone()
  }
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 512
  const g = c.getContext('2d')!
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const grad = g.createLinearGradient(0, 0, 256, 0)
  grad.addColorStop(0, '#5c3d22')
  grad.addColorStop(0.5, '#714c2b')
  grad.addColorStop(1, '#5a3b20')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 512)
  for (let i = 0; i < 90; i++) {
    const x = rnd() * 256
    const w = 0.6 + rnd() * 2.0
    const wobble = rnd() * 6
    g.strokeStyle = `rgba(${rnd() > 0.5 ? '30,14,6' : '140,92,52'},${0.08 + rnd() * 0.2})`
    g.lineWidth = w
    g.beginPath()
    for (let y = 0; y <= 512; y += 32) g.lineTo(x + Math.sin(y / (60 + wobble * 15) + i) * wobble, y)
    g.stroke()
  }
  for (let i = 0; i < 600; i++) {
    g.fillStyle = `rgba(20,10,4,${rnd() * 0.22})`
    g.fillRect(rnd() * 256, rnd() * 512, 1, 2 + rnd() * 4)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  textureCache.set(cacheKey, t)
  return t
}

function plasterTexture() {
  const cacheKey = 'plaster'
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!.clone()
  }
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#5a4c3e'
  g.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 1500; i++) {
    g.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 240 : 0},200,${Math.random() * 0.03})`
    g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(6, 4)
  textureCache.set(cacheKey, t)
  return t
}

/** Warm studio reflection map generated instantly without ReadPixels GPU stall. */
function makeEnvironment() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 64)
  grad.addColorStop(0, '#ffe2b0')
  grad.addColorStop(0.3, '#ffc77a')
  grad.addColorStop(0.7, '#2b1b11')
  grad.addColorStop(1, '#0b0806')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.mapping = THREE.EquirectangularReflectionMapping
  return t
}

function buildLeaf(side: 1 | -1, wood: THREE.Material, darkWood: THREE.Material, brass: THREE.Material, hammered: THREE.Material) {
  // side = 1: left leaf (hinge at -x, extends +x). side = -1: right leaf.
  const pivot = new THREE.Group()
  const leaf = new THREE.Group()
  leaf.position.x = (side * DOOR_W) / 2
  pivot.add(leaf)

  const slab = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W, DOOR_H, DOOR_T), wood)
  slab.castShadow = slab.receiveShadow = true
  leaf.add(slab)

  const front = DOOR_T / 2
  // Raised border frame (stiles + rails)
  const rail = (w: number, h: number, x: number, y: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), darkWood)
    m.position.set(x, y, front + 0.01)
    m.castShadow = m.receiveShadow = true
    leaf.add(m)
  }
  const inset = 0.07
  rail(DOOR_W - 0.02, inset, 0, DOOR_H / 2 - inset / 2 - 0.01)
  rail(DOOR_W - 0.02, inset * 1.6, 0, -DOOR_H / 2 + inset * 0.8 + 0.01)
  rail(inset, DOOR_H - 0.02, (-side * (DOOR_W - inset)) / 2, 0)
  rail(inset * 0.5, DOOR_H - 0.02, (side * (DOOR_W - inset * 0.5)) / 2, 0)

  // Vertical fluting: real half-round reeds that catch the light
  const reedGeo = new THREE.CylinderGeometry(0.0115, 0.0115, DOOR_H - inset * 2.8, 10, 1, false, 0, Math.PI)
  const usable = DOOR_W - inset * 1.6
  const count = 24
  for (let i = 0; i < count; i++) {
    const r = new THREE.Mesh(reedGeo, wood)
    r.rotation.y = -Math.PI / 2
    r.position.set(-side * (usable / 2) + side * (i + 0.5) * (usable / count) - side * 0.01, 0.02, front)
    r.castShadow = true
    leaf.add(r)
  }

  // Medallion halves at the seam: concentric brass rings + hammered disc, split exactly at the meeting edge
  const seamX = (side * DOOR_W) / 2
  const medY = 0.08
  const halfStart = side === 1 ? Math.PI : 0 // half-disc on the leaf's side of the seam
  const backing = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 64, 1, false, halfStart, Math.PI).rotateX(Math.PI / 2), darkWood)
  backing.position.set(seamX, medY, front + 0.015)
  backing.castShadow = backing.receiveShadow = true
  leaf.add(backing)
  for (const [radius, tube] of [[0.4, 0.008], [0.33, 0.007], [0.26, 0.007], [0.19, 0.006]] as const) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 64, Math.PI), brass)
    ring.rotation.z = side === 1 ? Math.PI / 2 : -Math.PI / 2
    ring.position.set(seamX, medY, front + 0.035)
    ring.castShadow = true
    leaf.add(ring)
  }
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 48, 1, false, halfStart, Math.PI).rotateX(Math.PI / 2), hammered)
  disc.castShadow = true
  disc.position.set(seamX, medY, front + 0.04)
  leaf.add(disc)

  // Long brass pull on standoffs
  const pullX = seamX - side * 0.075
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.95, 20), brass)
  bar.position.set(pullX, medY, front + 0.075)
  bar.castShadow = true
  leaf.add(bar)
  for (const dy of [-0.4, 0.4]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 12), brass)
    post.rotation.x = Math.PI / 2
    post.position.set(pullX, medY + dy, front + 0.045)
    leaf.add(post)
  }
  return pivot
}

export function createDoorScene(canvas: HTMLCanvasElement, opts: { interiorUrl: string; onDone: () => void }): DoorScene {
  const mobile = window.innerWidth < 768
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0b0806)
  scene.fog = new THREE.Fog(0x0b0806, 6, 14)
  scene.environment = makeEnvironment()
  scene.environmentIntensity = 0.55

  const wood = new THREE.MeshStandardMaterial({ map: woodTexture(7), roughness: 0.52, metalness: 0 })
  const darkWood = new THREE.MeshStandardMaterial({ map: woodTexture(91), color: 0xb08a6a, roughness: 0.6 })
  const brass = new THREE.MeshStandardMaterial({ color: 0xd9b25c, metalness: 1, roughness: 0.22 })
  const hammered = new THREE.MeshStandardMaterial({ color: 0xd6ad55, metalness: 1, roughness: 0.42, bumpMap: woodTexture(3), bumpScale: 2 })
  const plaster = new THREE.MeshStandardMaterial({ map: plasterTexture(), roughness: 0.95 })
  const marble = new THREE.MeshStandardMaterial({ color: 0x3a2f26, roughness: 0.28, metalness: 0 })

  // Wall with a real opening (3 blocks), architrave, floor
  const openW = DOOR_W * 2
  const wallDepth = 0.25
  const block = (w: number, h: number, x: number, y: number, mat: THREE.Material, d = wallDepth, z = -wallDepth / 2) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z)
    m.receiveShadow = true
    scene.add(m)
    return m
  }
  block(6, 5, -(openW / 2 + 3), 1.5, plaster)
  block(6, 5, openW / 2 + 3, 1.5, plaster)
  block(openW, 2, 0, DOOR_H + 1, plaster)
  const archW = 0.14
  block(archW, DOOR_H + archW, -(openW / 2 + archW / 2), (DOOR_H + archW) / 2, darkWood, 0.05, 0.03)
  block(archW, DOOR_H + archW, openW / 2 + archW / 2, (DOOR_H + archW) / 2, darkWood, 0.05, 0.03)
  block(openW + archW * 2, archW, 0, DOOR_H + archW / 2, darkWood, 0.05, 0.03)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), marble)
  floor.rotation.x = -Math.PI / 2
  floor.position.z = 2
  floor.receiveShadow = true
  scene.add(floor)

  // Sconces
  for (const x of [-(openW / 2 + 0.75), openW / 2 + 0.75]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.34, 0.07), new THREE.MeshBasicMaterial({ color: 0xffe6b8 }))
    lamp.position.set(x, 1.95, 0.05)
    scene.add(lamp)
    const spot = new THREE.SpotLight(0xffc98a, 16, 8, 0.85, 0.65, 1.5)
    spot.position.set(x * 0.85, 2.6, 1.2)
    spot.target.position.set(x * 0.15, 0.9, 0)
    spot.castShadow = !mobile || x < 0
    spot.shadow.mapSize.set(mobile ? 512 : 1024, mobile ? 512 : 1024)
    spot.shadow.bias = -0.0004
    scene.add(spot, spot.target)
  }
  scene.add(new THREE.HemisphereLight(0xffe7c4, 0x1a120b, 0.6))

  // Room behind: the generated interior photo on a back wall, plus warm light that grows as the doors open
  const roomGroup = new THREE.Group()
  scene.add(roomGroup)
  const roomTex = new THREE.TextureLoader().load(opts.interiorUrl)
  roomTex.colorSpace = THREE.SRGBColorSpace
  const back = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.82), new THREE.MeshBasicMaterial({ map: roomTex, toneMapped: false }))
  back.position.set(0, 1.75, -2.4)
  roomGroup.add(back)
  const innerFloor = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), new THREE.MeshStandardMaterial({ color: 0x8f7658, roughness: 0.22 }))
  innerFloor.rotation.x = -Math.PI / 2
  innerFloor.position.set(0, 0.002, -1.2)
  roomGroup.add(innerFloor)
  const roomLight = new THREE.PointLight(0xffd59a, 0.4, 6, 1.5)
  roomLight.position.set(0, 1.6, -1.2)
  scene.add(roomLight)
  // Light leaking through the seam before opening
  const seamGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.012, DOOR_H * 0.96),
    new THREE.MeshBasicMaterial({ color: 0xffdf9c, transparent: true, opacity: 0.8, toneMapped: false })
  )
  seamGlow.position.set(0, DOOR_H / 2, DOOR_T / 2 + 0.002)
  scene.add(seamGlow)

  const left = buildLeaf(1, wood, darkWood, brass, hammered)
  left.position.set(-DOOR_W, 0, -DOOR_T / 2 - 0.02)
  left.children[0].position.y = DOOR_H / 2
  const right = buildLeaf(-1, wood, darkWood, brass, hammered)
  right.position.set(DOOR_W, 0, -DOOR_T / 2 - 0.02)
  right.children[0].position.y = DOOR_H / 2
  scene.add(left, right)

  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 40)
  const target = new THREE.Vector3(0, 1.22, 0)
  let startZ = 5
  const fit = () => {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = w / h < 0.8 ? 46 : 36
    camera.updateProjectionMatrix()
    const vf = THREE.MathUtils.degToRad(camera.fov)
    const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect)
    const distH = 3.3 / 2 / Math.tan(vf / 2)
    const distW = (openW + 0.55) / 2 / Math.tan(hf / 2)
    startZ = Math.max(distH, Math.min(distW, 9))
  }
  fit()
  window.addEventListener('resize', fit)

  let openedAt = 0
  let raf = 0
  let finished = false
  const t0 = performance.now()
  const loop = () => {
    raf = requestAnimationFrame(loop)
    const now = performance.now()
    const idle = (now - t0) / 1000
    let p = 0
    if (openedAt) p = clamp01((now - openedAt) / OPEN_MS)
    const swing = heavy(clamp01((p - 0.06) / 0.72))
    const walk = heavy(clamp01((p - 0.18) / 0.82))
    left.rotation.y = swing * THREE.MathUtils.degToRad(96)
    right.rotation.y = -swing * THREE.MathUtils.degToRad(96)
    seamGlow.material.opacity = openedAt ? Math.max(0, 0.8 - swing * 3) : 0.55 + Math.sin(idle * 2.2) * 0.25
    roomLight.intensity = 0.4 + swing * 6
    camera.position.set(Math.sin(idle * 0.5) * 0.02 * (1 - walk), 1.32 - walk * 0.08, startZ - walk * (startZ + 0.35))
    camera.lookAt(target.x, target.y - walk * 0.05, target.z - walk * 2)
    renderer.render(scene, camera)
    if (openedAt && p >= 1 && !finished) {
      finished = true
      opts.onDone()
    }
  }
  raf = requestAnimationFrame(loop)

  return {
    open() {
      if (!openedAt) openedAt = performance.now()
    },
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fit)
      scene.traverse(o => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        ;(Array.isArray(mat) ? mat : mat ? [mat] : []).forEach(x => {
          ;(x as THREE.MeshStandardMaterial).map?.dispose()
          x.dispose()
        })
      })
      scene.environment?.dispose()
      roomTex.dispose()
      renderer.dispose()
    },
  }
}
