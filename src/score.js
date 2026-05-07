// Fetches pub.dev's score data for a given package.
// Endpoint:    GET https://pub.dev/api/packages/{name}/score
// Response shape (fields used):
//   {
//     grantedPoints, maxPoints,    // pub points (e.g. 130 / 160)
//     likeCount,                   // number of likes
//     popularityScore,             // 0..1 (pub.dev's popularity index)
//     downloadCount30Days,         // recent downloads (may be missing on older endpoints)
//     tags,                        // ["sdk:dart", "platform:android", ...]
//     lastUpdated                  // ISO timestamp
//   }
//
// Caches per-package to avoid re-fetching on every node click.

var cache = Object.create(null)

export default function getPackageScore(packageName) {
  if (!packageName) return Promise.resolve(null)

  var cached = cache[packageName]
  if (cached !== undefined) return Promise.resolve(cached)

  return fetch('https://pub.dev/api/packages/' + encodeURIComponent(packageName) + '/score')
    .then(function (r) {
      if (!r.ok) return null
      return r.json()
    })
    .then(function (data) {
      var score = data ? normalize(data) : null
      cache[packageName] = score
      return score
    })
    .catch(function () {
      cache[packageName] = null
      return null
    })
}

function normalize(data) {
  return {
    grantedPoints:    typeof data.grantedPoints === 'number' ? data.grantedPoints : null,
    maxPoints:        typeof data.maxPoints === 'number' ? data.maxPoints : null,
    likeCount:        typeof data.likeCount === 'number' ? data.likeCount : null,
    popularityScore:  typeof data.popularityScore === 'number' ? data.popularityScore : null,
    downloadCount30:  typeof data.downloadCount30Days === 'number' ? data.downloadCount30Days : null,
    tags:             Array.isArray(data.tags) ? data.tags : [],
    lastUpdated:      data.lastUpdated || null,
  }
}
