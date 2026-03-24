# Tests Unitarios - SHOPBOT

## Descripción

Esta carpeta contiene todas las pruebas unitarias del proyecto SHOPBOT.

## Estructura

- `bestPrice.test.js` - Pruebas para la función de búsqueda de mejor precio
- `conversation.test.js` - Pruebas para la lógica de conversación y búsqueda

## Ejecutar Pruebas

### Ejecutar todas las pruebas

```bash
npm test
```

### Ejecutar un archivo específico

```bash
npm test tests/bestPrice.test.js
```

### Ejecutar con cobertura

```bash
npm run test:coverage
```

### Ver resultados en modo watch

```bash
npm run test:watch
```

## Qué se Prueba

### bestPrice.test.js

- ✅ Validación de entrada (solo arrays)
- ✅ Filtrado de productos sin precio válido
- ✅ Ordenamiento correcto por precio
- ✅ Manejo de diferentes formatos de precio
- ✅ Casos edge (arrays vacíos, etc)

### conversation.test.js

- ✅ Validación de entrada de producto
- ✅ Llamadas correctas a los scrappers
- ✅ Ordenamiento de resultados combinados
- ✅ Manejo de errores sin fallar
- ✅ Extracción correcta del nombre del producto

## Agregar Nuevas Pruebas

1. Crea un nuevo archivo con patrón `nombreFuncion.test.js`
2. Importa la función que quieres probar
3. Escribe tus tests dentro de `describe()` y `test()`
4. Ejecuta `npm test` para validar

Ejemplo:

```javascript
import { miFunction } from "../functions/miFunction.js";

describe("miFunction", () => {
  test("debería hacer algo", () => {
    expect(miFunction()).toBe(resultado_esperado);
  });
});
```
