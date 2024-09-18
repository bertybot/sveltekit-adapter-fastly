import { writeFileSync } from 'node:fs';
import { posix } from 'node:path';
import { execSync } from 'node:child_process';
import esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';

/** @type {import('./index.js').default} */
export default function (opts = {}) {
	const { out = 'bin' } = opts;
	return {
		name: 'sveltekit-adapter-fastly',
		async adapt(builder) {

			//Removing tmp directory if exists
			const files = fileURLToPath(new URL('./files', import.meta.url).href);
			const tmp = builder.getBuildDirectory('fastly-tmp');
			builder.rimraf(tmp);
			builder.rimraf(out);
			builder.log.minor('Copying Static assets...');
			//copy static assests to tmp directory
			const static_dir = `${tmp}/static`;
			builder.writeClient(static_dir);
			builder.writePrerendered(static_dir);

			// leverage @fastly/compute-js-static-publish to out put static files where i need them

			builder.copy(
				`${files}/static-publish.rc.js`,
				`${tmp}/static-publish.rc.js`,
				{}
			);

			execSync(`npx @fastly/compute-js-static-publish --build-static`, {
				cwd: `${tmp}`,
				stdio: 'inherit'
			});
			const workerSource = `${tmp}/src`;
			const relativePath = posix.relative(tmp, builder.getServerDirectory());
			const workerRelativePath = posix.relative(workerSource, builder.getServerDirectory());

			builder.copy(`${files}/entry.js`, `${workerSource}/index.js`, {
				replace: {
					SERVER: `${workerRelativePath}/index.js`,
					MANIFEST: `${tmp}/manifest.js`,
					STATICS: `../static-publisher/statics.js`
				}
			});

			let prerendered_entries = Array.from(builder.prerendered.pages.entries());

			if (builder.config.kit.paths.base) {
				prerendered_entries = prerendered_entries.map(([path, { file }]) => [
					path,
					{ file: `${builder.config.kit.paths.base}/${file}` }
				]);
			}

			writeFileSync(
				`${tmp}/manifest.js`,
				`export const manifest = ${builder.generateManifest({
					relativePath
				})};\n\n` +
				`export const prerendered = new Map(${JSON.stringify(prerendered_entries)});\n\n` +
				`export const base_path = ${JSON.stringify(builder.config.kit.paths.base)};\n`
			);

			const external = ['fastly:*'];

			console.log('Building worker...');
			try {
				const result = await esbuild.build({
					platform: 'browser',
					allowOverwrite: true,
					conditions: ['workerd', 'worker', 'browser'],
					target: 'es2022',
					entryPoints: [`${tmp}/src/index.js`],
					outfile: `${tmp}/src/index.js`,
					bundle: true,
					external,
					format: 'esm',
					loader: {
						'.wasm': 'copy',
						'.woff': 'copy',
						'.woff2': 'copy',
						'.ttf': 'copy',
						'.eot': 'copy',
						'.otf': 'copy'
					},
					logLevel: 'silent'
				});

				console.log('creating wasm file');
		        execSync(
					`npx --package @fastly/js-compute js-compute-runtime src/index.js ./bin/main.wasm`,
					{
						cwd: `${tmp}`,
						stdio: 'inherit'
					}
				);

				builder.copy(`${tmp}/bin/main.wasm`, `${out}/main.wasm`, {});

				if (result.warnings.length > 0) {
					const formatted = await esbuild.formatMessages(result.warnings, {
						kind: 'warning',
						color: true
					});

					console.error(formatted.join('\n'));
				}
			} catch (error) {
				for (const e of error.errors) {
					for (const node of e.notes) {
						const match =
							/The package "(.+)" wasn't found on the file system but is built into node/.exec(
								node.text
							);

						if (match) {
							node.text = `Cannot use "${match[1]}" when deploying to Fastly.`;
						}
					}
				}

				const formatted = await esbuild.formatMessages(error.errors, {
					kind: 'error',
					color: true
				});

				console.error(formatted.join('\n'));

				throw new Error(
					`Bundling with esbuild failed with ${error.errors.length} ${error.errors.length === 1 ? 'error' : 'errors'
					}`
				);
			}
		},
		async emulate() {
			/** @type {import('fastly:geolocation').Geolocation} */
			const emuGeo = {
				area_code: 54304,
				city: 'Green Bay',
				country_code: 'US',
				country_code3: 'USA',
				country_name: 'United States',
				conn_speed: 'Cable/DSL',
				conn_type: 'Corporate',
				as_name: 'Unknown',
				as_number: 1,
				latitude: 44.519,
				longitude: -88.0198,
				postal_code: '54304',
				region: 'WI',
				continent: 'NA',
				utc_offset: -6,
				proxy_description: 'Corporate',
				proxy_type: 'Corporate',
				metro_code: 658,
				gmt_offset: "Test"
			};
			return {
				platform: () => {
					return {
						env: () => 'local',
						geo: emuGeo
					};
				}
			};
		}
	};
}
