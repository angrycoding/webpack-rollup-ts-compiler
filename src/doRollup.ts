import FS from 'fs/promises';
import Path from 'path';
import { rollup } from 'rollup';
import TypeScript from 'typescript';

const rollupResource = (dependencies: string[]) => ({

	name: 'rollupResource',

	load: async(id) => {

		if (id.endsWith('.svg')) {
			const file = await FS.readFile(id, 'utf8');
			return `
				export default "data:image/svg+xml;,${encodeURIComponent(file)}";
			`
		}

		let result: any = await FS.readFile(id, 'utf8');

		result = TypeScript.transpileModule(result, {
			compilerOptions: {
				module: TypeScript.ModuleKind.ES2022
			}
		});

		return result.outputText;
	},

	resolveId: (source, fromPath) => {
		if (!fromPath) {
			dependencies.push(source);
			return source;
		}
		fromPath = Path.resolve(Path.dirname(fromPath), source);
		const extension = Path.extname(fromPath);
		if (!extension) fromPath += '.ts';
		dependencies.push(fromPath);
		return fromPath;
	}

})


const doRollup = async(input: string, intro: string): Promise<string> => {

	const dependencies = [];

	const bundle = await rollup({
		input,
		logLevel: 'silent',
		plugins: [
			rollupResource(dependencies)
		],
	});

	const { output } = await bundle.generate({ format: 'iife', intro });

	return output.map(ou => ou?.['code']).join('\r\n');

}

export = doRollup;