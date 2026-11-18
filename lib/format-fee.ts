export function formatFeeFromPaise(paise: number | null | undefined): string | null {
  const amount = Number(paise ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}
