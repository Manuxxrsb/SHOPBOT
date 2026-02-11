import { getBrowser } from "../browser.js";

const buildRipleyUrl = (producto) =>
  `https://simple.ripley.cl/search/${encodeURIComponent(producto)}?sort=relevance_desc&page=1`;

export async function scrapeRipley(nombre_producto, limit = 4) {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );

    console.log(`🔍 Buscando "${nombre_producto}" en Ripley...`);

    await page.goto(buildRipleyUrl(nombre_producto), {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await new Promise((r) => setTimeout(r, 3000));

    await page.waitForSelector(".catalog-product-border", {
      timeout: 20000,
    });

    const data = await page.$$eval(
      ".catalog-product-border",
      (items, limit) => {
        return items.slice(0, limit).map((item) => {
          const anchor = item.querySelector("a.catalog-product-item");

          return {
            titulo:
              item.querySelector(".catalog-product-details__name")
                ?.innerText.trim() || null,

            marca:
              item.querySelector(".brand-logo span")
                ?.innerText.trim() || null,

            precio:
              item.querySelector(".catalog-prices__offer-price")
                ?.innerText.trim() || null,

            precioInternet:
              item.querySelector(".catalog-prices__card-price")
                ?.innerText.trim() || null,

            precioOriginal:
              item.querySelector(".catalog-prices__list-price")
                ?.innerText.trim() || null,

            descuento:
              item.querySelector(".catalog-product-details__discount-tag")
                ?.innerText.trim() || null,

            tienda: "Ripley",

            link: anchor
              ? `https://simple.ripley.cl${anchor.getAttribute("href")}`
              : null,
          };
        });
      },
      limit
    );

    await page.close(); // 🔥 cerramos solo pestaña

    console.log(`✅ Ripley encontró ${data.length} productos`);

    return data;

  } catch (error) {
    console.error("❌ Error Ripley:", error.message);
    return [];
  }
}
