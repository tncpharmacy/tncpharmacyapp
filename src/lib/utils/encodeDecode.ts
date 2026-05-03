// encodeId.ts
export const encodeId = (id: number) => {
  return btoa(id.toString())
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const decodeId = (encoded: string | string[] | undefined) => {
  if (!encoded) return null;

  try {
    const str = Array.isArray(encoded) ? encoded[0] : encoded;

    const padded = str
      .padEnd(str.length + ((4 - (str.length % 4)) % 4), "=")
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = atob(padded);

    const num = parseInt(decoded);

    if (isNaN(num)) return null; // 🔥 extra safety

    return num;
  } catch (error) {
    return null; // 🔥 MOST IMPORTANT
  }
};
