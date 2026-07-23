<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div style="display:flex; align-items:center; gap:var(--space-xs);">
        <span class="footer-brand">Atmosfere</span>
        <span class="footer-copy">| © {{ currentYear }} — Datos por Open-Meteo</span>
      </div>
      <nav class="footer-links" aria-label="Enlaces del pie de página">
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">API Docs</a>
        <a href="#">Privacidad</a>
        <a href="#">Términos</a>
      </nav>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>
