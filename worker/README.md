# Midnight Munch API Worker

The Cloudflare Worker proxies live recipe searches through Tavily. Provider credentials remain server-side.

## Secret

In Cloudflare Worker **Settings → Variables and Secrets**, add a Production secret named exactly `TAVILY_API_KEY`. Never put the key in GitHub or browser code.

## Endpoints

- `GET /health` checks that the Worker is deployed and reports whether recipe search is configured.
- `POST /search-recipes` accepts `{ "query": "tofu adobo", "limit": 8 }` and returns web results, source links, images where available, and recipe ingredients/instructions extracted from Recipe JSON-LD when the source page exposes it.

The browser calls this Worker from the GitHub Pages app. Results without structured recipe data remain link-and-excerpt results; the app does not invent missing ingredients or steps.

## Deploy

Deploy `worker/index.js` as the `midnight-munch-api` Worker with `wrangler deploy`, or paste the file into the Cloudflare dashboard editor and deploy.
