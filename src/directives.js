import { createSignal, createEffect } from "./signals";

export const signals = {};

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

			Object.defineProperty(signals, key, {
				get() { return get(); },
				set(val) { set(val); },
				enumerable: true,
				configurable: true  // so signals can be overwritten
			});
		});
	});

	bindDirectives(root);
};

function bindDirectives(root) {
	root.querySelectorAll('*').forEach(el => {
		for (const attr of el.attributes) {
			if (!attr.name.startsWith(`h-`)) {
				continue;
			}

			const code = attr.value;

			if (attr.name.startsWith('h-on')) {
				const [_, eventName] = attr.name.split('h-on');
				const fn = new Function('event', 's', 'el', code);

				el.addEventListener(eventName, (e) => fn(e, signals, el));
				continue;
			}

			const fn = new Function('s', 'el', `return (${code})`);

			if (attr.name === 'h-text') {
				createEffect(() => {
					el.textContent = fn(signals, el) ?? '';
				});
			} else if (attr.name === 'h-show') {
				createEffect(() => {
					el.style.display = fn(signals, el) ? 'block' : 'none';
				});
			}
		}
	});
};
