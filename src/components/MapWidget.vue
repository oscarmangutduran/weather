<template>
  <section class="map-widget glass-card" aria-label="Mapa de la ciudad">
    <div class="map-widget-header">
      <span class="material-symbols-outlined icon-filled" style="color:var(--color-primary); font-size:2rem;">map</span>
      <h3 class="map-widget-title">Mapa — {{ cityName }}</h3>
      <!-- Enlace externo a Google Maps -->
      <a
        :href="googleMapsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="map-open-link"
        :title="`Ver ${cityName} en Google Maps`"
        aria-label="Abrir en Google Maps"
      >
        <span class="material-symbols-outlined" style="font-size:1.8rem;">open_in_new</span>
        Abrir mapa
      </a>
    </div>

    <!-- Iframe de Google Maps embed -->
    <div class="map-iframe-wrapper">
      <iframe
        :src="embedUrl"
        :title="`Mapa de ${cityName}`"
        class="map-iframe"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen
      ></iframe>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cityName:  { type: String, required: true },
  latitude:  { type: Number, required: true },
  longitude: { type: Number, required: true },
})

// URL del embed de Google Maps (iframe, sin API key)
const embedUrl = computed(() => {
  const q = encodeURIComponent(props.cityName)
  return `https://maps.google.com/maps?q=${q}&t=&z=12&ie=UTF8&iwloc=&output=embed`
})

// Enlace directo a Google Maps para abrir en nueva pestaña
const googleMapsUrl = computed(() => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.cityName)}`
})
</script>

<style scoped>
.map-widget {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.map-widget-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid rgba(193, 198, 215, 0.3);
}

.map-widget-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-on-surface);
  margin: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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
  border: 1px solid rgba(0, 88, 188, 0.25);
  transition: background 0.15s, color 0.15s;
}

.map-open-link:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.map-iframe-wrapper {
  position: relative;
  width: 100%;
  height: 28rem;
  flex-shrink: 0;
}

.map-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* Tablet y móvil: mapa más compacto */
@media (max-width: 576px) {
  .map-iframe-wrapper {
    height: 20rem;
  }
}
</style>
