import MedicineImageForm from "@/app/components/Form/MedicineImageForm";
import { IdPageProps } from "./types";

export default async function EditMedicineImage({ params }: IdPageProps) {
  const { id } = await params;
  let decodedId = 0;

  try {
    decodedId = parseInt(atob(decodeURIComponent(id)), 10);
  } catch {
    decodedId = Number(id);
  }

  return <MedicineImageForm id={decodedId} />;
}
