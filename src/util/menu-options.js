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
    action: (element) => window.open(element.href, '_blank', 'rel=noreferrer,popup=false').focus()
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
    )
  },
  copyText: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>format_size</div>

        <span className='tag'>Copy link text</span>
      </div>
    )
  },
  downloadLink: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>download</div>

        <span className='tag'>Download link file</span>
      </div>
    )
  },
  share: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>share</div>

        <span className='tag'>Share...</span>
      </div>
    )
  },
  native: {
    Component: (
      <div className='fluent menuoption'>
        <div className='material-symbols-outlined icon'>menu_open</div>

        <i className='tag'>Open native context menu</i>
      </div>
    )
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
    options.share,
    options.divider,
    options.native
  ]
}

export {
  options,
  optionsForTag
}
