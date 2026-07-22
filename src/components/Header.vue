<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo -->
      <a href="#" class="app-logo">
        <span class="material-symbols-outlined icon-filled" style="font-size:2.4rem; vertical-align:-0.4rem;">cloud</span>
        WeatherNow
      </a>

      <!-- Buscador (Desktop) -->
      <div class="header-search" ref="searchContainerRef">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          id="header-search-input"
          type="text"
          v-model="query"
          @input="onInput"
          @keydown.enter.prevent="onSearchEnter"
          @keydown.escape="closeSuggestions"
          placeholder="Buscar ciudad..."
          autocomplete="off"
          aria-label="Buscar ciudad"
          aria-autocomplete="list"
          aria-controls="header-suggestions"
        />
        <!-- Dropdown de sugerencias -->
        <ul
          v-if="showSuggestions && suggestions.length > 0"
          id="header-suggestions"
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
            <span>
              <strong>{{ city.name }}</strong>
              <span v-if="city.admin1">, {{ city.admin1 }}</span>
              <span v-if="city.country"> — {{ city.country }}</span>
            </span>
          </li>
        </ul>
        <!-- Sin resultados -->
        <div
          v-if="showSuggestions && query.length >= 2 && suggestions.length === 0 && !isSearching"
          class="suggestions-dropdown"
        >
          <div class="suggestion-item" style="cursor:default; color: var(--color-secondary);">
            <span class="material-symbols-outlined">search_off</span>
            No se encontraron ciudades
          </div>
        </div>
      </div>

      <!-- Icono de ubicación (decorativo) -->
      <div style="display:flex; gap: var(--space-sm); color: var(--color-primary);">
        <button
          class="btn-save-city"
          style="border-radius: var(--radius-full); width:3.6rem; height:3.6rem;"
          title="Usar mi ubicación"
          aria-label="Usar mi ubicación"
          @click="$emit('use-location')"
        >
          <span class="material-symbols-outlined" style="font-size:2rem;">my_location</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  searchCities: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['city-selected', 'use-location'])

const query        = ref('')
const suggestions  = ref([])
const showSuggestions = ref(false)
const isSearching  = ref(false)
const searchContainerRef = ref(null)
let debounceTimer  = null

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

function onSearchEnter() {
  if (suggestions.value.length > 0) {
    selectCity(suggestions.value[0])
  }
}

function closeSuggestions() {
  showSuggestions.value = false
}

// Cerrar dropdown al hacer clic fuera
function handleClickOutside(e) {
  if (searchContainerRef.value && !searchContainerRef.value.contains(e.target)) {
    showSuggestions.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>
