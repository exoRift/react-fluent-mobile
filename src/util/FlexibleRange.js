/**
 * A range that automatically reverses of the end bound comes before the start bound or vice-versa
 */
class FlexibleRange extends Range {
  reversed = false

  constructor (original) {
    super()

    if (original) {
      this.setStart(original.startContainer, original.startOffset)
      this.setEnd(original.endContainer, original.endOffset)
    }
  }

  setStart (node, offset) {
    this._registeredStart = [node, offset]

    if (this.reversed) super.setEnd(node, offset)
    else super.setStart(node, offset)

    if (!this._registeredEnd) this._registeredEnd = [this.endContainer, this.endOffset]

    if (this.collapsed && this._registeredStart.some((v, i) => v !== this._registeredEnd[i])) {
      if (this.reversed) super.setEnd(...this._registeredEnd)
      else super.setStart(...this._registeredEnd)

      this.reversed = !this.reversed
    }

    const rects = this.getClientRects()
    this.startCoords = [
      (this.reversed ? rects[rects.length - 1]?.right : rects[0]?.left) ?? 0,
      (this.reversed ? rects[rects.length - 1]?.top : rects[0]?.top) ?? 0
    ]
    this.startCoords.height = this.reversed ? rects[rects.length - 1]?.height : rects[0]?.height
  }

  setEnd (node, offset) {
    this._registeredEnd = [node, offset]

    if (this.reversed) super.setStart(node, offset)
    else super.setEnd(node, offset)

    if (!this._registeredStart) this._registeredStart = [this.startContainer, this.startOffset]

    if (this.collapsed && this._registeredEnd.some((v, i) => v !== this._registeredStart[i])) {
      if (this.reversed) super.setStart(...this._registeredStart)
      else super.setEnd(...this._registeredStart)

      this.reversed = !this.reversed
    }

    const rects = this.getClientRects()
    this.endCoords = [
      (this.reversed ? rects[0]?.left : rects[rects.length - 1]?.right) ?? 0,
      (this.reversed ? rects[0]?.top : rects[rects.length - 1]?.top) ?? 0
    ]
    this.endCoords.height = this.reversed ? rects[0]?.height : rects[rects.length - 1]?.height
  }

  reverse () {
    const registeredStart = this._registeredStart
    this._registeredStart = this._registeredEnd
    this._registeredEnd = registeredStart

    const startCoords = this.startCoords
    this.startCoords = this.endCoords
    this.endCoords = startCoords

    this.reversed = !this.reversed
  }
}

export {
  FlexibleRange
}
