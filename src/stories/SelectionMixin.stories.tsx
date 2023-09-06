import React, {
  useEffect,
  useRef
} from 'react'
import { type StoryFn } from '@storybook/react'

import {
  type FlexibleRange,
  FluentSelectionMixin
} from '../'

import './styles/index.css'
import './styles/debug.css'

function positionDebugTouches (e: TouchEvent): void {
  const touches = []
  for (const touch of e.touches) touches[touch.identifier] = touch

  const touchPixels = document.getElementsByClassName('fluent debug touch') as HTMLCollectionOf<HTMLDivElement>

  for (let p = 0; p < touchPixels.length; ++p) {
    if (touches[p]) {
      touchPixels[p].style.left = touches[p].clientX.toString() + 'px'
      touchPixels[p].style.top = touches[p].clientY.toString() + 'px'
    }
  }
}

function positionDebugRange (originRange: FlexibleRange): void {
  const rects = originRange.getClientRects()
  const rect = [
    rects[0]?.left + 6,
    rects[0]?.top,
    rects[rects.length - 1]?.right - 6,
    rects[rects.length - 1]?.top
  ]

  const rangeHandles = document.getElementsByClassName('fluent debug range') as HTMLCollectionOf<HTMLDivElement>

  for (let r = 0; r < rangeHandles.length; ++r) {
    rangeHandles[r].style.left = rect[r * 2].toString() + 'px'
    rangeHandles[r].style.top = rect[(r * 2) + 1].toString() + 'px'
  }
}

function displayCopied (): void {
  const display = document.getElementById('copied')

  if (!display) return

  display.textContent = window.getSelection()?.toString() ?? null
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

interface PlaygroundArgs {
  STORYBOOK_BACKGROUND: string
  collapseSwipeDistance: number
  collapseSwipeDuration: number
  nativeManipulationInactivityDuration: number
  theme: 'light' | 'dark'
  debug: boolean
}

export const Playground: StoryFn<PlaygroundArgs> = (args) => {
  const mixinRef = useRef<FluentSelectionMixin>(null)

  useEffect(() => {
    document.addEventListener('copy', displayCopied)

    return () => {
      document.removeEventListener('copy', displayCopied)

      document.body.style.backgroundColor = '' // Reset background from arg
    }
  }, [])

  useEffect(() => {
    document.body.style.backgroundColor = args.STORYBOOK_BACKGROUND

    if (args.debug) {
      const mixin = mixinRef.current as FluentSelectionMixin

      const positionDebugRangeCallback = (): void => positionDebugRange(mixin.originRange)

      document.dispatchEvent(new TouchEvent('touchstart', {
        changedTouches: [new Touch({
          identifier: 0,
          target: document
        })]
      }))

      setTimeout(() => {
        mixin.manipulator.current?.addEventListener('touchstart', positionDebugTouches)
        mixin.manipulator.current?.addEventListener('touchmove', positionDebugTouches)
      }) // Wait for DOM to rerender

      document.addEventListener('touchend', positionDebugRangeCallback)

      return () => {
        mixin.manipulator.current?.removeEventListener?.('touchstart', positionDebugTouches)
        mixin.manipulator.current?.removeEventListener?.('touchmove', positionDebugTouches)
        document.removeEventListener('touchend', positionDebugRangeCallback)
      }
    }
  }, [args.STORYBOOK_BACKGROUND, args.debug])

  return (
    <>
      <FluentSelectionMixin {...args} ref={mixinRef} />

      {args.debug
        ? (
          <>
            <div className='fluent debug touch first' />
            <div className='fluent debug touch second' />

            <div className='fluent debug range first' />
            <div className='fluent debug range second' />
          </>
          )
        : null}

      <div>
        standalone text
        <p>p text. this denotes a paragraph which makes good selecting material</p>
        <input defaultValue='this is an input' />
        <span>this is a span</span>
        <h2>header</h2>
      </div>

      <footer>
        <strong>Copied text: </strong>
        <span id='copied' />
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
