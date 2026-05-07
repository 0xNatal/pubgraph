// Shared color palette + labels for dependency-kind classification.
// Used by both the graph renderer (GraphViewer.vue) and the legend
// (PackageInfo.vue). Single source of truth — keep them in sync.

export const KIND_COLORS = {
  root:     '#B19CD9', // soft purple — the package the user asked about
  runtime:  '#E8E6F0', // light/neutral — default runtime deps
  dev:      '#7AC8E5', // blue — dev_dependencies
  override: '#E8C547', // amber — dependency_overrides
  sdk:      '#E8964F', // orange — flutter/dart sdk leaves
  git:      '#888AAA', // muted gray — git deps
  path:     '#888AAA', // muted gray — local path deps
  external: '#888AAA', // muted gray — anything else unresolvable
}

export const KIND_LABELS = {
  root:     'selected package',
  runtime:  'runtime dep',
  dev:      'dev dep',
  override: 'override',
  sdk:      'sdk (flutter/dart)',
  git:      'git source',
  path:     'local path',
  external: 'external',
}

// Stable ordering for the legend — root first, then by typical importance.
export const KIND_ORDER = ['root', 'runtime', 'dev', 'override', 'sdk', 'git', 'path', 'external']

// Returns the kinds that actually appear in a given graph, in KIND_ORDER.
// Lets the legend hide irrelevant entries (e.g. 'sdk' for a pure-Dart package).
export function getKindsInGraph(graph) {
  var present = Object.create(null)
  graph.forEachNode(function (node) {
    var k = node.data && node.data._kind
    if (k) present[k] = true
  })
  return KIND_ORDER.filter(function (k) { return present[k] })
}
