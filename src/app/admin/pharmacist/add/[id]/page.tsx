import PharmacistForm from "@/app/components/Form/PharmacistForm";
import { IdPageProps } from "./types";

export default async function EditPharmacist({ params }: IdPageProps) {
  const { id } = await params;
  let decodedId: number;

  try {
    const base64 = decodeURIComponent(id);
    decodedId = parseInt(atob(base64), 10);

    if (isNaN(decodedId)) throw new Error("Decoded value is not a number");
  } catch (e) {
    console.warn("❌ Invalid Base64, using raw id:", id);
    decodedId = parseInt(id, 10);

    if (isNaN(decodedId)) {
      console.error("❌ Invalid ID, cannot parse:", id);
      decodedId = 0; // fallback
    }
  }

  return <PharmacistForm id={decodedId} />;
}
