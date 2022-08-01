import {
  React,
  useCallback,
  useRef,
  useEffect,
  useState
} from 'react'

import {
  FluentSelectionMixin
} from '../'

import deviceToolbar from './assets/device_toolbar.webp'

import './styles/index.css'
import './styles/FluentSelectionMixin.css'
import './styles/debug.css'

function positionDebugTouches (e) {
  const touches = []
  for (const touch of e.touches) touches[touch.identifier] = touch

  const touchPixels = document.getElementsByClassName('fluent debug touch')

  for (let p = 0; p < touchPixels.length; p++) {
    touchPixels[p].style.left = (touches[p]?.clientX || 0) + 'px'
    touchPixels[p].style.top = (touches[p]?.clientY || 0) + 'px'
  }
}

function positionDebugRange (mixin) {
  if (mixin?.originRange) {
    const rects = mixin.originRange.getClientRects()
    const rect = [
      rects[0]?.left + 6,
      rects[0]?.top,
      rects[rects.length - 1]?.right - 6,
      rects[rects.length - 1]?.top
    ]

    const rangeHandles = document.getElementsByClassName('fluent debug range')

    for (let r = 0; r < rangeHandles.length; r++) {
      rangeHandles[r].style.left = rect[r * 2] + 'px'
      rangeHandles[r].style.top = rect[(r * 2) + 1] + 'px'
    }
  }
}

function advanceStep (step, setStep) {
  const list = document.getElementById('instructionlist')

  list.children.item(step).setAttribute('active', 'false')
  list.children.item(step + 1).setAttribute('active', 'true')

  setStep(step + 1)
}

function displayCopied () {
  const display = document.getElementById('copied')

  display.textContent = window.getSelection().toString()
}

export default {
  title: 'FluentSelectionMixin',
  component: FluentSelectionMixin,
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
    },
    debug: {
      control: {
        type: 'boolean'
      }
    }
  }
}

