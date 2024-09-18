/// <reference types="@fastly/js-compute" />
import { Geolocation } from "fastly:geolocation";

declare global {
  namespace App {
    export interface Platform {
      geo: Geolocation;
      env: (string) => string;
    }
  }
}
