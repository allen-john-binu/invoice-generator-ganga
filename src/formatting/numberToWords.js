const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function twoDigits(n) {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${TENS[tens]}${ones ? ` ${ONES[ones]}` : ""}`;
}

function threeDigits(n) {
  if (n < 100) return twoDigits(n);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return `${ONES[hundreds]} Hundred${rest ? ` ${twoDigits(rest)}` : ""}`;
}

export function indianNumberToWords(number) {
  const n = Math.floor(Number(number));
  if (!Number.isFinite(n) || n < 0) throw new Error("Amount must be a non-negative number.");
  if (n === 0) return "Zero";

  const parts = [];

  const crore = Math.floor(n / 10_000_000);
  let remainder = n % 10_000_000;

  const lakh = Math.floor(remainder / 100_000);
  remainder %= 100_000;

  const thousand = Math.floor(remainder / 1_000);
  remainder %= 1_000;

  const last = remainder;

  if (crore) parts.push(`${indianNumberToWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (last) parts.push(threeDigits(last));

  return parts.join(" ");
}

export function amountInWords(amount) {
  const numeric = Number(amount);
  const whole = Math.floor(numeric);
  const paise = Math.round((numeric - whole) * 100);

  let result = `Rupees ${indianNumberToWords(whole)}`;

  if (paise > 0) {
    result += ` and ${indianNumberToWords(paise)} Paise`;
  }

  return `${result} only`;
}
