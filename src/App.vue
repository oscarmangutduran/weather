<template>
  <div class="app-layout">
    <!-- Header con buscador desktop -->
    <AppHeader
      :search-cities="searchCities"
      :saved-cities="savedCities"
      :active-city="currentCity"
      @city-selected="onCitySelected"
      @use-location="onUseLocation"
      @remove-city="onRemoveCity"
      @open-search="openSearchModal"
    />

    <!-- Layout principal -->
    <div class="main-container">
      <!-- Sidebar ciudades guardadas (desktop) -->
      <SavedCities
        :saved-cities="savedCities"
        :active-city="currentCity"
        @select-city="onCitySelected"
        @remove-city="onRemoveCity"
        @open-search="openSearchModal"
      />

      <!-- Contenido central -->
      <main class="main-content" id="main-content">
        <!-- Buscador móvil -->
        <SearchBar
          ref="mobileSearchRef"
          :search-cities="searchCities"
          @city-selected="onCitySelected"
        />

        <!-- Estado de carga -->
        <div v-if="isLoading" class="loading-state" aria-live="polite" aria-label="Cargando clima">
          <div class="spinner"></div>
          <p class="text-body-md" style="color:var(--color-secondary);">Obteniendo el clima…</p>
        </div>

        <!-- Estado de bienvenida (sin ciudad seleccionada) -->
        <Transition name="fade">
          <div v-if="!isLoading && !weatherData" class="welcome-state">
            <span class="material-symbols-outlined welcome-icon icon-filled">cloud_queue</span>
            <h2>¡Bienvenido a WeatherNow!</h2>
            <p>Busca cualquier ciudad del mundo para ver el clima actual y el pronóstico de las próximas 12 horas.</p>
            <button
              class="btn-add-city"
              style="width:auto; padding: var(--space-sm) var(--space-xl);"
              @click="openSearchModal"
            >
              <span class="material-symbols-outlined">search</span>
              Buscar una ciudad
            </button>
          </div>
        </Transition>

        <!-- Datos del clima -->
        <Transition name="slide-up">
          <div v-if="!isLoading && weatherData" class="weather-results">
            <!-- Tarjeta clima actual + detalles -->
            <CurrentWeather
              :weather="weatherData"
              :is-saved="isCitySaved(currentCity)"
              @toggle-save="toggleSaveCurrentCity"
            />

            <!-- Pronóstico por horas -->
            <HourlyForecast
              :forecast="hourlyForecast"
              :is-saved="isCitySaved(currentCity)"
              @save-city="toggleSaveCurrentCity"
            />

            <!-- Widget de mapa -->
            <MapWidget
              :city-name="weatherData.city + ', ' + weatherData.country"
              :latitude="currentCity.latitude"
              :longitude="currentCity.longitude"
            />
          </div>
        </Transition>
      </main>
    </div>

    <!-- Footer -->
    <AppFooter />

    <!-- Modal de Error (Bootstrap 5) -->
    <div
      class="modal fade"
      id="errorModal"
      tabindex="-1"
      aria-labelledby="errorModalLabel"
      aria-modal="true"
      role="dialog"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <div style="display:flex; align-items:center; gap:var(--space-sm);">
              <span class="material-symbols-outlined" style="font-size:2.4rem; color:var(--color-error);">error</span>
              <h5 class="modal-title text-headline-sm" id="errorModalLabel" style="margin:0; font-size:1.8rem; font-weight:600;">
                {{ modalTitle }}
              </h5>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            {{ modalMessage }}
          </div>
          <div class="modal-footer border-0">
            <button
              type="button"
              class="btn btn-primary btn-primary-custom"
              data-bs-dismiss="modal"
              style="font-size:1.4rem; font-family:'Inter',sans-serif;"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación: eliminar ciudad -->
    <div
      class="modal fade"
      id="deleteModal"
      tabindex="-1"
      aria-labelledby="deleteModalLabel"
      aria-modal="true"
      role="dialog"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <div style="display:flex; align-items:center; gap:var(--space-sm);">
              <span class="material-symbols-outlined" style="font-size:2.4rem; color:var(--color-error);">delete</span>
              <h5 class="modal-title" id="deleteModalLabel" style="margin:0; font-size:1.8rem; font-weight:600;">
                Eliminar ciudad
              </h5>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body" style="font-size:1.4rem;">
            ¿Deseas eliminar <strong>{{ cityToDelete?.name }}</strong> de tus ciudades guardadas?
          </div>
          <div class="modal-footer border-0">
            <button
              type="button"
              class="btn btn-outline-secondary"
              data-bs-dismiss="modal"
              style="font-size:1.4rem; font-family:'Inter',sans-serif; border-radius:var(--radius-full);"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-danger"
              data-bs-dismiss="modal"
              style="font-size:1.4rem; font-family:'Inter',sans-serif; border-radius:var(--radius-full);"
              @click="doRemoveCity"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: ciudad ya guardada -->
    <div
      class="modal fade"
      id="duplicateModal"
      tabindex="-1"
      aria-labelledby="duplicateModalLabel"
      aria-modal="true"
      role="dialog"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <div style="display:flex; align-items:center; gap:var(--space-sm);">
              <span class="material-symbols-outlined" style="font-size:2.4rem; color:var(--color-primary);">info</span>
              <h5 class="modal-title" id="duplicateModalLabel" style="margin:0; font-size:1.8rem; font-weight:600;">
                Ciudad ya guardada
              </h5>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body" style="font-size:1.4rem;">
            <strong>{{ weatherData?.city }}</strong> ya se encuentra en tu lista de ciudades guardadas.
          </div>
          <div class="modal-footer border-0">
            <button
              type="button"
              class="btn btn-primary btn-primary-custom"
              data-bs-dismiss="modal"
              style="font-size:1.4rem; font-family:'Inter',sans-serif;"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Añadir Ciudad (buscador) -->
    <div
      class="modal fade"
      id="addCityModal"
      tabindex="-1"
      aria-labelledby="addCityModalLabel"
      aria-modal="true"
      role="dialog"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <div style="display:flex; align-items:center; gap:var(--space-sm);">
              <span class="material-symbols-outlined" style="font-size:2.4rem; color:var(--color-primary);">add_location_alt</span>
              <h5 class="modal-title" id="addCityModalLabel" style="margin:0; font-size:1.8rem; font-weight:600;">
                Añadir Ciudad
              </h5>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" @click="clearModalSearch"></button>
          </div>
          <div class="modal-body" style="padding: var(--space-lg) !important;">
            <!-- Buscador dentro del modal -->
            <div class="modal-search-wrapper" ref="modalSearchRef">
              <span class="material-symbols-outlined modal-search-icon">search</span>
              <input
                id="modal-search-input"
                type="text"
                v-model="modalQuery"
                @input="onModalInput"
                @keydown.enter.prevent="onModalEnter"
                @keydown.escape="clearModalSearch"
                placeholder="Escribe el nombre de una ciudad..."
                autocomplete="off"
                class="modal-search-input"
              />
            </div>
            <!-- Sugerencias -->
            <ul v-if="modalSuggestions.length > 0" class="modal-suggestions" role="listbox">
              <li
                v-for="(city, idx) in modalSuggestions"
                :key="idx"
                class="suggestion-item"
                role="option"
                @mousedown.prevent="selectModalCity(city)"
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
              v-if="modalQuery.length >= 2 && modalSuggestions.length === 0 && !isModalSearching"
              class="modal-no-results"
            >
              <span class="material-symbols-outlined" style="font-size:3.2rem; color:var(--color-outline-variant);">search_off</span>
              <p>No se encontraron ciudades para "{{ modalQuery }}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

