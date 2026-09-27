import { reactive } from 'vue'
import type { Builder, BuildOptions } from '../types'

/*
 * The drafting builder. Every time a sheet comes into view it is drawn again, element by element:
 * a pen head moves to each part, construction guides flash up, headlines are typed, paragraphs
 * print word by word, numbers count up, images are drawn block by block, lines are ruled.
 *
 * Sheets only mark elements with data-build="<kind>". Everything visual happens here and in
 * drafting.css, so another theme can build the page in a completely different way.
 */

type Kind = 'type' | 'print' | 'line' | 'vline' | 'path' | 'count' | 'chips' | 'image' | 'fade' | 'custom'

export interface Guide {
  id: number
  x: number
  y: number
  w: number
  h: number
  /** headlines also get a baseline */
  baseline: boolean
}

/** Shared with PenOverlay.vue. */
export const pen = reactive({
  x: 0,
  y: 0,
  visible: false,
  /** true from the first to the last effect of a build (longer than the pen is visible) */
  building: false,
  /** construction marks for the element being drawn right now */
  guide: null as Guide | null,
})

const TOTAL_LEAD = 2200 // ms from first to last step start, at most (divided by speed)
const CHAR_MS = 26

class Aborted extends Error {}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new Aborted())
    const t = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new Aborted())
    }, { once: true })
  })
}

function frames(duration: number, signal: AbortSignal, tick: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const start = performance.now()
    const step = (now: number) => {
      if (signal.aborted) return reject(new Aborted())
      const p = Math.min(1, (now - start) / duration)
      tick(p)
      if (p < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })
}

const kindOf = (el: Element) => (el.getAttribute('data-build') ?? 'fade') as Kind

// ---------- typing ----------

function split(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split) return [...el.querySelectorAll<HTMLElement>('.ch')]
  el.dataset.split = '1'
  // the letters are hidden from screen readers, so the whole text is named once: headings, links and
  // buttons take an aria-label, anything else (p, figcaption) gets a visually hidden copy
  const text = el.textContent?.trim() ?? ''
  if (/^(H[1-6]|A|BUTTON)$/.test(el.tagName) || el.hasAttribute('role')) {
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', text)
  }
  else {
    const sr = document.createElement('span')
    sr.className = 'sr-only'
    sr.textContent = text
    el.prepend(sr)
  }
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  while (walker.nextNode()) {
    if (!(walker.currentNode.parentElement?.classList.contains('sr-only'))) nodes.push(walker.currentNode as Text)
  }
  for (const node of nodes) {
    const frag = document.createDocumentFragment()
    for (const c of node.data) {
      const s = document.createElement('span')
      s.className = 'ch'
      s.setAttribute('aria-hidden', 'true')
      s.textContent = c
      frag.appendChild(s)
    }
    node.replaceWith(frag)
  }
  return [...el.querySelectorAll<HTMLElement>('.ch')]
}

async function typeText(el: HTMLElement, signal: AbortSignal, speed: number) {
  const chars = split(el)
  const caret = document.createElement('span')
  caret.className = 'caret'
  caret.setAttribute('aria-hidden', 'true')
  const per = Math.min(CHAR_MS, 700 / Math.max(1, chars.length)) / speed
  try {
    for (const c of chars) {
      c.classList.add('on')
      c.after(caret)
      await sleep(per, signal)
    }
    await sleep(160 / speed, signal)
  }
  finally {
    caret.remove()
  }
}

// ---------- images: drawn block by block ----------

/**
 * A canvas is laid exactly over the image (same offset parent, size, corners and stacking) and the
 * picture is copied onto it block by block, rows sweeping down with a little jitter. The real
 * image takes over when the last block has landed.
 */
