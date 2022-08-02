import React from 'react'
import PropTypes from 'prop-types'

import { FlexibleRange } from '../util/FlexibleRange.js'

import '../styles/Selection.css'

class SelectionMixin extends React.Component {
  static propTypes = {
    collapseSwipeDistance: PropTypes.number,
    collapseSwipeDuration: PropTypes.number,
    theme: PropTypes.string
  }

  static defaultProps = {
    collapseSwipeDistance: 100,
    collapseSwipeDuration: 300,
    theme: 'dark'
  }

  static iosRegex = /iphone|ipod|ipad|mac/i
  static mobileRegex = /^(?:(?!windows).)*mobile(?:(?!windows).)*$/i

  static defaultHandleHeight = 18

  originTouches = []
  originRange = null
  selectRange = null
  manipulator = React.createRef()

  state = {
    initialized: false,
    selecting: false,
    manipulating: false
  }

  constructor (props) {
    super(props)

    this.isIOS = SelectionMixin.iosRegex.test(navigator.userAgent)

    this.initializeComponent = this.initializeComponent.bind(this)
    this.registerTouch = this.registerTouch.bind(this)
    this.manipulateSelection = this.manipulateSelection.bind(this)
    this.stopManipulation = this.stopManipulation.bind(this)
    this.copySelection = this.copySelection.bind(this)
    this.unregisterTouchForIOS = this.unregisterTouchForIOS.bind(this)
    this.reselectForIOS = this.reselectForIOS.bind(this)
  }

  componentDidMount () {
    document.addEventListener('touchstart', this.initializeComponent, {
      once: true
    })
  }

  componentWillUnmount () {
    if (this.state.initialized) {
      document.removeEventListener('touchstart', this.registerTouch)
      document.removeEventListener('selectionchange', this.launchDocumentManipulator)

      if (this.isIOS) document.removeEventListener('touchend', this.unregisterTouchForIOS)

      // NOTE: INPUT STUFF
      // const inputs = document.querySelectorAll('input, textarea')

      // for (const input of inputs) {
      //   input.removeEventListener('touchcancel', this.launchInputManipulator)
      //   input.removeEventListener('touchend', this.launchInputManipulator)
      //   input.removeEventListener('select', (e) => console.log(e))
      // }
    } else document.removeEventListener('touchstart', this.initializeComponent)
  }

  render () {
    if (!this.state.initialized) return null

    return (
      <>
        {this.props.children}

        <div
          className={`fluent ${this.props.theme} ${this.state.selecting ? 'active' : 'inactive'}`} id='fluentselectionmanipulator'
          onTouchStart={this.manipulateSelection}
          onTouchMove={this.manipulateSelection}
          onTouchEnd={this.stopManipulation}
          onTouchEndCapture={this.isIOS ? this.reselectForIOS : null}
          onDoubleClick={this.copySelection}
          ref={this.manipulator}
        />

        <div className={`fluent handle ${this.state.manipulating ? 'active' : 'inactive'}`} id='fluentselectionhandlestart'/>
        <div className={`fluent handle ${this.state.manipulating ? 'active' : 'inactive'}`} id='fluentselectionhandleend'/>
      </>
    )
  }

  initializeComponent () {
    if (!this.state.initialized) {
      this.setState({
        initialized: true
      })

      document.addEventListener('touchstart', this.registerTouch, {
        capture: true
      })
      document.addEventListener('selectionchange', this.launchDocumentManipulator)

      if (this.isIOS) document.addEventListener('touchend', this.unregisterTouchForIOS)

      // NOTE: INPUT STUFF
      // const inputs = document.querySelectorAll('input, textarea')

      // for (const input of inputs) {
      //   if (SelectionMixin.mobileRegex.test(navigator.userAgent)) input.addEventListener('touchcancel', this.launchInputManipulator)
      //   else input.addEventListener('touchend', this.launchInputManipulator)

      //   input.addEventListener('select', (e) => console.log(e))
      // }
    }
  }

  registerTouch (e) {
    const [touch] = e.changedTouches
    touch.timeStamp = e.timeStamp

    if (this.isIOS) {
      const firstNull = this.originTouches.indexOf(null)

      if (firstNull !== -1) this.originTouches[firstNull] = touch
      else this.originTouches[this.originTouches.length] = touch
    } else this.originTouches[touch.identifier] = touch
  }

