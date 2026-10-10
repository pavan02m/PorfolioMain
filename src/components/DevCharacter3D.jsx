import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const INK = '#211f1b'
const SKIN = '#f3c9a6'
const VIOLET = '#9875df'
const pointer = { x: 0, y: 0 } // normalised -1..1, shared with every frame callback

/* ---------- helpers ---------- */
let gradientMap
const toonGradient = () => {
  if (!gradientMap) {
    gradientMap = new THREE.DataTexture(new Uint8Array([95, 175, 255]), 3, 1, THREE.RedFormat)
    gradientMap.minFilter = gradientMap.magFilter = THREE.NearestFilter
    gradientMap.needsUpdate = true
  }
  return gradientMap
}

const GEO = { sphere: 'sphereGeometry', box: 'boxGeometry', cap: 'capsuleGeometry', cyl: 'cylinderGeometry', torus: 'torusGeometry' }

// Toon-shaded mesh with an "inverted hull" ink outline so it matches the hand-drawn paper look.
function Part({ geo, args, color, outline = 0.05, position, rotation, scale, children }) {
  const Geo = GEO[geo]
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh><Geo args={args} /><meshToonMaterial color={color} gradientMap={toonGradient()} /></mesh>
      {outline > 0 && <mesh scale={1 + outline}><Geo args={args} /><meshBasicMaterial color={INK} side={THREE.BackSide} /></mesh>}
      {children}
    </group>
  )
}

// Canvas-drawn textures (redrawn once web fonts are ready).
function useCanvasTexture(draw, w, h) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    const paint = () => { const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, w, h); draw(ctx, w, h); tex.needsUpdate = true }
    paint()
    document.fonts?.ready.then(paint)
    return tex
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

const roundRect = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r) }

/* ---------- scene pieces ---------- */
const CODE = [
  [['public class ', '#c0a4fa'], ['Pavan ', '#ffd479'], ['{', '#f7f0e6']],
  [['  void ', '#c0a4fa'], ['build', '#8fd3ff'], ['() {', '#f7f0e6']],
  [['    learn', '#8fd3ff'], ['();', '#f7f0e6']],
  [['    ship', '#8fd3ff'], ['();', '#f7f0e6']],
  [['    repeat', '#8fd3ff'], ['();  ', '#f7f0e6'], ['// ☕', '#8a8497']],
  [['  }', '#f7f0e6']],
  [['}', '#f7f0e6']],
]

function CodeCard() {
  const ref = useRef()
  const map = useCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#171923'; roundRect(ctx, 6, 6, w - 12, h - 12, 26); ctx.fill()
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke()
    ;['#ed897b', '#f4d56b', '#9fdcaa'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(46 + i * 30, 46, 9, 0, 7); ctx.fill() })
    ctx.font = '600 31px ui-monospace, Menlo, Consolas, monospace'; ctx.textBaseline = 'middle'
    CODE.forEach((segments, row) => {
      let x = 36
      segments.forEach(([text, color]) => { ctx.fillStyle = color; ctx.fillText(text, x, 100 + row * 44); x += ctx.measureText(text).width })
    })
  }, 640, 420)
  useFrame((s) => { ref.current.position.y = 1.4 + Math.sin(s.clock.elapsedTime * 1.2) * 0.07 })
  return (
    <mesh ref={ref} position={[1.2, 1.4, 0.1]} rotation={[0, -0.42, -0.04]} scale={0.88}>
      <planeGeometry args={[1.55, 1.02]} />
      <meshBasicMaterial map={map} transparent toneMapped={false} />
    </mesh>
  )
}

const TOKENS = [['Java', '#f4d56b'], ['Spring', '#9fdcaa'], ['Kafka', '#c9b5f8'], ['React', '#a8d8f5'], ['AI', '#ffb6d2'], ['SQL', '#ffd0a8']]

