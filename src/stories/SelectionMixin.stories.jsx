import {
  React,
  useCallback,
  useRef,
  useEffect
} from 'react'

import {
  FluentSelectionMixin
} from '..'

import './styles/index.css'
import './styles/debug.css'

function positionDebugTouches (e) {
  const touches = []
  for (const touch of e.touches) touches[touch.identifier] = touch

  const touchPixels = document.getElementsByClassName('fluent debug touch')

  for (let p = 0; p < touchPixels.length; p++) {
    if (touches[p]) {
      touchPixels[p].style.left = touches[p].clientX + 'px'
      touchPixels[p].style.top = touches[p].clientY + 'px'
    }
  }
}

function positionDebugRange (mixin) {
  if (mixin?.originRange) {
    const rects = mixin.originRange.getClientRects()
    const rect = [
      rects[0]?.left + 6,
      rects[0]?.top,
      rects[rects.length - 1]?.right - 6,
      rects[rects.length - 1]?.top
    ]

    const rangeHandles = document.getElementsByClassName('fluent debug range')

    for (let r = 0; r < rangeHandles.length; r++) {
      rangeHandles[r].style.left = rect[r * 2] + 'px'
      rangeHandles[r].style.top = rect[(r * 2) + 1] + 'px'
    }
  }
}

function displayCopied () {
  const display = document.getElementById('copied')

  display.textContent = window.getSelection().toString()
}

export default {
  component: FluentSelectionMixin,
  argTypes: {
    STORYBOOK_BACKGROUND: {
      control: {
        type: 'color'
      }
    },
    collapseSwipeDistance: {
      control: {
        type: 'number'
      }
    },
    collapseSwipeDuration: {
      control: {
        type: 'number'
      }
    },
    nativeManipulationInactivityDuration: {
      control: {
        type: 'number'
      }
    },
    theme: {
      options: ['dark', 'light'],
      control: {
        type: 'radio'
      }
    },
    debug: {
      control: {
        type: 'boolean'
      }
    }
  }
}

export const Playground = (args) => {
  const mixin = useRef(null)

  const positionDebugRangeCallback = useCallback(() => positionDebugRange(mixin.current), [])

  useEffect(() => {
    document.addEventListener('copy', displayCopied)

    return () => {
      document.removeEventListener('copy', displayCopied)

      document.body.style.backgroundColor = ''
    }
  }, [])

  useEffect(() => {
    document.body.style.backgroundColor = args.STORYBOOK_BACKGROUND

    if (args.debug) {
      document.dispatchEvent(new TouchEvent('touchstart', {
        changedTouches: [new Touch({
          identifier: 0,
          target: document
        })]
      }))

      setTimeout(() => {
        const pad = document.getElementById('fluentselectionmanipulator')

        pad.addEventListener('touchstart', positionDebugTouches)
        pad.addEventListener('touchmove', positionDebugTouches)
      }) // Negligible delay to allow for DOM rerender

      document.addEventListener('touchend', positionDebugRangeCallback)

      return () => {
        const pad = document.getElementById('fluentselectionmanipulator')

        pad?.removeEventListener?.('touchstart', positionDebugTouches)
        pad?.removeEventListener?.('touchmove', positionDebugTouches)
        document.removeEventListener('touchend', positionDebugRangeCallback)
      }
    }
  }, [args.STORYBOOK_BACKGROUND, args.debug, positionDebugRangeCallback])

  return (
    <>
      {args.debug
        ? (
          <>
            <div className='fluent debug touch first'/>
            <div className='fluent debug touch second'/>

            <div className='fluent debug range first'/>
            <div className='fluent debug range second'/>
          </>
          )
        : null}

      <FluentSelectionMixin {...args} ref={mixin}/>

      <div>
        standalone text
        <p>p text. this denotes a paragraph which makes good selecting material</p>
        <input defaultValue='this is an input'/>
        <span>this is a span</span>
        <h2>header</h2>
      </div>

      <footer>
        <strong>Copied text: </strong>
        <span id='copied'/>
      </footer>

      {args.debug ? navigator.userAgent : null}
    </>
  )
}
Playground.args = {
  STORYBOOK_BACKGROUND: '#ffffff',
  collapseSwipeDistance: 100,
  collapseSwipeDuration: 300,
  nativeManipulationInactivityDuration: 500,
  theme: 'dark',
  debug: false
}
