# svelte-adapter-fastly

A SvelteKit adapter that deploys to fastly compute services

See the docs for [fastly-compute](https://www.fastly.com/documentation/guides/compute/)

## Getting Started

### Prerequisites

You will need all the fastly edgeworker CLI tools installed. These should get installed automatically with the package but if not you can install them manually.

```bash
pnpm i @fastly/js-compute @fastly/compute-js-static-publish
```

1. Set the Adapter in your `svelte.config.js`

```js
import adapter from "svelte-adapter-fastly";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
};
```

2. You will need a valid [`fastly.toml`](https://www.fastly.com/documentation/reference/compute/fastly-toml/) at the the base of your Sveltekit project.

   - Make sure it has a script to run pnpm build.

3. You can test your project via the fastly CLI using `fastly compute serve`

## Options

### silent

By default if a fastly.toml file is not included this adapter will help you make one. You can avoid this option in CI/CD enviroments by passing `silent: true`

### staticPublishConfig

Due to its nature as an edgeworker Fastly needs to compile static assets to be served by the edgeworker. This adapter uses [`compute-js-static-publish`](https://github.com/fastly/compute-js-static-publish) to handle this, and uses a default config that should work well for most use cases. However, if you would like to customize this using a `static-publish.rc.js` you can supply the path to it here. This would be useful if you want to store your assets in a KV store instead of binary.