function Token({ label, color, index }) {
  const ref = useRef()
  const pulse = useRef(0)
  const hover = useRef(false)
  const map = useCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = color; roundRect(ctx, 6, 6, w - 12, h - 12, 44); ctx.fill()
    ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke()
    ctx.fillStyle = INK; ctx.font = '700 62px Caveat, "Patrick Hand", cursive'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(label, w / 2, h / 2 + 4)
  }, 256, 112)
  useFrame((s, dt) => {
    const a = s.clock.elapsedTime * 0.32 + (index / TOKENS.length) * Math.PI * 2
    ref.current.position.set(Math.cos(a) * 1.45, 2.05 + Math.sin(a * 2) * 0.12, Math.sin(a) * 0.9)
    pulse.current = Math.max(0, pulse.current - dt * 1.8)
    const k = (hover.current ? 1.18 : 1) + Math.sin(pulse.current * Math.PI) * 0.45
    ref.current.scale.x = THREE.MathUtils.damp(ref.current.scale.x, 0.95 * k, 12, dt)
    ref.current.scale.y = THREE.MathUtils.damp(ref.current.scale.y, 0.415 * k, 12, dt)
    ref.current.material.rotation = Math.sin(pulse.current * Math.PI * 2) * 0.35
  })
  return (
    <sprite ref={ref}
      onClick={(e) => { e.stopPropagation(); pulse.current = 1 }}
      onPointerOver={(e) => { e.stopPropagation(); hover.current = true; document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { hover.current = false; document.body.style.cursor = '' }}>
      <spriteMaterial map={map} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  )
}

function Steam() {
  const group = useRef()
  useFrame((s) => {
    group.current.children.forEach((m, i) => {
      const t = (s.clock.elapsedTime * 0.35 + i / 3) % 1
      m.position.y = 0.2 + t * 0.55
      m.position.x = Math.sin(t * 6 + i) * 0.05
      m.scale.setScalar(0.5 + t * 0.9)
      m.material.opacity = Math.sin(t * Math.PI) * 0.55
    })
  })
  return (
    <group ref={group}>
      {[0, 1, 2].map((i) => <mesh key={i}><sphereGeometry args={[0.06, 12, 12]} /><meshBasicMaterial color="#ffffff" transparent depthWrite={false} /></mesh>)}
    </group>
  )
}

function Desk() {
  const shadow = useCanvasTexture((ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(33,31,27,.34)'); g.addColorStop(0.55, 'rgba(33,31,27,.12)'); g.addColorStop(0.95, 'rgba(33,31,27,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  }, 256, 256)
  const logo = useCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#f4d56b'; roundRect(ctx, 8, 8, w - 16, h - 16, 40); ctx.fill()
    ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.stroke()
    ctx.fillStyle = INK; ctx.font = '700 84px ui-monospace, Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('</>', w / 2, h / 2 + 4)
  }, 256, 160)
  return (
    <group>
      <mesh position={[0, -0.93, 0.7]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[4.4, 2.6]} /><meshBasicMaterial map={shadow} transparent depthWrite={false} /></mesh>
      <Part geo="box" args={[3.5, 0.9, 1.5]} color="#eadcb9" outline={0.012} position={[0, -0.45, 0.9]} />
      <Part geo="box" args={[3.5, 0.06, 1.5]} color="#f6ecd2" outline={0} position={[0, 0.005, 0.9]} />
      {/* laptop: screen faces the developer, so we see the lid + sticker */}
      <Part geo="box" args={[1.2, 0.06, 0.8]} color="#cfd3dc" outline={0.03} position={[0, 0.06, 0.78]} />
      <group position={[0, 0.09, 1.16]} rotation={[0.3, 0, 0]}>
        <Part geo="box" args={[1.2, 0.62, 0.05]} color="#e3e6ee" outline={0.03} position={[0, 0.31, 0]} />
        <mesh position={[0, 0.32, 0.03]}><planeGeometry args={[0.46, 0.29]} /><meshBasicMaterial map={logo} transparent toneMapped={false} /></mesh>
      </group>
      {/* mug */}
      <group position={[-0.95, 0.03, 1.0]}>
        <Part geo="cyl" args={[0.13, 0.11, 0.24, 24]} color="#ffffff" outline={0.08} position={[0, 0.12, 0]} />
        <Part geo="torus" args={[0.07, 0.022, 8, 16]} color="#ffffff" outline={0.15} position={[0.15, 0.12, 0]} />
        <Steam />
      </group>
      {/* notebook + pencil */}
      <Part geo="box" args={[0.55, 0.05, 0.4]} color="#fffdf5" outline={0.04} position={[1.05, 0.05, 0.95]} rotation={[0, 0.35, 0]} />
      <Part geo="cyl" args={[0.018, 0.018, 0.5, 8]} color="#f4d56b" outline={0.25} position={[0.95, 0.1, 0.88]} rotation={[Math.PI / 2, 0, 1.1]} />
      {/* plant */}
      <group position={[-1.4, 0.03, 0.55]}>
        <Part geo="cyl" args={[0.14, 0.1, 0.2, 16]} color="#ed897b" outline={0.07} position={[0, 0.1, 0]} />
        <Part geo="sphere" args={[0.14, 16, 16]} color="#8ccf9a" outline={0.07} position={[0, 0.33, 0]} />
        <Part geo="sphere" args={[0.1, 16, 16]} color="#7bc28b" outline={0.08} position={[0.1, 0.46, 0.02]} />
        <Part geo="sphere" args={[0.09, 16, 16]} color="#9bd9a8" outline={0.08} position={[-0.09, 0.44, 0]} />
      </group>
    </group>
  )
}

