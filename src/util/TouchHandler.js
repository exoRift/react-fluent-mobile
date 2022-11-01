// NOTE: `this` is not used as the static class anticipates event listener binding

/**
 * The class that normalizes and organizes touches
 * @desc This class is necessary due to some inconsistencies
 * @desc between iOS and other platforms such as iOS's unique touch identifier behavior
 * @desc and iOS's inability to cancel contextmenu events
 * */
class TouchHandler {
  /** The duration before a touch hold is triggered */
  static touchHoldDuration = 250

  /**
   * @private
   * The number of agents mounting the handler
   * */
  static mountCount = 0

  /** The active touches at their points of contact */
  static originTouches = []

  /** The timeout for touch holds */
  static touchHoldTimeout = null

  /** Mount the handler to append data to touch events */
  static mount () {
    if (!TouchHandler.mountCount) {
      document.addEventListener('touchstart', TouchHandler.registerTouchesFromEvent, true)
      document.addEventListener('touchend', TouchHandler.unregisterTouchesFromEvent, true)
      document.addEventListener('touchcancel', TouchHandler.unregisterTouchesFromEvent, true)

      if (window.FLUENT_IS_IOS) {
        document.addEventListener('touchmove', TouchHandler.cancelHold)

        const style = document.createElement('style')
        style.id = 'FLUENT_CALLOUT'
        style.textContent = '* { -webkit-touch-callout: none; }'

        document.head.appendChild(style)
      }
    }

    ++TouchHandler.mountCount
  }

  /** Unmount the handler */
  static unmount () {
    --TouchHandler.mountCount

    if (!TouchHandler.mountCount) {
      document.removeEventListener('touchstart', TouchHandler.registerTouchesFromEvent)
      document.removeEventListener('touchend', TouchHandler.unregisterTouches)
      document.removeEventListener('touchcancel', TouchHandler.unregisterTouches)

      if (window.FLUENT_IS_IOS) {
        document.removeEventListener('touchmove', TouchHandler.cancelHold)

        document.getElementById('FLUENT_CALLOUT')?.remove?.()
      }
    }
  }

  /**
   * Register the touches of a touch event in the origin registry
   * @param {TouchEvent} e The touch event
   * @fires document#touchstart
   */
  static registerTouchesFromEvent (e) {
    for (const touch of e.changedTouches) {
      touch.FLUENT_TIMESTAMP = e.timeStamp

      if (window.FLUENT_IS_IOS) { // NOTE: IOS touch UUIDs
        const firstNull = TouchHandler.originTouches.indexOf(null)

        TouchHandler.originTouches[firstNull === -1 ? TouchHandler.originTouches.length : firstNull] = touch
      } else TouchHandler.originTouches[touch.identifier] = touch
    }

    if (window.FLUENT_IS_IOS) {
      if (!TouchHandler.touchHoldTimeout) {
        if (e.changedTouches.length === 1) {
          const [touch] = e.changedTouches

          TouchHandler.touchHoldTimeout = setTimeout(() => {
            const event = new MouseEvent('contextmenu', {
              bubbles: true,
              clientX: touch.clientX,
              clientY: touch.clientY
            })

            touch.target.dispatchEvent(event)

            TouchHandler.touchHoldTimeout = null

            navigator?.vibrate?.(5)
          }, TouchHandler.touchHoldDuration)
        }
      } else TouchHandler.cancelHold()
    }
  }

  /**
   * Purge ceased touches of a touch event from the origin registry
   * @param {TouchEvent} e The touch event
   * @fires document#touchend
   * @fires document#touchcancel
   */
  static unregisterTouchesFromEvent (e) {
    if (window.FLUENT_IS_IOS) {
      if (!TouchHandler.touchHoldTimeout) TouchHandler.touchHoldTimeout = clearTimeout(TouchHandler.touchHoldTimeout)
    }

    setImmediate(() => {
      for (const touch of e.changedTouches) TouchHandler.originTouches[TouchHandler.normalizeIdentifier(touch)] = null
    }) // Make listener run last
  }

  /**
   * Get the normalized identifier of a touch
   * @param   {Touch}  touch The touch instance
   * @returns {Number}       The identifier corresponding to the position in the touch registry
   */
  static normalizeIdentifier (touch) {
    return window.FLUENT_IS_IOS ? TouchHandler.originTouches.findIndex((t) => t?.identifier === touch.identifier) : touch.identifier
  }

  /**
   * Format a TouchList into an array where the index is the normalized identifier
   * @param   {TouchList} list The list of touches
   * @returns {Touch[]}        The formatted touches
   */
  static formatTouches (list) {
    const touches = []

    for (const touch of list) touches[TouchHandler.normalizeIdentifier(touch)] = touch

    return touches
  }

  /**
   * Cancel the touch hold timeout (used for iOS)
   * @private
   */
  static cancelHold () {
    TouchHandler.touchHoldTimeout = clearTimeout(TouchHandler.touchHoldTimeout)
  }
}

export {
  TouchHandler
}
