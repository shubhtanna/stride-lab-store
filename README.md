# Stride Lab storefront

Online store for Stride Lab, a running and sneaker shop in Bengaluru.

> This is a demo store. No real orders, payments or shipments are processed.

Built with React 19, Vite, React Router and Tailwind CSS. The catalogue is served from `public/api/products.json`; the cart is kept in the browser.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

Deployed on Vercel. `vercel.json` sends every route to `index.html` so client-side routing works on refresh.

## Structure

| Path | What's there |
|---|---|
| `src/pages` | Home, shop (filters, sort, search), product, checkout, order confirmation, info pages |
| `src/components` | Header, footer, cart drawer, product card |
| `src/context/CartContext.tsx` | Cart state, saved to `localStorage` |
| `src/lib/api.ts` | Catalogue loading |
| `public/api/products.json` | Product catalogue |

Product photos from [Unsplash](https://unsplash.com).
