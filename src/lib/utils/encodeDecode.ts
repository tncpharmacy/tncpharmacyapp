// encodeId.ts
export const encodeId = (id: number) => {
  return btoa(id.toString())
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const decodeId = (encoded: string | string[] | undefined) => {
  if (!encoded) return null;
  const str = Array.isArray(encoded) ? encoded[0] : encoded;

  // restore padding and normal Base64 chars
  const padded = str
    .padEnd(str.length + ((4 - (str.length % 4)) % 4), "=")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  return parseInt(atob(padded));
};
