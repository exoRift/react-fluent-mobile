/** The duration before a touch hold is triggered */
const touchHoldDuration = 250
/** The number of agents mounting the handler */
let mountCount = 0
/** The active touches at their points of contact */
export const originTouches: Array<Touch | React.Touch | null> = []
/** The timeout for touch holds */
let touchHoldTimeout: NodeJS.Timeout | null = null

/** Mount the handler to append data to touch events */
export function mount (): void {
  if (!mountCount) {
    document.addEventListener('touchstart', registerTouchesFromEvent, true)
    document.addEventListener('touchend', unregisterTouchesFromEvent, true)
    document.addEventListener('touchcancel', unregisterTouchesFromEvent, true)

    if (window.FLUENT_IS_IOS) {
      document.addEventListener('touchmove', cancelHold)

      const style = document.createElement('style')
      style.id = 'FLUENT_CALLOUT'
      style.textContent = '* { -webkit-touch-callout: none; }'

      document.head.appendChild(style)
    }
  }

  ++mountCount
}

/** Unmount the handler */
export function unmount (): void {
  --mountCount

  if (!mountCount) {
    document.removeEventListener('touchstart', registerTouchesFromEvent)
    document.removeEventListener('touchend', unregisterTouchesFromEvent)
    document.removeEventListener('touchcancel', unregisterTouchesFromEvent)

    if (window.FLUENT_IS_IOS) {
      document.removeEventListener('touchmove', cancelHold)

      document.getElementById('FLUENT_CALLOUT')?.remove?.()
    }
  }
}

/**
 * Register the touches of a touch event in the origin registry
 * @param e The touch event
 * @fires document#touchstart
 */
export function registerTouchesFromEvent (e: TouchEvent | React.TouchEvent<HTMLDivElement>): void {
  for (const touch of e.changedTouches) {
    touch.FLUENT_TIMESTAMP = e.timeStamp

    if (window.FLUENT_IS_IOS) { // NOTE: IOS touch UUIDs
      const firstNull = originTouches.indexOf(null)

      originTouches[firstNull === -1 ? originTouches.length : firstNull] = touch
    } else originTouches[touch.identifier] = touch
  }

  if (window.FLUENT_IS_IOS) {
    if (!touchHoldTimeout) {
      if (e.changedTouches.length === 1) {
        const [touch] = e.changedTouches

        touchHoldTimeout = setTimeout(() => {
          const cancelTouchEvent = new TouchEvent('touchcancel', {
            bubbles: false,
            changedTouches: [new Touch({
              target: document,
              identifier: touch.identifier
            })]
          }) // NOTE: Prevent text selection
          const contextEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            clientX: touch.clientX,
            clientY: touch.clientY
          })

          document.dispatchEvent(cancelTouchEvent)
          touch.target.dispatchEvent(contextEvent)

          touchHoldTimeout = null

          navigator?.vibrate?.(5)
        }, touchHoldDuration)
      }
    } else cancelHold()
  }
}

/**
 * Purge ceased touches of a touch event from the origin registry
 * @param e The touch event
 * @fires document#touchend
 * @fires document#touchcancel
 */
export function unregisterTouchesFromEvent (e: TouchEvent | React.TouchEvent<HTMLDivElement>): void {
  if (window.FLUENT_IS_IOS) {
    if (touchHoldTimeout) {
      clearTimeout(touchHoldTimeout)

      touchHoldTimeout = null
    }
  }

  setTimeout(() => {
    for (const touch of e.changedTouches) originTouches[normalizeIdentifier(touch)] = null
  }) // Make listener run last
}

/**
 * Get the normalized identifier of a touch
 * @param   touch The touch instance
 * @returns       The identifier corresponding to the position in the touch registry
 */
export function normalizeIdentifier (touch: Touch | React.Touch): number {
  return window.FLUENT_IS_IOS ? originTouches.findIndex((t) => t?.identifier === touch.identifier) : touch.identifier
}

/**
 * Format a TouchList into an array where the index is the normalized identifier
 * @param   list The list of touches
 * @returns      The formatted touches
 */
export function formatTouches (list: TouchList | React.TouchList): Array<Touch | React.Touch> {
  const touches = []

  for (const touch of list) touches[normalizeIdentifier(touch)] = touch

  return touches
}

/**
 * Cancel the touch hold timeout
 * @note Used for iOS
 */
export function cancelHold (): void {
  if (touchHoldTimeout) {
    clearTimeout(touchHoldTimeout)

    touchHoldTimeout = null
  }
}
