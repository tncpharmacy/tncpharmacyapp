// app/api/proxy/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Proxy route is only allowed in development" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const response = await fetch(fileUrl);

    if (!response.ok || !response.body) {
      return NextResponse.json(
        { error: "Failed to fetch remote file", status: response.status },
        { status: response.status }
      );
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/pdf",
        "Access-Control-Allow-Origin": "*",
        "Content-Disposition": `inline; filename="${fileUrl.split("/").pop()}"`,
      },
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json(
      { error: "Proxy Failed", details: error },
      { status: 500 }
    );
  }
}
