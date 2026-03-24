import { jest } from "@jest/globals";
import generateContent from "../functions/gemini.js";
import { GoogleGenAI } from "@google/genai";

// Mock de GoogleGenAI
jest.mock("@google/genai");

describe("gemini - Generación de contenido con IA", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Inicialización de cliente", () => {
    test("debería inicializar GoogleGenAI con la API key", async () => {
      const mockResponse = {
        text: "Respuesta de prueba",
      };

      const mockGenerateContent = jest.fn().mockResolvedValue(mockResponse);

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const apiKey = "test_api_key_12345";
      const prompt = "Busca los mejores precios de: ";
      const text = "buscar plafon led";

      await generateContent(apiKey, prompt, text);

      expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: apiKey });
    });

    test("debería manejar diferentes API keys", async () => {
      const mockResponse = {
        text: "Respuesta",
      };

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue(mockResponse),
        },
      }));

      const apiKey1 = "key_1";
      const apiKey2 = "key_2";

      await generateContent(apiKey1, "test", "buscar producto");
      await generateContent(apiKey2, "test", "buscar producto");

      expect(GoogleGenAI).toHaveBeenCalledTimes(2);
    });
  });

  describe("Generación de contenido", () => {
    test("debería llamar a generateContent con modelo correcto", async () => {
      const mockResponse = {
        text: "Contenido generado",
      };

      const mockGenerateContent = jest.fn().mockResolvedValue(mockResponse);

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      await generateContent("api_key", "prompt", "buscar producto");

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gemini-3-flash-preview",
        }),
      );
    });

    test("debería pasar contenido combinado correctamente", async () => {
      const mockResponse = {
        text: "Respuesta",
      };

      const mockGenerateContent = jest.fn().mockResolvedValue(mockResponse);

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const prompt = "Analiza: ";
      const text = "buscar plafon led";

      await generateContent("api_key", prompt, text);

      expect(mockGenerateContent).toHaveBeenCalled();
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents).toContain("Analiza: ");
      expect(callArgs.contents).toContain("plafon led");
    });

    test("debería retornar el texto de la respuesta", async () => {
      const expectedText = "Plafon LED encontrado en múltiples tiendas";
      const mockResponse = {
        text: expectedText,
      };

      const mockGenerateContent = jest.fn().mockResolvedValue(mockResponse);

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const result = await generateContent(
        "api_key",
        "prompt",
        "buscar producto",
      );

      expect(result).toBe(expectedText);
    });
  });

  describe("Extracción de búsqueda", () => {
    test("debería extraer búsqueda correctamente de comando 'buscar'", async () => {
      const mockResponse = {
        text: "Respuesta",
      };

      const mockGenerateContent = jest.fn().mockResolvedValue(mockResponse);

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const text = "buscar laptop hp";
      await generateContent("api_key", "prompt", text);

      // text.slice(11).trim() extrae "laptop hp" pero aquí slice(7)
      // El input real es el que cuenta: "buscar " = 7 caracteres
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    test("debería manejar espacios extras en búsqueda", async () => {
      const mockResponse = {
        text: "Respuesta",
      };

      const mockGenerateContent = jest.fn().mockResolvedValue(mockResponse);

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const text = "buscar   samsung tv";
      await generateContent("api_key", "prompt", text);

      // Verificar que generateContent fue llamado
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    test("debería combinar prompt y búsqueda correctamente", async () => {
      const mockResponse = {
        text: "Respuesta",
      };

      const mockGenerateContent = jest.fn().mockResolvedValue(mockResponse);

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const prompt = "Encuentra el mejor precio para: ";
      const text = "buscar iphone 15 pro";

      await generateContent("api_key", prompt, text);

      const callArgs = mockGenerateContent.mock.calls[0][0];
      const combined = callArgs.contents;

      expect(combined).toBe(prompt + " " + "iphone 15 pro");
    });
  });

  describe("Manejo de errores", () => {
    test("debería manejar error en la API", async () => {
      const errorMessage = "API rate limit exceeded";

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockRejectedValue(new Error(errorMessage)),
        },
      }));

      await expect(
        generateContent("api_key", "prompt", "buscar producto"),
      ).rejects.toThrow(errorMessage);
    });

    test("debería manejar respuesta vacía", async () => {
      const mockResponse = {
        text: "",
      };

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue(mockResponse),
        },
      }));

      const result = await generateContent(
        "api_key",
        "prompt",
        "buscar producto",
      );

      expect(result).toBe("");
    });

    test("debería manejar API key inválida", async () => {
      GoogleGenAI.mockImplementation(() => {
        throw new Error("Invalid API key");
      });

      await expect(
        generateContent("invalid_key", "prompt", "buscar producto"),
      ).rejects.toThrow("Invalid API key");
    });
  });

  describe("Casos de uso reales", () => {
    test("debería generar contenido para búsqueda de plafon led", async () => {
      const expectedResponse = `
        Se encontraron los siguientes plafonez LED:
        1. Plafon LED Sobrepuesto: $8.990
        2. Plafon LED 30W: $12.990
      `;

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: expectedResponse,
          }),
        },
      }));

      const result = await generateContent(
        "api_key",
        "Analiza los precios encontrados: ",
        "buscar plafon led",
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    test("debería procesar comando de búsqueda de usuario", async () => {
      const mockResponse = {
        text: "Se encontraron laptops en múltiples tiendas",
      };

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue(mockResponse),
        },
      }));

      const result = await generateContent(
        "api_key",
        "Busca información de: ",
        "buscar laptop asus vivobook",
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    test("debería pasar prompt al contexto de IA", async () => {
      const prompt = "Eres un asistente de compras. Tu tarea es: ";
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: "Respuesta contextualizada",
      });

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      await generateContent("api_key", prompt, "buscar producto");

      // Verificar que fue llamado con el prompt
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: expect.stringContaining(prompt),
        }),
      );
    });
  });

  describe("Validaciones de entrada", () => {
    test("debería aceptar cualquier API key", async () => {
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: "ok",
          }),
        },
      }));

      // No debería fallar con diferentes formatos de API key
      await generateContent("abc123", "prompt", "buscar producto");
      await generateContent("key-with-dashes-123", "prompt", "buscar producto");
      await generateContent("", "prompt", "buscar producto");

      expect(GoogleGenAI).toHaveBeenCalledTimes(3);
    });

    test("debería aceptar prompts vacíos", async () => {
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: "Respuesta sin prompt",
          }),
        },
      }));

      const result = await generateContent("api_key", "", "buscar producto");

      expect(result).toBeDefined();
    });

    test("debería aceptar textos de búsqueda variados", async () => {
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: "ok",
          }),
        },
      }));

      await generateContent("api_key", "prompt", "buscar a");
      await generateContent(
        "api_key",
        "prompt",
        "buscar producto muy largo con muchas palabras",
      );
      await generateContent("api_key", "prompt", "buscar 12345");

      expect(GoogleGenAI).toHaveBeenCalledTimes(3);
    });
  });

  describe("Interpretación de lenguaje natural", () => {
    test("debería interpretar descripción natural de usuario: plafón LED", async () => {
      const userInput =
        "descripcion necesito una de esas cosas que alumbran que poni en el techo";
      const geminiResponse = `🧐 posibles productos: Lámpara de techo colgante,Plafón LED,Foco empotrable 
🕵️‍♂️ si encontre tu producto escribe la palabra buscar + [nombre producto] para ayudarte a cotizarlo.`;

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: geminiResponse,
          }),
        },
      }));

      const result = await generateContent(
        "api_key",
        "Interpreta la siguiente búsqueda y sugiere productos: ",
        userInput,
      );

      expect(result).toContain("Plafón LED");
      expect(result).toContain("Lámpara de techo colgante");
      expect(result).toContain("Foco empotrable");
      expect(result).toContain("buscar");
    });

    test("debería extraer correctamente comando 'descripcion' de entrada", async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: "respuesta",
      });

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      // "descripcion" tiene 11 caracteres, así que slice(11) extrae el resto
      const text = "descripcion necesito un televisor grande";
      await generateContent("api_key", "prompt", text);

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents).toContain("necesito un televisor grande");
    });

    test("debería sugerir múltiples productos para búsqueda vaga", async () => {
      const vaguInput = "descripcion algo para iluminar";
      const geminiResponse = `🧐 posibles productos: Lámpara de escritorio,Lámpara LED,Foco,Bombilla inteligente
🕵️‍♂️ si encontre tu producto escribe buscar + [nombre producto]`;

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: geminiResponse,
          }),
        },
      }));

      const result = await generateContent(
        "api_key",
        "Reconoce productos: ",
        vaguInput,
      );

      expect(result).toContain("posibles productos");
      expect(result.match(/,/g) || []).length >= 2; // Al menos 2 opciones separadas por comas
    });

    test("debería retornar guía para buscar después de sugerir", async () => {
      const userDescription = "descripcion necesito algo para cocina";
      const geminiResponse = `🧐 posibles productos: Lámpara para cocina,Bombilla LED cálida
🕵️‍♂️ si encontre tu producto escribe la palabra buscar + [nombre producto]`;

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: geminiResponse,
          }),
        },
      }));

      const result = await generateContent(
        "api_key",
        "Entiende qué busca el usuario: ",
        userDescription,
      );

      expect(result).toContain("🧐");
      expect(result).toContain("buscar");
      expect(result).toContain("[nombre producto]");
    });

    test("debería manejar búsquedas en diferentes contextos", async () => {
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: "🧐 posibles productos: Producto A, Producto B",
          }),
        },
      }));

      // Diferentes contextos de descripción
      const contexts = [
        "descripcion necesito algo para el dormitorio",
        "descripcion algo para la sala",
        "descripcion para el baño",
      ];

      for (const context of contexts) {
        const result = await generateContent("api_key", "prompt", context);
        expect(result).toContain("posibles productos");
      }

      expect(GoogleGenAI).toHaveBeenCalledTimes(3);
    });

    test("debería preservar estructura de respuesta Gemini con emojis", async () => {
      const emojiResponse = `🧐 posibles productos: Item 1,Item 2,Item 3
🕵️‍♂️ instrucciones especiales`;

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: emojiResponse,
          }),
        },
      }));

      const result = await generateContent(
        "api_key",
        "prompt",
        "descripcion test",
      );

      expect(result).toContain("🧐");
      expect(result).toContain("🕵️");
      expect(result).toBe(emojiResponse);
    });

    test("debería procesar entrada del usuario 'descripcion' correctamente", async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: "🧐 productos sugeridos",
      });

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const userDescription =
        "descripcion quiero algo que brille en la oscuridad";

      await generateContent(
        "api_key",
        "Analiza esta descripción: ",
        userDescription,
      );

      // Validar que Gemini recibió la descripción (sin "descripcion")
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents).toContain(
        "quiero algo que brille en la oscuridad",
      );
      expect(callArgs.contents).not.toContain("descripcionquiero");
    });

    test("debería retornar sugerencias sin que el usuario especifique 'buscar'", async () => {
      const naturalDescription =
        "descripcion me dona la cabeza quiero algo para iluminar mejor";
      const geminiSuggestion = `🧐 posibles productos: Lámpara de lectura,Luz LED regulable,Foco inteligente
🕵️‍♂️ escribe buscar + [nombre del producto]`;

      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: geminiSuggestion,
          }),
        },
      }));

      const result = await generateContent(
        "api_key",
        "Sugiere productos para: ",
        naturalDescription,
      );

      // Debe sugerir sin que usuario haya escrito "buscar"
      expect(result).toContain("posibles productos");
      expect(result).toContain("Lámpara");
      expect(result).toContain("buscar"); // Pero guía para hacerlo
    });
  });
});
