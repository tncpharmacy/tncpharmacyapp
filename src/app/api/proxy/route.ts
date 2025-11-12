// app/api/proxy/route.ts
import { NextResponse } from "next/server";

// Ensure Node runtime for reliable fetch
export const runtime = "node";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    console.log("Proxy fetching:", fileUrl);

    // Node fetch (works on local & server)
    const response = await fetch(fileUrl);

    if (!response.ok || !response.body) {
      return NextResponse.json(
        { error: "Failed to fetch remote file", status: response.status },
        { status: response.status }
      );
    }

    // Stream the response to avoid memory issues with large files
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
