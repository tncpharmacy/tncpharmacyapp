"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../../css/site-style.css";
import "../../../css/user-style.css";
import { useRouter } from "next/navigation";
import { encodeId, decodeId } from "@/lib/utils/encodeDecode";
import SiteHeader from "@/app/user/components/header/header";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getCategoryIdBySubcategory } from "@/lib/features/medicineSlice/medicineSlice";
import { Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import Footer from "@/app/user/components/footer/footer";
import { useShuffledProduct } from "@/lib/hooks/useShuffledProduct";
import { HealthBag } from "@/types/healthBag";
import TncLoader from "@/app/components/TncLoader/TncLoader";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function AllProducts() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();

  // -------------------------------
  // 🔹 INFINITE SCROLL STATES
  // -------------------------------
  const [limit, setLimit] = useState(20);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const [visibleList, setVisibleList] = useState<any[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredRef = useRef<any[]>([]);

  // -------------------------------
  // 🔹 PARAMS DECODE
  // -------------------------------
  const categoryIdRaw = params.categoryId;
  const subCategoryIdRaw = params.subCategoryId;

  const categoryIdNum = Array.isArray(categoryIdRaw)
    ? decodeId(categoryIdRaw[0])
    : categoryIdRaw
    ? decodeId(categoryIdRaw)
    : null;

  const subCategoryIdNum = Array.isArray(subCategoryIdRaw)
    ? decodeId(subCategoryIdRaw[0])
    : subCategoryIdRaw
    ? decodeId(subCategoryIdRaw)
    : null;

  // -------------------------------
  // 🔹 REDUX DATA
  // -------------------------------
  const medicines = useAppSelector(
    (state) =>
      state.medicine.byCategorySubcategory?.[
        `${categoryIdNum}-${subCategoryIdNum}`
      ] || []
  );

  const { loading } = useAppSelector((state) => state.medicine);
  const { list: categories } = useAppSelector((state) => state.category);

  // Remove duplicates
  const uniqueMedicines = useMemo(() => {
    const map = new Map<number, (typeof medicines)[0]>();
    medicines.forEach((m) => {
      if (!map.has(m.product_id)) map.set(m.product_id, m);
    });
    return Array.from(map.values());
  }, [medicines]);

  // -------------------------------
  // 🔹 SHUFFLE (HOOK SAFE)
  // -------------------------------
  const shuffledFromHook = useShuffledProduct(
    uniqueMedicines,
    `product-page-category-${categoryIdNum}-subcategory-${subCategoryIdNum}`
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stableShuffledRef = useRef<any[]>([]);

  useEffect(() => {
    if (uniqueMedicines.length > 0 && stableShuffledRef.current.length === 0) {
      stableShuffledRef.current = shuffledFromHook;
    }
    if (uniqueMedicines.length === 0) {
      stableShuffledRef.current = [];
    }
  }, [uniqueMedicines, shuffledFromHook]);

  const finalShuffledList =
    stableShuffledRef.current.length > 0
      ? stableShuffledRef.current
      : shuffledFromHook;

  // -------------------------------
  // 🔹 CATEGORY NAME
  // -------------------------------
  const categoryName =
    categories.find((cat) => cat.id === categoryIdNum)?.category_name ||
    "Unknown Category";

  // Fetch categories & medicines
  useEffect(() => {
    if (categoryIdNum && subCategoryIdNum) {
      setHasFetched(false);

      dispatch(
        getCategoryIdBySubcategory({
          categoryId: categoryIdNum,
          subCategoryId: subCategoryIdNum,
        })
      ).finally(() => setHasFetched(true));
    }

    dispatch(getCategories());
  }, [categoryIdNum, subCategoryIdNum, dispatch]);

  // -------------------------------
  // 🔹 CART STATES
  // -------------------------------
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (items?.length) {
      setLocalBag(items.map((i) => i.productid));
    } else {
      setLocalBag([]);
    }
  }, [items]);

  useEffect(() => {
    if (buyer?.id) mergeGuestCart();
  }, [buyer?.id, mergeGuestCart]);

  // -------------------------------
  // 🔹 FILTER MEDICINES
  // -------------------------------
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return finalShuffledList;

    const lower = searchTerm.toLowerCase();
    return finalShuffledList.filter((med) =>
      (med.ProductName || "").toLowerCase().includes(lower)
    );
  }, [searchTerm, finalShuffledList]);

  // Store for observer
  useEffect(() => {
    filteredRef.current = filteredMedicines;
  }, [filteredMedicines]);

  // -------------------------------
  // 🔹 UPDATE VISIBLE LIST
  // -------------------------------
  const visibleList = useMemo(() => {
    return filteredMedicines.slice(0, limit);
  }, [filteredMedicines, limit]);

  // -------------------------------
  // 🔹 INTERSECTION OBSERVER
  // -------------------------------
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry.isIntersecting) return;
        if (isLoadingMore) return;

        const total = filteredRef.current.length;
        if (limit >= total) return;

        setIsLoadingMore(true);

        setLimit((prev) => Math.min(prev + 20, total));

        setTimeout(() => setIsLoadingMore(false), 300);
      },
      {
        root: null,
        threshold: 1.0,
        rootMargin: "0px 0px -200px 0px",
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, []);

  // -------------------------------
  // 🔹 CART HANDLERS
  // -------------------------------
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

  // -------------------------------
  // 🔹 UI RETURN
  // -------------------------------
  return (
    <>
      <div className="page-wrapper">
        <SiteHeader />

        <div className="body_wrap">
          <div className="body_right">
            <div className="body_content">
              {/* SEARCH */}
              {/* TITLE + SEARCH IN SAME ROW */}
              <div className="row align-items-center mb-3">
                {/* LEFT SIDE : PRODUCT NAME */}
                <div className="col-md-9">
                  <div className="pageTitle m-0">
                    <Image src={"/images/favicon.png"} alt="" /> Product:{" "}
                    {categoryName || "Loading..."}
                  </div>
                </div>

                {/* RIGHT SIDE : SEARCH BOX */}
                <div className="col-md-3">
                  <div className="search_query">
                    <a className="query_search_btn" href="javascript:void(0)">
                      <i className="bi bi-search"></i>
                    </a>
                    <input
                      type="text"
                      className="txt1 my-box"
                      placeholder="Search product..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setLimit(20);
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* First time loader */}
              {/* {loading && (
                <div className="text-center my-4">
                  <TncLoader />
                </div>
              )} */}
              {/* PRODUCT LIST */}
              <div className="pd_list">
                {!hasFetched || loading ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ marginLeft: "100vh" }}
                  >
                    <TncLoader />
                  </div>
                ) : visibleList.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  visibleList.map((item) => {
                    const mrpRaw =
                      item.MRP ?? item.mrp ?? item.Mrp ?? item.price ?? 0;

                    const parsedMrp = Number(mrpRaw);

                    // 🔥 FINAL MRP FIX
                    const mrp =
                      Number.isFinite(parsedMrp) && parsedMrp > 0
                        ? parsedMrp
                        : 275;

                    const discount = parseFloat(item.Discount) || 0;
                    const discountedPrice = mrp
                      ? Math.round(mrp - (mrp * discount) / 100)
                      : 0;

                    const imageUrl = item.DefaultImageURL
                      ? item.DefaultImageURL.startsWith("http")
                        ? item.DefaultImageURL
                        : `${mediaBase}${item.DefaultImageURL}`
                      : "/images/tnc-default.png";

                    const isInBag =
                      localBag.includes(item.product_id) ||
                      items.some(
                        (i) =>
                          i.productid === item.product_id ||
                          i.product_id === item.product_id
                      );

                    return (
                      <div
                        className="pd_box shadow"
                        key={item.product_id}
                        style={{ boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}
                      >
                        <div className="pd_img">
                          <Image
                            src={imageUrl}
                            alt={item.ProductName}
                            style={{
                              height: "220px",
                              objectFit: "contain",
                              cursor: "pointer",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1,
                            }}
                            onClick={() => handleClick(item.product_id)}
                          />
                        </div>

                        <div className="pd_content">
                          <div
                            style={{ cursor: "pointer" }}
                            onClick={() => handleClick(item.product_id)}
                          >
                            <h3
                              className="pd-title hover-link fw-bold"
                              style={{ color: "#264b8c" }}
                            >
                              {item.ProductName}
                            </h3>

                            <h6 className="pd-title fw-bold">
                              {item.Manufacturer}
                            </h6>

                            <div className="pd_price">
                              <span className="new_price">
                                ₹{discountedPrice}
                              </span>
                              {mrp > 0 && (
                                <span className="old_price">
                                  <del>MRP ₹{mrp}</del> {discount}% off
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
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
                      </div>
                    );
                  })
                )}

                {/* {isLoadingMore && (
                  <div className="text-center my-3">
                    <div className="spinner-border text-primary"></div>
                  </div>
                )} */}

                <div style={{ height: "300px" }} />
                <div ref={loadMoreRef} style={{ height: "20px" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
