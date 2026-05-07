# pubgraph

Interactive 2D / 3D visualization of [pub.dev](https://pub.dev) (Dart / Flutter) package dependency graphs, with supply-chain vulnerability scanning via [OSV.dev](https://osv.dev).

🌐 **Live demo:** [0xnatal.github.io/pubgraph](https://0xnatal.github.io/pubgraph/)

## Features

- **Browse any pub.dev package** by name and explore its dependency graph in 2D or 3D
- **Drop a `pubspec.yaml`** to graph a project's declared dependencies (versions are approximate — resolved to latest)
- **Drop a `pubspec.lock`** to graph what's *actually installed* — exact versions, with reliable vulnerability scanning
- **OSV vulnerability scan** on the Pub ecosystem — known CVEs are color-coded by severity
- **Color-coded by dependency kind** — root, runtime, dev, sdk, git, path, override
- **Pub.dev score** integration — points, likes, popularity, downloads
- **Clickable topics** linking to pub.dev topic search
- **Version selector** — explore older versions of any package

## Why a lock file matters

`pubspec.yaml` describes *what you want* (e.g. `http: ^1.0.0` — anything in the 1.x range). Loading it gives you a graph based on the *latest* compatible version of each dep, which may differ from what's actually installed.

`pubspec.lock` describes *what's installed* — the exact versions Flutter resolved during `pub get`. Loading it gives accurate vulnerability scanning, because OSV looks up the real versions, not approximations.

## How it works

[Vue 3](https://vuejs.org/) + [Vite](https://vite.dev/) + [ngraph](https://github.com/anvaka/ngraph) — entirely client-side, no backend.

- Package data: live from `pub.dev/api/packages/{name}`
- Vulnerabilities: live from `api.osv.dev` (Pub ecosystem)
- Hosted on GitHub Pages — no server, no telemetry

This project is a fork of [anvaka/npmgraph.an](https://github.com/anvaka/npmgraph.an), heavily adapted for the Dart/Flutter ecosystem.

## Local development

```bash
git clone https://github.com/0xNatal/pubgraph.git
cd pubgraph
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Deploy

```bash
npm run deploy
```

Builds to `dist/` and force-pushes to the `gh-pages` branch. Make sure GitHub Pages is configured in repo settings → Pages → Source: `gh-pages` branch.

## Notes & caveats

- **Constraint resolution is partial.** For `pubspec.yaml`, exact-version pins (e.g. `provider: 6.1.2`) are honored, but range constraints (`^1.0.0`, `>=1.0.0 <2.0.0`) fall back to *latest*. Use `pubspec.lock` for exact resolution.
- **SDK / git / path dependencies** (e.g. `flutter: { sdk: flutter }`) appear as leaf nodes with their actual versions but no resolved children — they aren't on pub.dev.
- **Topics** replace npm's licenses — pubspec has no license field, but `topics` is a pubspec-native tag list that maps cleanly.
- **Maintainers** aren't shown — pub.dev's package endpoint doesn't expose them.

## License

MIT — see upstream [anvaka/npmgraph.an](https://github.com/anvaka/npmgraph.an).
