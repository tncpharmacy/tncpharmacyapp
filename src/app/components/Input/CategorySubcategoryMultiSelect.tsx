import { useState, useEffect } from "react";

interface Category {
  id: number;
  category_name: string;
}

interface SubCategory {
  id: number;
  sub_category_name: string;
  category_name: string;
}

interface Option {
  label: string;
  value: number;
}

export default function CategorySubcategoryMultiSelect({
  categories,
  subcategories,
}) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<number[]>(
    []
  );

  // Category options excluding Medicines
  const categoryOptions: Option[] = (categories || [])
    .filter((c: Category) => c.category_name !== "Medicines")
    .map((c: Category) => ({ label: c.category_name, value: c.id }));

  // Handle category selection with max 3
  const handleCategoryChange = (selected: number[]) => {
    if (selected.length <= 3) setSelectedCategories(selected);
    else alert("You can select up to 3 categories only!");
  };

  // Get subcategories grouped by selected category
  const groupedSubCategories: { [key: number]: SubCategory[] } = {};
  selectedCategories.forEach((catId) => {
    groupedSubCategories[catId] = (subcategories || []).filter(
      (sc: SubCategory) =>
        sc.category_name ===
        categories.find((c) => c.id === catId)?.category_name
    );
  });

  return (
    <div style={{ padding: "1rem" }}>
      <label>Category (max 3)</label>
      <CustomSelectInput
        name="category"
        value={selectedCategories}
        options={categoryOptions}
        onChange={handleCategoryChange}
        isMulti
      />

      <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
        {selectedCategories.map((catId, idx) => (
          <div key={catId} style={{ flex: 1 }}>
            <h4 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              {categories.find((c) => c.id === catId)?.category_name}
            </h4>
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "0.5rem",
                minHeight: "100px",
              }}
            >
              {groupedSubCategories[catId].map((sc: SubCategory) => (
                <div
                  key={sc.id}
                  style={{ padding: "4px 0", borderBottom: "1px dashed #eee" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSubCategories.includes(sc.id)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedSubCategories((prev) => [...prev, sc.id]);
                      else
                        setSelectedSubCategories((prev) =>
                          prev.filter((id) => id !== sc.id)
                        );
                    }}
                  />{" "}
                  {sc.sub_category_name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
