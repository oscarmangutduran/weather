## AGENTS

Proyecto: Aplicación del tiempo

Rol del agente: Desarrollador web experto con 12 años de experiencia.

Objetivo: Crear una aplicación web que nos permita ver el tiempo de cualquier ciudad del mundo de forma rapida y sencilla, consumiendo una api rest externa y dando la posibilidad de ver el tiempo de las proximas 12 horas y dando la posibilidad de guardar las diferentes ciudad en el localStorage

URL del api a consumir (no requiere autenticación ni api key): https://open-meteo.com/
 

Funcionalidades de la aplicación:
- Busqueda de ciudad:
    - input para buscar la ciudad
    - botón para buscar la ciudad
    - mensaje si la ciudad no existe
    - dar sugerencia de ciudad mientras escribimos
- Clima actual:
    - nombre de la ciudad
    - temperatura actual
    - descripción del clima (soleado, nublado, si hay lluvia, etc)
    - icono representantivo del clima actual
    - sensación termica:
        - humedad
        - velocidad del viento
- clima por horas:
    - nombre de la ciudad
    - temperaturas por horas 
    - descripción del clima por horas
    - icono representantivo del clima por horas
    - hora
    - botón para guardar la ciudad
- Localidades gaurdadas:
    - Botón para guardar la ciudad
    - botoón para eliminar la ciudad
    - listado de ciudades guardadas 
    - eliminar ciudad
    - evitar guardar duplicados
- Consideraciones importantes:
    - La parte de gestionar localidades, asi como la parte de añadir localidades, debe hacerse en un modal.
    - Aparte tendré el buscador para buscar el tiempo de nuevas localidades.
    - Una vez que tenga guardadas las localidades, podré ir dandole clic a cada una de ella para ver el tiempo actual y el tiempo de las proximas 24 horas. 


Stack de tecnología:
- Vue 
- CSS 3 Nativo
Preferencias generales importante: 
-	Todos los textos visible en la aplicación web deben estar en español
Preferencias de diseño:
-	Basate en las imagenes del diseño y en el HTML del diseño que tienes en la carpeta design del proyecto

Preferencias de estilos:
- eliminar TailwindCSS y pasarlo a CSS nativo
- Colores (los del diseño)
- Uso de medidas con rem, usando font-size base de 10px.
- La aplicación esté en español.
- Uso de buenas practicas de maquetación css y si es necesario usa flexbox y css grid layout.
- La aplicación esté en español.
- Usa el framework bootstrap 5 para la maquetación .
- La aplicación sea responsive para dispositivos móviles y tablets.
 

Preferencias de código:
- No usar alert y usar ventanas modales
- Cuidado con prevenir el default de los eventos en submits o clicks
- Prioriza el código legible y mantenible.
- Proioriza que sea sencillo de entender 
- Si el agente duda que revise nuevamente las especificaciones y si sigue teniendo dudas que pregunte al usuario.

Estructura de archivos:
- designs (contiene los diseños)
- src
    - components
        - Header.jsx
        - Footer.jsx
        - RandomPassGenerator.jsx
    - css
        - style.css
    - main.jsx
    - App.jsx
    - index.html
    - package.json
    - vite.config.js
 

