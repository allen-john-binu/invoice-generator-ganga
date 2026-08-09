import { COMPANY, TAX } from "../config.js";
import { formatRs } from "../formatting/currency.js";
import { amountInWords } from "../formatting/numberToWords.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nl2br(value) {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

function renderServices(services) {
  return services.map((service, index) => `
    <tr class="service-row">
      <td class="center">${index + 1}</td>
      <td class="description">${nl2br(service.description)}</td>
      <td class="center">${escapeHtml(TAX.hsnSac)}</td>
      <td class="center">${TAX.gstRate}%</td>
      <td class="quantity">${escapeHtml(service.quantity)}</td>
      <td class="amount">${formatRs(service.rate)}</td>
      <td class="amount">${formatRs(service.rate)}</td>
      <td class="amount">${formatRs(service.rate)}</td>
    </tr>
  `).join("");
}

export function renderInvoice(invoice) {
  const { receiver, totals } = invoice;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Invoice ${escapeHtml(invoice.invoiceNo)}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm 8mm 12mm 8mm;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
      font-size: 10px;
    }

    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .invoice {
      width: 100%;
    }

    .company-header {
      text-align: right;
      border-top: 1px solid #111;
      padding-top: 7px;
      padding-bottom: 5px;
      padding-right: 17%;
    }

    .company-name {
      font-family: "Trebuchet MS", Arial, sans-serif;
      font-size: 28px;
      font-weight: 800;
      font-style: italic;
      letter-spacing: -1.2px;
      margin-bottom: 3px;
    }

    .company-details {
      font-size: 9.5px;
      line-height: 1.22;
      font-weight: 600;
    }

    .invoice-title {
      margin: 9px 0 2px;
      text-align: center;
      font-size: 13px;
      font-weight: 700;
      text-decoration: underline;
    }

    .original {
      text-align: right;
      font-size: 9.5px;
      font-weight: 700;
      margin-right: 11%;
      margin-bottom: 4px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    td, th {
      border: 1px solid #111;
      padding: 4px;
      vertical-align: top;
    }

    .meta-table {
      margin-bottom: 0;
    }

    .meta-left { width: 42%; }
    .meta-mid { width: 29%; }
    .meta-right { width: 29%; }

    .receiver {
      min-height: 23mm;
      line-height: 1.3;
    }

    .receiver strong {
      font-size: 10px;
    }

    .meta-cell {
      min-height: 11.5mm;
      line-height: 1.35;
    }

    .label {
      font-weight: 700;
    }

    .invoice-main-table {
  margin-top: 0;
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.invoice-main-table thead {
  display: table-header-group;
}

.invoice-main-table th {
  text-align: center;
  font-size: 8.5px;
  line-height: 1.1;
  vertical-align: middle;
  height: 12mm;
}

.invoice-main-table td {
  font-size: 9px;
  border: 1px solid #111;
  padding: 4px;
  vertical-align: top;
}

/* Column widths */
.invoice-main-table .sl {
  width: 5%;
}

.invoice-main-table .desc {
  width: 31%;
}

.invoice-main-table .hsn {
  width: 8%;
}

.invoice-main-table .gst {
  width: 8%;
}

.invoice-main-table .qty {
  width: 13%;
}

.invoice-main-table .rate {
  width: 11.5%;
}

.invoice-main-table .total {
  width: 11.5%;
}

.invoice-main-table .taxable {
  width: 12%;
}

/* Service rows */
.service-row {
  break-inside: avoid;
  page-break-inside: avoid;
}

.service-row .description {
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.3;
}

.quantity {
  overflow-wrap: anywhere;
  line-height: 1.3;
}

.center {
  text-align: center;
}

.amount {
  text-align: right;
  white-space: nowrap;
}

/*
 * This is the large empty area visible in the original invoice.
 * It is INSIDE the same table.
 */
.invoice-spacer td {
  height: 42mm;
  padding: 0;
}

/*
 * For multiple services, don't waste a huge amount of space.
 */
.invoice.multi-service .invoice-spacer td {
  height: 8mm;
}

/* Bottom certification / PAN / signatory / totals row */
.invoice-bottom-row {
  break-inside: avoid;
  page-break-inside: avoid;
}

.invoice-bottom-row td {
  min-height: 31mm;
  font-size: 8.8px;
  line-height: 1.35;
}

/* Bottom column widths */
.bottom-wrapper {
  padding: 0;
}

.bottom-inner-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  border: 0;
}

.bottom-inner-table td {
  border: 1px solid #111;
  padding: 6px;
  vertical-align: top;
  font-size: 8.8px;
  line-height: 1.35;
  height: 31mm;
}

/*
 * These widths reproduce the original bottom section,
 * independently from the service-table columns.
 */
.bottom-cert {
  width: 25%;
}

.bottom-bank {
  width: 12%;
}

.bottom-pan {
  width: 13%;
}

.bottom-jurisdiction {
  width: 13%;
}

.bottom-signatory {
  width: 15%;
}

.bottom-total-label {
  width: 11%;
}

.bottom-total-value {
  width: 11%;
}

.totals-cell {
  padding: 3px 4px !important;
}

.total-line {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  line-height: 1.45;
  white-space: nowrap;
}

.grand-total {
  font-weight: 700;
}

.totals-cell {
  padding: 3px 4px;
}

.total-line {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  line-height: 1.45;
  white-space: nowrap;
}

.grand-total {
  font-weight: 700;
}

/* Amount in words is part of the same table */
.invoice-words-row td {
  padding: 6px;
  font-size: 9px;
  height: 9mm;
  border: 1px solid #111;
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Footer remains outside the table */
.footer-operator {
  margin-top: 28mm;
  border-top: 1px solid #111;
  text-align: center;
  padding-top: 5px;
  font-size: 11px;
  font-weight: 700;
  break-inside: avoid;
}

.invoice.multi-service .footer-operator {
  margin-top: 12mm;
}

@media print {
  .footer-operator {
    margin-top: 28mm;
  }

  .invoice.multi-service .footer-operator {
    margin-top: 12mm;
  }
}

    .footer-operator {
      margin-top: 28mm;
      border-top: 1px solid #111;
      text-align: center;
      padding-top: 5px;
      font-size: 11px;
      font-weight: 700;
      break-inside: avoid;
    }

    .invoice.multi-service .footer-operator {
      margin-top: 12mm;
    }

    @media print {
      .footer-operator {
        margin-top: 28mm;
      }

      .invoice.multi-service .footer-operator {
        margin-top: 12mm;
      }
    }
  </style>
</head>
<body>
  <main class="invoice ${invoice.services.length > 1 ? "multi-service" : "single-service"}">
    <header class="company-header">
      <div class="company-name">${escapeHtml(COMPANY.name)}</div>
      <div class="company-details">
        ${escapeHtml(COMPANY.address)}<br>
        EMAIL: ${escapeHtml(COMPANY.email)}<br>
        PHONE: ${escapeHtml(COMPANY.phone)}<br>
        MOBILE: ${escapeHtml(COMPANY.mobile)}<br>
        GSTIN: ${escapeHtml(COMPANY.gstin)}
      </div>
    </header>

    <div class="invoice-title">INVOICE</div>
    <div class="original">(ORGINAL FOR RECIPIENT)</div>

    <table class="meta-table">
      <tr>
        <td class="meta-left receiver">
          <strong>DETAILS OF RECEIVER/ BILLED TO</strong><br>
          <span class="label">NAME:</span> ${escapeHtml(receiver.name)}<br>
          <span class="label">ADDRESS:</span><br>
          ${nl2br(receiver.address)}<br>
          <span class="label">GSTIN:</span> ${escapeHtml(receiver.gstin)}<br>
          <span class="label">STATE:</span> ${escapeHtml(receiver.state)}
          <span class="label" style="margin-left:20px;">CODE:</span> ${escapeHtml(receiver.stateCode)}
        </td>

        <td class="meta-mid">
          <div class="meta-cell">
            <span class="label">INVOICE NO :</span> ${escapeHtml(invoice.invoiceNo)}
          </div>
          <div class="meta-cell">
            <span class="label">MODE/TERMS OF PAYMENT:</span>
            ${invoice.modeOfPayment ? escapeHtml(invoice.modeOfPayment) : ""}
          </div>
        </td>

        <td class="meta-right">
          <div class="meta-cell">
            <span class="label">DATE -</span> ${escapeHtml(invoice.date)}
          </div>
          <div class="meta-cell">
            <span class="label">SUPPLIERS REFERENCE:</span>
            ${invoice.suppliersReference ? escapeHtml(invoice.suppliersReference) : ""}
          </div>
        </td>
      </tr>
    </table>

    <table class="invoice-main-table">
  <colgroup>
    <col class="sl">
    <col class="desc">
    <col class="hsn">
    <col class="gst">
    <col class="qty">
    <col class="rate">
    <col class="total">
    <col class="taxable">
  </colgroup>

  <thead>
    <tr>
      <th>SL<br>NO</th>
      <th>DESCRIPTION OF SERVICE</th>
      <th>HSN<br>/SAC</th>
      <th>GST<br>RATE</th>
      <th>QUANTITY</th>
      <th>RATE</th>
      <th>TOTAL<br>AMOUNT</th>
      <th>TAXABLE<br>AMOUNT</th>
    </tr>
  </thead>

  <tbody>

    <!-- SERVICE ROWS -->
    ${renderServices(invoice.services)}

    <!-- LARGE EMPTY AREA INSIDE THE SAME TABLE -->
    <tr class="invoice-spacer">
      <td colspan="8"></td>
    </tr>

    <!-- CERTIFICATION / SIGNATORY / TOTALS -->
<tr class="invoice-bottom-row">
  <td colspan="8" class="bottom-wrapper">

    <table class="bottom-inner-table">
      <colgroup>
        <col class="bottom-cert">
        <col class="bottom-bank">
        <col class="bottom-pan">
        <col class="bottom-jurisdiction">
        <col class="bottom-signatory">
        <col class="bottom-total-label">
        <col class="bottom-total-value">
      </colgroup>

      <tr>

        <td>
          Certified that particulars given are true and correct.
        </td>

        <td>
          Companies Bank Details.
        </td>

        <td>
          Pan number:<br><br>
          <strong>${escapeHtml(COMPANY.pan)}</strong>
        </td>

        <td>
          Subject to<br>
          ${escapeHtml(COMPANY.jurisdiction)}<br>
          Jurisdiction only.
        </td>

        <td>
          Name of signatory<br><br>
          <strong>${escapeHtml(COMPANY.signatory)}</strong>
        </td>

        <td class="totals-cell">
          <div class="total-line">
            <strong>TOTAL:</strong>
          </div>

          <div class="total-line">
            CGST:2.5%
          </div>

          <div class="total-line">
            SGST:2.5%
          </div>

          <div class="total-line">
            IGST:
          </div>

          <div class="total-line grand-total">
            GRAND<br>TOTAL:
          </div>
        </td>

        <td class="totals-cell">
          <div class="total-line">
            ${formatRs(totals.totalAmount)}
          </div>

          <div class="total-line">
            ${formatRs(totals.cgst)}
          </div>

          <div class="total-line">
            ${formatRs(totals.sgst)}
          </div>

          <div class="total-line">
            &nbsp;
          </div>

          <div class="total-line grand-total">
            ${formatRs(totals.grandTotal)}
          </div>
        </td>

      </tr>
    </table>

  </td>
</tr>

    <!-- AMOUNT IN WORDS - SAME TABLE -->
    <tr class="invoice-words-row">
      <td colspan="8">
        <strong>Net Amount Chargeable (In Words):</strong>
        ${escapeHtml(amountInWords(totals.grandTotal))}
      </td>
    </tr>

  </tbody>
</table>

    <footer class="footer-operator">
      ${escapeHtml(COMPANY.operatorLine)}
    </footer>
  </main>
</body>
</html>`;
}
