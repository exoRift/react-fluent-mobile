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
