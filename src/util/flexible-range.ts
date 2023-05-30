/** Coordinates of a selection position on the viewport */
export interface Coordinate {
  x: number
  y: number
  height: number
}

/**
 * A range that automatically reverses of the end bound comes before the start bound or vice-versa
 */
export class FlexibleRange extends Range {
  /** The start that was registered via the method */
  _registeredStart: [Node?, number?] = []
  /** The end that was registered via the method */
  _registeredEnd: [Node?, number?] = []

  /** The viewport coordinates of the start of the selection */
  startCoords!: Coordinate
  /** The viewport coordinates of the end of the selection */
  endCoords!: Coordinate

  /** Is this range in a reversed state? */
  reversed = false

  /** Construct a FlexibleRange */
  constructor (original?: Range) {
    super()

    if (original) {
      this.setStart(original.startContainer, original.startOffset)
      this.setEnd(original.endContainer, original.endOffset)
    } else {
      this.startCoords = this.endCoords = {
        x: 0,
        y: 0,
        height: 0
      }
    }
  }

  setStart (node?: Node, offset: number = 0): void {
    if (!node) return

    this._registeredStart = [node, offset]

    if (this.reversed) super.setEnd(node, offset)
    else super.setStart(node, offset)

    if (!this._registeredEnd) this._registeredEnd = [this.endContainer, this.endOffset]

    if (this.collapsed && this._registeredStart.some((v, i) => v !== this._registeredEnd[i])) {
      if (this.reversed) super.setEnd(this.endContainer, this.endOffset)
      else super.setStart(this.endContainer, this.endOffset)

      this.reversed = !this.reversed
    }

    const rects = this.getClientRects()
    this.startCoords = {
      x: (this.reversed ? rects[rects.length - 1]?.right : rects[0]?.left) ?? 0,
      y: (this.reversed ? rects[rects.length - 1]?.top : rects[0]?.top) ?? 0,
      height: this.reversed ? rects[rects.length - 1]?.height : rects[0]?.height
    }
  }

  setEnd (node?: Node, offset: number = 0): void {
    if (!node) return

    this._registeredEnd = [node, offset]

    if (this.reversed) super.setStart(node, offset)
    else super.setEnd(node, offset)

    if (!this._registeredStart) this._registeredStart = [this.startContainer, this.startOffset]

    if (this.collapsed && this._registeredEnd.some((v, i) => v !== this._registeredStart[i])) {
      if (this.reversed) super.setStart(this.startContainer, this.startOffset)
      else super.setEnd(this.startContainer, this.startOffset)

      this.reversed = !this.reversed
    }

    const rects = this.getClientRects()
    this.endCoords = {
      x: (this.reversed ? rects[0]?.left : rects[rects.length - 1]?.right) ?? 0,
      y: (this.reversed ? rects[0]?.top : rects[rects.length - 1]?.top) ?? 0,
      height: this.reversed ? rects[0]?.height : rects[rects.length - 1]?.height
    }
  }

  reverse (): void {
    const registeredStart = this._registeredStart
    this._registeredStart = this._registeredEnd
    this._registeredEnd = registeredStart

    const startCoords = this.startCoords
    this.startCoords = this.endCoords
    this.endCoords = startCoords

    this.reversed = !this.reversed
  }
}