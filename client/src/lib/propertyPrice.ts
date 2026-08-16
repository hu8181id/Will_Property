export function formatPriceShort(value: number): string {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) return "Rp0";

  const format = (amount: number) => new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount);

  if (price >= 1_000_000_000) return `Rp${format(price / 1_000_000_000)} M`;
  if (price >= 1_000_000) return `Rp${format(price / 1_000_000)} jt`;
  if (price >= 1_000) return `Rp${format(price / 1_000)} rb`;
  return `Rp${format(price)}`;
}
