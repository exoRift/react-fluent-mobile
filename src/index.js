import './styles/index.css'

// WARN: This can be a problem if Apple releases a new product line. The problem is that Chrome uses Apple Webkit
const iosRegex = /iphone|ipod|ipad/i
window.FLUENT_IS_IOS = iosRegex.test(navigator.userAgent)

// Components
export {
  default as FluentContextMixin
} from './components/ContextMixin.jsx'
export {
  default as FluentSelectionMixin
} from './components/SelectionMixin.jsx'

// Utility
export {
  FlexibleRange
} from './util/FlexibleRange.js'
export {
  TouchHandler
} from './util/TouchHandler.js'
export {
  options as contextMenuOptions,
  optionsForTag as contextMenuOptionsForTag
} from './util/menu-options.jsx'