async function blockImage(img: HTMLImageElement, signal: AbortSignal, speed: number) {
  try {
    await img.decode()
  }
  catch {
    return
  }
  if (signal.aborted) throw new Aborted()
  const w = img.offsetWidth
  const h = img.offsetHeight
  if (!w || !h || !img.naturalWidth) return
  const cs = getComputedStyle(img)

  // where the picture actually sits inside the box (object-fit: contain leaves margins)
  let dw = w
  let dh = h
  if (cs.objectFit === 'contain') {
    const r = Math.min(w / img.naturalWidth, h / img.naturalHeight)
    dw = img.naturalWidth * r
    dh = img.naturalHeight * r
  }
  const ox = (w - dw) / 2
  const oy = (h - dh) / 2

  const canvas = document.createElement('canvas')
  canvas.className = 'b-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  Object.assign(canvas.style, {
    position: 'absolute',
    left: `${img.offsetLeft}px`,
    top: `${img.offsetTop}px`,
    width: `${w}px`,
    height: `${h}px`,
    borderRadius: cs.borderRadius,
    zIndex: cs.zIndex === 'auto' ? '' : cs.zIndex,
    pointerEvents: 'none',
  })
  img.after(canvas)
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  ctx.imageSmoothingEnabled = cs.imageRendering !== 'pixelated'

  // blocks of about 1/46 of the width, at least 4px, like the avatar
  const block = Math.max(4, Math.round(dw / 46))
  const cols = Math.ceil(dw / block)
  const rows = Math.ceil(dh / block)
  const sx = img.naturalWidth / dw
  const sy = img.naturalHeight / dh
  const blocks = Array.from({ length: cols * rows }, (_, i) => {
    const x = i % cols
    const y = Math.floor(i / cols)
    return { x, y, at: ((y / rows) * 900 + Math.random() * 260) / speed }
  }).sort((a, b) => a.at - b.at)

  try {
    let i = 0
    await frames(1160 / speed, signal, (p) => {
      const t = p * (1160 / speed)
      while (i < blocks.length && blocks[i]!.at <= t) {
        const b = blocks[i++]!
        const bw = Math.min(block, dw - b.x * block)
        const bh = Math.min(block, dh - b.y * block)
        ctx.drawImage(img, b.x * block * sx, b.y * block * sy, bw * sx, bh * sy, ox + b.x * block, oy + b.y * block, bw, bh)
      }
    })
  }
  finally {
    canvas.remove()
  }
}

// ---------- counting ----------

async function countUp(el: HTMLElement, signal: AbortSignal, speed: number) {
  const target = el.dataset.value ?? el.textContent ?? ''
  el.dataset.value = target
  const m = target.match(/[\d,]+/)
  if (!m) return
  const n = Number(m[0].replace(/,/g, ''))
  const fmt = (v: number) => (m[0].includes(',') ? v.toLocaleString('en-US') : String(v))
  try {
    await frames(Math.min(900, 300 + n / 3) / speed, signal, (p) => {
      const eased = 1 - (1 - p) ** 3
      el.textContent = target.replace(m[0], fmt(Math.round(n * eased)))
    })
  }
  finally {
    el.textContent = target
  }
}

// ---------- the rest ----------


function duration(el: HTMLElement, kind: Kind) {
  switch (kind) {
    case 'print': return Math.min(900, 90 * lines(el))
    case 'image': return 700
    case 'line':
    case 'vline': return 420
    case 'path': return 520
    default: return 360
  }
}

const lines = (el: HTMLElement) => Math.max(1, Math.round(el.offsetHeight / 24))

async function runEffect(el: HTMLElement, kind: Kind, signal: AbortSignal, speed: number) {
  el.classList.add('b-run')
  el.style.setProperty('--b-dur', `${duration(el, kind) / speed}ms`)
  if (kind === 'print') el.style.setProperty('--b-lines', String(lines(el)))
  switch (kind) {
    case 'type': await typeText(el, signal, speed); break
    case 'count': await countUp(el, signal, speed); break
    // a list stays "in progress" while its items are drawn as separate steps (see run)
    case 'chips': return
    case 'image':
      if (el instanceof HTMLImageElement) await blockImage(el, signal, speed)
      else await sleep(duration(el, kind) / speed, signal)
      break
    case 'custom': {
      const done = new Promise<void>((resolve) => {
        el.dispatchEvent(new CustomEvent('build-run', { detail: { resolve, signal, speed } }))
        setTimeout(resolve, 4000)
      })
      await done
      break
    }
    default: await sleep(duration(el, kind) / speed, signal)
  }
  el.classList.remove('b-run')
  el.classList.add('b-done')
}

