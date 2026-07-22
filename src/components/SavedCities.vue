<template>
  <aside class="sidebar">
    <div class="sidebar-card">
      <!-- Encabezado -->
      <div class="sidebar-header">
        <div class="sidebar-avatar" aria-hidden="true">
          <span class="material-symbols-outlined icon-filled" style="font-size:2rem;">cloud</span>
        </div>
        <div>
          <h2 class="sidebar-title">Mis Ciudades</h2>
          <p class="sidebar-subtitle">Gestiona tus ubicaciones</p>
        </div>
      </div>

      <!-- Lista de ciudades guardadas -->
      <ul class="saved-cities-list" aria-label="Ciudades guardadas">
        <template v-if="savedCities.length > 0">
          <li
            v-for="city in savedCities"
            :key="city.id"
            class="saved-city-item"
            :class="{ active: isActive(city) }"
            role="button"
            :aria-label="`Ver clima de ${city.name}`"
            tabindex="0"
            @click="$emit('select-city', city)"
            @keydown.enter="$emit('select-city', city)"
          >
            <div class="saved-city-info">
              <span class="material-symbols-outlined" style="font-size:1.8rem; color:var(--color-secondary); flex-shrink:0;">location_on</span>
              <div style="min-width:0;">
                <div class="saved-city-name">{{ city.name }}</div>
                <div class="saved-city-country">{{ city.country }}</div>
              </div>
            </div>
            <!-- Botón eliminar -->
            <button
              class="btn-delete-city"
              :aria-label="`Eliminar ${city.name}`"
              :title="`Eliminar ${city.name}`"
              @click.stop="confirmDelete(city)"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </li>
        </template>
        <!-- Estado vacío -->
        <li v-else class="no-saved-cities" aria-live="polite">
          <span class="material-symbols-outlined">bookmark_border</span>
          Aún no tienes ciudades guardadas. Busca una ciudad y guárdala.
        </li>
      </ul>

      <!-- Botón añadir ciudad (abre búsqueda) -->
      <button class="btn-add-city" @click="$emit('open-search')" aria-label="Añadir nueva ciudad">
        <span class="material-symbols-outlined">add</span>
        Añadir Ciudad
      </button>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  savedCities:  { type: Array,  required: true },
  activeCity:   { type: Object, default: null   },
})

const emit = defineEmits(['select-city', 'remove-city', 'open-search'])

function isActive(city) {
  return props.activeCity
    && props.activeCity.latitude  === city.latitude
    && props.activeCity.longitude === city.longitude
}

function confirmDelete(city) {
  emit('remove-city', city)
}
</script>
