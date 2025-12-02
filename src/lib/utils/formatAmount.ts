export const formatAmount = (value: number): string => {
  if (isNaN(value)) return "0.00";

  const decimal = value - Math.floor(value);

  let finalValue;

  if (decimal < 0.5) {
    finalValue = Math.floor(value); // e.g., 656.18 → 656
  } else {
    finalValue = Math.ceil(value); // e.g., 656.55 → 657
  }

  return finalValue.toFixed(2); // return "656.00"
};
