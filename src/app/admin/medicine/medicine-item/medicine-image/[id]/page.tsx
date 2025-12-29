import MedicineImageForm from "@/app/components/Form/MedicineImageForm";
import { IdPageProps } from "./types";

export default function EditMedicineImage({ params }: IdPageProps) {
  let decodedId = 0;

  try {
    decodedId = parseInt(atob(decodeURIComponent(params.id)), 10);
  } catch {
    decodedId = Number(params.id);
  }

  return <MedicineImageForm id={decodedId} />;
}
