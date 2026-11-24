# Midnight Munch API Worker

This Worker keeps the Gemini API key server-side and generates weekly meal plans.

## Cloudflare dashboard setup

1. Open the `midnight-munch-api` Worker.
2. Choose **Edit code** and replace the starter `worker.js` contents with `worker/index.js` from this repository.
3. Open **Settings → Variables and Secrets**. Confirm there is a Production **Secret** named exactly `GEMINI_API_KEY`.
4. Deploy the edited Worker.
5. Test `https://midnight-munch-api.yuripremiums.workers.dev/health` and expect `{"ok":true,"service":"midnight-munch-api"}`.

The Worker allows requests only from `https://slydum.github.io` and local Vite development. It uses Gemini 3.8 Flash through the Gemini API. Do not put the secret in the repository or website code.

## Endpoint

`POST /generate-meals` accepts household settings, selected dates, selected meal types, portions, diet, allergies, exclusions, appliances and weekly PHP budget. It returns a JSON plan with one recipe per selected date and meal type.
