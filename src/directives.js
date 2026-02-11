import { createSignal } from "./signals";

const signals = {};

export function init(root = document.body) {
	root.querySelectorAll('[h-signals]').forEach(el => {
		const expr = el.getAttribute('h-signals');
		let data = {};

		try {
			// parse JS object expression (e.g. "{ count: 0 }" becomes an actual object)
			if (expr.trim()) {
				const fn = new Function(`return ${expr}`);
				data = fn();
			}
		} catch (e) {
			console.error('[🐹 h-signals] Parse error: ', e);
			return;
		}

		// create signals for each property
		Object.keys(data).forEach(key => {
			if (signals[key]) {
				console.warn(`[🐹 h-signals] Signal "${key}" already exists (current: ${signals[key]}). Skipping.`);
				return;
			}

			const [get, set] = createSignal(data[key]);
			signals[key] = { get, set };
		});
	});
};
