import React from 'react'

import {
  FluentSelectionMixin
} from '../'

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
    }
  }
}

export const Default = (args) => (
  <div>
    <span id='span1'>This is some sample text!</span>
    <FluentSelectionMixin {...args}/>

    <span id='span2'>This is past the mixin</span>

    <a href='/'>This is clickable</a>
    <br/><br/><br/><br/><br/><br/>
    <input id='test'/>
  </div>
)
Default.args = {
  collapseSwipeDistance: 100,
  collapseSwipeDuration: 300
}
