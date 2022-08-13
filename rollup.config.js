import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import buble from 'rollup-plugin-buble';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default [
	{
		input: 'src/index.js',
		output: [
			{ file: pkg.browser, name: 'kaop', format: 'umd' }
		],
		plugins: [
      typescript(),
			uglify(),
			commonjs(),
			buble({
				exclude: ['node_modules/**']
			})
		]
	},
	{
		input: 'src/index.js',
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		],
		plugins: [
      commonjs(),
			buble({
				exclude: ['node_modules/**']
			})
		]
	}
];
