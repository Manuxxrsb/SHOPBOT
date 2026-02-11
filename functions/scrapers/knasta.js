import { getBrowser } from "../browser.js";

const buildSearchUrl = (nombre_producto) =>
  `https://knasta.cl/results?q=${encodeURIComponent(nombre_producto)}`;

export async function scrapeKnasta(nombre_producto, limit = 4) {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );

    console.log(`🔍 Buscando "${nombre_producto}" en Knasta...`);

    await page.goto(buildSearchUrl(nombre_producto), {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await new Promise((r) => setTimeout(r, 3000));

    const selector = "article.new-product-box_productBox__CSUHu";

    await page.waitForSelector(selector, { timeout: 20000 });

    const data = await page.$$eval(
      selector,
      (articles, limit) => {
        return articles.slice(0, limit).map((article) => {
          const titleEl = article.querySelector(
            "h3.product-box-title_productTitle___pv5Q a"
          );

          const link = titleEl?.getAttribute("href");

          return {
            titulo: titleEl?.textContent.trim() || null,
            marca: null,
            precio:
              article.querySelector(".product-box-price_currentPrice__AAih6")
                ?.textContent.trim() || null,
            precioInternet:
              article.querySelector(".product-box-price_internetPrice__4Tm0q")
                ?.textContent.trim() || null,
            precioOriginal:
              article.querySelector(".product-box-price_originalPrice__gi5o_")
                ?.textContent.trim() || null,
            descuento:
              article.querySelector(".percent-badge_percentText__sDogJ")
                ?.textContent.replace(/de descuento\./g, "")
                .trim() || null,
            tienda:
              article.querySelector(
                ".product-box-retail_storeName__8FbcP"
              )?.textContent.trim() || null,
            link: link ? `https://knasta.cl${link}` : null,
          };
        });
      },
      limit
    );

    await page.close(); // 🔥 cerramos solo pestaña

    console.log(`✅ Knasta encontró ${data.length} productos`);

    return data;

  } catch (error) {
    console.error("❌ Error Knasta:", error.message);
    return [];
  }
}
