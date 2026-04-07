export const formatPrice = (value: number | string) => {
  const num = Number(value);

  if (!Number.isFinite(num)) return "0";

  // remove trailing zeros
  return Number(num.toFixed(2)).toString();
};