function Arm({ side, upper, fore }) {
  return (
    <group ref={upper} position={[side * 0.4, 0.52, 0]} rotation={[-0.75, 0, side * -0.06]}>
      <Part geo="cap" args={[0.095, 0.26, 6, 12]} color={VIOLET} outline={0.07} position={[0, -0.22, 0]} />
      <group ref={fore} position={[0, -0.44, 0]} rotation={[-0.7, 0, 0]}>
        <Part geo="cap" args={[0.085, 0.26, 6, 12]} color={VIOLET} outline={0.07} position={[0, -0.22, 0]} />
        <Part geo="sphere" args={[0.1, 14, 14]} color={SKIN} outline={0.1} position={[0, -0.47, 0]} />
      </group>
    </group>
  )
}

function Character({ onPoke }) {
  const root = useRef(), head = useRef(), eyes = useRef(), torso = useRef()
  const upperL = useRef(), upperR = useRef(), foreL = useRef(), foreR = useRef()
  const jump = useRef(0), wave = useRef(0)

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const d = THREE.MathUtils.damp
    head.current.rotation.y = d(head.current.rotation.y, pointer.x * 0.6, 6, dt)
    head.current.rotation.x = d(head.current.rotation.x, -pointer.y * 0.32 + Math.sin(t * 1.6) * 0.02, 6, dt)
    torso.current.scale.y = 1 + Math.sin(t * 2.1) * 0.012
    torso.current.rotation.y = d(torso.current.rotation.y, pointer.x * 0.18, 4, dt)

    // blink every few seconds
    eyes.current.scale.y = d(eyes.current.scale.y, t % 3.6 > 3.5 ? 0.08 : 1, 40, dt)

    // hop
    if (jump.current > 0) { jump.current = Math.max(0, jump.current - dt * 1.7); root.current.position.y = Math.sin((1 - jump.current) * Math.PI) * 0.45 }
    else root.current.position.y = 0

    // typing on the left hand, right hand types too until you click for a wave
    wave.current = Math.max(0, wave.current - dt)
    const waving = wave.current > 0
    foreL.current.rotation.x = -0.7 + Math.sin(t * 15) * 0.09
    upperR.current.rotation.x = d(upperR.current.rotation.x, waving ? -3.05 : -0.75, 9, dt)
    upperR.current.rotation.z = d(upperR.current.rotation.z, waving ? -0.35 : -0.06, 9, dt)
    foreR.current.rotation.x = d(foreR.current.rotation.x, waving ? -0.15 : -0.7 + Math.sin(t * 15 + 2.2) * 0.09, 14, dt)
    foreR.current.rotation.z = waving ? Math.sin(t * 13) * 0.55 : d(foreR.current.rotation.z, 0, 10, dt)
  })

  return (
    <group ref={root}
      onClick={(e) => { e.stopPropagation(); jump.current = 1; wave.current = 1.8; onPoke() }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = '' }}>
      {/* hoodie */}
      <group ref={torso}>
        <Part geo="cap" args={[0.34, 0.5, 8, 20]} color={VIOLET} outline={0.04} position={[0, 0.2, 0]} />
        <Part geo="torus" args={[0.27, 0.085, 10, 24]} color="#7f63c9" outline={0.1} position={[0, 0.76, 0.02]} rotation={[Math.PI / 2, 0, 0]} />
        <Part geo="box" args={[0.36, 0.14, 0.04]} color="#8666d2" outline={0.12} position={[0, 0.02, 0.325]} />
        <Arm side={-1} upper={upperL} fore={foreL} />
        <Arm side={1} upper={upperR} fore={foreR} />
      </group>
      {/* head */}
      <group ref={head} position={[0, 1.2, 0]}>
        <Part geo="sphere" args={[0.4, 32, 24]} color={SKIN} outline={0.04} />
        <Part geo="sphere" args={[0.43, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52]} color="#2b2433" outline={0.035} rotation={[-0.42, 0, 0]} position={[0, 0.03, -0.01]} />
        <Part geo="sphere" args={[0.1, 12, 12]} color="#2b2433" outline={0.1} position={[0.12, 0.45, 0.14]} scale={[1.3, 0.8, 1]} />
        <group ref={eyes}>
          <Part geo="sphere" args={[0.05, 12, 12]} color={INK} outline={0} position={[-0.15, 0.04, 0.365]} />
          <Part geo="sphere" args={[0.05, 12, 12]} color={INK} outline={0} position={[0.15, 0.04, 0.365]} />
        </group>
        <Part geo="torus" args={[0.125, 0.014, 8, 28]} color={INK} outline={0} position={[-0.15, 0.04, 0.385]} />
        <Part geo="torus" args={[0.125, 0.014, 8, 28]} color={INK} outline={0} position={[0.15, 0.04, 0.385]} />
        <Part geo="box" args={[0.07, 0.015, 0.015]} color={INK} outline={0} position={[0, 0.06, 0.39]} />
        <Part geo="torus" args={[0.075, 0.016, 8, 16, Math.PI]} color={INK} outline={0} position={[0, -0.1, 0.385]} rotation={[0, 0, Math.PI]} />
        <mesh position={[-0.26, -0.06, 0.3]} rotation={[0, -0.6, 0]}><circleGeometry args={[0.05, 16]} /><meshBasicMaterial color="#ffb6d2" transparent opacity={0.8} /></mesh>
        <mesh position={[0.26, -0.06, 0.3]} rotation={[0, 0.6, 0]}><circleGeometry args={[0.05, 16]} /><meshBasicMaterial color="#ffb6d2" transparent opacity={0.8} /></mesh>
        {/* headphones */}
        <Part geo="torus" args={[0.45, 0.032, 8, 40, Math.PI]} color={INK} outline={0} />
        <Part geo="cyl" args={[0.13, 0.13, 0.1, 20]} color="#f4d56b" outline={0.07} position={[-0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
        <Part geo="cyl" args={[0.13, 0.13, 0.1, 20]} color="#f4d56b" outline={0.07} position={[0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
      </group>
    </group>
  )
}

function World({ onPoke }) {
  const world = useRef()
  useFrame((s, dt) => {
    const cam = s.camera
    cam.position.x = THREE.MathUtils.damp(cam.position.x, 1.1 + pointer.x * 0.55, 3, dt)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 1.55 + pointer.y * 0.25, 3, dt)
    cam.lookAt(0, 0.62, 0.5)
    // scroll-linked turn: the whole desk slowly rotates as you move down the page
    const turn = Math.min(window.scrollY / 900, 1) * -0.85
    world.current.rotation.y = THREE.MathUtils.damp(world.current.rotation.y, turn, 4, dt)
  })
  return (
    <group ref={world}>
      <hemisphereLight args={['#fff6d9', '#c9b5f8', 0.9]} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} />
      <Desk />
      <Character onPoke={onPoke} />
      <CodeCard />
      {TOKENS.map(([label, color], i) => <Token key={label} label={label} color={color} index={i} />)}
    </group>
  )
}

