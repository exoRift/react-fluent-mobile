import React from 'react'
import PropTypes from 'prop-types'

import {
  options as menuOptions,
  optionsForTag
} from '../util/menu-options.js'

import '../styles/Context.css'
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
  hoveringIndex = 0

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

  componentDidUpdate () {
    if (this.state.initialized) {
      const rect = this.menu.current.getElementsByClassName('menubody')[0].getBoundingClientRect()

      this.menu.current.classList.toggle('stuckhorizontal', rect.right > window.innerWidth || rect.left < 0)
      this.menu.current.classList.toggle('stuckvertical', rect.bottom > window.innerHeight)
    }
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
          <div className='fluent menubody'>
            {menuOptions.empty.Component}
            {optionsForTag[this.holdingElement?.tagName?.toLowerCase?.()]?.map?.((o, i) =>
              <React.Fragment key={i}>{o.Component}</React.Fragment>
            )}
          </div>

          <div className='material-symbols-outlined fluent disableoption'>menu_open</div>
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

    const side = e.clientX >= (window.innerWidth / 2) ? 'right' : 'left'

    this.holdingElement = e.target
    this.hoveringIndex = 0
    this.setState({
      holding: true,
      side
    })

    switch (side) {
      case 'left':
        this.menu.current.style.paddingRight = 'unset'
        this.menu.current.style.paddingLeft = e.clientX + 'px'

        break
      case 'right':
        this.menu.current.style.paddingRight = (window.innerWidth - e.clientX) + 'px'
        this.menu.current.style.paddingLeft = 'unset'

        break
      default: break
    }
    this.menu.current.style.paddingTop = e.clientY + 'px'

    navigator?.vibrate?.(1)

    document.addEventListener('touchmove', this.switchHovering)

    document.addEventListener('touchend', this.closeContextMenu, {
      once: true
    })
  }

  switchHovering (e) {
    const [touch] = e.touches

    const [body] = this.menu.current.getElementsByClassName('menubody')

    for (let o = body.children.length - 1; o >= 0; o--) {
      const option = body.children[o]

      if (!option.classList.contains('menuoption')) continue

      const rect = option.getBoundingClientRect()

      if ((touch.clientY >= rect.top || !o)) {
        if (o !== this.hoveringIndex) {
          body.children[this.hoveringIndex]?.classList?.remove?.('hovering')

          this.hoveringIndex = o

          option.classList.add('hovering')

          navigator.vibrate?.(20)
        }

        break
      }
    }
  }

  closeContextMenu (e) {
    // Subtract 1 from index to accomodate the blank button added in
    if (this.hoveringIndex) optionsForTag[this.holdingElement.tagName.toLowerCase()][this.hoveringIndex - 1]?.action?.(this.holdingElement, this)

    document.removeEventListener('touchmove', this.switchHovering)

    this.menu.current.getElementsByClassName('menuoption hovering')[0]?.classList?.remove?.('hovering')

    this.setState({
      holding: false
    })
  }
}

export default ContextMixin
