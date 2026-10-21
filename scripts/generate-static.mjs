// Build-time generator: turns the static catalogue into plain HTML pages that
// AI agents (and no-JS browsers) can read. Runs after `vite build` and writes
// into dist/. Reuses the site's compiled stylesheet and header/footer markup.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const dist = join(root, 'dist')

const catalog = JSON.parse(readFileSync(join(root, 'public/api/products.json'), 'utf8'))
const products = catalog.products

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const money = (n) => inr.format(n)
const effectivePrice = (p) => p.salePrice ?? p.price
const inStock = (p) => p.sizes.some((s) => s.inStock)
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// --- shared head/header/footer, mirroring index.html, Header.tsx, Footer.tsx ---
const builtIndex = readFileSync(join(dist, 'index.html'), 'utf8')
const headAssets = builtIndex
  .match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/<script type="module"[^>]*><\/script>/g, '')
  .trim()

const header = (cartHref = '/shop/') => `
    <header class="sticky top-0 z-40">
      <div class="bg-ink text-center text-xs font-medium tracking-wide text-white">
        <p class="px-4 py-2">Free shipping on orders over ${money(1999)} &middot; Easy 15-day returns</p>
      </div>
      <div class="border-b border-line bg-paper/95 backdrop-blur">
        <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <a href="/" class="font-display text-2xl font-black uppercase italic">Stride<span class="text-ink/40">/</span>Lab</a>
          <nav class="ml-8 hidden gap-6 lg:flex">
            <a href="/shop/" class="text-sm font-semibold text-ink hover:text-ink/60">Shop all</a>
            <a href="/shop/?category=running" class="text-sm font-semibold text-ink hover:text-ink/60">Running</a>
            <a href="/shop/?category=lifestyle" class="text-sm font-semibold text-ink hover:text-ink/60">Lifestyle</a>
            <a href="/shop/?category=basketball" class="text-sm font-semibold text-ink hover:text-ink/60">Basketball</a>
            <a href="/shop/?sale=1" class="text-sm font-semibold text-sale">Sale</a>
          </nav>
          <a href="${cartHref}" class="ml-auto text-sm font-semibold">Cart</a>
        </div>
      </div>
    </header>`

const footer = () => `
    <footer class="mt-24 bg-ink text-white">
      <div class="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div class="md:col-span-2">
          <p class="font-display text-3xl font-black uppercase italic">Stride/Lab</p>
          <p class="mt-3 max-w-sm text-sm text-white/60">
            Running and sneaker store from Bengaluru. Authentic pairs from the brands you love, shipped across India.
          </p>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-white/40">Shop</p>
          <ul class="mt-4 space-y-2 text-sm">
            <li><a href="/shop/?category=running">Running</a></li>
            <li><a href="/shop/?category=lifestyle">Lifestyle</a></li>
            <li><a href="/shop/?category=basketball">Basketball</a></li>
            <li><a href="/shop/?sale=1">Sale</a></li>
          </ul>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-white/40">Help</p>
          <ul class="mt-4 space-y-2 text-sm">
            <li><a href="/help">Shipping &amp; returns</a></li>
            <li><a href="/help#sizing">Size guide</a></li>
            <li><a href="/about">About us</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-white/10">
        <p class="mx-auto max-w-7xl px-4 py-6 text-xs text-white/40 sm:px-6">
          &copy; ${new Date().getFullYear()} Stride Lab &middot; Bengaluru, India &middot; Demo store: no real orders or payments are processed.
        </p>
      </div>
    </footer>`

const page = (title, body, extraHead = '', cartHref = '/shop/') => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${headAssets}
    <title>${esc(title)}</title>
    ${extraHead}
  </head>
  <body>
${header(cartHref)}
    <main>
${body}
    </main>
${footer()}
  </body>
