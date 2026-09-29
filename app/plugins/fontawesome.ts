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
  faAnglesUp,
  faCode,
  faCube,
  faDatabase,
  faEnvelope,
  faHashtag,
  faMagnifyingGlass,
  faMasksTheater,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

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
  faAnglesUp,
  faCode,
  faCube,
  faDatabase,
  faEnvelope,
  faHashtag,
  faMagnifyingGlass,
  faMasksTheater,
  faGithub,
)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})
