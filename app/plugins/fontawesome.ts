import { config, library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faRss,
  faSun,
  faMoon,
  faCircleHalfStroke,
  faArrowUp,
  faArrowUpRightFromSquare,
  faCode,
  faCube,
  faDatabase,
  faEnvelope,
  faHashtag,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub, faWindows } from '@fortawesome/free-brands-svg-icons'

// CSS is added through nuxt.config so it is there on the server render.
config.autoAddCss = false

library.add(
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faRss,
  faSun,
  faMoon,
  faCircleHalfStroke,
  faArrowUp,
  faArrowUpRightFromSquare,
  faCode,
  faCube,
  faDatabase,
  faEnvelope,
  faHashtag,
  faMagnifyingGlass,
  faGithub,
  faWindows,
)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})
