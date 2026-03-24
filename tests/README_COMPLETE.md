# Tests Unitarios - SHOPBOT

## Descripción

Esta carpeta contiene todas las pruebas unitarias del proyecto SHOPBOT. Las pruebas están organizadas por módulo/función y siguen el patrón Jest con mocks para dependencias externas.

## Estructura de Pruebas

### 📋 Archivos de Test

1. **`bestPrice.test.js`** - Función de filtrado y ordenamiento de productos
   - ✅ Validación de entrada (null, undefined, tipos incorrectos)
   - ✅ Parseo de precios en diferentes formatos ($X.XXX, $ X.XXX, sin símbolo)
   - ✅ Filtrado de productos sin precio válido
   - ✅ Ordenamiento por precio de menor a mayor
   - ✅ Preservación de estructura completa del producto
   - ✅ Caso de uso real: búsqueda de "plafon led"
   - **Total: 16 pruebas**

2. **`conversation.test.js`** - Orquestador de búsqueda de productos
   - ✅ Extracción y validación del nombre del producto
   - ✅ Llamadas correctas a todos los scrapers (Knasta, Paris, Easy)
   - ✅ Combinación y ordenamiento de resultados de múltiples tiendas
   - ✅ Manejo de errores sin lanzar excepciones no capturadas
   - ✅ Caso de uso completo: flujo normal de búsqueda
   - **Total: 16 pruebas**

3. **`scrapers.test.js`** - Pruebas de los scrapers (Knasta, Paris, Easy)
   - ✅ Validación de estructura de datos retornados
   - ✅ Respeto de límites de resultados
   - ✅ Manejo de errores (timeout, selector no encontrado, network errors)
   - ✅ Búsquedas específicas con encapsulación correcta de URLs
   - ✅ Cierre correcto de páginas del navegador
   - **Total: 17 pruebas**

4. **`browser.test.js`** - Gestión del navegador Puppeteer
   - ✅ Inicialización con argumentos correctos
   - ✅ Registro de eventos de desconexión
   - ✅ Obtención del browser cuando está inicializado
   - ✅ Cierre correcto del navegador
   - ✅ Ciclo completo de vida (init → get → close → reinit)
   - ✅ Configuración de Puppeteer (headless, sandbox, etc)
   - **Total: 15 pruebas**

5. **`gemini.test.js`** - Generación de contenido con IA (Google Gemini)
   - ✅ Inicialización del cliente con API key
   - ✅ Generación de contenido con modelo correcto
   - ✅ Extracción correcta de búsqueda del comando
   - ✅ Combinación de prompt y búsqueda
   - ✅ Manejo de errores (API invalida, rate limit, respuesta vacía)
   - ✅ Casos de uso reales de búsqueda
   - ✅ Validaciones de entrada
   - ✅ **NUEVO**: Interpretación de lenguaje natural del usuario
   - ✅ **NUEVO**: Sugerencia de productos desde descripción natural
   - ✅ **NUEVO**: Extracción de comando "descripcion"
   - **Total: 24 pruebas**

6. **`template.test.js`** - Plantilla para agregar nuevas pruebas rápidamente

---

## Estadísticas de Cobertura

```
Total de Pruebas: 88+
Módulos Probados: 5 principales
Casos de Uso: 4+ flujos completos reales
```

---

## 🚀 Cómo Ejecutar las Pruebas

### Instalar dependencias

```bash
npm install
```

### Ejecutar todas las pruebas

```bash
npm test
```

### Ejecutar un archivo específico

```bash
npm test tests/bestPrice.test.js
npm test tests/conversation.test.js
npm test tests/scrapers.test.js
npm test tests/browser.test.js
npm test tests/gemini.test.js
```

### Ejecutar en modo observador (se ejecuta al guardar)

```bash
npm run test:watch
```

### Generar reporte de cobertura

```bash
npm run test:coverage
```

Esto generará una carpeta `coverage/` con reportes HTML, LCOV, etc.

---

## 📊 Estructura de Prueba por Módulo

### bestPrice.js

```
Input: Array de productos con {titulo, precio, tienda, ...}
Output: Array ordenado por precio (menor a mayor)
Casos: Validación, parseo, filtrado, ordenamiento, caso real
```

### conversation.js

