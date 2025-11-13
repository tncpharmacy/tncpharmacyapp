"use client";

import React, { useEffect, useMemo, useState } from "react";
import "../../css/site-style.css";
import "../../css/user-style.css";
import { useRouter } from "next/navigation";
import { encodeId, decodeId } from "@/lib/utils/encodeDecode";
import SiteHeader from "@/app/user/components/header/header";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getGroupCareById,
  getMedicinesByCategoryId,
} from "@/lib/features/medicineSlice/medicineSlice";
import { Button, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import Footer from "@/app/user/components/footer/footer";
import { useShuffledProduct } from "@/lib/hooks/useShuffledProduct";
import { HealthBag } from "@/types/healthBag";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function AllGroupCare() {
  const router = useRouter();
  const { id: params } = useParams();
  const dispatch = useAppDispatch();
  const decodedId = decodeId(params);
  const categoryIdNum = Number(decodedId);

  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  const medicines = useAppSelector(
    (state) => state.medicine.groupCareList || []
  );
  const { loading } = useAppSelector((state) => state.medicine);
  const { list: categories } = useAppSelector((state) => state.category);

  const shuffledMedicines = useShuffledProduct(
    medicines,
    `product-page-category-${categoryIdNum}`
  );

  const categoryName =
    categories.find((cat) => cat.id === categoryIdNum)?.category_name ||
    "Unknown Category";

  // --- Local states for instant UI ---
  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Sync localBag with Redux items ---
  useEffect(() => {
    if (items?.length) {
      setLocalBag(items.map((i) => i.productid)); // ✅ correct key
    } else {
      setLocalBag([]);
    }
  }, [items]);

  // --- Fetch data initially ---
  useEffect(() => {
    if (!medicines.length && categoryIdNum) {
      dispatch(getGroupCareById(categoryIdNum));
      dispatch(getCategories());
    }
  }, [categoryIdNum, dispatch, medicines.length]);

  // --- Merge guest cart ---
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id, mergeGuestCart]);

  // --- Filter products ---
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return shuffledMedicines;
    const lower = searchTerm.toLowerCase();
    return shuffledMedicines.filter((med) =>
      (med.medicine_name || "").toLowerCase().includes(lower)
    );
  }, [shuffledMedicines, searchTerm]);

  // --- Handlers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAdd = async (item: any) => {
    setLocalBag((prev) => [...prev, item.medicine_id]);
    setProcessingIds((prev) => [...prev, item.medicine_id]);
    try {
      await addItem({
        id: 0,
        buyer_id: buyer?.id || 0,
        product_id: item.medicine_id,
        quantity: 1,
      } as HealthBag);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== item.medicine_id));
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

  const handleClick = (medicine_id: number) => {
    router.push(`/product-details/${encodeId(medicine_id)}`);
  };

  return (
    <>
      <div className="page-wrapper">
        <SiteHeader />

        <div className="body_wrap">
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
                      placeholder="Search product..."
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
                    const mrp = item.mrp
                      ? parseFloat(item.mrp.toString())
                      : Math.floor(Math.random() * (1000 - 100 + 1)) + 100;

                    const discount = parseFloat(item.discount || "0");
                    const discountedPrice = Math.round(
                      mrp - (mrp * discount) / 100
                    );

                    const imageUrl = item.default_image
                      ? item.default_image.startsWith("http")
                        ? item.default_image
                        : `${mediaBase}${item.default_image}`
                      : "/images/tnc-default.png";

                    const isInBag =
                      localBag.includes(item.medicine_id) ||
                      items.some(
                        (i) =>
                          i.productid === item.medicine_id || // backend data
                          i.product_id === item.medicine_id // guest/local data
                      );

                    return (
                      <div
                        className="pd_box shadow"
                        key={item.id}
                        style={{ boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)" }}
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
                                  : 1,
                            }}
                          />
                        </div>

                        <div className="pd_content">
                          <h3
                            className="pd-title hover-link"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleClick(item.medicine_id)}
                          >
                            {item.medicine_name || ""}
                          </h3>
                          <h6 className="pd-title fw-bold">
                            {item.manufacturer_name || ""}
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
                            disabled={processingIds.includes(item.medicine_id)}
                            onClick={() =>
                              isInBag
                                ? handleRemove(item.medicine_id)
                                : handleAdd(item)
                            }
                          >
                            {processingIds.includes(item.medicine_id)
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
