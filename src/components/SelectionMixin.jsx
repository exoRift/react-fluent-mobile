import React from 'react'
import PropTypes from 'prop-types'

import { FlexibleRange } from '../util/FlexibleRange.js'

import '../styles/Selection.css'

class SelectionMixin extends React.Component {
  static propTypes = {
    collapseSwipeDistance: PropTypes.number,
    collapseSwipeDuration: PropTypes.number
  }

  static defaultProps = {
    collapseSwipeDistance: 100,
    collapseSwipeDuration: 300
  }

  static iosRegex = /iphone|ipod|ipad|mac/i
  static mobileRegex = /^(?:(?!windows).)*mobile(?:(?!windows).)*$/i

  static defaultHandleHeight = 18

  initialized = false
  originTouches = []
  originRange = null
  selectRange = null

  state = {
    selecting: false,
    manipulating: false
  }

  constructor (props) {
    super(props)

    this.initializeComponent = this.initializeComponent.bind(this)
    this.copySelection = this.copySelection.bind(this)
    this.stopManipulation = this.stopManipulation.bind(this)
  }

  componentDidMount () {
    document.addEventListener('touchstart', this.initializeComponent)
  }

  componentWillUnmount () {
    document.removeEventListener('touchstart', this.initializeComponent)

    if (this.initialized) {
      document.removeEventListener('selectionchange', this.launchDocumentManipulator)

      const inputs = document.querySelectorAll('input, textarea')

      for (const input of inputs) {
        input.removeEventListener('touchcancel', this.launchInputManipulator)
        input.removeEventListener('touchend', this.launchInputManipulator)
        input.removeEventListener('select', (e) => console.log(e))
      }
    }
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
      </>
    )
  }

  initializeComponent () {
    if (!this.initialized) {
      this.initialized = true

      document.addEventListener('selectionchange', this.launchDocumentManipulator)

      // NOTE: INPUT STUFF
      const inputs = document.querySelectorAll('input, textarea')

      for (const input of inputs) {
        if (SelectionMixin.mobileRegex.test(navigator.userAgent)) input.addEventListener('touchcancel', this.launchInputManipulator)
        else input.addEventListener('touchend', this.launchInputManipulator)

        input.addEventListener('select', (e) => console.log(e))
      }
    }
  }

  launchManipulator (type, e) {
    const selection = window.getSelection()
    // NOTE: INPUT STUFF
    const selecting = !selection.isCollapsed ||
      (selection.rangeCount && selection.getRangeAt(0) === this.selectRange) ||
      this.state.manipulating | e.target.selectionEnd !== e.target.selectionStart

    this.setState({
      selecting
    })
  }

  launchDocumentManipulator = this.launchManipulator.bind(this, 'document')
  launchInputManipulator = this.launchManipulator.bind(this, 'input')
  // TODO: HIDE PAD WHEN HANDLE IS OVER
  manipulateSelection (start, e) {
    const selection = window.getSelection()

    if (!selection.rangeCount) return

    const firstTouch = !this.state.manipulating
    const touches = this.formatTouches(e.targetTouches)

    if (start) {
      const [touch] = e.changedTouches
      touch.timeStamp = e.timeStamp
      this.originTouches[touch.identifier] = touch

      this.setState({
        manipulating: true
      })

      if (firstTouch) {
        this.selectRange = new FlexibleRange(selection.getRangeAt(0))
        selection.removeAllRanges()
        selection.addRange(this.selectRange)

        this.originRange = new FlexibleRange(selection.getRangeAt(0))
      }
    }

    const oldStartOffset = this.selectRange.startOffset
    const oldEndOffset = this.selectRange.endOffset

    const rect = [
      ...this.originRange.startCoords,
      ...this.originRange.endCoords
    ]

    const shifts = [
      touches[1] && this.originTouches[1] ? touches[1].clientX - this.originTouches[1].clientX : 0, // Start X
      touches[1] && this.originTouches[1] ? touches[1].clientY - this.originTouches[1].clientY : 0, // Start Y
      touches[0] && this.originTouches[0] ? touches[0].clientX - this.originTouches[0].clientX : 0, // End X
      touches[0] && this.originTouches[0] ? touches[0].clientY - this.originTouches[0].clientY : 0 // End Y
    ]

    const positions = []
    for (let d = 0; d < rect.length; d++) positions.push(Math.max(0, rect[d] + shifts[d]))

    // Range sizing
    this.selectRange.setStart(...this.getCaretPosition(positions[0], positions[1] + (this.originRange.startCoords.height / 2)))
    this.selectRange.setEnd(...this.getCaretPosition(positions[2], positions[3] + (this.originRange.endCoords.height / 2)))

    // Safari selection behavior and Android tap selection behavior
    if (SelectionMixin.iosRegex.test(navigator.userAgent) || selection.isCollapsed) {
      selection.removeAllRanges()
      selection.addRange(this.selectRange)
    }

    this.positionHandles(touches, this.selectRange.reversed, ...positions) // Position handles

    if (this.selectRange.startOffset !== oldStartOffset || this.selectRange.endOffset !== oldEndOffset) navigator.vibrate?.(1)
  }

  stopManipulation (e) {
    for (const touch of e.changedTouches) {
      if (touch.identifier) this.originRange.setStart(...this.selectRange._registeredStart)
      else this.originRange.setEnd(...this.selectRange._registeredEnd)
    }

    if (e.targetTouches.length) this.manipulateSelection(true, e) // If a finger is still on, don't cancel manipulation and position inactive handle
    else {
      const [touch] = e.changedTouches

      if (
        touch.clientY - this.originTouches[touch.identifier].clientY >= this.props.collapseSwipeDistance &&
        e.timeStamp - this.originTouches[touch.identifier].timeStamp <= this.props.collapseSwipeDuration
      ) window.getSelection().removeAllRanges() // Swipedown collapse gesture

      this.setState({
        manipulating: false
      })

      if (this.originRange.reversed) this.originRange.reverse()
      this.manipulateSelection(false, e) // Correct handle positions to stick to range
    }
  }

  positionHandles (touches, reversed, ...positions) {
    const handles = document.getElementsByClassName('fluent handle')

    for (let i = 0; i < 2; i++) {
      const handle = handles[i]

      if (touches[1 - i]) handle.classList.add('manipulating')
      else handle.classList.remove('manipulating')

      handle.style.left = positions[i * 2] + 'px'
      handle.style.top = positions[(i * 2) + 1] + 'px'
      handle.style.height = this.selectRange[['startCoords', 'endCoords'][i]].height + 'px'
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
      const range = document.caretRangeFromPoint(x, y)

      return range
        ? [
            range.endContainer,
            range.endOffset
          ]
        : null
    }
  }

  formatTouches (list) {
    const touches = []

    for (const touch of list) touches[touch.identifier] = touch

    return touches
  }

  getLineHeight (node) {
    const range = document.createRange()

    if (node && node instanceof Text) {
      range.setStart(node, 0)
      range.setEnd(node, 1)
    }

    return range.getBoundingClientRect().height || SelectionMixin.defaultHandleHeight
  }

  copySelection (e) {
    const selection = window.getSelection()

    e.target.classList.add('refresh')
    setTimeout(() => e.target.classList.remove('refresh')) // Negligible delay for DOM rerender

    navigator.vibrate?.([50, 0, 50])

    selection.removeAllRanges()
    selection.addRange(this.selectRange) // Keep text selected

    return navigator.clipboard?.writeText?.(selection.toString())
  }
}

export default SelectionMixin
