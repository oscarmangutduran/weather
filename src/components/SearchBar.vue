<template>
  <!-- Buscador móvil (visible en pantallas < 992px) -->
  <div class="mobile-search" ref="containerRef">
    <span class="material-symbols-outlined search-icon">search</span>
    <input
      id="mobile-search-input"
      type="text"
      v-model="query"
      @input="onInput"
      @keydown.enter.prevent="onEnter"
      @keydown.escape="closeSuggestions"
      placeholder="Buscar ciudad..."
      autocomplete="off"
      aria-label="Buscar ciudad"
    />
    <button
      v-if="query.length > 0"
      class="btn-clear-search"
      @click="clearQuery"
      aria-label="Limpiar búsqueda"
    >
      <span class="material-symbols-outlined" style="font-size:1.8rem; color:var(--color-outline);">close</span>
    </button>
    <!-- Sugerencias -->
    <ul
      v-if="showSuggestions && suggestions.length > 0"
      class="suggestions-dropdown"
      role="listbox"
    >
      <li
        v-for="(city, idx) in suggestions"
        :key="idx"
        class="suggestion-item"
        role="option"
        @mousedown.prevent="selectCity(city)"
      >
        <span class="material-symbols-outlined">location_on</span>
        <div class="suggestion-info">
          <span>
            <strong>{{ city.name }}</strong>
            <span v-if="city.admin1">, {{ city.admin1 }}</span>
            <span v-if="city.country"> — {{ city.country }}</span>
          </span>
          <span v-if="city.population" class="suggestion-population">
            <span class="material-symbols-outlined" style="font-size:1.2rem;">people</span>
            {{ formatPopulation(city.population) }} hab.
          </span>
        </div>
      </li>
    </ul>
    <div
      v-if="showSuggestions && query.length >= 2 && suggestions.length === 0 && !isSearching"
      class="suggestions-dropdown"
    >
      <div class="suggestion-item" style="cursor:default; color:var(--color-secondary);">
        <span class="material-symbols-outlined">search_off</span>
        No se encontraron ciudades
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

function formatPopulation(n) {
  return n.toLocaleString('es-ES')
}

const props = defineProps({
  searchCities: { type: Function, required: true },
})

const emit = defineEmits(['city-selected'])

const query           = ref('')
const suggestions     = ref([])
const showSuggestions = ref(false)
const isSearching     = ref(false)
const containerRef    = ref(null)
let debounceTimer     = null

function onInput() {
  clearTimeout(debounceTimer)
  if (query.value.trim().length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  isSearching.value = true
  showSuggestions.value = true
  debounceTimer = setTimeout(async () => {
    suggestions.value = await props.searchCities(query.value)
    isSearching.value = false
  }, 300)
}

function selectCity(city) {
  query.value = city.name + (city.country ? `, ${city.country}` : '')
  suggestions.value = []
  showSuggestions.value = false
  emit('city-selected', city)
}

function onEnter() {
  if (suggestions.value.length > 0) selectCity(suggestions.value[0])
}

function closeSuggestions() {
  showSuggestions.value = false
}

function clearQuery() {
  query.value = ''
  suggestions.value = []
  showSuggestions.value = false
}

function handleClickOutside(e) {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    showSuggestions.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<style scoped>
.btn-clear-search {
  position: absolute;
  right: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}
</style>
