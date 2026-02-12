import puppeteer from "puppeteer";

let browser;

export async function initBrowser() {
  if (!browser) {
    console.log("🚀 Iniciando browser global...");

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    browser.on("disconnected", () => {
      console.log("⚠️ Browser se cerró inesperadamente");
      browser = null;
    });
  }

  return browser;
}

export function getBrowser() {
  if (!browser) {
    throw new Error("Browser no inicializado. Llama initBrowser() primero.");
  }
  return browser;
}

export async function closeBrowser() {
  if (browser) {
    console.log("🧹 Cerrando browser...");
    await browser.close();
    browser = null;
  }
}
