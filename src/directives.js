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
			console.error('🐹 [h-signals] Parse error: ', e);
			return;
		}

		// create signals for each property
		Object.keys(data).forEach(key => {
			if (signals[key]) {
				console.warn(`🐹 [h-signals] "${key}" already exists (current: ${signals[key]}). Skipping.`);
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
				const originalDisplay = el.style.display;

				createEffect(() => {
					el.style.display = fn(signals, el) ? (originalDisplay || '') : 'none';
				});
			} else if (attr.name === 'h-class') {
				const originalClasses = el.className.split(' ').filter(c => c);

				createEffect(() => {
					const value = fn(signals, el);
					const classes = new Set(originalClasses);

					// only support string expressions for now, e.g. "isActive ? 'bg-blue' : 'bg-white'"
					if (typeof value !== 'string') {
						return;
					}

					value.split(' ').filter(c => c).forEach(c => classes.add(c));
					el.className = Array.from(classes).join(' ');
				});
			} else if (attr.name === 'h-style') {
				createEffect(() => {
					const value = fn(signals, el);

					// only support object syntax (e.g. { color: isActive ? 'red' : 'blue' })
					if (value === null || typeof value !== 'object' || Array.isArray(value)) {
						return;
					}

					Object.entries(value).forEach(([key, val]) => {
						if (val == null) {
							return;
						}

						// convert camelCase to kebab-case (but skip css variables)
						let cssProp = key;
						if (!cssProp.startsWith('--')) {
							cssProp = key.replace(/([A-Z])/g, '-$1').toLowerCase();
						}

						el.style.setProperty(cssProp, String(val));
					});
				});
			} else {
				createEffect(() => {
					const [_, attrName] = attr.name.split('h-');
					const value = fn(signals, el);

					if (typeof value === 'boolean') {
						if (value) {
							el.setAttribute(attrName, '');
						} else {
							el.removeAttribute(attrName);
						}
					} else if (value == null) {
						el.removeAttribute(attrName);
					} else {
						el.setAttribute(attrName, value);
					}
				});
			}
		}
	});
};
