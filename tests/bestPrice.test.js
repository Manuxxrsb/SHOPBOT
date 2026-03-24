import { jest } from "@jest/globals";
import { bestPrice } from "../functions/bestPrice.js";

describe("bestPrice - Función de filtrado y ordenamiento de productos", () => {
  describe("Validación de entrada", () => {
    test("debería retornar array vacío si recibe null", () => {
      expect(bestPrice(null)).toEqual([]);
    });

    test("debería retornar array vacío si recibe undefined", () => {
      expect(bestPrice(undefined)).toEqual([]);
    });

    test("debería retornar array vacío si recibe un string", () => {
      expect(bestPrice("string")).toEqual([]);
    });

    test("debería retornar array vacío si recibe un objeto", () => {
      expect(bestPrice({})).toEqual([]);
    });

    test("debería retornar array vacío para lista vacía", () => {
      expect(bestPrice([])).toEqual([]);
    });
  });

  describe("Parseo de precios", () => {
    test("debería remover símbolos de moneda correctamente", () => {
      const products = [
        { titulo: "Producto", precio: "$8.990", tienda: "Paris" },
      ];
      const result = bestPrice(products);

      expect(result).toHaveLength(1);
      expect(result[0].precio).toBe("$8.990");
    });

    test("debería manejar precios con puntos como separador de miles", () => {
      const products = [
        { titulo: "Producto A", precio: "$14.990", tienda: "Paris" },
        { titulo: "Producto B", precio: "$8.990", tienda: "Easy" },
      ];
      const result = bestPrice(products);

      // Debería ordenar de menor a mayor
      expect(result[0].precio).toBe("$8.990");
      expect(result[1].precio).toBe("$14.990");
    });

    test("debería manejar precios sin dólar", () => {
      const products = [
        { titulo: "Producto A", precio: "5000", tienda: "Knasta" },
        { titulo: "Producto B", precio: "2500", tienda: "Paris" },
      ];
      const result = bestPrice(products);

      expect(result[0].precio).toBe("2500");
      expect(result[1].precio).toBe("5000");
    });

    test('debería manejar precios con formato "$ X.XXX"', () => {
      const products = [
        { titulo: "Producto", precio: "$ 125.990", tienda: "Easy" },
      ];
      const result = bestPrice(products);

      expect(result).toHaveLength(1);
    });
  });

  describe("Filtrado de productos sin precio", () => {
    test("debería filtrar productos con precio vacío", () => {
      const products = [
        { titulo: "Válido", precio: "$1000", tienda: "Paris" },
        { titulo: "Inválido", precio: "", tienda: "Knasta" },
      ];
      const result = bestPrice(products);

      expect(result).toHaveLength(1);
      expect(result[0].titulo).toBe("Válido");
    });

    test("debería filtrar productos con precio null", () => {
      const products = [
        { titulo: "Válido", precio: "$5000", tienda: "Paris" },
        { titulo: "Inválido", precio: null, tienda: "Easy" },
      ];
      const result = bestPrice(products);

      expect(result).toHaveLength(1);
    });

    test("debería filtrar productos con precio que no contiene dígitos", () => {
      const products = [
        { titulo: "Válido", precio: "$8990", tienda: "Paris" },
        { titulo: "Inválido", precio: "sin precio", tienda: "Knasta" },
      ];
      const result = bestPrice(products);

      expect(result).toHaveLength(1);
    });

    test("debería mantener solo productos con precio válido de múltiples inválidos", () => {
      const products = [
        { titulo: "A", precio: null, tienda: "Paris" },
        { titulo: "B", precio: "$10000", tienda: "Knasta" },
        { titulo: "C", precio: "", tienda: "Easy" },
        { titulo: "D", precio: "$5000", tienda: "Paris" },
      ];
      const result = bestPrice(products);

      expect(result).toHaveLength(2);
      expect(result.map((p) => p.titulo)).toEqual(["D", "B"]);
    });
  });

  describe("Ordenamiento por precio", () => {
    test("debería ordenar de menor a mayor precio", () => {
      const products = [
        {
          titulo: "Caro",
          precio: "$14.990",
          tienda: "Paris",
          precioAnterior: "$20.000",
          descuento: "25%",
          link: "http://example.com",
        },
        {
          titulo: "Barato",
          precio: "$8.990",
          tienda: "Easy",
          precioAnterior: null,
          descuento: null,
          link: "http://example.com",
        },
        {
          titulo: "Medio",
          precio: "$10.990",
          tienda: "Knasta",
          precioAnterior: "$15.000",
          descuento: "26%",
          link: "http://example.com",
        },
      ];
      const result = bestPrice(products);

      expect(result[0].titulo).toBe("Barato");
      expect(result[1].titulo).toBe("Medio");
      expect(result[2].titulo).toBe("Caro");
    });

    test("debería preservar estructura completa del producto después de ordenar", () => {
      const products = [
        {
          titulo: "Plafon LED Sobrepuesto",
          precio: "$8.990",
          tienda: "Paris",
          precioAnterior: "$14.990",
          descuento: "40%",
          link: "https://www.paris.cl/plafon-led-sobrepuesto-logic-24w-luz-fria-blacklight-1920lm-MKV5CFDQZT.html",
        },
        {
          titulo: "Plafon LED Simple",
          precio: "$5.990",
          tienda: "Easy",
          precioAnterior: null,
          descuento: null,
          link: "https://www.easy.cl/plafon-led-simple",
        },
      ];
      const result = bestPrice(products);

      expect(result[0].titulo).toBe("Plafon LED Simple");
      expect(result[0].tienda).toBe("Easy");
      expect(result[0].link).toBe("https://www.easy.cl/plafon-led-simple");
      expect(result[1].titulo).toBe("Plafon LED Sobrepuesto");
      expect(result[1].tienda).toBe("Paris");
      expect(result[1].descuento).toBe("40%");
    });

    test("debería manejar precios con espacios adicionales", () => {
      const products = [
        { titulo: "A", precio: "  $10.000  ", tienda: "Paris" },
        { titulo: "B", precio: "$5.000", tienda: "Easy" },
      ];
      const result = bestPrice(products);

      expect(result[0].titulo).toBe("B");
      expect(result[1].titulo).toBe("A");
    });
  });

  describe("Flujo completo - Caso de uso real", () => {
    test('debería procesar correctamente búsqueda de "plafon led" desde múltiples tiendas', () => {
      // Simulando resultados reales de los scrapers
      const parisResults = [
        {
          titulo: "Plafon LED Sobrepuesto Logic 24W Luz Fria Blacklight 1920LM",
          precio: "$8.990",
          precioAnterior: "$14.990",
          descuento: "40%",
          tienda: "Paris",
          link: "https://www.paris.cl/plafon-led-sobrepuesto-logic-24w-luz-fria-blacklight-1920lm-MKV5CFDQZT.html",
        },
      ];

      const knastaResults = [
        {
          titulo: "Plafon LED 30W",
          precio: "$12.990",
          precioAnterior: "$17.990",
          descuento: "27%",
          tienda: "Knasta",
          link: "https://knasta.cl/plafon-led-30w",
        },
      ];

      const easyResults = [
        {
          titulo: "Plafon LED 24W Simple",
          precio: "$9.990",
          precioAnterior: null,
          descuento: null,
          tienda: "Easy",
          link: "https://www.easy.cl/plafon-led-24w",
        },
      ];

      const allResults = [...parisResults, ...knastaResults, ...easyResults];
      const result = bestPrice(allResults);

      // Debe tener 3 productos ordenados por precio
      expect(result).toHaveLength(3);

      // Ordenamiento correcto
      expect(result[0].precio).toBe("$8.990");
      expect(result[0].tienda).toBe("Paris");

      expect(result[1].precio).toBe("$9.990");
      expect(result[1].tienda).toBe("Easy");

      expect(result[2].precio).toBe("$12.990");
      expect(result[2].tienda).toBe("Knasta");
    });
  });
});
