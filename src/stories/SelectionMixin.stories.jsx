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
import './styles/SelectionMixin.css'
import './styles/debug.css'

function positionDebugTouches (e) {
  const touches = []
  for (const touch of e.touches) touches[touch.identifier] = touch

  const touchPixels = document.getElementsByClassName('fluent debug touch')

  for (let p = 0; p < touchPixels.length; p++) {
    touchPixels[p].style.left = (touches[p]?.clientX || 0) + 'px'
    touchPixels[p].style.top = (touches[p]?.clientY || 0) + 'px'
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

    return () => document.removeEventListener('copy', displayCopied)
  }, [])

  useEffect(() => {
    const pad = document.getElementById('fluentselectionmanipulator')

    if (args.theme === 'dark') document.body.style.backgroundColor = 'white'
    else document.body.style.backgroundColor = '#202124'

    if (args.debug) {
      pad.addEventListener('touchstart', positionDebugTouches)
      pad.addEventListener('touchmove', positionDebugTouches)
      document.addEventListener('touchend', positionDebugRangeCallback)

      return () => {
        pad.removeEventListener('touchstart', positionDebugTouches)
        pad.removeEventListener('touchmove', positionDebugTouches)
        document.removeEventListener('touchend', positionDebugRangeCallback)
      }
    }
  }, [args.debug, args.theme, positionDebugRangeCallback])

  return (
    <div className={`body ${args.theme}`}>
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

      standalone text
      <p>p text</p>
      <input/>
      <span>this is a span</span>
      <h2>header</h2>

      <footer>
        <strong>Copied text: </strong>
        <span id='copied'/>
      </footer>

      {args.debug ? navigator.userAgent : null}
    </div>
  )
}
Playground.args = {
  collapseSwipeDistance: 100,
  collapseSwipeDuration: 300,
  theme: 'dark',
  debug: false
}
