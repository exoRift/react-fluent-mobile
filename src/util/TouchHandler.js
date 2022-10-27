// NOTE: `this` is not used as the static class anticipates event listener binding

/**
 * The class that normalizes and organizes touches
 * @desc This class is necessary due to some inconsistencies
 * between iOS and other platforms such as iOS's unique touch identifier behavior
 * and iOS's inability to cancel contextmenu events
 * */
class TouchHandler {
  /**
   * @private
   * The number of agents mounting the handler
   * */
  static mountCount = 0

  /** The active touches at their points of contact */
  static originTouches = []

  /** Mount the handler to append data to touch events */
  static mount () {
    if (!TouchHandler.mountCount) {
      document.addEventListener('touchstart', TouchHandler.registerTouchesFromEvent, true)
      document.addEventListener('touchend', TouchHandler.unregisterTouchesFromEvent, true)
      document.addEventListener('touchcancel', TouchHandler.unregisterTouchesFromEvent, true)
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
  }

  /**
   * Purge ceased touches of a touch event from the origin registry
   * @param {TouchEvent} e The touch event
   * @fires document#touchend
   * @fires document#touchcancel
   */
  static unregisterTouchesFromEvent (e) {
    setTimeout(() => {
      for (const touch of e.changedTouches) TouchHandler.originTouches[TouchHandler.normalizeIdentifier(touch)] = null
    }) // Negligible delay for listener to run last
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
}

export {
  TouchHandler
}
