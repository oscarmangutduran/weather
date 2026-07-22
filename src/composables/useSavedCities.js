/**
 * useSavedCities.js
 * Composable para gestionar las ciudades guardadas en localStorage.
 */

import { ref, watch } from 'vue'

const STORAGE_KEY = 'meteoredict_saved_cities'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useSavedCities() {
  const savedCities = ref(loadFromStorage())

  // Persistir automáticamente en localStorage cuando cambia la lista
  watch(
    savedCities,
    (newList) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList))
    },
    { deep: true }
  )

  /**
   * Guarda una ciudad en la lista.
   * Evita duplicados comparando latitud y longitud.
   * @param {Object} city - Objeto de ciudad con al menos name, country, latitude, longitude
   * @returns {boolean} - true si se guardó, false si ya existía
   */
  function saveCity(city) {
    const exists = savedCities.value.some(
      (c) => c.latitude === city.latitude && c.longitude === city.longitude
    )
    if (exists) return false

    savedCities.value = [
      ...savedCities.value,
      {
        id:        `${city.latitude}_${city.longitude}`,
        name:      city.name,
        country:   city.country ?? '',
        latitude:  city.latitude,
        longitude: city.longitude,
        admin1:    city.admin1 ?? '',
      },
    ]
    return true
  }

  /**
   * Elimina una ciudad de la lista por su id
   * @param {string} cityId
   */
  function removeCity(cityId) {
    savedCities.value = savedCities.value.filter((c) => c.id !== cityId)
  }

  /**
   * Comprueba si una ciudad ya está guardada
   * @param {Object} city
   * @returns {boolean}
   */
  function isCitySaved(city) {
    if (!city) return false
    return savedCities.value.some(
      (c) => c.latitude === city.latitude && c.longitude === city.longitude
    )
  }

  return {
    savedCities,
    saveCity,
    removeCity,
    isCitySaved,
  }
}
