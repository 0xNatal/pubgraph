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
      // pub.dev lists versions oldest-first; reverse so the dropdown shows newest first.
      var versions = data.versions.map(function (v) { return v.version }).reverse()
      cache[packageName] = versions
      return versions
    })
}
