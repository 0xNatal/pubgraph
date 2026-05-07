// pub.dev's `/api/packages/{name}` endpoint does not expose maintainer/publisher
// info on a per-package basis (it would require extra calls to /publisher/{name}).
// We keep the export so PackageInfo.vue's import still works, but return an
// empty list — the maintainers section in the UI just won't render.
export default function getAllMaintainers(/* graph */) {
  return []
}
