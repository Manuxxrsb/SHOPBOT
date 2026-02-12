import { getBrowser } from "../browser.js";

const buildSearchUrl = (nombre_producto) =>
  `https://knasta.cl/results?q=${encodeURIComponent(nombre_producto)}`;

export async function scrapeKnasta(nombre_producto, limit = 3) {
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

    console.log(`🔍 Buscando "${nombre_producto}" en Knasta...`);

    await page.goto(buildSearchUrl(nombre_producto), {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForSelector("article.new-product-box_productBox__CSUHu", {
      timeout: 15000,
    });

    const data = await page.$$eval(
      "article.new-product-box_productBox__CSUHu",
      (articles, limit) =>
        articles.slice(0, limit).map((article) => {
          const titleEl = article.querySelector(
            "h3.product-box-title_productTitle___pv5Q a",
          );

          return {
            titulo: titleEl?.textContent.trim() || null,
            precio:
              article
                .querySelector(".product-box-price_currentPrice__AAih6")
                ?.textContent.trim() || null,
            tienda: "Knasta",
            link: titleEl
              ? `https://knasta.cl${titleEl.getAttribute("href")}`
              : null,
          };
        }),
      limit,
    );

    console.log(`✅ Knasta encontró ${data.length} productos`);
    return data;
  } catch (error) {
    console.error("❌ Error Knasta:", error.message);
    return [];
  } finally {
    if (page) await page.close();
  }
}
