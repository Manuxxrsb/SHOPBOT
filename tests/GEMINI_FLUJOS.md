# Flujos de Gemini en SHOPBOT

## Descripción General

La función `generateContent` de Gemini se usa en dos flujos diferentes:

1. **Búsqueda directa** - Usuario escribe "buscar + [producto]"
2. **Descripción natural** - Usuario describe lo que necesita con lenguaje natural

---

## Flujo 1: Búsqueda Directa

### Entrada

```
Usuario escribe: "buscar plafon led"

Parámetros a Gemini:
- text: "buscar plafon led"
- text.slice(7).trim() → "plafon led" (elimina "buscar ")
```

### Proceso

1. Usuario escriba en WhatsApp: `buscar plafon led`
2. `conversation.js` extrae: `"plafon led"`
3. Llama a scrapers de Paris, Knasta, Easy
4. `bestPrice()` ordena por precio
5. Retorna array ordenado

### Salida Esperada

```javascript
[
  {
    titulo: "Plafon LED Sobrepuesto Logic 24W Luz Fria Blacklight 1920LM",
    precio: "$8.990",
    precioAnterior: "$14.990",
    descuento: "40%",
    tienda: "Paris",
    link: "https://www.paris.cl/plafon-led-sobrepuesto...",
  },
  // ... más productos ordenados por precio
];
```

---

## Flujo 2: Descripción Natural (NUEVO)

### Entrada

```
Usuario escribe: "descripcion necesito una de esas cosas que alumbran que poni en el techo"

Parámetros a Gemini:
- text: "descripcion necesito una de esas cosas que alumbran que poni en el techo"
- text.slice(11).trim() → "necesito una de esas cosas que alumbran que poni en el techo"
- prompt: "Interpreta esta búsqueda y sugiere productos: "
```

### Proceso

1. Usuario describe lo que necesita (lenguaje natural)
2. Gemini entiende la descripción
3. Gemini sugiere productos posibles
4. Sistema le guía: "escribe buscar + [nombre producto]"

### Salida Esperada

```
🧐 posibles productos: Lámpara de techo colgante,Plafón LED,Foco empotrable
 💡 si encontre tu producto escribe la palabra buscar + [nombre producto] para ayudarte a cotizarlo.
```

### Desglose de la Respuesta

```
🧐 posibles productos:
  - Lámpara de techo colgante
  - Plafón LED
  - Foco empotrable

🕵️‍♂️ instrucciones:
  "si encontre tu producto escribe la palabra buscar + [nombre producto]
   para ayudarte a cotizarlo"
```

---

## Diferencia Clave: Comandos

| Comando         | Entrada                         | Función                  | Salida                         | Siguiente Paso                   |
| --------------- | ------------------------------- | ------------------------ | ------------------------------ | -------------------------------- |
| **buscar**      | "buscar plafon led"             | Busca directo en tiendas | Array de productos con precios | Muestra resultados               |
| **descripcion** | "descripcion necesito iluminar" | Interpreta con IA        | Sugerencias de productos       | Usuario elige y escribe "buscar" |

---

## Implementación Actual

### función `generateContent(apiKey, prompt, text)`

```javascript
export async function generateContent(apikey, prompt, text) {
  const ai = new GoogleGenAI({
    apiKey: apikey,
  });

  // Combina prompt + contenido de usuario (después de 11 caracteres)
  const input = prompt + " " + text.slice(11).trim();

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: input,
  });

  return response.text;
}
```

### Ejemplo de Ejecución

```javascript
// Flujo 1: Búsqueda directa
const result1 = await generateContent(
  API_KEY,
  "Busca estos productos en tiendas: ",
  "buscar plafon led",
  // input para Gemini = "Busca estos productos en tiendas:  plafon led"
);

// Flujo 2: Descripción natural
const result2 = await generateContent(
  API_KEY,
  "Interpreta esta necesidad de compra: ",
  "descripcion necesito algo para iluminar mi cocina",
  // input para Gemini = "Interpreta esta necesidad de compra:  algo para iluminar mi cocina"
);
```

---

## Pruebas Unitarias Creadas

### Para Flujo 1 (Búsqueda Directa)

- ✅ `debería extraer búsqueda correctamente de comando 'buscar'`
- ✅ `debería manejar espacios extras en búsqueda`
- ✅ `debería combinar prompt y búsqueda correctamente`

### Para Flujo 2 (Descripción Natural) - NUEVAS

- ✅ `debería interpretar descripción natural del usuario: plafón LED`
- ✅ `debería extraer correctamente comando 'descripcion' de entrada`
- ✅ `debería sugerir múltiples productos para búsqueda vaga`
- ✅ `debería retornar guía para buscar después de sugerir`
- ✅ `debería manejar búsquedas en diferentes contextos`
- ✅ `debería preservar estructura de respuesta Gemini con emojis`
- ✅ `debería procesar entrada del usuario 'descripcion' correctamente`
- ✅ `debería retornar sugerencias sin que el usuario especifique 'buscar'`

---

## Casos de Prueba Reales

### Caso 1: Usuario dice "plafon led"

```
Entrada: "descripcion plafon led para habitacion"
Gemini: "🧐 posibles productos: Plafón LED 24W, Plafón empotrble, Lámpara colgante
         🕵️‍♂️ escribe buscar + [nombre]"
Usuario ve opciones → Escribe: "buscar plafon led 24w"
Sistema: Busca en Paris, Knasta, Easy → Ordena por precio
Resultado: Array con productos de todas las tiendas ordenados
```

### Caso 2: Usuario describe vagamente

```
Entrada: "descripcion necesito iluminar mejor mi escritorio"
Gemini: "🧐 posibles productos: Lámpara de escritorio, Luz LED, Foco de trabajo
         🕵️‍♂️ escribe buscar + [nombre]"
Usuario elige → Escribe: "buscar lampara de escritorio"
Sistema: Ejecuta búsqueda específica
Resultado: Productos ordenados por precio
```

### Caso 3: Usuario es muy vago

```
Entrada: "descripcion algo para iluminar"
Gemini: "🧐 posibles productos: Lámpara, Bombilla, Foco, Plafón, Linterna
         🕵️‍♂️ escribe buscar + [nombre]"
Usuario ve múltiples opciones → Elige una
```

---

## Estadísticas

- **Total pruebas Gemini**: 24 (16 básicas + 8 nuevas de lenguaje natural)
- **Flujos probados**: 2 (Búsqueda directa + Descripción natural)
- **Casos de uso real**: 3+
- **Comandos soportados**: "buscar", "descripcion"

---

## Próximas Mejoras Posibles

1. Agregar más comandos (ej: "precio máximo", "marca específica")
2. Cachear respuestas de Gemini para búsquedas comunes
3. Permitir seguimiento de contexto (ej: "dame uno más barato")
4. Integrar feedback del usuario para mejorar sugerencias
