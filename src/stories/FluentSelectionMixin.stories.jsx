import React, { useEffect } from 'react'

import {
  FluentSelectionMixin
} from '../'

import './debug.css'

function positionDebug (e) {
  const first = document.getElementById('fluentdebugfirst')
  const second = document.getElementById('fluentdebugsecond')

  first.style.left = e.touches[0].clientX + 'px'
  first.style.top = e.touches[0].clientY + 'px'
  second.style.left = (e.touches[1]?.clientX || 0) + 'px'
  second.style.top = (e.touches[1]?.clientY || 0) + 'px'
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
    debug: {
      control: {
        type: 'boolean'
      }
    }
  }
}

export const Default = (args) => {
  useEffect(() => {
    if (args.debug) {
      document.addEventListener('touchstart', positionDebug)
      document.addEventListener('touchmove', positionDebug)
    } else {
      document.removeEventListener('touchstart', positionDebug)
      document.removeEventListener('touchmove', positionDebug)
    }
  })

  return (
    <div>
      <span id='span1'>This is some sample text!</span>
      <FluentSelectionMixin {...args}/>

      {args.debug
        ? (
          <>
            <div className='fluent debug' id='fluentdebugfirst'/>
            <div className='fluent debug' id='fluentdebugsecond'/>
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
  debug: false
}