/** How long to wait before starting the next element. */
function lead(el: HTMLElement, kind: Kind) {
  // small diagram parts are drawn in quick succession while the pen stays on the last major part
  if (isMinor(el)) return 45
  if (kind === 'type') return Math.min(420, (el.textContent?.length ?? 0) * 18)
  if (kind === 'print') return 180
  if (kind === 'custom') return 200
  return 110
}

/** The pen lands on the bottom-right corner of what it is drawing. */
/** Small SVG parts (not marked data-pen) are drawn in quick succession. */
function isMinor(el: Element) {
  return el instanceof SVGElement && !el.hasAttribute('data-pen')
}

let guideId = 0

/**
 * The box to mark. For text it is the text itself, not the (often much wider) block around it,
 * so marks never hang off a flex container or an empty column.
 */
function markRect(el: Element, kind: Kind): DOMRect {
  const textual = kind === 'type' || kind === 'print' || kind === 'count'
  if (textual && el instanceof HTMLElement && el.textContent?.trim() && !el.querySelector('img, svg, canvas')) {
    const range = document.createRange()
    range.selectNodeContents(el)
    const r = range.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) return r
  }
  return el.getBoundingClientRect()
}

/**
 * The pen visits every visible piece of content. It skips controls and decoration: buttons,
 * anything marked data-nopen (navigation, hints, link rows), ruled lines, parts nested inside
 * another built element, and small SVG parts (only shapes marked data-pen are visited there).
 */
function penTarget(el: Element, kind: Kind | 'item') {
  if (kind === 'item') return !el.closest('button, [data-nopen]') && !el.classList.contains('sep')
  if (el instanceof SVGElement) return el.hasAttribute('data-pen')
  if (kind === 'line' || kind === 'vline') return false
  if (el.closest('button, [data-nopen]')) return false
  if (el.parentElement?.closest('[data-build]')) return false
  return true
}

function movePen(el: Element, kind: Kind | 'item') {
  if (!penTarget(el, kind)) return
  const r = markRect(el, kind === 'item' ? 'fade' : kind)
  if (r.width < 16 && r.height < 16) return
  pen.visible = true
  pen.x = r.right
  pen.y = r.bottom
  pen.guide = { id: ++guideId, x: r.left, y: r.top, w: r.width, h: r.height, baseline: kind === 'type' && r.height > 40 }
}

function targets(root: HTMLElement) {
  // skip anything not rendered, and carousel pages that are not showing
  // parts inside a list item are built together with their item (see run)
  return [...root.querySelectorAll<HTMLElement>('[data-build]')]
    .filter(el => el.getClientRects().length > 0 && !el.closest('[data-build-skip]'))
    .filter(el => !el.parentElement?.closest('[data-build="chips"]'))
}

