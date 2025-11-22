export function extractTableMedicines(ocrText: string) {
  if (!ocrText) return [];

  const lines = ocrText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Header detection variations (OCR sometimes distorts spelling)
  const headerPatterns = [/medications/i, /medicine/i, /drug/i];

  let startIndex = -1;

  // find where table begins
  for (let i = 0; i < lines.length; i++) {
    if (headerPatterns.some((h) => h.test(lines[i]))) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) return []; // no table found

  const rows = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];

    // stop when empty section hits
    if (!line.trim()) continue;
    if (/remarks|diagnosis|note|instruction/i.test(line)) break;

    // Split columns using space groups or pipes
    const cols = line.split(/\s{2,}|\t|\|/).map((c) => c.trim());

    if (cols.length < 1) continue;

    rows.push({
      medicine: cols[0] || "",
      dose: cols[1] || "",
      frequency: cols[2] || "",
      duration: cols[3] || "",
    });
  }

  return rows;
}

export function extractMedicineSection(ocrText: string): string {
  if (!ocrText) return "";

  const lines = ocrText.split("\n").map((l) => l.trim());

  const keywords = [
    "medication",
    "medicine",
    "medications",
    "rx",
    "prescribed",
    "treatment",
    "tab",
    "tablet",
    "cap",
    "capsule",
    "inj",
    "injection",
    "syrup",
  ];

  let start = -1;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (keywords.some((k) => l.includes(k))) {
      start = i;
      break;
    }
  }

  if (start === -1) return ""; // nothing found

  // Extract until diagnosis/comments block
  const stopWords = ["advice", "remark", "diagnosis", "instruction"];

  const out = [];

  for (let i = start; i < lines.length; i++) {
    const l = lines[i];
    if (stopWords.some((sw) => l.toLowerCase().includes(sw))) break;
    out.push(l);
  }

  return out.join("\n");
}
