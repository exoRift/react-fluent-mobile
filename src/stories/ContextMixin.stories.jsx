import {
  React,
  useEffect
} from 'react'

import {
  FluentContextMixin
} from '..'

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
    }
  }
}

export const Playground = (args) => {
  useEffect(() => {
    return () => {
      document.body.style.backgroundColor = ''
    }
  })

  useEffect(() => {
    document.body.style.backgroundColor = args.STORYBOOK_BACKGROUND
  }, [args.STORYBOOK_BACKGROUND])

  return (
    <>
      <FluentContextMixin {...args}/>

      <div className='anchors'>
        <a href={window.location.href}>This is a leftward anchor</a>

        <a href={window.location.href}>This is a rightward anchor</a>
      </div>

      <span>This is some sample text</span>

      <img className='banner' alt='banner' src={banner}/>
    </>
  )
}
Playground.args = {
  STORYBOOK_BACKGROUND: '#ffffff',
  theme: 'dark'
}
