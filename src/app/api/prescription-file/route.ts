import { NextResponse } from "next/server";

export const runtime = "nodejs";

// 🔒 Only allow our own GCS buckets — prevents this route from being
// used as an open proxy to arbitrary URLs.
const ALLOWED_PREFIXES = [
  "https://storage.googleapis.com/tnc-pharmacy-ocr-bucket/",
  "https://storage.googleapis.com/tnc-pharmacy-product-images-bucket/",
];

/**
 * GET /api/prescription-file?url=<encoded GCS url>
 *
 * Downloads a prescription file server-side and streams it back to the
 * browser. Needed because a direct browser fetch() from storage.googleapis.com
 * is blocked by CORS — server-side fetch has no such restriction.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter" },
      { status: 400 }
    );
  }

  if (!ALLOWED_PREFIXES.some((prefix) => fileUrl.startsWith(prefix))) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
  }

  try {
    const upstream = await fetch(fileUrl, { cache: "no-store" });

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: `Failed to download prescription file (HTTP ${upstream.status})`,
        },
        { status: upstream.status }
      );
    }

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to download prescription file" },
      { status: 500 }
    );
  }
}
