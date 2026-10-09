import PharmacyForm from "@/app/components/Form/PharmacyForm";
import { IdPageProps } from "./types";

export default async function EditPharmacy({ params }: IdPageProps) {
  const { id } = await params;
  let decodedId: number;

  try {
    // Decode URI component (handles %3D, etc.)
    const base64 = decodeURIComponent(id);

    // Decode Base64 to number
    decodedId = parseInt(atob(base64), 10);

    if (isNaN(decodedId)) {
      throw new Error("Decoded value is not a number");
    }
  } catch (e) {
    console.warn("❌ Invalid Base64, using raw id:", id);

    decodedId = parseInt(id, 10);

    if (isNaN(decodedId)) {
      console.error("❌ Invalid ID, cannot parse:", id);
      decodedId = 0; // fallback value
    }
  }

  // console.log("Decoded ID:", decodedId);

  return <PharmacyForm id={decodedId} />;
}
