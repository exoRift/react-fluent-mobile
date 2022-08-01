![Banner](assets/banner.png)

[![Maintainability](https://api.codeclimate.com/v1/badges/a6122e76dcb42d834772/maintainability)](https://codeclimate.com/github/exoRift/react-fluent-mobile/maintainability)

[![Storybook](https://img.shields.io/badge/TRY%20IT%20OUT-STORYBOOK%20-ff69b4?style=for-the-badge&logo=storybook)](https://exorift.github.io/react-fluent-mobile?path=/story/fluentselectionmixin--tutorial)
[![NPM](https://img.shields.io/npm/v/react-fluent-mobile?style=for-the-badge)](https://www.npmjs.com/package/react-fluent-mobile)

# *What's the problem with mobile browsers?*
Mobile web browsers are an adaptation of the PC browsing experience for your mobile device. As a result, many features found on desktop browsers are sloppily implemented in ways that just aren't meant for phones, degrading your browsing experience.

# Introducing a new meaning to fluency!

`react-fluent-mobile` allows you to take your mobile browser's native features and augment them, improving gloss and agility without compromising on ability.

## Selecting text
Fluent takes selecting text on mobile to a whole new level by adding the *selection manipulation pad*. When text is selected by the user, whether selected through normal means, selected by the website, or tap-selected on Android, the *selection manipulation pad* appears. Users can touch and drag on the pad to shift the bounds of their selection in any direction they'd like, transforming their selection. Once the selection is fit to the user's liking, they can tap on the pad to instantly copy their selection to their clipboard.

- One finger shifts the end bound
- If a second finger is present, the first continues shifting the end while the second shifts the beginning, allowing manipulation of both bounds at the same time
- Double-tapping on the pad copies the contents of the selection to the clipboard
> *NOTE: Copying to clipboard utilizes [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) and therefore requires HTTPS. ([document.execCommand()](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand) will also be attempted for HTTP)*
- Swiping down on the pad dismisses the pad and selection

### The selection pad allows the customization of
- The distance required to swipe down to dismiss the selection
- The maximum duration of the swipe down to dismiss the selection
- The theme of the pad (dark, light)

## Context menus
*Coming soon*

## *Snappy, fluid, purposeful interactions*
*INSERT GIF*

# Known bugs
- Tapping on the manipulation pad on Safari makes the selection invisible (this is an unavoidable quirk with Safari)
