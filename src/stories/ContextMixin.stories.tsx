import React, {
  useEffect
} from 'react'
import { type StoryFn } from '@storybook/react'

import {
  FluentContextMixin
} from '..'

import icon from '../../assets/icon.png'
import banner from '../../assets/banner.png'

import './styles/index.css'
import './styles/ContextMixin.css'

export default {
  component: FluentContextMixin,
  argTypes: {
    STORYBOOK_BACKGROUND: {
      control: {
        type: 'color'
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

interface PlaygroundArgs {
  STORYBOOK_BACKGROUND: string
  theme: 'light' | 'dark'
  debug: boolean
}

export const Playground: StoryFn<PlaygroundArgs> = (args) => {
  useEffect(() => {
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  useEffect(() => {
    document.body.style.backgroundColor = args.STORYBOOK_BACKGROUND
  }, [args.STORYBOOK_BACKGROUND])

  return (
    <div data-debug={args.debug}>
      <FluentContextMixin {...args} />

      <div className='story anchors'>
        <a href={window.location.href}>This is a leftward anchor</a>

        <a href={window.location.href}>This is a rightward anchor</a>
      </div>

      <span>This is some sample text</span>

      <img className='story banner' alt='banner' src={banner} />

      <a href={window.location.href}>
        <img className='story icon' alt='icon' src={icon} />
        Testing images in an anchor tag
      </a>
    </div>
  )
}
Playground.args = {
  STORYBOOK_BACKGROUND: '#ffffff',
  theme: 'dark',
  debug: false
}
