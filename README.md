# 🐹 hamsta.js

**Reactive HTML in a squeak!**

Hamsta is a just a tiny mix between [Alpine](https://alpinejs.dev/) and [Solid](https://www.solidjs.com/). **2KB gzipped** of signal-based reactivity that just works.

## Quick start

**CDN (auto-initialises):**
```html
<script src="https://cdn.jsdelivr.net/npm/hamstajs@latest/dist/hamsta.min.js" defer></script>
<!-- disable auto init with disable-auto-init attribute, then call hamsta.init() manually -->

<body>
  <header h-signals="{ name: 'Mr. Whiskers', count: 0 }"></header>

  <!-- Different component, same state (hamster) -->
  <main>
    <!-- h-text: reactive text content -->
    <h1 h-text="`Hello ${s.name}!`"></h1>

    <!-- h-show: toggle visibility -->
    <p h-show="s.count > 0" h-text="`Fed ${s.count} times`"></p>

    <!-- h-class: reactive classes (merged with existing ones) -->
    <p h-class="s.count > 5 ? 'danger' : 'safe'">Hunger level</p>

    <!-- h-style: reactive inline styles -->
    <div h-style="{ color: s.count > 5 ? 'red' : 'green' }">Status</div>

    <!-- h-on{event}: event listeners -->
    <button h-onclick="s.count++" h-disabled="s.count >= 10">Feed the hamster</button>
  </main>

  <!-- SPA/htmx only: clean up like a self-respecting hamster using hamsta.cleanup() -->
</body>
```

**npm (call `init()` manually):**
```bash
npm install hamstajs
```
```js
import hamsta from 'hamstajs';

// initialises h-* directives and dispatches a hamsta:ready event on the document
// returns a cleanup function to clean up all effects and event listeners
const cleanup = hamsta.init();

// later, e.g. on SPA route change:
cleanup();
```

That's it. You're done. Go home.

## Why another framework?

It's **7.5x smaller than Alpine** (2KB vs 15KB) - so tiny it fits in a hamster's cheek pouch. Everything's **global signals only**, so no scope wrestling and stores just work. Also, it's built on **signals** for fine-grained reactivity like Solid, and has a **familiar syntax** if you already know Alpine.

## Directives

These are the tricks our hamster currently knows:

- `h-signals` - declare your reactive state
- `h-text` - reactive text content
- `h-show` - toggle visibility
- `h-class` - reactive class names (string syntax only, and it's merged with existing classes)
- `h-style` - reactive inline styles (object syntax only, e.g. `{ color: 'red' }`)
- `h-on{event}` - event listeners (e.g., `h-onclick`, `h-oninput`)
- `h-{attr}` - reactive attributes (e.g., `h-disabled`, `h-href`)

All directives get `s` (signals) and `el` (current element) in scope. The event directives also get `event`.

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

## Why "hamsta"?

Because it's small, runs on a wheel, and stores things in its cheeks (pouches). 

Also `hamster.js` was taken.

## License

MIT - go nuts!

---

**Is this production ready?**  
It's v0.2.0. Put it in production if you like living dangerously (like [me](https://bobbydonev.com/)).

**Why `s.` everywhere instead of just `count` like Alpine?**  
Explicitness over magic. Alpine uses `with` statements which are slow, break optimisations, and deprecated in strict mode. The `s.` prefix is clear, fast, and you always know where your data comes from.

**Why not just use Alpine/Solid/Vue?**  
Sometimes you just want a bit of reactivity without importing a small country's worth of JavaScript. This is 2KB.

**Can I contribute?**  
Yeah! The whole thing is tiny enough to read in a bathroom break.
