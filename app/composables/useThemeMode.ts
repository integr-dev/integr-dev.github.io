
type Mode = 'light' | 'dark'

const KEY = 'theme'

/**
 * Light or dark. The head script (nuxt.config.ts) sets data-theme on <html> before first paint;
 * this keeps it in sync, follows the system until a choice is made, and switches with a ripple:
 * the new colours spread over the whole page as a circle from the point that was clicked.
 */
export function useThemeMode() {
  // unknown on the server, known once mounted
  const mode = useState<Mode | null>('theme-mode', () => null)

  function apply(next: Mode) {
    document.documentElement.setAttribute('data-theme', next)
    mode.value = next
  }

  function saved(): Mode | null {
    try {
      const t = localStorage.getItem(KEY)
      return t === 'light' || t === 'dark' ? t : null
    }
    catch {
      return null
    }
  }

  // no choice made yet: keep following the system
  let mq: MediaQueryList | undefined
  const onSystem = () => {
    if (mq && !saved()) apply(mq.matches ? 'dark' : 'light')
  }

  onMounted(() => {
    mode.value = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
    mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', onSystem)
  })
  onBeforeUnmount(() => mq?.removeEventListener('change', onSystem))

  /**
   * Switch to the other mode; the ripple starts at the pointer (or the centre of the clicked
   * element). Resolves once the ripple has finished.
   */
  async function toggle(e?: MouseEvent) {
    const next: Mode = mode.value === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(KEY, next)
    }
    catch {}

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !document.startViewTransition) return apply(next)

    // in screen pixels: the ripple is drawn over the whole window (<html> itself is not zoomed)
    const w = window.innerWidth
    const h = window.innerHeight
    let x = w / 2
    let y = h / 2
    if (e) {
      const target = e.currentTarget as HTMLElement | null
      const r = target?.getBoundingClientRect()
      x = e.clientX || (r ? r.left + r.width / 2 : x)
      y = e.clientY || (r ? r.top + r.height / 2 : y)
    }
    const radius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y))

    const transition = document.startViewTransition(() => apply(next))
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
    await transition.finished.catch(() => {})
  }

  return { mode, toggle }
}
