module.exports = {
  stories: [
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-console'
  ],
  framework: '@storybook/react',
  staticDirs: [
    '../src/stories/assets',
    '../assets'
  ]
}
