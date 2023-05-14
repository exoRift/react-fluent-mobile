declare global {
  interface Window {
    FLUENT_IS_IOS: boolean
  }

  /** A single contact point on a touch-sensitive device. The contact point is commonly a finger or stylus and the device may be a touchscreen or trackpad. */
  interface Touch {
    readonly clientX: number
    readonly clientY: number
    readonly force: number
    readonly identifier: number
    readonly pageX: number
    readonly pageY: number
    readonly radiusX: number
    readonly radiusY: number
    readonly rotationAngle: number
    readonly screenX: number
    readonly screenY: number
    readonly target: EventTarget
    FLUENT_TIMESTAMP?: number
  }
}

export {}
