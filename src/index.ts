import doRollup from './doRollup';
import WebPack, { Compiler, Compilation } from 'webpack';

interface Options {
	to?: string;
	postprocess?: (result: string) => string;
}
	
class WebPackRollupTsCompiler {

	private from: string;
	private options?: Options;

	constructor(from: string, options?: Options) {
		this.from = from;
		this.options = options;
	}

	apply = (compiler: Compiler) => {
		compiler.hooks.thisCompilation.tap('WebPackRollupTsCompiler', async(compilation: Compilation) => {
			const { from, options } = this;
			let result = await doRollup(from);
			if (options?.postprocess) result = options.postprocess(result);
			if (options?.to) compilation.emitAsset(options.to, new WebPack.sources.RawSource(result || ''));
		});
	}
}

export = WebPackRollupTsCompiler;