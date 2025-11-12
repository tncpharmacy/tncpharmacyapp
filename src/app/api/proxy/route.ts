import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Proxy route should not be used in production!" },
      { status: 403 }
    );
  }

  const url = new URL(req.url).searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "Missing URL parameter" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      status: res.status,
      headers: {
        "Content-Type":
          res.headers.get("Content-Type") || "application/octet-stream",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}
