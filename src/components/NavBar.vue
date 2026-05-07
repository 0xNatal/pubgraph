<template>
  <div class="navbar-component">
    <form class="search" role="search" @submit.prevent="submitPackage">
      <div class="input-group typeahead-container">
        <input
          ref="inputEl"
          v-model="query"
          type="text"
          autofocus
          class="form-control no-shadow"
          placeholder="pub package (e.g. provider)"
          @input="onInput"
          @keydown.down.prevent="moveDown"
          @keydown.up.prevent="moveUp"
          @keydown.enter.prevent="selectCurrent"
          @keydown.escape="closeSuggestions"
        >
        <span class="input-group-btn">
          <button class="btn" type="submit">visualize</button>
        </span>
        <ul v-if="suggestions.length > 0">
          <li
            v-for="(pkg, index) in suggestions"
            :key="pkg.id"
            :class="{ active: index === activeIndex }"
          >
            <a @mousedown.prevent="selectPackage(pkg)">
              <strong>{{ pkg.id }}</strong>
            </a>
          </li>
        </ul>
      </div>
    </form>

    <div
      class="upload-zone"
      :class="{ 'has-file': uploadedFile }"
      @click="triggerFileInput"
    >
      <template v-if="!uploadedFile">
        <span class="upload-prompt">or drop <strong>pubspec.yaml</strong> or <strong>pubspec.lock</strong> to graph local dependencies</span>
      </template>
      <template v-else>
        <div class="staged-info">
          <button class="staged-close" type="button" @click.stop="clearStaged">&times;</button>
          <div class="staged-name">
            {{ uploadedDisplayName }}
            <span class="staged-type" :class="'staged-type-' + uploadedFile.type">{{ uploadedFile.type === 'lock' ? 'lock — exact' : 'pubspec — constraints' }}</span>
          </div>
          <label class="dev-deps-toggle" @click.stop>
            <input type="checkbox" v-model="devDeps"> include dev_dependencies
          </label>
        </div>
      </template>
      <input ref="fileInput" type="file" accept=".yaml,.yml,.lock" hidden @change="onFileSelect">
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { autoCompleteUrl } from '../config.js'
import { parsePackageId } from '../graphBuilder.js'
import { uploadedFile, uploadedDisplayName, includeDevDeps, handleDroppedFile } from '../uploadStore.js'

const router = useRouter()
const route = useRoute()

const query = ref('')
const suggestions = ref([])
const activeIndex = ref(-1)
const inputEl = ref(null)
const fileInput = ref(null)
const devDeps = ref(includeDevDeps.value)

let debounceTimer = null

function syncQueryFromRoute() {
  const path = route.path
  if (path) {
    const pathParts = path.match(/\/view\/[23]d\/([^/]+)(?:\/([^/]+))?\/?/)
    if (pathParts) {
      var pkgId = decodeURIComponent(pathParts[1] || '')
      var version = decodeURIComponent(pathParts[2] || '')
      if (pkgId === '~upload') {
        query.value = uploadedDisplayName.value
      } else {
        query.value = version ? pkgId + '@' + version : pkgId
      }
    }
  }
}

syncQueryFromRoute()
watch(() => route.path, syncQueryFromRoute)

function onInput() {
  clearTimeout(debounceTimer)
  activeIndex.value = -1
  debounceTimer = setTimeout(fetchSuggestions, 250)
}

function fetchSuggestions() {
  const val = query.value.trim()
  if (!val) {
    suggestions.value = []
    return
  }

  if (val.length < 2) {
    suggestions.value = []
    return
  }

  // pub.dev search response shape: { packages: [{ package: 'name' }, ...], next: '...' }
  fetch(autoCompleteUrl + encodeURIComponent(val))
    .then(function (r) { return r.json() })
    .then(function (data) {
      suggestions.value = (data.packages || []).slice(0, 10).map(function (entry) {
        return { id: entry.package }
      })
    })
    .catch(function () {
      suggestions.value = []
    })
}

function moveDown() {
  if (activeIndex.value < suggestions.value.length - 1) {
    activeIndex.value++
  }
}

function moveUp() {
  if (activeIndex.value > 0) {
    activeIndex.value--
  }
}

function selectCurrent() {
  if (activeIndex.value >= 0 && activeIndex.value < suggestions.value.length) {
    selectPackage(suggestions.value[activeIndex.value])
  } else if (query.value.trim()) {
    suggestions.value = []
    activeIndex.value = -1
    navigateToPackage(query.value.trim())
  }
}

function selectPackage(pkg) {
  query.value = pkg.id
  suggestions.value = []
  activeIndex.value = -1
  navigateToPackage(pkg.id)
}

function submitPackage() {
  if (query.value.trim()) {
    suggestions.value = []
    navigateToPackage(query.value.trim())
  }
}

function closeSuggestions() {
  suggestions.value = []
  activeIndex.value = -1
}

function navigateToPackage(name) {
  clearStaged()
  var parsed = parsePackageId(name)
  var path = route.path.indexOf('/view/3d/') !== -1 ? '/view/3d/' : '/view/2d/'
  path += encodeURIComponent(parsed.name)
  if (parsed.version) {
    path += '/' + encodeURIComponent(parsed.version)
  }
  router.push(path)
}

function triggerFileInput() {
  if (!uploadedFile.value) {
    fileInput.value.click()
  }
}

function onFileSelect(event) {
  handleDroppedFile(event.target.files[0])
  event.target.value = ''
}

function navigateToUpload() {
  if (!uploadedFile.value) return

  includeDevDeps.value = devDeps.value
  query.value = uploadedDisplayName.value
  suggestions.value = []

  var uploadPath = route.path.indexOf('/view/3d/') !== -1
    ? '/view/3d/~upload'
    : '/view/2d/~upload'

  if (route.params.pkgId === '~upload') {
    router.replace('/').then(function () {
      router.replace(uploadPath)
    })
  } else {
    router.push(uploadPath)
  }
}

// Auto-visualize when a file is uploaded (from drop or file picker)
watch(uploadedFile, function (val) {
  if (val) navigateToUpload()
})

// Auto-re-visualize when devDeps toggle changes
watch(devDeps, function () {
  if (uploadedFile.value) navigateToUpload()
})

function clearStaged() {
  uploadedFile.value = null
  devDeps.value = false
}
</script>

<style scoped>
.staged-type {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  vertical-align: middle;
}
.staged-type-lock {
  background: #2d4a3d;
  color: #7FE3A0;
}
.staged-type-pubspec {
  background: #3d3d2a;
  color: #E8D44F;
}
</style>
