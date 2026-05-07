// Aggregate pubspec.topics across all nodes in the graph.
// Returned shape matches what licenses.js used to produce, so the UI renders
// the same way: { name, count, packages: [...], selected: false }
export default function getAllTopics(graph) {
  var histogram = {}
  var topics = []

  graph.forEachNode(function (node) {
    var pkg = node.data
    if (!pkg || !Array.isArray(pkg.topics) || pkg.topics.length === 0) {
      record('untagged', node)
      return
    }
    pkg.topics.forEach(function (t) { record(t, node) })
  })

  return topics.sort(byCount)

  function record(topic, node) {
    var entry = histogram[topic]
    if (!entry) {
      entry = histogram[topic] = { name: topic, count: 0, packages: [], selected: false }
      topics.push(entry)
    }
    entry.count += 1
    entry.packages.push(node.id)
  }

  function byCount(x, y) {
    return y.count - x.count
  }
}
