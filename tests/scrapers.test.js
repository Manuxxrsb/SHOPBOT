import { jest } from "@jest/globals";
import { scrapeParis } from "../functions/scrapers/paris.js";
import { scrapeKnasta } from "../functions/scrapers/knasta.js";
import { scrapeEasy } from "../functions/scrapers/easy.js";
import * as browserModule from "../functions/browser.js";

// Mock del browser (no ejecutaremos el browser real en tests)
jest.mock("../functions/browser.js");

describe("Scrapers - Extracción de datos de tiendas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validación de estructura de datos retornados", () => {
    test("página París debería retornar estructura correcta", async () => {
      // Los scrapers siempre retornan array con estructura específica
      // Incluso con mock, validamos que si todo va bien, retorna estructura correcta

      // Mock del browser
      const mockPage = {
        goto: jest.fn().mockResolvedValue(),
        waitForSelector: jest.fn().mockResolvedValue(),
        $$eval: jest.fn().mockResolvedValue([
          {
            titulo: "Plafon LED Test",
            precio: "$8.990",
            precioAnterior: "$14.990",
            descuento: "40%",
            tienda: "Paris",
            link: "https://www.paris.cl/producto",
          },
        ]),
        close: jest.fn().mockResolvedValue(),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      const result = await scrapeParis("plafon led", 3);

      // Validar estructura
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("titulo");
      expect(result[0]).toHaveProperty("precio");
      expect(result[0]).toHaveProperty("precioAnterior");
      expect(result[0]).toHaveProperty("descuento");
      expect(result[0]).toHaveProperty("tienda");
      expect(result[0]).toHaveProperty("link");
    });

    test("página Knasta debería retornar estructura correcta", async () => {
      const mockPage = {
        setViewport: jest.fn().mockResolvedValue(),
        goto: jest.fn().mockResolvedValue(),
        waitForSelector: jest.fn().mockResolvedValue(),
        $$eval: jest.fn().mockResolvedValue([
          {
            titulo: "Plafon LED Knasta",
            precio: "$7.500",
            precioAnterior: "$12.500",
            descuento: "40%",
            tienda: "Knasta",
            link: "https://knasta.cl/producto",
          },
        ]),
        close: jest.fn().mockResolvedValue(),
        isClosed: jest.fn().mockReturnValue(false),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      const result = await scrapeKnasta("plafon led", 3);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].tienda).toBe("Knasta");
    });

    test("página Easy debería retornar estructura correcta", async () => {
      const mockPage = {
        goto: jest.fn().mockResolvedValue(),
        waitForSelector: jest.fn().mockResolvedValue(),
        $$eval: jest.fn().mockResolvedValue([
          {
            titulo: "Plafon LED Easy",
            precio: "$9.990",
            precioAnterior: null,
            descuento: null,
            tienda: "Easy",
            link: "https://www.easy.cl/producto",
          },
        ]),
        close: jest.fn().mockResolvedValue(),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      const result = await scrapeEasy("plafon led", 3);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].tienda).toBe("Easy");
    });
  });

  describe("Límites de resultados", () => {
    test("París debería respetar el límite de productos", async () => {
      // Cuando se solicita 3 productos, debería retornar máximo 3
      const mockPage = {
        goto: jest.fn().mockResolvedValue(),
        waitForSelector: jest.fn().mockResolvedValue(),
        $$eval: jest.fn().mockResolvedValue([
          { titulo: "P1", precio: "$100", tienda: "Paris", link: "http://1" },
          { titulo: "P2", precio: "$200", tienda: "Paris", link: "http://2" },
          { titulo: "P3", precio: "$300", tienda: "Paris", link: "http://3" },
        ]),
        close: jest.fn().mockResolvedValue(),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      const result = await scrapeParis("producto", 3);

      expect(result.length).toBeLessThanOrEqual(3);
    });

    test("Knasta debería respetar el límite de productos", async () => {
      const mockPage = {
        setViewport: jest.fn().mockResolvedValue(),
        goto: jest.fn().mockResolvedValue(),
        waitForSelector: jest.fn().mockResolvedValue(),
        $$eval: jest.fn().mockResolvedValue([
          { titulo: "K1", precio: "$100", tienda: "Knasta", link: "http://1" },
          { titulo: "K2", precio: "$200", tienda: "Knasta", link: "http://2" },
        ]),
        close: jest.fn().mockResolvedValue(),
        isClosed: jest.fn().mockReturnValue(false),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      const result = await scrapeKnasta("producto", 4);

      expect(result.length).toBeLessThanOrEqual(4);
    });
  });

  describe("Manejo de errores", () => {
    test("París debería retornar array vacío si falla la navegación", async () => {
      const mockPage = {
        goto: jest.fn().mockRejectedValue(new Error("Timeout")),
        close: jest.fn().mockResolvedValue(),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      const result = await scrapeParis("producto", 3);

      expect(result).toEqual([]);
    });

    test("Knasta debería retornar array vacío si falla el scraping", async () => {
      const mockPage = {
        setViewport: jest.fn().mockResolvedValue(),
        goto: jest.fn().mockResolvedValue(),
        waitForSelector: jest
          .fn()
          .mockRejectedValue(new Error("Selector no encontrado")),
        close: jest.fn().mockResolvedValue(),
        isClosed: jest.fn().mockReturnValue(false),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      const result = await scrapeKnasta("producto", 3);

      expect(result).toEqual([]);
    });

    test("Easy debería retornar array vacío si falla la búsqueda", async () => {
      const mockPage = {
        goto: jest.fn().mockRejectedValue(new Error("Network error")),
        close: jest.fn().mockResolvedValue(),
        screenshot: jest.fn().mockResolvedValue(),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      const result = await scrapeEasy("producto", 3);

      expect(result).toEqual([]);
    });
  });

  describe("Búsquedas específicas", () => {
    test('París debería buscar correctamente "plafon led"', async () => {
      const mockPage = {
        goto: jest.fn().mockResolvedValue(),
        waitForSelector: jest.fn().mockResolvedValue(),
        $$eval: jest.fn().mockResolvedValue([]),
        close: jest.fn().mockResolvedValue(),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      await scrapeParis("plafon led", 3);

      // Validar que se navegó
      expect(mockPage.goto).toHaveBeenCalled();
    });

    test('Knasta debería buscar correctamente "laptop asus"', async () => {
      const mockPage = {
        setViewport: jest.fn().mockResolvedValue(),
        goto: jest.fn().mockResolvedValue(),
        waitForSelector: jest.fn().mockResolvedValue(),
        $$eval: jest.fn().mockResolvedValue([]),
        close: jest.fn().mockResolvedValue(),
        isClosed: jest.fn().mockReturnValue(false),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      await scrapeKnasta("laptop asus", 3);

      // Validar que se navegó
      expect(mockPage.goto).toHaveBeenCalled();
    });

    test('Easy debería buscar correctamente "smart tv"', async () => {
      const mockPage = {
        goto: jest.fn().mockResolvedValue(),
        waitForSelector: jest.fn().mockResolvedValue(),
        $$eval: jest.fn().mockResolvedValue([]),
        close: jest.fn().mockResolvedValue(),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      await scrapeEasy("smart tv", 3);

      // Validar que se navegó
      expect(mockPage.goto).toHaveBeenCalled();
    });
  });

  describe("Cierre de páginas", () => {
    test("París debería cerrar la página después de scrapear", async () => {
      const mockPage = {
        goto: jest.fn().mockResolvedValue(),
        waitForSelector: jest.fn().mockResolvedValue(),
        $$eval: jest.fn().mockResolvedValue([]),
        close: jest.fn().mockResolvedValue(),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      await scrapeParis("producto", 3);

      expect(mockPage.close).toHaveBeenCalled();
    });

    test("Knasta debería cerrar la página después de scrapear", async () => {
      const mockPage = {
        setViewport: jest.fn().mockResolvedValue(),
        goto: jest.fn().mockResolvedValue(),
        waitForSelector: jest.fn().mockResolvedValue(),
        $$eval: jest.fn().mockResolvedValue([]),
        close: jest.fn().mockResolvedValue(),
        isClosed: jest.fn().mockReturnValue(false),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      await scrapeKnasta("producto", 3);

      expect(mockPage.close).toHaveBeenCalled();
    });

    test("Easy debería cerrar la página después de scrapear", async () => {
      const mockPage = {
        goto: jest.fn().mockResolvedValue(),
        waitForSelector: jest.fn().mockResolvedValue(),
        $$eval: jest.fn().mockResolvedValue([]),
        close: jest.fn().mockResolvedValue(),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
      };

      browserModule.getBrowser.mockReturnValue(mockBrowser);

      await scrapeEasy("producto", 3);

      expect(mockPage.close).toHaveBeenCalled();
    });
  });
});
