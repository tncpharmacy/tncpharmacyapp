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
import TncLoader from "@/app/components/TncLoader/TncLoader";
import { loadLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";

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
  // const [visibleList, setVisibleList] = useState<any[]>([]);

  const [hasFetched, setHasFetched] = useState(false);
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
  const { groupName } = useAppSelector((state) => state.medicine);
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

  // -----------------------------
  // CATEGORY NAME
  // -----------------------------
  const categoryName =
    categories.find((cat) => cat.id === categoryIdNum)?.category_name ||
    "Unknown Category";

  // Fetch API calls
  useEffect(() => {
    if (!categoryIdNum) return;

    const fetchData = async () => {
      await dispatch(getGroupCareById(categoryIdNum));
      setHasFetched(true);
    };

    fetchData();
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

  // -------------------------------
  // 🔹 UPDATE VISIBLE LIST
  // -------------------------------
  const visibleList = useMemo(() => {
    return filteredMedicines.slice(0, limit);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [guestItems, setGuestItems] = useState<any[]>([]);
  useEffect(() => {
    if (!buyer?.id) {
      const lsData = localStorage.getItem("healthbag");

      if (!lsData) {
        setGuestItems([]); // 🔥 ensure empty
        return;
      }

      try {
        setGuestItems(JSON.parse(lsData));
      } catch {
        setGuestItems([]);
      }
    }
  }, [buyer?.id]);

  // --- Handlers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAdd = async (item: any) => {
    if (buyer?.id) {
      await addItem({
        id: 0,
        buyer_id: buyer?.id,
        product_id: item.medicine_id,
        quantity: 1,
      } as HealthBag);
    } else {
      const newItem = {
        id: 0,
        productid: item.medicine_id,
        qty: 1,

        // 🔥 STORE FULL DATA
        name: item.ProductName || item.medicine_name,
        manufacturer: item.Manufacturer || item.manufacturer_name,
        pack_size: item.PackSize || item.pack_size,
        mrp: Number(item.MRP ?? item.mrp ?? 0),
        discount: Number(item.Discount ?? item.discount ?? 0),
        image: item.DefaultImageURL || item.medicine_image || null, // 🔥 important
      };

      const exists = guestItems.find((i) => i.productid === item.medicine_id);

      let updated;

      if (exists) {
        updated = guestItems.map((i) =>
          i.productid === item.medicine_id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        updated = [...guestItems, newItem];
      }

      localStorage.setItem("healthbag", JSON.stringify(updated));
      setGuestItems(updated);
      dispatch(loadLocalHealthBag());
    }
  };

  const handleRemove = async (productId: number) => {
    setProcessingIds((prev) => [...prev, productId]);

    try {
      // 🟢 LOGIN USER
      if (buyer?.id) {
        await removeItem(productId);
      }
      // 🔵 GUEST USER
      else {
        const updated = guestItems.filter(
          (item) => (item.productid ?? item.product_id ?? item.id) !== productId
        );

        localStorage.setItem("healthbag", JSON.stringify(updated));
        setGuestItems(updated);
        dispatch(loadLocalHealthBag());
      }
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== productId));
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
              {/* SEARCH */}
              {/* TITLE + SEARCH IN SAME ROW */}
              <div className="row align-items-center mb-3">
                {/* LEFT SIDE : PRODUCT NAME */}
                <div className="col-md-9">
                  <div className="pageTitle m-0">
                    <Image src={"/images/favicon.png"} alt="" /> Product:{" "}
                    {groupName || "Loading..."}
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
                {!hasFetched ? (
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

                    const discount = parseFloat(item.discount || "0");
                    const discountedPrice = Math.round(
                      mrp - (mrp * discount) / 100
                    );

                    const imageUrl = item.default_image
                      ? item.default_image.startsWith("http")
                        ? item.default_image
                        : `${mediaBase}${item.default_image}`
                      : "/images/tnc-default.png";
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const getProductId = (item: any) => {
                      return (
                        item.productid ?? item.product_id ?? item.medicine_id
                      );
                    };
                    const source = buyer?.id ? items : guestItems;

                    const isInBag = source.some(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (i: any) => getProductId(i) === item.medicine_id
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
                              cursor: "pointer",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1,
                            }}
                            onClick={() => handleClick(item.medicine_id)}
                          />
                        </div>

                        <div className="pd_content">
                          <div
                            style={{ cursor: "pointer" }}
                            onClick={() => handleClick(item.medicine_id)}
                          >
                            <h3
                              className="pd-title hover-link fw-bold"
                              style={{ color: "#264b8c" }}
                            >
                              {item.medicine_name}
                            </h3>

                            <h6 className="pd-title fw-bold">
                              {item.manufacturer_name}
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
                              disabled={processingIds.includes(
                                item.medicine_id
                              )}
                              onClick={() =>
                                isInBag
                                  ? handleRemove(item.id)
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
