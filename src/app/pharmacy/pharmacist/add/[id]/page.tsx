import PharmacistByPharmacyForm from "@/app/components/Form/PharmacistByPharmacyForm";

// Next.js 15: route params arrive as a Promise and must be awaited.
export default async function EditPharmacist({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let decodedId: number;

  try {
    // 👇 First decodeURIComponent to fix %3D issue
    const base64 = decodeURIComponent(id);
    decodedId = parseInt(atob(base64), 10);
  } catch (e) {
    console.error("❌ Invalid Base64, using raw id:", id);
    decodedId = parseInt(id, 10); // fallback
  }

  // console.log("Decoded ID:", decodedId);

  return <PharmacistByPharmacyForm id={decodedId} />;
}
