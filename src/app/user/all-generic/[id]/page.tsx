"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../css/site-style.css";
import "../../css/user-style.css";
import { useRouter } from "next/navigation";
import { encodeId, decodeId } from "@/lib/utils/encodeDecode";
import SiteHeader from "@/app/user/components/header/header";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getMedicineByGenericId,
  getMedicinesByCategoryId,
} from "@/lib/features/medicineSlice/medicineSlice";
import { Button, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import Footer from "@/app/user/components/footer/footer";
import { useShuffledProduct } from "@/lib/hooks/useShuffledProduct";
import { HealthBag } from "@/types/healthBag";
import TncLoader from "@/app/components/TncLoader/TncLoader";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function AllGeneric() {
  const router = useRouter();

  // Scrolling state
  const [limit, setLimit] = useState(20);
  const [hasFetched, setHasFetched] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const [visibleList, setVisibleList] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredRef = useRef<any[]>([]); // will hold latest filteredMedicines for observer

  const params = useParams();
  const decodedId = decodeId(params.id as string);
  const dispatch = useAppDispatch();
  const categoryIdNum = Number(decodedId);

  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  const medicines = useAppSelector(
    (state) => state.medicine.genericAlternativesMedicines || []
  );
  const { loading } = useAppSelector((state) => state.medicine);

  const { list: categories } = useAppSelector((state) => state.category);

  // --- CALL SHUFFLE HOOK AT TOP-LEVEL (ESLINT SAFE) ---
  const shuffledFromHook = useShuffledProduct(
    medicines,
    `product-page-category-${categoryIdNum}`
  );

  // --- Freeze shuffled result once when medicines arrive ---
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

  // const finalShuffledList =
  //   stableShuffledRef.current.length > 0
  //     ? stableShuffledRef.current
  //     : shuffledFromHook;
  const finalShuffledList = useMemo(() => {
    const list =
      stableShuffledRef.current.length > 0
        ? stableShuffledRef.current
        : shuffledFromHook;

    // remove duplicates
    const unique = Array.from(
      new Map(list.map((item) => [item.id, item])).values()
    );

    return unique;
  }, [shuffledFromHook]);

  const genericName = medicines?.[0]?.generic_name || "Loading...";
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
    if (!categoryIdNum) return;

    const fetchData = async () => {
      await dispatch(getMedicineByGenericId(categoryIdNum));
      setHasFetched(true);
    };

    fetchData();
    dispatch(getCategories());
  }, [categoryIdNum, dispatch]);

  // --- Merge guest cart ---
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id, mergeGuestCart]);

  // --- Filter products (derived from stable finalShuffledList) ---
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return finalShuffledList;
    const lower = searchTerm.toLowerCase();
    return finalShuffledList.filter((med) =>
      (med.medicine_name || "").toLowerCase().includes(lower)
    );
  }, [finalShuffledList, searchTerm]);

  // keep filteredRef in sync for observer checks
  // useEffect(() => {
  //   filteredRef.current = filteredMedicines;
  //   if (filteredMedicines.length > 0 && limit === 0) {
  //     setLimit(20);
  //   }
  // }, [filteredMedicines, limit]);

  useEffect(() => {
    filteredRef.current = filteredMedicines;
  }, [filteredMedicines]);

  // --- Handlers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAdd = async (item: any) => {
    setLocalBag((prev) => [...prev, item.id]);
    setProcessingIds((prev) => [...prev, item.id]);
    try {
      await addItem({
        id: 0,
        buyer_id: buyer?.id || 0,
        product_id: item.id,
        quantity: 1,
      } as HealthBag);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== item.id));
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (item: any) => {
    if (item.category_id === 1) {
      router.push(`/medicines-details/${encodeId(item.id)}`);
    } else {
      router.push(`/product-details/${encodeId(item.id)}`);
    }
  };

  // --- visibleList slice (controls what we render) ---
  const visibleList = useMemo(() => {
    return filteredMedicines.slice(0, limit);
  }, [filteredMedicines, limit]);

  // --- IntersectionObserver: create ONCE, read filteredRef.current inside callback ---
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (isLoadingMore) return;

        const total = filteredRef.current.length || 0;
        if (limit >= total) return; // nothing to load

        setIsLoadingMore(true);

        // increment safely using latest filteredRef.current
        setLimit((prev) => {
          const next = Math.min(prev + 20, total);
          return next;
        });

        // small debounce so observer doesn't immediately retrigger
        setTimeout(() => {
          setIsLoadingMore(false);
        }, 350);
      },
      {
        root: null, // window/body scroll (your screenshot showed body scroll)
        threshold: 1.0,
        rootMargin: "0px 0px -200px 0px",
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
    // we intentionally run this effect only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getMedicineImage = (medicine: any) => {
    if (medicine.primary_image) return medicine.primary_image;

    if (medicine.images?.length) {
      const primary =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        medicine.images.find((i: any) => i.default_image === 1) ||
        medicine.images[0];

      return `${mediaBase}${primary.document}`;
    }

    return "/images/tnc-default.png";
  };

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
                    <Image src={"/images/favicon.png"} alt="" /> Generic:{" "}
                    {genericName}
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
              <div className="pd_list">
                {loading && !hasFetched ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ marginLeft: "100vh" }}
                  >
                    <TncLoader />
                  </div>
                ) : visibleList.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  visibleList.map((item, index) => {
                    const mrpRaw =
                      item.MRP ?? item.mrp ?? item.Mrp ?? item.price ?? 0;

                    const parsedMrp = Number(mrpRaw);

                    // 🔥 FINAL MRP FIX
                    const mrp =
                      Number.isFinite(parsedMrp) && parsedMrp > 0
                        ? parsedMrp
                        : 275;

                    const discount = parseFloat(item.discount) || 0;
                    const discountedPrice = Math.round(
                      mrp - (mrp * discount) / 100
                    );

                    const imageUrl = getMedicineImage(item);

                    const isInBag =
                      localBag.includes(item.id) ||
                      items.some(
                        (i) =>
                          i.productid === item.id || // backend data
                          i.product_id === item.id // guest/local data
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
                            alt={item.medicine_name}
                            style={{
                              height: "220px",
                              objectFit: "contain",
                              cursor: "pointer",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1,
                            }}
                            onClick={() => handleClick(item)}
                          />
                        </div>

                        <div className="pd_content">
                          <div
                            style={{ cursor: "pointer" }}
                            onClick={() => handleClick(item)}
                          >
                            <h3
                              className="pd-title hover-link fw-bold"
                              style={{ color: "#264b8c" }}
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
                          </div>
                          <div>
                            <button
                              className={`btn-1 btn-HO ${
                                isInBag ? "remove" : "add"
                              }`}
                              disabled={processingIds.includes(item.id)}
                              onClick={() =>
                                isInBag
                                  ? handleRemove(item.id)
                                  : handleAdd(item)
                              }
                            >
                              {processingIds.includes(item.id)
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
                {/* 
                {isLoadingMore && (
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
