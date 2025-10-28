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
import { Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import Footer from "@/app/user/components/footer/footer";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function AllProducts() {
  const [isHovered, setIsHovered] = useState(false);
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

  // Merge guest cart into logged-in cart once
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id]);

  // end for increse header count code

  const handleClick = (product_id: number) => {
    router.push(`/product-details/${encodeId(product_id)}`);
  };

  // Filter the medicines based on the search term
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return medicines;
    const lower = searchTerm.toLowerCase();
    return medicines.filter((med) =>
      (med.ProductName || "").toLowerCase().includes(lower)
    );
  }, [medicines, searchTerm]);

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
                {filteredMedicines && filteredMedicines.length > 0 ? (
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

                    const isInBag = items.some(
                      (i) => i.product_id === item.product_id
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
                            className="btn-1"
                            onClick={() =>
                              isInBag
                                ? removeItem(item.product_id)
                                : addItem({
                                    id: Date.now(),
                                    buyer_id: buyer?.id || 0,
                                    product_id: item.product_id,
                                    quantity: 1,
                                  })
                            }
                          >
                            {isInBag ? "REMOVE" : "ADD"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Loading products...</p>
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
