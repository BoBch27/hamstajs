# 🐹 hamsta.js

**Reactive HTML in a squeak!**

Hamsta is a just a tiny mix between [Alpine](https://alpinejs.dev/) and [Solid](https://www.solidjs.com/). **2KB (gzipped)** of signal-based reactivity that just works.

## Quick start

**CDN (auto-initialises):**
```html
<script src="https://cdn.jsdelivr.net/npm/hamstajs@latest/dist/hamsta.min.js" defer></script>
<!-- disable auto init with disable-auto-init attribute, then call hamsta.init() manually -->

<body>
  <!-- h-methods and h-init must live on the same element as h-signals -->
  <header
    h-signals="{ name: 'Mr. Whiskers', count: 0 }"
    h-methods="{ increment: () => s.count++ }"
    h-init="const res = await fetch('/api/count'); s.count = await res.json()"
  ></header>

  <!-- Different component, same state (hamster) -->
  <main>
    <!-- h-text: reactive text content -->
    <h1 h-text="`Hello ${s.name}!`"></h1>

    <!-- h-show: toggle visibility -->
    <p h-show="s.count > 0" h-text="`Fed ${s.count} times`"></p>

    <!-- h-show with transitions: fade-in/out are your own CSS classes (transitions, animations, tailwind, etc) -->
    <!-- tip: add style="display: none" to prevent flash of content before hamsta initialises -->
    <p
      style="display: none"
      h-show="s.count > 5"
      h-transition-enter="fade-in"
      h-transition-leave="fade-out"
    >
      Getting full...
    </p>

    <!-- h-class: reactive classes (merged with existing ones) -->
    <p h-class="s.count > 5 ? 'danger' : 'safe'">Hunger level</p>

    <!-- h-style: reactive inline styles -->
    <div h-style="{ color: s.count > 5 ? 'red' : 'green' }">Status</div>

    <!-- h-on{event}: event listeners (supports async/await) -->
    <button h-onclick="m.increment()" h-disabled="s.count >= 10">Feed the hamster</button>
  </main>

  <!-- SPA/htmx only: clean up like any self-respecting hamster using hamsta.cleanup() -->
</body>
```

**npm (call `init()` manually):**
```bash
npm install hamstajs
```
```js
import hamsta from 'hamstajs';

// initialises h-* directives and dispatches a hamsta:ready event on the document
// returns a cleanup function to reset effects, listeners, and signals and methods declared via h-signals
const cleanup = hamsta.init();

// tear down effects and listeners only - use this for partial swaps (e.g. htmx partial update)
cleanup();

// full reset including signals and methods - use this for full page swaps or SPA route changes
cleanup(true);
```

That's it. You're done. Go home.

## Why another framework?

It's **7.5x smaller than Alpine** (2KB vs 15KB) - so tiny it fits in a hamster's cheek pouch. Everything's **global signals only**, so no scope wrestling and stores just work. Also, it's built on **signals** for fine-grained reactivity like Solid, and has a **familiar syntax** if you already know Alpine.

## Directives

These are the tricks our hamster currently knows:

- `h-signals` - declare your reactive state
- `h-methods` - define reusable methods (must be on same element as `h-signals`)
- `h-init` - run code once after signals and methods are ready (must be on same element as `h-signals`) - supports async/await
- `h-text` - reactive text content
- `h-show` - toggle visibility
- `h-transition-enter` - classes to add when element is shown (used with `h-show`)
- `h-transition-leave` - classes to add when element is hidden (used with `h-show`)
- `h-class` - reactive class names (merged with existing classes)
- `h-style` - reactive inline styles (object syntax only, e.g. `{ color: 'red' }`)
- `h-on{event}` - event listeners (e.g., `h-onclick`, `h-oninput`) - supports async/await
- `h-{attr}` - reactive attributes (e.g., `h-disabled`, `h-href`)

All directives get `s` (signals), `m` (methods) and `el` (current element) in scope. The event directives also get `event`.

## JS API (optional)

Works like Solid's primitives if you need to get fancy.

```js
import { createSignal, createEffect } from 'hamstajs';

const [count, setCount] = createSignal(0);

createEffect(() => {
  console.log('Count is now: ', count());
});

setCount(42); // logs: "Count is now: 42"
```

You can also access and mutate signals and methods programmatically after init:

```js
import { signals, methods } from 'hamstajs';

// always access as signals.key - never destructure, as reactivity will be lost
console.log(signals.count);
signals.count = 42;

// call methods directly
methods.increment();
```

## Why "hamsta"?

Because it's small, runs on a wheel, and stores things in its cheeks (pouches). 

Also `hamster.js` was taken.

## License

MIT - go nuts!

---

**Is this production ready?**  
It's v0.3.1. Put it in production if you like living dangerously (like [me](https://bobbydonev.com/)).

**Why `s.` everywhere instead of just `count` like Alpine?**  
Explicitness over magic. Alpine uses `with` statements which are slow, break optimisations, and deprecated in strict mode. The `s.` prefix is clear, fast, and you always know where your data comes from.

**Why not just use Alpine/Solid/Vue?**  
Sometimes you just want a bit of reactivity without importing a small country's worth of JavaScript. Especially when you have a server-rendered HTML that needs a sprinkle of reactivity (like htmx, Rails, Laravel, Django, etc). For fully dynamic UIs built mostly on the client (browser), you're better off with Alpine or a proper SPA framework.

**Why must `h-methods` and `h-init` live on the same element as `h-signals`?**  
To encourage [Locality of Behaviour](https://htmx.org/essays/locality-of-behaviour/), where we keep state, behaviour, and setup together and easy to reason about. Since methods and initialisation code are directly tied to the signals they work with, hamsta enforces this by only allowing `h-methods` and `h-init` on the same element as `h-signals`.

**Does it work with CSP?**  
Hamsta uses `new Function()` under the hood to evaluate directive expressions, which requires `unsafe-eval` in your CSP. If you have a strict CSP, it won't work out of the box.

**Can I contribute?**  
Yeah! The whole thing is tiny enough to read in a bathroom break.