</html>`

// --- plain-HTML product list, injected into the SPA shell for agents ---
const card = (p) => `        <li>
          <a href="/products/${p.handle}/">
            <img src="${esc(p.image)}" alt="${esc(`${p.brand} ${p.name}`)}" width="450" height="450" class="aspect-square w-full rounded-2xl bg-white object-cover" />
            <p class="mt-3 text-xs font-medium uppercase tracking-wide text-muted">${esc(p.brand)} · ${esc(p.category)}</p>
            <h2 class="font-display text-lg font-bold leading-tight">${esc(p.name)}</h2>
            <p class="text-sm text-muted">${esc(p.colour)}</p>
            <p class="mt-1 font-semibold">${money(effectivePrice(p))}</p>
            <p class="mt-1 text-xs text-muted">${inStock(p) ? 'In stock' : 'Out of stock'}</p>
          </a>
        </li>`

const productList = (heading) => `      <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 class="font-display text-4xl font-black uppercase italic md:text-5xl">${esc(heading)}</h1>
        <p class="mt-2 text-sm text-muted">${products.length} products &middot; prices in INR</p>
        <ul class="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
${products.map(card).join('\n')}
        </ul>
      </section>`

// The React app clears #root when it boots, so humans see no change.
const spaPage = (title, rootHtml) =>
  builtIndex
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<div id="root"><\/div>/, `<div id="root">\n${rootHtml}\n      </div>`)

// --- product page ---
const productLd = (p) => {
  const url = `/products/${p.handle}/`
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${p.brand} ${p.name}`,
    description: p.description,
    image: p.image,
    sku: p.id,
    url,
    offers: {
      '@type': 'Offer',
      price: effectivePrice(p),
      priceCurrency: 'INR',
      availability: inStock(p) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
    },
    category: p.category,
  }
  return `    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`
}

const productBody = (p) => `      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div class="grid gap-10 md:grid-cols-2 lg:gap-16">
          <div class="aspect-square overflow-hidden rounded-3xl bg-white">
            <img src="${esc(p.image)}" alt="${esc(`${p.brand} ${p.name} in ${p.colour}`)}" class="h-full w-full object-cover" />
          </div>
          <div>
            <p class="text-sm font-semibold uppercase tracking-widest text-muted">${esc(p.brand)} · ${esc(p.category)}</p>
            <h1 class="font-display mt-1 text-4xl font-black uppercase italic md:text-5xl">${esc(p.name)}</h1>
            <p class="mt-1 text-muted">${esc(p.colour)}</p>
            <div class="mt-6 flex items-baseline gap-3">
              <p class="text-2xl font-bold${p.salePrice ? ' text-sale' : ''}">${money(effectivePrice(p))}</p>
              ${p.salePrice ? `<p class="text-muted line-through">${money(p.price)}</p>` : ''}
            </div>
            <p class="text-xs text-muted">MRP inclusive of all taxes</p>
            <p class="mt-4 text-sm font-semibold">${inStock(p) ? 'In stock' : 'Out of stock'}</p>
            <p class="mt-6 text-sm leading-relaxed text-ink/80">${esc(p.description)}</p>
            <ul class="mt-4 space-y-1.5 text-sm">
              ${p.features.map((f) => `<li>${esc(f)}</li>`).join('\n              ')}
            </ul>
            <p class="mt-4 text-xs text-muted">Style code: ${esc(p.id)}</p>
            <a href="/buy/${p.handle}/" class="mt-6 inline-block rounded-full bg-ink px-8 py-4 text-sm font-bold uppercase tracking-wide text-white hover:bg-ink/85">Add to cart</a>
            <p class="mt-6 text-sm"><a href="/shop/" class="underline">Continue shopping</a></p>
          </div>
        </div>
      </div>`

// --- cart page (/buy/<slug>/) and checkout page (/checkout/<slug>/) ---
const cartBody = (p) => `      <div class="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 class="font-display text-4xl font-black uppercase italic">Your cart</h1>
        <ul class="mt-6 divide-y divide-line">
          <li class="flex items-center justify-between gap-4 py-4">
            <div>
              <p class="font-semibold">${esc(`${p.brand} ${p.name}`)}</p>
              <p class="text-sm text-muted">${esc(p.colour)} &middot; Quantity: 1</p>
            </div>
            <p class="font-semibold">${money(effectivePrice(p))}</p>
          </li>
        </ul>
        <p class="mt-4 text-sm font-semibold">Subtotal: ${money(effectivePrice(p))}</p>
        <a href="/checkout/${p.handle}/" class="mt-8 inline-block rounded-full bg-ink px-8 py-4 text-sm font-bold uppercase tracking-wide text-white hover:bg-ink/85">Checkout</a>
        <p class="mt-4 text-sm"><a href="/products/${p.handle}/" class="underline">Back to ${esc(p.name)}</a></p>
      </div>`

