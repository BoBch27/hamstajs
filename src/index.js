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

if (typeof document !== 'undefined') {
	const autoInit = () => {
		if (document.body) {
			console.log('🐹 hamsta.js auto-initialised');
			directives.init();
		}
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', autoInit);
	} else {
		autoInit();
	}
}
