import React from 'react'
import PropTypes from 'prop-types'

import {
  options as menuOptions,
  optionsForTag
} from '../util/menu-options.js'

import '../styles/Context.css'
import '../styles/notification.css'
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
    disabled: false,
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
    this.disable = this.disable.bind(this)
  }

  componentDidMount () {
    document.addEventListener('touchstart', this.initializeComponent, {
      once: true
    })
  }

  componentDidUpdate () {
    if (this.state.initialized && !this.state.disabled) {
      const rect = this.menu.current.getElementsByClassName('menubody')[0].getBoundingClientRect()

      this.menu.current.classList.toggle('stuckhorizontal', rect.right > window.innerWidth || rect.left < 0)
      this.menu.current.classList.toggle('stuckvertical', rect.bottom > window.innerHeight)
    }
  }

  componentWillUnmount () {
    if (this.state.initialized && !this.state.disabled) {
      document.removeEventListener('contextmenu', this.launchContextMenu)
      document.removeEventListener('touchmove', this.switchHovering)
      document.removeEventListener('touchend', this.closeContextMenu)
    } else document.removeEventListener('touchstart', this.initializeComponent)
  }

  render () {
    if (!this.state.initialized) return null

    if (this.state.disabled) {
      return (
        <>
          <i className={`fluent notification ${this.props.theme}`}>Now using the native context menu</i>
        </>
      )
    }

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

          {menuOptions.disable.Component}
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

    const options = this.menu.current.querySelectorAll('.menuoption, .menudivider')

    for (let o = options.length - 1; o >= 0; o--) {
      if (!options[o].classList.contains('menuoption')) continue

      const rect = options[o].getBoundingClientRect()

      if ((touch.clientY >= rect.top || !o)) {
        if (o !== this.hoveringIndex) {
          options[this.hoveringIndex]?.classList?.remove?.('hovering')

          this.hoveringIndex = o

          options[o].classList.add('hovering')

          navigator.vibrate?.(20)
        }

        break
      }
    }
  }

  closeContextMenu (e) {
    const tagOptions = optionsForTag[this.holdingElement.tagName.toLowerCase()]

    document.removeEventListener('touchmove', this.switchHovering)

    this.menu.current.getElementsByClassName('menuoption hovering')[0]?.classList?.remove?.('hovering')

    // Disable button which is not a part of the options list (This can be > instead of >= since 1 is added to the index on account of the blank option)
    if (this.hoveringIndex > tagOptions.length) menuOptions.disable.action(this.holdingElement, this)
    // Subtract 1 from index to accomodate the blank button
    else if (this.hoveringIndex) tagOptions[this.hoveringIndex - 1]?.action?.(this.holdingElement, this)

    this.setState({
      holding: false
    })
  }

  disable () {
    this.componentWillUnmount()

    this.setState({
      disabled: true
    })
  }
}

export default ContextMixin
