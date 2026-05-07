import createGraph from 'ngraph.graph'
import { registryUrl } from './config.js'

/*
 * graphBuilder for pub.dev (Dart / Flutter packages).
 *
 * Differences vs. the npm version:
 *   - pub.dev returns { name, latest, versions: [{version, pubspec}, ...] } per package.
 *   - Pubspec dep maps can contain three forms of values:
 *       1. a string version constraint:  "^1.2.3" | ">=1.0.0 <2.0.0"
 *       2. an SDK dep:                   { sdk: 'flutter' }
 *       3. a git/path dep:               { git: '...' } | { path: '...' } | { hosted: '...' }
 *     Forms 2 and 3 are NOT resolvable via pub.dev — we treat them as leaf nodes.
 *   - We use snake_case `dev_dependencies` (pubspec convention).
 *   - Version resolution is pragmatic: we always render the package against its
 *     `latest` published version. Building a full pub_semver constraint solver
 *     in the browser is doable but adds a lot of code for marginal value in a
 *     visualization.  If you want it later, swap pickVersion() for one that
 *     walks `data.versions` and picks the highest match for `work.version`.
 */

function httpGet(url) {
  return fetch(url).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url)
    return r.json()
  })
}

// Anything that isn't a plain string version constraint = unresolvable leaf.
// Examples that hit this branch:
//   { sdk: 'flutter' }
//   { git: 'https://github.com/foo/bar.git' }
//   { path: '../local_pkg' }
//   { hosted: { name: 'x', url: '...' }, version: '^1.0.0' }
function isUnresolvable(versionSpec) {
  return versionSpec !== null && typeof versionSpec === 'object'
}

// Short, human-readable label for leaf nodes that we can't resolve.
function describeUnresolvable(versionSpec) {
  if (!versionSpec || typeof versionSpec !== 'object') return ''
  if (versionSpec.sdk) return 'sdk:' + versionSpec.sdk
  if (versionSpec.git) return 'git'
  if (versionSpec.path) return 'path'
  if (versionSpec.hosted) return 'hosted:custom'
  return 'external'
}

// Bucket an unresolvable spec into a coarse kind for color-coding.
function kindOfUnresolvable(versionSpec) {
  if (!versionSpec || typeof versionSpec !== 'object') return 'external'
  if (versionSpec.sdk) return 'sdk'
  if (versionSpec.git) return 'git'
  if (versionSpec.path) return 'path'
  return 'external'
}

function fetchPackageData(ctx, work) {
  if (isUnresolvable(work.version)) {
    return Promise.resolve(null) // signal: leaf
  }

  var cached = ctx.cache[work.name]
  if (cached) return Promise.resolve(cached)

  return httpGet(registryUrl + encodeURIComponent(work.name)).then(function (data) {
    ctx.cache[work.name] = data
    return data
  })
}

function pickVersion(work, data) {
  // For the ROOT node only: honor an explicit version supplied by the user
  // (typed in the URL, or chosen from the version dropdown). For transitive
  // dependencies we keep "latest" — proper pub_semver constraint resolution
  // would add a lot of code for marginal value in a visualization.
  if (work.parent !== null) return null

  var v = work.version
  if (!v) return null

  // Constraint-like strings (e.g. "^1.2.3", ">=1.0.0 <2.0.0", "any", "*")
  // are NOT exact versions — fall back to latest.
  if (/[\^~><*\s]|^any$/i.test(v)) return null

  // Exact version string. Confirm it actually exists in the versions array.
  var exists = data.versions && data.versions.some(function (entry) {
    return entry.version === v
  })
  return exists ? v : null
}

function processQueue(ctx) {
  if (typeof ctx.changed === 'function') {
    ctx.changed(ctx.queue.length)
  }

  var work = ctx.queue.pop()
  if (!work) return Promise.resolve(ctx.graph)

  return fetchPackageData(ctx, work)
    .then(function (data) {
      traverseDependencies(ctx, work, data)
    })
    .catch(function (err) {
      ctx.errors.push({ name: work.name, version: work.version, message: err.message })
    })
    .then(function () {
      return processQueue(ctx)
    })
}

