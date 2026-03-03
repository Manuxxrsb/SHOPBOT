import { getBrowser } from "../browser.js";

const buildParisUrl = (producto) =>
  `https://www.paris.cl/search/?q=${encodeURIComponent(producto)}`;

export async function scrapeParis(nombre_producto, limit = 3) {
  let page;

  try {
    const browser = await getBrowser();
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
          const priceRaw = item.getAttribute("data-cnstrc-item-price");

          // 🔥 Si no hay precio, saltamos este producto
          if (!priceRaw) continue;

          const anchor = item.querySelector("a[href]");
          const link = anchor
            ? `https://www.paris.cl${anchor.getAttribute("href")}`
            : null;

          results.push({
            titulo: name || null,
            precio: `$${Number(priceRaw).toLocaleString("es-CL")}`,
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
