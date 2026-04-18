import React, { useEffect, useState } from "react";
import "../../css/filter.css";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getSubcategories } from "@/lib/features/subCategorySlice/subCategorySlice";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import Link from "next/link";

export default function FilterSidebar() {
  const dispatch = useAppDispatch();
  // redux se categories uthana
  const { list: subcategories } = useAppSelector((state) => state.subcategory);

  const { list: categories } = useAppSelector((state) => state.category);
  const [visibleCount, setVisibleCount] = useState(10);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 5);
  };
  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getSubcategories());
    dispatch(getCategories());
  }, [dispatch]);
  return (
    <div className="filter-sidebar mt-2 p-4 h-100">
      <h3 className="filter-title" style={{ backgroundColor: "white" }}>
        Filters
      </h3>

      {/* Category Filter */}
      <div className="filter-section">
        <h4 className="filter-subtitle">Category</h4>
        {categories.map((cat) => (
          <label className="filter-option" key={cat.id}>
            <input type="checkbox" /> {cat.category_name}
          </label>
        ))}
      </div>

      {/* Sub Category Filter */}
      <div className="filter-section">
        <h4 className="filter-subtitle">Sub Category</h4>
        {subcategories.slice(0, visibleCount).map((cat) => (
          <label className="filter-option" key={cat.id}>
            <input type="checkbox" /> {cat.sub_category_name}
          </label>
        ))}

        {/* Show More button */}
        {visibleCount < subcategories.length && (
          <Link href="#" className="show-more-link" onClick={handleShowMore}>
            Show More
          </Link>
        )}
      </div>

      {/* Company Filter */}
      <div className="filter-section">
        <h4 className="filter-subtitle">Company</h4>
        <label className="filter-option">
          <input type="checkbox" /> Cipla Ltd
        </label>
        <label className="filter-option">
          <input type="checkbox" /> Roche Products
        </label>
        <label className="filter-option">
          <input type="checkbox" /> Sun Pharma
        </label>
      </div>

      {/* Price Filter */}
      <div className="filter-section">
        <h4 className="filter-subtitle">Price</h4>
        <label className="filter-option">
          <input type="radio" name="price" /> Below ₹1000
        </label>
        <label className="filter-option">
          <input type="radio" name="price" /> ₹1000 - ₹5000
        </label>
        <label className="filter-option">
          <input type="radio" name="price" /> Above ₹5000
        </label>
      </div>

      {/* Availability Filter */}
      <div className="filter-section">
        <h4 className="filter-subtitle">Availability</h4>
        <label className="filter-option">
          <input type="checkbox" /> In Stock
        </label>
        <label className="filter-option">
          <input type="checkbox" /> Not Available
        </label>
      </div>

      <button className="btn btn-primary">Apply Filters</button>
    </div>
  );
}
