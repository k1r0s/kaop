import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import pkg from './package.json';

export default [
	{
		input: 'src/index.js',
		output: [
			{ file: pkg.browser, format: 'umd' }
		],
		name: 'kaop',
		plugins: [
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
