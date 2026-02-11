import puppeteer from "puppeteer";

let browserInstance = null;

export async function getBrowser() {
  if (!browserInstance) {
    console.log("🚀 Lanzando browser...");

    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
  }

  return browserInstance;
}

export async function closeBrowser() {
  if (browserInstance) {
    console.log("🧹 Cerrando browser...");

    const pages = await browserInstance.pages();

    for (const page of pages) {
      await page.close().catch(() => {});
    }

    await browserInstance.close();
    browserInstance = null;
  }
}
