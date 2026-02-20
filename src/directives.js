import { createSignal, createEffect } from "./signals";

export const signals = {};
export const methods = {};
const cleanup = [];

export function init(root = document.body) {
	root.querySelectorAll(`[${signalsAttr}]`).forEach(el => {
		initSignals(el);
		initMethods(el); // methods are only allowed on same element as h-signals
	});

	bindDirectives(root);

	return () => {
		cleanup.forEach(dispose => dispose());
		cleanup.length = 0;
		Object.keys(signals).forEach(key => delete signals[key]);
	};
};

function initSignals(el) {
	const signalsAttr = 'h-signals';

	const expr = el.getAttribute(signalsAttr);
	const fn = parseExpression(`return ${expr}`, signalsAttr, el, []);
	if (!fn) {
		return;
	}

	const data = callExpression(fn, signalsAttr, el, []);
	if (!data) {
		return;
	}

	Object.keys(data).forEach(key => {
		if (signals[key]) {
			console.warn(`🐹 [${signalsAttr}] "${key}" already exists. Skipping.`);
			return;
		}

		const [get, set] = createSignal(data[key]);

		Object.defineProperty(signals, key, {
			get() { return get(); },
			set(val) { set(val); },
			enumerable: true,
			configurable: true
		});
	});
};

function initMethods(el) {
	const methodsAttr = 'h-methods';

	if (!el.hasAttribute(methodsAttr)) {
		return;
	}

	const expr = el.getAttribute(methodsAttr);
	const fn = parseExpression(`return ${expr}`, methodsAttr, el, ['s']);
	if (!fn) {
		return;
	}

	const data = callExpression(fn, methodsAttr, el, [signals]);
	if (!data) {
		return;
	}

	Object.keys(data).forEach(key => {
		if (methods[key]) {
			console.warn(`🐹 [${methodsAttr}] "${key}" already exists. Skipping.`);
			return;
		}

		if (typeof data[key] !== 'function') {
			console.warn(`🐹 [${methodsAttr}] "${key}" must be a function. Skipping.`);
			return;
		}

		methods[key] = data[key];
	});
};

function bindDirectives(root) {
	root.querySelectorAll('*').forEach(el => {
		for (const attr of el.attributes) {
			if (!attr.name.startsWith(`h-`) || attr.name === 'h-signals' ||
				attr.name === 'h-transition-enter' || attr.name === 'h-transition-leave') {
				continue;
			}

			if (attr.name === 'h-methods' && !el.hasAttribute('h-signals')) {
				console.warn(`🐹 [h-methods] should be used on the same element as h-signals. Skipping.`)
				continue;
			}

			const code = attr.value;

			if (attr.name.startsWith('h-on')) {
				const dispose = bindEvent(`return (async () => { ${code} })();`, attr.name, el);
				if (dispose) {
					cleanup.push(dispose);
				}

				continue;
			}

			const fn = parseExpression(`return (${code})`, attr.name, el, ['s', 'm', 'el']);
			if (!fn) {
				continue;
			}

			let dispose;

			if (attr.name === 'h-text') {
				dispose = bindText(fn, attr.name, el);
			} else if (attr.name === 'h-show') {
				dispose = bindShow(fn, attr.name, el);
			} else if (attr.name === 'h-class') {
				dispose = bindClass(fn, attr.name, el);
			} else if (attr.name === 'h-style') {
				dispose = bindStyle(fn, attr.name, el);
			} else {
				dispose = bindAttr(fn, attr.name, el);
			}

			if (dispose) {
				cleanup.push(dispose);
			}
		}
	});
};

function bindEvent(code, attrName, el) {
	const eventName = attrName.slice(4);
	const fn = parseExpression(code, attrName, el, ['event', 's', 'm', 'el']);
	if (!fn) {
		return;
	}

	const handler = (e) => callExpression(fn, attrName, el, [e, signals, methods, el]);
	el.addEventListener(eventName, handler);

	return () => el.removeEventListener(eventName, handler);
};

function bindText(fn, attrName, el) {
	return createEffect(() => {
		const value = callExpression(fn, attrName, el, [signals, methods, el]);
		el.textContent = value ?? '';
	});
};

function bindShow(fn, attrName, el) {
	let originalDisplay = getComputedStyle(el).display;

	// if already hidden, set to empty string to let CSS decide
	if (originalDisplay === 'none') {
		originalDisplay = '';
	}

	const enterClasses = el.getAttribute('h-transition-enter')?.split(' ').filter(c => c);
	const leaveClasses = el.getAttribute('h-transition-leave')?.split(' ').filter(c => c);

	let pendingRaf = null;
	let pendingTransitionEnd = null;

	function cancelPending() {
		if (pendingRaf) {
			cancelAnimationFrame(pendingRaf);
			pendingRaf = null;
		}

		if (pendingTransitionEnd) {
			el.removeEventListener('transitionend', pendingTransitionEnd);
			el.removeEventListener('animationend', pendingTransitionEnd);
			pendingTransitionEnd = null;
		}
	}

	return createEffect(() => {
		const show = callExpression(fn, attrName, el, [signals, methods, el]);

		// cancel in-flight transitions if signal flips before it completes
		cancelPending();

		if (show) {
			el.style.display = originalDisplay;

			if (enterClasses) {
				if (leaveClasses) {
					el.classList.remove(...leaveClasses);
				}

				// delay until after display change (can't transition directly from display: none)
				pendingRaf = requestAnimationFrame(() => {
					pendingRaf = null;
					el.classList.add(...enterClasses);
				});
			}
		} else {
			if (leaveClasses && el.style.display !== 'none') {
				if (enterClasses) {
					el.classList.remove(...enterClasses);
				}

				el.classList.add(...leaveClasses);

				// hide element only once the transition/animation has finished
				pendingTransitionEnd = () => {
					el.style.display = 'none';

					if (leaveClasses) {
						el.classList.remove(...leaveClasses);
					}

					pendingTransitionEnd = null;
				};

				el.addEventListener('transitionend', pendingTransitionEnd, { once: true });
				el.addEventListener('animationend', pendingTransitionEnd, { once: true });
			} else {
				el.style.display = 'none';
			}
		}
	});
};

function bindClass(fn, attrName, el) {
	const originalClasses = el.className.split(' ').filter(c => c);

	return createEffect(() => {
		const value = callExpression(fn, attrName, el, [signals, methods, el]);
		const classes = new Set(originalClasses);

		// only support string expressions for now, e.g. "isActive ? 'bg-blue' : 'bg-white'"
		if (typeof value !== 'string') {
			return;
		}

		value.split(' ').filter(c => c).forEach(c => classes.add(c));
		el.className = Array.from(classes).join(' ');
	});
};

function bindStyle(fn, attrName, el) {
	return createEffect(() => {
		const value = callExpression(fn, attrName, el, [signals, methods, el]);

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
};

function bindAttr(fn, attrName, el) {
	return createEffect(() => {
		const attribute = attrName.slice(2);
		const value = callExpression(fn, attrName, el, [signals, methods, el]);

		if (typeof value === 'boolean') {
			if (value) {
				el.setAttribute(attribute, '');
			} else {
				el.removeAttribute(attribute);
			}
		} else if (value == null) {
			el.removeAttribute(attribute);
		} else {
			el.setAttribute(attribute, value);
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
		if (result instanceof Promise) {
			result.catch(e => console.error(`🐹 [${attrName}] Async error: ${e.message}\n\n`, el));
		}

		return result;
	} catch (e) {
		console.error(`🐹 [${attrName}] Runtime error: ${e.message}\n\n`, el);
	}
};
