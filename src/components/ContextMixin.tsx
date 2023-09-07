import React from 'react'
import * as PropTypes from 'prop-types'

import * as TouchHandler from '../util/touch-handler'
import {
  options as menuOptions,
  optionsForTag
} from '../util/menu-options'

import '../styles/Context.css'
import '../styles/notification.css'

export interface ContextMixinProps {
  theme?: 'light' | 'dark'
}

/**
 * This is a mixin that augments the the experience of opening context menu for mobile users in a way that reduces the lift-count for actions
 */
class ContextMixin extends React.Component<Required<ContextMixinProps> & React.PropsWithChildren> {
  static propTypes = {
    theme: PropTypes.oneOf(['light', 'dark'])
  }

  static defaultProps = {
    theme: 'dark'
  }

  /** A ref to the context menu element */
  menu = React.createRef<HTMLDivElement>()
  /** The element the context menu is being emitted from */
  holdingElement: HTMLElement | null = null
  /** The index of the tag option the user is hovering over */
  hoveringIndex = 0
  /** How long the mixin should wait before checking for overflow */
  overflowTimeoutDuration = 0
  /** The timeout to check if the context menu is overflowing */
  overflowTimeout?: NodeJS.Timeout

  state = {
    /** Whether a touch has been detected and the custom context menu is mounted */
    initialized: false,
    /** Whether the custom context menu is disabled by the user or not */
    disabled: false,
    /** If the context menu is active and being held */
    holding: false,
    /** The currently held tag */
    holdingTag: null as keyof typeof optionsForTag | null,
    /** Which side of the screen the touch origin is on */
    side: 'right'
  }

  constructor (props: ContextMixinProps) {
    super(props as Required<ContextMixinProps>)

    this.initializeComponent = this.initializeComponent.bind(this)
    this.prepareContextMenu = this.prepareContextMenu.bind(this)
    this.launchContextMenu = this.launchContextMenu.bind(this)
    this.closeContextMenu = this.closeContextMenu.bind(this)
    this.cancelContextMenu = this.cancelContextMenu.bind(this)
    this.switchHovering = this.switchHovering.bind(this)
    this.disable = this.disable.bind(this)
    this.rectifyOverflow = this.rectifyOverflow.bind(this)
  }

  componentDidMount (): void {
    document.addEventListener('touchstart', this.initializeComponent, {
      once: true
    })
    document.addEventListener('touchstart', this.prepareContextMenu)
    document.addEventListener('touchcancel', this.cancelContextMenu)
    document.addEventListener('click', this.cancelContextMenu)

    if (window.FLUENT_IS_IOS) TouchHandler.mount()
  }

  componentWillUnmount (): void {
    if (this.state.initialized && !this.state.disabled) {
      document.removeEventListener('contextmenu', this.launchContextMenu as any) // NOTE: TS typing for contextmenu event is incorrect
      document.removeEventListener('touchmove', this.switchHovering)
      document.removeEventListener('touchend', this.closeContextMenu)
      document.removeEventListener('touchstart', this.prepareContextMenu)
      document.removeEventListener('touchcancel', this.cancelContextMenu)
      document.removeEventListener('click', this.cancelContextMenu)

      if (window.FLUENT_IS_IOS) TouchHandler.unmount()
    } else document.removeEventListener('touchstart', this.initializeComponent)
  }

  render (): React.ReactNode {
    if (!this.state.initialized) return null

    if (this.state.disabled) {
      return (
        <>
          <i className={`fluent notification ${this.props.theme}`}>Now using the native context menu</i>
        </>
      )
    }

    return (
      <>
        {this.props.children}

        <div
          className='fluent menu'
          id='fluentmenu'
          data-theme={this.props.theme}
          data-active={this.state.holding}
          data-side={this.state.side}
          ref={this.menu}
        >
          <div className='fluent menubody'>
            {menuOptions.empty.Component}
            {this.state.holdingTag &&
              optionsForTag[this.state.holdingTag]?.map((o, i) =>
                <React.Fragment key={i}>{o.Component}</React.Fragment>
              )}
          </div>

          {menuOptions.disable.Component}
        </div>
      </>
    )
  }

  /**
   * Mount the component and listen for context menu events
   * @fires document#touchstart
   */
  initializeComponent (): void {
    if (!this.state.initialized) {
      this.setState({
        initialized: true
      })

      setTimeout(() => {
        const style = window.getComputedStyle(this.menu.current!.getElementsByClassName('menubody')[0])

        this.overflowTimeoutDuration = parseFloat(style.transitionDuration) * 1000
      })

      document.addEventListener('contextmenu', this.launchContextMenu as any) // NOTE: TS typing for contextmenu event is incorrect
    }
  }

