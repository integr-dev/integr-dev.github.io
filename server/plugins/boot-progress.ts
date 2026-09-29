import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

// A loading bar for slow connections. While prerendering, each page gets a tiny script that knows
// how big the files are that the app needs to start (its script and preload links). It watches them
// arrive and, if some are still missing after a moment, shows how far along the download is along
// the top of the frame. It goes as soon as the first sheet starts to be drawn (html.is-drawing).
// Styles: #boot-progress in themes/drafting/drafting.css.

const GRACE = 800
// where the client build is while prerendering
const DIRS = ['node_modules/.cache/nuxt/.nuxt/dist/client', '.nuxt/dist/client', '.output/public'].map(d => join(process.cwd(), d))

function sizeOf(path: string) {
  for (const dir of DIRS) {
    const file = join(dir, path)
    if (existsSync(file)) return statSync(file).size
  }
  return 0
}

// runs in the page before anything else of the app: plain ES5, no dependencies
// Progress: the downloads make up 85%. Files are only reported once complete, so the bytes still on
// their way are estimated from the throughput so far: the estimate closes in on what is left, fast
// at first and ever slower, so it neither stalls nor runs ahead of the files. Once everything is in,
// the app still starts and fetches the first sheet: 85 to 97%, creeping.
const script = (sizes: Record<string, number>) => `(function(){
var S=${JSON.stringify(sizes)},T=0,G=0,R=0,L=0,k,seen={},el,bar,label,shown=0,raf,d=document,h=d.documentElement,de=/^de/.test(h.lang),P=performance;
for(k in S)T+=S[k];if(!T||!window.PerformanceObserver)return;
var nav=P.getEntriesByType('navigation')[0];if(nav&&nav.responseEnd){R=(nav.encodedBodySize||0)/nav.responseEnd;L=nav.responseEnd}
function txt(p){label.textContent=(de?'lädt ':'loading ')+Math.round(p*100)+'%'}
function frame(){var left=T-G,est=left<=0?T:G+left*(1-Math.exp(-R*(P.now()-L)/left)),target=left<=0?.97:.85*est/T;
if(shown<target)shown+=(target-shown)*(left<=0?.02:.12);
bar.style.transform='scaleX('+shown+')';txt(shown);raf=requestAnimationFrame(frame)}
var po=new PerformanceObserver(function(l){l.getEntries().forEach(function(e){var u=new URL(e.name).pathname;if(S[u]&&!seen[u]){seen[u]=1;G+=S[u];if(e.responseEnd>L){L=e.responseEnd;R=G/L}}})});
po.observe({type:'resource',buffered:true});
var t=setTimeout(function(){if(h.classList.contains('is-drawing')||G>=T)return;el=d.createElement('div');el.id='boot-progress';el.setAttribute('role','progressbar');el.innerHTML='<i></i><span></span>';bar=el.firstChild;label=el.lastChild;d.body.appendChild(el);frame()},${GRACE});
addEventListener('deck:drawing',function(){clearTimeout(t);po.disconnect();if(!el)return;cancelAnimationFrame(raf);
bar.style.transition='transform 300ms ease-out';bar.style.transform='scaleX(1)';txt(1);
setTimeout(function(){el.className='is-done';setTimeout(function(){el.remove()},500)},300)});
})()`

export default defineNitroPlugin((nitroApp) => {
  if (!import.meta.prerender) return
  nitroApp.hooks.hook('render:html', (html) => {
    const sizes: Record<string, number> = {}
    // what the app needs to start: its script, preloads and stylesheet (not prefetches)
    for (const tag of html.head.join('').match(/<(?:link|script)\b[^>]*>/g) ?? []) {
      if (/rel="prefetch"/.test(tag)) continue
      const url = /(?:href|src)="(\/_nuxt\/[^"]+\.(?:js|css))"/.exec(tag)?.[1]
      const size = url && sizeOf(url)
      if (url && size) sizes[url] = size
    }
    html.head.push(`<script>${script(sizes)}</script>`)
  })
})
