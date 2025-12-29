import SafetyAdviceForm from "@/app/components/Form/SafetyAdviceForm";
import { IdPageProps } from "./types";

export default function EditSafetyAdvice({ params }: IdPageProps) {
  let decodedId: number;

  try {
    const base64 = decodeURIComponent(params.id);
    decodedId = parseInt(atob(base64), 10);

    if (isNaN(decodedId)) throw new Error("Decoded value is not a number");
  } catch (e) {
    console.warn("❌ Invalid Base64, using raw id:", params.id);
    decodedId = parseInt(params.id, 10);

    if (isNaN(decodedId)) {
      console.error("❌ Invalid ID, cannot parse:", params.id);
      decodedId = 0; // fallback
    }
  }

  return <SafetyAdviceForm id={decodedId} />;
}
