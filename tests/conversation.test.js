import { jest } from "@jest/globals";
import { conversation } from "../functions/conversation.js";
import * as knasta from "../functions/scrapers/knasta.js";
import * as paris from "../functions/scrapers/paris.js";
import * as easy from "../functions/scrapers/easy.js";

// Mock de los scrapers
jest.mock("../functions/scrapers/knasta.js");
jest.mock("../functions/scrapers/paris.js");
jest.mock("../functions/scrapers/easy.js");

describe("conversation - Orquestador de búsqueda de productos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Extracción y validación de producto", () => {
    test("debería retornar array vacío si no se proporciona producto", async () => {
      knasta.scrapeKnasta.mockResolvedValue([]);
      paris.scrapeParis.mockResolvedValue([]);
      easy.scrapeEasy.mockResolvedValue([]);

      const result = await conversation(
        "1234567890",
        "Usuario Test",
        "buscar ",
      );

      expect(result).toEqual([]);
      expect(knasta.scrapeKnasta).not.toHaveBeenCalled();
    });

    test("debería extraer correctamente el nombre del producto antes de los 7 caracteres", async () => {
      knasta.scrapeKnasta.mockResolvedValue([]);
      paris.scrapeParis.mockResolvedValue([]);
      easy.scrapeEasy.mockResolvedValue([]);

      await conversation("1234567890", "Usuario", "buscar plafon led");

      // "buscar " tiene 7 caracteres, así que debería extraer "plafon led"
      expect(knasta.scrapeKnasta).toHaveBeenCalledWith("plafon led", 3);
    });

    test("debería manejar espacios extras en la búsqueda", async () => {
      knasta.scrapeKnasta.mockResolvedValue([]);
      paris.scrapeParis.mockResolvedValue([]);
      easy.scrapeEasy.mockResolvedValue([]);

      await conversation("1234567890", "Usuario", "buscar   laptop asus");

      expect(knasta.scrapeKnasta).toHaveBeenCalledWith("laptop asus", 3);
    });
  });

  describe("Llamadas a scrapers", () => {
    test("debería llamar a todos los scrapers con el mismo producto y límite", async () => {
      knasta.scrapeKnasta.mockResolvedValue([]);
      paris.scrapeParis.mockResolvedValue([]);
      easy.scrapeEasy.mockResolvedValue([]);

      const product = "iphone 15";
      await conversation("1234567890", "Usuario", `buscar ${product}`);

      expect(knasta.scrapeKnasta).toHaveBeenCalledWith(product, 3);
      expect(paris.scrapeParis).toHaveBeenCalledWith(product, 3);
      expect(easy.scrapeEasy).toHaveBeenCalledWith(product, 3);
    });

    test("debería llamar a scrapers con límite de 3 resultados", async () => {
      knasta.scrapeKnasta.mockResolvedValue([]);
      paris.scrapeParis.mockResolvedValue([]);
      easy.scrapeEasy.mockResolvedValue([]);

      await conversation("1234567890", "Usuario", "buscar notebook");

      expect(knasta.scrapeKnasta).toHaveBeenCalledWith("notebook", 3);
      expect(paris.scrapeParis).toHaveBeenCalledWith("notebook", 3);
      expect(easy.scrapeEasy).toHaveBeenCalledWith("notebook", 3);
    });
  });

  describe("Combinación y ordenamiento de resultados", () => {
    test("debería combinar resultados de todos los scrapers", async () => {
      const knastaProducts = [
        {
          titulo: "Plafon Knasta",
          precio: "$12.990",
          tienda: "Knasta",
          link: "http://knasta.cl",
        },
      ];
      const parisProducts = [
        {
          titulo: "Plafon Paris",
          precio: "$8.990",
          tienda: "Paris",
          link: "http://paris.cl",
        },
      ];
      const easyProducts = [
        {
          titulo: "Plafon Easy",
          precio: "$10.990",
          tienda: "Easy",
          link: "http://easy.cl",
        },
      ];

      knasta.scrapeKnasta.mockResolvedValue(knastaProducts);
      paris.scrapeParis.mockResolvedValue(parisProducts);
      easy.scrapeEasy.mockResolvedValue(easyProducts);

      const result = await conversation(
        "1234567890",
        "Usuario",
        "buscar plafon",
      );

      expect(result).toHaveLength(3);
    });

    test("debería retornar resultados ordenados por precio (menor a mayor)", async () => {
      const knastaProducts = [
        {
          titulo: "Caro",
          precio: "$15.000",
          tienda: "Knasta",
          precioAnterior: null,
          descuento: null,
          link: "http://knasta.cl",
        },
      ];
      const parisProducts = [
        {
          titulo: "Barato",
          precio: "$5.000",
          tienda: "Paris",
          precioAnterior: "$10.000",
          descuento: "50%",
          link: "http://paris.cl",
        },
      ];
      const easyProducts = [
        {
          titulo: "Medio",
          precio: "$8.000",
          tienda: "Easy",
          precioAnterior: null,
          descuento: null,
          link: "http://easy.cl",
        },
      ];

      knasta.scrapeKnasta.mockResolvedValue(knastaProducts);
      paris.scrapeParis.mockResolvedValue(parisProducts);
      easy.scrapeEasy.mockResolvedValue(easyProducts);

      const result = await conversation(
        "1234567890",
        "Usuario",
        "buscar producto",
      );

      expect(result[0].titulo).toBe("Barato");
      expect(result[0].precio).toBe("$5.000");

      expect(result[1].titulo).toBe("Medio");
      expect(result[1].precio).toBe("$8.000");

      expect(result[2].titulo).toBe("Caro");
      expect(result[2].precio).toBe("$15.000");
    });

    test("debería retornar array vacío si todos los scrapers retornan vacío", async () => {
      knasta.scrapeKnasta.mockResolvedValue([]);
      paris.scrapeParis.mockResolvedValue([]);
      easy.scrapeEasy.mockResolvedValue([]);

      const result = await conversation(
        "1234567890",
        "Usuario",
        "buscar producto inexistente",
      );

      expect(result).toEqual([]);
    });
  });

  describe("Manejo de errores", () => {
    test("debería retornar array vacío si un scraper falla", async () => {
      knasta.scrapeKnasta.mockRejectedValue(new Error("Error en Knasta"));
      paris.scrapeParis.mockResolvedValue([
        {
          titulo: "Product",
          precio: "$1000",
          tienda: "Paris",
          link: "http://paris.cl",
        },
      ]);
      easy.scrapeEasy.mockResolvedValue([]);

      const result = await conversation(
        "1234567890",
        "Usuario",
        "buscar producto",
      );

      // Debe retornar array vacío cuando hay error
      expect(result).toEqual([]);
    });

    test("debería manejar error en París sin fallar", async () => {
      knasta.scrapeKnasta.mockResolvedValue([
        {
          titulo: "Product",
          precio: "$1000",
          tienda: "Knasta",
          link: "http://knasta.cl",
        },
      ]);
      paris.scrapeParis.mockRejectedValue(new Error("Error París"));
      easy.scrapeEasy.mockResolvedValue([]);

      const result = await conversation(
        "1234567890",
        "Usuario",
        "buscar producto",
      );

      expect(result).toEqual([]);
    });

    test("debería manejar error en Easy sin fallar", async () => {
      knasta.scrapeKnasta.mockResolvedValue([]);
      paris.scrapeParis.mockResolvedValue([
        {
          titulo: "Product",
          precio: "$2000",
          tienda: "Paris",
          link: "http://paris.cl",
        },
      ]);
      easy.scrapeEasy.mockRejectedValue(new Error("Error Easy"));

      const result = await conversation(
        "1234567890",
        "Usuario",
        "buscar producto",
      );

      expect(result).toEqual([]);
    });

    test("debería manejar error sin lanzar excepciones no capturadas", async () => {
      knasta.scrapeKnasta.mockRejectedValue(new Error("Error crítico"));
      paris.scrapeParis.mockRejectedValue(new Error("Error crítico"));
      easy.scrapeEasy.mockRejectedValue(new Error("Error crítico"));

      const result = await conversation(
        "1234567890",
        "Usuario",
        "buscar producto",
      );

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Flujo completo - Caso de uso real", () => {
    test('debería procesar correctamente búsqueda de "plafon led" con flujo completo', async () => {
      // Simulando datos reales exactamente como los retorna cada scraper
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
          titulo: "Plafon de Techo Empotrable LED 7W Luz Fría",
          precio: "$7.500",
          precioAnterior: "$12.500",
          descuento: "40%",
          tienda: "Knasta",
          link: "https://knasta.cl/plafon-led-empotrables",
        },
      ];

      const easyResults = [
        {
          titulo: "Plafon LED Ajustable 24W",
          precio: "$9.990",
          precioAnterior: null,
          descuento: null,
          tienda: "Easy",
          link: "https://www.easy.cl/plafon-led-24w",
        },
      ];

      knasta.scrapeKnasta.mockResolvedValue(knastaResults);
      paris.scrapeParis.mockResolvedValue(parisResults);
      easy.scrapeEasy.mockResolvedValue(easyResults);

      const result = await conversation(
        "1234567890",
        "Usuario",
        "buscar plafon led",
      );

      // Validar estructura completa
      expect(result).toHaveLength(3);

      // Validar ordenamiento por precio
      expect(result[0].precio).toBe("$7.500");
      expect(result[0].titulo).toBe(
        "Plafon de Techo Empotrable LED 7W Luz Fría",
      );
      expect(result[0].tienda).toBe("Knasta");

      expect(result[1].precio).toBe("$8.990");
      expect(result[1].titulo).toBe(
        "Plafon LED Sobrepuesto Logic 24W Luz Fria Blacklight 1920LM",
      );
      expect(result[1].tienda).toBe("Paris");
      expect(result[1].descuento).toBe("40%");

      expect(result[2].precio).toBe("$9.990");
      expect(result[2].titulo).toBe("Plafon LED Ajustable 24W");
      expect(result[2].tienda).toBe("Easy");

      // Validar that all fields are preserved
      expect(result[0].link).toBe("https://knasta.cl/plafon-led-empotrables");
      expect(result[1].precioAnterior).toBe("$14.990");
      expect(result[2].descuento).toBeNull();
    });

    test("debería procesar búsqueda del usuario Juan Pérez correctamente", async () => {
      paris.scrapeParis.mockResolvedValue([
        {
          titulo: "Monitor 27 Pulgadas",
          precio: "$199.990",
          precioAnterior: "$299.990",
          descuento: "33%",
          tienda: "Paris",
          link: "https://www.paris.cl/monitor",
        },
      ]);
      knasta.scrapeKnasta.mockResolvedValue([]);
      easy.scrapeEasy.mockResolvedValue([]);

      const result = await conversation(
        "1234567890",
        "Juan Pérez",
        "buscar monitor",
      );

      expect(result).toHaveLength(1);
      expect(result[0].tienda).toBe("Paris");
      expect(result[0].descuento).toBe("33%");
    });
  });
});
