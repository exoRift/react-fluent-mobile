![Banner](assets/banner.png)

[![NPM](https://img.shields.io/npm/v/react-fluent-mobile?style=for-the-badge)](https://www.npmjs.com/package/react-fluent-mobile)
[![Storybook](https://img.shields.io/badge/TRY%20IT%20OUT-STORYBOOK-ff69b4?style=for-the-badge&logo=storybook)](https://exorift.github.io/react-fluent-mobile?path=/story/tutorials--selection&panel=false)
[![Gitter](https://img.shields.io/badge/CHAT%20WITH%20US-GITTER-f68d42?style=for-the-badge&logo=gitter)](https://gitter.im/exoRift/react-fluent-mobile)
[![Roadmap](https://img.shields.io/badge/ROADMAP-GITHUB%20PROJECT-2d85e3?style=for-the-badge&logo=trello)](https://github.com/users/exoRift/projects/2/views/4)

[![Maintainability](https://api.codeclimate.com/v1/badges/a6122e76dcb42d834772/maintainability)](https://codeclimate.com/github/exoRift/react-fluent-mobile/maintainability)

# *What's the problem with mobile browsers?*
### Mobile web browsers are an adaptation of the PC browsing experience for your mobile device. As a result, many features found on desktop browsers are sloppily implemented in ways that just aren't meant for phones, degrading your browsing experience.

# Introducing fluency!

**react-fluent-mobile** allows you to take your mobile browser's native features and augment them, improving gloss and agility without compromising on ability.

## Selecting text
*INSERT GIF*

Fluent takes selecting text on mobile to a whole new level by adding the *selection manipulation pad*. When text is selected by the user, whether selected through normal means, selected by the website, or tap-selected on Android, the *selection manipulation pad* appears. Users can touch and drag on the pad to shift the bounds of their selection in any direction they'd like, transforming their selection. Once the selection is fit to the user's liking, they can tap on the pad to instantly copy their selection to their clipboard.

- One finger shifts the end bound
- If a second finger is present, the first continues shifting the end while the second shifts the beginning, allowing manipulation of both bounds at the same time
- Double-tapping on the pad copies the contents of the selection to the clipboard
> *NOTE: Copying to clipboard utilizes [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) and therefore requires HTTPS. ([document.execCommand()](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand) will also be attempted for HTTP)*
- Swiping down on the pad dismisses the pad and selection

### Component Properties
Name|Description
-|-
collapseSwipeDistance|The minimum distance required to swipe down to dismiss the selection
collapseSwipeDuration|The maximum duration of the swipe down to dismiss the selection
nativeManipulationInactivityDuration|The interval the manipulation pad is inactive for when the selection is natively manipulated
theme|The theme of the pad (dark, light)

## Context menus
*INSERT GIF*

*Coming soon*

## Media control
*INSERT GIF*

*Coming soon*

# Installation and Quickstart
> `npm i react-fluent-mobile`

```jsx
import {
  FluentContextMixin,
  FluentSelectionMixin
} from 'react-fluent-mobile'

function Component (props) {
  return (
    <>
      <FluentContextMixin/>
      <FluentSelectionMixin/>

      <div ...>
        ...
      </div>
    </>
  )
}
```

## *Snappy, fluid, deliberate interactions*
*INSERT GIF*

<br/>

***
## Known bugs
- Tapping on the manipulation pad on Safari makes the selection invisible (this is an unavoidable quirk with Safari)
## Developer notes
- FM works on all browsers and platforms
- Safari does not allow haptics
- The custom FlexibleRange class used for the selection system is exposed in the exports. Feel free to use it
- Try to keep the mixins at the root of the heirarchy
- **You do not need to check for mobile devices before mounting the component. FM does that for you.**
