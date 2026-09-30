import {
  siAndroid,
  siApachemaven,
  siC,
  siDocker,
  siDotnet,
  siExpress,
  siFlyway,
  siGit,
  siGithub,
  siGithubactions,
  siGnubash,
  siGo,
  siGradle,
  siHibernate,
  siJavascript,
  siJest,
  siJunit5,
  siKotlin,
  siKubernetes,
  siMongodb,
  siMysql,
  siNuxt,
  siOpenjdk,
  siPostgresql,
  siPython,
  siQuarkus,
  siReact,
  siSelenium,
  siSpigotmc,
  siSpringboot,
  siSpringsecurity,
  siSqlite,
  siSwagger,
  siTailwindcss,
  siTypescript,
  siVite,
  siVuedotjs,
} from 'simple-icons'

// The skill logos (app/sheets/skillIcons.ts) as one file of symbols, id = Simple Icons slug.
// Prerendered at build time (nuxt.config nitro.prerender); the Skills sheet links to it with <use>.
const icons = [
  siAndroid, siApachemaven, siC, siDocker, siDotnet, siExpress, siFlyway, siGit, siGithub,
  siGithubactions, siGnubash, siGo, siGradle, siHibernate, siJavascript, siJest, siJunit5, siKotlin,
  siKubernetes, siMongodb, siMysql, siNuxt, siOpenjdk, siPostgresql, siPython, siQuarkus, siReact,
  siSelenium, siSpigotmc, siSpringboot, siSpringsecurity, siSqlite, siSwagger, siTailwindcss,
  siTypescript, siVite, siVuedotjs,
]

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'image/svg+xml')
  const symbols = icons.map(i => `<symbol id="${i.slug}" viewBox="0 0 24 24"><path d="${i.path}"/></symbol>`)
  return `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>`
})
