/**
 * useWeather.js
 * Composable para consumir la API Open-Meteo.
 * - Geocoding para buscar ciudades
 * - Forecast para obtener clima actual y por horas
 */

import { ref } from 'vue'

// Mapa de WMO Weather Code → { descripción, icono Material Symbol }
const WMO_CODES = {
  0:  { desc: 'Despejado',               icon: 'sunny',              filled: true  },
  1:  { desc: 'Mayormente despejado',    icon: 'partly_cloudy_day',  filled: false },
  2:  { desc: 'Parcialmente nublado',    icon: 'partly_cloudy_day',  filled: false },
  3:  { desc: 'Nublado',                 icon: 'cloud',              filled: false },
  45: { desc: 'Niebla',                  icon: 'foggy',              filled: false },
  48: { desc: 'Niebla con escarcha',     icon: 'foggy',              filled: false },
  51: { desc: 'Llovizna ligera',         icon: 'rainy',              filled: false },
  53: { desc: 'Llovizna moderada',       icon: 'rainy',              filled: false },
  55: { desc: 'Llovizna densa',          icon: 'rainy',              filled: false },
  61: { desc: 'Lluvia ligera',           icon: 'rainy',              filled: false },
  63: { desc: 'Lluvia moderada',         icon: 'rainy',              filled: false },
  65: { desc: 'Lluvia intensa',          icon: 'rainy',              filled: true  },
  71: { desc: 'Nieve ligera',            icon: 'ac_unit',            filled: false },
  73: { desc: 'Nieve moderada',          icon: 'ac_unit',            filled: false },
  75: { desc: 'Nieve intensa',           icon: 'ac_unit',            filled: true  },
  77: { desc: 'Granizo',                 icon: 'weather_hail',       filled: false },
  80: { desc: 'Chubascos ligeros',       icon: 'rainy',              filled: false },
  81: { desc: 'Chubascos moderados',     icon: 'rainy',              filled: false },
  82: { desc: 'Chubascos violentos',     icon: 'thunderstorm',       filled: true  },
  85: { desc: 'Chubascos de nieve',      icon: 'weather_snowy',      filled: false },
  86: { desc: 'Chubascos de nieve fuertes', icon: 'weather_snowy',  filled: true  },
  95: { desc: 'Tormenta',                icon: 'thunderstorm',       filled: true  },
  96: { desc: 'Tormenta con granizo',    icon: 'thunderstorm',       filled: true  },
  99: { desc: 'Tormenta fuerte con granizo', icon: 'thunderstorm',  filled: true  },
}

function getWeatherInfo(code, isNight = false) {
  const info = WMO_CODES[code] ?? { desc: 'Desconocido', icon: 'help', filled: false }
  // Si es de noche y está despejado, usar luna
  if (isNight && code === 0) {
    return { ...info, icon: 'clear_night', filled: true }
  }
  return info
}

function isNightTime(hour) {
  return hour < 6 || hour >= 21
}

function formatHour(dateTimeStr) {
  const date = new Date(dateTimeStr)
  return date.getHours().toString().padStart(2, '0') + ':00'
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function useWeather() {
  const weatherData    = ref(null)
  const hourlyForecast = ref([])
  const isLoading      = ref(false)
  const error          = ref(null)
  const currentCity    = ref(null)

  /**
   * Busca sugerencias de ciudad usando la API de Geocoding de Open-Meteo
   * @param {string} query - Nombre de la ciudad a buscar
   * @returns {Promise<Array>} - Lista de ciudades sugeridas
   */
  async function searchCities(query) {
    if (!query || query.trim().length < 2) return []
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=es&format=json`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Error en la búsqueda')
      const data = await response.json()
      return data.results ?? []
    } catch (e) {
      console.error('Error buscando ciudades:', e)
      return []
    }
  }

  /**
   * Carga el clima actual y el pronóstico por horas de una ciudad
   * @param {Object} city - Objeto de ciudad con latitude, longitude, name, country
   */
  async function loadWeather(city) {
    isLoading.value = true
    error.value = null
    weatherData.value = null
    hourlyForecast.value = []
    currentCity.value = city

    try {
      const { latitude, longitude } = city
      const url = [
        'https://api.open-meteo.com/v1/forecast',
        `?latitude=${latitude}`,
        `&longitude=${longitude}`,
        '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
        '&hourly=temperature_2m,weather_code',
        '&timezone=auto',
        '&forecast_days=2',
      ].join('')

      const response = await fetch(url)
      if (!response.ok) throw new Error('No se pudo obtener el clima')
      const data = await response.json()

      // --- Clima actual ---
      const current = data.current
      const currentHour = new Date(current.time).getHours()
      const weatherInfo = getWeatherInfo(current.weather_code, isNightTime(currentHour))

      weatherData.value = {
        city:        city.name,
        country:     city.country ?? '',
        date:        formatDate(current.time.split('T')[0]),
        temperature: Math.round(current.temperature_2m),
        description: weatherInfo.desc,
        icon:        weatherInfo.icon,
        iconFilled:  weatherInfo.filled,
        humidity:    current.relative_humidity_2m,
        windSpeed:   Math.round(current.wind_speed_10m),
      }

      // --- Próximas 12 horas ---
      const now = new Date(current.time)
      const times = data.hourly.time
      const temps = data.hourly.temperature_2m
      const codes = data.hourly.weather_code

      // Encontrar el índice de la hora actual
      const nowStr = now.toISOString().slice(0, 13) // "2024-10-24T14"
      let startIdx = times.findIndex(t => t.startsWith(nowStr))
      if (startIdx === -1) startIdx = 0

      hourlyForecast.value = []
      for (let i = startIdx; i < startIdx + 13 && i < times.length; i++) {
        const date = new Date(times[i])
        const hour = date.getHours()
        const isFirst = i === startIdx
        const info = getWeatherInfo(codes[i], isNightTime(hour))

        hourlyForecast.value.push({
          time:        isFirst ? 'Ahora' : formatHour(times[i]),
          temperature: Math.round(temps[i]),
          icon:        info.icon,
          iconFilled:  info.filled,
          description: info.desc,
          isCurrent:   isFirst,
        })
      }
    } catch (e) {
      console.error('Error cargando el clima:', e)
      error.value = e.message || 'No se pudo cargar el clima. Inténtalo de nuevo.'
    } finally {
      isLoading.value = false
    }
  }

  function clearWeather() {
    weatherData.value = null
    hourlyForecast.value = []
    currentCity.value = null
    error.value = null
  }

  return {
    weatherData,
    hourlyForecast,
    isLoading,
    error,
    currentCity,
    searchCities,
    loadWeather,
    clearWeather,
  }
}