  launchManipulator (type, e) {
    if (!this.state.manipulating) {
      const selection = window.getSelection()

      const selecting = (!selection.isCollapsed && selection.rangeCount) ||
        (selection.rangeCount && selection.getRangeAt(0) === this.selectRange) /* ||
        e.target.selectionEnd !== e.target.selectionStart // NOTE: INPUT STUFF */

      this.setState({
        selecting
      })
    }
  }

  launchDocumentManipulator = this.launchManipulator.bind(this, 'document')
  // launchInputManipulator = this.launchManipulator.bind(this, 'input') // NOTE: INPUT STUFF

  manipulateSelection (e) {
    const selection = window.getSelection()

    if (!selection.rangeCount) return

    const touches = this.formatTouches(e.targetTouches)

    if (!this.state.manipulating) { // First touch
      this.setState({
        manipulating: true
      })

      this.originRange = new FlexibleRange(selection.getRangeAt(0))
      this.selectRange = new FlexibleRange(selection.getRangeAt(0))

      selection.removeAllRanges()
      selection.addRange(this.selectRange)
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
    this.manipulator.current.style.pointerEvents = 'none' // Allow range passthrough of manipulation pad
    if (touches[1]) this.selectRange.setStart(...this.getCaretPosition(positions[0], positions[1] + (this.originRange.startCoords.height / 2)))
    if (touches[0]) this.selectRange.setEnd(...this.getCaretPosition(positions[2], positions[3] + (this.originRange.endCoords.height / 2)))
    this.manipulator.current.style.pointerEvents = 'auto'

    // Safari selection behavior and Android tap selection behavior
    if (this.isIOS || selection.isCollapsed) this.reselectForIOS()

    this.positionHandles(touches, this.selectRange.reversed, ...positions) // Position handles

    if (this.selectRange.startOffset !== oldStartOffset || this.selectRange.endOffset !== oldEndOffset) navigator.vibrate?.(1)
  }

  stopManipulation (e) {
    for (const touch of e.changedTouches) {
      const identifier = this.isIOS ? this.originTouches.findIndex((t) => t?.identifier === touch.identifier) : touch.identifier

      if (identifier === 1) this.originRange.setStart(...this.selectRange._registeredStart)
      else if (!identifier) this.originRange.setEnd(...this.selectRange._registeredEnd)
    }

    if (!e.targetTouches.length) {
      const [touch] = e.changedTouches
      const identifier = this.isIOS ? this.originTouches.findIndex((t) => t?.identifier === touch.identifier) : touch.identifier

      if (
        touch.clientY - this.originTouches[identifier].clientY >= this.props.collapseSwipeDistance &&
        e.timeStamp - this.originTouches[identifier].timeStamp <= this.props.collapseSwipeDuration
      ) window.getSelection().removeAllRanges() // Swipedown collapse gesture

      this.setState({
        manipulating: false
      })

      if (this.originRange.reversed) this.originRange.reverse()
    }

    this.manipulateSelection(e) // Correct handle positions to stick to range
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
        : []
    } else {
      const range = document.caretRangeFromPoint(x, y)

      return range
        ? [
            range.endContainer,
            range.endOffset
          ]
        : []
    }
  }

  formatTouches (list) {
    const touches = []

    for (const touch of list) {
      const identifier = this.isIOS ? this.originTouches.findIndex((t) => t?.identifier === touch.identifier) : touch.identifier

      touches[identifier] = touch
    }

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
    if (this.isIOS) this.reselectForIOS()

    const selection = window.getSelection()

    e.target.classList.add('refresh')
    setTimeout(() => e.target.classList.remove('refresh')) // Negligible delay for DOM rerender

    navigator.vibrate?.([50, 0, 50])

    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(selection.toString())
    else document.execCommand('copy')
  }

  unregisterTouchForIOS (e) {
    setTimeout(() => {
      const [touch] = e.changedTouches

      this.originTouches[this.originTouches.findIndex((t) => t?.identifier === touch.identifier)] = null
    }) // Negligible delay for listener to run last
  }

  reselectForIOS () {
    const selection = window.getSelection()

    selection.removeAllRanges()
    selection.addRange(this.selectRange)
  }
}

export default SelectionMixin
