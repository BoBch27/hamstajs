// Hold currently running effect so auto tracking works
// effects update it, so signal getters see who's listening and register subscribers
let currentEffect = null;

// Create a reactive value
export function createSignal(value) {
	const subscribers = new Set();

	const getter = () => {
		if (currentEffect) {
			subscribers.add(currentEffect);
		}

		return value;
	};

	const setter = (newValue) => {
		value = newValue;
		subscribers.forEach(fn => fn());
	};

	return [getter, setter];
};

// Run passed in func every time signal inside it changes
export function createEffect(fn) {
	const effect = () => {
		currentEffect = effect;
		fn();
		currentEffect = null;
	};

	effect();
};
