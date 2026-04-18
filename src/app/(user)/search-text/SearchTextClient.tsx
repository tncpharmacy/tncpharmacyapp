"use client";

export const dynamic = "force-dynamic";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import { useRouter, useSearchParams } from "next/navigation";
import SiteHeader from "@/app/(user)/components/header/header";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import Footer from "@/app/(user)/components/footer/footer";
import { Image } from "react-bootstrap";
import { HealthBag } from "@/types/healthBag";
import { Medicine } from "@/types/medicine";
import { encodeId } from "@/lib/utils/encodeDecode";
import TncLoader from "@/app/components/TncLoader/TncLoader";
import { loadLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";
import Pagination from "@/app/components/Pagination/Pagination";
import ProductCardUI from "../components/MedicineCard/ProductCardUI";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SearchTextClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const param = useSearchParams();
  const searchText = param.get("text") || "";

  // STATES
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // first load
  const [loadingMore, setLoadingMore] = useState(false); // scroll load
  // for pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [prevStack, setPrevStack] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(false);

  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [guestItems, setGuestItems] = useState<any[]>([]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768); // mobile breakpoint
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // API SEARCH CALL (MAIN)
  useEffect(() => {
    if (!searchText) return;

    const load = async () => {
      setLoading(true);

      try {
        const url = currentUrl
          ? currentUrl
          : `${apiBase}/website/product/search/?text=${searchText}`;

        const res = await fetch(url);
        const data = await res.json();

        setResults(data.data || []);
        setNextUrl(data.next || null);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [searchText, currentUrl]);

  useEffect(() => {
    setCurrentUrl(null);
    setPage(1);
  }, [searchText]);

  // SYNC HEALTH BAG
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
      window.scrollTo({ top: 0, behavior: "auto" });
      setPageLoading(false);
    }
  }, [loading, pageLoading]);

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

  const handleCombinedSelect = (item: Medicine) => {
    const path =
      item.category_id === 1
        ? `/medicines-details/${encodeId(item.id)}`
        : `/product-details/${encodeId(item.id)}`;

    router.push(path);
  };

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
                    {searchText || "Loading..."}
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
              <div className="pd_list">
                {loading || pageLoading ? (
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
                ) : results.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  results.map((item, index) => {
                    const pid = item.product_id ?? item.id;

                    const mrpRaw =
                      item.MRP ?? item.mrp ?? item.Mrp ?? item.price ?? 0;

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

                    const img = item.primary_image?.document
                      ? item.primary_image.document.startsWith("http")
                        ? item.primary_image.document
                        : `${mediaBase}${item.primary_image.document}`
                      : "/images/tnc-default.png";

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
                        image={img}
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
                        onClick={() => handleCombinedSelect(item)}
                      />
                    ) : (
                      <div
                        className="pd_box shadow"
                        key={`${item.id}-${index}`}
                      >
                        <div className="pd_img">
                          <Image
                            src={img}
                            alt=""
                            style={{
                              height: "220px",
                              objectFit: "contain",
                              opacity:
                                img === "/images/tnc-default.png" ? 0.3 : 1,
                            }}
                          />
                        </div>

                        <div className="pd_content">
                          <h3
                            className="pd-title hover-link"
                            onClick={() => handleCombinedSelect(item)}
                          >
                            {item.medicine_name}
                          </h3>
                          <h6 className="pd-title fw-bold">
                            {item.manufacturer_name}
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

                          <button
                            className={`btn-1 btn-HO ${
                              isInBag ? "remove" : "add"
                            }`}
                            disabled={processingIds.includes(item.product_id)}
                            onClick={() =>
                              isInBag ? handleRemove(pid) : handleAdd(item)
                            }
                          >
                            {isInBag ? "REMOVE" : "ADD"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {results.length > 0 && !loading && nextUrl && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination
                    currentPage={page}
                    hasNext={!!nextUrl}
                    hasPrev={page > 1}
                    onPageChange={(newPage) => {
                      setPageLoading(true);
                      setResults([]);
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
