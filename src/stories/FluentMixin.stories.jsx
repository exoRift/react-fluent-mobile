import React from 'react'

import FluentMixin from '../components/Mixin.jsx'

export default {
  title: 'FluentMixin',
  component: FluentMixin,
  argTypes: {
    holdDelay: {
      control: {
        type: 'number'
      }
    },
    selectHoldTime: {
      control: {
        type: 'number'
      }
    },
    menuHoldTime: {
      control: {
        type: 'number'
      }
    }
  }
}

export const Default = (args) => (
  <div>
    <span id='span1'>This is some sample text!</span>
    <FluentMixin {...args}/>

    <span id='span2'>This is outside of the container</span>
  </div>
)
Default.args = {
  holdDelay: 100,
  selectHoldTime: 500,
  menuHoldTime: 1000
}
