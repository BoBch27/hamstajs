# 🐹 hamsta.js

**Reactive HTML in a squeak!**

Hamsta is a just a tiny mix between [Alpine](https://alpinejs.dev/) and [Solid](https://www.solidjs.com/). **2KB (gzipped)** of signal-based reactivity that just works.

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

    <!-- h-show with transitions: fade-in/out are your own CSS classes (transitions, animations, tailwind, etc) -->
    <!-- add style="display: none" to prevent flash of content before hamsta initialises -->
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
    <button 
      h-onclick="await fetch('/feed', { method: 'POST' }); s.count++" 
      h-disabled="s.count >= 10"
    >
      Feed the hamster
    </button>
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
// returns a cleanup function to reset effects, listeners and signals declared via h-signals
const cleanup = hamsta.init();

// later, e.g. on a route change:
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
- `h-transition-enter` - classes to add when element is shown (used with `h-show`)
- `h-transition-leave` - classes to add when element is hidden (used with `h-show`)
- `h-class` - reactive class names (merged with existing classes)
- `h-style` - reactive inline styles (object syntax only, e.g. `{ color: 'red' }`)
- `h-on{event}` - event listeners (e.g., `h-onclick`, `h-oninput`) - supports async/await
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
It's v0.3.0. Put it in production if you like living dangerously (like [me](https://bobbydonev.com/)).

**Why `s.` everywhere instead of just `count` like Alpine?**  
Explicitness over magic. Alpine uses `with` statements which are slow, break optimisations, and deprecated in strict mode. The `s.` prefix is clear, fast, and you always know where your data comes from.

**Why not just use Alpine/Solid/Vue?**  
Sometimes you just want a bit of reactivity without importing a small country's worth of JavaScript. Especially when you have a server-rendered HTML that needs a sprinkle of reactivity (like htmx, Rails, Laravel, Django, etc). For fully dynamic UIs built mostly on the client (browser), you're better off with Alpine or a proper SPA framework.

**Can I contribute?**  
Yeah! The whole thing is tiny enough to read in a bathroom break.
