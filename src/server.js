import express from "express";
import { calculateInvoice } from "./calculations/invoiceCalculations.js";
import { renderInvoice } from "./invoice/renderInvoice.js";
import { generatePdf } from "./pdf/generatePdf.js";
import fs from "node:fs/promises";
import path from "node:path";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const invoiceDataDir = path.resolve("data/invoices");

function sanitizeFilePart(value) {
  return String(value ?? "invoice")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function saveInvoiceData(invoice) {
  await fs.mkdir(invoiceDataDir, { recursive: true });

  const generatedAt = new Date();

  const timestamp = generatedAt
    .toISOString()
    .replace("T", "_")
    .replace(/:/g, "-")
    .replace(/\.\d{3}Z$/, "");

  const invoiceNo = sanitizeFilePart(invoice.invoiceNo);

  const fileName = `invoice-${invoiceNo}-${timestamp}.json`;
  const filePath = path.join(invoiceDataDir, fileName);

  const data = {
    ...invoice,
    generatedAt: generatedAt.toISOString()
  };

  await fs.writeFile(
    filePath,
    JSON.stringify(data, null, 2),
    "utf8"
  );

  return filePath;
}

app.post("/api/invoice/pdf", async (req, res) => {
  try {
    const calculated = calculateInvoice(req.body);

    await saveInvoiceData(calculated);

    const html = renderInvoice(calculated);
    const pdf = await generatePdf(html);

    const safeInvoiceNo = String(calculated.invoiceNo || "invoice")
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${safeInvoiceNo}.pdf"`
    });

    res.send(pdf);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to generate invoice."
    });
  }
});

app.listen(port, () => {
  console.log(`Invoice generator running at http://localhost:${port}`);
});
