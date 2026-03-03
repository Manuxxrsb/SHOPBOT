import { getBrowser } from "../browser.js";

const buildEasyUrl = (producto) =>
  `https://www.easy.cl/search/${encodeURIComponent(producto)}`;

export async function scrapeEasy(nombre_producto, limit = 3) {
  let page;

  try {
    const browser = getBrowser();
    page = await browser.newPage();

    console.log(`🔍 Buscando "${nombre_producto}" en Easy...`);

    await page.goto(buildEasyUrl(nombre_producto), {
      waitUntil: "networkidle2",
      timeout: 40000,
    });

    // Esperamos las cards reales
    await page.waitForSelector("[data-cnstrc-item-id]", {
      timeout: 30000,
    });

    const data = await page.$$eval(
      "[data-cnstrc-item-id]",
      (items, limit) => {
        const results = [];

        for (const item of items) {
          if (results.length >= limit) break;

          const titulo = item.getAttribute("data-cnstrc-item-name") || null;

          const precioBase =
            item.getAttribute("data-cnstrc-item-price") || null;

          const anchor = item.querySelector("a[href]");
          const link = anchor
            ? `https://www.easy.cl${anchor.getAttribute("href")}`
            : null;

          // 🔥 Precio visible actual
          const precioActualEl = item.querySelector(".sc-94b513d4-42");

          const precio =
            precioActualEl?.innerText.trim() ||
            (precioBase
              ? `$ ${Number(precioBase).toLocaleString("es-CL")}`
              : null);

          if (!precio) continue;

          // 🔥 Precio normal (si existe)
          const normalEl = item.querySelector(".sc-94b513d4-50 span");

          const precioAnterior = normalEl
            ? normalEl.innerText.replace("Normal:", "").trim()
            : null;

          // 🔥 Descuento
          const descuentoEl = item.querySelector(
            ".sc-94b513d4-53, .sc-94b513d4-41 span",
          );

          const descuento = descuentoEl ? descuentoEl.innerText.trim() : null;

          results.push({
            titulo,
            precio,
            precioAnterior,
            descuento,
            tienda: "Easy",
            link,
          });
        }

        return results;
      },
      limit,
    );

    console.log(`✅ Easy encontró ${data.length} productos`);
    return data;
  } catch (error) {
    console.error("❌ Error Easy:", error.message);

    if (page) {
      await page.screenshot({
        path: `easy_error_${Date.now()}.png`,
        fullPage: true,
      });
      console.log("📸 Screenshot guardado por error");
    }

    return [];
  } finally {
    if (page) await page.close();
  }
}