/* ---------- exported component ---------- */
const LINES = ['Hey, I\u2019m Pavan! \uD83D\uDC4B', 'Java + Spring Boot, mostly \u2615', 'I turn coffee into APIs', 'Poke the floating tags \u2728', 'Scroll down \u2014 I\u2019ll turn around']

export default function DevCharacter3D() {
  const wrap = useRef(null)
  const [active, setActive] = useState(true)
  const [line, setLine] = useState(0)
  const [bubble, setBubble] = useState(false)
  const timer = useRef()

  const say = (next) => { setLine(next); setBubble(true); clearTimeout(timer.current); timer.current = setTimeout(() => setBubble(false), 2600) }

  useEffect(() => {
    const onMove = (e) => { pointer.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.y = -((e.clientY / window.innerHeight) * 2 - 1) }
    window.addEventListener('pointermove', onMove, { passive: true })
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.05 })
    io.observe(wrap.current)
    const greet = setTimeout(() => say(0), 1400)
    return () => { window.removeEventListener('pointermove', onMove); io.disconnect(); clearTimeout(greet); clearTimeout(timer.current) }
  }, [])

  return (
    <div className="char3d" ref={wrap} role="img" aria-label="Interactive 3D illustration of Pavan coding at a desk. Click him to say hi.">
      <div className="char3d-blob" />
      <Canvas dpr={[1, 1.75]} frameloop={active ? 'always' : 'never'} camera={{ fov: 34, position: [1.1, 1.6, 7.6] }} gl={{ antialias: true, alpha: true }}>
        <World onPoke={() => say((line + 1) % LINES.length)} />
      </Canvas>
      <div className={bubble ? 'char3d-bubble show' : 'char3d-bubble'} role="status">{LINES[line]}</div>
      <span className="char3d-hint">click me · move your mouse · scroll</span>
    </div>
  )
}
