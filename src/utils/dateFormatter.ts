export function formatDateTime(dateString?: string) {
  if (!dateString) return { date: "-", time: "-" };

  const dateObj = new Date(dateString);

  const date = dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = dateObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // ✅ AM/PM show karega
  });

  return { date, time };
}

export function formatDateOnly(dateString?: string) {
  if (!dateString) return "-";

  const dateObj = new Date(dateString);

  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
