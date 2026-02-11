import puppeteer from "puppeteer";

const buildRipleyUrl = (producto) =>
  `https://simple.ripley.cl/search/${encodeURIComponent(producto)}?sort=relevance_desc&page=1`;

export async function scrapeRipley(nombre_producto, limit = 4) {
  let browser = null;

  try {
    console.log(`🔍 Buscando: "${nombre_producto}" en Ripley...`);

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );

    const url = buildRipleyUrl(nombre_producto);
    console.log("📡 Navegando a:", url);

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    await page.waitForSelector(".catalog-product-border", { timeout: 20000 });

    const data = await page.$$eval(
      ".catalog-product-border",
      (items, limit) => {
        return items.slice(0, limit).map((item) => {

          const anchor = item.querySelector("a.catalog-product-item");

          const titulo = item
            .querySelector(".catalog-product-details__name")
            ?.innerText.trim() || null;

          const marca = item
            .querySelector(".brand-logo span")
            ?.innerText.trim() || null;

          const precio = item
            .querySelector(".catalog-prices__offer-price")
            ?.innerText.trim() || null;

          const precioOriginal = item
            .querySelector(".catalog-prices__list-price")
            ?.innerText.trim() || null;

          const descuento = item
            .querySelector(".catalog-product-details__discount-tag")
            ?.innerText.trim() || null;

          const link = anchor?.getAttribute("href") || null;

          return {
            titulo,
            marca,
            precio,
            precioInternet: precio,
            precioOriginal,
            descuento,
            tienda: "Ripley",
            link: link
              ? `https://simple.ripley.cl${link}`
              : null,
          };
        });
      },
      limit
    );

    console.log(`✅ Encontrados ${data.length} productos en Ripley`);
    return data;

  } catch (error) {
    console.error("❌ Error en scrapeRipley:", error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
