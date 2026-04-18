"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../css/site-style.css";
import "../../css/user-style.css";
import { useRouter } from "next/navigation";
import { encodeId, decodeId } from "@/lib/utils/encodeDecode";
import SiteHeader from "@/app/(user)/components/header/header";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getMedicineByGenericId,
  getMedicinesByCategoryId,
  resetMedicinesList,
} from "@/lib/features/medicineSlice/medicineSlice";
import { Button, Image } from "react-bootstrap";
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

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function AllGeneric() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  const decodedId = decodeId(params.id as string);
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
    (state) => state.medicine.genericAlternativesMedicines || []
  );
  const nextUrl = useAppSelector((state) => state.medicine.next);

  const { loading } = useAppSelector((state) => state.medicine);

  const { list: categories } = useAppSelector((state) => state.category);

  // --- CALL SHUFFLE HOOK AT TOP-LEVEL (ESLINT SAFE) ---
  const shuffledFromHook = useShuffledProduct(
    medicines,
    `product-page-category-${categoryIdNum}`
  );

  const finalShuffledList = medicines;

  const genericName = medicines?.[0]?.generic_name || "Loading...";
  const categoryName =
    categories.find((cat) => cat.id === categoryIdNum)?.category_name ||
    "Unknown Category";

  // --- Local states for instant UI ---
  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768); // mobile breakpoint
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);
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
      await dispatch(
        getMedicineByGenericId({
          id: categoryIdNum,
          url: currentUrl || undefined,
        })
      );
    };

    fetchData();
    dispatch(getCategories());
  }, [dispatch, categoryIdNum, currentUrl]);

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
  //     (med.medicine_name || "").toLowerCase().includes(lower)
  //   );
  // }, [finalShuffledList, searchTerm]);
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return medicines;

    const lower = searchTerm.toLowerCase();

    return medicines.filter((med) =>
      (med.medicine_name || "").toLowerCase().includes(lower)
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
        product_id: item.id,
        quantity: 1,
      } as HealthBag);
    } else {
      const newItem = {
        id: 0,
        productid: item.id,
        qty: 1,

        // 🔥 STORE FULL DATA
        name: item.ProductName || item.medicine_name,
        manufacturer: item.Manufacturer || item.manufacturer_name,
        pack_size: item.PackSize || item.pack_size,
        mrp: Number(item.MRP ?? item.mrp ?? 0),
        discount: Number(item.Discount ?? item.discount ?? 0),
        category_id: Number(item.category_id ?? 0),
        image: item.DefaultImageURL || item.medicine_image || null, // 🔥 important
      };

      const exists = guestItems.find((i) => i.productid === item.id);

      let updated;

      if (exists) {
        updated = guestItems.map((i) =>
          i.productid === item.id ? { ...i, qty: i.qty + 1 } : i
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (item: any) => {
    if (item.category_id === 1) {
      router.push(`/medicines-details/${encodeId(item.id)}`);
    } else {
      router.push(`/product-details/${encodeId(item.id)}`);
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getMedicineImage = (medicine: any) => {
    const images = medicine.DefaultImageURL || medicine.images;

    if (Array.isArray(images) && images.length > 0) {
      const primary =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        images.find((img: any) => img.default_image === 1) || images[0];

      return primary?.document
        ? `${mediaBase}${primary.document}`
        : "/images/tnc-default.png";
    }

    if (typeof medicine.primary_image === "string") {
      return medicine.primary_image;
    }

    return "/images/tnc-default.png";
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
                    <Image src={"/images/favicon.png"} alt="" />{" "}
                    {genericName || "Loading..."}
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
                    const discount = parseFloat(item.discount || "0") || 0;
                    // 👉 discounted price
                    const discountedPriceRaw = mrp - (mrp * discount) / 100;
                    const formattedDiscountedPrice =
                      formatPrice(discountedPriceRaw);

                    const imageUrl = getMedicineImage(item);

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const getProductId = (item: any) => {
                      return item.productid ?? item.product_id ?? item.id;
                    };
                    const source = buyer?.id ? items : guestItems;

                    const isInBag = source.some(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (i: any) => getProductId(i) === item.id
                    );

                    return isMobile ? (
                      // 💻 DESKTOP/TABLET → CARD DESIGN (Reusable Component 🔥)
                      <ProductCardUI
                        key={`${item.id}-${index}`}
                        image={imageUrl}
                        name={item.medicine_name}
                        manufacturer={item.manufacturer_name}
                        packSize={item.pack_size} // generic nahi h → skip
                        price={formattedDiscountedPrice}
                        mrp={formattedMrp}
                        discount={discount}
                        showRx={false}
                        isInCart={isInBag}
                        loading={processingIds.includes(item.id)}
                        onAdd={() => handleAdd(item)}
                        onRemove={() => handleRemove(item.id)}
                        onClick={() => handleClick(item)}
                      />
                    ) : (
                      <div
                        className="pd_box shadow"
                        key={`${item.id}-${index}`}
                        style={{ boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)" }}
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
              </div>
              {filteredMedicines.length > 0 && !loading && nextUrl && (
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
