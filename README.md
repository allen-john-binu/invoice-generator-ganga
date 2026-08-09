# Ganga Travels Invoice Generator

A Node.js + Express + Playwright invoice generator based on the supplied Ganga Travels invoice layout.

## Requirements

- Node.js 22+
- npm

## Install

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Current behavior

- One invoice can contain multiple service rows.
- Service descriptions and quantities are text.
- Rate is numeric.
- Total = sum of service rates.
- Taxable amount = total.
- CGST = 2.5% of taxable amount.
- SGST = 2.5% of taxable amount.
- Grand total = taxable + CGST + SGST.
- Amounts display with two decimal places and `Rs.`.
- Amount in words uses Indian numbering terminology (Lakh/Crore).
- Long descriptions wrap.
- Service rows are kept together across pages where Chromium permits.
- The service table header repeats when the table continues onto another page.
- Totals/signatory section appears after the final service row.
- Mode/Terms of Payment and Suppliers Reference are blank/null.
- Company and bottom certification/signatory information are hardcoded from the reference invoice.

## Architecture

```text
Browser form
    ↓
Express POST /api/invoice/pdf
    ↓
Invoice calculation
    ↓
HTML invoice template
    ↓
Playwright / Chromium
    ↓
A4 PDF
```


## Visual tuning pass 1

For the current single-service test:

- Company header content is shifted to the right.
- The receiver/payment/reference block no longer has the large artificial empty height.
- The totals/signatory section is pushed lower on a single-service invoice.
- The operator footer is pushed farther down with a margin.
- Multi-service invoices use smaller bottom spacing so pagination remains content-driven.
# invoice-generator-ganga
