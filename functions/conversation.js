import { scrapeKnasta } from "./scrapers/knasta.js";
import { scrapeRipley } from "./scrapers/ripley.js";
import { closeBrowser } from "./browser.js";

export async function conversation(from, profileName, text) {
  console.log(`🔎 Iniciando búsqueda para ${profileName} (${from})`);

  try {
    const product = text.slice(7).trim();

    if (!product) {
      console.log("⚠️ No se proporcionó un nombre de producto");
      return [];
    }

    console.log(`🛒 Producto solicitado: ${product}`);

    // 🔥 Ejecutamos ambos scrapers en paralelo
    const [knastaResults, ripleyResults] = await Promise.all([
      scrapeKnasta(product, 3),
      scrapeRipley(product, 3),
    ]);

    // Unificamos resultados
    const results = [...knastaResults, ...ripleyResults];

    console.log(`✅ Total productos encontrados: ${results.length}`);

    return results;

  } catch (error) {
    console.error(`❌ Error en la búsqueda para ${profileName}:`, error);
    return [];
  } finally {
    // 🔥 IMPORTANTE: cerrar browser después de terminar la conversación
    await closeBrowser();
  }
}
