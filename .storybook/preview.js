export const parameters = {
  actions: {
    argTypesRegex: '^on[A-Z].*'
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    }
  },
  docs: {
    disable: true,
    hidden: true
  },
  console: {
    disabled: false,
    patterns: [/^dev$/],
    omitFirst: true
  }
}
