# SHOPBOT

Bot de WhatsApp para buscar productos en tiendas chilenas (Knasta, Paris, Easy) con comparación de precios y soporte de generación de descripciones usando Gemini.

---

## 📁 Estructura del proyecto

- `main.js` - Servidor Express que expone el webhook (Facebook/WhatsApp), recibe mensajes y coordina la búsqueda y respuesta.
- `functions/browser.js` - Inicializa y cierra un navegador con Puppeteer (reutiliza la misma instancia).
- `functions/conversation.js` - Lógica principal para manejar la conversación y orquestar los scrapers.
- `functions/gemini.js` - Llamadas a la API de Google GenAI (Gemini) para generar sugerencias de producto.
- `functions/bestPrice.js` - Filtra y ordena resultados por el mejor precio.
- `functions/scrapers/knasta.js` - Scraper para knasta.cl.
- `functions/scrapers/paris.js` - Scraper para paris.cl.
- `functions/scrapers/easy.js` - Scraper para easy.cl.
- `prompt/prompt.txt` - Prompt base para la generación de contenido con Gemini.
- `scripts/install_chrome_render.sh` - Script para instalar dependencias de Chrome/Chromium (útil en Linux para Puppeteer).
- `Dockerfile` - Imagen Docker para ejecutar el bot en contenedores.
- `package.json` - Dependencias y script de inicio.

---

## 🧰 Tecnologías / librerías usadas

- **Node.js** (JavaScript en servidor)
- **Express** - Servidor HTTP y webhook para recibir mensajes desde Facebook/WhatsApp.
- **Axios** - Para enviar solicitudes HTTP al API de Facebook/WhatsApp.
- **dotenv** - Carga variables de entorno desde un archivo `.env`.
- **Puppeteer** - Navegador headless para hacer scraping de las tiendas.
- **@google/genai** - Cliente para llamar la API Gemini y generar contenido/descripciones.

---

## ⚙️ Funciones clave y su inferencia en el proyecto

### `main.js`

- **`app.post('/webhook')`**: punto central que recibe los mensajes entrantes de WhatsApp (vía webhook de Facebook). Extrae el texto, identifica comandos (`buscar`, `descripcion`) y delega al flujo correspondiente.
- **`sendMessage(to, text)`**: función reusable que comunica los resultados/errores de vuelta al usuario mediante la API de WhatsApp (usando `axios`).
- **`process.on('SIGINT' | 'SIGTERM')`**: asegura el cierre limpio de `Puppeteer` al apagar el proceso.

### `functions/browser.js`

- **`initBrowser()`**: inicializa una instancia global de Puppeteer (headless). Es llamada una sola vez al iniciar la app para evitar múltiples procesos de Chromium.
- **`getBrowser()`**: devuelve la instancia ya iniciada; lanza error si no se llamó a `initBrowser()`.
- **`closeBrowser()`**: cierra el navegador al terminar (o en caso de señal de apagado), liberando recursos.

### `functions/conversation.js`

- **`conversation(from, profileName, text)`**: orquesta la lógica principal de búsqueda. Interpreta el texto del usuario (extrae el nombre del producto) y llama a los scrapers.
  - Llama a: `scrapeKnasta()`, `scrapeParis()`, `scrapeEasy()`.
  - Después, combina todos los resultados y aplica `bestPrice()` para devolver una lista ordenada.
  - Esta función es el centro de inferencia: transforma la solicitud del usuario en acciones de scraping y entrega un formato uniforme de respuesta.

### `functions/gemini.js`

- **`generateContent(apikey, prompt, text)`**: envía un prompt y el texto del usuario a la API de Gemini (`@google/genai`).
  - Construye el input concatenando el prompt base con lo que el usuario escribió.
  - Retorna `response.text` de Gemini.
  - Se usa para inferir productos posibles cuando el usuario escribe "descripcion" y no sabe el nombre exacto.

### `functions/bestPrice.js`

- **`bestPrice(products)`**: procesa el listado de productos obtenidos por los scrapers.
  - Convierte los precios a números limpiando caracteres (`$`, `.`, espacios).
  - Filtra productos sin precio válido.
  - Ordena ascendentemente, entregando una lista por precio mínimo.

### Scrapers (`functions/scrapers/*.js`)

- Cada scraper usa **Puppeteer** para abrir una página de búsqueda de la tienda, esperar a que cargue el listado y parsear la información.
- Se extraen campos comunes: `titulo`, `precio`, `precioAnterior`, `descuento`, `tienda`, `link`.
- El resultado se normaliza para que `bestPrice()` pueda ordenar y el bot pueda mostrarlo de forma consistente.

---

## ⚙️ Variables de entorno (archivo `.env`)

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=3000
VERIFY_TOKEN=tu_token_de_verificacion
TOKEN=tu_access_token_de_facebook
PHONE_NUMBER_ID=tu_phone_number_id
GOOGLE_API_KEY=tu_api_key_de_google
```

> 🔎 `VERIFY_TOKEN`, `TOKEN` y `PHONE_NUMBER_ID` son necesarios para que Facebook/WhatsApp Webhooks funcione.

---

## 🚀 Instalación y ejecución

### 1) Instalar dependencias

```bash
npm install
```

### 2) Ejecutar localmente

```bash
npm start
```

Esto iniciará el servidor en el puerto definido en `PORT`.

### 3) Ejecutar con Docker (opcional)

```bash
docker build . -t shopbot

docker run -p 3000:3000 shopbot
```

Si quieres ejecutarlo en segundo plano:

```bash
docker run -d -p 3000:3000 shopbot
```

---

## 🧩 Notas adicionales

- El scraping depende de que la estructura de las páginas de las tiendas no cambie. Si las tiendas actualizan sus selectors, es posible que sea necesario actualizar los scrapers.
- Si vas a ejecutar en Linux y tienes problemas con Puppeteer/Chromium, prueba el script:

```bash
bash scripts/install_chrome_render.sh
```
