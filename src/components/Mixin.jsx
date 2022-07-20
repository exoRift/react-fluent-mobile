import React from 'react'
import PropTypes from 'prop-types'

import '../styles/index.css'
import '../styles/Selection.css'
import '../styles/Context.css'
// NOTE: PREPARE TO SET ORIGINTOUCH TO NULL AT SOME POINT
class Mixin extends React.Component {
  static propTypes = {
    holdDelay: PropTypes.number,
    holdTime: PropTypes.number
  }

  static defaultProps = {
    holdDelay: 100,
    holdTime: 1000
  }

  static collapseSwipeDistance = 100
  static collapseSwipeDuration = 300

  isTouchScreen = false
  originRange = null
  selectRange = null
  originTouchEvent = null
  manipulating = false

  state = {
    holding: false,
    selecting: false
  }

  constructor (props) {
    super(props)

    this.cancelEvent = this.cancelEvent.bind(this)
    this.touchstart = this.touchstart.bind(this)
    this.stopTimer = this.stopTimer.bind(this)
    this.launchSelectionManipulator = this.launchSelectionManipulator.bind(this)
    this.launchContextMenu = this.launchContextMenu.bind(this)
    this.copySelection = this.copySelection.bind(this)
    this.collapseSelection = this.collapseSelection.bind(this)
  }

  componentDidMount () {
    document.addEventListener('touchstart', this.touchstart)
    document.addEventListener('touchend', this.stopTimer)
    document.addEventListener('touchmove', this.stopTimer)
    document.addEventListener('selectionchange', this.launchSelectionManipulator)
    // document.addEventListener('contextmenu', this.cancelEvent)
  }

  componentWillUnmount () {
    document.removeEventListener('touchstart', this.touchstart)
    document.removeEventListener('touchend', this.stopTimer)
    document.removeEventListener('touchmove', this.stopTimer)
    document.removeEventListener('selectionchange', this.launchSelectionManipulator)
    // document.removeEventListener('contextmenu', this.cancelEvent)
  }

  render () {
    return (
      <>
        {this.props.children}

        <div
          className={`fluent ${this.state.selecting ? 'active' : 'inactive'}`} id='fluentselectionmanipulator'
          onTouchStart={this.manipulateSelection.bind(this, true)}
          onTouchMove={this.manipulateSelection.bind(this, false)}
          onTouchEnd={this.collapseSelection}
          onClick={this.copySelection}
        />
      </>
    )
  }

  touchstart (e) {
    this.isTouchScreen = true

    if (!this.state.holding && (e.target instanceof HTMLImageElement || e.target.getAttribute('href'))) this.startTimer()
  }

  rangeToPoints (range, startX, startY, endX, endY) {
    const firstBound = this.getCaretPosition(startX, startY)
    const secondBound = this.getCaretPosition(endX, endY)

    if (firstBound && secondBound) {
      range.setStart(...firstBound)
      range.setEnd(...secondBound)

      if (range.collapsed && (firstBound[0] !== secondBound[0] || firstBound[1] !== secondBound[1])) this.rangeToPoints(range, endX, endY, startX, startY)

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

  cancelEvent (e) {
    e.preventDefault()
    e.stopPropagation()

    return false
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

  launchSelectionManipulator (e) {
    if (this.isTouchScreen) {
      const selecting = !window.getSelection().isCollapsed || this.manipulating

      this.setState({
        selecting
      })

      if (!selecting) {
        this.originTouchEvent = null
        this.originRange = null
        this.selectRange = null
      }
    }
  }

  launchContextMenu (e) {
    navigator.vibrate(1)
  }

  manipulateSelection (first, e) {
    const selection = window.getSelection()

    if (first) {
      this.originTouchEvent = e
      this.manipulating = true

      this.originRange = selection.getRangeAt(0)
      this.selectRange = this.originRange.cloneRange()
      selection.removeAllRanges()
      selection.addRange(this.selectRange)
    } else {
      const rects = this.originRange.getClientRects()
      const rect = [
        rects[0].left,
        rects[0].top,
        rects[rects.length - 1].right,
        rects[rects.length - 1].bottom
      ]

      const shifts = [
        e.touches[1] ? e.touches[1].clientX - this.originTouchEvent.touches[1].clientX : 0, // Start X
        e.touches[1] ? e.touches[1].clientY - this.originTouchEvent.touches[1].clientY : 0, // Start Y
        e.touches[0].clientX - this.originTouchEvent.touches[0].clientX, // End X
        e.touches[0].clientY - this.originTouchEvent.touches[0].clientY // End Y
      ]

      const positions = []
      for (let d = 0; d < rect.length; d++) positions.push(Math.max(0, rect[d] + shifts[d]))

      this.rangeToPoints(
        this.selectRange,
        ...positions
      )
    }
  }

  copySelection (e) {
    const selection = window.getSelection()

    selection.removeAllRanges()
    selection.addRange(this.selectRange)

    return navigator.clipboard.writeText(selection.toString())
  }

  collapseSelection (e) {
    this.manipulating = false

    if (
      e.changedTouches[0].clientY - this.originTouchEvent.touches[0].clientY >= Mixin.collapseSwipeDistance &&
      e.timeStamp - this.originTouchEvent.timeStamp <= Mixin.collapseSwipeDuration
    ) window.getSelection().removeAllRanges()
  }
}

export default Mixin