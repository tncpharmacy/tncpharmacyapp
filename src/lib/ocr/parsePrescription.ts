// src/lib/ocr/parsePrescription.ts
export type ParsedRow = {
  name: string;
  dose?: string;
  frequency?: string;
  duration?: string;
  remarks?: string;
  raw?: string;
};

function normalizeText(ocr: string) {
  return (
    ocr
      // join broken numeric decimals: "0.\n5" -> "0.5"
      .replace(/(\d)\s*\.\s*\n\s*(\d)/g, "$1.$2")
      // join broken 'mg\nTABLET' -> 'mg TABLET'
      .replace(
        /(mg|mcg|IU\/ml|IU)\s*\n\s*(tablet|capsule|injection|syrup|solution)/gi,
        "$1 $2"
      )
      // join lines where a line is just 'TABLET' or 'CAPSULE' etc.
      .replace(/\n{2,}/g, "\n")
      .trim()
  );
}

const headerTokens = ["medications", "medication", "drug", "medicine"];
const tableEndTokens = [
  "investigative",
  "investigation",
  "notes",
  "followup",
  "investigative readings",
  "diagnosis",
];

function looksLikeFreq(line: string) {
  return (
    /\b\d-\d-\d\b/i.test(line) ||
    /\b(sos|once|twice|daily|bd|od|hs)\b/i.test(line)
  );
}

export function parsePrescription(ocrText: string): ParsedRow[] {
  const normalized = normalizeText(ocrText);
  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Find table start: a line or small window containing header tokens Dose and Frequency
  let startIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("dose") && l.includes("frequency")) {
      startIndex = i + 1;
      break;
    }
    // sometimes header tokens appear in multiple lines: 'Medications' on one line, 'Dose' next
    if (i + 2 < lines.length) {
      const a = lines[i].toLowerCase();
      const b = lines[i + 1].toLowerCase();
      if (
        (headerTokens.some((h) => a.includes(h)) ||
          headerTokens.some((h) => b.includes(h))) &&
        (b.includes("dose") ||
          (i + 2 < lines.length && lines[i + 2].toLowerCase().includes("dose")))
      ) {
        startIndex = i + 2;
        break;
      }
    }
  }

  // fallback: start from top
  if (startIndex === -1) startIndex = 0;

  // Collect until a table-end token or until e.g. "INVESTIGATIVE READINGS"
  const parsed: ParsedRow[] = [];
  let i = startIndex;
  let current: ParsedRow | null = null;

  for (; i < lines.length; i++) {
    const line = lines[i];
    const low = line.toLowerCase();

    if (tableEndTokens.some((t) => low.includes(t))) break;

    // If line starts with numbering => new med
    if (/^\d+\s+/.test(line) || /^[A-Z0-9\-]{2,}\s+[A-Z0-9\-]/i.test(line)) {
      // push previous
      if (current) parsed.push(current);
      // create new
      const name = line.replace(/^\d+\s*/, "").trim();
      current = { name, raw: line };
      continue;
    }

    // If we haven't started collecting named rows (no numbering), heuristics:
    // Some PDFs have direct rows with name only then dose/freq in next lines.
    if (!current) {
      // if line contains medicine keywords or mg, tablet, cap etc -> start a new
      if (
        /(tablet|tab|capsule|cap|inj|injection|syrup|mg|mcg|iu|solution|drop)/i.test(
          line
        ) ||
        /[A-Za-z\-]{3,}\s+\d+/i.test(line)
      ) {
        current = { name: line, raw: line };
        continue;
      } else {
        continue;
      }
    }

    // Now fill fields for current
    if (
      !current.dose &&
      /\b\d+(\.\d+)?\s*(mg|mcg|tablet|tab|capsule|caps|IU|iu|ml)\b/i.test(line)
    ) {
      current.dose = line;
      continue;
    }

    if (!current.frequency && looksLikeFreq(line)) {
      current.frequency = line;
      continue;
    }

    if (
      !current.duration &&
      /\b(to continue|week|weeks|day|days|month|months)\b/i.test(line)
    ) {
      current.duration = line;
      continue;
    }

    // If line has 'remarks' or long text, attach to remarks
    if (!current.remarks && /remarks|instruction|take|use|dose/i.test(line)) {
      current.remarks = line;
      continue;
    }

    // If line looks like a medicine name continuation (e.g., second line of name)
    if (
      !current.dose &&
      /[A-Za-z0-9\-]/.test(line) &&
      !looksLikeFreq(line) &&
      !/\b(to continue|week|tablet|capsule|mg|mcg)\b/i.test(line)
    ) {
      current.name = (current.name + " " + line).trim();
      continue;
    }
  }

  if (current) parsed.push(current);

  // final cleanup: trim and dedupe
  const cleaned = parsed.map((p) => ({
    name: (p.name || "").replace(/\s{2,}/g, " ").trim(),
    dose: p.dose?.trim() || "",
    frequency: p.frequency?.trim() || "",
    duration: p.duration?.trim() || "",
    remarks: p.remarks?.trim() || "",
    raw: p.raw,
  }));

  // remove obvious junk rows
  return cleaned.filter((r) => r.name && r.name.length > 2);
}
