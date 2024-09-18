import { Adapter } from "@sveltejs/kit";
/// <reference types="@fastly/js-compute" />
import { Geolocation } from "fastly:geolocation";
import "./ambient.js";

export default function plugin(options?: AdapterOptions): Adapter;

export interface AdapterOptions {
  out?: string;
}

export { Geolocation };
