import React from 'react'
import PropTypes from 'prop-types'

import {
  options as menuOptions,
  optionsForTag
} from '../util/menu-options.js'

import '../styles/Context.css'

// TODO: Intersection Observer to prevent menu from going off screen
class ContextMixin extends React.Component {
  static propTypes = {
    holdDelay: PropTypes.number,
    holdTime: PropTypes.number,
    theme: PropTypes.string
  }

  static defaultProps = {
    holdDelay: 100,
    holdTime: 500,
    theme: 'dark'
  }

  state = {
    initialized: false,
    holding: false,
    side: 'right'
  }

  holdingElement = null
  hoveringOptionIndex = 0

  menu = React.createRef()

  constructor (props) {
    super(props)

    this.initializeComponent = this.initializeComponent.bind(this)
    this.launchContextMenu = this.launchContextMenu.bind(this)
    this.closeContextMenu = this.closeContextMenu.bind(this)
    this.switchHovering = this.switchHovering.bind(this)
  }

  componentDidMount () {
    document.addEventListener('touchstart', this.initializeComponent, {
      once: true
    })
  }

  componentWillUnmount () {
    if (this.state.initialized) {
      document.removeEventListener('contextmenu', this.launchContextMenu)
      document.removeEventListener('touchmove', this.switchHovering)
      document.removeEventListener('touchend', this.closeContextMenu)
    } else document.removeEventListener('touchstart', this.initializeComponent)
  }

  render () {
    if (!this.state.initialized) return null

    return (
      <>
        {this.props.children}

        <div
          className={`fluent menu ${this.props.theme} ${this.state.holding ? 'active' : 'inactive'} ${this.state.side}`}
          ref={this.menu}
        >
          {menuOptions.empty.Component}
          {optionsForTag[this.holdingElement?.tagName?.toLowerCase?.()]?.map?.((o, i) =>
            <React.Fragment key={i}>{o.Component}</React.Fragment>
          )}
        </div>
      </>
    )
  }

  initializeComponent () {
    if (!this.state.initialized) {
      this.setState({
        initialized: true
      })

      document.addEventListener('contextmenu', this.launchContextMenu)
    }
  }

  launchContextMenu (e) {
    e.preventDefault()

    this.holdingElement = e.target
    this.hoveringOptionIndex = 0
    this.setState({
      holding: true,
      side: e.clientX >= (window.innerWidth / 2) ? 'right' : 'left'
    })

    this.menu.current.style.left = e.clientX + 'px'
    this.menu.current.style.top = e.clientY + 'px'

    navigator?.vibrate?.(1)

    document.addEventListener('touchmove', this.switchHovering)

    document.addEventListener('touchend', this.closeContextMenu, {
      once: true
    })
  }

  switchHovering (e) {
    const [touch] = e.touches

    for (let o = this.menu.current.children.length - 1; o >= 0; o--) {
      const option = this.menu.current.children[o]

      if (!option.classList.contains('menuoption')) continue

      const rect = option.getBoundingClientRect()

      if ((touch.clientY >= rect.top || !o)) {
        if (o !== this.hoveringOptionIndex) {
          this.menu.current.children[this.hoveringOptionIndex]?.classList?.remove?.('hovering')

          this.hoveringOptionIndex = o

          option.classList.add('hovering')

          navigator.vibrate?.(20)
        }

        break
      }
    }
  }

  closeContextMenu (e) {
    // Subtract 1 from index to accomodate the blank button added in
    if (this.hoveringOptionIndex) optionsForTag[this.holdingElement?.tagName?.toLowerCase?.()][this.hoveringOptionIndex - 1]?.action?.(this.holdingElement)

    document.removeEventListener('touchmove', this.switchHovering)

    this.menu.current.getElementsByClassName('menuoption hovering')[0]?.classList?.remove?.('hovering')

    this.setState({
      holding: false
    })
  }
}

export default ContextMixin
