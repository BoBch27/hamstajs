import * as signals from "./signals.js";
import * as directives from "./directives.js";

const api = { ...signals, ...directives };

// expose globally, so users can use functions in inline scripts (e.g. createSignal, etc.)
window.hamsta = api;

// export default, so users can import whole package (e.g. import hamsta from 'hamstajs')
export default api;

// export individual functions, so users can import only what's needed 
// (e.g. import { createSignal } from 'hamstajs')
export * from "./signals.js";
export * from "./directives.js";