```
Input: (from, profileName, text) → "buscar plafon led"
Output: Array de productos ordenados por precio de todas las tiendas
Flujo: Extrae producto → Llama a 3 scrapers → Combina → Ordena
Casos: Validación producto, llamadas scrapers, combinación, errores
```

### scrapers/\*.js (Paris, Knasta, Easy)

```
Input: (product_name, limit)
Output: Array de {titulo, precio, precioAnterior, descuento, tienda, link}
Casos: Estructura correcta, límites, errores, URLs, cierre de páginas
```

### browser.js

```
Functions: initBrowser(), getBrowser(), closeBrowser()
Casos: Inicialización, obtención, cierre, eventos, ciclo completo
```

### gemini.js

```
Input: (apiKey, prompt, text)
Output: Contenido generado por IA

Dos flujos principales:
1. Búsqueda directa: "buscar plafon led"
   → Busca el producto específico

2. Descripción natural: "descripcion necesito algo para iluminar"
   → Gemini interpreta y sugiere productos
   → Retorna: "🧐 posibles productos: Lámpara, Plafón, Foco"
   → Guía: "🕵️‍♂️ escribe buscar + [nombre producto]"

Casos: Inicialización, generación, extracción, errores, validaciones, lenguaje natural
```

---

## 🧪 Estrategia de Testing

### Mocking

- Las pruebas usan **Jest mocks** para:
  - Scrapers (en conversation.test.js)
  - Puppeteer (en browser.test.js)
  - GoogleGenAI (en gemini.test.js)
  - Browser module (en scrapers.test.js)

### Tipos de Pruebas

1. **Unitarias**: Cada función se prueba en aislamiento
2. **Integración**: Flujo completo conversation → bestPrice
3. **Casos de Uso Reales**: "plafon led" similar al ejemplo del usuario

### Datos de Prueba

```javascript
// Ejemplo de estructura real usada en las pruebas
{
  titulo: "Plafon LED Sobrepuesto Logic 24W Luz Fria Blacklight 1920LM",
  precio: "$8.990",
  precioAnterior: "$14.990",
  descuento: "40%",
  tienda: "Paris",
  link: "https://www.paris.cl/plafon-led-sobrepuesto-logic-24w-luz-fria-blacklight-1920lm-MKV5CFDQZT.html"
}
```

---

## ✅ Checklist de Cobertura

- [x] bestPrice: Todas las operaciones de filtrado y ordenamiento
- [x] conversation: Orquestación y flujo de búsqueda
- [x] scrapers: Extracción de datos y manejo de errores
- [x] browser: Ciclo de vida y configuración
- [x] gemini: Generación de contenido e integración API

---

## 🔄 Agregar Nuevas Pruebas

1. Abre `tests/template.test.js` para ver el formato
2. Crea un nuevo archivo `tests/miModulo.test.js`
3. Importa la función/módulo a probar
4. Estructura tus pruebas con `describe()` y `test()`
5. Ejecuta `npm test` para validar

Ejemplo:

```javascript
import { miFunction } from "../functions/miFunction.js";

describe("miFunction", () => {
  test("debería hacer algo", () => {
    const result = miFunction(input);
    expect(result).toBe(expected);
  });
});
```

---

## 📝 Buenas Prácticas Aplicadas

1. ✅ Nombres descriptivos en español
2. ✅ Structured con `describe()` por categoría
3. ✅ Mocks de dependencias externas
4. ✅ beforeEach/afterEach para limpieza
5. ✅ Casos edge (null, undefined, arrays vacíos)
6. ✅ Casos de uso reales del flujo actual
7. ✅ Manejo de errores y excepciones
8. ✅ Validación de estructura de datos

---

## 🐛 Troubleshooting

### Las pruebas fallan por rutas

- Asegúrate de que los imports usan rutas relativas correctas
- Ejemplo: `../functions/bestPrice.js`

### Error "Cannot find module 'jest'"

```bash
npm install --save-dev jest
```

### Mocks no funcionan correctamente

- Usa `jest.mock()` ANTES de importar el módulo
- Llama `jest.clearAllMocks()` en `beforeEach`

### Timeout en pruebas async

- Aumenta el timeout: `jest.setTimeout(10000)`
- Verifica que las Promises se resuelvan correctamente

---

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Jest API Reference](https://jestjs.io/docs/api)
- [Testing Library](https://testing-library.com/)
