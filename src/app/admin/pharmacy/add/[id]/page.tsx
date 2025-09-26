import PharmacyForm from "@/app/components/Form/PharmacyForm";

export default function EditPharmacy({ params }: { params: { id: string } }) {
  let decodedId: number;

  try {
    // 👇 First decodeURIComponent to fix %3D issue
    const base64 = decodeURIComponent(params.id);
    decodedId = parseInt(atob(base64), 10);
  } catch (e) {
    console.error("❌ Invalid Base64, using raw id:", params.id);
    decodedId = parseInt(params.id, 10); // fallback
  }

  console.log("Decoded ID:", decodedId);

  return <PharmacyForm id={decodedId} />;
}
