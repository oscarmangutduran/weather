<template>
  <section class="hourly-section">
    <div class="section-header">
      <h2 class="section-title">Próximas 12 horas</h2>
      <div class="section-header-actions">
        <!-- Botones de navegación -->
        <div class="scroll-nav-btns">
          <button
            class="scroll-nav-btn"
            :disabled="isAtStart"
            aria-label="Desplazar a la izquierda"
            title="Anterior"
            @click="scrollLeft"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            class="scroll-nav-btn"
            :disabled="isAtEnd"
            aria-label="Desplazar a la derecha"
            title="Siguiente"
            @click="scrollRight"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <!-- Guardar ciudad -->
        <button
          class="btn-ver-detalles"
          @click="$emit('save-city')"
          :title="isSaved ? 'Ciudad ya guardada' : 'Guardar ciudad'"
        >
          <span
            class="material-symbols-outlined"
            :class="{ 'icon-filled': isSaved }"
            style="font-size:1.6rem; vertical-align:-0.3rem;"
          >
            {{ isSaved ? 'bookmark' : 'bookmark_add' }}
          </span>
          {{ isSaved ? 'Ciudad guardada' : 'Guardar ciudad' }}
        </button>
      </div>
    </div>

    <!-- Contenedor del scroll con referencia -->
    <div class="hourly-scroll-wrapper">
      <div
        ref="scrollRef"
        class="hourly-scroll"
        aria-label="Previsión por horas"
        @scroll="onScroll"
      >
        <div
          v-for="(slot, idx) in forecast"
          :key="idx"
          class="hourly-card"
          :class="{ 'current-hour': slot.isCurrent }"
          :title="slot.description"
        >
          <span
            class="text-label-sm hourly-time"
            :class="{ secondary: !slot.isCurrent }"
          >
            {{ slot.time }}
          </span>
          <span
            class="material-symbols-outlined hourly-icon"
            :class="{
              'icon-filled': slot.iconFilled,
              cloud: isCloudIcon(slot.icon),
            }"
          >
            {{ slot.icon }}
          </span>
          <span class="hourly-temp">{{ slot.temperature }}°</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUpdated } from 'vue'

defineProps({
  forecast: { type: Array, required: true },
  isSaved:  { type: Boolean, default: false },
})

defineEmits(['save-city'])

const CLOUD_ICONS = new Set(['cloud', 'foggy', 'ac_unit', 'weather_snowy', 'weather_hail'])

function isCloudIcon(icon) {
  return CLOUD_ICONS.has(icon)
}

// ---- Scroll navigation ----
const scrollRef = ref(null)
const isAtStart = ref(true)
const isAtEnd   = ref(false)
const SCROLL_STEP = 256 // px por clic

function scrollLeft() {
  if (scrollRef.value) {
    scrollRef.value.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' })
  }
}

function scrollRight() {
  if (scrollRef.value) {
    scrollRef.value.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' })
  }
}

function onScroll() {
  const el = scrollRef.value
  if (!el) return
  isAtStart.value = el.scrollLeft <= 4
  isAtEnd.value   = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
}

function checkScrollState() {
  const el = scrollRef.value
  if (!el) return
  isAtStart.value = el.scrollLeft <= 4
  isAtEnd.value   = el.scrollWidth <= el.clientWidth
}

onMounted(checkScrollState)
onUpdated(checkScrollState)
</script>

<style scoped>
.section-header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.scroll-nav-btns {
  display: flex;
  gap: var(--space-xs);
}

.scroll-nav-btn {
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--color-outline-variant);
  color: var(--color-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.scroll-nav-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: var(--color-on-primary);
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(0, 88, 188, 0.25);
}

.scroll-nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.scroll-nav-btn .material-symbols-outlined {
  font-size: 2rem;
}

.hourly-scroll-wrapper {
  position: relative;
}
</style>
