import { Medicine } from "@/types/medicine";
import AllMedicineClient from "./AllMedicineClient";
import { fetchMenuMedicinesList } from "@/lib/api/medicine";

export const dynamic = "force-dynamic";

export default async function Page() {
  let initialData: Medicine[] = [];
  let initialNext = null;
  let initialCount = 0;

  try {
    const res = await fetchMenuMedicinesList(undefined);

    initialData = res?.data || [];
    initialNext = res?.next || null;
    initialCount = res?.count || 0;
  } catch (err) {
    console.error("SSR medicine error:", err);
  }

  return (
    <AllMedicineClient
      initialData={initialData}
      initialNext={initialNext}
      initialCount={initialCount}
    />
  );
}
