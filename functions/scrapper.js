import puppeteer from "puppeteer";

const buildSearchUrl = (nombre_producto) =>
  `https://knasta.cl/results?q=${encodeURIComponent(nombre_producto)}`;

export async function scrapeKnasta(nombre_producto, limit = 4, options = {}) {
  let browser = null;

  try {
    console.log(`🔍 Buscando: "${nombre_producto}" en Knasta...`);

    const launchOptions = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--single-process",
      ],
    };

    // Si se definió la ruta de chrome en entorno (p.ej. en Render), úsala
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      console.log("Usando ejecutable de Chrome desde:", launchOptions.executablePath);
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36"
    );

    const url = buildSearchUrl(nombre_producto);
    console.log(`📡 Navegando a: ${url}`);

    // Aumentamos un poco el tiempo de espera por si la conexión es lenta
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    const selector = "article.new-product-box_productBox__CSUHu";
    
    // Esperar que aparezcan los productos
    const productsFound = await page
      .waitForSelector(selector, { timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    if (!productsFound) {
      console.log("❌ No se encontraron productos en Knasta");
      return [];
    }

    // Extraer datos
    const data = await page.$$eval(
      selector,
      (articles, limit) => {
        return articles.slice(0, limit).map((article) => {
          const titleEl = article.querySelector("h3.product-box-title_productTitle___pv5Q a");
          const link = titleEl?.getAttribute("href");

          return {
            titulo: titleEl?.textContent.trim() || null,
            marca: null,
            precio: article.querySelector(".product-box-price_currentPrice__AAih6")?.textContent.trim() || null,
            precioInternet: article.querySelector(".product-box-price_internetPrice__4Tm0q")?.textContent.trim() || null,
            precioOriginal: article.querySelector(".product-box-price_originalPrice__gi5o_")?.textContent.trim() || null,
            descuento: article.querySelector(".percent-badge_percentText__sDogJ")?.textContent.replace(/de descuento\./g, "").trim() || null,
            tienda: article.querySelector(".product-box-retail_storeName__8FbcP")?.textContent.trim() || null,
            link: link ? `https://knasta.cl${link}` : null,
          };
        });
      },
      limit
    );

    console.log(`✅ Encontrados ${data.length} productos en Knasta`);
    return data;

  } catch (error) {
    console.error("❌ Error en scrapeKnasta:", error.message);
    return []; // Devolvemos array vacío en lugar de romper el flujo
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}