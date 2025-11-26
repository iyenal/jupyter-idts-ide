## Quick orientation

This repo contains a small demo web UI at the repository root and a full JupyterLite app under `jupyter/`.
Give preference to modifying sources under `jupyter/` and to running the build/watch scripts there — the top-level `build/` folder holds compiled bundles you should not edit by hand.

## Big-picture architecture (what to know fast)
- Root demo: `index.html` + `script.js` — a minimal GoldenLayout demo. Change `script.js` to update that demo behavior.
- JupyterLite app: everything related to the in-browser Jupyter-like experience lives in `jupyter/`:
  - `jupyter/index.html` — the app root for JupyterLite.
  - `jupyter/jupyter-lite.json` / `config-utils.js` — configuration used by child app pages.
  - `jupyter/package.json` — build scripts and app list (`jupyterlite.apps` shows which apps are enabled: `lab`, `repl`, `tree`, `edit`, `notebooks`, `consoles`).
  - `jupyter/service-worker.js` — service-worker logic (caching and BroadcastChannel integration; see notes below).
- Prebuilt assets: top-level `build/` contains many webpack chunk files (compiled output). Treat these as artifacts produced by `jupyter/` builds.

## Developer workflows (concrete commands)
- Build (dev):
  - cd into `jupyter/` and run `npm run build` — this runs the local `webpack` build defined in `jupyter/package.json`.
- Watch (fast iteration):
  - `cd jupyter && npm run watch` — runs webpack in watch mode and regenerates bundles on change.
- Production build (project uses Jupyter build helpers):
  - `cd jupyter && npm run build:prod` — note: this script invokes `jlpm` (JupyterLab's yarn wrapper). Ensure `jlpm`/yarn is available in PATH for the production script to work.

Notes: edits to any source must be rebuilt into the `build/` bundles before a deploy or test; do not hand-edit files in `build/`.

## Project-specific patterns & conventions
- Webpack-derived chunking: the `build/` directory is composed of many numbered chunk files. Look for the entry points in `jupyter/` (webpack config is referenced by the `webpack` script). When investigating runtime issues, search the `build/` directory for the chunk name reported in console traces.
- JupyterLite config: `jupyter/jupyter-lite.json` and `jupyter/index.html` are the canonical places to adjust application-level defaults (app list, root paths, static mounting). `jupyter/index.html` contains an embedded `jupyter-config-data` JSON snippet used by child pages.
- Service worker behavior: `jupyter/service-worker.js` uses a BroadcastChannel (`/sw-api.v1`) and special handling for API requests:
  - It responds to `/api/service-worker-heartbeat` (returns `ok`).
  - Requests whose pathnames include `/api/drive` or `/api/stdin/` are forwarded over the BroadcastChannel (see the `broadcastOne` flow) rather than being handled only via cache/fetch.
  - Caching is guarded by the `enableCache` query param — the SW reads `enableCache` from the URL search params and only caches when enabled.

## Integration points & where to look for cross-component interactions
- Static demo (root): `index.html` pulls `script.js` and CSS; useful for quick UI experiments with GoldenLayout.
- JupyterLite app: `jupyter/index.html` -> `config-utils.js` -> child app pages. Many runtime behaviors are configured by `jupyter-lite.json` and the `jupyter/` pipeline. If you need to change which Jupyter apps are available, edit the `jupyterlite.apps` array in `jupyter/package.json`.
- API stubs/files: `api/` and `jupyter/files/` contain content/translation and example files used by the in-browser runtime; use these when testing content loading.

## Quick examples (do this to accomplish common tasks)
- Update the small GoldenLayout demo: edit `script.js` and refresh `index.html` in the browser.
- Rebuild the JupyterLite app after changing configuration or source code:
  - cd `jupyter` && `npm run build` (dev) or `npm run watch` (continuous).
- Inspect service-worker behavior when debugging API flows: check `jupyter/service-worker.js` for the BroadcastChannel logic and the `enableCache` flag.

## What to avoid / gotchas discovered here
- Do not edit files under `build/` directly — they are output artifacts. Make source edits under `jupyter/` and rebuild.
- `jupyter/package.json` references `jlpm` in `build:prod`; running that script without `jlpm` available will fail.

## References (files to open first)
- `index.html`, `script.js` — quick UI demo
- `jupyter/index.html`, `jupyter/jupyter-lite.json`, `jupyter/config-utils.js` — app entry + config
- `jupyter/package.json` — build scripts and enabled apps
- `jupyter/service-worker.js` — caching & cross-window BroadcastChannel rules
- `jupyter/files/README.md` — local files guidance

If any section is unclear or you'd like me to include more examples (e.g., where to find the webpack config, how to run a local static server to serve `index.html`, or a short checklist for producing a production build), tell me which area to expand and I'll update this file.
