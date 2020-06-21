import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/Wonderscroll.js',
    output: [
        {
            file: 'dist/wonderscroll.js',
            format: 'cjs'
        },
        {
            file: 'dist/wonderscroll.min.js',
            format: 'iife',
            name: 'Wonderscroll',
            plugins: [terser()]
        },
        {
            file: 'demo/public/wonderscroll.js',
            sourcemap: true,
            format: 'iife',
            name: 'Wonderscroll'
        }
    ],
    plugins: [
        resolve(),
        babel({
            babelHelpers: 'bundled'
        })
    ]
}