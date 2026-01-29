import SupplierForm from "@/app/components/Form/SupplierForm";
import { IdPageProps } from "./types";

export default function EditPharmacy({ params }: IdPageProps) {
  let decodedId: number;

  try {
    // Decode URI component (handles %3D, etc.)
    const base64 = decodeURIComponent(params.id);

    // Decode Base64 to number
    decodedId = parseInt(atob(base64), 10);

    if (isNaN(decodedId)) {
      throw new Error("Decoded value is not a number");
    }
  } catch (e) {
    console.warn("❌ Invalid Base64, using raw id:", params.id);

    decodedId = parseInt(params.id, 10);

    if (isNaN(decodedId)) {
      console.error("❌ Invalid ID, cannot parse:", params.id);
      decodedId = 0; // fallback value
    }
  }

  console.log("Decoded ID:", decodedId);

  return <SupplierForm id={decodedId} />;
}
