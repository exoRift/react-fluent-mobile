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
  FluentSelectionMixin, TouchHandler
} from '../../'

import deviceToolbar from '../assets/device_toolbar.webp'

enum SelectionStep {
  SELECT,
  MOVE_END,
  MOVE_START,
  COPY,
  DISMISS
}

function stepReducer (state: SelectionStep): SelectionStep {
  if (document.getElementById('fluentselectionmanipulator')) {
    const list = document.getElementById('instructions')

    list?.children?.item(state)?.setAttribute('data-active', 'false')
    list?.children?.item(state + 1)?.setAttribute('data-active', 'true')
  }

  return state + 1
}

function displayCopied (): void {
  const display = document.getElementById('copied')

  if (display) display.textContent = window.getSelection()?.toString() ?? ''
}

export const Selection: StoryFn = () => {
  const mixinRef = useRef<FluentSelectionMixin>(null)
  const [step, advanceStep] = useReducer(stepReducer, 0)

  useEffect(() => {
    const mixin = mixinRef.current as FluentSelectionMixin

    function selectStep (): void {
      if (!window.getSelection()?.isCollapsed) {
        document.removeEventListener('selectionchange', selectStep)

        advanceStep()
      }
    }

    function moveEndStep (): void {
      advanceStep()
    }

    function moveStartStep (e: TouchEvent): void {
      if (e.targetTouches.length >= 2) {
        mixin.manipulator.current?.removeEventListener('touchmove', moveStartStep)

        advanceStep()
      }
    }

    function copyStep (): void {
      advanceStep()
    }

    function dismissStep (): void {
      setTimeout(() => {
        if (!mixin.state.selecting) {
          mixin.manipulator.current?.removeEventListener('touchend', dismissStep)

          advanceStep()
        }
      }, 50) // Wait for DOM to rerender
    }

    function controlSelection (e: TouchEvent): void {
      const instructionRect = document.getElementById('instructions')?.getBoundingClientRect()
      if (!instructionRect) return

      const touches = TouchHandler.formatTouches(e.targetTouches)

      const comparator = new TouchEvent('touchmove', {
        targetTouches: touches.filter((t) => t).map((touch, i) => {
          const originX = mixin.originRange[i ? 'startCoords' : 'endCoords'].x
          const deltaX = originX + (touches[i].clientX - (TouchHandler.originTouches[i]?.clientX ?? 0))

          return new Touch({
            identifier: touch.identifier,
            clientX: deltaX >= instructionRect.x ? (TouchHandler.originTouches[i]?.clientX ?? 0) + (instructionRect.x - originX - 1) : touch.clientX,
            clientY: touch.clientY,
            target: touch.target
          })
        })
      })

      if (touches.some((t, i) => t.clientX !== comparator.targetTouches[i].clientX)) {
        e.preventDefault()
        e.stopPropagation()

        mixin.manipulateSelection(comparator)
      }
    }

    document.addEventListener('copy', displayCopied, { passive: true })

    switch (step) {
      case SelectionStep.SELECT:
        document.addEventListener('selectionchange', selectStep, { passive: true })

        break
      case SelectionStep.MOVE_END:
        mixin.manipulator.current?.addEventListener('touchmove', moveEndStep, {
          once: true,
          passive: true
        })

        mixin.manipulator.current?.addEventListener('touchmove', controlSelection, { capture: true }) // Prevent selection overflow into instructions

        break
      case SelectionStep.MOVE_START:
        mixin.manipulator.current?.addEventListener('touchmove', moveStartStep, { passive: true })

        break
      case SelectionStep.COPY:
        mixin.manipulator.current?.addEventListener('dblclick', copyStep, {
          once: true,
          passive: true
        })

        break
      case SelectionStep.DISMISS:
        mixin.manipulator.current?.addEventListener('touchend', dismissStep, { passive: true })

        break
      default: break
    }

    return () => {
      document.removeEventListener('copy', displayCopied)

      document.removeEventListener('selectionchange', selectStep)
    }
  }, [step])

  return (
    <div className='body'>
      <FluentSelectionMixin ref={mixinRef} />

      <div className='suggestion'>
        <img src={deviceToolbar} alt='device toolbar' />

        <h5>
          If you&apos;re on PC, try pressing <strong>Ctrl+Shift+I</strong> and clicking the <i>Device Toolbar</i> button.
        </h5>
      </div>

      <div className='demonstration'>
        <div className='prototype selection'>
          <h1>The web development process</h1>

          <p>{'"Insanity is doing the same thing over and over and expecting different results." \u2014 Albert Einstein '.repeat(6)}</p>
        </div>

        <div id='instructions'>
          <div className='instruction' data-active={String(!step)}>
            <h3>Try selecting some text!</h3>
            <p>
              Hold down on the header or, if you&apos;re on Android, tap some of the body text
            </p>

            <div className='gesture hold' />
          </div>

          <div className='instruction'>
            <h3>Move the end of your selection</h3>
            <p>
              Tap and drag on the manipulation pad to move the end of your selection
            </p>

            <div className='gesture move sideways' />
          </div>

          <div className='instruction'>
            <h3>Move the beginning of your selection</h3>
            <p>
              Drag with two fingers at the same time to move both sides of your selection
            </p>

            <div className='gesture-series'>
              <div className='gesture move sideways start' />
              <div className='gesture move sideways' />
            </div>
          </div>

          <div className='instruction'>
            <h3>Copy the selected text</h3>
            <p>
              Double-tap on the selection manipulation pad to copy your selected text
            </p>

            <div className='gesture double tap' />
          </div>

          <div className='instruction'>
            <h3>Close the selection pad</h3>
            <p>
              Swipe down on the selection manipulation pad to dismiss your selection
            </p>

            <div className='gesture swipe down' />
          </div>

          <div className='instruction'>
            <div className='check'>&#10003;</div>
            <h3>Good job!</h3>
            <p>
              You have mastered using the selection manipulation pad
            </p>

            <h4>Now try the</h4>

            <div className='storylink' onClick={linkTo('tutorials', 'context')}>New Context Menu</div>
          </div>

          <div className='progress-bar'>
            <div className='progress' style={{ height: (step * 100 / 5).toString() + '%' }} />
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
