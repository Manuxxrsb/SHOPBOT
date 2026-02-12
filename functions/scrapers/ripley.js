import { getBrowser } from "../browser.js";

const buildRipleyUrl = (producto) =>
  `https://simple.ripley.cl/search/${encodeURIComponent(producto)}`;

export async function scrapeRipley(nombre_producto, limit = 3) {
  let page;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // 🔥 bloquear recursos pesados
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        ["image", "stylesheet", "font", "media"].includes(req.resourceType())
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log(`🔍 Buscando "${nombre_producto}" en Ripley...`);

    await page.goto(buildRipleyUrl(nombre_producto), {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // 🔥 Esperamos el contenedor principal de productos
    await page.waitForSelector("div.catalog-page__product-grid--with-sidebar", {
      timeout: 20000,
    });

    // 🔥 Esperamos productos individuales
    await page.waitForSelector("div.catalog-product-item", {
      timeout: 20000,
    });

    const data = await page.$$eval(
      "div.catalog-product-item",
      (items, limit) => {
        return items.slice(0, limit).map((item) => {
          const anchor = item.querySelector("a[href*='/p/']");
          const title =
            item
              .querySelector(".catalog-product-details__name")
              ?.innerText.trim() || null;

          const price =
            item
              .querySelector(".catalog-prices__offer-price")
              ?.innerText.trim() || null;

          return {
            titulo: title,
            precio: price,
            tienda: "Ripley",
            link: anchor
              ? `https://simple.ripley.cl${anchor.getAttribute("href")}`
              : null,
          };
        });
      },
      limit,
    );

    console.log(`✅ Ripley encontró ${data.length} productos`);
    return data;
  } catch (error) {
    console.error("❌ Error Ripley:", error.message);
    return [];
  } finally {
    if (page) await page.close();
  }
}
