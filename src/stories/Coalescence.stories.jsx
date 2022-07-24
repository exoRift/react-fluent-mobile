import React from 'react'

import {
  Default as FluentContextMixin
} from './FluentContextMixin.stories.jsx'
import {
  Default as FluentSelectionMixin
} from './FluentSelectionMixin.stories.jsx'

export default {
  title: 'Coalescence',
  argTypes: {
    holdDelay: {
      control: {
        type: 'number'
      }
    },
    holdTime: {
      control: {
        type: 'number'
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
    debug: {
      control: {
        type: 'boolean'
      }
    }
  }
}

export const Default = (args) => (
  <div>
    <span id='span1'>This is some sample text!</span>
    <FluentContextMixin {...args}/>
    <FluentSelectionMixin {...args}/>

    <span id='span2'>This is past the mixin</span>

    <a href='/'>This is clickable</a>
    <br/><br/><br/><br/><br/><br/>
    <input id='test'/>
  </div>
)
