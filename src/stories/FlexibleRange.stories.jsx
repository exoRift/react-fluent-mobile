import {
  React,
  useRef,
  useEffect
} from 'react'

import {
  FlexibleRange
} from '../'

import './styles/index.css'

const demoString = 'A flexible range allows you to set bounds of a selection regardless of whether the end comes before the start'

export default {
  component: FlexibleRange,
  argTypes: {
    startOffset: {
      control: {
        type: 'range',
        min: 0,
        max: demoString.length
      }
    },
    endOffset: {
      control: {
        type: 'range',
        min: 0,
        max: demoString.length
      }
    }
  }
}

export const Playground = (args) => {
  const range = useRef(new FlexibleRange())

  useEffect(() => {
    const selection = window.getSelection()
    const node = document.createNodeIterator(document.getElementById('text'), NodeFilter.SHOW_TEXT).nextNode()

    selection.removeAllRanges() // NOTE: IOS compat

    range.current.setStart(node, args.startOffset)
    range.current.setEnd(node, args.endOffset)

    selection.addRange(range.current) // NOTE: IOS compat
  }, [args.startOffset, args.endOffset])

  return (
    <>
      <h2 id='text'>{demoString}</h2>
    </>
  )
}
Playground.args = {
  startOffset: 0,
  endOffset: 5
}
