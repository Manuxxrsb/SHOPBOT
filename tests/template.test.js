/**
 * PLANTILLA PARA AGREGAR PRUEBAS A NUEVAS FUNCIONES
 *
 * Copia este archivo y adapta:
 * 1. Cambia el nombre del archivo a nombreFuncion.test.js
 * 2. Importa la función que quieres probar
 * 3. Reemplaza los describe y test con tus propias pruebas
 */

// import { miFunction } from '../functions/miFunction.js';

describe("miFunction", () => {
  beforeEach(() => {
    // Setup: código que se ejecuta antes de cada test
  });

  afterEach(() => {
    // Cleanup: código que se ejecuta después de cada test
  });

  test("debería funcionar correctamente con entrada válida", () => {
    // Arrange (organizar)
    // const input = ...;
    // Act (actuar)
    // const result = miFunction(input);
    // Assert (verificar)
    // expect(result).toBe(valorEsperado);
  });

  test("debería manejar casos edge correctamente", () => {
    // Prueba casos especiales: null, undefined, arrays vacíos, etc.
  });

  test("debería lanzar error con entrada inválida", () => {
    // expect(() => miFunction(inputInvalida)).toThrow();
  });
});

/**
 * REFERENCIA RÁPIDA DE ASSERTIONS
 *
 * expect(value).toBe(expected)              // igualdad estricta
 * expect(value).toEqual(expected)           // igualdad profunda
 * expect(value).toContain(expected)         // contiene elemento
 * expect(array).toHaveLength(length)        // longitud del array
 * expect(function).toThrow()                // lanza error
 * expect(promise).resolves.toBe(value)      // promesa resuelta
 * expect(promise).rejects.toThrow()         // promesa rechazada
 */
