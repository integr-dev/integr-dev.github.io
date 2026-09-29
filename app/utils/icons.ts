import {
  faAnglesUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faArrowUpRightFromSquare,
  faCircleHalfStroke,
  faCode,
  faCube,
  faDatabase,
  faEnvelope,
  faHashtag,
  faMagnifyingGlass,
  faMasksTheater,
  faMoon,
  faRss,
  faSun,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

/**
 * The Font Awesome icons the site uses, by name. Only their path data is taken: Icon.vue draws them
 * as a plain <svg>, without Font Awesome's runtime and its stylesheet.
 */
export const icons: Record<string, IconDefinition> = Object.fromEntries([
  faAnglesUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faArrowUpRightFromSquare,
  faCircleHalfStroke,
  faCode,
  faCube,
  faDatabase,
  faEnvelope,
  faGithub,
  faHashtag,
  faMagnifyingGlass,
  faMasksTheater,
  faMoon,
  faRss,
  faSun,
].map(i => [i.iconName, i]))
