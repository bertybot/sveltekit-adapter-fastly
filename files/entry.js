/// <reference types="@fastly/js-compute" />
import { Server } from "SERVER";
import { manifest, prerendered, base_path } from "MANIFEST";
//! Default Compute template program.
import { env } from "fastly:env";
import { getServer } from "STATICS";

const staticContentServer = getServer();

const server = new Server(manifest);

const app_path = `/${manifest.appPath}`;

const immutable = `${app_path}/immutable/`;
const version_file = `${app_path}/version.json`;

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));
/**
 * @param {FetchEvent} event
 */
async function handleRequest(event) {
  // Log service version
  await server.init({
    env: {
      FASTLY_SERVICE_VERSION: env("FASTLY_SERVICE_VERSION") || "local",
    },
  });

  // Get the client request.
  let req = event.request;
  let url = new URL(req.url);
  // If request is to the `/` path...

  // TODO STATIC ASSET FROM KEYVAULT

  let { pathname, search } = url;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    // ignore invalid URI
  }
  const stripped_pathname = pathname.replace(/\/$/, "");

  // prerendered pages and /static files

  let is_static_asset = false;
  const filename = stripped_pathname.slice(base_path.length + 1);
  if (filename) {
    is_static_asset =
      manifest.assets.has(filename) ||
      manifest.assets.has(filename + "/index.html");
  }

  let location = pathname.at(-1) === "/" ? stripped_pathname : pathname + "/";

  if (
    is_static_asset ||
    prerendered.has(pathname) ||
    pathname === version_file ||
    pathname.startsWith(immutable)
  ) {
    return await staticContentServer.serveRequest(event.request);
  } else if (location && prerendered.has(location)) {
    if (search) location += search;
    return new Response("", {
      status: 308,
      headers: {
        location,
      },
    });
  }

  //@ts-expect-error Put in a basic Formdata polyfill that should suffice for most FormData use cases
  req.formData = () => req.text().then((text) => new URLSearchParams(text));
  // dynamically-generated pages
  return await server.respond(req, {
    platform: {
      env,
      geo: event.client.geo,
    },
    getClientAddress() {
      return event.client.address;
    },
  });
}

