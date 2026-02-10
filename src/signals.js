// Hold currently running effect so auto tracking works
// effects update it, so signal getters see who's listening and register subscribers
let currentEffect = null;

// Create a reactive value
export function createSignal(value) {
	const subscribers = new Set();

	const getter = () => {
		if (currentEffect) {
			subscribers.add(currentEffect);

			currentEffect.dependencies.add(() => {
				subscribers.delete(currentEffect);
			});
		}

		return value;
	};

	const setter = (newValue) => {
		// skip update if value hasn't changed
		if (Object.is(value, newValue)) {
			return;
		}

		value = newValue;
		subscribers.forEach(effect => effect());
	};

	return [getter, setter];
};

// Run passed in func every time signal inside it changes
export function createEffect(fn) {
	const effect = () => {
		// clear old dependencies
		effect.dependencies.forEach(cleanup => cleanup());
		effect.dependencies.clear();

		currentEffect = effect;
		fn();
		currentEffect = null;
	};

	effect.dependencies = new Set();
	effect();
};