export const builder: Builder = {
  async run(root: HTMLElement, { signal, onProgress, speed = 1 }: BuildOptions) {
    // a list (data-build="chips") is one step to open it plus one step per item, so the pen
    // visits every value, chip or link on its own
    const steps: { el: HTMLElement, kind: Kind | 'item' }[] = []
    for (const el of targets(root)) {
      const kind = kindOf(el)
      steps.push({ el, kind })
      if (kind === 'chips') {
        for (const child of el.children) {
          if (child instanceof HTMLElement && child.getClientRects().length) steps.push({ el: child, kind: 'item' })
        }
      }
    }
    const lists = steps.filter(s => s.kind === 'chips').map(s => s.el)
    root.classList.add('is-building')
    // a root marked data-nopen (the search panel) is drawn without the pen, and the resting
    // butterfly stays where it is
    const penless = root.hasAttribute('data-nopen')
    if (!penless) pen.building = true
    const leads = steps.map(s => (s.kind === 'item' ? 70 : s.kind === 'chips' ? 0 : lead(s.el, s.kind)))
    const total = leads.reduce((a, b) => a + b, 0)
    const budget = TOTAL_LEAD / speed
    const scale = (total > budget ? budget / total : 1) / speed
    const running: Promise<void>[] = []
    let done = 0
    const finished = () => {
      done++
      onProgress(done / steps.length)
    }
    const quiet = (e: unknown) => {
      // effects stop quietly when the sheet is left mid-build
      if (!(e instanceof Aborted)) throw e
    }
    try {
      for (let i = 0; i < steps.length; i++) {
        const { el, kind } = steps[i]!
        movePen(el, kind)
        if (kind === 'item') {
          el.classList.add('on')
          // e.g. the number in "473 commits" starts counting as soon as its item appears
          for (const inner of el.querySelectorAll<HTMLElement>('[data-build]')) {
            running.push(runEffect(inner, kindOf(inner), signal, speed).catch(quiet))
          }
          finished()
        }
        else {
          const effect = runEffect(el, kind, signal, speed).then(finished, quiet)
          running.push(effect)
          // data-build-wait: the pen stays on this part until it is fully drawn (e.g. a code block)
          if (el.hasAttribute('data-build-wait')) {
            await effect
            if (signal.aborted) throw new Aborted()
            continue
          }
        }
        await sleep(leads[i]! * scale, signal)
      }
      for (const list of lists) {
        list.classList.remove('b-run')
        list.classList.add('b-done')
      }
      if (!penless) {
        pen.visible = false
        pen.guide = null
      }
      await Promise.all(running)
      root.classList.add('is-built')
      onProgress(1)
    }
    catch (e) {
      if (!(e instanceof Aborted)) throw e
    }
    finally {
      if (!penless) {
        pen.visible = false
        pen.guide = null
        pen.building = false
      }
      root.classList.remove('is-building')
    }
  },

  reset(root: HTMLElement) {
    for (const el of root.querySelectorAll<HTMLElement>('[data-build]')) {
      el.classList.remove('b-run', 'b-done')
      el.querySelectorAll('.on').forEach(c => c.classList.remove('on'))
      el.querySelectorAll('.caret').forEach(c => c.remove())
      if (el.nextElementSibling?.classList.contains('b-canvas')) el.nextElementSibling.remove()
      if (el.dataset.value) el.textContent = el.dataset.value
      if (kindOf(el) === 'custom') el.dispatchEvent(new CustomEvent('build-reset'))
    }
    root.classList.remove('is-built')
  },

  async unbuild(root: HTMLElement, { signal }: { signal: AbortSignal }) {
    // the drawing taken apart again, last part first, quicker than it went up
    const els = [...root.querySelectorAll<HTMLElement>('[data-build].b-done, [data-build].b-run')].reverse()
    root.classList.remove('is-built')
    try {
      for (const el of els) {
        const chars = kindOf(el) === 'type' ? [...el.querySelectorAll<HTMLElement>('.ch.on')].reverse() : []
        if (chars.length) {
          el.classList.remove('b-done')
          el.classList.add('b-run')
          const per = Math.min(10, 160 / chars.length)
          for (const c of chars) {
            c.classList.remove('on')
            await sleep(per, signal)
          }
        }
        el.classList.remove('b-run', 'b-done')
        await sleep(22, signal)
      }
    }
    catch (e) {
      if (!(e instanceof Aborted)) throw e
    }
  },

  finish(root: HTMLElement) {
    for (const el of root.querySelectorAll<HTMLElement>('[data-build]')) {
      el.classList.remove('b-run')
      el.classList.add('b-done')
      if (kindOf(el) === 'custom') el.dispatchEvent(new CustomEvent('build-finish'))
    }
    root.classList.add('is-built')
  },
}
