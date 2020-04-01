const replace = require('rollup-plugin-replace');
const {terser} = require ('rollup-plugin-terser');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

export default {
  input: 'swtemplate.js',
  output: {
    file: 'buildsw.js',
    format: 'cjs'
  },
  plugins: [resolve(),
    commonjs(),
    replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  terser(),
]
};