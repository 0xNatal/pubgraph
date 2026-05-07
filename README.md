# pubgraph

2D / 3D visualization of [pub.dev](https://pub.dev) (Dart / Flutter) package dependencies.

A port of [anvaka/npmgraph.an](https://github.com/anvaka/npmgraph.an) to the Dart ecosystem.

## How it works

[Vue 3](https://vuejs.org/) + [Vite](https://vite.dev/) + [ngraph](https://github.com/anvaka/ngraph)

- Package data comes from `pub.dev/api/packages/{name}` in real time.
- Vulnerability data comes from [OSV.dev](https://osv.dev/) (`Pub` ecosystem).
- Drop a local `pubspec.yaml` to graph a project that isn't on pub.dev yet.

## Local development

```
git clone https://github.com/0xNatal/pubgraph
cd pubgraph
npm install
npm run dev
```

## Notes & caveats

- **Version resolution is pragmatic**: every package is rendered against its `latest`
  published version, regardless of the constraint in the parent's `dependencies`.
  Building a full `pub_semver`-compatible constraint solver in the browser is doable
  but adds a lot of code for marginal value in a visualization. See `pickVersion`
  in `src/graphBuilder.js` if you want to wire it in.
- **SDK / git / path dependencies** (e.g. `flutter: { sdk: flutter }`) are rendered
  as leaf nodes — they aren't resolvable through pub.dev.
- **Maintainers** are not displayed: pub.dev's per-package endpoint doesn't expose
  publisher info. The `maintainers.js` helper is kept as a no-op stub.
- **Licenses** were replaced with `topics`: pubspec has no `license` field (Dart
  derives licenses from the LICENSE file in the archive), but `topics` is a
  pubspec-native tag list that maps cleanly to the same UI.

## License

MIT (same as upstream)
