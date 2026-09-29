<script setup lang="ts">
import ButterflySprite from './ButterflySprite.vue'
import { pen } from './builder'
import { pageZoom, unzoomRect } from '~/utils/zoom'

// The butterfly from the avatar. Rests on the title block and flies to search hits.
// While a sheet is being drawn the pen (also a butterfly) takes over, so this one hides.
// Hover or click it and it does a random trick; open the title block and it flies off somewhere.
const props = defineProps<{ target: { anchor: string, nonce: number } | null }>()

const el = ref<HTMLDivElement>()
const inner = ref<HTMLDivElement>()
const flying = ref(false)
const tricking = ref(false)
let away = false
const enabled = ref(false)
// it fades in on first load together with the arrows, as the first flowers open (Deck.vue)
const SHOW_MS = 2500
const shown = ref(false)
let showTimer: ReturnType<typeof setTimeout> | undefined
let pos = { x: 0, y: 0 }
// the direction it faces, in degrees (0 = upright); kept between flights until it lands
let rot = 0
let returnTimer: ReturnType<typeof setTimeout> | undefined
let current: Animation | undefined
let dest: { x: number, y: number, then?: () => void } | null = null

const W = 27
const H = 24

function perch() {
  const el = document.getElementById('butterfly-perch')
  const p = el && unzoomRect(el.getBoundingClientRect())
  if (!p || (p.width === 0 && p.top === 0)) return null
  return { x: p.left - W / 2, y: p.top - H + 4 }
}

