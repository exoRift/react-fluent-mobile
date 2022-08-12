import React from 'react'

import {
  FluentContextMixin
} from '..'

import banner from '../../assets/banner.png'

import './styles/index.css'
import './styles/ContextMixin.css'

export default {
  component: FluentContextMixin,
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

export const Playground = (args) => (
  <div>
    <FluentContextMixin {...args}/>

    <span>This is some sample text</span>

    <a href='/'>This is clickable</a>

    <img className='banner' alt='banner' src={banner}/>
  </div>
)
Playground.args = {
  holdDelay: 100,
  holdTime: 500
}