function formatPopulation(n) {
  return n.toLocaleString('es-ES')
}
import AppHeader       from './components/Header.vue'
import SearchBar       from './components/SearchBar.vue'
import CurrentWeather  from './components/CurrentWeather.vue'
import HourlyForecast  from './components/HourlyForecast.vue'
import SavedCities     from './components/SavedCities.vue'
import AppFooter       from './components/Footer.vue'
import MapWidget       from './components/MapWidget.vue'
import { useWeather }      from './composables/useWeather.js'
import { useSavedCities }  from './composables/useSavedCities.js'

// ---- Composables ----
const {
  weatherData,
  hourlyForecast,
  isLoading,
  error,
  currentCity,
  searchCities,
  loadWeather,
} = useWeather()

const {
  savedCities,
  saveCity,
  removeCity,
  isCitySaved,
} = useSavedCities()

// ---- Estado local ----
const mobileSearchRef = ref(null)
const cityToDelete    = ref(null)
const modalTitle      = ref('Error')
const modalMessage    = ref('')

// ---- Helpers para Modales Bootstrap ----
function openModal(id) {
  const el = document.getElementById(id)
  if (el && window.bootstrap) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(el)
    modal.show()
  }
}

// ---- Reaccionar al error de la API ----
watch(error, (newError) => {
  if (newError) {
    modalTitle.value = 'Ciudad no encontrada'
    modalMessage.value = 'No se pudo obtener el clima para la ciudad seleccionada. Por favor, inténtalo de nuevo con otro nombre.'
    openModal('errorModal')
  }
})

