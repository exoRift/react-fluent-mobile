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

    this.cancelEvent = this.cancelEvent.bind(this)
    this.touchstart = this.touchstart.bind(this)
    this.touchend = this.touchend.bind(this)
    this.touchmove = this.touchmove.bind(this)
    this.advanceHoldIndex = this.advanceHoldIndex.bind(this)
  }

  componentDidMount () {
    document.addEventListener('touchstart', this.touchstart)
    document.addEventListener('touchend', this.touchend)
    document.addEventListener('touchmove', this.touchmove)
    document.addEventListener('contextmenu', this.cancelEvent)
    document.addEventListener('dragstart', this.cancelEvent)
  }

  componentWillUnmount () {
    document.removeEventListener('touchstart', this.touchstart)
    document.removeEventListener('touchend', this.touchend)
    document.removeEventListener('touchmove', this.touchmove)
    document.removeEventListener('contextmenu', this.cancelEvent)
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

  cancelEvent (e) {
    if (this.state.holdIndex || this.state.selecting) {
      e.preventDefault()
      e.stopPropagation()

      return false
    }
  }

  touchstart (e) {
    this.setState({
      originEvent: e
    })

    if (!this.state.holdIndex) this.startTimer()
  }

  touchend (e) {
    this.setState({
      selecting: false
    })
    document.body.style.touchAction = 'auto'

    this.stopTimer()
  }

  touchmove (e) {
    const selection = window.getSelection()

    if (this.state.selecting) {
      this.rangeToPoints(this.selectRange, e.touches[1] || this.state.originEvent.touches[0], e.touches[0]) // versatile 2nd touch
    } else {
      this.stopTimer()

      if (this.state.holdIndex === 2) {
        this.setState({
          selecting: true
        })
        document.body.style.touchAction = 'none'

        this.rangeToPoints(this.selectRange, this.state.originEvent.touches[0], e.touches[0])

        selection.removeAllRanges()
        selection.addRange(this.selectRange)
      }
    }
  }

  rangeToPoints (range, first, second) {
    const firstBound = this.getCaretPosition(first.clientX, first.clientY)
    const secondBound = this.getCaretPosition(second.clientX, second.clientY)

    if (firstBound && secondBound) {
      range.setStart(...firstBound)
      range.setEnd(...secondBound)

      if (range.collapsed && (firstBound[0] !== secondBound[0] || firstBound[1] !== secondBound[1])) this.rangeToPoints(range, second, first)

      if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) range.commonAncestorContainer.parentElement.focus()
      else range.commonAncestorContainer.focus()
    }
  }

  getCaretPosition (x, y) {
    const useExperimental = navigator.userAgent.indexOf('Firefox') !== -1

    if (useExperimental) {
      const position = document.getCaretPositionFromPoint(x, y)

      return position
        ? [
            position.offsetNode,
            position.offset
          ]
        : null
    } else {
      const range = document.caretRangeFromPoint(x, y)

      return range
        ? [
            range.endContainer,
            range.endOffset
          ]
        : null
    }
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