function traverseDependencies(ctx, work, data) {
  var pubspec, id, versionString, kind

  if (data === null) {
    // Unresolvable leaf (sdk/git/path) — its kind comes from the spec itself,
    // overriding whatever the parent edge would have suggested.
    var label = describeUnresolvable(work.version)
    id = work.name + '@' + label
    kind = kindOfUnresolvable(work.version)
    pubspec = {
      name: work.name,
      version: label,
      _unresolvable: true,
      description: 'Dependency from ' + label + '. Not resolved through pub.dev.'
    }
  } else {
    var picked = pickVersion(work, data)
    var entry = picked ? data.versions.find(function (v) { return v.version === picked }) : data.latest
    if (!entry) entry = data.latest
    pubspec = entry.pubspec
    versionString = entry.version
    id = pubspec.name + '@' + versionString
    kind = work.kind || 'runtime'
  }

  // Wrap pubspec in a shallow copy so we can attach _kind without polluting
  // the cached package data (which is shared across nodes).
  var nodeData = Object.assign({}, pubspec, { _kind: kind })

  ctx.graph.beginUpdate()
  ctx.graph.addNode(id, nodeData)

  if (work.parent && !ctx.graph.hasLink(work.parent, id)) {
    ctx.graph.addLink(work.parent, id)
  }
  ctx.graph.endUpdate()

  if (ctx.processed[id]) return
  ctx.processed[id] = true

  if (data === null) return // leaf has no children

  // Transitive deps are always runtime — pub.dev's API only gives us runtime
  // deps for packages we walk into, never their dev_dependencies.
  var deps = pubspec.dependencies
  if (deps) {
    Object.keys(deps).forEach(function (name) {
      ctx.queue.push({
        name: name,
        version: deps[name],
        parent: id,
        kind: 'runtime'
      })
    })
  }
}

// Parse "package_name@1.2.3" or "package_name". Pub package names never contain '@',
// so this is simpler than the npm version (no scoped packages).
export function parsePackageId(pkgId) {
  var idx = pkgId.indexOf('@')
  if (idx > 0) {
    return { name: pkgId.slice(0, idx), version: pkgId.slice(idx + 1) }
  }
  return { name: pkgId, version: '' }
}

export default function buildGraph(pkgName, version, changed) {
  var ctx = {
    graph: createGraph(),
    cache: Object.create(null),
    queue: [],
    processed: Object.create(null),
    errors: [],
    changed: changed
  }

  // version param is honored on the root node only (see pickVersion).
  ctx.queue.push({ name: pkgName, version: version || '', parent: null, kind: 'root' })

  return {
    graph: ctx.graph,
    start: function () { return processQueue(ctx) },
    errors: ctx.errors
  }
}

// Build a graph from a locally-uploaded pubspec.yaml (already parsed to an object).
export function buildGraphFromPubspec(pubspec, options, changed) {
  var ctx = {
    graph: createGraph(),
    cache: Object.create(null),
    queue: [],
    processed: Object.create(null),
    errors: [],
    changed: changed
  }

  var name = pubspec.name || 'uploaded-project'
  var version = pubspec.version || '0.0.0'
  var id = name + '@' + version

  // Root node from upload — wrap in a shallow copy with _kind, just like
  // online-resolved nodes get wrapped in traverseDependencies.
  ctx.graph.addNode(id, Object.assign({}, pubspec, { _kind: 'root' }))
  ctx.processed[id] = true

  // Push each dep with its kind so we can color-code edges/nodes correctly.
  function pushAll(map, kind) {
    if (!map) return
    Object.keys(map).forEach(function (depName) {
      ctx.queue.push({ name: depName, version: map[depName], parent: id, kind: kind })
    })
  }
  pushAll(pubspec.dependencies, 'runtime')
  if (options && options.includeDevDeps) pushAll(pubspec.dev_dependencies, 'dev')
  if (options && options.includeOverrides) pushAll(pubspec.dependency_overrides, 'override')

  return {
    graph: ctx.graph,
    start: function () { return processQueue(ctx) },
    errors: ctx.errors
  }
}

// Backwards-compatible alias so existing imports of buildGraphFromJson keep working.
export { buildGraphFromPubspec as buildGraphFromJson }
