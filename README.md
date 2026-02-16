# 🐹 hamsta.js

**Sprinkle some reactivity and put your HTML on the wheel.**

Hamsta is a just a tiny mix between [Alpine](https://alpinejs.dev/) and [Solid](https://www.solidjs.com/). **~1KB gzipped** of signal-based reactivity that just works.

## Quick start

**CDN (auto-initialises):**
```html
<script src="https://cdn.jsdelivr.net/npm/hamstajs@latest/dist/hamsta.min.js" defer></script>
<!-- You can disable auto init using `disable-auto-init` attribute on the same script tag -->

<body>
  <header h-signals="{ name: 'Whiskers', count: 0 }" h-text="`Hello ${s.name}!`"></header>

  <!-- Different component, same state -->
  <main>
    <p h-text="s.count"></p>
    <button h-onclick="s.count++">Feed the hamster</button>
  </main>
  
  <!-- Another component, state is still here -->
  <footer h-show="s.count > 5">
    Wow, ${s.name}, you ate a lot!
  </footer>
</body>
```

**npm (call `init()` manually):**
```bash
npm install hamstajs
```
```js
import hamsta from 'hamstajs';

// initialises h-* directives and dispatches a hamsta:ready event on the document
hamsta.init();
```

That's it. You're done. Go home.

## Why another framework?

It's **15x smaller than Alpine** (1KB vs 15KB) - so tiny it fits in a hamster's cheek pouch. Everything's **global signals only**, so no scope wrestling and stores just work. Also, it's built on **signals** for fine-grained reactivity like Solid, and has a **familiar syntax** if you already know Alpine.

## Directives

These are the tricks our hamster currently knows:

- `h-signals` - declare your reactive state
- `h-text` - reactive text content
- `h-show` - toggle visibility
- `h-on{event}` - event listeners (e.g., `h-onclick`, `h-oninput`)

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

Because it's small, runs on a wheel, and stores things in its cheeks. 

Also `hamster.js` was taken.

## License

MIT - go nuts!

---

**Is this production ready?**  
It's v0.1.0. Put it in production if you like living dangerously (like [me](https://bobbydonev.com/)).

**Why `s.` everywhere instead of just `count` like Alpine?**  
Explicitness over magic. Alpine uses `with` statements which are slow, break optimisations, and deprecated in strict mode. The `s.` prefix is clear, fast, and you always know where your data comes from.

**Why not just use Alpine/Solid/Vue?**  
Sometimes you just want a bit of reactivity without importing a small country's worth of JavaScript. This is 1KB.

**Can I contribute?**  
Yeah! The whole thing is tiny enough to read in a bathroom break.
