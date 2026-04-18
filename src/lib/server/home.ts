import {
  fetchGroupCare,
  fetchMenuOtherMedicinesByCategory,
} from "@/lib/api/medicine";
import { fetchCategories } from "@/lib/api/category";

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => 0.5 - Math.random());
}

export async function getHomeData() {
  try {
    const [groupCareRes, cat5Res, cat7Res, cat9Res, categoryRes] =
      await Promise.all([
        fetchGroupCare(),
        fetchMenuOtherMedicinesByCategory(5),
        fetchMenuOtherMedicinesByCategory(7),
        fetchMenuOtherMedicinesByCategory(9),
        fetchCategories(),
      ]);

    return {
      groupCare: groupCareRes?.data || [],
      category5: shuffle(cat5Res?.data || []),
      category7: shuffle(cat7Res?.data || []),
      category9: shuffle(cat9Res?.data || []),
      categories: categoryRes.data || [],
    };
  } catch (err) {
    console.error("Home SSR error:", err);
    return {
      groupCare: [],
      category5: [],
      category7: [],
      category9: [],
      categories: [],
    };
  }
}
