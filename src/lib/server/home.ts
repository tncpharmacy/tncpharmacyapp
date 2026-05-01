import {
  fetchGroupCare,
  fetchMenuOtherMedicinesByCategory,
} from "@/lib/api/medicine";
import { fetchCategories } from "@/lib/api/category";

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
      category5: cat5Res?.data || [],
      category7: cat7Res?.data || [],
      category9: cat9Res?.data || [],
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
