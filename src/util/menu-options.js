const options = {
  empty: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>cancel</div>
      </div>
    )
  },
  divider: {
    Component: (
      <div className='fluent menudivider'/>
    )
  },
  tab: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>add_box</div>

        <span className='tag'>Open link in new tab</span>
      </div>
    ),
    action: (element) => window.open(element.href)?.focus?.()
  },
  // incognitoTab: {
  //   Component: (
  //     <div className='fluent menuoption'>
  //       <div className='material-symbols-outlined icon'>account_box</div>

  //       <span className='tag'>Open link in new incognito tab</span>
  //     </div>
  //   )
  // },
  copyAddress: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>link</div>

        <span className='tag'>Copy link address</span>
      </div>
    ),
    action: (element) => {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(element.href)
      else {
        const selection = window.getSelection()

        const tempElement = document.createElement('span')
        tempElement.textContent = element.href
        element.appendChild(tempElement)

        selection.selectAllChildren(tempElement)
        document.execCommand('copy')

        selection.removeAllRanges()
        tempElement.remove()
      }
    }
  },
  copyText: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>format_size</div>

        <span className='tag'>Copy link text</span>
      </div>
    ),
    action: (element) => {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(element.textContent)
      else {
        const selection = window.getSelection()

        selection.selectAllChildren(element)
        document.execCommand('copy')

        selection.removeAllRanges()
      }
    }
  },
  downloadLink: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>download</div>

        <span className='tag'>Download link file</span>
      </div>
    ),
    action: (element) => {
      element.setAttribute('download', 'true')

      element.click()

      element.setAttribute('download', 'false')
    }
  },
  share: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>share</div>

        <span className='tag'>Share...</span>
      </div>
    ),
    action: (element) => navigator?.share?.({
      title: element.textContent,
      text: element.href,
      url: element.href
    })
  }
}

const optionsForTag = {
  a: [
    options.tab,
    options.divider,
    options.copyAddress,
    options.copyText,
    options.downloadLink,
    options.divider,
    options.share
  ]
}

export {
  options,
  optionsForTag
}
