import { scrapeKnasta } from "./scrapers/knasta.js";
import { scrapeParis } from "./scrapers/paris.js";
import { bestPrice } from "./bestprice.js";
import { scrapeEasy } from "./scrapers/easy.js";

export async function conversation(from, profileName, text) {
  console.log(`🔎 Iniciando búsqueda para ${profileName} (${from})`);

  try {
    const product = text.slice(7).trim();

    if (!product) {
      console.log("⚠️ No se proporcionó un nombre de producto");
      return [];
    }

    console.log(`🛒 Producto solicitado: ${product}`);

    const knastaResults = await scrapeKnasta(product, 3);
    const parisResults = await scrapeParis(product, 3);
    const easyResults = await scrapeEasy(product, 3);
    const results = bestPrice([
      ...knastaResults,
      ...parisResults,
      ...easyResults,
    ]);

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
