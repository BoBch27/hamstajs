import * as signals from "./signals.js";
import * as directives from "./directives.js";

// hamsta is browser-only
if (typeof window === 'undefined') {
	throw new Error(
		'🐹 hamsta.js requires a browser environment. Your hamster needs a wheel to run on! ' +
		'If using SSR (Next.js, Nuxt, etc), make sure hamsta only runs on the client.'
	);
}

const api = { ...signals, ...directives };

// expose globally, so users can use functions in inline scripts (e.g. createSignal, etc.)
window.hamsta = api;

// export default, so users can import whole package (e.g. import hamsta from 'hamstajs')
export default api;

// export individual functions, so users can import only what's needed 
// (e.g. import { createSignal } from 'hamstajs')
export * from "./signals.js";
export * from "./directives.js";

const scriptTag = document.currentScript;
if (scriptTag && !scriptTag.hasAttribute('disable-auto-init')) {
	const autoInit = () => {
		if (document.body) {
			const cleanup = directives.init();
			window.hamsta.cleanup = cleanup;

			document.dispatchEvent(new CustomEvent('hamsta:ready'));
		}
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', autoInit);
	} else {
		autoInit();
	}
}

