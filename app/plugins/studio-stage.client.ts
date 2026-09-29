// Nuxt Studio's editor panel sits at the left of the window. Studio makes room for it by pushing the
// body over and moving every fixed element right, which pulls the fixed layout here (frame, arrows,
// bushes) apart. Instead the page is laid out as in a window that starts right of the panel:
// #__nuxt becomes the frame for fixed elements (base.css), the zoom and --vw are worked out from
// the width that is left, and positions measured on screen count from its left edge (unzoomRect).
export default defineNuxtPlugin(() => {
  const root = document.documentElement
  const body = document.body

  function panelWidth() {
    if (!body.hasAttribute('data-studio-active') || !body.hasAttribute('data-expand-sidebar')) return 0
    let saved: string | null = null
    try {
      saved = localStorage.getItem('studio-sidebar-width')
    }
    catch {}
    return Number.parseInt(saved ?? '', 10) || 440
  }

  function sync() {
    // Studio's move of the fixed elements: the only inline left they ever get
    for (const el of document.querySelectorAll<HTMLElement>('#__nuxt [style*="left"]')) {
      if (el.style.left && getComputedStyle(el).position === 'fixed') el.style.left = ''
    }
    const width = panelWidth()
    if (width === (window.__stageLeft ?? 0)) return
    window.__stageLeft = width
    root.style.setProperty('--stage-left', `${width}px`)
    root.toggleAttribute('data-stage', width > 0)
    // the zoom script and everything that measures the window listen for this
    window.dispatchEvent(new Event('resize'))
  }

  // Studio follows a "dark" class on <html>; this site marks its theme with data-theme instead
  const mirrorTheme = () => root.classList.toggle('dark', root.getAttribute('data-theme') === 'dark')
  mirrorTheme()
  new MutationObserver(mirrorTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] })

  // Studio opens and closes the panel with attributes on <body>, and on every change of its width
  // rewrites its <style data-studio-style> in <head>
  new MutationObserver(sync).observe(body, { attributes: true, attributeFilter: ['data-studio-active', 'data-expand-sidebar'] })
  new MutationObserver(sync).observe(document.head, { childList: true, subtree: true, characterData: true })
})
