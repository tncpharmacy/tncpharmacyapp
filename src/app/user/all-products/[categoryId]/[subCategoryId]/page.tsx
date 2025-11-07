"use client";

import React, { useEffect, useMemo, useState } from "react";
import "../../../css/site-style.css";
import "../../../css/user-style.css";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/utils/encodeDecode";
import SiteHeader from "@/app/user/components/header/header";
import { useParams } from "next/navigation";
import { decodeId } from "@/lib/utils/encodeDecode";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getCategoryIdBySubcategory } from "@/lib/features/medicineSlice/medicineSlice";
import { Button, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import Footer from "@/app/user/components/footer/footer";
import { useShuffledProduct } from "@/lib/hooks/useShuffledProduct";
import { HealthBag } from "@/types/healthBag";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function AllProducts() {
  const [isHovered, setIsHovered] = useState(false);
  // --- Local states for instant UI ---
  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  // raw params
  const categoryIdRaw = params.categoryId;
  const subCategoryIdRaw = params.subCategoryId;
  // decode categoryId
  const categoryIdNum = Array.isArray(categoryIdRaw)
    ? decodeId(categoryIdRaw[0])
    : categoryIdRaw
    ? decodeId(categoryIdRaw)
    : null;

  // decode subCategoryId
  const subCategoryIdNum = Array.isArray(subCategoryIdRaw)
    ? decodeId(subCategoryIdRaw[0])
    : subCategoryIdRaw
    ? decodeId(subCategoryIdRaw)
    : null;

  const medicines = useAppSelector(
    (state) =>
      state.medicine.byCategorySubcategory?.[
        `${categoryIdNum}-${subCategoryIdNum}`
      ] || []
  );
  const { loading } = useAppSelector((state) => state.medicine);
  // dedupe by product_id (keeps first occurrence)
  const uniqueMedicines = React.useMemo(() => {
    if (!medicines || medicines.length === 0) return [];
    const map = new Map<number, (typeof medicines)[0]>();
    medicines.forEach((m) => {
      if (!map.has(m.product_id)) map.set(m.product_id, m);
    });
    return Array.from(map.values());
  }, [medicines]);

  // then call hook on unique list
  const shuffledMedicines = useShuffledProduct(
    uniqueMedicines,
    `product-page-category-${categoryIdNum}-subcategory-${subCategoryIdNum}`
  );

  useEffect(() => {
    if (categoryIdNum && subCategoryIdNum) {
      dispatch(
        getCategoryIdBySubcategory({
          categoryId: categoryIdNum,
          subCategoryId: subCategoryIdNum,
        })
      );
    }
  }, [categoryIdNum, subCategoryIdNum, dispatch]);

  const { list: categories } = useAppSelector((state) => state.category);
  // Find category name
  const categoryName =
    categories.find((cat) => cat.id === categoryIdNum)?.category_name ||
    "Unknown Category";
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  // start for increse header count code
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  // --- Sync localBag with Redux items ---
  useEffect(() => {
    if (items?.length) {
      setLocalBag(items.map((i) => i.productid)); // ✅ correct key
    } else {
      setLocalBag([]);
    }
  }, [items]);

  // Merge guest cart into logged-in cart once
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id, mergeGuestCart]);

  // --- Handlers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAdd = async (item: any) => {
    setLocalBag((prev) => [...prev, item.product_id]);
    setProcessingIds((prev) => [...prev, item.product_id]);
    try {
      await addItem({
        id: 0,
        buyer_id: buyer?.id || 0,
        product_id: item.product_id,
        quantity: 1,
      } as HealthBag);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== item.product_id));
    }
  };

  const handleRemove = async (productId: number) => {
    setLocalBag((prev) => prev.filter((id) => id !== productId));
    setProcessingIds((prev) => [...prev, productId]);
    try {
      await removeItem(productId);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== productId));
    }
  };
  const handleClick = (product_id: number) => {
    router.push(`/product-details/${encodeId(product_id)}`);
  };

  // Filter the medicines based on the search term
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) {
      return shuffledMedicines;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return shuffledMedicines.filter((med) =>
      (med.ProductName || "").toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [shuffledMedicines, searchTerm]);

  return (
    <>
      <div className="page-wrapper">
        <SiteHeader />

        <div className="body_wrap">
          {/* <FilterSidebar /> */}
          <div className="body_right">
            <div className="body_content">
              <div className="pageTitle">
                <Image src={"/images/favicon.png"} alt="" /> Product:{" "}
                {categoryName}
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="search_query">
                    <a className="query_search_btn" href="javascript:void(0)">
                      <i className="bi bi-search"></i>
                    </a>
                    <input
                      type="text"
                      className="txt1 my-box"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="pd_list">
                {loading ? (
                  <p>Loading products...</p>
                ) : filteredMedicines.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  filteredMedicines.map((item) => {
                    const mrp = item.MRP
                      ? parseFloat(item.MRP.toString())
                      : Math.floor(Math.random() * (1000 - 100 + 1)) + 100;

                    const discount = parseFloat(item.Discount) || 0;
                    const discountedPrice = Math.round(
                      mrp - (mrp * discount) / 100
                    );

                    const imageUrl = item.DefaultImageURL
                      ? item.DefaultImageURL.startsWith("http")
                        ? item.DefaultImageURL
                        : `${mediaBase}${item.DefaultImageURL}`
                      : "/images/tnc-default.png";

                    const isInBag =
                      localBag.includes(item.product_id) ||
                      items.some(
                        (i) =>
                          i.productid === item.product_id || // backend data
                          i.product_id === item.product_id // guest/local data
                      );

                    return (
                      <div
                        className="pd_box shadow"
                        style={{ boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)" }}
                        key={item.product_id}
                      >
                        <div className="pd_img">
                          <Image
                            src={imageUrl}
                            alt={item.ProductName}
                            style={{
                              height: "220px",
                              objectFit: "contain",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1, // ✅ only default image faded
                            }}
                          />
                        </div>
                        <div className="pd_content">
                          <h3
                            className="pd-title hover-link"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleClick(item.product_id)}
                          >
                            {item.ProductName || ""}
                          </h3>
                          <h6 className="pd-title fw-bold">
                            {item.Manufacturer || ""}
                          </h6>
                          <div className="pd_price">
                            <span className="new_price">
                              ₹{discountedPrice}
                            </span>
                            <span className="old_price">
                              <del>MRP ₹{mrp}</del> {discount}% off
                            </span>
                          </div>

                          <button
                            className={`btn-1 btn-HO ${
                              isInBag ? "remove" : "add"
                            }`}
                            disabled={processingIds.includes(item.product_id)}
                            onClick={() =>
                              isInBag
                                ? handleRemove(item.product_id)
                                : handleAdd(item)
                            }
                          >
                            {processingIds.includes(item.product_id)
                              ? "Processing..."
                              : isInBag
                              ? "REMOVE"
                              : "ADD"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
