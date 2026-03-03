import { getBrowser } from "../browser.js";
import fs from "fs";
import path from "path";

const buildAbcUrl = (producto) =>
  `https://www.abc.cl/Busqueda/?q=${encodeURIComponent(producto)}&lang=es_CL`;

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 250);
    });
  });
}

export async function scrapeAbc(nombre_producto, limit = 3) {
  let page;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    console.log(`🔍 Buscando "${nombre_producto}" en ABC...`);

    // 🔥 USER AGENT REAL
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    // 🔥 HEADERS REALES
    await page.setExtraHTTPHeaders({
      "accept-language": "es-CL,es;q=0.9,en;q=0.8",
    });

    // 🔥 Viewport real
    await page.setViewport({
      width: 1366,
      height: 768,
    });

    // 🔥 Ocultar webdriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });

    await page.goto(buildAbcUrl(nombre_producto), {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Esperar más tiempo a que cargue JS
    await page.waitForTimeout(5000);

    await autoScroll(page);

    await page.waitForSelector(".product-tile__wrapper", {
      timeout: 30000,
    });

    const data = await page.$$eval(
      ".product-tile__wrapper",
      (items, limit) => {
        const results = [];

        for (const item of items) {
          if (results.length >= limit) break;

          const title =
            item.querySelector(".product-tile__name")?.innerText.trim() || null;

          const price =
            item.querySelector(".sales .value")?.innerText.trim() ||
            item.querySelector(".price-sales")?.innerText.trim() ||
            null;

          if (!price) continue;

          const discount =
            item.querySelector(".discount-percentage")?.innerText.trim() ||
            null;

          const anchor = item.querySelector("a[href]");
          const link = anchor ? anchor.href : null;

          results.push({
            titulo: title,
            precio: price,
            descuento: discount,
            tienda: "ABC",
            link,
          });
        }

        return results;
      },
      limit,
    );

    console.log(`✅ ABC encontró ${data.length} productos válidos`);
    return data;
  } catch (error) {
    console.error("❌ Error ABC:", error.message);

    const debugDir = path.resolve("debug");
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir);
    }

    if (page) {
      const filePath = path.join(debugDir, `abc_error_${Date.now()}.png`);

      await page.screenshot({
        path: filePath,
        fullPage: true,
      });

      console.log(`📸 Screenshot guardado en: ${filePath}`);
    }

    return [];
  } finally {
    if (page) await page.close();
  }
}
