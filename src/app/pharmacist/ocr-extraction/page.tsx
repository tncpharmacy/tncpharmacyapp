import { Suspense } from "react";
import OcrExtractionClient from "./OcrExtractionClient";

export default function OcrExtractionPage() {
  return (
    <Suspense fallback={null}>
      <OcrExtractionClient />
    </Suspense>
  );
}
