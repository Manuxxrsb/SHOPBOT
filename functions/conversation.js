import { scrapeKnasta } from "./scrapers/knasta.js";
import { scrapeRipley } from "./scrapers/ripley.js";

export async function conversation(from, profileName, text) {
  console.log(`🔎 Iniciando búsqueda para ${profileName} (${from})`);

  try {
    const product = text.slice(7).trim();

    if (!product) {
      console.log("⚠️ No se proporcionó un nombre de producto");
      return [];
    }

    console.log(`🛒 Producto solicitado: ${product}`);

    // 🔥 EJECUCIÓN EN SECUENCIA (NO PARALELO)
    const knastaResults = await scrapeKnasta(product, 3);

    // pequeño delay para que Render respire
    await new Promise((r) => setTimeout(r, 1500));

    const ripleyResults = await scrapeRipley(product, 3);

    const results = [...knastaResults, ...ripleyResults];

    console.log(`✅ Total productos encontrados: ${results.length}`);

    return results;
  } catch (error) {
    console.error(
      `❌ Error en la búsqueda para ${profileName}:`,
      error.message,
    );
    return [];
  }
}
