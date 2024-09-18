# sveltekit-adapter-fastly

A SvelteKit adapter that deploys to fastly compute services

See the docs for [fastly-compute](https://www.fastly.com/documentation/guides/compute/)

## Getting Started

1. Set the Adapter in your `svelte.config.js`

```js
import adapter from "sveltekit-adapter-fastly";
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
