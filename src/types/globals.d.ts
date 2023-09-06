declare global {
  interface Window {
    FLUENT_IS_IOS: boolean
  }

  interface CaretPosition {
    offsetNode: Node
    offset: number
    getClientRect: () => ClientRect
  }

  interface Document {
    caretPositionFromPoint: (x: number, y: number) => CaretPosition
  }

  interface Touch {
    FLUENT_TIMESTAMP?: number
  }

  interface TouchList {
    [Symbol.iterator](): Iterator<Touch>
  }

  module React {
    interface Touch {
      FLUENT_TIMESTAMP?: number
    }

    interface TouchList {
      [Symbol.iterator](): Iterator<Touch>
    }
  }

  module '*.webp'
  module '*.png'
}

export {}
