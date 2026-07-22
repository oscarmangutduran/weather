<template>
  <div class="app-layout">
    <!-- Header con buscador desktop -->
    <AppHeader
      :search-cities="searchCities"
      @city-selected="onCitySelected"
      @use-location="onUseLocation"
    />

    <!-- Layout principal -->
    <div class="main-container">
      <!-- Sidebar ciudades guardadas (desktop) -->
      <SavedCities
        :saved-cities="savedCities"
        :active-city="currentCity"
        @select-city="onCitySelected"
        @remove-city="onRemoveCity"
        @open-search="focusMobileSearch"
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
              @click="focusMobileSearch"
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
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import AppHeader       from './components/Header.vue'
import SearchBar       from './components/SearchBar.vue'
import CurrentWeather  from './components/CurrentWeather.vue'
import HourlyForecast  from './components/HourlyForecast.vue'
import SavedCities     from './components/SavedCities.vue'
import AppFooter       from './components/Footer.vue'
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

function focusMobileSearch() {
  nextTick(() => {
    const input = document.getElementById('mobile-search-input')
    if (input) input.focus()
  })
}
</script>

<style scoped>
.weather-results {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
</style>
