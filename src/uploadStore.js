import { shallowRef, ref } from 'vue'
import yaml from 'js-yaml'

export const uploadedPubspec = shallowRef(null)
export const includeDevDeps = ref(false)
export const includeOverrides = ref(false)

// Backwards-compat alias so NavBar.vue keeps working without a full rename.
export { uploadedPubspec as uploadedPackageJson }

// Parses a dropped pubspec.yaml (or pubspec.yml) and stages it for visualization.
export function handleDroppedFile(file) {
  if (!file) return

  var reader = new FileReader()
  reader.onload = function (e) {
    try {
      var parsed = yaml.load(e.target.result)
      if (!parsed || typeof parsed !== 'object') {
        alert('That does not look like a valid pubspec.yaml')
        return
      }
      if (!parsed.name) {
        alert('pubspec.yaml is missing a "name" field')
        return
      }
      uploadedPubspec.value = parsed
    } catch (err) {
      alert('Could not parse YAML: ' + err.message)
    }
  }
  reader.readAsText(file)
}
