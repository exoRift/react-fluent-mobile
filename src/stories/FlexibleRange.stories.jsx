import {
  React,
  useEffect
} from 'react'

import {
  FlexibleRange
} from '../'

export default {
  title: 'FlexibleRangeTest',
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

const range = new FlexibleRange()
export const Default = (args) => {
  useEffect(() => {
    const selection = window.getSelection()
    const node = document.createNodeIterator(document.getElementById('text'), NodeFilter.SHOW_TEXT).nextNode()

    selection.removeAllRanges()
    selection.addRange(range)

    range.setStart(node, Math.max(0, args.startOffset))
    range.setEnd(node, Math.min(node.textContent.length, args.endOffset))
  })

  return (
    <div>
      <h1 id='text'>This is the text to test the range on</h1>
    </div>
  )
}
Default.args = {
  startOffset: 0,
  endOffset: 5
}
