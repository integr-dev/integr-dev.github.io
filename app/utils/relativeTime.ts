/** "2 days ago" / "vor 2 Tagen" from an ISO time. Browser only: a build's "now" is up to a day old. */
export function relativeTime(iso: string, lang: string, now = Date.now()) {
  const seconds = (new Date(iso).getTime() - now) / 1000
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [['minute', 60], ['hour', 3600], ['day', 86400], ['month', 2592000], ['year', 31536000]]
  let [unit, size] = steps[0]!
  for (const step of steps) if (Math.abs(seconds) >= step[1]) [unit, size] = step
  return rtf.format(Math.round(seconds / size), unit)
}
