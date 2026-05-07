import { registryUrl } from './config.js'

var cache = Object.create(null)

// Returns an array of version strings (newest first) for the given pub package,
// or null if the package can't be fetched.
export default function getPackageVersions(packageName) {
  var cached = cache[packageName]
  if (cached) {
    return Promise.resolve(cached)
  }

  return fetch(registryUrl + encodeURIComponent(packageName))
    .then(function (r) {
      if (!r.ok) return null
      return r.json()
    })
    .then(function (data) {
      if (!data || !Array.isArray(data.versions)) return null
      // Skip retracted versions (pub.dev marks them with `retracted: true`) and
      // reverse so the dropdown shows newest first.
      var versions = data.versions
        .filter(function (v) { return !v.retracted })
        .map(function (v) { return v.version })
        .reverse()
      cache[packageName] = versions
      return versions
    })
}