// ---- Eventos ----
async function onCitySelected(city) {
  await loadWeather(city)
}

function toggleSaveCurrentCity() {
  if (!currentCity.value) return
  if (isCitySaved(currentCity.value)) {
    // Mostrar modal de duplicado en lugar de solo quitar
    openModal('duplicateModal')
    return
  }
  saveCity(currentCity.value)
}

function onRemoveCity(city) {
  cityToDelete.value = city
  openModal('deleteModal')
}

function doRemoveCity() {
  if (cityToDelete.value) {
    removeCity(cityToDelete.value.id)
    cityToDelete.value = null
  }
}

function onUseLocation() {
  if (!navigator.geolocation) {
    modalTitle.value = 'Geolocalización no disponible'
    modalMessage.value = 'Tu navegador no soporta la geolocalización. Busca tu ciudad manualmente.'
    openModal('errorModal')
    return
  }
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords
      await loadWeather({
        name:      'Mi ubicación',
        country:   '',
        latitude,
        longitude,
      })
    },
    () => {
      modalTitle.value = 'Permiso denegado'
      modalMessage.value = 'No se pudo acceder a tu ubicación. Activa los permisos de geolocalización en tu navegador.'
      openModal('errorModal')
    }
  )
}

// ---- Modal de búsqueda (Añadir Ciudad) ----
const modalQuery       = ref('')
const modalSuggestions = ref([])
const isModalSearching = ref(false)
const modalSearchRef   = ref(null)
let modalDebounce      = null

function openSearchModal() {
  openModal('addCityModal')
  nextTick(() => {
    const input = document.getElementById('modal-search-input')
    if (input) input.focus()
  })
}

function onModalInput() {
  clearTimeout(modalDebounce)
  if (modalQuery.value.trim().length < 2) {
    modalSuggestions.value = []
    return
  }
  isModalSearching.value = true
  modalDebounce = setTimeout(async () => {
    modalSuggestions.value = await searchCities(modalQuery.value)
    isModalSearching.value = false
  }, 300)
}

function onModalEnter() {
  if (modalSuggestions.value.length > 0) selectModalCity(modalSuggestions.value[0])
}

function selectModalCity(city) {
  clearModalSearch()
  const el = document.getElementById('addCityModal')
  if (el && window.bootstrap) {
    window.bootstrap.Modal.getInstance(el)?.hide()
  }
  onCitySelected(city)
}

function clearModalSearch() {
  modalQuery.value = ''
  modalSuggestions.value = []
  isModalSearching.value = false
}
</script>

<style scoped>
.weather-results {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
</style>
