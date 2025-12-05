"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../css/site-style.css";
import "../../css/user-style.css";
import { useRouter, useParams } from "next/navigation";
import { encodeId, decodeId } from "@/lib/utils/encodeDecode";
import SiteHeader from "@/app/user/components/header/header";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getGroupCareById } from "@/lib/features/medicineSlice/medicineSlice";
import { Image } from "react-bootstrap";
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

  const categoryIdNum = Number(decodeId(params));

  // -----------------------------
  // INFINITE SCROLL STATES
  // -----------------------------
  const [limit, setLimit] = useState(20);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [visibleList, setVisibleList] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredRef = useRef<any[]>([]);

  // -----------------------------
  // REDUX STATES
  // -----------------------------
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const medicines = useAppSelector(
    (state) => state.medicine.groupCareList || []
  );
  const { loading } = useAppSelector((state) => state.medicine);
  const { list: categories } = useAppSelector((state) => state.category);

  // -----------------------------
  // SHUFFLE SAFE
  // -----------------------------
  const shuffledFromHook = useShuffledProduct(
    medicines,
    `groupcare-page-${categoryIdNum}`
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stableShuffledRef = useRef<any[]>([]);
  useEffect(() => {
    if (medicines.length > 0 && stableShuffledRef.current.length === 0) {
      stableShuffledRef.current = shuffledFromHook;
    }
    if (medicines.length === 0) {
      stableShuffledRef.current = [];
    }
  }, [medicines, shuffledFromHook]);

  const finalShuffledList =
    stableShuffledRef.current.length > 0
      ? stableShuffledRef.current
      : shuffledFromHook;

  // -----------------------------
  // CATEGORY NAME
  // -----------------------------
  const categoryName =
    categories.find((cat) => cat.id === categoryIdNum)?.category_name ||
    "Unknown Category";

  // Fetch API calls
  useEffect(() => {
    dispatch(getGroupCareById(categoryIdNum));
    dispatch(getCategories());
  }, [categoryIdNum, dispatch]);

  // -----------------------------
  // CART
  // -----------------------------
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (items?.length) setLocalBag(items.map((i) => i.productid));
    else setLocalBag([]);
  }, [items]);

  useEffect(() => {
    if (buyer?.id) mergeGuestCart();
  }, [buyer?.id]);

  // -----------------------------
  // FILTERING
  // -----------------------------
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return finalShuffledList;

    const lower = searchTerm.toLowerCase();
    return finalShuffledList.filter((med) =>
      (med.medicine_name || "").toLowerCase().includes(lower)
    );
  }, [searchTerm, finalShuffledList]);

  // store filtered list in ref for observer
  useEffect(() => {
    filteredRef.current = filteredMedicines;
  }, [filteredMedicines]);

  // -----------------------------
  // UPDATE VISIBLE LIST
  // -----------------------------
  useEffect(() => {
    setVisibleList(filteredMedicines.slice(0, limit));
  }, [filteredMedicines, limit]);

  // -----------------------------
  // OBSERVER
  // -----------------------------
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
        threshold: 0.9,
        rootMargin: "0px 0px -200px 0px",
      }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [limit, isLoadingMore]);

  // -----------------------------
  // CART FUNCTIONS
  // -----------------------------
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

  const handleRemove = async (id: number) => {
    setLocalBag((prev) => prev.filter((i) => i !== id));
    setProcessingIds((prev) => [...prev, id]);

    try {
      await removeItem(id);
    } finally {
      setProcessingIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleClick = (medicine_id: number) => {
    router.push(`/product-details/${encodeId(medicine_id)}`);
  };

  // -----------------------------
  // UI
  // -----------------------------
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

              {/* SEARCH */}
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
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setLimit(20);
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* First time loader */}
              {loading && (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary"></div>
                </div>
              )}
              {/* PRODUCT LIST */}
              <div className="pd_list">
                {loading ? (
                  <p></p>
                ) : visibleList.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  visibleList.map((item) => {
                    const mrp = item.mrp || 0;
                    const hasValidMrp = mrp > 0;

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
                          i.productid === item.medicine_id ||
                          i.product_id === item.medicine_id
                      );

                    return (
                      <div
                        className="pd_box shadow"
                        key={item.medicine_id}
                        style={{ boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)" }}
                      >
                        <div className="pd_img">
                          <Image
                            src={imageUrl}
                            alt={item.medicine_name}
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
                            onClick={() => handleClick(item.medicine_id)}
                            style={{ cursor: "pointer" }}
                          >
                            {item.medicine_name}
                          </h3>

                          <h6 className="pd-title fw-bold">
                            {item.manufacturer_name}
                          </h6>

                          {!hasValidMrp ? (
                            <p className="text-danger fw-bold">OUT OF STOCK</p>
                          ) : (
                            <div className="pd_price">
                              <span className="new_price">
                                ₹{discountedPrice}
                              </span>
                              <span className="old_price">
                                <del>MRP ₹{mrp}</del> {discount}% off
                              </span>
                            </div>
                          )}

                          <button
                            className={`btn-1 btn-HO ${
                              isInBag ? "remove" : "add"
                            }`}
                            disabled={
                              !hasValidMrp ||
                              processingIds.includes(item.medicine_id)
                            }
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
