// // src/lib/med/matchMedicines.ts
// import { ParsedRow } from "@/lib/ocr/parsePrescription";
// // This is a placeholder — replace with your DB access layer (Prisma/TypeORM/pg)
// import { db } from "@/lib/db"; // hypothetical

// // Simple normalizer
// function normalize(s: string) {
//   return s
//     .replace(/[^a-z0-9]/gi, " ")
//     .toLowerCase()
//     .replace(/\s+/g, " ")
//     .trim();
// }

// // naive fuzzy: try exact, then partial, then fallback
// export async function matchMedicinesToDB(rows: ParsedRow[]) {
//   // Example: get all medicine names from DB into memory (if small)
//   const medsFromDb: { id: number; name: string }[] = await db.query(
//     "SELECT id, medicine_name FROM medicines"
//   ); // adapt

//   const index = medsFromDb.map((m) => ({ ...m, norm: normalize(m.name) }));

//   function findBest(name: string) {
//     const norm = normalize(name);
//     // exact
//     let candidate = index.find((i) => i.norm === norm);
//     if (candidate) return { id: candidate.id, name: candidate.name, score: 1 };

//     // substring
//     candidate = index.find(
//       (i) => i.norm.includes(norm) || norm.includes(i.norm)
//     );
//     if (candidate)
//       return { id: candidate.id, name: candidate.name, score: 0.9 };

//     // Levenshtein or token overlap (simple token match)
//     const tokens = norm.split(" ");
//     let best: any = null;
//     for (const cand of index) {
//       const candTokens = cand.norm.split(" ");
//       const common = tokens.filter((t) => candTokens.includes(t)).length;
//       const score = common / Math.max(tokens.length, candTokens.length);
//       if (!best || score > best.score) best = { ...cand, score };
//     }
//     if (best && best.score > 0.4)
//       return { id: best.id, name: best.name, score: best.score };

//     return null;
//   }

//   const results = [];
//   for (const r of rows) {
//     const match = findBest(r.name);
//     results.push({
//       parsed: r,
//       match,
//     });
//   }
//   return results;
// }
