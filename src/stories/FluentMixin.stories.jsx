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
    holdTime: {
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

    <span id='span2'>This is past the mixin</span>

    <a href='/'>This is clickable</a>
    <br/><br/><br/><br/><br/><br/>
    <input id='test'/>
  </div>
)
Default.args = {
  holdDelay: 100,
  holdTime: 500
}
