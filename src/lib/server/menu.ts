import { fetchCategoriesAllList } from "@/lib/api/category";
import { fetchSubcategoriesAllList } from "@/lib/api/subCategory";

// 🔥 Shuffle function (safe)
function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export async function getMenuData() {
  try {
    // 🚀 Parallel API calls
    const [catRes, subRes] = await Promise.all([
      fetchCategoriesAllList(),
      fetchSubcategoriesAllList(),
    ]);

    // ✅ Safe data extraction
    const rawCategories = Array.isArray(catRes?.data) ? catRes.data : [];

    const subcategories = Array.isArray(subRes?.data) ? subRes.data : [];

    // 🔥 FILTER (optional but recommended)
    const filteredCategories = rawCategories.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cat: any) =>
        cat && cat.status === "Active" && cat.category_name !== "Medicines"
    );

    // 🔥 SHUFFLE (MAIN LOGIC)
    const shuffledCategories = shuffleArray(filteredCategories);

    return {
      categories: shuffledCategories,
      subcategories,
    };
  } catch (err) {
    console.error("Menu SSR error:", err);

    return {
      categories: [],
      subcategories: [],
    };
  }
}
