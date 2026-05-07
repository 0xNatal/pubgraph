// Aggregate package names across the graph. With Dart there are no scoped
// packages, so node.id is always "name@version" — name is just the part
// before the FIRST '@'.
export default function getAllNames(graph) {
  var histogram = {}
  var names = []

  graph.forEachNode(countNode)

  return names.sort(byCount)

  function countNode(node) {
    var id = String(node.id)
    var idx = id.indexOf('@')
    var name = idx > 0 ? id.substring(0, idx) : id

    var record = histogram[name]
    if (!record) {
      record = histogram[name] = Object.create(null)
      record.name = name
      record.count = 0
      record.packages = []
      names.push(record)
    }
    record.count += 1
    record.packages.push(node.id)
  }

  function byCount(x, y) {
    return y.count - x.count
  }
}
