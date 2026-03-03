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

    // Esperamos que aparezcan los productos
    await page.waitForSelector("div[role='gridcell']", {
      timeout: 30000,
    });

    const data = await page.$$eval(
      "div[role='gridcell']",
      (items, limit) => {
        return items.slice(0, limit).map((item) => {
          const name = item.getAttribute("data-cnstrc-item-name");
          const priceRaw = item.getAttribute("data-cnstrc-item-price");

          const anchor = item.querySelector("a[href]");
          const link = anchor
            ? `https://www.paris.cl${anchor.getAttribute("href")}`
            : null;

          return {
            titulo: name || null,
            precio: priceRaw
              ? `$${Number(priceRaw).toLocaleString("es-CL")}`
              : null,
            tienda: "Paris",
            link,
          };
        });
      },
      limit,
    );

    console.log(`✅ Paris encontró ${data.length} productos`);
    return data;
  } catch (error) {
    console.error("❌ Error Paris:", error.message);
    return [];
  } finally {
    if (page) await page.close();
  }
}
