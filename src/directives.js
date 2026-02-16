import { createSignal, createEffect } from "./signals";

export const signals = {};

export function init(root = document.body) {
	const signalsAttr = 'h-signals';

	root.querySelectorAll(`[${signalsAttr}]`).forEach(el => {
		const expr = el.getAttribute(signalsAttr);

		const fn = parseExpression(`return ${expr}`, signalsAttr, el, []);
		if (!fn) {
			return;
		}

		const data = callExpression(fn, signalsAttr, el, []);

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
			if (!attr.name.startsWith(`h-`) || attr.name === 'h-signals') {
				continue;
			}

			const code = attr.value;

			if (attr.name.startsWith('h-on')) {
				const [_, eventName] = attr.name.split('h-on');
				const fn = parseExpression(code, attr.name, el, ['event', 's', 'el']);
				if (!fn) {
					continue;
				}

				el.addEventListener(eventName, (e) => callExpression(fn, attr.name, el, [e, signals, el]));
				continue;
			}

			const fn = parseExpression(`return (${code})`, attr.name, el, ['s', 'el']);
			if (!fn) {
				continue;
			}

			if (attr.name === 'h-text') {
				createEffect(() => {
					const value = callExpression(fn, attr.name, el, [signals, el]);
					el.textContent = value ?? '';
				});
			} else if (attr.name === 'h-show') {
				const originalDisplay = el.style.display;

				createEffect(() => {
					const value = callExpression(fn, attr.name, el, [signals, el]);
					el.style.display = value ? (originalDisplay || '') : 'none';
				});
			} else if (attr.name === 'h-class') {
				const originalClasses = el.className.split(' ').filter(c => c);

				createEffect(() => {
					const value = callExpression(fn, attr.name, el, [signals, el]);
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
					const value = callExpression(fn, attr.name, el, [signals, el]);

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
					const value = callExpression(fn, attr.name, el, [signals, el]);

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

// parse string expressions to JS (e.g. "{ count: 0 }" becomes an actual object)
function parseExpression(code, attrName, el, args) {
	try {
		const fn = new Function(...args, code);
		return fn;
	} catch (e) {
		console.error(`🐹 [${attrName}] Parse error: ${e.message}\n\n`, el);
		return null;
	}
};

// run JS expressions
function callExpression(fn, attrName, el, args) {
	try {
		const result = fn(...args);
		return result;
	} catch (e) {
		console.error(`🐹 [${attrName}] Runtime error: ${e.message}\n\n`, el);
	}
};
