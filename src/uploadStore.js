import { shallowRef, ref, computed } from 'vue'
import yaml from 'js-yaml'

// Unified store. Holds whichever file the user dropped, with its detected type.
// Shape: { type: 'pubspec' | 'lock', data: <parsed yaml> }
export const uploadedFile = shallowRef(null)

export const includeDevDeps = ref(false)
export const includeOverrides = ref(false)

// Backwards-compat: code that expected `uploadedPubspec` (a parsed pubspec.yaml)
// still works. It's null when a lock file is loaded instead.
export const uploadedPubspec = computed(function () {
  var f = uploadedFile.value
  return f && f.type === 'pubspec' ? f.data : null
})

// Same alias for legacy npm-era references; safe to remove later.
export { uploadedPubspec as uploadedPackageJson }

// Convenience: a display name for the upload, regardless of type.
export const uploadedDisplayName = computed(function () {
  var f = uploadedFile.value
  if (!f) return ''
  if (f.type === 'pubspec') return f.data.name || 'uploaded-project'
  // Lock files don't carry the project name; the project owns the lock,
  // but the lock has no field for it.
  return 'project (from lock)'
})

// Detect file type by inspecting parsed content (not filename — too unreliable).
function detectType(parsed) {
  if (!parsed || typeof parsed !== 'object') return null

  // pubspec.lock: top-level `packages` map where each entry has version+source/dependency.
  if (parsed.packages && typeof parsed.packages === 'object' && !Array.isArray(parsed.packages)) {
    var firstKey = Object.keys(parsed.packages)[0]
    var firstEntry = firstKey ? parsed.packages[firstKey] : null
    if (firstEntry && typeof firstEntry === 'object' &&
        (firstEntry.version || firstEntry.source || firstEntry.dependency)) {
      return 'lock'
    }
  }

  // pubspec.yaml: top-level `name` (a required field for any valid pubspec).
  if (typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
    return 'pubspec'
  }

  return null
}

export function handleDroppedFile(file) {
  if (!file) return

  var reader = new FileReader()
  reader.onload = function (e) {
    var parsed
    try {
      parsed = yaml.load(e.target.result)
    } catch (err) {
      alert('Could not parse YAML: ' + err.message)
      return
    }

    var type = detectType(parsed)
    if (!type) {
      alert('Could not recognize this file. Expected pubspec.yaml or pubspec.lock.')
      return
    }

    uploadedFile.value = { type: type, data: parsed }
  }
  reader.readAsText(file)
}
