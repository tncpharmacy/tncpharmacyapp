// 🔥 Shuffle function (safe)
function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export async function getMenuData() {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // 🚀 Parallel API calls with caching
    const [catRes, subRes] = await Promise.all([
      fetch(`${BASE_URL}/masterapp/category/list/`, {
        next: { revalidate: 300 },
      }),
      fetch(`${BASE_URL}/masterapp/subcategory/list/`, {
        next: { revalidate: 300 },
      }),
    ]);

    const catJson = await catRes.json();
    const subJson = await subRes.json();

    // ✅ Safe data extraction
    const rawCategories = Array.isArray(catJson?.data) ? catJson.data : [];

    const subcategories = Array.isArray(subJson?.data) ? subJson.data : [];

    // 🔥 FILTER
    const filteredCategories = rawCategories.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cat: any) =>
        cat && cat.status === "Active" && cat.category_name !== "Medicines"
    );

    // ❌ SHUFFLE REMOVE (performance ke liye)
    return {
      categories: filteredCategories,
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
