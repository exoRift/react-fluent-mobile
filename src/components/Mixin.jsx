import React from 'react'
import PropTypes from 'prop-types'

import '../styles/Context.css'

class Mixin extends React.Component {
  static propTypes = {
    holdDelay: PropTypes.number,
    selectHoldTime: PropTypes.number,
    menuHoldTime: PropTypes.number
  }

  static defaultProps = {
    holdDelay: 100,
    selectHoldTime: 500,
    menuHoldTime: 1000
  }

  state = {
    holdIndex: 0,
    selecting: false,
    originEvent: null
  }

  constructor (props) {
    super(props)

    this.selectRange = document.createRange()

    this.cancelContext = this.cancelContext.bind(this)
    this.touchstart = this.touchstart.bind(this)
    this.touchend = this.touchend.bind(this)
    this.touchmove = this.touchmove.bind(this)
    this.advanceHoldIndex = this.advanceHoldIndex.bind(this)
  }

  componentDidMount () {
    document.addEventListener('touchstart', this.touchstart)
    document.addEventListener('touchend', this.touchend)
    document.addEventListener('touchmove', this.touchmove)
    document.addEventListener('contextmenu', this.cancelContext)
  }

  componentWillUnmount () {
    document.removeEventListener('touchstart', this.touchstart)
    document.removeEventListener('touchend', this.touchend)
    document.removeEventListener('touchmove', this.touchmove)
    document.removeEventListener('contextmenu', this.cancelContext)
  }

  render () {
    return (
      <>
        {this.props.children}

        <div
          className={
            `fluent ${['', 'select', 'menu'][this.state.holdIndex]} ${this.state.holdIndex ? 'active' : 'inactive'}`
            }
          id='fluentprogress'
          style={{
            top: this.state.originEvent?.touches?.[0]?.clientY,
            left: this.state.originEvent?.touches?.[0]?.clientX,
            width: (Math.max(this.state.originEvent?.touches?.[0]?.radiusX, this.state.originEvent?.touches?.[0]?.radiusY) * 150) + 'px',
            height: (Math.max(this.state.originEvent?.touches?.[0]?.radiusX, this.state.originEvent?.touches?.[0]?.radiusY) * 150) + 'px',
            animationDelay: this.props.holdDelay + 'ms',
            '--transitionDelay': this.props.holdDelay + 'ms',
            animationDuration: ([this.props.selectHoldTime, this.props.menuHoldTime][this.state.holdIndex - 1] - this.props.holdDelay) + 'ms',
            visibility: this.state.selecting ? 'hidden' : 'visible'
          }}
        />
      </>
    )
  }

  cancelContext (e) {
    if (this.state.holdIndex) {
      e.preventDefault()
      e.stopPropagation()

      return false
    }
  }

  touchstart (e) {
    this.setState({
      originEvent: e
    })

    this.startTimer()
  }

  touchend (e) {
    this.setState({
      selecting: false
    })

    this.stopTimer()
  }

  touchmove (e) {
      this.stopTimer()
  }

  startTimer () {
    this.setState({
      holdIndex: 1
    })

    this.timeout = setTimeout(this.advanceHoldIndex, this.props.selectHoldTime)
  }

  stopTimer () {
    this.setState({
      holdIndex: 0
    })

    this.timeout = clearTimeout(this.timeout)
  }

  advanceHoldIndex (e) {
    const progress = document.getElementById('fluentprogress')
    progress.style.animationName = 'none'
    void progress.offsetWidth /* eslint-disable-line */
    progress.style.animationName = ''

    this.setState({
      holdIndex: 2
    })

    navigator.vibrate(1)
  }
}

export default Mixin
