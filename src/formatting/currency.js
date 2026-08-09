export function formatRs(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) throw new Error(`Invalid amount: ${value}`);

  const sign = amount < 0 ? "-" : "";
  const [whole, decimal] = Math.abs(amount).toFixed(2).split(".");
  return `Rs. ${sign}${whole}.${decimal}`;
}
