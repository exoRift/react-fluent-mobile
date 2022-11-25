import React from 'react'

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
  disable: {
    Component: (
      <div className='fluent menuoption disable'>
        <div className='material-symbols-outlined icon'>mobile_off</div>
      </div>
    ),
    action: (element, contextMixin) => contextMixin.disable()
  },
  tab: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>add_box</div>

        <span className='tag'>Open link in new tab</span>
      </div>
    ),
    action: (element) => window.open(element.href ?? element.parentElement.href)?.focus?.()
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
      const anchor = element.href ? element : element.parentElement

      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(anchor.href)
      else {
        const selection = window.getSelection()

        const tempElement = document.createElement('span')
        tempElement.textContent = anchor.href
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
      const anchor = element.href ? element : element.parentElement

      if (anchor.getAttribute('download')) anchor.click()
      else {
        anchor.setAttribute('download', '')

        anchor.click()

        anchor.removeAttribute('download')
      }
    }
  },
  share: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>share</div>

        <span className='tag'>Share Link</span>
      </div>
    ),
    action: (element) => {
      const anchor = element.href ? element : element.parentElement

      navigator?.share?.({
        title: element.textContent || element.getAttribute('alt'),
        text: anchor.href,
        url: anchor.href
      })
    }
  },
  imageTab: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>add_photo_alternate</div>

        <span className='tag'>Open image in new tab</span>
      </div>
    ),
    action: (element) => window.open(element.src)?.focus?.()
  },
  copyImage: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>photo_library</div>

        <span className='tag'>Copy image</span>
      </div>
    ),
    action: (element) => {
      return fetch(element.src)
        .then((img) => img.blob())
        .then((blob) => navigator?.clipboard?.write([new ClipboardItem({ [blob.type]: blob })])) // eslint-disable-line no-undef
    }
  },
  copyImageAddress: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>media_link</div>

        <span className='tag'>Copy image address</span>
      </div>
    ),
    action: (element) => {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(element.src)
      else {
        const selection = window.getSelection()

        const tempElement = document.createElement('span')
        tempElement.textContent = element.src
        element.appendChild(tempElement)

        selection.selectAllChildren(tempElement)
        document.execCommand('copy')

        selection.removeAllRanges()
        tempElement.remove()
      }
    }
  },
  downloadImage: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>system_update_alt</div>

        <span className='tag'>Download image</span>
      </div>
    ),
    action: (element) => {
      const tempElement = document.createElement('a')
      tempElement.href = element.src
      tempElement.setAttribute('download', '')
      element.appendChild(tempElement)

      tempElement.click()

      tempElement.remove()
    }
  },
  shareImage: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>ios_share</div>

        <span className='tag'>Share Image</span>
      </div>
    ),
    action: (element) => navigator?.share?.({
      title: element.alt,
      text: element.src,
      url: element.src
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
  ],
  img: [
    options.imageTab,
    options.divider,
    options.copyImageAddress,
    options.copyImage,
    options.downloadImage,
    options.divider,
    options.shareImage
  ],
  aimg: [
    options.tab,
    options.imageTab,
    options.divider,
    options.copyAddress,
    options.copyImageAddress,
    options.copyImage,
    options.downloadLink,
    options.downloadImage,
    options.divider,
    options.share,
    options.shareImage
  ]
}

export {
  options,
  optionsForTag
}
