// Single source of truth for all colors used in the visualization.
// Imported by the renderer (GraphViewer.vue), the side panel (PackageInfo.vue),
// and the vulnerability scanner (vulnerabilities.js).

// -------- Dependency-kind palette --------
// Used to color-code nodes by how they relate to the root package.
// Vulnerability colors (below) take precedence in the renderer when present.

export const KIND_COLORS = {
  root:     '#7FE3A0', // mint green — the package the user asked about (stands out)
  runtime:  '#E8E6F0', // light/neutral — default runtime deps
  dev:      '#5BA8E0', // saturated blue — dev_dependencies
  override: '#C77DFF', // vivid purple — dependency_overrides (rare/intentional)
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

// -------- Vulnerability severity palette --------
// Severity colors override kind colors in the renderer — security signals
// should always win visually.

export const SEVERITY_COLORS = {
  CRITICAL: '#DC5F65',
  HIGH:     '#E8964F',
  MODERATE: '#E8D44F',
  LOW:      '#A0A0B8',
}
