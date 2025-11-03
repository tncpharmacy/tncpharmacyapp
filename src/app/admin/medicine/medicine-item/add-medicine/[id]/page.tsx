import { IdPageProps } from "./types";
import MedicineForm from "@/app/components/Form/MedicineForm";

export default function EditMedicine({ params }: IdPageProps) {
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

  return <MedicineForm id={decodedId} />;
}
