export const CURRENCIES = [
  { code: "THB", symbol: "฿", th: "บาท" },
  { code: "USD", symbol: "$", th: "ดอลลาร์สหรัฐ" },
  { code: "EUR", symbol: "€", th: "ยูโร" },
  { code: "JPY", symbol: "¥", th: "เยน" },
  { code: "GBP", symbol: "£", th: "ปอนด์" },
  { code: "CNY", symbol: "¥", th: "หยวน" },
  { code: "KRW", symbol: "₩", th: "วอน" },
  { code: "AUD", symbol: "A$", th: "ดอลลาร์ออสเตรเลีย" },
  { code: "SGD", symbol: "S$", th: "ดอลลาร์สิงคโปร์" },
  { code: "MYR", symbol: "RM", th: "ริงกิต" },
  { code: "VND", symbol: "₫", th: "ดอง" },
  { code: "TWD", symbol: "NT$", th: "ดอลลาร์ไต้หวัน" },
  { code: "HKD", symbol: "HK$", th: "ดอลลาร์ฮ่องกง" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function currencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function formatAmount(amount: number, code: string): string {
  const sym = currencySymbol(code);
  const isJpyLike = code === "JPY" || code === "KRW" || code === "VND";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isJpyLike ? 0 : 0,
    maximumFractionDigits: isJpyLike ? 0 : 2,
  }).format(amount);
  return code === "THB" ? `${sym}${formatted}` : `${sym} ${formatted}`;
}
