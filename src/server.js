import fs from "node:fs/promises";
import path from "node:path";
import express from "express";
import { calculateInvoice } from "./calculations/invoiceCalculations.js";
import { renderInvoice } from "./invoice/renderInvoice.js";
import { generatePdf } from "./pdf/generatePdf.js";
import basicAuth from "express-basic-auth";

const invoicesRoot = path.resolve("data/invoices");
const receiversFile = path.resolve("data/receivers.json");

function fileTimestamp() {
  const now = new Date();

  const pad = (value) =>
    String(value).padStart(2, "0");

  return (
    [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate())
    ].join("-") +
    "-" +
    [
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds())
    ].join("")
  );
}

async function saveInvoice(invoice) {
  const receiverId = invoice.receiverId || "others";

  const receiverDirectory = path.join(
    invoicesRoot,
    receiverId
  );

  await fs.mkdir(receiverDirectory, {
    recursive: true
  });

  const fileName =
    `invoice-${invoice.invoiceNo}-${fileTimestamp()}.json`;

  const filePath = path.join(
    receiverDirectory,
    fileName
  );

  await fs.writeFile(
    filePath,
    JSON.stringify(invoice, null, 2),
    "utf8"
  );

  return {
    fileName,
    filePath
  };
}

async function loadReceivers() {
  const file = await fs.readFile(
    receiversFile,
    "utf8"
  );

  return JSON.parse(file);
}

const app = express();

// Enable this again when you want password protection:
//
// app.use(
//   basicAuth({
//     users: {
//       invoice: process.env.INVOICE_PASSWORD
//     },
//     challenge: true,
//     realm: "Ganga Travels Invoice Generator"
//   })
// );

const port = process.env.PORT || 3000;

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(express.static("public"));

function parseInvoiceDate(value) {
  if (!value) {
    return 0;
  }

  const [day, month, year] = value.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).getTime();
}

/*
|--------------------------------------------------------------------------
| Receivers
|--------------------------------------------------------------------------
*/

app.get("/api/receivers", async (req, res) => {
  try {
    const data = await loadReceivers();

    res.json(data.receivers);
  } catch (error) {
    console.error(
      "Failed to load receivers:",
      error
    );

    res.status(500).json({
      error: "Failed to load receivers"
    });
  }
});

/*
|--------------------------------------------------------------------------
| Invoice list for receiver
|--------------------------------------------------------------------------
*/

app.get(
  "/api/invoices/:receiverId",
  async (req, res) => {
    try {
      const receiverId =
        req.params.receiverId;

      const receiverDirectory =
        path.join(
          invoicesRoot,
          receiverId
        );

      let files;

      try {
        files = await fs.readdir(
          receiverDirectory
        );
      } catch (error) {
        if (error.code === "ENOENT") {
          return res.json([]);
        }

        throw error;
      }

      const invoices = [];

      for (const fileName of files) {
        if (!fileName.endsWith(".json")) {
          continue;
        }

        const filePath =
          path.join(
            receiverDirectory,
            fileName
          );

        const invoice =
          JSON.parse(
            await fs.readFile(
              filePath,
              "utf8"
            )
          );

        invoices.push({
          invoiceNo: invoice.invoiceNo,
          date: invoice.date,
          fileName
        });
      }

      invoices.sort((a, b) => {
        return (
          parseInvoiceDate(b.date) -
          parseInvoiceDate(a.date)
        );
      });

      res.json(invoices);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to load invoices"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get a single saved invoice
|--------------------------------------------------------------------------
*/

app.get(
  "/api/invoices/:receiverId/:fileName",
  async (req, res) => {
    try {
      const {
        receiverId,
        fileName
      } = req.params;

      const filePath =
        path.join(
          invoicesRoot,
          receiverId,
          fileName
        );

      const invoice =
        JSON.parse(
          await fs.readFile(
            filePath,
            "utf8"
          )
        );

      res.json(invoice);
    } catch (error) {
      console.error(error);

      if (error.code === "ENOENT") {
        return res.status(404).json({
          error: "Invoice not found"
        });
      }

      res.status(500).json({
        error: "Failed to load invoice"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Generate PDF from saved invoice
|--------------------------------------------------------------------------
|
| IMPORTANT:
| We reuse the same PDF generation pipeline as
| the normal "Generate PDF" button:
|
| invoice -> renderInvoice() -> HTML -> generatePdf()
|
*/

app.get(
  "/api/invoices/:receiverId/:fileName/pdf",
  async (req, res) => {
    try {
      const {
        receiverId,
        fileName
      } = req.params;

      const filePath =
        path.join(
          invoicesRoot,
          receiverId,
          fileName
        );

      const invoice =
        JSON.parse(
          await fs.readFile(
            filePath,
            "utf8"
          )
        );

      const html =
        renderInvoice(invoice);

      const pdf =
        await generatePdf(html);

      const safeInvoiceNo =
        String(
          invoice.invoiceNo || "invoice"
        ).replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );

      res.set({
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          `inline; filename="invoice-${safeInvoiceNo}.pdf"`
      });

      res.send(pdf);
    } catch (error) {
      console.error(error);

      if (error.code === "ENOENT") {
        return res.status(404).json({
          error: "Invoice not found"
        });
      }

      res.status(500).json({
        error:
          "Failed to generate invoice PDF"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Generate a new invoice
|--------------------------------------------------------------------------
*/

app.post(
  "/api/invoice/pdf",
  async (req, res) => {
    try {
      const calculated =
        calculateInvoice(req.body);

      await saveInvoice(calculated);

      const html =
        renderInvoice(calculated);

      const pdf =
        await generatePdf(html);

      const safeInvoiceNo =
        String(
          calculated.invoiceNo ||
            "invoice"
        ).replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );

      res.set({
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          `attachment; filename="invoice-${safeInvoiceNo}.pdf"`
      });

      res.send(pdf);
    } catch (error) {
      console.error(error);

      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate invoice."
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

app.listen(port, () => {
  console.log(
    `Invoice generator running at http://localhost:${port}`
  );
});
/*
1. no back button in generate pdf

2. after generation give a page saying pdf downloaded and back button to go to home

3. duplicate handling

4. 
*/