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
    },
    theme: {
      options: ['dark', 'light'],
      control: {
        type: 'radio'
      }
    }
  }
}

export const Playground = (args) => (
  <div>
    <FluentContextMixin {...args}/>

    <div className='anchors'>
      <a href={window.location.href}>This is a leftward anchor</a>

      <a href={window.location.href}>This is a rightward anchor</a>
    </div>

    <span>This is some sample text</span>

    <img className='banner' alt='banner' src={banner}/>
  </div>
)
Playground.args = {
  holdDelay: 100,
  holdTime: 500,
  theme: 'dark'
}
