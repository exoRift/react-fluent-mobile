import {
  React,
  useEffect,
  useState,
  useRef
} from 'react'
import {
  linkTo
} from '@storybook/addon-links'

import {
  FluentContextMixin
} from '../../'

import deviceToolbar from '../assets/device_toolbar.webp'

function advanceStep (step, setStep) {
  if (document.getElementById('fluentmenu')) {
    const list = document.getElementById('instructions')

    list.children.item(step).setAttribute('active', 'false')
    list.children.item(step + 1).setAttribute('active', 'true')

    setStep(step + 1)
  }
}

function displayCopied () {
  const display = document.getElementById('copied')

  display.textContent = window.getSelection().toString()
}

export const Context = () => {
  const menuRef = useRef(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    function launchStep (e) {
      if (menuRef.current.state.holdingTag) {
        document.removeEventListener('contextmenu', launchStep)

        advanceStep(step, setStep)
      }
    }

    function hoverStep () {
      if (menuRef.current.hoveringIndex) {
        document.removeEventListener('touchmove', hoverStep)

        advanceStep(step, setStep)
      }
    }

    function triggerStep (e) {
      document.removeEventListener('touchend', triggerStep)

      advanceStep(step, setStep)
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
          If you're on PC, try pressing <strong>Ctrl+Shift+I</strong> and clicking the <i>Device Toolbar</i> button.
        </h5>
      </div>

      <div className='demonstration'>
        <div className='prototype context'>
          <h3>Look at this cool photo I found</h3>

          <h4>I got it from <a href='https://picsum.photos'>Lorem Picsum</a></h4>

          <img
            className='demobanner'
            src={`https://picsum.photos/${parseInt(window.innerWidth / 2)}/${parseInt(window.innerHeight / 3)}`}
            alt='random portrait'
          />
        </div>

        <div id='instructions'>
          <div className='instruction' active={String(!step)}>
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
            <div className='progress' style={{ height: (step * 100 / 3) + '%' }} />
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