const checkoutBody = (p) => `      <div class="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 class="font-display text-4xl font-black uppercase italic">Checkout</h1>
        <h2 class="mt-8 font-semibold">Order summary</h2>
        <ul class="mt-4 divide-y divide-line">
          <li class="flex items-center justify-between gap-4 py-4">
            <div>
              <p class="font-semibold">${esc(`${p.brand} ${p.name}`)}</p>
              <p class="text-sm text-muted">${esc(p.colour)} &middot; Quantity: 1</p>
            </div>
            <p class="font-semibold">${money(effectivePrice(p))}</p>
          </li>
        </ul>
        <dl class="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div class="flex justify-between"><dt>Subtotal</dt><dd>${money(effectivePrice(p))}</dd></div>
          <div class="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>${money(effectivePrice(p))}</dd></div>
        </dl>
        <p class="mt-6 text-sm text-muted">The checkout form (contact, delivery address and payment) loads on this page.</p>
      </div>`

// --- write everything ---
for (const dir of ['products', 'buy', 'checkout', 'shop']) {
  rmSync(join(dist, dir), { recursive: true, force: true })
}

writeFileSync(join(dist, 'index.html'), spaPage('Stride Lab – Sneakers & Running Shoes Online in India', productList('All shoes')))

mkdirSync(join(dist, 'shop'), { recursive: true })
writeFileSync(join(dist, 'shop', 'index.html'), spaPage('Shop all | Stride Lab', productList('All shoes')))

for (const p of products) {
  const productDir = join(dist, 'products', p.handle)
  mkdirSync(productDir, { recursive: true })
  writeFileSync(
    join(productDir, 'index.html'),
    page(`${p.brand} ${p.name} – ${p.colour} | Stride Lab`, productBody(p), productLd(p)),
  )

  const buyDir = join(dist, 'buy', p.handle)
  mkdirSync(buyDir, { recursive: true })
  writeFileSync(join(buyDir, 'index.html'), page(`Your cart | Stride Lab`, cartBody(p), '', `/buy/${p.handle}/`))

  const checkoutDir = join(dist, 'checkout', p.handle)
  mkdirSync(checkoutDir, { recursive: true })
  writeFileSync(join(checkoutDir, 'index.html'), spaPage(`Checkout | Stride Lab`, checkoutBody(p)))
}

const sitemapUrls = ['/', '/shop/', ...products.map((p) => `/products/${p.handle}/`)]
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
)

writeFileSync(
  join(dist, 'llms.txt'),
  `# Stride Lab

Stride Lab is a sneaker and running-shoe store from Bengaluru, India, selling authentic pairs from brands like Nike and Adidas, shipped across India. Prices are in INR.

## Products

${products.map((p) => `- [${p.brand} ${p.name}](${`/products/${p.handle}/`}): ${money(effectivePrice(p))}`).join('\n')}

## How to buy

- Browse the full catalogue at \`/shop/\` or open any product page listed above; each page shows the price, description, image and stock status.
- To buy a shoe, follow its "Add to cart" link, which is \`/buy/<slug>/\` (for example \`/buy/${products[0].handle}/\`). That cart page holds the item with quantity 1.
- From the cart page, follow the "Checkout" link, which is \`/checkout/<slug>/\`. That link is shareable: it opens the same order summary on any device without cookies, and the checkout form on that page completes the order.
`,
)

console.log(`generate-static: ${products.length} product pages, ${products.length} cart pages, ${products.length} checkout pages, sitemap.xml, llms.txt, homepage + /shop/ lists`)
