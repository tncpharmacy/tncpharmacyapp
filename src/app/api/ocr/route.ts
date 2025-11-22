// import { NextResponse } from "next/server";
// import vision from "@google-cloud/vision";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const form = await req.formData();
//     const file = form.get("file") as File;

//     if (!file) {
//       return NextResponse.json({ error: "File not provided" }, { status: 400 });
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());

//     // -----------------------------
//     // FIXED GOOGLE AUTH
//     // -----------------------------
//     const client = new vision.ImageAnnotatorClient({
//       credentials: {
//         client_email: process.env.GOOGLE_CLIENT_EMAIL!,
//         private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
//       },
//       projectId: process.env.GOOGLE_PROJECT_ID!,
//     });

//     let text = "";

//     if (file.type === "application/pdf") {
//       const [result] = await client.documentTextDetection({
//         image: { content: buffer },
//       });

//       text = result.fullTextAnnotation?.text || "";
//     } else {
//       const [result] = await client.textDetection({
//         image: { content: buffer },
//       });

//       text = result.textAnnotations?.[0]?.description || "";
//     }

//     return NextResponse.json({ text });
//   } catch (err: any) {
//     console.error("OCR ERROR:", err);
//     return NextResponse.json(
//       { error: err.message || "OCR failed" },
//       { status: 500 }
//     );
//   }
// }
