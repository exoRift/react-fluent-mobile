import React from 'react'
import * as PropTypes from 'prop-types'

import {
  FlexibleRange
} from '../util/flexible-range'
import * as TouchHandler from '../util/touch-handler'

import '../styles/Selection.css'

export interface SelectionMixinProps {
  /** The minimum distance required to swipe down to dismiss the selection */
  collapseSwipeDistance?: number
  /** The maximum duration of the swipe down to dismiss the selection */
  collapseSwipeDuration?: number
  /** The interval the manipulation pad is inactive for when the selection is natively manipulated */
  nativeManipulationInactivityDuration?: number
  /** The theme of the pad */
  theme?: 'dark' | 'light'
}

/**
 * This is a mixin that augments the text-selection experience on mobile with the introduction of a selection manipulation pad designed for mobile with the capabilities for mobile
 */
class SelectionMixin extends React.Component<Required<SelectionMixinProps> & React.PropsWithChildren> {
  static propTypes = {
    collapseSwipeDistance: PropTypes.number,
    collapseSwipeDuration: PropTypes.number,
    nativeManipulationInactivityDuration: PropTypes.number,
    theme: PropTypes.oneOf(['dark', 'light'])
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
   * Get the range/caret position from a page coordinate X Y
   * @note Intended for multi-browser support
   * @returns The caret node and position
   */
  static getCaretPosition (x: number, y: number): [Node?, number?] {
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

  /**
   * Compare the values of two ranges to see if they are equal
   * @note This is for iOS
   * @param   first  The first range
   * @param   second The second range
   * @returns        Whether the ranges are equal
   */
  static compareRangesForIOS (first: Range, second: Range): boolean {
    return first && second &&
      first.startContainer === second.startContainer &&
      first.startOffset === second.startOffset &&
      first.endContainer === second.endContainer &&
      first.endOffset === second.endOffset
  }

  /** The selection range before the last resize was finalized */
  originRange = new FlexibleRange()
  /** The current selection range (live) */
  selectRange = new FlexibleRange()
  /** A ref to the manipulation pad */
  manipulator = React.createRef<HTMLDivElement>()
  /** Refs to the selection handles */
  handles = [React.createRef<HTMLDivElement>(), React.createRef<HTMLDivElement>()]
  /** Whether the next selectionchange is prompted by a touch or not */
  anticipatingSelection = false
  /** The timeout to enable the manipulator */
  enableTouchTimeout?: NodeJS.Timeout

  state = {
    /** Whether a touch has been detected and the manipulator is mounted */
    initialized: false,
    /** Whether there is an active selection and the manipulation pad should be visible or not */
    selecting: false,
    /** Whether the user is pressing down and is actively manipulating the selection or not */
    manipulating: false
  }

  constructor (props: SelectionMixinProps) {
    super(props as Required<SelectionMixinProps>)

    this.initializeComponent = this.initializeComponent.bind(this)
    this.anticipateSelection = this.anticipateSelection.bind(this)
    this.launchManipulator = this.launchManipulator.bind(this)
    this.manipulateSelection = this.manipulateSelection.bind(this)
    this.stopManipulation = this.stopManipulation.bind(this)
    this.copySelection = this.copySelection.bind(this)
    this.reselectRanges = this.reselectRanges.bind(this)
  }

  /**
   * Start listening for touches to mount the component
   */
  componentDidMount (): void {
    document.addEventListener('touchstart', this.initializeComponent, {
      once: true
    })

    TouchHandler.mount()
  }

  componentWillUnmount (): void {
    if (this.state.initialized) {
      document.removeEventListener('pointerdown', this.anticipateSelection)
      document.removeEventListener('selectionchange', this.launchManipulator)

      TouchHandler.unmount()
    } else document.removeEventListener('touchstart', this.initializeComponent)
  }

  render (): JSX.Element | null {
    if (!this.state.initialized) return null

    return (
      <>
        {this.props.children}

        <div
          className={`fluent manipulator ${this.props.theme}`}
          id='fluentselectionmanipulator'
          data-active={this.state.selecting}
          onTouchStart={this.manipulateSelection}
          onTouchMove={this.manipulateSelection}
          onTouchEnd={this.stopManipulation}
          onTouchCancel={this.stopManipulation}
          onTouchEndCapture={window.FLUENT_IS_IOS ? this.reselectRanges : undefined} // NOTE: IOS clears selection
          onDoubleClick={this.copySelection}
          ref={this.manipulator}
        />

        <div className='fluent handle' id='fluentselectionhandlestart' data-active={this.state.manipulating} ref={this.handles[0]} />
        <div className='fluent handle' id='fluentselectionhandleend' data-active={this.state.manipulating} ref={this.handles[1]} />
      </>
    )
  }

  /**
   * Mount the component and listen for touches thoroughly
   * @fires document#touchstart
   */
  initializeComponent (): void {
    if (!this.state.initialized) {
      this.setState({
        initialized: true
      })

      document.addEventListener('pointerdown', this.anticipateSelection)
      document.addEventListener('selectionchange', this.launchManipulator)

      this.anticipatingSelection = true
    }
  }

  /**
   * Anticipate a selection from a touch or unanticipate it from a click
   * @param e The pointer event responsible
   * @fires document#pointerdown
   */
  anticipateSelection (e: PointerEvent | React.PointerEvent): void {
    if (e.pointerType === 'touch') this.anticipatingSelection = true
    else {
      this.anticipatingSelection = false

      this.setState({
        selecting: false
      })
    }
  }

  /**
   * Display the manipulation pad
   * @fires document#selectionchange
   */
  launchManipulator (): void {
    if (this.anticipatingSelection && !this.state.manipulating) {
      const selection = window.getSelection()

      const selectionMatches = Boolean(
        (selection?.rangeCount &&
        (window.FLUENT_IS_IOS // NOTE: IOS selection range not a FlexibleRange instance
          ? SelectionMixin.compareRangesForIOS(selection.getRangeAt(0), this.selectRange)
          : selection.getRangeAt(0) === this.selectRange))
      )

      const shouldSelect = Boolean((!selection?.isCollapsed && selection?.rangeCount) ?? selectionMatches)

      if (this.state.selecting && shouldSelect && !selectionMatches) { // Disable pad when selection is being manipulated natively
        this.manipulator.current?.setAttribute('data-active', 'false')

        clearTimeout(this.enableTouchTimeout)
        this.enableTouchTimeout = setTimeout(
          () => this.manipulator.current?.setAttribute('data-active', 'true'),
          this.props.nativeManipulationInactivityDuration
        )
      }

      this.setState({
        selecting: shouldSelect
      })

      this.anticipatingSelection = false
    }
  }

  /**
   * Manipulate the selection based off of finger distance difference and move the indication handles
   * @param e The touch event responsibler
   * @fires fluentselectionmanipulator#touchstart
   * @fires fluentselectionmanipulator#touchmove
   */
  manipulateSelection (e: TouchEvent | React.TouchEvent): void {
    const selection = window.getSelection()

    if (!selection?.rangeCount || !this.manipulator.current) return

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
      this.originRange.startCoords?.x,
      this.originRange.startCoords?.y,
      this.originRange.endCoords?.x,
      this.originRange.endCoords?.y
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
    this.manipulator.current.style.pointerEvents = ''

    // NOTE: Safari selection behavior and Android tap selection behavior
    if (window.FLUENT_IS_IOS || selection.isCollapsed) this.reselectRanges()

    this.positionHandles(touches, positions, this.selectRange.reversed) // Position handles

    if (this.selectRange.startOffset !== oldStartOffset || this.selectRange.endOffset !== oldEndOffset) navigator.vibrate?.(1)
  }

  /**
   * Stop the manipulation of a side based on removed touches
   * @param e The touch event responsible
   */
  stopManipulation (e: TouchEvent | React.TouchEvent): void {
    for (const touch of e.changedTouches) {
      const identifier = TouchHandler.normalizeIdentifier(touch)

      if (identifier === 1) this.originRange.setStart(...this.selectRange._registeredStart!)
      else if (!identifier) this.originRange.setEnd(...this.selectRange._registeredEnd!)
    }

    if (!e.targetTouches.length) {
      const [touch] = e.changedTouches
      const identifier = TouchHandler.normalizeIdentifier(touch)

      if (
        touch.clientY - (TouchHandler.originTouches[identifier]?.clientY ?? 0) >= this.props.collapseSwipeDistance &&
        e.timeStamp - (TouchHandler.originTouches[identifier]?.FLUENT_TIMESTAMP ?? 0) <= this.props.collapseSwipeDuration
      ) window.getSelection()?.removeAllRanges() // Swipedown collapse gesture

      if (this.originRange.reversed) this.originRange.reverse()
    }

    this.manipulateSelection(e) // Correct handle positions to stick to range

    if (!e.targetTouches.length) this.setState({ manipulating: false })
  }

  /**
   * Position the selection indication handles
   * @param touches   The current touches (used to determine actively manipulated handles)
   * @param positions The XY positions of the left handle followed by the XY positions of the right handle
   * @param reversed  Whether the current selection is reversed or not (used to determine actively manipulated handles)
   */
  positionHandles (touches: Array<Touch | React.Touch>, positions: number[], reversed?: boolean): void {
    for (let i = 0; i < 2; ++i) {
      const handle = this.handles[i].current

      if (handle) {
        if (touches[1 - i]) handle.setAttribute('data-manipulating', 'true') // NOTE: Handle order reversed since the first touch is the last handle
        else handle.setAttribute('data-manipulating', 'false')

        handle.style.left = positions[i * 2].toString() + 'px'
        handle.style.top = positions[(i * 2) + 1].toString() + 'px'
        handle.style.height = this.selectRange[(['startCoords', 'endCoords'] as const)[i]].height.toString() + 'px'
      }
    }
  }

  /**
   * Send the active selection to the clipboard
   * @listens fluentselectionmanipulator#dblclick
   */
  copySelection (): void {
    if (window.FLUENT_IS_IOS) this.reselectRanges() // NOTE: IOS clears selection

    const selection = window.getSelection()

    this.manipulator.current?.classList.add('refresh')
    setTimeout(() => this.manipulator.current?.classList.remove('refresh')) // Wait for DOM to rerender

    navigator.vibrate?.([50, 0, 50])

    if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(selection?.toString() ?? '')
    else document.execCommand('copy')
  }

  // --- UNIQUE BEHAVIOR METHODS ---

  /**
   * Re-add selectRange to the selection
   */
  reselectRanges (): void {
    const selection = window.getSelection()

    selection?.removeAllRanges()
    selection?.addRange(this.selectRange)
  }
}

export default SelectionMixin
