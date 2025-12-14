"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import { useRouter, useSearchParams } from "next/navigation";
import SiteHeader from "@/app/user/components/header/header";
import { useAppSelector } from "@/lib/hooks";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import Footer from "@/app/user/components/footer/footer";
import { Image } from "react-bootstrap";
import { HealthBag } from "@/types/healthBag";
import { Medicine } from "@/types/medicine";
import { encodeId } from "@/lib/utils/encodeDecode";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function SearchTextClient() {
  const router = useRouter();
  const param = useSearchParams();
  const searchText = param.get("text") || "";

  // -----------------------------
  // STATES
  // -----------------------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState(""); // page input filter
  const [limit, setLimit] = useState(20); // infinite-scroll limit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [visibleList, setVisibleList] = useState<any[]>([]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredRef = useRef<any[]>([]);

  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  // -----------------------------
  // API SEARCH CALL (MAIN)
  // -----------------------------
  useEffect(() => {
    if (!searchText) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.tncpharmacy.in/api/website/product/search/?text=${searchText}`
        );
        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];

        setResults(list);
        setLimit(20); // reset paging
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [searchText]);

  // -----------------------------
  // SYNC HEALTH BAG
  // -----------------------------
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

  // -----------------------------
  // PAGE LOCAL FILTER
  // -----------------------------
  const filteredList = useMemo(() => {
    const val = searchTerm.toLowerCase();
    return results.filter((item) =>
      (item.ProductName || item.medicine_name || "").toLowerCase().includes(val)
    );
  }, [results, searchTerm]);

  // -----------------------------
  // UPDATE VISIBLE ITEMS (PAGINATION)
  // -----------------------------
  useEffect(() => {
    const next = filteredList.slice(0, limit);

    setVisibleList(next);

    filteredRef.current = filteredList; // actual total list
  }, [filteredList, limit]);

  // -----------------------------
  // INFINITE SCROLL
  // -----------------------------
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        const total = filteredRef.current.length;

        if (limit < total) {
          setLimit((prev) => prev + 20);
        }
      },
      {
        root: null,
        threshold: 0.2,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [filteredList, limit]);

  // --------------------------
  // ADD / REMOVE CART
  // --------------------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAdd = async (item: any) => {
    const pid = item.product_id ?? item.id;

    setLocalBag((prev) => [...prev, pid]);
    setProcessingIds((prev) => [...prev, pid]);

    try {
      await addItem({
        id: 0,
        buyer_id: buyer?.id || 0,
        product_id: pid,
        quantity: 1,
      } as HealthBag);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== pid));
    }
  };

  const handleRemove = async (pid: number) => {
    setProcessingIds((prev) => [...prev, pid]);

    await removeItem(pid);

    setProcessingIds((prev) => prev.filter((id) => id !== pid));
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
        <SiteHeader />

        <div className="body_wrap">
          <div className="body_right">
            <div className="body_content">
              <div className="pageTitle">
                <Image src={"/images/favicon.png"} alt="" /> Product:{" "}
                {searchText}
              </div>

              {/* PAGE SEARCH INPUT */}
              <div className="row">
                <div className="col-md-12">
                  <div className="search_query">
                    <a className="query_search_btn">
                      <i className="bi bi-search"></i>
                    </a>
                    <input
                      type="text"
                      className="txt1 my-box"
                      placeholder="Search product within results..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setLimit(20);
                      }}
                    />
                  </div>
                </div>
              </div>

              {loading && (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary"></div>
                </div>
              )}

              <div className="pd_list">
                {!loading &&
                  visibleList.map((item) => {
                    const pid = item.product_id ?? item.id;

                    const mrp = item.mrp || 0;
                    const hasValidMrp =
                      mrp !== null &&
                      mrp !== undefined &&
                      mrp !== 0 &&
                      Number(mrp) > 0;
                    const discount = parseFloat(item.Discount) || 0;
                    const discounted = Math.round(mrp - (mrp * discount) / 100);

                    const img = item.primary_image?.document
                      ? item.primary_image.document.startsWith("http")
                        ? item.primary_image.document
                        : `${mediaBase}${item.primary_image.document}`
                      : "/images/tnc-default.png";

                    // 🟩 Correct isInBag check
                    const isInBag =
                      localBag.includes(pid) ||
                      items.some(
                        (i) => i.productid === pid || i.product_id === pid
                      );

                    return (
                      <div className="pd_box shadow" key={item.id}>
                        <div className="pd_img">
                          <Image
                            src={img}
                            alt={item.medicine_name}
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
                          {!hasValidMrp ? (
                            <p className="text-danger fw-bold">OUT OF STOCK</p>
                          ) : (
                            <div className="pd_price">
                              <span className="new_price">₹{discounted}</span>
                              {mrp > 0 && (
                                <span className="old_price">
                                  <del>MRP ₹{mrp}</del> {discount}% off
                                </span>
                              )}
                            </div>
                          )}

                          <button
                            className={`btn-1 btn-HO ${
                              isInBag ? "remove" : "add"
                            }`}
                            disabled={
                              !hasValidMrp ||
                              processingIds.includes(item.product_id)
                            }
                            style={{
                              opacity: !hasValidMrp ? 0.5 : 1,
                              cursor: !hasValidMrp ? "not-allowed" : "pointer",
                              pointerEvents: !hasValidMrp ? "none" : "auto",
                            }}
                            onClick={() =>
                              isInBag ? handleRemove(pid) : handleAdd(item)
                            }
                          >
                            {isInBag ? "REMOVE" : "ADD"}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {/* SPACER + OBSERVER */}
                <div style={{ height: 200 }} />
                <div ref={loadMoreRef} style={{ height: 20 }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
