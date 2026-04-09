"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../../css/site-style.css";
import "../../../css/user-style.css";
import { useRouter } from "next/navigation";
import { encodeId, decodeId } from "@/lib/utils/encodeDecode";
import SiteHeader from "@/app/user/components/header/header";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getCategoryIdBySubcategory,
  resetMedicinesList,
} from "@/lib/features/medicineSlice/medicineSlice";
import { Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import Footer from "@/app/user/components/footer/footer";
import { useShuffledProduct } from "@/lib/hooks/useShuffledProduct";
import { HealthBag } from "@/types/healthBag";
import TncLoader from "@/app/components/TncLoader/TncLoader";
import { loadLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";
import Pagination from "@/app/components/Pagination/Pagination";
import ProductCardUI from "@/app/user/components/MedicineCard/ProductCardUI";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function AllProducts() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [guestItems, setGuestItems] = useState<any[]>([]);
  // for pagination
  const [page, setPage] = useState(1);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [prevStack, setPrevStack] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(false);

  // 🔹 PARAMS DECODE
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
  const { next: nextUrl } = useAppSelector((state) => state.medicine);
  const { loading } = useAppSelector((state) => state.medicine);
  const { list: categories } = useAppSelector((state) => state.category);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768); // mobile breakpoint
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

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

  const finalShuffledList = useMemo(() => {
    return [...uniqueMedicines].sort(() => Math.random() - 0.5);
  }, [uniqueMedicines]);

  // -------------------------------
  // 🔹 CATEGORY NAME
  // -------------------------------
  const categoryName =
    categories.find((cat) => cat.id === categoryIdNum)?.category_name ||
    "Unknown Category";

  // Fetch categories & medicines
  useEffect(() => {
    if (!categoryIdNum || !subCategoryIdNum) return; // 🔥 guard

    dispatch(
      getCategoryIdBySubcategory({
        categoryId: categoryIdNum,
        subCategoryId: subCategoryIdNum,
        url: currentUrl || undefined,
      })
    );

    dispatch(getCategories());
  }, [dispatch, categoryIdNum, subCategoryIdNum, currentUrl]);

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

  useEffect(() => {
    if (!loading && pageLoading) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
        setPageLoading(false);
      }, 100);
    }
  }, [loading, pageLoading]);

  // -------------------------------
  // 🔹 FILTER MEDICINES
  // -------------------------------
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return medicines;

    const lower = searchTerm.toLowerCase();

    return medicines.filter((med) =>
      (med.ProductName || "").toLowerCase().includes(lower)
    );
  }, [medicines, searchTerm]);

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
        image: item.DefaultImageURL || item.medicine_image || null, // 🔥 important
      };

      const exists = guestItems.find((i) => i.productid === item.product_id);

      let updated;

      if (exists) {
        updated = guestItems.map((i) =>
          i.productid === item.product_id ? { ...i, qty: i.qty + 1 } : i
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
          (item) => (item.productid ?? item.product_id) !== productId
        );

        localStorage.setItem("healthbag", JSON.stringify(updated));
        setGuestItems(updated);
        dispatch(loadLocalHealthBag());
      }
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleClick = (product_id: number) => {
    router.push(`/product-details/${encodeId(product_id)}`);
  };

  const isInitialLoading = loading || pageLoading;
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
                  <div className="pageTitle mt-3 mb-3">
                    <Image src={"/images/favicon.png"} alt="" /> Product:{" "}
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
              {/* PRODUCT LIST */}
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
                ) : filteredMedicines.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  filteredMedicines.map((item, index) => {
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

                    const imageUrl = item.DefaultImageURL
                      ? item.DefaultImageURL.startsWith("http")
                        ? item.DefaultImageURL
                        : `${mediaBase}${item.DefaultImageURL}`
                      : "/images/tnc-default.png";

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const getProductId = (item: any) => {
                      return item.productid ?? item.product_id ?? item.id;
                    };
                    const source = buyer?.id ? items : guestItems;

                    const isInBag = source.some(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (i: any) => getProductId(i) === item.product_id
                    );

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
                        style={{ boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}
                      >
                        <div className="pd_img">
                          <Image
                            src={imageUrl}
                            alt=""
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
                                ₹{formattedDiscountedPrice}
                              </span>
                              {mrp > 0 && (
                                <span className="old_price">
                                  <del>MRP ₹{formattedMrp}</del> {discount}% off
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
              </div>
              {filteredMedicines.length > 0 && !loading && nextUrl && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination
                    currentPage={page}
                    hasNext={!!nextUrl}
                    hasPrev={page > 1}
                    onPageChange={(newPage) => {
                      setPageLoading(true);
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
