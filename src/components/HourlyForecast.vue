<template>
  <section class="hourly-section">
    <div class="section-header">
      <h2 class="section-title">Próximas 12 horas</h2>
      <button class="btn-ver-detalles" @click="$emit('save-city')" :title="isSaved ? 'Ciudad ya guardada' : 'Guardar ciudad'">
        <span class="material-symbols-outlined" :class="{ 'icon-filled': isSaved }" style="font-size:1.6rem; vertical-align:-0.3rem;">
          {{ isSaved ? 'bookmark' : 'bookmark_add' }}
        </span>
        {{ isSaved ? 'Ciudad guardada' : 'Guardar ciudad' }}
      </button>
    </div>

    <div class="hourly-scroll" aria-label="Previsión por horas">
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
  </section>
</template>

<script setup>
defineProps({
  forecast: { type: Array, required: true },
  isSaved:  { type: Boolean, default: false },
})

defineEmits(['save-city'])

const CLOUD_ICONS = new Set(['cloud', 'foggy', 'ac_unit', 'weather_snowy', 'weather_hail'])

function isCloudIcon(icon) {
  return CLOUD_ICONS.has(icon)
}
</script>
