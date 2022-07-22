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
  static mobileRegex = /^(?:(?!windows).)*mobile(?:(?!windows).)*$/i

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
    this.copySelection = this.copySelection.bind(this)
    this.stopManipulation = this.stopManipulation.bind(this)
  }

  componentDidMount () {
    document.addEventListener('touchstart', this.touchstart)
    document.addEventListener('selectionchange', this.launchDocumentManipulator)

    const inputs = document.querySelectorAll('input, textarea')

    for (const input of inputs) {
      if (SelectionMixin.mobileRegex.test(navigator.userAgent)) input.addEventListener('touchcancel', this.launchInputManipulator)
      else input.addEventListener('touchend', this.launchInputManipulator)
      input.addEventListener('select', (e) => console.log(e))
    }
  }

  componentWillUnmount () {
    document.removeEventListener('touchstart', this.touchstart)
    document.removeEventListener('selectionchange', this.launchDocumentManipulator)
  }

  render () {
    return (
      <>
        {this.props.children}

        <div
          className={`fluent ${this.state.selecting ? 'active' : 'inactive'}`} id='fluentselectionmanipulator'
          onTouchStart={this.manipulateSelection.bind(this, true)}
          onTouchMove={this.manipulateSelection.bind(this, false)}
          onTouchEnd={this.stopManipulation}
          onClick={this.copySelection}
        />

        <div className={`fluent handle ${this.state.manipulating ? 'active' : 'inactive'}`} id='fluentselectionhandlestart'/>
        <div className={`fluent handle ${this.state.manipulating ? 'active' : 'inactive'}`} id='fluentselectionhandleend'/>

        {this.props.debug && this.state.selecting
          ? (
            <>
              <div className='fluent debug' id='fluentdebugfirst'/>
              <div className='fluent debug' id='fluentdebugsecond'/>
            </>
            )
          : null}
      </>
    )
  }

  touchstart () {
    this.isTouchScreen = true
  }

  launchManipulator (type, e) {
    if (this.isTouchScreen) {
      const selecting = !window.getSelection().isCollapsed || e.target.selectionEnd !== e.target.selectionStart || this.state.manipulating

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

  launchDocumentManipulator = this.launchManipulator.bind(this, 'document')
  launchInputManipulator = this.launchManipulator.bind(this, 'input')

  manipulateSelection (first, e) {
    const selection = window.getSelection()

    if (first && selection.rangeCount) {
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
        const first = document.getElementById('fluentdebugfirst')
        const second = document.getElementById('fluentdebugsecond')

        first.style.left = e.touches[0].clientX + 'px'
        first.style.top = e.touches[0].clientY + 'px'
        second.style.left = (e.touches[1]?.clientX || 0) + 'px'
        second.style.top = (e.touches[1]?.clientY || 0) + 'px'
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

      if (SelectionMixin.iosRegex.test(navigator.userAgent) || selection.isCollapsed) { // Safari selection behavior and Android tap selection behavior
        selection.removeAllRanges()
        selection.addRange(this.selectRange)
      }

      this.positionHandles(e.touches, ...positions) // Live handle positioning

      if (this.selectRange.startOffset !== oldStartOffset || this.selectRange.endOffset !== oldEndOffset) navigator.vibrate?.(1)
    }
  }

  positionHandles (touches, ...positions) {
    const handles = document.getElementsByClassName('fluent handle')

    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i]
      const heightNode = [
        this.selectRange.startContainer,
        this.selectRange.endContainer
      ][this.selectRange.reversed ? handles.length - 1 - i : i]
      const heightRange = document.createRange()
      heightRange.setStart(heightNode, 0)
      heightRange.setEnd(heightNode, 1)

      handle.style.left = positions[i * 2] + 'px'
      handle.style.top = positions[(i * 2) + 1] + 'px'
      handle.style.height = heightRange.getBoundingClientRect().height + 'px'

      if (touches[handles.length - 1 - i]) handle.classList.add('manipulating')
      else handle.classList.remove('manipulating')
    }
  }

  stopManipulation (e) {
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

  rangeToPoints (range, startX, startY, endX, endY) {
    const firstBound = this.getCaretPosition(startX, startY)
    const secondBound = this.getCaretPosition(endX, endY)

    if (firstBound && secondBound) {
      range.setStart(...firstBound)
      range.setEnd(...secondBound)

      if (range.collapsed && (firstBound[0] !== secondBound[0] || firstBound[1] !== secondBound[1])) {
        this.rangeToPoints(range, endX, endY, startX, startY)
        range.reversed = true
      } else range.reversed = false
    }
  }

  getCaretPosition (x, y, first) {
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

  copySelection (e) {
    const selection = window.getSelection()

    e.target.classList.add('refresh')
    setTimeout(() => e.target.classList.remove('refresh')) // Negligible delay for DOM rerender

    navigator.vibrate?.([50, 0, 50])

    selection.removeAllRanges()
    selection.addRange(this.selectRange)

    return navigator.clipboard?.writeText?.(selection.toString())
  }
}

export default SelectionMixin
