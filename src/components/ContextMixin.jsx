import React from 'react'
import PropTypes from 'prop-types'

import '../styles/Context.css'

class ContextMixin extends React.Component {
  static propTypes = {
    holdDelay: PropTypes.number,
    holdTime: PropTypes.number
  }

  static defaultProps = {
    holdDelay: 100,
    holdTime: 500
  }

  state = {
    holding: false
  }

  constructor (props) {
    super(props)

    this.cancelEvent = this.cancelEvent.bind(this)
    this.touchstart = this.touchstart.bind(this)
    this.stopTimer = this.stopTimer.bind(this)
    this.launchContextMenu = this.launchContextMenu.bind(this)
  }

  componentDidMount () {
    document.addEventListener('touchstart', this.touchstart)
    document.addEventListener('touchend', this.stopTimer)
    document.addEventListener('touchmove', this.stopTimer)
    document.addEventListener('contextmenu', this.cancelEvent)
  }

  componentWillUnmount () {
    document.removeEventListener('touchstart', this.touchstart)
    document.removeEventListener('touchend', this.stopTimer)
    document.removeEventListener('touchmove', this.stopTimer)
    document.removeEventListener('contextmenu', this.cancelEvent)
  }

  render () {
    return (
      <>
        {this.props.children}
      </>
    )
  }

  cancelEvent (e) {
    e.preventDefault()
    e.stopPropagation()

    return false
  }

  touchstart (e) {
    if (!this.state.holding && (e.target instanceof HTMLImageElement || e.target.getAttribute('href'))) this.startTimer()
  }

  startTimer () {
    this.setState({
      holding: true
    })

    this.timeout = setTimeout(this.launchContextMenu, this.props.holdTime)
  }

  stopTimer () {
    this.setState({
      holding: false
    })

    this.timeout = clearTimeout(this.timeout)
  }

  launchContextMenu (e) {
    navigator.vibrate(1)
  }
}

export default ContextMixin
