import React from 'react'
import PropTypes from 'prop-types'

import {
  FlexibleRange
} from '../util/FlexibleRange.js'
import {
  TouchHandler
} from '../util/TouchHandler.js'

import '../styles/Selection.css'

/**
 * This is a mixin that augments the text-selection experience on mobile with the introduction of a selection manipulation pad designed for mobile with the capabilities for mobile
 */
class SelectionMixin extends React.Component {
  static propTypes = {
    /** The minimum distance required to swipe down to dismiss the selection */
    collapseSwipeDistance: PropTypes.number,
    /** The maximum duration of the swipe down to dismiss the selection */
    collapseSwipeDuration: PropTypes.number,
    /** The interval the manipulation pad is inactive for when the selection is natively manipulated */
    nativeManipulationInactivityDuration: PropTypes.number,
    /** The theme of the pad (dark, light) */
    theme: PropTypes.string
  }

  static defaultProps = {
    collapseSwipeDistance: 100,
    collapseSwipeDuration: 300,
    nativeManipulationInactivityDuration: 500,
    theme: 'dark'
  }

  /** The default height of a handle if it has no text range to base its height off of */
  static defaultHandleHeight = 18

  /**
   * Get the range/caret position from a page coordinate X Y (Intended for multi-browser support)
   * @param   {Number}                       x The x coordinate
   * @param   {Number}                       y The y coordinate
   * @returns {[node: Node, offset: Number]}   The caret node and position
   */
  static getCaretPosition (x, y) {
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

  /** The selection range before the last resize was finalized */
  originRange = null
  /** The current selection range (live) */
  selectRange = null
  /** A ref to the manipulation pad */
  manipulator = React.createRef()

  state = {
    /** Whether a touch has been detected and the manipulator is mounted */
    initialized: false,
    /** Whether there is an active selection and the manipulation pad should be visible or not */
    selecting: false,
    /** Whether the user is pressing down and is actively manipulating the selection or not */
    manipulating: false
  }

  constructor (props) {
    super(props)

    this.initializeComponent = this.initializeComponent.bind(this)
    this.launchManipulator = this.launchManipulator.bind(this)
    this.manipulateSelection = this.manipulateSelection.bind(this)
    this.stopManipulation = this.stopManipulation.bind(this)
    this.copySelection = this.copySelection.bind(this)
    this.reselectRanges = this.reselectRanges.bind(this)
  }

  componentDidMount () {
    document.addEventListener('touchstart', this.initializeComponent, {
      once: true
    })

    TouchHandler.mount()
  }

  componentWillUnmount () {
    if (this.state.initialized) {
      document.removeEventListener('selectionchange', this.launchManipulator)

      TouchHandler.unmount()
    } else document.removeEventListener('touchstart', this.initializeComponent)
  }

  render () {
    if (!this.state.initialized) return null

    return (
      <>
        {this.props.children}

        <div
          className={`fluent manipulator ${this.props.theme} ${this.state.selecting ? 'active' : 'inactive'}`}
          id='fluentselectionmanipulator'
          onTouchStart={this.manipulateSelection}
          onTouchMove={this.manipulateSelection}
          onTouchEnd={this.stopManipulation}
          onTouchCancel={this.stopManipulation}
          onTouchEndCapture={window.FLUENT_IS_IOS ? this.reselectRanges : null} // NOTE: IOS clears selection
          onDoubleClick={this.copySelection}
          ref={this.manipulator}
        />

        <div className={`fluent handle ${this.state.manipulating ? 'active' : 'inactive'}`} id='fluentselectionhandlestart'/>
        <div className={`fluent handle ${this.state.manipulating ? 'active' : 'inactive'}`} id='fluentselectionhandleend'/>
      </>
    )
  }

  /**
   * Mount the component and listen for touches thoroughly
   * @fires document#touchstart
   */
  initializeComponent () {
    if (!this.state.initialized) {
      this.setState({
        initialized: true
      })

      document.addEventListener('selectionchange', this.launchManipulator)
    }
  }

  /**
   * Display the manipulation pad
   * @param {TouchEvent} e The touch event
   * @fires document#selectionchange
   */
  // TODO: Support inputs and textareas
  launchManipulator (e) {
    if (!this.state.manipulating) {
      const selection = window.getSelection()
      const selectionMatches = selection.rangeCount && (window.FLUENT_IS_IOS // NOTE: IOS selection range not a FlexibleRange instance
        ? this.compareRangesForIOS(selection.getRangeAt(0), this.selectRange)
        : selection.getRangeAt(0) === this.selectRange)

      const selecting = (!selection.isCollapsed && selection.rangeCount) || selectionMatches

      if (this.state.selecting && selecting && !selectionMatches) { // Disable pad when selection is being manipulated natively
        this.manipulator.current.classList.add('inactive')

        clearTimeout(this.enableTouchTimeout)
        this.enableTouchTimeout = setTimeout(() => this.manipulator.current.classList.remove('inactive'), this.props.nativeManipulationInactivityDuration)
      }

      this.setState({
        selecting
      })
    }
  }

  /**
   * Manipulate the selection based off of finger distance difference and move the indication handles
   * @param {TouchEvent} e The touch event
   * @fires fluentselectionmanipulator#touchstart
   * @fires fluentselectionmanipulator#touchmove
   */
  manipulateSelection (e) {
    const selection = window.getSelection()

    if (!selection.rangeCount) return

    const touches = TouchHandler.formatTouches(e.targetTouches)

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
      touches[1] && TouchHandler.originTouches[1] ? touches[1].clientX - TouchHandler.originTouches[1].clientX : 0, // Start X
      touches[1] && TouchHandler.originTouches[1] ? touches[1].clientY - TouchHandler.originTouches[1].clientY : 0, // Start Y
      touches[0] && TouchHandler.originTouches[0] ? touches[0].clientX - TouchHandler.originTouches[0].clientX : 0, // End X
      touches[0] && TouchHandler.originTouches[0] ? touches[0].clientY - TouchHandler.originTouches[0].clientY : 0 // End Y
    ]

    const positions = []
    for (let d = 0; d < rect.length; ++d) positions.push(Math.max(0, rect[d] + shifts[d]))

    // Range sizing
    this.manipulator.current.style.pointerEvents = 'none' // Allow range passthrough of manipulation pad
    if (touches[1]) this.selectRange.setStart(...SelectionMixin.getCaretPosition(positions[0], positions[1] + (this.originRange.startCoords.height / 2)))
    if (touches[0]) this.selectRange.setEnd(...SelectionMixin.getCaretPosition(positions[2], positions[3] + (this.originRange.endCoords.height / 2)))
    this.manipulator.current.style.pointerEvents = null

    // NOTE: Safari selection behavior and Android tap selection behavior
    if (window.FLUENT_IS_IOS || selection.isCollapsed) this.reselectRanges()

    this.positionHandles(touches, this.selectRange.reversed, ...positions) // Position handles

    if (this.selectRange.startOffset !== oldStartOffset || this.selectRange.endOffset !== oldEndOffset) navigator.vibrate?.(1)
  }

