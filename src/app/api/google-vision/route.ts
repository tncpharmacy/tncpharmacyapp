import { NextResponse } from "next/server";
import vision, { protos } from "@google-cloud/vision";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    const client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    // ------------------ URL MODE ------------------
    if (contentType.includes("application/json")) {
      const { url } = await req.json();
      const fileRes = await fetch(url);
      const arr = await fileRes.arrayBuffer();
      const buffer = Buffer.from(arr);

      let text = "";
      const isPDF = url.toLowerCase().endsWith(".pdf");

      if (isPDF) {
        // PDF → multi-page → DOCUMENT_TEXT_DETECTION
        const request: protos.google.cloud.vision.v1.IBatchAnnotateFilesRequest =
          {
            requests: [
              {
                inputConfig: {
                  content: buffer.toString("base64"),
                  mimeType: "application/pdf",
                },
                features: [
                  {
                    type: protos.google.cloud.vision.v1.Feature.Type
                      .DOCUMENT_TEXT_DETECTION,
                  },
                ],
              },
            ],
          };

        const [result] = await client.batchAnnotateFiles(request);

        const pages = result.responses?.[0]?.responses ?? [];

        for (const page of pages) {
          text += page.fullTextAnnotation?.text || "";
        }
      } else {
        // IMAGE + HANDWRITTEN → DOCUMENT_TEXT_DETECTION
        const [result] = await client.documentTextDetection({
          image: { content: buffer },
        });

        text = result.fullTextAnnotation?.text || "";
      }

      return NextResponse.json({ text });
    }

    // ------------------ FILE UPLOAD MODE ------------------
    const form = await req.formData();
    const file = form.get("file") as File;
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";
    const isPDF = file.type === "application/pdf";

    if (isPDF) {
      const request: protos.google.cloud.vision.v1.IBatchAnnotateFilesRequest =
        {
          requests: [
            {
              inputConfig: {
                content: buffer.toString("base64"),
                mimeType: "application/pdf",
              },
              features: [
                {
                  type: protos.google.cloud.vision.v1.Feature.Type
                    .DOCUMENT_TEXT_DETECTION,
                },
              ],
            },
          ],
        };

      const [result] = await client.batchAnnotateFiles(request);
      const pages = result.responses?.[0]?.responses ?? [];

      for (const page of pages) {
        text += page.fullTextAnnotation?.text || "";
      }
    } else {
      // IMAGE / HANDWRITTEN IMAGE
      const [result] = await client.documentTextDetection({
        image: { content: buffer },
      });

      text = result.fullTextAnnotation?.text || "";
    }

    return NextResponse.json({ text });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("OCR ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
