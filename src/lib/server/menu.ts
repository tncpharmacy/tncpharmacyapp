import { fetchCategoriesAllList } from "@/lib/api/category";
import { fetchSubcategoriesAllList } from "@/lib/api/subCategory";

export async function getMenuData() {
  try {
    const [catRes, subRes] = await Promise.all([
      fetchCategoriesAllList(),
      fetchSubcategoriesAllList(),
    ]);

    return {
      categories: catRes.data || [],
      subcategories: subRes.data || [],
    };
  } catch (err) {
    console.error("Menu SSR error:", err);
    return {
      categories: [],
      subcategories: [],
    };
  }
}
