// pub.dev REST API endpoints.
// Single-package fetch: registryUrl + name -> returns { name, latest, versions[] }
// Search:               autoCompleteUrl + encoded query -> returns { packages: [{package: name}], next }
export const registryUrl = 'https://pub.dev/api/packages/'
export const autoCompleteUrl = 'https://pub.dev/api/search?q='
