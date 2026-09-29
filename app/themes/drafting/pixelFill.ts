/**
 * Buttons marked data-fill fill with the accent colour block by block while hovered, rows sweeping
 * down with a little jitter like a screenshot being drawn (builder.ts), and empty again the same
 * way when the pointer leaves. A canvas behind the label holds one pixel per block and is scaled
 * up crisp; the button gets .is-filled once half of it is covered, so its label can switch colour.
 */
const BLOCK = 4
const MS = 320

interface Fill {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  cols: number
  /** when each block lands, 0..1, in order */
  order: { x: number, y: number, at: number }[]
  level: number
  target: number
  last: number
  raf: number
}

const fills = new WeakMap<HTMLElement, Fill>()

function create(el: HTMLElement): Fill {
  const cols = Math.max(1, Math.ceil(el.offsetWidth / BLOCK))
  const rows = Math.max(1, Math.ceil(el.offsetHeight / BLOCK))
  const canvas = document.createElement('canvas')
  canvas.width = cols
  canvas.height = rows
  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '-1',
    pointerEvents: 'none',
    imageRendering: 'pixelated',
  })
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
  el.style.isolation = 'isolate'
  el.prepend(canvas)
  const order = Array.from({ length: cols * rows }, (_, i) => {
    const y = Math.floor(i / cols)
    return { x: i % cols, y, at: (y / rows) * 0.7 + Math.random() * 0.3 }
  }).sort((a, b) => a.at - b.at)
  return { canvas, ctx: canvas.getContext('2d')!, cols, order, level: 0, target: 0, last: 0, raf: 0 }
}

function draw(el: HTMLElement, f: Fill) {
  f.ctx.clearRect(0, 0, f.canvas.width, f.canvas.height)
  f.ctx.fillStyle = getComputedStyle(el).getPropertyValue('--accent').trim() || '#e8d56a'
  for (const b of f.order) {
    if (b.at > f.level) break
    f.ctx.fillRect(b.x, b.y, 1, 1)
  }
  el.classList.toggle('is-filled', f.level > 0.5)
}

function step(el: HTMLElement, f: Fill, now: number) {
  const dt = f.last ? now - f.last : 16
  f.last = now
  const move = dt / MS
  f.level = f.target > f.level ? Math.min(f.target, f.level + move) : Math.max(f.target, f.level - move)
  draw(el, f)
  if (f.level !== f.target && el.isConnected) {
    f.raf = requestAnimationFrame(t => step(el, f, t))
    return
  }
  f.raf = 0
  if (f.level === 0) {
    f.canvas.remove()
    fills.delete(el)
  }
}

function to(el: HTMLElement, target: number) {
  let f = fills.get(el)
  if (!f) {
    if (target === 0) return
    f = create(el)
    fills.set(el, f)
  }
  f.target = target
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) f.level = target
  if (!f.raf) {
    f.last = 0
    f.raf = requestAnimationFrame(t => step(el, f!, t))
  }
}

/** Watches the whole page once; any button with data-fill takes part, whenever it appears. */
export function setupPixelFill() {
  const target = (e: PointerEvent) => (e.target as Element | null)?.closest?.<HTMLElement>('[data-fill]') ?? null
  document.addEventListener('pointerover', (e) => {
    const el = target(e)
    if (!el || e.pointerType === 'touch' || el.matches(':disabled')) return
    if (el.contains(e.relatedTarget as Node | null)) return
    to(el, 1)
  })
  document.addEventListener('pointerout', (e) => {
    const el = target(e)
    if (!el || el.contains(e.relatedTarget as Node | null)) return
    to(el, 0)
  })
}
