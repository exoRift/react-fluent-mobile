import {
  React,
  useRef,
  useEffect
} from 'react'

import {
  FlexibleRange
} from '../'

import './styles/index.css'

export default {
  component: FlexibleRange,
  argTypes: {
    startOffset: {
      control: {
        type: 'number'
      }
    },
    endOffset: {
      control: {
        type: 'number'
      }
    }
  }
}

export const Playground = (args) => {
  const range = useRef(new FlexibleRange())

  useEffect(() => {
    const selection = window.getSelection()
    const node = document.createNodeIterator(document.getElementById('text'), NodeFilter.SHOW_TEXT).nextNode()

    selection.removeAllRanges()
    selection.addRange(range.current)

    range.current.setStart(node, Math.min(Math.max(0, args.startOffset), node.textContent.length))
    range.current.setEnd(node, Math.min(Math.max(0, args.endOffset), node.textContent.length))
  })

  return (
    <>
      <h2 id='text'>A flexible range allows you to set bounds of a selection regardless of whether the end comes before the start</h2>
    </>
  )
}
Playground.args = {
  startOffset: 0,
  endOffset: 5
}
