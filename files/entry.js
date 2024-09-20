import { handleSvelteKitRequest } from "./handleSvelteKitRequest.js";

addEventListener("fetch", (event) =>
  event.respondWith(handleSvelteKitRequest(event))
);