  /**
   * Prepare the context menu elements to be revealed
   * @param e The touch event
   * @fires document#touchstart
   */
  prepareContextMenu (e: TouchEvent): void {
    const target = e.target as HTMLElement

    if (!this.state.holding) {
      let tag = target.tagName.toLowerCase()
      if (tag === 'img' && target.parentElement?.tagName.toLowerCase() === 'a') tag = 'aimg'

      if (tag in optionsForTag) {
        this.setState({
          holdingTag: tag
        })
      } else if (this.state.holdingTag) this.setState({ holdingTag: null })
    }
  }

  /**
   * Open the context menu
   * @param e The contextmenu event
   * @fires document#contextmenu
   */
  launchContextMenu (e: MouseEvent & PointerEvent): void {
    if (e.pointerType === 'touch' && this.state.holdingTag && this.state.holdingTag in optionsForTag) {
      e.preventDefault()

      const side = e.clientX >= (window.innerWidth / 2) ? 'right' : 'left'

      const menu = this.menu.current!
      const target = e.target as HTMLDivElement

      switch (side) {
        case 'left':
          menu.style.paddingRight = ''
          menu.style.paddingLeft = e.clientX.toString() + 'px'

          break
        case 'right':
          menu.style.paddingRight = String(window.innerWidth - e.clientX) + 'px'
          menu.style.paddingLeft = ''

          break
        default: break
      }
      menu.style.paddingTop = e.clientY.toString() + 'px'

      this.holdingElement = target
      this.hoveringIndex = 0
      this.setState({
        holding: true,
        side
      })

      this.overflowTimeout = setTimeout(this.rectifyOverflow, this.overflowTimeoutDuration)

      navigator.vibrate?.(1)

      document.addEventListener('touchmove', this.switchHovering)

      document.addEventListener('touchend', this.closeContextMenu, {
        once: true
      })
    }
  }

  /**
   * Switch the index of the context menu option the user is hovering
   * @param e The touch event
   * @fires document#touchmove
   */
  switchHovering (e: TouchEvent): void {
    const [touch] = e.changedTouches

    const options = this.menu.current!.querySelectorAll('.menuoption, .menudivider')

    for (let o = options.length - 1; o >= 0; o--) {
      if (!options[o].classList.contains('menuoption')) continue

      const rect = options[o].getBoundingClientRect()

      if ((touch.clientY >= rect.top || !o)) {
        if (o !== this.hoveringIndex) {
          options[this.hoveringIndex]?.classList?.remove?.('hovering')

          // Play blob animation
          options[this.hoveringIndex]?.classList?.remove?.('blob')
          setTimeout(() => options[this.hoveringIndex]?.classList?.add?.('blob'))

          options[o].classList.add('hovering')

          // Play blob animation
          options[o].classList.remove('blob')
          setTimeout(() => options[o].classList.add('blob'))

          this.hoveringIndex = o

          navigator.vibrate?.(20)
        }

        break
      }
    }
  }

  /**
   * Close the context menu and execute the hovering option
   */
  closeContextMenu (): void {
    const tagOptions = optionsForTag[this.state.holdingTag!]
    const body = this.menu.current!.getElementsByClassName('menubody')[0] as HTMLDivElement

    document.removeEventListener('touchmove', this.switchHovering)

    clearTimeout(this.overflowTimeout)
    this.overflowTimeout = undefined
    body.style.marginLeft = ''
    body.style.marginRight = ''
    body.style.marginTop = ''

    this.menu.current!.getElementsByClassName('menuoption hovering')[0]?.classList?.remove?.('hovering')

    // Disable button which is not a part of the options list (This can be > instead of >= since 1 is added to the index on account of the blank option)
    if (this.hoveringIndex > tagOptions.length) menuOptions.disable.action(this.holdingElement!, this)
    // Subtract 1 from index to accomodate the blank button
    else if (this.hoveringIndex) (tagOptions[this.hoveringIndex - 1] as any)?.action?.(this.holdingElement, this)

    this.setState({
      holding: false
    })
  }

  /**
   * Close the context menu without triggering any actions
   */
  cancelContextMenu (): void {
    this.hoveringIndex = 0

    this.closeContextMenu()
  }

  /**
   * Disable the context menu
   */
  disable (): void {
    this.componentWillUnmount()

    this.setState({
      disabled: true
    })
  }

  rectifyOverflow (): void {
    const body = this.menu.current!.getElementsByClassName('menubody')[0] as HTMLDivElement
    const rect = body.getBoundingClientRect()

    if (rect.left < 0) body.style.marginRight = `${rect.left}px`
    else if (rect.right > window.innerWidth) body.style.marginLeft = `${window.innerWidth - rect.right}px`

    if (rect.bottom > window.innerHeight) body.style.marginTop = `${window.innerHeight - rect.bottom}px`
  }
}

export default ContextMixin
