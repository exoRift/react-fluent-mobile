import { type RollupOptions } from 'rollup'

import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import {
  babel
} from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import typescript from '@rollup/plugin-typescript'

import packageJson from './package.json'

export default {
  input: 'src/index.js',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    typescript(),
    peerDepsExternal(),
    resolve(),
    babel({
      babelHelpers: 'bundled'
    }),
    commonjs(),
    postcss()
  ]
} satisfies RollupOptions
