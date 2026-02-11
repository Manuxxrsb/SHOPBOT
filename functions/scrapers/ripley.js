import { getBrowser } from "../browser.js";

const buildRipleyUrl = (producto) =>
  `https://simple.ripley.cl/search/${encodeURIComponent(producto)}?sort=relevance_desc&page=1`;

export async function scrapeRipley(nombre_producto, limit = 3) {
  let page;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // 🔥 bloquear recursos pesados
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["image", "stylesheet", "font", "media"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log(`🔍 Buscando "${nombre_producto}" en Ripley...`);

    await page.goto(buildRipleyUrl(nombre_producto), {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForSelector(".catalog-product-border", {
      timeout: 15000,
    });

    const data = await page.$$eval(
      ".catalog-product-border",
      (items, limit) =>
        items.slice(0, limit).map((item) => {
          const anchor = item.querySelector("a.catalog-product-item");

          return {
            titulo:
              item.querySelector(".catalog-product-details__name")
                ?.innerText.trim() || null,
            precio:
              item.querySelector(".catalog-prices__offer-price")
                ?.innerText.trim() || null,
            tienda: "Ripley",
            link: anchor
              ? `https://simple.ripley.cl${anchor.getAttribute("href")}`
              : null,
          };
        }),
      limit
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
