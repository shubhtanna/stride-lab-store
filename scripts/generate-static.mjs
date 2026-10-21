// Build-time generator: turns the catalogue in public/api/products.json into
// plain HTML pages (product pages, cart, checkout), sitemap.xml and llms.txt
// so AI shopping agents can read the store without JavaScript. The React app
// keeps working as before: generated pages reuse the built index.html shell,
// and the app replaces the static content inside #root when JavaScript runs.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const catalog = JSON.parse(readFileSync(join(root, 'public/api/products.json'), 'utf8'))
const shell = readFileSync(join(dist, 'index.html'), 'utf8')

// Absolute URLs come from the environment when the host provides one;
// otherwise root-relative URLs are emitted.
const SITE_URL = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const money = (n) => inr.format(n)
const effectivePrice = (p) => p.salePrice ?? p.price
const inStock = (p) => p.sizes.some((s) => s.inStock)
const productPath = (p) => `/products/${p.handle}/`
const abs = (u) => (SITE_URL ? SITE_URL + u : u)
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const products = catalog.products
const FREE_SHIPPING_FROM = 1999
const SHIPPING_FEE = 99
const shippingFor = (subtotal) => (subtotal >= FREE_SHIPPING_FROM ? 'Free' : money(SHIPPING_FEE))

// Wrap static body content in a copy of the built SPA shell. `withApp` keeps
// the app script so React takes over the page in the browser; without it the
// page stays purely static.
function page({ title, description, jsonLd, body, withApp }) {
  let html = shell.replace('<title>Stride Lab</title>', `<title>${esc(title)}</title>`)
  const head = [
    description ? `<meta name="description" content="${esc(description)}" />` : '',
    jsonLd ? `<script type="application/ld+json">\n    ${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}\n    </script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ')
  if (head) html = html.replace('</head>', `    ${head}\n  </head>`)
  if (!withApp) html = html.replace(/<script type="module"[^>]*><\/script>\s*/, '')
  return html.replace('<div id="root"></div>', `<div id="root">\n${body}\n    </div>`)
}

function write(relPath, content) {
  const file = join(dist, relPath)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
}

// --- Plain HTML product list used on the homepage and the shop page ---------
function productList(items) {
  const cards = items
    .map(
      (p) => `      <li>
        <a href="${productPath(p)}">
          <div class="relative aspect-square overflow-hidden rounded-2xl bg-white">
            <img src="${esc(p.image)}" alt="${esc(`${p.brand} ${p.name}`)}" class="h-full w-full object-cover" />
          </div>
          <div class="mt-3 flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-muted">${esc(p.brand)}</p>
              <p class="font-display text-lg font-bold leading-tight">${esc(p.name)}</p>
              <p class="text-sm text-muted">${esc(p.colour)}</p>
            </div>
            <div class="text-right">
              ${
                p.salePrice
                  ? `<p class="font-semibold text-sale">${money(p.salePrice)}</p>
              <p class="text-xs text-muted line-through">${money(p.price)}</p>`
                  : `<p class="font-semibold">${money(p.price)}</p>`
              }
            </div>
          </div>
        </a>
      </li>`,
    )
    .join('\n')
  return `    <ul class="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
${cards}
    </ul>`
}

// --- Homepage ---------------------------------------------------------------
write(
  'index.html',
  page({
    title: 'Sneakers & Running Shoes Online in India | Stride Lab',
    description:
      'Stride Lab sells authentic running shoes and sneakers from Nike and Adidas, shipped across India in 2–4 days.',
    withApp: true,
    body: `    <main>
      <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 class="font-display text-4xl font-black uppercase italic md:text-5xl">Stride Lab — sneakers &amp; running shoes online in India</h1>
        <p class="mt-3 max-w-md text-muted">Daily trainers, race-day rockets and the classics you'll wear every day. Authentic pairs, delivered in 2–4 days.</p>
      </section>
      <section class="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <h2 class="font-display text-3xl font-black uppercase italic">All shoes</h2>
${productList(products)}
      </section>
    </main>`,
  }),
)

// --- Shop / listing page ----------------------------------------------------
write(
  'shop/index.html',
  page({
    title: 'Shop all shoes | Stride Lab',
    description: `Browse all ${products.length} shoes at Stride Lab — running, training and lifestyle sneakers with free shipping over ${money(FREE_SHIPPING_FROM)}.`,
    withApp: true,
    body: `    <main class="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 class="font-display text-4xl font-black uppercase italic md:text-5xl">All shoes</h1>
      <p class="mt-2 text-sm text-muted">${products.length} products</p>
${productList(products)}
    </main>`,
  }),
)

// --- One static page per product --------------------------------------------
for (const p of products) {
  const price = effectivePrice(p)
  const available = inStock(p)
  const catName = catalog.categories.find((c) => c.slug === p.category)?.name ?? p.category
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${p.brand} ${p.name}`,
    description: p.description,
    image: p.image,
    sku: p.id,
    url: abs(productPath(p)),
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'INR',
      availability: available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: abs(productPath(p)),
    },
  }

  write(
    `products/${p.handle}/index.html`,
    page({
      title: `${p.brand} ${p.name} – ${p.colour} | Stride Lab`,
      description: p.description,
      jsonLd,
      withApp: true,
      body: `    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav class="mb-6 flex items-center gap-1 text-xs text-muted">
        <a href="/">Home</a> › <a href="/shop/?category=${esc(p.category)}">${esc(catName)}</a> › <span class="text-ink">${esc(p.name)}</span>
      </nav>
      <div class="grid gap-10 md:grid-cols-2 lg:gap-16">
        <div class="aspect-square overflow-hidden rounded-3xl bg-white">
          <img src="${esc(p.image)}" alt="${esc(`${p.brand} ${p.name} in ${p.colour}`)}" class="h-full w-full object-cover" />
        </div>
        <div>
          <p class="text-sm font-semibold uppercase tracking-widest text-muted">${esc(p.brand)}</p>
          <h1 class="font-display mt-1 text-4xl font-black uppercase italic md:text-5xl">${esc(p.name)}</h1>
          <p class="mt-1 text-muted">${esc(p.colour)}</p>
          <div class="mt-6 flex items-baseline gap-3">
            <p class="text-2xl font-bold${p.salePrice ? ' text-sale' : ''}">${money(price)}</p>
            ${p.salePrice ? `<p class="text-muted line-through">${money(p.price)}</p>` : ''}
          </div>
          <p class="mt-1 text-xs text-muted">MRP inclusive of all taxes</p>
          <p class="mt-3 text-sm font-semibold">${available ? 'In stock' : 'Out of stock'}</p>
          <a href="/buy/${p.handle}/" class="mt-6 inline-block rounded-full bg-ink px-8 py-4 text-sm font-bold uppercase tracking-wide text-white">Add to cart</a>
          <div class="mt-8">
            <p class="font-semibold">About this shoe</p>
            <p class="mt-2 text-sm leading-relaxed text-ink/80">${esc(p.description)}</p>
            <ul class="mt-4 space-y-1.5 text-sm">
${p.features.map((f) => `              <li>${esc(f)}</li>`).join('\n')}
            </ul>
            <p class="mt-4 text-xs text-muted">Style code: ${esc(p.id)}</p>
          </div>
        </div>
      </div>
    </main>`,
    }),
  )
}

