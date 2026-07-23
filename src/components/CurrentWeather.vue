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

        <!-- Humedad -->
        <div class="weather-stats">
          <div class="stat-item">
            <span class="material-symbols-outlined">humidity_percentage</span>
            <div>
              <div class="stat-label">Humedad</div>
              <div class="stat-value">{{ weather.humidity }}%</div>
            </div>
          </div>
          <div class="stat-divider"></div>

          <!-- Widget viento estilo Windy -->
          <div class="wind-widget">
            <!-- Brújula SVG -->
            <div class="wind-compass" :title="`Viento procedente del ${weather.windDirection}`">
              <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
                <!-- Anillo exterior -->
                <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
                <!-- Anillo interior track -->
                <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="10"/>
                <!-- Arc de intensidad coloreado -->
                <circle
                  cx="40" cy="40" r="28"
                  fill="none"
                  :stroke="windColor"
                  stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="`${windArcLength} 200`"
                  stroke-dashoffset="44"
                  transform="rotate(-90 40 40)"
                  opacity="0.85"
                />
                <!-- Marcas cardinales -->
                <text x="40" y="8"  text-anchor="middle" class="compass-letter">N</text>
                <text x="74" y="44" text-anchor="middle" class="compass-letter">E</text>
                <text x="40" y="78" text-anchor="middle" class="compass-letter">S</text>
                <text x="6"  y="44" text-anchor="middle" class="compass-letter">O</text>
                <!-- Flecha de dirección -->
                <g :transform="`rotate(${weather.windDirDeg} 40 40)`" style="transition: transform 0.8s cubic-bezier(.4,2,.6,1)">
                  <!-- Cola -->
                  <polygon points="40,52 37,62 40,58 43,62" fill="rgba(255,255,255,0.3)"/>
                  <!-- Punta -->
                  <polygon points="40,28 36,40 40,36 44,40" :fill="windColor"/>
                </g>
                <!-- Punto central -->
                <circle cx="40" cy="40" r="3" :fill="windColor"/>
              </svg>
            </div>

            <!-- Datos textuales -->
            <div class="wind-data">
              <div class="wind-speed-value" :style="{ color: windColor }">
                {{ weather.windSpeed }}
                <span class="wind-unit">km/h</span>
              </div>
              <div class="wind-dir-label">{{ weather.windDirection }}</div>
              <div class="wind-beaufort-badge" :style="{ background: windColorBg, color: windColor }">
                <span class="bft-num">B{{ weather.windBeaufort }}</span>
                <span class="bft-sep">·</span>
                <span class="bft-label">{{ weather.windBeaufortLabel }}</span>
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

// Color dinámico según velocidad del viento (estilo Windy)
const windColor = computed(() => {
  const s = props.weather.windSpeed ?? 0
  if (s < 10)  return '#60a5fa'   // calma – azul claro
  if (s < 20)  return '#3b82f6'   // flojo – azul
  if (s < 35)  return '#facc15'   // moderado – amarillo
  if (s < 50)  return '#fb923c'   // fuerte – naranja
  if (s < 70)  return '#f87171'   // muy fuerte – rojo
  return '#c084fc'                // temporal/huracán – violeta
})

const windColorBg = computed(() => {
  const s = props.weather.windSpeed ?? 0
  if (s < 10)  return 'rgba(96,165,250,0.12)'
  if (s < 20)  return 'rgba(59,130,246,0.12)'
  if (s < 35)  return 'rgba(250,204,21,0.12)'
  if (s < 50)  return 'rgba(251,146,60,0.12)'
  if (s < 70)  return 'rgba(248,113,113,0.12)'
  return 'rgba(192,132,252,0.12)'
})

// Longitud del arco SVG proporcional a la intensidad (máx Beaufort 12 → 175.9 = perímetro del r=28)
const windArcLength = computed(() => {
  const level = Math.min(props.weather.windBeaufort ?? 0, 12)
  return Math.round((level / 12) * 175.9)
})

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
/* ── Widget de viento estilo Windy ─────────────────────────── */
.wind-widget {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.wind-compass {
  flex-shrink: 0;
  filter: drop-shadow(0 0 8px rgba(74,222,170,0.25));
}

.compass-letter {
  fill: rgba(255,255,255,0.45);
  font-size: 9px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  letter-spacing: 0;
}

.wind-data {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.wind-speed-value {
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.4s ease;
}

.wind-unit {
  font-size: 1.2rem;
  font-weight: 500;
  opacity: 0.7;
  margin-left: 0.2rem;
}

.wind-dir-label {
  font-size: 1.3rem;
  font-weight: 600;
  opacity: 0.65;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.wind-beaufort-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 10rem;
  font-size: 1.15rem;
  font-weight: 700;
  transition: background 0.4s ease, color 0.4s ease;
  margin-top: 0.2rem;
  width: fit-content;
}

.bft-num { font-weight: 800; }
.bft-sep { opacity: 0.5; }
.bft-label { font-weight: 600; }


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
