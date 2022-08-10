import {
  React,
  useEffect,
  useState
} from 'react'
import {
  linkTo
} from '@storybook/addon-links'

import {
  FluentSelectionMixin
} from '..'

import deviceToolbar from './assets/device_toolbar.webp'

import './styles/index.css'
import './styles/SelectionMixin.css'

function advanceStep (step, setStep) {
  if (document.getElementById('fluentselectionmanipulator')) {
    const list = document.getElementById('instructionlist')

    list.children.item(step).setAttribute('active', 'false')
    list.children.item(step + 1).setAttribute('active', 'true')

    setStep(step + 1)
  }
}

function displayCopied () {
  const display = document.getElementById('copied')

  display.textContent = window.getSelection().toString()
}

export default {
  title: 'Tutorials'
}

export const Selection = () => {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const pad = document.getElementById('fluentselectionmanipulator')

    function selectStep () {
      if (!window.getSelection().isCollapsed) {
        document.removeEventListener('selectionchange', selectStep)

        advanceStep(step, setStep)
      }
    }

    function moveEndStep () {
      advanceStep(step, setStep)
    }

    function moveStartStep (e) {
      if (e.targetTouches.length >= 2) {
        pad.removeEventListener('touchmove', moveStartStep)

        advanceStep(step, setStep)
      }
    }

    function copyStep () {
      advanceStep(step, setStep)
    }

    function dismissStep () {
      setTimeout(() => {
        if (pad.classList.contains('inactive')) {
          pad.removeEventListener('touchend', dismissStep)

          advanceStep(step, setStep)
        }
      }, 50) // Negligible delay to allow pad's computation
    }

    document.addEventListener('copy', displayCopied)

    switch (step) {
      case 0:
        document.addEventListener('selectionchange', selectStep)

        break
      case 1:
        pad.addEventListener('touchmove', moveEndStep, {
          once: true
        })

        break
      case 2:
        pad.addEventListener('touchmove', moveStartStep)

        break
      case 3:
        pad.addEventListener('dblclick', copyStep, {
          once: true
        })

        break
      case 4:
        pad.addEventListener('touchend', dismissStep)

        break
      default: break
    }

    return () => {
      const pad = document.getElementById('fluentselectionmanipulator')

      document.removeEventListener('copy', displayCopied)

      document.removeEventListener('selectionchange', selectStep)
      pad?.removeEventListener?.('touchmove', moveEndStep)
      pad?.removeEventListener?.('touchmove', moveStartStep)
      pad?.removeEventListener?.('dblclick', copyStep)
      pad?.removeEventListener?.('touchend', dismissStep)
    }
  }, [step])

  return (
    <div className='body'>
      <FluentSelectionMixin/>
      <div className='suggestion'>
        <img src={deviceToolbar} alt='device toolbar'/>

        <h5>
          If you're on PC, try pressing <strong>Ctrl+Shift+I</strong> and clicking the <i>Device Toolbar</i> button.
        </h5>
      </div>

      <div id='demonstration'>
        <div id='text'>
          <h1>The web development process</h1>

          <p>{'"Insanity is doing the same thing over and over and expecting different results." \u2014 Albert Einstein '.repeat(8)}</p>
        </div>

        <div id='instructions'>
          <div id='instructionlist'>
            <div className='instruction' active={String(!step)}>
              <h3>Try selecting some text!</h3>
              <p>
                Hold down on the header or, if you're on Android, tap some of the body text
              </p>

              <div className='gesture hold'/>
            </div>

            <div className='instruction'>
              <h3>Move the end of your selection</h3>
              <p>
                Tap and drag on the manipulation pad to move the end of your selection
              </p>

              <div className='gesture move'/>
            </div>

            <div className='instruction'>
              <h3>Move the beginning of your selection</h3>
              <p>
                Drag with two fingers at the same time to move both sides of your selection
              </p>

              <div className='gesture-series'>
                <div className='gesture move start'/>
                <div className='gesture move'/>
              </div>
            </div>

            <div className='instruction'>
              <h3>Copy the selected text</h3>
              <p>
                Double-tap on the selection manipulation pad to copy your selected text
              </p>

              <div className='gesture double tap'/>
            </div>

            <div className='instruction'>
              <h3>Close the selection pad</h3>
              <p>
                Swipe down on the selection manipulation pad to dismiss your selection
              </p>

              <div className='gesture swipe down'/>
            </div>

            <div className='instruction'>
              <div className='check'>&#10003;</div>
              <h3>Good job!</h3>
              <p>
                You have mastered using the selection manipulation pad
              </p>

              <h4>Now try the <span className='storylink' onClick={linkTo('tutorials', 'context')}>New Context Menu</span></h4>
            </div>
          </div>

          <div className='progress-bar'>
            <div className='progress' style={{ height: (step * 100 / 5) + '%' }}/>
          </div>
        </div>
      </div>

      <footer>
        <strong>Copied text: </strong>
        <span id='copied'/>
      </footer>
    </div>
  )
}

export const Context = () => {
  return (
    <></>
  )
}
