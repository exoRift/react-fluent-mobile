import React from 'react'

import {
  FluentContextMixin,
  FluentSelectionMixin
} from '../'

import banner from '../../assets/banner.png'

import './styles/index.css'
import './styles/ContextMixin.css'
import './styles/SelectionMixin.css'

export default {
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
    theme: {
      control: {
        options: ['dark', 'light'],
        type: 'radio'
      }
    }
  }
}

export const Playground = (args) => (
  <div>
    <FluentContextMixin {...args}/>
    <FluentSelectionMixin {...args}/>

    <span>This is some sample text</span>

    <a href='/'>This is clickable</a>

    <img className='banner' alt='banner' src={banner}/>
  </div>
)
