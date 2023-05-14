import {
  useEffect,
  useRef,
  useState
} from 'react'

import {
  FlexibleRange
} from '../util/flexible-range'
import * as TouchHandler from '../util/touch-handler'

import '../styles/Selection.css'

export interface SelectionMixinProps {
  collapseSwipeDistance: number
  collapseSwipeDuration: number
  nativeManipulationInactivityDuration: number
  theme: string
  children?: React.ReactNode
}

/**
   * Get the range/caret position from a page coordinate X Y
   * @note Intended for multi-browser support
   * @returns The caret node and position
   */
function getCaretPosition (x: number, y: number): [Node?, number?] {
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
function compareRangesForIOS (first: Range, second: Range): boolean {
  return first && second &&
    first.startContainer === second.startContainer &&
    first.startOffset === second.startOffset &&
    first.endContainer === second.endContainer &&
    first.endOffset === second.endOffset
}

/**
 * Hard-reselect a range
 * @note This is for unique behavior such as Android selection
 */
function reselectRange (range: FlexibleRange): void {
  const selection = window.getSelection()

  selection?.removeAllRanges()
  selection?.addRange(range)
}

function positionHandles (touches: Array<Touch | React.Touch>, selection: FlexibleRange, ...positions: number[]): void {
  const handles = document.getElementsByClassName('fluent handle') as HTMLCollectionOf<HTMLElement>

  for (let i = 0; i < 2; ++i) {
    const handle = handles[i]

    if (touches[1 - i]) handle.classList.add('manipulating') // NOTE: Handle order reversed since the first touch is the last handle
    else handle.classList.remove('manipulating')

    handle.style.left = positions[i * 2].toString() + 'px'
    handle.style.top = positions[(i * 2) + 1].toString() + 'px'
    handle.style.height = selection[(['startCoords', 'endCoords'] as const)[i]].height.toString() + 'px'
  }
}

const SelectionMixin: React.FunctionComponent<SelectionMixinProps> = (props) => {
  // States
  const [initialized, setInitialized] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [manipulating, setManipulating] = useState(false)

  // Refs
  const manipulator = useRef<HTMLDivElement>(null)
  const anticipatingSelection = useRef(false)
  const selectRange = useRef(new FlexibleRange())
  const originRange = useRef(new FlexibleRange())
  const enableTouchTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  /**
   * Display the manipulation pad
   * @fires document#selectionchange
   */
  const launchManipulator = useRef((): void => {
    if (anticipatingSelection.current && !manipulating) {
      const selection = window.getSelection()
      const selectionMatches = (
        (selection?.rangeCount &&
        (window.FLUENT_IS_IOS // NOTE: IOS selection range not a FlexibleRange instance
          ? compareRangesForIOS(selection.getRangeAt(0), selectRange.current)
          : selection.getRangeAt(0) === selectRange.current))
      )

      const shouldSelect = (!selection?.isCollapsed && selection?.rangeCount) ?? selectionMatches

      if (selecting && shouldSelect && !selectionMatches) { // Disable pad when selection is being manipulated natively
        manipulator.current?.classList.add('inactive')

        clearTimeout(enableTouchTimeout.current)
        enableTouchTimeout.current = setTimeout(
          () => manipulator.current?.classList.remove('inactive'),
          props.nativeManipulationInactivityDuration
        )
      }

      setSelecting(shouldSelect as boolean)

      anticipatingSelection.current = false
    }
  })
  const anticipateSelection = useRef((e?: PointerEvent): void => {
    if (e?.pointerType === 'touch') anticipatingSelection.current = true
    else {
      anticipatingSelection.current = false

      setSelecting(false)
    }
  })
  const initializeComponent = useRef(() => {
    if (!initialized) {
      setInitialized(true)

      document.addEventListener('pointerdown', anticipateSelection.current)
      document.addEventListener('selectionchange', launchManipulator.current)

      anticipatingSelection.current = true
    }
  })
  const manipulateSelection = useRef<React.TouchEventHandler<HTMLDivElement>>((e) => {
    const selection = window.getSelection()

    if (
      !selection?.rangeCount ||
      !manipulator.current
    ) return

    const touches = TouchHandler.formatTouches(e.targetTouches)

    if (!manipulating) { // First touch
      setManipulating(true)

      originRange.current = new FlexibleRange(selection.getRangeAt(0))
      selectRange.current = new FlexibleRange(selection.getRangeAt(0))

      selection.removeAllRanges()
      selection.addRange(selectRange.current)
    }

    const oldStartOffset = selectRange.current?.startOffset
    const oldEndOffset = selectRange.current?.endOffset

    const rect = [
      originRange.current.startCoords?.x,
      originRange.current.startCoords?.y,
      originRange.current.endCoords?.x,
      originRange.current.endCoords?.y
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
    manipulator.current.style.pointerEvents = 'none' // Allow range passthrough of manipulation pad
    if (touches[1]) selectRange.current.setStart(...getCaretPosition(positions[0], positions[1] + (originRange.current.startCoords.height / 2)))
    if (touches[0]) selectRange.current.setEnd(...getCaretPosition(positions[2], positions[3] + (originRange.current.endCoords.height / 2)))
    manipulator.current.style.pointerEvents = ''

    // NOTE: Safari selection behavior and Android tap selection behavior
    if (window.FLUENT_IS_IOS || selection.isCollapsed) reselectRange(selectRange.current)

    positionHandles(touches, selectRange.current, ...positions) // Position handles

    if (selectRange.current.startOffset !== oldStartOffset || selectRange.current.endOffset !== oldEndOffset) navigator.vibrate?.(1)
  })
  const stopManipulation = useRef<React.TouchEventHandler<HTMLDivElement>>((e) => {
    for (const touch of e.changedTouches) {
      const identifier = TouchHandler.normalizeIdentifier(touch)

      if (identifier === 1) originRange.current.setStart(...selectRange.current._registeredStart)
      else if (!identifier) originRange.current.setEnd(...selectRange.current._registeredEnd)
    }

    if (!e.targetTouches.length) {
      const [touch] = e.changedTouches
      const identifier = TouchHandler.normalizeIdentifier(touch)

      if (
        touch.clientY - (TouchHandler.originTouches[identifier]?.clientY ?? 0) >= props.collapseSwipeDistance &&
        e.timeStamp - (TouchHandler.originTouches[identifier]?.FLUENT_TIMESTAMP ?? 0) <= props.collapseSwipeDuration
      ) window.getSelection()?.removeAllRanges() // Swipedown collapse gesture

      if (originRange.current.reversed) originRange.current.reverse()
    }

    manipulateSelection.current(e) // Correct handle positions to stick to range

    if (!e.targetTouches.length) setManipulating(false)
  })
  const copySelection = useRef<React.MouseEventHandler<HTMLDivElement>>(() => {
    if (window.FLUENT_IS_IOS) reselectRange(selectRange.current) // NOTE: IOS clears selection

    const selection = window.getSelection()

    manipulator.current?.classList.add('refresh')
    setTimeout(() => manipulator.current?.classList.remove('refresh')) // Wait for DOM to rerender

    navigator.vibrate?.([50, 0, 50])

    if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(selection?.toString() ?? '')
    else document.execCommand('copy')
  })

  useEffect(() => {
    document.addEventListener('touchstart', initializeComponent.current, {
      once: true
    })

    TouchHandler.mount()

    return () => { // On unmount
      if (initialized) {
        document.removeEventListener('pointerdown', anticipateSelection.current)
        document.removeEventListener('selectionchange', launchManipulator.current)

        TouchHandler.unmount()
      } else document.removeEventListener('touchstart', initializeComponent.current)
    }
  }, [])

  if (!initialized) return null

  return (
    <>
      {props.children}

      <div
        className={`fluent manipulator ${props.theme} ${selecting ? 'active' : 'inactive'}`}
        id='fluentselectionmanipulator'
        onTouchStart={manipulateSelection.current}
        onTouchMove={manipulateSelection.current}
        onTouchEnd={stopManipulation.current}
        onTouchCancel={stopManipulation.current}
        onTouchEndCapture={window.FLUENT_IS_IOS ? () => reselectRange(selectRange.current) : undefined} // NOTE: IOS clears selection
        onDoubleClick={copySelection.current}
        ref={manipulator}
      />

      <div className={`fluent handle ${manipulating ? 'active' : 'inactive'}`} id='fluentselectionhandlestart'/>
      <div className={`fluent handle ${manipulating ? 'active' : 'inactive'}`} id='fluentselectionhandleend'/>
    </>
  )
}
SelectionMixin.defaultProps = {
  collapseSwipeDistance: 100,
  collapseSwipeDuration: 300,
  nativeManipulationInactivityDuration: 500,
  theme: 'dark'
}

export default SelectionMixin
