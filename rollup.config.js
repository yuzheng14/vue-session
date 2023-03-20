// @ts-check
import { createRequire } from 'module'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const require = createRequire(import.meta.url)

const pkg = require('./package.json')

function getExternal() {
  return [...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]
}

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/es/index.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/lib/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    typescript({
      declaration: false,
    }),
  ],
}
