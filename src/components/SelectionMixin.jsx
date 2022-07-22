import React from 'react'
import PropTypes from 'prop-types'

import '../styles/Selection.css'

class SelectionMixin extends React.Component {
  static propTypes = {
    collapseSwipeDistance: PropTypes.number,
    collapseSwipeDuration: PropTypes.number,
    debug: PropTypes.bool
  }

  static defaultProps = {
    collapseSwipeDistance: 100,
    collapseSwipeDuration: 300,
    debug: false
  }

  static iosRegex = /iphone|ipod|ipad|mac/i

  isTouchScreen = false
  originRange = null
  selectRange = null
  originTouchEvent = null
  manipulating = false

  state = {
    selecting: false,
    manipulating: false
  }

  constructor (props) {
    super(props)

    this.touchstart = this.touchstart.bind(this)
    this.launchSelectionManipulator = this.launchSelectionManipulator.bind(this)
    this.copySelection = this.copySelection.bind(this)
    this.collapseSelection = this.collapseSelection.bind(this)
  }

  componentDidMount () {
    document.addEventListener('touchstart', this.touchstart)
    document.addEventListener('selectionchange', this.launchSelectionManipulator)

    const inputs = document.querySelectorAll('input, textarea')

    for (const input of inputs) input.addEventListener('select', this.launchSelectionManipulator)
  }

  componentWillUnmount () {
    document.removeEventListener('touchstart', this.touchstart)
    document.removeEventListener('selectionchange', this.launchSelectionManipulator)
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

        <div className={`fluent handle ${this.state.manipulating ? 'active' : 'inactive'}`} id='fluentselectionhandlestart'/>
        <div className={`fluent handle ${this.state.manipulating ? 'active' : 'inactive'}`} id='fluentselectionhandleend'/>

        {this.props.debug && this.state.selecting
          ? (
            <>
              <div className='fluent debug' id='fluentdebugstart'/>
              <div className='fluent debug' id='fluentdebugend'/>
            </>
            )
          : null}
      </>
    )
  }

  touchstart (e) {
    this.isTouchScreen = true
  }

  rangeToPoints (range, startX, startY, endX, endY) {
    const firstBound = this.getCaretPosition(startX, startY)
    const secondBound = this.getCaretPosition(endX, endY)

    if (firstBound && secondBound) {
      range.setStart(...firstBound)
      range.setEnd(...secondBound)

      if (range.collapsed && (firstBound[0] !== secondBound[0] || firstBound[1] !== secondBound[1])) this.rangeToPoints(range, endX, endY, startX, startY)
    }
  }

  getCaretPosition (x, y) {
    const useExperimental = 'caretPositionFromPoint' in document

    if (useExperimental) {
      const position = document.caretPositionFromPoint(x, y)

      return position
        ? [
            position.offsetNode,
            position.offset
          ]
        : null
    } else {
      const range = document.caretRangeFromPoint(x, y + 1 /* Prevent selection of above text */)

      return range
        ? [
            range.endContainer,
            range.endOffset
          ]
        : null
    }
  }

  launchSelectionManipulator (e) {
    if (this.isTouchScreen) {
      const selecting = !window.getSelection().isCollapsed || this.state.manipulating

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

  manipulateSelection (first, e) {
    const selection = window.getSelection()

    if (first) {
      this.originTouchEvent = e

      this.setState({
        manipulating: true
      })

      this.originRange = selection.getRangeAt(0)
      this.selectRange = this.originRange.cloneRange()
      selection.removeAllRanges()
      selection.addRange(this.selectRange)
    } else if (this.state.manipulating) {
      if (this.props.debug) {
        const start = document.getElementById('fluentdebugstart')
        const end = document.getElementById('fluentdebugend')

        start.style.left = e.touches[0].clientX + 'px'
        start.style.top = e.touches[0].clientY + 'px'
        end.style.left = (e.touches[1]?.clientX || 0) + 'px'
        end.style.top = (e.touches[1]?.clientY || 0) + 'px'
      }

      const oldStartOffset = this.selectRange.startOffset
      const oldEndOffset = this.selectRange.endOffset

      const rects = this.originRange.getClientRects()
      const rect = [
        rects[0]?.left,
        rects[0]?.top,
        rects[rects.length - 1]?.right,
        rects[rects.length - 1]?.bottom
      ]

      const shifts = [
        e.touches[1] && this.originTouchEvent.touches[1] ? e.touches[1].clientX - this.originTouchEvent.touches[1].clientX : 0, // Start X
        e.touches[1] && this.originTouchEvent.touches[1] ? e.touches[1].clientY - this.originTouchEvent.touches[1].clientY : 0, // Start Y
        e.touches[0].clientX - this.originTouchEvent.touches[0].clientX, // End X
        e.touches[0].clientY - this.originTouchEvent.touches[0].clientY // End Y
      ]

      const positions = []
      for (let d = 0; d < rect.length; d++) positions.push(Math.max(0, rect[d] + shifts[d]))

      this.rangeToPoints(
        this.selectRange,
        ...positions
      )

      if (SelectionMixin.iosRegex.test(navigator.userAgent)) { // Safari selection behavior
        selection.removeAllRanges()
        selection.addRange(this.selectRange)
      }

      this.positionHandles(e.touches, ...positions) // Live handle positioning

      if (this.selectRange.startOffset !== oldStartOffset || this.selectRange.endOffset !== oldEndOffset) navigator?.vibrate?.(1)
    }
  }

  positionHandles (touches, ...positions) {
    const handles = document.getElementsByClassName('fluent handle')

    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i]

      handle.style.left = positions[i * 2] + 'px'
      handle.style.top = positions[(i * 2) + 1] + 'px'
      handle.style.height = window.getComputedStyle([
        this.selectRange.endContainer.parentElement,
        this.selectRange.startContainer.parentElement
      ][i]).fontSize

      if (touches[handles.length - 1 - i]) handle.classList.add('manipulating')
      else handle.classList.remove('manipulating')
    }
  }

  copySelection (e) {
    const selection = window.getSelection()

    e.target.classList.add('refresh')
    setTimeout(() => e.target.classList.remove('refresh')) // Negligible delay for DOM rerender

    navigator?.vibrate?.([50, 0, 50])

    selection.removeAllRanges()
    selection.addRange(this.selectRange)

    return navigator.clipboard?.writeText?.(selection.toString())
  }

  collapseSelection (e) {
    if (
      e.changedTouches[0].clientY - this.originTouchEvent.touches[0].clientY >= this.props.collapseSwipeDistance &&
      e.timeStamp - this.originTouchEvent.timeStamp <= this.props.collapseSwipeDuration
    ) window.getSelection().removeAllRanges() // Swipedown collapse gesture

    if (e.targetTouches.length) this.manipulateSelection(true, e) // If a finger is lifted while two are on, don't cancel manipulation
    else {
      this.setState({
        manipulating: false
      })

      const rects = this.selectRange.getClientRects()

      this.positionHandles(
        e.targetTouches,
        rects[0]?.left,
        rects[0]?.top,
        rects[rects.length - 1]?.right,
        rects[rects.length - 1]?.bottom
      ) // Touch lift handle correction
    }
  }
}

export default SelectionMixin
