import { chromium } from "playwright";

export async function generatePdf(html, outputPath = null) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 794, height: 1123 }
    });

    await page.setContent(html, { waitUntil: "load" });
    await page.emulateMedia({ media: "print" });

    return await page.pdf({
      path: outputPath || undefined,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "10mm",
        right: "8mm",
        bottom: "12mm",
        left: "8mm"
      }
    });
  } finally {
    await browser.close();
  }
}
