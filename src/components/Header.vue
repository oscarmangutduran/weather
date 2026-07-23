<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo -->
      <a href="#" class="app-logo">
        <span class="material-symbols-outlined icon-filled" style="font-size:2.4rem; vertical-align:-0.4rem;">cloud</span>
        Atmosfere
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
    <div class="mobile-menu" :class="{ 'is-open': menuOpen }" :aria-hidden="!menuOpen">

      <!-- Buscador -->
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

      <!-- Botón de ubicación -->
      <button
        class="mobile-location-btn"
        @click="onMobileLocation"
        aria-label="Usar mi ubicación"
      >
        <span class="material-symbols-outlined">my_location</span>
        Usar mi ubicación
      </button>

      <!-- Separador -->
      <hr class="mobile-menu-divider" />

      <!-- Sección: Mis Ciudades -->
      <div class="mobile-saved-section">
        <div class="mobile-saved-header">
          <span class="material-symbols-outlined icon-filled" style="font-size:2rem; color:var(--color-primary);">cloud</span>
          <div>
            <h2 class="mobile-saved-title">Mis Ciudades</h2>
            <p class="mobile-saved-subtitle">Gestiona tus ubicaciones</p>
          </div>
        </div>

        <!-- Lista de ciudades guardadas -->
        <ul class="mobile-saved-list" aria-label="Ciudades guardadas">
          <template v-if="savedCities.length > 0">
            <li
              v-for="city in savedCities"
              :key="city.id"
              class="mobile-saved-item"
              :class="{ active: isActive(city) }"
              role="button"
              tabindex="0"
              :aria-label="`Ver clima de ${city.name}`"
              @click="selectSavedCity(city)"
              @keydown.enter="selectSavedCity(city)"
            >
              <div class="mobile-saved-info">
                <span class="material-symbols-outlined" style="font-size:1.8rem; color:var(--color-secondary); flex-shrink:0;">location_on</span>
                <div>
                  <div class="mobile-saved-name">{{ city.name }}</div>
                  <div class="mobile-saved-country">{{ city.country }}</div>
                </div>
              </div>
              <button
                class="btn-delete-city"
                :aria-label="`Eliminar ${city.name}`"
                :title="`Eliminar ${city.name}`"
                @click.stop="$emit('remove-city', city)"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </li>
          </template>
          <!-- Estado vacío -->
          <li v-else class="mobile-saved-empty" aria-live="polite">
            <span class="material-symbols-outlined">bookmark_border</span>
            Aún no tienes ciudades guardadas. Busca una ciudad y guárdala.
          </li>
        </ul>

        <!-- Botón añadir ciudad -->
        <button class="btn-add-city mobile-add-btn" @click="onOpenSearch" aria-label="Añadir nueva ciudad">
          <span class="material-symbols-outlined">add</span>
          Añadir Ciudad
        </button>
      </div>
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
  searchCities: { type: Function, required: true },
  savedCities:  { type: Array,    default: () => [] },
  activeCity:   { type: Object,   default: null },
})

const emit = defineEmits(['city-selected', 'use-location', 'remove-city', 'open-search'])

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
  document.body.style.overflow = menuOpen.value ? 'hidden' : ''
  if (!menuOpen.value) closeSuggestions()
}

function closeMenu() {
  menuOpen.value = false
  document.body.style.overflow = ''
  closeSuggestions()
}

// --- Ciudades guardadas ---
function isActive(city) {
  return props.activeCity
    && props.activeCity.latitude  === city.latitude
    && props.activeCity.longitude === city.longitude
}

function selectSavedCity(city) {
  emit('city-selected', city)
  closeMenu()
}

function onOpenSearch() {
  emit('open-search')
  closeMenu()
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
  if (suggestions.value.length > 0) selectCity(suggestions.value[0])
}

function onSearchEnterMobile() {
  if (suggestions.value.length > 0) selectCityMobile(suggestions.value[0])
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
  if (!inDesktop && !inMobile) showSuggestions.value = false
}

// Cerrar con Escape
function handleKeydown(e) {
  if (e.key === 'Escape' && menuOpen.value) closeMenu()
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
