import {
  React,
  useRef,
  useEffect
} from 'react'

import {
  FluentSelectionMixin
} from '../'

import './debug.css'

function positionDebugTouches (e) {
  const touches = []
  for (const touch of e.touches) touches[touch.identifier] = touch

  const touchPixels = document.getElementsByClassName('fluent debug touch')

  for (let p = 0; p < touchPixels.length; p++) {
    touchPixels[p].style.left = (touches[p]?.clientX || 0) + 'px'
    touchPixels[p].style.top = (touches[p]?.clientY || 0) + 'px'
  }
}

function positionDebugRange (ref, e) {
  const rects = ref.current.originRange.getClientRects()
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

export default {
  title: 'FluentSelectionMixin',
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

export const Default = (args) => {
  const ref = useRef(null)
  const boundPositionDebugRange = useRef(positionDebugRange.bind(this, ref))

  useEffect(() => {
    if (args.debug) {
      document.addEventListener('touchstart', positionDebugTouches)
      document.addEventListener('touchmove', positionDebugTouches)
      document.addEventListener('touchmove', boundPositionDebugRange.current)
    } else {
      document.removeEventListener('touchstart', positionDebugTouches)
      document.removeEventListener('touchmove', positionDebugTouches)
      document.removeEventListener('touchmove', boundPositionDebugRange.current)
    }

    if (args.theme === 'dark') document.body.style.backgroundColor = 'white'
    else document.body.style.backgroundColor = '#202124'
  }, [args.debug, args.theme])

  return (
    <div>
      <span id='span1'>This is some sample text!</span>
      <FluentSelectionMixin {...args} ref={ref}/>

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

      <span id='span2'>This is past the mixin</span>

      <a href='/'>This is clickable</a>
      <br/><br/><br/><br/><br/><br/>
      <input id='test'/>
      {navigator.userAgent}
      <h1>this is a header</h1>
    </div>
  )
}
Default.args = {
  collapseSwipeDistance: 100,
  collapseSwipeDuration: 300,
  theme: 'dark',
  debug: false
}
