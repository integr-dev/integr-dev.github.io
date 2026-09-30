/**
 * Pixel art as a few SVG paths instead of one <rect> per pixel: the pixels that share a colour and
 * appear at (about) the same moment become one path, with runs along a row merged into one bar.
 * Hundreds of rects per bush made the page's HTML several times larger than its text.
 */
export interface Pixel { x: number, y: number, color: string, delay: number }
export interface PixelGroup { d: string, color: string, delay: number }

/** step: how finely the delays are kept apart, in ms; pixels within one step appear together */
export function pixelPaths(pixels: Pixel[], step = 100): PixelGroup[] {
  const groups = new Map<string, { color: string, delay: number, rows: Map<number, number[]> }>()
  for (const p of pixels) {
    const delay = Math.round(p.delay / step) * step
    const key = `${p.color} ${delay}`
    let g = groups.get(key)
    if (!g) groups.set(key, (g = { color: p.color, delay, rows: new Map() }))
    const row = g.rows.get(p.y) ?? []
    row.push(p.x)
    g.rows.set(p.y, row)
  }
  return [...groups.values()].map(({ color, delay, rows }) => {
    let d = ''
    for (const [y, xs] of rows) {
      const sorted = [...new Set(xs)].sort((a, b) => a - b)
      for (let i = 0; i < sorted.length;) {
        let j = i
        while (sorted[j + 1] === sorted[j]! + 1) j++
        const w = j - i + 1
        d += `M${sorted[i]} ${y}h${w}v1h-${w}z`
        i = j + 1
      }
    }
    return { d, color, delay }
  }).sort((a, b) => a.delay - b.delay)
}
