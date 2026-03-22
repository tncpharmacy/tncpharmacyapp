"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../css/header-style.css";
import "../../../styles/style-login.css";
import { Image } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Category } from "@/types/category";
import { Medicine } from "@/types/medicine";
import PrescriptionUploadModal from "@/app/user/components/PrescriptionUploadModal/PrescriptionUploadModal";
import Login from "@/app/admin-login/page";
import BuyerLoginModal from "@/app/buyer-login/page";
import { encodeId } from "@/lib/utils/encodeDecode";
import { getCategoriesList } from "@/lib/features/categorySlice/categorySlice";
import {
  getCategoryIdBySubcategory,
  getProductList,
  getSearchSuggestions,
} from "@/lib/features/medicineSlice/medicineSlice";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { buyerLogout } from "@/lib/features/buyerSlice/buyerSlice";
import { getSubcategoriesList } from "@/lib/features/subCategorySlice/subCategorySlice";
import { fetchHealthBag } from "@/lib/api/healthBag";
import { loadLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";

type SearchMatch = {
  _matchType: "medicine" | "generic" | "manufacturer";
  data: Medicine;
};
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

const SiteHeader = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const buyer = useAppSelector((state) => state.buyer.buyer);
  const userId = buyer?.id || null;
  const { items } = useHealthBag({ userId });

  const [localCount, setLocalCount] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showBuyerLogin, setShowBuyerLogin] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { list: categories } = useAppSelector((state) => state.category);
  const { listAll: subcategories } = useAppSelector(
    (state) => state.subcategory
  );
  const [shuffledCategories, setShuffledCategories] = useState<Category[]>([]);
  const [headerSearch, setHeaderSearch] = useState("");
  const [isArrowNavigation, setIsArrowNavigation] = useState(false);
  const isSelecting = useRef(false);
  const listRef = useRef<HTMLUListElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // for mobile view state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);
  // new state for search api
  const [groupedResults, setGroupedResults] = useState<SearchMatch[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showList, setShowList] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    const search = headerSearch.trim().toLowerCase();

    if (!search) {
      setGroupedResults([]);
      setShowList(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await dispatch(getSearchSuggestions(search)).unwrap();

        const list: Medicine[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];

        // ---- GROUPING ----
        const medicineMatches: SearchMatch[] = [];
        const genericMatches: SearchMatch[] = [];
        const manufacturerMatches: SearchMatch[] = [];

        const manufacturerSet = new Set();

        list.forEach((item) => {
          const med = item.medicine_name?.toLowerCase() || "";
          const gen = item.generic_name?.toLowerCase() || "";
          const man = item.manufacturer_name?.toLowerCase() || "";

          if (med.startsWith(search)) {
            medicineMatches.push({ _matchType: "medicine", data: item });
          } else if (gen.startsWith(search)) {
            genericMatches.push({ _matchType: "generic", data: item });
          } else if (man.startsWith(search)) {
            if (!manufacturerSet.has(man)) {
              manufacturerSet.add(man);

              manufacturerMatches.push({
                _matchType: "manufacturer",
                data: item,
              });
            }
          }
        });

        setGroupedResults([
          ...medicineMatches,
          ...genericMatches,
          ...manufacturerMatches,
        ]);

        setShowList(list.length > 0);
      } catch (err) {
        console.error("Search API error:", err);
        setGroupedResults([]);
        setShowList(false);
      }
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [headerSearch, dispatch]);

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    setMounted(true);
    dispatch(getCategoriesList());
    dispatch(getSubcategoriesList());
  }, [dispatch]);

  useEffect(() => {
    if (!buyer?.id) {
      dispatch(loadLocalHealthBag()); // ✅ Load LS items into Redux when not logged in
    }
  }, [buyer?.id, dispatch]);

  useEffect(() => {
    if (!listRef.current) return;
    if (highlightIndex < 0) return;

    const list = listRef.current;
    const item = list.children[highlightIndex] as HTMLElement;

    if (!item) return;

    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    // If moving DOWN and item goes out of view → scroll
    if (itemRect.bottom > listRect.bottom) {
      list.scrollTop += itemRect.bottom - listRect.bottom;
    }

    // If moving UP and item goes above → scroll
    if (itemRect.top < listRect.top) {
      list.scrollTop -= listRect.top - itemRect.top;
    }
  }, [highlightIndex]);

  // useEffect(() => {
  //   console.log("🧮 Updated count from items:", items.length);
  // }, [items]);

  useEffect(() => {
    if (!mounted) return;
    const update = async () => {
      try {
        if (userId) {
          const res = await fetchHealthBag(userId);
          setLocalCount(res.data?.length || 0);
        } else {
          const guest = localStorage.getItem("healthBagGuest");
          const guestItems = guest ? JSON.parse(guest) : [];
          setLocalCount(guestItems.length);
        }
      } catch (err) {
        console.error("Error updating count:", err);
      }
    };
    window.addEventListener("healthBagUpdated", update);
    update();
    return () => window.removeEventListener("healthBagUpdated", update);
  }, [userId, mounted]);

  // ---------- CATEGORY SHUFFLE ----------
  useEffect(() => {
    if (!categories || categories.length === 0) return;
    const savedShuffle = localStorage.getItem("shuffledMenu");
    if (savedShuffle) {
      setShuffledCategories(JSON.parse(savedShuffle));
      return;
    }
    const shuffled = [...categories].sort(() => Math.random() - 0.5);
    setShuffledCategories(shuffled);
    localStorage.setItem("shuffledMenu", JSON.stringify(shuffled));
  }, [categories]);

  useEffect(() => {
    const handleReload = () => localStorage.removeItem("shuffledMenu");
    window.addEventListener("beforeunload", handleReload);
    return () => window.removeEventListener("beforeunload", handleReload);
  }, []);

  // ---------- LOGOUT ----------
  const handleLogout = () => dispatch(buyerLogout());

  const handleProductSelect = (item: Medicine) => {
    setShowList(false);
    setHeaderSearch("");
    setHighlightIndex(-1);

    const path =
      item.category_id === 1
        ? `/medicines-details/${encodeId(item.id)}`
        : `/product-details/${encodeId(item.id)}`;

    router.push(path);
  };
  const handleSearchSelect = (item: SearchMatch) => {
    setShowList(false);
    setHeaderSearch("");
    setHighlightIndex(-1);

    // MEDICINE CLICK
    if (item._matchType === "medicine") {
      const med = item.data;

      const path =
        med.category_id === 1
          ? `/medicines-details/${encodeId(med.id)}`
          : `/product-details/${encodeId(med.id)}`;

      router.push(path);
    }

    // GENERIC CLICK
    if (item._matchType === "generic" && item.data.generic_id !== null) {
      router.push(`/all-generic/${encodeId(item.data.generic_id)}`);
    }

    if (
      item._matchType === "manufacturer" &&
      item.data.manufacturer_id !== null
    ) {
      router.push(`/all-manufacturer/${encodeId(item.data.manufacturer_id)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList || groupedResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < groupedResults.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : groupedResults.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (highlightIndex >= 0) {
        //handleProductSelect(groupedResults[highlightIndex].data);
        handleSearchSelect(groupedResults[highlightIndex]);
        return;
      }

      if (headerSearch.trim()) {
        router.push(`/search-text?text=${encodeURIComponent(headerSearch)}`);
      }
    }
  };

  const handleCategoryClick = async (
    categoryId: number,
    subCategoryId: number
  ) => {
    try {
      await dispatch(getCategoryIdBySubcategory({ categoryId, subCategoryId }));
      router.push(
        `/all-products/${encodeId(categoryId)}/${encodeId(subCategoryId)}`
      );
    } catch (error) {
      console.error("Error navigating:", error);
    }
  };
  useEffect(() => {
    const header = document.getElementById("header");
    if (!header) return;

    const h = header.offsetHeight;
    document.body.style.paddingTop = h + "px";
  }, []);

  // Close list on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowList(false);
        setHighlightIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCategory = (categoryId: number) => {
    setOpenCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const filteredCategories = shuffledCategories.filter(
    (cat) => cat.category_name !== "Medicines" && cat.status === "Active"
  );

  console.log("filteredCategories", filteredCategories);
  // ---------- RENDER ----------
  return (
    <header id="header">
      <div className="mid_header">
        <div className="container">
          <div className="header_wrap">
            <Link href="/" className="logo">
              <Image src="/images/logo.png" alt="Logo" />
            </Link>

            {/* ---------- SEARCH ---------- */}
            <div className="search_query header_search_query" ref={wrapperRef}>
              <a className="query_search_btn" href="javascript:void(0)">
                <i className="bi bi-search"></i>
              </a>
              <input
                type="text"
                className="header_search_input"
                placeholder="Search for medicines & products..."
                value={headerSearch}
                onChange={(e) => {
                  setIsArrowNavigation(false); // 🔥 typing शुरू → filter allowed
                  setHeaderSearch(e.target.value);
                  setHighlightIndex(-1);
                }}
                onFocus={() => headerSearch && setShowList(true)}
                onKeyDown={handleKeyDown}
              />

              {showList && groupedResults.length > 0 && (
                <ul
                  ref={listRef}
                  style={{
                    position: "absolute",
                    top: "70%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    maxHeight: "250px",
                    overflowY: "auto",
                    marginTop: "5px",
                    zIndex: 1000,
                    listStyle: "none",
                    padding: 0,
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  {groupedResults.map((item, index) => (
                    <li
                      key={`${item.data.id}-${index}`}
                      //onClick={() => handleProductSelect(item.data)}
                      onClick={() => handleSearchSelect(item)}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setHighlightIndex(index)}
                      style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        backgroundColor:
                          index === highlightIndex
                            ? "rgb(237 240 243)"
                            : "#fff",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {/* --- ROW 1: Title + Right Label --- */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                          }}
                        >
                          {/* LEFT SIDE TEXT */}
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: "14px",
                              color: "#000",
                              marginRight: "10px",
                              flex: 1,
                              lineHeight: "1.3",
                            }}
                          >
                            {item._matchType === "medicine" &&
                              item.data.medicine_name}
                            {item._matchType === "generic" &&
                              item.data.generic_name}
                            {item._matchType === "manufacturer" &&
                              item.data.manufacturer_name}
                          </span>

                          {/* RIGHT SIDE CONTENT */}
                          {item._matchType === "medicine" ? (
                            <span style={{ whiteSpace: "nowrap" }}>
                              <span
                                style={{
                                  color: "green",
                                  fontWeight: 600,
                                  fontSize: "14px",
                                }}
                              >
                                ₹
                                {(item.data.mrp ?? 0) -
                                  ((item.data.mrp ?? 0) *
                                    Number(item.data.discount ?? 0)) /
                                    100}
                              </span>

                              <span
                                style={{
                                  marginLeft: 6,
                                  textDecoration: "line-through",
                                  color: "#777",
                                  fontSize: "12px",
                                }}
                              >
                                MRP ₹{item.data.mrp}
                              </span>
                            </span>
                          ) : (
                            <span
                              style={{
                                color: "red",
                                fontWeight: 600,
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item._matchType === "generic"
                                ? "in Salt Composition"
                                : "in Manufacturer"}
                            </span>
                          )}
                        </div>

                        {/* --- ROW 2 (ONLY FOR MEDICINE) --- */}
                        {item._matchType === "medicine" && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "12px",
                              color: "#555",
                              marginBottom: "6px",
                            }}
                          >
                            <span>{item.data.pack_size}</span>

                            <span style={{ color: "red", fontWeight: 600 }}>
                              {item.data.discount}% OFF
                            </span>
                          </div>
                        )}

                        {/* --- ROW 3 (ONLY FOR MEDICINE) --- */}
                        {item._matchType === "medicine" && (
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "green",
                              lineHeight: "1.3",
                            }}
                          >
                            {item.data.manufacturer_name}
                          </div>
                        )}
                      </div>
                      {/* )} */}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ---------- RIGHT SIDE ---------- */}
            <ul className="user_right">
              <li>
                <div className="dropdown-user">
                  <span className="user_p dropdownbtn">
                    <i>
                      <Image
                        className="user_icon"
                        src="/images/icons/icon-profile.svg"
                        alt="Profile"
                      />
                    </i>
                    Account
                  </span>
                  <div
                    className="dropdown-user-content"
                    style={{ zIndex: "9999" }}
                  >
                    {!mounted ? (
                      <p>
                        <b>Welcome</b>
                        <br />
                        To access account & manage orders
                      </p>
                    ) : buyer ? (
                      <div>
                        <p>
                          <b>Welcome</b>
                          <br />
                          {buyer?.name || "User"}
                        </p>
                        <hr className="border-secondary" />
                        <Link href="/profile?tab=profile">My Account</Link>
                        <Link href="/profile?tab=order">My Orders</Link>
                        <Link href="/profile?tab=address">My Address</Link>
                        <button className="btn1 mt-2" onClick={handleLogout}>
                          Logout
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p>
                          <b>Welcome</b>
                          <br />
                          To access account & manage orders
                        </p>
                        <div className="d-flex">
                          <button
                            className="btn1 me-2"
                            onClick={() => setShowLogin(true)}
                          >
                            Admin Login
                          </button>
                          <Login
                            show={showLogin}
                            handleClose={() => setShowLogin(false)}
                          />
                          <button
                            className="btn1"
                            onClick={() => setShowBuyerLogin(true)}
                          >
                            Patient Login
                          </button>
                          <BuyerLoginModal
                            show={showBuyerLogin}
                            handleClose={() => setShowBuyerLogin(false)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>

              <li>
                <Link href="/health-bag">
                  <span className="user_p">
                    <i>
                      <Image
                        className="user_icon"
                        src="/images/icons/icon-cart.svg"
                        alt="Cart"
                      />
                      <span className="count">{items?.length || 0}</span>
                    </i>
                    Health Bag
                  </span>
                </Link>
              </li>
              <li className="mobileMenu">
                <span className="micon" onClick={() => setShowMobileMenu(true)}>
                  <i className="bi bi-grid-3x3-gap-fill"></i>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ---------- MENU ---------- */}
      <div className="menu_header">
        <div className="container">
          <ul className="main_menu">
            <li>
              <Link href="/all-medicine" className="link">
                All Medicine <i className="bi bi-grid-fill"></i>
              </Link>
            </li>

            {filteredCategories.slice(0, 5).map((cat, index) => {
              const filteredSubcategories = subcategories.filter(
                (sub) => String(sub.category_id) === String(cat.id)
              );
              return (
                <li key={`${cat.id}-${index}`}>
                  <Link href={`/all-product/${encodeId(cat.id)}`}>
                    {cat.category_name}
                  </Link>
                  <div className="megamenu-panel">
                    {filteredSubcategories.length > 0 ? (
                      <ul className="megamenu-list">
                        {filteredSubcategories.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href="#"
                              onClick={() =>
                                handleCategoryClick(cat.id, sub.id)
                              }
                            >
                              {sub.sub_category_name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="no-subcategories">
                        <li>No Subcategories</li>
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}

            {/* More Menu */}
            {shuffledCategories.length > 5 && (
              <li className="position-relative">
                <a href="#">More</a>
                <div className="megamenu-panel2">
                  <ul className="megamenu-list">
                    {filteredCategories.slice(5).map((cat) => (
                      <li key={cat.id}>
                        <Link href={`/all-product/${encodeId(cat.id)}`}>
                          {cat.category_name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            )}

            {/* Upload Prescription */}
            <li className="float-end">
              <button className="btn_uoload" onClick={() => setShowModal(true)}>
                <span>
                  Upload
                  <br /> Prescription
                </span>
                <Image
                  src="/images/icons/icon-upload.svg"
                  width={20}
                  height={20}
                  alt="Upload"
                />
              </button>
              <PrescriptionUploadModal
                show={showModal}
                handleClose={() => setShowModal(false)}
              />
            </li>
          </ul>
        </div>
      </div>
      {/* ---------- MOBILE SIDE MENU ---------- */}
      {showMobileMenu && (
        <>
          {/* Overlay */}
          <div
            className="mobile-menu-overlay"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Drawer */}
          <div className="mobile-side-menu">
            <div className="mobile-menu-header">
              <span>Hello, {buyer ? buyer.name : "Guest"}</span>
              <button
                className="btn btn-danger"
                onClick={() => setShowMobileMenu(false)}
              >
                ✕
              </button>
            </div>

            <ul className="mobile-menu-list">
              {/* {!buyer && (
                <li onClick={() => setShowBuyerLogin(true)}>Login / Sign Up</li>
              )} */}
              <li className="mobile-category">
                <div
                  className="category-title"
                  onClick={() => router.push("/all-medicine")}
                >
                  All Medicine
                </div>
              </li>

              {shuffledCategories
                .filter((c) => c.category_name !== "Medicines")
                .map((cat) => (
                  <li key={cat.id} className="mobile-category">
                    <div
                      className="category-title"
                      onClick={() => toggleCategory(cat.id)}
                    >
                      <span>{cat.category_name}</span>
                      <span>{openCategoryId === cat.id ? "▲" : "▼"}</span>
                    </div>

                    {openCategoryId === cat.id && (
                      <ul className="sub-menu">
                        {subcategories
                          .filter(
                            (s) => String(s.category_id) === String(cat.id)
                          )
                          .map((sub) => (
                            <li
                              key={sub.id}
                              onClick={() => {
                                setShowMobileMenu(false);
                                handleCategoryClick(cat.id, sub.id);
                              }}
                            >
                              {sub.sub_category_name}
                            </li>
                          ))}
                      </ul>
                    )}
                  </li>
                ))}
            </ul>
            {/* ---- Upload Prescription (Mobile) ---- */}
            <div className="mobile-upload-wrap">
              <button
                className="mobile-upload-btn"
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowModal(true); // PrescriptionUploadModal
                }}
              >
                <span>Upload Prescription</span>
                <Image
                  src="/images/icons/icon-upload.svg"
                  width={22}
                  height={22}
                  alt="Upload"
                />
              </button>
            </div>
          </div>
        </>
      )}
      <PrescriptionUploadModal
        show={showModal}
        handleClose={() => setShowModal(false)}
      />
    </header>
  );
};

export default SiteHeader;
