import React, {
  useEffect,
  useRef,
  useReducer
} from 'react'
import { type StoryFn } from '@storybook/react'
import {
  linkTo
} from '@storybook/addon-links'

import {
  FluentContextMixin
} from '../../'

import deviceToolbar from '../assets/device_toolbar.webp'

enum ContextStep {
  LAUNCH,
  HOVER,
  TRIGGER
}

function stepReducer (state: ContextStep): ContextStep {
  if (document.getElementById('fluentmenu')) {
    const list = document.getElementById('instructions')

    list?.children?.item(state)?.setAttribute('data-active', 'false')
    list?.children?.item(state + 1)?.setAttribute('data-active', 'true')
  }

  return state + 1
}

function displayCopied (): void {
  const display = document.getElementById('copied') as HTMLDivElement

  display.textContent = window.getSelection()?.toString() ?? null
}

export const Context: StoryFn = () => {
  const menuRef = useRef<FluentContextMixin>(null)
  const [step, advanceStep] = useReducer(stepReducer, 0)

  useEffect(() => {
    const menu = menuRef.current!

    function launchStep (): void {
      if (menu.state.holdingTag) {
        document.removeEventListener('contextmenu', launchStep)

        advanceStep()
      }
    }

    function hoverStep (): void {
      if (menu.hoveringIndex) {
        document.removeEventListener('touchmove', hoverStep)

        advanceStep()
      }
    }

    function triggerStep (): void {
      document.removeEventListener('touchend', triggerStep)

      advanceStep()
    }

    document.addEventListener('copy', displayCopied)

    switch (step) {
      case 0:
        document.addEventListener('contextmenu', launchStep)

        break
      case 1:
        document.addEventListener('touchmove', hoverStep)

        break
      case 2:
        document.addEventListener('touchend', triggerStep)

        break
      default: break
    }

    return () => {
      document.removeEventListener('copy', displayCopied)

      document.removeEventListener('contextmenu', launchStep)
    }
  }, [step])

  return (
    <div className='body'>
      <FluentContextMixin ref={menuRef} theme='light' />

      <div className='suggestion'>
        <img src={deviceToolbar} alt='device toolbar' />

        <h5>
          If you&apos;re on PC, try pressing <strong>Ctrl+Shift+I</strong> and clicking the <i>Device Toolbar</i> button.
        </h5>
      </div>

      <div className='demonstration'>
        <div className='prototype context'>
          <h3>Look at this cool photo I found</h3>

          <h4>I got it from <a href='https://picsum.photos'>Lorem Picsum</a></h4>

          <img
            className='demobanner'
            src={`https://picsum.photos/${Math.floor(window.innerWidth / 2)}/${Math.floor(window.innerHeight / 3)}`}
            alt='random portrait'
          />
        </div>

        <div id='instructions'>
          <div className='instruction' data-active={String(!step)}>
            <h3>Try opening a context menu!</h3>
              <p>
                Hold down on an image or link
              </p>

            <div className='gesture hold' />
          </div>

          <div className='instruction'>
            <h3>Hover over an option</h3>
            <p>
              Drag your finger to the elevation of an option to hover it
            </p>

            <div className='gesture move vertically' />
          </div>

          <div className='instruction'>
            <h3>Trigger the hovered option</h3>
            <p>
              Release your finger to trigger the action of the currently hovered option
            </p>

            <div className='gesture lift' />
          </div>

          <div className='instruction'>
            <div className='check'>&#10003;</div>
            <h3>Good job!</h3>
            <p>
              You have mastered using the new context menu
            </p>

            <h4>Now try</h4>

            <div className='storylink' onClick={linkTo('tutorials', 'media')}>Media Controls</div>
          </div>

          <div className='progress-bar'>
            <div className='progress' style={{ height: (step * 100 / 3).toString() + '%' }} />
          </div>
        </div>
      </div>

      <footer>
        <strong>Copied text: </strong>
        <span id='copied' />
      </footer>
    </div>
  )
}
