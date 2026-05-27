# GTA 6 Price & Countdown Tracker

Unofficial fan-made GTA 6 tracker built with Astro and Tailwind CSS.

## Features

- Static SEO pages for countdown, price, pre-order status, history and about.
- Local JSON data under `src/data`.
- Daily source freshness checker for official Rockstar and PlayStation pages.
- Conservative status handling: prices and pre-orders stay unconfirmed until official sources confirm them.

## Commands

```powershell
npm install
npm test
npm run check:sources
npm run build
npm run dev
```

## Cloudflare Pages

Recommended settings:

- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `24`

Deploy with Wrangler:

```powershell
npm run deploy:cloudflare
```

## Disclaimer

This is an unofficial fan-made tracker and is not affiliated with Rockstar Games or Take-Two Interactive.
