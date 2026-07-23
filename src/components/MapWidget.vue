<template>
  <section class="map-widget glass-card" aria-label="Mapa de viento Windy">
    <div class="map-widget-header">
      <!-- Icono + título -->
      <div class="map-header-left">
        <img
          src="https://www.windy.com/img/windy_black.svg"
          alt="Windy"
          class="windy-logo"
          onerror="this.style.display='none'"
        />
        <h3 class="map-widget-title">Viento — {{ cityName }}</h3>
      </div>

      <!-- Selector de capa -->
      <div class="layer-pills">
        <button
          v-for="layer in layers"
          :key="layer.id"
          class="layer-pill"
          :class="{ active: activeLayer === layer.id }"
          @click="activeLayer = layer.id"
        >
          <span class="material-symbols-outlined" style="font-size:1.4rem;">{{ layer.icon }}</span>
          {{ layer.label }}
        </button>
      </div>

      <!-- Abrir en Windy -->
      <a
        :href="windyUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="map-open-link"
        title="Abrir en Windy"
        aria-label="Abrir en Windy"
      >
        <span class="material-symbols-outlined" style="font-size:1.8rem;">open_in_new</span>
        Windy
      </a>
    </div>

    <!-- Iframe Windy -->
    <div class="map-iframe-wrapper">
      <iframe
        :key="iframeKey"
        :src="windyEmbedUrl"
        title="Mapa de viento Windy"
        class="map-iframe"
        loading="lazy"
        allow="fullscreen"
        frameborder="0"
      ></iframe>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  cityName:  { type: String, required: true },
  latitude:  { type: Number, required: true },
  longitude: { type: Number, required: true },
})

// Capas disponibles
const layers = [
  { id: 'wind',   label: 'Viento',      icon: 'air'           },
  { id: 'rain',   label: 'Lluvia',      icon: 'rainy'         },
  { id: 'temp',   label: 'Temperatura', icon: 'thermometer'   },
  { id: 'clouds', label: 'Nubes',       icon: 'cloud'         },
]

const activeLayer = ref('wind')

// Forzar recarga del iframe al cambiar capa o ciudad
const iframeKey = ref(0)
watch([activeLayer, () => props.latitude, () => props.longitude], () => {
  iframeKey.value++
})

// URL del embed oficial de Windy
// Docs: https://api.windy.com/embed
const windyEmbedUrl = computed(() => {
  const lat = props.latitude.toFixed(3)
  const lon = props.longitude.toFixed(3)
  const params = new URLSearchParams({
    lat,
    lon,
    detailLat: lat,
    detailLon: lon,
    width:       '100%',
    height:      '450',
    zoom:        '8',
    level:       'surface',
    overlay:     activeLayer.value,
    product:     'ecmwf',
    message:     'true',
    marker:      'true',
    calendar:    'now',
    pressure:    '',
    type:        'map',
    location:    'coordinates',
    detail:      'true',
    metricWind:  'km%2Fh',
    metricTemp:  '%C2%B0C',
    radarRange:  '-1',
  })
  return `https://embed.windy.com/embed2.html?${params.toString()}`
})

// Enlace directo a Windy
const windyUrl = computed(() => {
  const lat = props.latitude.toFixed(3)
  const lon = props.longitude.toFixed(3)
  return `https://www.windy.com/${lat}/${lon}?wind,${lat},${lon},8`
})
</script>

<style scoped>
.map-widget {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Header ─────────────────────────────────────────────── */
.map-widget-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  border-bottom: 1px solid rgba(193, 198, 215, 0.2);
  flex-wrap: wrap;
}

.map-header-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
  min-width: 0;
}

.windy-logo {
  height: 2rem;
  width: auto;
  filter: brightness(0) invert(1) opacity(0.9);
  flex-shrink: 0;
}

.map-widget-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-on-surface);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Selector de capas ───────────────────────────────────── */
.layer-pills {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.layer-pill {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-size: 1.2rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.layer-pill:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
}

.layer-pill.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  font-weight: 700;
}

/* ── Botón abrir Windy ───────────────────────────────────── */
.map-open-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  border: 1px solid rgba(0, 88, 188, 0.3);
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.map-open-link:hover {
  background: var(--color-primary);
  color: #fff;
}

/* ── Iframe ──────────────────────────────────────────────── */
.map-iframe-wrapper {
  position: relative;
  width: 100%;
  height: 38rem;
  flex-shrink: 0;
}

.map-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* Tablet y móvil */
@media (max-width: 768px) {
  .map-widget-header {
    gap: var(--space-xs);
  }
  .layer-pill {
    padding: 0.3rem 0.6rem;
    font-size: 1.1rem;
  }
  .map-iframe-wrapper {
    height: 28rem;
  }
}

@media (max-width: 576px) {
  .layer-pills {
    order: 3;
    width: 100%;
  }
  .map-iframe-wrapper {
    height: 24rem;
  }
}
</style>
