<template>
  <div class="weather-grid">
    <!-- Tarjeta principal: clima actual -->
    <section class="current-weather-card">
      <div class="weather-decoration" aria-hidden="true"></div>

      <!-- Header de la tarjeta -->
      <div class="weather-card-header">
        <div>
          <div class="city-name-row">
            <span class="material-symbols-outlined icon-filled" style="font-size:2.4rem; color:var(--color-primary);">location_on</span>
            <h2 class="city-name">{{ weather.city }}, {{ weather.country }}</h2>
          </div>
          <p class="weather-date">{{ weather.date }}</p>
        </div>
        <!-- Botón guardar ciudad -->
        <button
          class="btn-save-city"
          :class="{ saved: isSaved }"
          :title="isSaved ? 'Ciudad guardada' : 'Guardar ciudad'"
          :aria-label="isSaved ? 'Ciudad guardada' : 'Guardar ciudad'"
          @click="$emit('toggle-save')"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': isSaved }">
            {{ isSaved ? 'bookmark' : 'bookmark_add' }}
          </span>
        </button>
      </div>

      <!-- Cuerpo: temperatura + stats -->
      <div class="weather-body">
        <div class="temp-section">
          <span
            class="material-symbols-outlined weather-icon-main"
            :class="{ 'icon-filled': weather.iconFilled }"
          >
            {{ weather.icon }}
          </span>
          <div>
            <div class="temperature-display">{{ weather.temperature }}°</div>
            <div class="weather-description">{{ weather.description }}</div>
          </div>
        </div>

        <!-- Humedad y Viento -->
        <div class="weather-stats">
          <div class="stat-item">
            <span class="material-symbols-outlined">humidity_percentage</span>
            <div>
              <div class="stat-label">Humedad</div>
              <div class="stat-value">{{ weather.humidity }}%</div>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span
              class="material-symbols-outlined wind-arrow"
              :style="{ transform: `rotate(${weather.windDirDeg}deg)` }"
              title="Dirección del viento"
            >navigation</span>
            <div>
              <div class="stat-label">Viento &middot; {{ weather.windDirection }}</div>
              <div class="stat-value">{{ weather.windSpeed }} km/h</div>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="material-symbols-outlined">air</span>
            <div>
              <div class="stat-label">Fuerza</div>
              <div class="stat-value">
                B{{ weather.windBeaufort }}
                <span class="beaufort-label">&middot; {{ weather.windBeaufortLabel }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Columna de detalles adicionales -->
    <div class="details-column">
      <!-- Sensación térmica -->
      <div class="detail-chip">
        <div class="detail-chip-left">
          <span class="material-symbols-outlined">device_thermostat</span>
          Sensación térmica
        </div>
        <span class="detail-chip-value">{{ feelsLike }}°</span>
      </div>

      <!-- Índice UV (estimado por descripción) -->
      <div class="detail-chip">
        <div class="detail-chip-left">
          <span class="material-symbols-outlined">light_mode</span>
          Índice UV
        </div>
        <div :class="uvBadgeClass">
          <span class="badge-dot"></span>
          {{ uvLabel }}
        </div>
      </div>

      <!-- Calidad del Aire -->
      <div class="detail-chip">
        <div class="detail-chip-left">
          <span class="material-symbols-outlined">masks</span>
          Calidad del Aire
        </div>
        <div :class="airQualityClass">
          <span class="badge-dot"></span>
          {{ airQualityLabel }}
        </div>
      </div>

      <!-- Visibilidad estimada -->
      <div class="detail-chip">
        <div class="detail-chip-left">
          <span class="material-symbols-outlined">visibility</span>
          Visibilidad
        </div>
        <span class="detail-chip-value">{{ visibilityLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  weather: { type: Object, required: true },
  isSaved: { type: Boolean, default: false },
})

defineEmits(['toggle-save'])

// Sensación térmica simplificada (estimación con viento)
const feelsLike = computed(() => {
  const t = props.weather.temperature
  const w = props.weather.windSpeed
  if (w > 20) return Math.round(t - (w * 0.1))
  return Math.round(t - 1)
})

// Índice UV estimado según código climático
const uvBadgeClass = computed(() => {
  const icon = props.weather.icon
  if (icon === 'sunny') return 'badge-uv badge-uv--high'
  if (icon === 'partly_cloudy_day') return 'badge-uv badge-uv--medium'
  return 'badge-uv badge-uv--low'
})

const uvLabel = computed(() => {
  const icon = props.weather.icon
  if (icon === 'sunny') return 'Alto (7)'
  if (icon === 'partly_cloudy_day') return 'Moderado (4)'
  return 'Bajo (1)'
})

// Calidad del aire estimada por humedad
const airQualityClass = computed(() => {
  const h = props.weather.humidity
  if (h > 80) return 'badge-air badge-air--moderate'
  return 'badge-air-good'
})

const airQualityLabel = computed(() => {
  const h = props.weather.humidity
  if (h > 80) return 'Moderada'
  return 'Buena'
})

// Visibilidad estimada
const visibilityLabel = computed(() => {
  const icon = props.weather.icon
  if (icon === 'foggy') return '< 2 km'
  if (icon === 'rainy' || icon === 'thunderstorm') return '5 km'
  if (icon === 'cloud') return '8 km'
  return '10 km'
})
</script>

<style scoped>
/* Flecha de dirección del viento */
.wind-arrow {
  transition: transform 0.6s ease;
  color: var(--color-primary);
}

/* Etiqueta descriptiva de la fuerza Beaufort */
.beaufort-label {
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.75;
}


.badge-uv {
  background: #FFF8E1;
  color: #F57F17;
  border-radius: var(--radius-full);
  padding: var(--space-xs) var(--space-sm);
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-uv--medium {
  background: #FFF3E0;
  color: #E65100;
}

.badge-uv--low {
  background: #E8F5E9;
  color: #2E7D32;
}

.badge-air {
  border-radius: var(--radius-full);
  padding: var(--space-xs) var(--space-sm);
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-air--moderate {
  background: #FFF8E1;
  color: #F57F17;
}
</style>