export const Tutorial = (args) => {
  const mixin = useRef(null)
  const [step, setStep] = useState(0)

  const positionDebugRangeCallback = useCallback(() => positionDebugRange(mixin.current), [])

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
      }) // Negligible delay to allow pad's computation
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
      document.removeEventListener('copy', displayCopied)

      document.removeEventListener('selectionchange', selectStep)
      pad.removeEventListener('touchmove', moveEndStep)
      pad.removeEventListener('touchmove', moveStartStep)
      pad.removeEventListener('dblclick', copyStep)
      pad.removeEventListener('touchend', dismissStep)
    }
  }, [step])

  useEffect(() => {
    const pad = document.getElementById('fluentselectionmanipulator')

    if (args.theme === 'dark') document.body.style.backgroundColor = 'white'
    else document.body.style.backgroundColor = '#202124'

    if (args.debug) {
      pad.addEventListener('touchstart', positionDebugTouches)
      pad.addEventListener('touchmove', positionDebugTouches)
      document.addEventListener('touchend', positionDebugRangeCallback)

      return () => {
        pad.removeEventListener('touchstart', positionDebugTouches)
        pad.removeEventListener('touchmove', positionDebugTouches)
        document.removeEventListener('touchend', positionDebugRangeCallback)
      }
    }
  }, [args.debug, args.theme, positionDebugRangeCallback])

  return (
    <div className={`body ${args.theme}`}>
      {args.debug
        ? (
          <>
            <div className='fluent debug touch first'/>
            <div className='fluent debug touch second'/>

            <div className='fluent debug range first'/>
            <div className='fluent debug range second'/>
          </>
          )
        : null}

      <FluentSelectionMixin {...args} ref={mixin}/>

      <div className='suggestion'>
        <img src={deviceToolbar} alt='device toolbar'/>

        <h5>
          If you're on PC, try pressing <strong>Ctrl+Shift+I</strong> and clicking the <i>Device Toolbar</i> button.
        </h5>
      </div>

      <div id='demonstration'>
        <div id='text'>
          <h1>Tales of development</h1>

          <p>Here I am, a mere fullstack developer working on a passion project when alas, a problem presents itself to me.</p>

          <p>
            I perilously work day and night trying to identify the source of my problems and rectify it, writing function after function,
            rewriting method after method.
          </p>

          <p>
            I eventually grow tired of rewrites and refactoring.
            And after the fourth day and sixth time of trying to rewrite the system to flow a different way,
          </p>

          <p>
            I realize I was reading the&nbsp;
            {/* eslint-disable-next-line */}
            <a href='https://github.com/exoRift/react-fluent-mobile/commit/8930ed1e89b24a6911ad217cbcf5fd1b5fce2518#diff-b651424a9c7cd3dd5db8531ce6e2a403e022951c4248d80c33019a22b45b8c70L124'>
              incorrect property
            </a>
            &nbsp;of the selection's end's Y coordinate
          </p>
        </div>

        <div id='instructions'>
          <div id='instructionlist'>
            <div className='instruction' active={String(!step)}>
              <h3>Try selecting some text!</h3>
              <p>
                Hold down on the header or, if you're on Android, tap some of the body text
              </p>
            </div>

            <div className='instruction'>
              <h3>Move the end of your selection</h3>
              <p>
                Tap and drag on the manipulation pad to move the end of your selection
              </p>
            </div>

            <div className='instruction'>
              <h3>Move the beginning of your selection</h3>
              <p>
                Drag with two fingers at the same time to move both sides of your selection
              </p>
            </div>

            <div className='instruction'>
              <h3>Copy the selected text</h3>
              <p>
                Double-tap on the selection manipulation pad to copy your selected text
              </p>
            </div>

            <div className='instruction'>
              <h3>Close the selection pad</h3>
              <p>
                Swipe down on the selection manipulation pad to dismiss your selection
              </p>
            </div>

            <div className='instruction'>
              <div className='check'>&#10003;</div>
              <h3>Good job!</h3>
              <p>
                You have mastered using the selection manipulation pad
              </p>
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

      {args.debug ? navigator.userAgent : null}
    </div>
  )
}
Tutorial.args = {
  collapseSwipeDistance: 100,
  collapseSwipeDuration: 300,
  theme: 'dark',
  debug: false
}

export const Playground = (args) => {
  const mixin = useRef(null)

  const positionDebugRangeCallback = useCallback(() => positionDebugRange(mixin.current), [])

  useEffect(() => {
    const pad = document.getElementById('fluentselectionmanipulator')

    if (args.theme === 'dark') document.body.style.backgroundColor = 'white'
    else document.body.style.backgroundColor = '#202124'

    if (args.debug) {
      pad.addEventListener('touchstart', positionDebugTouches)
      pad.addEventListener('touchmove', positionDebugTouches)
      document.addEventListener('touchend', positionDebugRangeCallback)

      return () => {
        pad.removeEventListener('touchstart', positionDebugTouches)
        pad.removeEventListener('touchmove', positionDebugTouches)
        document.removeEventListener('touchend', positionDebugRangeCallback)
      }
    }
  }, [args.debug, args.theme, positionDebugRangeCallback])

  return (
    <div className={`body ${args.theme}`}>
      {args.debug
        ? (
          <>
            <div className='fluent debug touch first'/>
            <div className='fluent debug touch second'/>

            <div className='fluent debug range first'/>
            <div className='fluent debug range second'/>
          </>
          )
        : null}

      <FluentSelectionMixin {...args} ref={mixin}/>

      standalone text
      <p>p text</p>
      <input/>
      <span>this is a span</span>
      <h2>header</h2>
      {args.debug ? navigator.userAgent : null}
    </div>
  )
}
Playground.args = {
  collapseSwipeDistance: 100,
  collapseSwipeDuration: 300,
  theme: 'dark',
  debug: false
}
