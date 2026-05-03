"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../css/site-style.css";
import "../../css/user-style.css";
import { notFound, useRouter } from "next/navigation";
import { encodeId, decodeId } from "@/lib/utils/encodeDecode";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getMedicinesByCategoryId,
  resetMedicinesList,
} from "@/lib/features/medicineSlice/medicineSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import Footer from "@/app/(user)/components/footer/footer";
import { useShuffledProduct } from "@/lib/hooks/useShuffledProduct";
import { HealthBag } from "@/types/healthBag";
import TncLoader from "@/app/components/TncLoader/TncLoader";
import { loadLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";
import Pagination from "@/app/components/Pagination/Pagination";
import ProductCardUI from "../../components/MedicineCard/ProductCardUI";
import Image from "next/image";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function AllProductClient() {
  const router = useRouter();
  const { id: params } = useParams();
  const dispatch = useAppDispatch();
  const decodedId = decodeId(params);
  const categoryIdNum = Number(decodedId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [guestItems, setGuestItems] = useState<any[]>([]);
  // for pagination
  const [page, setPage] = useState(1);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [prevStack, setPrevStack] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(false);

  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  const medicines = useAppSelector(
    (state) => state.medicine.byCategory[categoryIdNum] || []
  );

  const nextUrl = useAppSelector((state) => state.medicine.next);

  const { loading } = useAppSelector((state) => state.medicine);

  const { list: categories } = useAppSelector((state) => state.category);

  const [isMobile, setIsMobile] = useState(false);

  if (!decodedId) {
    notFound();
  }

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768); // mobile breakpoint
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const categoryName =
    categories.find((cat) => cat.id === categoryIdNum)?.category_name ||
    "Unknown Category";

  // --- Local states for instant UI ---
  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  // --- Sync localBag with Redux items ---
  useEffect(() => {
    if (items) {
      setLocalBag(items.map((i) => i.productid));
    }
  }, [items]);

  // --- Fetch data initially ---
  useEffect(() => {
    if (!categoryIdNum) return;

    dispatch(
      getMedicinesByCategoryId({
        categoryId: categoryIdNum,
        url: currentUrl || undefined,
      })
    );

    dispatch(getCategories());
  }, [categoryIdNum, currentUrl, dispatch]);

  // --- Merge guest cart ---
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id, mergeGuestCart]);

  useEffect(() => {
    if (!loading && pageLoading) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
        setPageLoading(false);
      }, 100);
    }
  }, [loading, pageLoading]);

  // --- Filter products (derived from stable finalShuffledList) ---
  // const filteredMedicines = useMemo(() => {
  //   if (!searchTerm) return finalShuffledList;
  //   const lower = searchTerm.toLowerCase();
  //   return finalShuffledList.filter((med) =>
  //     (med.ProductName || "").toLowerCase().includes(lower)
  //   );
  // }, [finalShuffledList, searchTerm]);

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
    const id = item.product_id;

    // 🔥 start processing
    // setProcessingIds((prev) => [...prev, id]);
    // ✅ OPTIMISTIC UPDATE
    setLocalBag((prev) => [...new Set([...prev, id])]);

    try {
      if (buyer?.id) {
        await addItem({
          id: 0,
          buyer_id: buyer?.id,
          product_id: item.product_id,
          quantity: 1,
        } as HealthBag);
      } else {
        const newItem = {
          id: 0,
          productid: item.product_id,
          qty: 1,

          // 🔥 STORE FULL DATA
          name: item.ProductName || item.productname,
          manufacturer: item.Manufacturer || item.manufacturer,
          pack_size: item.PackSize || item.pack_size,
          mrp: Number(item.MRP ?? item.mrp ?? 0),
          discount: Number(item.Discount ?? item.discount ?? 0),
          image: item.DefaultImageURL || item.medicine_image || null,
        };

        const cart = JSON.parse(localStorage.getItem("healthbag") || "[]");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const exists = cart.find((i: any) => i.productid === item.product_id);

        let updated;

        if (exists) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          updated = cart.map((i: any) =>
            i.productid === item.product_id ? { ...i, qty: i.qty + 1 } : i
          );
        } else {
          updated = [...cart, newItem];
        }

        localStorage.setItem("healthbag", JSON.stringify(updated));
        // setGuestItems(updated);
        dispatch(loadLocalHealthBag());
      }
    } catch (err) {
      console.error("Add failed:", err);
      setLocalBag((prev) => prev.filter((pid) => pid !== id));
    } finally {
      // ✅ sabse important fix
      setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  const handleRemove = async (productId: number) => {
    // setProcessingIds((prev) => [...prev, productId]);
    setLocalBag((prev) => prev.filter((id) => id !== productId));

    try {
      if (buyer?.id) {
        await removeItem(productId);
      } else {
        // ✅ ALWAYS fresh data lo
        const cart = JSON.parse(localStorage.getItem("healthbag") || "[]");

        const updated = cart.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) => (item.productid ?? item.product_id) !== productId
        );

        localStorage.setItem("healthbag", JSON.stringify(updated));

        setGuestItems(updated); // optional but ok
        dispatch(loadLocalHealthBag());
      }
    } catch (err) {
      // rollback
      setLocalBag((prev) => [...prev, productId]);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleClick = (product_id: number) => {
    router.push(
      `/product-details/${encodeId(product_id)}?cat=${encodeId(categoryIdNum!)}`
    );
  };

  const isInitialLoading = loading || pageLoading;

  return (
    <>
      <div className="page-wrapper">
        {/* <SiteHeader /> */}

        <div className="body_wrap">
          <div className="body_right">
            <div className="body_content">
              {/* SEARCH */}
              {/* TITLE + SEARCH IN SAME ROW */}
              <div className="row align-items-center mb-3">
                {/* LEFT SIDE : PRODUCT NAME */}
                <div className="col-md-9">
                  <div className="pageTitle mt-3 mb-3">
                    <Image
                      src={"/images/favicon.png"}
                      alt=""
                      width={30}
                      height={30}
                    />{" "}
                    {categoryName || "Loading..."}
                  </div>
                </div>

                {/* RIGHT SIDE : SEARCH BOX */}
                {/* <div className="col-md-3">
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
                </div> */}
              </div>
              {/* First time loader */}
              {/* {loading && (
                <div className="text-center my-4">
                  <TncLoader />
                </div>
              )} */}
              <div className="pd_list">
                {isInitialLoading ? (
                  <div
                    style={{
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 9999,
                    }}
                  >
                    <TncLoader />
                  </div>
                ) : medicines.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  medicines.map((item, index) => {
                    const mrpRaw = item.MRP ?? item.mrp ?? 0;
                    const parsedMrp = Number(mrpRaw);
                    const baseMrp =
                      Number.isFinite(parsedMrp) && parsedMrp > 0
                        ? parsedMrp
                        : 275;
                    // 🔥 FORMAT FUNCTION
                    const formatPrice = (num: number) => {
                      return Number(num.toFixed(2)).toString();
                    };
                    // 👉 formatted MRP
                    const mrp = Number(baseMrp.toFixed(2));
                    const formattedMrp = formatPrice(mrp);
                    // 👉 discount
                    const discount = parseFloat(item.Discount || "0") || 0;
                    // 👉 discounted price
                    const discountedPriceRaw = mrp - (mrp * discount) / 100;
                    const formattedDiscountedPrice =
                      formatPrice(discountedPriceRaw);

                    const images = item.DefaultImageURL;
                    const defaultImg = Array.isArray(images)
                      ? images.find((img) => img.default_image === 1)
                      : null;
                    const imageUrl = defaultImg?.document
                      ? `${mediaBase}${defaultImg.document}`
                      : "/images/tnc-default.png";

                    const isInBag = localBag.includes(item.product_id);

                    return isMobile ? (
                      // 💻 DESKTOP/TABLET → CARD DESIGN (Reusable Component 🔥)
                      <ProductCardUI
                        key={`${item.product_id}-${index}`}
                        image={imageUrl}
                        name={item.ProductName}
                        manufacturer={item.Manufacturer}
                        packSize={item.pack_size} // generic nahi h → skip
                        price={formattedDiscountedPrice}
                        mrp={formattedMrp}
                        discount={discount}
                        showRx={false}
                        isInCart={isInBag}
                        loading={processingIds.includes(item.product_id)}
                        onAdd={() => handleAdd(item)}
                        onRemove={() => handleRemove(item.product_id)}
                        onClick={() => handleClick(item.product_id)}
                      />
                    ) : (
                      <div
                        className="pd_box shadow"
                        key={`${item.product_id}-${index}`}
                        style={{ boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)" }}
                      >
                        <div className="pd_img">
                          <Image
                            src={imageUrl}
                            alt=""
                            width={200}
                            height={200}
                            sizes="(max-width: 768px) 50vw, 200px"
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
                              {item.ProductName || ""}
                            </h3>
                            <h6 className="pd-title fw-bold">
                              {item.Manufacturer || ""}
                            </h6>

                            <div className="pd_price">
                              <span className="new_price">
                                ₹{formattedDiscountedPrice}
                              </span>
                              <span className="old_price">
                                <del>MRP ₹{formattedMrp}</del> {discount}% off
                              </span>
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
              </div>
              {medicines.length > 0 && !loading && nextUrl && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination
                    currentPage={page}
                    hasNext={!!nextUrl}
                    hasPrev={page > 1}
                    onPageChange={(newPage) => {
                      setPageLoading(true);

                      // 🔥 CLEAR OLD DATA
                      dispatch(resetMedicinesList());

                      if (newPage > page && nextUrl) {
                        setPrevStack((prev) => [...prev, currentUrl || ""]);
                        setCurrentUrl(nextUrl);
                        setPage(newPage);
                      }

                      if (newPage < page && prevStack.length > 0) {
                        const lastUrl = prevStack[prevStack.length - 1];

                        setPrevStack((prev) => prev.slice(0, -1));
                        setCurrentUrl(lastUrl || null);
                        setPage(newPage);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
