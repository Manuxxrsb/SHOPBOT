import { jest } from "@jest/globals";
import {
  initBrowser,
  getBrowser,
  closeBrowser,
  __resetBrowserState,
} from "../functions/browser.js";
import puppeteer from "puppeteer";

// Mock de puppeteer
jest.mock("puppeteer");

describe("browser - Gestión del navegador Puppeteer", () => {
  beforeEach(() => {
    __resetBrowserState();
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("initBrowser - Inicialización del navegador", () => {
    test("debería lanzar puppeteer con argumentos correctos", async () => {
      const mockBrowser = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      await initBrowser();

      expect(puppeteer.launch).toHaveBeenCalledWith({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    });

    test("debería registrar evento de desconexión del browser", async () => {
      const mockBrowser = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      await initBrowser();

      expect(mockBrowser.on).toHaveBeenCalledWith(
        "disconnected",
        expect.any(Function),
      );
    });

    test("debería retornar el browser iniciado", async () => {
      const mockBrowser = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      const result = await initBrowser();

      expect(result).toBe(mockBrowser);
    });

    test("debería no relanzar browser si ya está iniciado", async () => {
      const mockBrowser = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      await initBrowser();
      await initBrowser();

      // Launch debe ser llamado solo una vez
      expect(puppeteer.launch).toHaveBeenCalledTimes(1);
    });
  });

  describe("getBrowser - Obtener el navegador", () => {
    test("debería retornar el browser si está inicializado", async () => {
      const mockBrowser = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      await initBrowser();
      const result = getBrowser();

      expect(result).toBe(mockBrowser);
    });

    test("debería lanzar error si browser no está inicializado", () => {
      puppeteer.launch.mockResolvedValue(null);

      // Resetear las variables internas
      jest.resetModules();

      expect(() => {
        // Importar nuevamente sin inicializar
        require("../functions/browser.js").getBrowser();
      }).toThrow("Browser no inicializado. Llama initBrowser() primero.");
    });
  });

  describe("closeBrowser - Cerrar el navegador", () => {
    test("debería cerrar el browser si está iniciado", async () => {
      const mockBrowser = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      await initBrowser();
      await closeBrowser();

      expect(mockBrowser.close).toHaveBeenCalled();
    });

    test("no debería fallar si se intenta cerrar sin inicializar", async () => {
      // No debe lanzar error
      await expect(closeBrowser()).resolves.toBeUndefined();
    });

    test("debería no intentar cerrar dos veces", async () => {
      const mockBrowser = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      await initBrowser();
      await closeBrowser();
      await closeBrowser();

      // Close debe ser llamado solo una vez
      expect(mockBrowser.close).toHaveBeenCalledTimes(1);
    });

    test("debería limpiar referencias del browser después de cerrar", async () => {
      const mockBrowser = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      await initBrowser();
      await closeBrowser();

      // Intentar obtener el browser debería lanzar error
      // (en una aplicación real)
    });
  });

  describe("Ciclo completo de vida", () => {
    test("debería inicializar y cerrar correctamente", async () => {
      const mockBrowser = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      // Inicializar
      await initBrowser();
      expect(getBrowser()).toBe(mockBrowser);

      // Cerrar
      await closeBrowser();
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    test("debería poder reinicializar después de cerrar", async () => {
      const mockBrowser1 = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      const mockBrowser2 = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch
        .mockResolvedValueOnce(mockBrowser1)
        .mockResolvedValueOnce(mockBrowser2);

      // Primer ciclo
      await initBrowser();
      let browser = getBrowser();
      expect(browser).toBe(mockBrowser1);

      await closeBrowser();

      // Segundo ciclo
      await initBrowser();
      browser = getBrowser();
      expect(browser).toBe(mockBrowser2);

      expect(puppeteer.launch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Manejo de eventos", () => {
    test("debería registrar el evento disconnected", async () => {
      const mockBrowser = {
        on: jest.fn(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      await initBrowser();

      // Verificar que .on() fue llamado
      expect(mockBrowser.on).toHaveBeenCalled();
      // Verificar que fue llamado con "disconnected"
      expect(mockBrowser.on).toHaveBeenCalledWith(
        "disconnected",
        expect.any(Function),
      );
    });

    test("debería manejar desconexión inesperada del browser", async () => {
      const mockBrowser = {
        on: jest.fn((event, callback) => {
          if (event === "disconnected") {
            // Simular desconexión
            callback();
          }
        }),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      await initBrowser();

      // El browser debería estar disponible después del evento
      // (dependiendo de la implementación)
      expect(mockBrowser.on).toHaveBeenCalled();
    });
  });

  describe("Configuración de Puppeteer", () => {
    test("debería usar headless: 'new' para mejor rendimiento", async () => {
      const mockBrowser = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      await initBrowser();

      expect(puppeteer.launch).toHaveBeenCalledWith(
        expect.objectContaining({
          headless: "new",
        }),
      );
    });

    test("debería desactivar sandbox por compatibilidad", async () => {
      const mockBrowser = {
        on: jest.fn().mockReturnValue(),
        close: jest.fn().mockResolvedValue(),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      await initBrowser();

      expect(puppeteer.launch).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.arrayContaining([
            "--no-sandbox",
            "--disable-setuid-sandbox",
          ]),
        }),
      );
    });
  });
});