// --- Cart page for agents (one product, quantity 1) --------------------------
for (const p of products) {
  const subtotal = effectivePrice(p)
  const shipping = shippingFor(subtotal)
  write(
    `buy/${p.handle}/index.html`,
    page({
      title: 'Your cart | Stride Lab',
      withApp: false,
      body: `    <main class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 class="font-display text-4xl font-black uppercase italic">Your cart</h1>
      <ul class="mt-8 divide-y divide-line">
        <li class="flex gap-4 py-4">
          <img src="${esc(p.image)}" alt="${esc(`${p.brand} ${p.name}`)}" class="h-20 w-20 rounded-lg object-cover" />
          <div class="flex-1">
            <p class="font-semibold">${esc(p.name)}</p>
            <p class="text-sm text-muted">${esc(p.brand)} · ${esc(p.colour)} · Qty 1</p>
          </div>
          <p class="font-semibold">${money(subtotal)}</p>
        </li>
      </ul>
      <dl class="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <div class="flex justify-between"><dt>Subtotal</dt><dd>${money(subtotal)}</dd></div>
        <div class="flex justify-between"><dt>Shipping</dt><dd>${shipping}</dd></div>
        <div class="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>${money(subtotal + (shipping === 'Free' ? 0 : SHIPPING_FEE))}</dd></div>
      </dl>
      <p class="mt-8">
        <a href="/checkout/${p.handle}/?items=${p.handle}:1" class="inline-block rounded-full bg-ink px-8 py-4 text-sm font-bold uppercase tracking-wide text-white">Checkout</a>
        <a href="/shop/" class="ml-4 text-sm underline">Continue shopping</a>
      </p>
    </main>`,
    }),
  )
}

