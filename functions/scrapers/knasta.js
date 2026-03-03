import { getBrowser } from "../browser.js";

export async function scrapeKnasta(nombre_producto, limit = 4) {
  let page;

  try {
    const browser = getBrowser();
    page = await browser.newPage();

    console.log(`🔍 Buscando "${nombre_producto}" en knasta...`);

    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(
      `https://knasta.cl/results?q=${encodeURIComponent(nombre_producto)}`,
      {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      },
    );

    await page.waitForSelector("article.new-product-box_productBox__CSUHu", {
      timeout: 20000,
    });

    const data = await page.$$eval(
      "article.new-product-box_productBox__CSUHu",
      (articles, limit) =>
        articles.slice(0, limit).map((article) => {
          const titleEl = article.querySelector(
            "h3.product-box-title_productTitle___pv5Q a",
          );

          // Precio actual
          const precioActualElement = article.querySelector(
            "span[class*='currentPrice']",
          );

          const precioActual = precioActualElement
            ? precioActualElement.innerText.trim()
            : null;

          const precioAnteriorElement = article.querySelector(
            "div[class*='originalPrice']",
          );

          const precioAnterior = precioAnteriorElement
            ? precioAnteriorElement.innerText.trim()
            : null;

          const descuentoElement = article.querySelector(
            "span[class*='percentText']",
          );

          const descuento = descuentoElement
            ? descuentoElement.innerText.replace("de descuento.", "").trim()
            : null;

          return {
            titulo: titleEl?.textContent.trim() || null,
            precio: precioActual,
            precioAnterior,
            descuento,
            tienda: "Knasta",
            link: titleEl
              ? `https://knasta.cl${titleEl.getAttribute("href")}`
              : null,
          };
        }),
      limit,
    );

    return data;
  } catch (error) {
    console.error("❌ Error Knasta:", error.message);
    return [];
  } finally {
    if (page && !page.isClosed()) {
      await page.close();
    }
  }
}
