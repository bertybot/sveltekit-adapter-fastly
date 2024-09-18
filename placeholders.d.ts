declare module "SERVER" {
  export { Server } from "@sveltejs/kit";
}

declare module "MANIFEST" {
  import { SSRManifest } from "@sveltejs/kit";

  export const manifest: SSRManifest;
  export const prerendered: Map<string, { file: string }>;
  export const base_path: string;
}

declare module "__STATIC_CONTENT_MANIFEST" {
  const json: string;
  export default json;
}

declare module "STATICS" {
  export const getServer: () => import("@fastly/compute-js-static-publish/build/server/publisher-server.js").PublisherServer;
}
