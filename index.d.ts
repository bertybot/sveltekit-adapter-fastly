import { Adapter } from "@sveltejs/kit";
/// <reference types="@fastly/js-compute" />
import { Geolocation } from "fastly:geolocation";
import "./ambient.js";

export default function plugin(options?: AdapterOptions): Adapter;

export interface AdapterOptions {
  out?: string;
  staticPublishConfig?: string;
  silent?: boolean;
}

export type FastlyConfig = {
  manifest_version: number;
  name: string;
  language: "javascript";
};

export { Geolocation };
