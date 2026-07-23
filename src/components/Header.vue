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

      <!-- Acciones Desktop -->
      <div class="header-actions">
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

      <!-- Botón Hamburguesa (Móvil / Tablet) -->
      <button
        class="hamburger-btn"
        :class="{ 'is-open': menuOpen }"
        @click="toggleMenu"
        :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
        :aria-expanded="menuOpen"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <!-- Menú móvil desplegable -->
    <div class="mobile-menu" :class="{ 'is-open': menuOpen }" aria-hidden="!menuOpen">
      <div class="mobile-search-wrapper" ref="mobileSearchRef">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          id="mobile-search-input"
          type="text"
          v-model="query"
          @input="onInput"
          @keydown.enter.prevent="onSearchEnterMobile"
          @keydown.escape="closeSuggestions"
          placeholder="Buscar ciudad..."
          autocomplete="off"
          aria-label="Buscar ciudad en móvil"
        />
        <!-- Sugerencias móvil -->
        <ul
          v-if="showSuggestions && suggestions.length > 0"
          class="suggestions-dropdown"
          role="listbox"
        >
          <li
            v-for="(city, idx) in suggestions"
            :key="'mob-' + idx"
            class="suggestion-item"
            role="option"
            @mousedown.prevent="selectCityMobile(city)"
          >
            <span class="material-symbols-outlined">location_on</span>
            <div class="suggestion-info">
              <span>
                <strong>{{ city.name }}</strong>
                <span v-if="city.admin1">, {{ city.admin1 }}</span>
                <span v-if="city.country"> — {{ city.country }}</span>
              </span>
            </div>
          </li>
        </ul>
        <!-- Sin resultados móvil -->
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

      <!-- Botón de ubicación en el menú móvil -->
      <button
        class="mobile-location-btn"
        @click="onMobileLocation"
        aria-label="Usar mi ubicación"
      >
        <span class="material-symbols-outlined">my_location</span>
        Usar mi ubicación
      </button>
    </div>

    <!-- Overlay para cerrar el menú -->
    <div v-if="menuOpen" class="menu-overlay" @click="closeMenu"></div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

function formatPopulation(n) {
  return n.toLocaleString('es-ES')
}

const props = defineProps({
  searchCities: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['city-selected', 'use-location'])

const query           = ref('')
const suggestions     = ref([])
const showSuggestions = ref(false)
const isSearching     = ref(false)
const searchContainerRef = ref(null)
const mobileSearchRef    = ref(null)
const menuOpen        = ref(false)
let debounceTimer     = null

// --- Hamburguesa ---
function toggleMenu() {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
    closeSuggestions()
  }
}

function closeMenu() {
  menuOpen.value = false
  document.body.style.overflow = ''
  closeSuggestions()
}

// --- Búsqueda ---
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

function selectCityMobile(city) {
  selectCity(city)
  closeMenu()
}

function onSearchEnter() {
  if (suggestions.value.length > 0) {
    selectCity(suggestions.value[0])
  }
}

function onSearchEnterMobile() {
  if (suggestions.value.length > 0) {
    selectCityMobile(suggestions.value[0])
  }
}

function onMobileLocation() {
  emit('use-location')
  closeMenu()
}

function closeSuggestions() {
  showSuggestions.value = false
}

// Cerrar dropdown al hacer clic fuera
function handleClickOutside(e) {
  const inDesktop = searchContainerRef.value && searchContainerRef.value.contains(e.target)
  const inMobile  = mobileSearchRef.value   && mobileSearchRef.value.contains(e.target)
  if (!inDesktop && !inMobile) {
    showSuggestions.value = false
  }
}

// Cerrar con Escape
function handleKeydown(e) {
  if (e.key === 'Escape' && menuOpen.value) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>