function place(x: number, y: number, angle = 0) {
  pos = { x, y }
  rot = angle
  if (el.value) el.value.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`
}

/**
 * Fly along an arc to `to`, facing the way it flies. `land`: it settles there and turns upright;
 * otherwise (a stop while wandering) it keeps its heading and the next flight carries on from it.
 */
function fly(to: { x: number, y: number }, then?: () => void, land = true) {
  const node = el.value
  if (!node) return
  // no flying while a sheet is being drawn: go there directly
  if (pen.building) {
    current?.cancel()
    place(to.x, to.y, land ? 0 : rot)
    flying.value = false
    then?.()
    return
  }
  dest = { ...to, then }
  // start from where it is right now, even mid-flight (position and angle from the running animation)
  let from = { ...pos }
  if (current?.playState === 'running') {
    const m = new DOMMatrix(getComputedStyle(node).transform)
    from = { x: m.e, y: m.f }
    rot = (Math.atan2(m.b, m.a) * 180) / Math.PI
  }
  current?.cancel()
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.hypot(dx, dy)
  const lift = Math.min(160, dist * 0.35)
  const frames: Keyframe[] = []
  const steps = 24
  const cx = from.x + dx / 2
  const cy = Math.min(from.y, to.y) - lift
  const start = rot
  let prev = start
  let last = start
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    // quadratic arc with a little flutter on top
    const x = (1 - t) ** 2 * from.x + 2 * (1 - t) * t * cx + t ** 2 * to.x
    const y = (1 - t) ** 2 * from.y + 2 * (1 - t) * t * cy + t ** 2 * to.y + Math.sin(t * Math.PI * 6) * 6 * (1 - t) * t * 4
    // it faces where it flies: the direction of the arc at this point (the sprite faces up)
    const vx = 2 * (1 - t) * (cx - from.x) + 2 * t * (to.x - cx)
    const vy = 2 * (1 - t) * (cy - from.y) + 2 * t * (to.y - cy)
      + 24 * (6 * Math.PI * Math.cos(6 * Math.PI * t) * t * (1 - t) + Math.sin(6 * Math.PI * t) * (1 - 2 * t))
    let heading = (Math.atan2(vy, vx) * 180) / Math.PI + 90
    // no spinning the long way round between two frames
    while (heading - prev > 180) heading -= 360
    while (heading - prev < -180) heading += 360
    prev = heading
    // turns from the way it was facing into the arc; turns upright at the end only when it lands
    const upright = Math.round(heading / 360) * 360
    let angle = heading
    if (t < 0.15) angle = start + (heading - start) * (t / 0.15)
    if (land && t > 0.85) angle = upright + (heading - upright) * ((1 - t) / 0.15)
    last = angle
    frames.push({ transform: `translate(${x}px, ${y}px) rotate(${angle.toFixed(1)}deg)` })
  }
  flying.value = true
  current = node.animate(frames, { duration: Math.max(700, Math.min(1500, dist * 1.4)), easing: 'ease-in-out', fill: 'forwards' })
  current.onfinish = () => {
    dest = null
    place(to.x, to.y, land ? 0 : last % 360)
    current?.cancel()
    flying.value = false
    then?.()
  }
}

function home() {
  const p = perch()
  if (p) fly(p)
}

// ---------- tricks ----------

const circle = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2
  return { transform: `translate(${Math.sin(a) * 16}px, ${-(1 - Math.cos(a)) * 14}px)` }
})

const TRICKS: Keyframe[][] = [
  // hop, hop
  [{ transform: 'translateY(0)' }, { transform: 'translateY(-18px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }],
  // spin
  [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }],
  // little loop
  circle,
  // turn around and back
  [{ transform: 'scaleX(1)' }, { transform: 'scaleX(-1)' }, { transform: 'scaleX(-1)' }, { transform: 'scaleX(1)' }],
  // startled dash to the side and back
  [{ transform: 'translate(0, 0)' }, { transform: 'translate(-28px, -14px)' }, { transform: 'translate(-22px, -18px)' }, { transform: 'translate(0, 0)' }],
  // shake it off
  [{ transform: 'rotate(0)' }, { transform: 'rotate(-18deg)' }, { transform: 'rotate(16deg)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(0)' }],
]
let lastTrick = -1

function trick() {
  if (!inner.value || tricking.value || flying.value || pen.building) return
  let i = Math.floor(Math.random() * TRICKS.length)
  if (i === lastTrick) i = (i + 1) % TRICKS.length
  lastTrick = i
  tricking.value = true
  const a = inner.value.animate(TRICKS[i]!, { duration: 700, easing: 'ease-in-out' })
  a.onfinish = a.oncancel = () => (tricking.value = false)
}

// ---------- flying off while the title block is open ----------

/** Keeps flying from one random spot to the next until the title block collapses. */
function flyAway() {
  if (!enabled.value) return
  away = true
  clearTimeout(returnTimer)
  wander()
}

function wander() {
  if (!away) return
  // wait while a sheet is being drawn
  if (pen.building) {
    returnTimer = setTimeout(wander, 300)
    return
  }
  const m = 80
  const z = pageZoom()
  const to = {
    x: m + Math.random() * (window.innerWidth / z * 0.75 - m),
    y: m + Math.random() * (window.innerHeight / z * 0.65 - m),
  }
  fly(to, () => {
    if (away) returnTimer = setTimeout(wander, 150 + Math.random() * 450)
  }, false)
}

function comeBack() {
  if (!away) return
  away = false
  clearTimeout(returnTimer)
  returnTimer = setTimeout(home, 900)
}

// a build starting mid-flight: land at the destination at once
watch(() => pen.building, (drawing) => {
  if (!drawing || !current || current.playState !== 'running' || !dest) return
  const d = dest
  dest = null
  current.cancel()
  place(d.x, d.y)
  flying.value = false
  d.then?.()
})

watch(() => props.target, (t) => {
  if (!enabled.value || !t) return
  const anchor = document.getElementById(t.anchor)
  const target = anchor && unzoomRect(anchor.getBoundingClientRect())
  if (!target) return
  clearTimeout(returnTimer)
  const land = { x: Math.min(target.right - W, target.left + Math.min(target.width * 0.6, 220)), y: target.top - H + 2 }
  fly(land, () => {
    returnTimer = setTimeout(home, 2400)
  })
})

function onResize() {
  if (flying.value || away) return
  const p = perch()
  if (p) place(p.x, p.y)
}

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const narrow = window.matchMedia('(max-width: 767px)').matches
  if (reduced || narrow) return
  enabled.value = true
  showTimer = setTimeout(() => (shown.value = true), SHOW_MS)
  const p = perch()
  if (p) place(p.x, p.y)
  window.addEventListener('resize', onResize)
  window.addEventListener('titleblock:expand', flyAway)
  window.addEventListener('titleblock:collapse', comeBack)
})

onBeforeUnmount(() => {
  clearTimeout(returnTimer)
  clearTimeout(showTimer)
  current?.cancel()
  window.removeEventListener('resize', onResize)
  window.removeEventListener('titleblock:expand', flyAway)
  window.removeEventListener('titleblock:collapse', comeBack)
})
</script>

<template>
  <div
    v-show="enabled"
    ref="el"
    class="butterfly"
    :class="{ 'is-hidden': pen.visible || !shown }"
    aria-hidden="true"
    @mouseenter="trick"
    @click="trick"
  >
    <div ref="inner" class="inner">
      <ButterflySprite :flap="flying || tricking ? 'fast' : 'rest'" />
    </div>
  </div>
</template>

<style scoped>
.butterfly {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 60;
  cursor: pointer;
  transform: translate(-100px, -100px);
  transition: opacity 420ms ease;
}

.butterfly.is-hidden {
  opacity: 0;
  pointer-events: none;
}

.inner {
  transform-origin: 50% 60%;
}
</style>
