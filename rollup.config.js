import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'

export default {
  input: './src/use-devtools.js',
  moduleName: 'ReactRectanglePopupMenu',
  sourcemap: true,

  targets: [
    {
      dest: './lib/use-devtools.js',
      format: 'umd',
    },
    {
      dest: 'lib/use-devtools.module.js',
      format: 'es',
    },
  ],

  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    resolve(),
    commonjs(),
  ],

  external: ['react', 'react-dom'],

  globals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
}
