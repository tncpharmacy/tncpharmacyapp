import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const logFilePath = path.join(process.cwd(), "failed-logs.txt");
const successLogPath = path.join(process.cwd(), "success-logs.txt");

// 🔁 Retry download
async function downloadWithRetry(url: string, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          Referer: "https://medicinedata.in/",
        },
      });

      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("image")) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      const buffer = Buffer.from(await res.arrayBuffer());

      if (buffer.length < 5000) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      return buffer;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log(`🔁 Retry ${i + 1}:`, url);
  }

  return null;
}

export async function POST(req: NextRequest) {
  const failedUrls: string[] = [];

  try {
    const body = await req.json();
    const data = body.data || [];

    if (!data.length) {
      return NextResponse.json(
        { message: "No data provided" },
        { status: 400 }
      );
    }

    const baseDir = path.join(process.cwd(), "public/products/5000.40");

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const BATCH_SIZE = 10;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);

      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        batch.map(async (item: any) => {
          const { url, medicine_code } = item;

          try {
            if (!url || !medicine_code) {
              failedUrls.push(url);
              return;
            }

            const originalName = url.split("/").pop()?.split("?")[0];

            if (!originalName) {
              failedUrls.push(url);
              return;
            }

            // ✅ NEW LOGIC
            const ext = originalName.split(".").pop();
            const nameWithoutExt = originalName.replace(`.${ext}`, "");
            const parts = nameWithoutExt.split(".");

            let fileName = "";

            if (parts.length === 1) {
              fileName = `${medicine_code}.${ext}`;
            } else {
              const index = parts[1];
              fileName = `${medicine_code}_${index}.${ext}`;
            }

            const medicineDir = path.join(baseDir, medicine_code);

            if (!fs.existsSync(medicineDir)) {
              fs.mkdirSync(medicineDir, { recursive: true });
            }

            const filePath = path.join(medicineDir, fileName);

            // ⚠️ skip if already exists
            if (fs.existsSync(filePath)) {
              console.log("⚠️ Exists:", fileName);
              return;
            }

            const buffer = await downloadWithRetry(url);

            if (!buffer) {
              failedUrls.push(url);
              fs.appendFileSync(
                logFilePath,
                `FAILED: ${medicine_code} -> ${url}\n`
              );
              return;
            }

            fs.writeFileSync(filePath, buffer);

            fs.appendFileSync(
              successLogPath,
              `SUCCESS: ${medicine_code} -> ${fileName}\n`
            );

            console.log(`✅ ${medicine_code} -> ${fileName}`);
          } catch (err) {
            failedUrls.push(url);
            fs.appendFileSync(
              logFilePath,
              `ERROR: ${medicine_code} -> ${url}\n`
            );
          }
        })
      );
    }

    return NextResponse.json({
      message: "Download complete",
      total: data.length,
      success: data.length - failedUrls.length,
      failed: failedUrls.length,
      failedUrls,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
