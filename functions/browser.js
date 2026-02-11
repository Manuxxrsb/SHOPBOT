import puppeteer from "puppeteer";

let browser = null;

export async function getBrowser() {
  if (!browser) {
    console.log("🚀 Lanzando browser optimizado para Render...");

    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-default-apps",
        "--disable-sync",
        "--disable-translate",
        "--metrics-recording-only",
        "--mute-audio",
        "--no-first-run",
      ],
    });

    browser.on("disconnected", () => {
      console.log("⚠️ Browser se cerró inesperadamente");
      browser = null;
    });
  }

  return browser;
}
