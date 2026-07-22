# WeatherNow

Aplicación del tiempo que muestra el clima actual y el pronóstico de las próximas 12 horas de cualquier ciudad del mundo.

## ✨ Características

- 🔍 Búsqueda de ciudades con autocompletado
- 🌤️ Clima actual: temperatura, descripción, icono, humedad y viento
- ⏰ Pronóstico por horas (próximas 12 horas)
- ⭐ Ciudades guardadas en localStorage (sin duplicados)
- 🗺️ Mapa integrado (Google Maps embed)
- 📱 Responsive: móvil, tablet y escritorio

## 🛠️ Stack

- **Vue 3** (Composition API)
- **Vite 5**
- **Bootstrap 5**
- **CSS 3 nativo**
- **API**: [Open-Meteo](https://open-meteo.com/) (sin API key)

## 🚀 Desarrollo local

```bash
npm install
npm run dev
```

## 📦 Build para producción

```bash
npm run build
```

El resultado se genera en la carpeta `dist/`.

## 🌐 Deploy en Netlify

Este proyecto incluye `netlify.toml` configurado. Solo arrastra la carpeta `dist/` a [Netlify Drop](https://app.netlify.com/drop) o conecta el repositorio de GitHub.
