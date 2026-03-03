import { getBrowser } from "../browser.js";

const buildParisUrl = (producto) =>
  `https://www.paris.cl/search/?q=${encodeURIComponent(producto)}`;

export async function scrapeParis(nombre_producto, limit = 3) {
  let page;

  try {
    const browser = getBrowser();
    page = await browser.newPage();

    console.log(`🔍 Buscando "${nombre_producto}" en Paris...`);

    await page.goto(buildParisUrl(nombre_producto), {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await page.waitForSelector("div[role='gridcell']", {
      timeout: 30000,
    });

    const data = await page.$$eval(
      "div[role='gridcell']",
      (items, limit) => {
        const results = [];

        for (const item of items) {
          if (results.length >= limit) break;

          const name = item.getAttribute("data-cnstrc-item-name");
          const anchor = item.querySelector("a[href]");
          const link = anchor
            ? `https://www.paris.cl${anchor.getAttribute("href")}`
            : null;

          //precio
          const priceElement = item.querySelector(
            "[data-testid='paris-pod-price'] span:not(.ui-line-through)",
          );

          const precio = priceElement ? priceElement.innerText.trim() : null;

          if (!precio) continue; // si no hay precio, saltamos

          const oldPriceElement = item.querySelector(
            "[data-testid='paris-pod-price'] span.ui-line-through",
          );

          const precioAnterior = oldPriceElement
            ? oldPriceElement.innerText.trim()
            : null;

          //descuento
          const discountElement = item.querySelector(
            "[data-testid='paris-label']",
          );

          const descuento = discountElement
            ? discountElement.innerText.trim()
            : null;

          results.push({
            titulo: name || null,
            precio,
            precioAnterior,
            descuento,
            tienda: "Paris",
            link,
          });
        }

        return results;
      },
      limit,
    );

    return data;
  } catch (error) {
    console.error("❌ Error Paris:", error.message);
    return [];
  } finally {
    if (page) await page.close();
  }
}
