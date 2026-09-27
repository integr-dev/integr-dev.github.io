import './tokens.css'
import './drafting.css'
import ThemeBackground from './ThemeBackground.vue'
import ViewportFrame from './ViewportFrame.vue'
import DeckIndicator from './DeckIndicator.vue'
import SearchSkin from './SearchSkin.vue'
import Butterfly from './Butterfly.vue'
import PenOverlay from './PenOverlay.vue'
import { builder } from './builder'
import type { Theme } from '../types'

const theme: Theme = {
  name: 'drafting',
  builder,
  BuildOverlay: PenOverlay,
  ThemeBackground,
  ViewportFrame,
  DeckIndicator,
  SearchSkin,
  Ornament: Butterfly,
}

export default theme
