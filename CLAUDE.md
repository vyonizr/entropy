# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Entropy — a web-based media converter that runs entirely client-side in the browser via `ffmpeg.wasm`. No files are ever uploaded to a server; conversion happens in-browser with WebAssembly. React + TypeScript + Vite + Tailwind v4.

## Commands

```
npm install       # also runs postinstall: copies ffmpeg-core.js/.wasm from node_modules into public/ffmpeg/
npm run dev        # vite dev server (file-watch polling enabled for this environment)
npm run build       # tsc typecheck + vite build
npm run test        # vitest
npm run coverage     # vitest run --coverage
npm run preview      # preview production build
```

Run a single test file: `npx vitest run test/utils.test.ts`. There is only one test file (`test/utils.test.ts`), covering `src/utils.ts`.

No lint script is configured. Formatting is via Prettier (`prettier.config.cjs` — single quotes, no semicolons, `prettier-plugin-tailwindcss` for class sorting); there's no `format` npm script, invoke `npx prettier` directly if needed.

## Architecture

**Single-page app, no routing, no backend.** `src/App.tsx` (`Home` component) is the root: it owns all top-level state (selected file, progress, loading, errors) and exposes it plus `runFFMPEG` through `FFMPEGContext` (React context, defined and provided in `App.tsx`).

**ffmpeg execution flow**: `runFFMPEG(selectedFile, outputName, method)` in `App.tsx` creates a new `FFmpeg` instance (from `@ffmpeg/ffmpeg` v0.12 class-based API) per conversion, loads the wasm core from same-origin `/ffmpeg/ffmpeg-core.js` + `.wasm` (self-hosted — see below, not fetched from a CDN), writes the input file into the ffmpeg virtual FS, execs `-i <input> ...method.split(' ') <outputName>`, reads the output back out, and terminates the instance. Progress/log events update `progress` and a parsed time-remaining estimate (`parseFFmpegTimeLog` / `calculateTimeRemaining` / `formatTimeRemaining` in `src/utils.ts`).

**The wasm core must stay self-hosted.** `scripts/copy-ffmpeg-core.mjs` runs on `postinstall` and copies `ffmpeg-core.js`/`ffmpeg-core.wasm` from `node_modules/@ffmpeg/core/dist/esm` into `public/ffmpeg/`, which `App.tsx` loads via `toBlobURL('/ffmpeg/...')`. Don't revert to loading the core from a third-party CDN (unpkg etc.) — this was deliberately fixed for supply-chain/integrity reasons (see `tasks/audit-report.md`). Cross-origin isolation (`COOP`/`COEP` headers, required for `SharedArrayBuffer`) is set in `vite.config.ts` for dev and via `public/coi-serviceworker.min.js` as a fallback for hosts that can't set those headers.

**Conversion actions are config-driven and per-action.** `src/constants.ts` (`RADIO_OPTIONS`) defines every supported action (label, `inputType`, `outputType`, icon) and drives both the radio-button list in `App.tsx` and the file-picker's `accept` filter. `src/components/ConvertActions/index.tsx` is a switch statement mapping the selected action's `value` to one config component under `src/components/ConvertActions/components/<Name>Config/`. Each config component:
- reads `isLoading`/`setIsLoading`/`runFFMPEG` from `FFMPEGContext`
- owns its own local state for action-specific options (e.g. target extension, dimensions, flip direction) usually via a sibling `constants.ts`
- builds the ffmpeg `method` argument string, calls `runFFMPEG`, and on success builds a `Blob`/object URL and calls `triggerDownload` (from `src/utils.ts`)

To add a new conversion action: add an entry to `RADIO_OPTIONS` in `src/constants.ts`, add a new folder under `src/components/ConvertActions/components/`, and add a case to the switch in `src/components/ConvertActions/index.tsx`.

**Path alias**: `@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts`).

**PWA**: `vite-plugin-pwa` (configured in `vite.config.ts`) precaches assets including the wasm core — `workbox.maximumFileSizeToCacheInBytes` is raised above the default specifically to fit the ~32 MB `ffmpeg-core.wasm`; keep that in mind if the core file grows or changes.