// --- Shareable checkout page (order summary in plain HTML) -------------------
for (const p of products) {
  const subtotal = effectivePrice(p)
  const shipping = shippingFor(subtotal)
  write(
    `checkout/${p.handle}/index.html`,
    page({
      title: 'Checkout | Stride Lab',
      withApp: true,
      body: `    <main class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 class="font-display text-4xl font-black uppercase italic">Checkout</h1>
      <section class="mt-8 max-w-md rounded-3xl bg-white p-6">
        <h2 class="font-semibold">Order summary</h2>
        <ul class="mt-4 divide-y divide-line">
          <li class="flex gap-3 py-3">
            <img src="${esc(p.image)}" alt="${esc(`${p.brand} ${p.name}`)}" class="h-16 w-16 rounded-lg object-cover" />
            <div class="flex-1 text-sm">
              <p class="font-semibold">${esc(p.name)}</p>
              <p class="text-muted">Qty 1</p>
            </div>
            <p class="text-sm font-semibold">${money(subtotal)}</p>
          </li>
        </ul>
        <dl class="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div class="flex justify-between"><dt>Subtotal</dt><dd>${money(subtotal)}</dd></div>
          <div class="flex justify-between"><dt>Shipping</dt><dd>${shipping}</dd></div>
          <div class="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>${money(subtotal + (shipping === 'Free' ? 0 : SHIPPING_FEE))}</dd></div>
        </dl>
      </section>
    </main>`,
    }),
  )
}

// --- sitemap.xml -------------------------------------------------------------
const sitemapUrls = ['/', '/shop/', ...products.map(productPath)]
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((u) => `  <url><loc>${abs(u)}</loc></url>`).join('\n')}
</urlset>
`,
)

// --- llms.txt ----------------------------------------------------------------
write(
  'llms.txt',
  `# Stride Lab

Sneaker and running-shoe store from Bengaluru, India, selling authentic Nike and Adidas pairs with 2–4 day delivery across India and free shipping over ${money(FREE_SHIPPING_FROM)}.

## Products

${products.map((p) => `- [${p.brand} ${p.name}](${productPath(p)}): ${money(effectivePrice(p))}`).join('\n')}

## How to buy

1. Open a product page (for example ${productPath(products[0])}) and follow its "Add to cart" link.
2. The cart page at /buy/<product>/ shows the item with quantity 1 and a "Checkout" link.
3. The "Checkout" link goes to /checkout/<product>/ — a shareable link that opens the same item on any device without cookies, where the shopper fills in delivery details and payment to place the order. The checkout page also accepts /checkout?items=<handle>:<qty>,… for multiple items.
`,
)

console.log(
  `generate-static: wrote ${products.length} product pages, ${products.length} cart pages, ${products.length} checkout pages, homepage, shop page, sitemap.xml and llms.txt${SITE_URL ? ` (absolute URLs with ${SITE_URL})` : ' (root-relative URLs)'}.`,
)
