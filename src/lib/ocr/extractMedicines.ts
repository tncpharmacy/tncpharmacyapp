export function extractMedicines(ocrText: string): string[] {
  if (!ocrText) return [];

  const lines = ocrText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const skipWords = [
    "dose",
    "frequency",
    "duration",
    "remarks",
    "diagnosis",
    "prescription",
    "investigative",
    "readings",
    "followup",
    "patient",
    "bp",
    "meal",
    "after",
    "before",
    "continue",
    "mg/ml",
    "ml",
    "vial",
  ];

  // MASTER REGEX — works for almost all prescriptions
  const medLineRegex =
    /^([A-Z0-9\-\s]+)\s+([0-9\.]+(?:MG|MCG|IU|GM)?)\s+(TABLET|CAPSULE|SYRUP|INJECTION|DT|SUSPENSION|SACHET)/i;

  const found = new Set<string>();

  for (let line of lines) {
    const low = line.toLowerCase();
    if (skipWords.some((w) => low.includes(w))) continue;

    // Clean line
    line = line.replace(/^[0-9]+\s*/, "").replace(/\s+/g, " ");

    // Try MASTER regex
    const m = line.match(medLineRegex);
    if (m) {
      const name = `${m[1].trim()} ${m[2]} ${m[3]}`.toUpperCase();
      found.add(name);
      continue;
    }

    // Backup simple regex (handles items like “LOOZ SYRUP”)
    const fallback = line.match(
      /^([A-Z0-9\- ]+)\s+(TABLET|CAPSULE|SYRUP|INJECTION)/i
    );
    if (fallback) {
      const name = `${fallback[1].trim()} ${fallback[2]}`.toUpperCase();
      found.add(name);
    }
  }

  return Array.from(found);
}

export function cleanOCRText(raw: string): string {
  if (!raw) return "";

  // Normalize lines
  let text = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");

  // BLOCKS to completely remove
  const removeBlocks = [
    "Director",
    "Consultant",
    "Dept",
    "Nephrology",
    "Kidney Transplant",
    "Mob No",
    "Work email",
    "NAME:",
    "UHID",
    "AGE",
    "GENDER",
    "MOBILE",
    "Alternative Phone",
    "Phone Country Code",
    "VITALS",
    "SYMPTOMS",
    "DIAGNOSIS",
    "Patient Medical History",
    "PRESCRIBED LAB TESTS",
    "INVESTIGATIVE READINGS",
    "NOTES",
    "ADVICE",
    "FOLLOWUP",
  ];

  for (const keyword of removeBlocks) {
    const regex = new RegExp(`${keyword}[\\s\\S]*?(?=\\n[A-Z]|$)`, "gi");
    text = text.replace(regex, "");
  }

  // Remove individual unwanted lines
  const removeLines = [
    "dose",
    "frequency",
    "duration",
    "remarks",
    "after meal",
    "before meal",
    "after breakfast",
    "before breakfast",
    "at bedtime",
    "sos",
    "apply on",
  ];

  text = text
    .split("\n")
    .filter((line) => {
      const low = line.toLowerCase();
      return !removeLines.some((k) => low.includes(k));
    })
    .join("\n");

  return text.trim();
}