  /**
   * Stop the manipulation of a side based on removed touches
   * @param {TouchEvent} e The touch event
   */
  stopManipulation (e) {
    for (const touch of e.changedTouches) {
      const identifier = TouchHandler.normalizeIdentifier(touch)

      if (identifier === 1) this.originRange.setStart(...this.selectRange._registeredStart)
      else if (!identifier) this.originRange.setEnd(...this.selectRange._registeredEnd)
    }

    if (!e.targetTouches.length) {
      const [touch] = e.changedTouches
      const identifier = TouchHandler.normalizeIdentifier(touch)

      if (
        touch.clientY - TouchHandler.originTouches[identifier].clientY >= this.props.collapseSwipeDistance &&
        e.timeStamp - TouchHandler.originTouches[identifier].FLUENT_TIMESTAMP <= this.props.collapseSwipeDuration
      ) window.getSelection().removeAllRanges() // Swipedown collapse gesture

      if (this.originRange.reversed) this.originRange.reverse()
    }

    this.manipulateSelection(e) // Correct handle positions to stick to range

    if (!e.targetTouches.length) this.setState({ manipulating: false })
  }

  /**
   * Position the selection indication handles
   * @param {Touch[]}   touches   The current touches (used to determine actively manipulated handles)
   * @param {Boolean}   reversed  Whether the current selection is reversed or not (used to determine actively manipulated handles)
   * @param {...Number} positions The XY positions of the left handle followed by the XY positions of the right handle
   */
  positionHandles (touches, reversed, ...positions) {
    const handles = document.getElementsByClassName('fluent handle')

    for (let i = 0; i < 2; ++i) {
      const handle = handles[i]

      if (touches[1 - i]) handle.classList.add('manipulating') // NOTE: Handle order reversed since the first touch is the last handle
      else handle.classList.remove('manipulating')

      handle.style.left = positions[i * 2] + 'px'
      handle.style.top = positions[(i * 2) + 1] + 'px'
      handle.style.height = this.selectRange[['startCoords', 'endCoords'][i]].height + 'px'
    }
  }

  /**
   * Send the active selection to the clipboard
   * @listens fluentselectionmanipulator#dblclick
   */
  copySelection () {
    if (window.FLUENT_IS_IOS) this.reselectRanges() // NOTE: IOS clears selection

    const selection = window.getSelection()

    this.manipulator.current.classList.add('refresh')
    setImmediate(() => this.manipulator.current.classList.remove('refresh')) // Wait for DOM to rerender

    navigator.vibrate?.([50, 0, 50])

    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(selection.toString())
    else document.execCommand('copy')
  }

  // --- UNIQUE BEHAVIOR METHODS ---

  /**
   * Re-add selectRange to the selection
   */
  reselectRanges () {
    const selection = window.getSelection()

    selection.removeAllRanges()
    selection.addRange(this.selectRange)
  }

  // --- IOS METHODS ---

  /**
   * Compare the values of two ranges to see if they are equal
   * @param   {Range}   first  The first range
   * @param   {Range}   second The second range
   * @returns {Boolean}        Whether the ranges are equal
   */
  compareRangesForIOS (first, second) {
    return first && second &&
      first.startContainer === second.startContainer &&
      first.startOffset === second.startOffset &&
      first.endContainer === second.endContainer &&
      first.endOffset === second.endOffset
  }
}

export default SelectionMixin
