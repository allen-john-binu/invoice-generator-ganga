function toPaise(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`Rate must be a non-negative number. Received: ${value}`);
  }
  return Math.round(number * 100);
}

function fromPaise(paise) {
  return paise / 100;
}

function taxFromPaise(taxablePaise, ratePercent) {
  // Work in paise and round once to avoid floating-point money errors.
  return Math.round(taxablePaise * ratePercent / 100);
}

export function calculateInvoice(invoice) {
  if (!invoice || !Array.isArray(invoice.services) || invoice.services.length === 0) {
    throw new Error("At least one service is required.");
  }

  const services = invoice.services.map((service, index) => {
    const description = String(service.description ?? "").trim();
    const quantity = String(service.quantity ?? "").trim();
    const ratePaise = toPaise(service.rate);

    if (!description) throw new Error(`Service ${index + 1}: description is required.`);
    if (!quantity) throw new Error(`Service ${index + 1}: quantity is required.`);

    return {
      description,
      quantity,
      rate: fromPaise(ratePaise),
      ratePaise
    };
  });

  const totalPaise = services.reduce((sum, service) => sum + service.ratePaise, 0);
  const taxablePaise = totalPaise;
  const cgstPaise = taxFromPaise(taxablePaise, 2.5);
  const sgstPaise = taxFromPaise(taxablePaise, 2.5);
  const grandTotalPaise = taxablePaise + cgstPaise + sgstPaise;

  return {
    ...invoice,
    services,
    totals: {
      totalAmount: fromPaise(totalPaise),
      taxableAmount: fromPaise(taxablePaise),
      cgst: fromPaise(cgstPaise),
      sgst: fromPaise(sgstPaise),
      grandTotal: fromPaise(grandTotalPaise)
    }
  };
}
