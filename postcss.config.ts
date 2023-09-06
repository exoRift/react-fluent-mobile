import { type PostCSSPluginConf } from 'rollup-plugin-postcss'

export default {
  plugins: [
    require('autoprefixer')
  ]
} satisfies PostCSSPluginConf
