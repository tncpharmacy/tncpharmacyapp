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
} from "@/lib/features/medicineSlice/medicineSlice";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { buyerLogout } from "@/lib/features/buyerSlice/buyerSlice";
import { getSubcategoriesList } from "@/lib/features/subCategorySlice/subCategorySlice";
import { fetchHealthBag } from "@/lib/api/healthBag";
import { loadLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";

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
  const { medicines: productList } = useAppSelector((state) => state.medicine);

  const [shuffledCategories, setShuffledCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredList, setFilteredList] = useState<Medicine[]>([]);
  const [showList, setShowList] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const isSelecting = useRef(false);

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    setMounted(true);
    dispatch(getCategoriesList());
    dispatch(getSubcategoriesList());
  }, [dispatch]);

  // ---------- HANDLE CART COUNT ----------
  // useEffect(() => {
  //   setLocalCount(items.length);
  // }, [items, mounted]);

  useEffect(() => {
    if (!buyer?.id) {
      dispatch(loadLocalHealthBag()); // ✅ Load LS items into Redux when not logged in
    }
  }, [buyer?.id, dispatch]);

  useEffect(() => {
    console.log("🧮 Updated count from items:", items.length);
  }, [items]);

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

  // ---------- SEARCH ----------
  useEffect(() => {
    dispatch(getProductList());
  }, [dispatch]);

  useEffect(() => {
    if (isSelecting.current) {
      isSelecting.current = false;
      return;
    }

    if (searchTerm.trim() && productList?.length > 0) {
      const lower = searchTerm.toLowerCase();
      const filtered = productList.filter(
        (p) =>
          (p.medicine_name?.toLowerCase().includes(lower) ||
            p.Manufacturer?.toLowerCase().includes(lower)) ??
          false
      );
      setFilteredList(filtered.slice(0, 10));
      setShowList(true);
    } else {
      setShowList(false);
    }
  }, [searchTerm, productList]);

  const handleSelect = (product: Medicine) => {
    setSearchTerm(product.medicine_name);
    setShowList(false);
    const path =
      product.category_id === 1
        ? `/medicines-details/${encodeId(product.id)}`
        : `/product-details/${encodeId(product.id)}`;
    router.push(path);
  };

  const handleItemSelect = (item: Medicine) => {
    isSelecting.current = true;
    handleSelect(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList || filteredList.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filteredList.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredList.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < filteredList.length) {
        handleItemSelect(filteredList[highlightIndex]);
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
            <div className="search_query">
              <a className="query_search_btn" href="javascript:void(0)">
                <i className="bi bi-search"></i>
              </a>
              <input
                type="text"
                placeholder="Search for medicines & products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm && setShowList(true)}
                onKeyDown={handleKeyDown}
              />
              {showList && filteredList.length > 0 && (
                <ul
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
                  {filteredList.map((item, index) => {
                    const mrp = Number(item.MRP) || 0;
                    const discount = Number(item.discount) || 0;
                    const discountedPrice = Math.round(
                      mrp - (mrp * discount) / 100
                    );

                    return (
                      <li
                        key={item.id}
                        onClick={() => handleItemSelect(item)}
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
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          {(() => {
                            const mrp = Number(item.MRP) || 0;
                            const discount = Number(item.discount) || 0;
                            const discountedPrice = Math.round(
                              mrp - (mrp * discount) / 100
                            );

                            return (
                              <>
                                {/* ✅ ROW 1 */}
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "10px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontWeight: 600,
                                      fontSize: "14px",
                                      color: "#000",
                                      marginRight: "10px",
                                      flex: 1,
                                      lineHeight: "1.2",
                                    }}
                                  >
                                    {item.medicine_name}
                                  </span>

                                  <span style={{ whiteSpace: "nowrap" }}>
                                    <span
                                      style={{
                                        color: "green",
                                        fontWeight: 600,
                                        fontSize: "14px",
                                        lineHeight: "1.2",
                                      }}
                                    >
                                      ₹{discountedPrice}
                                    </span>
                                    <span
                                      style={{
                                        marginLeft: 6,
                                        textDecoration: "line-through",
                                        color: "#777",
                                        fontSize: "12px",
                                      }}
                                    >
                                      MRP ₹{mrp}
                                    </span>
                                  </span>
                                </div>

                                {/* ✅ ROW 2 */}
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "12px",
                                    color: "#555",
                                    marginBottom: "10px",
                                  }}
                                >
                                  <span>{item.pack_size}</span>
                                  <span
                                    style={{
                                      color: "rgba(var(--bs-danger-rgb)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {discount}% OFF
                                  </span>
                                </div>

                                {/* ✅ ROW 3 */}
                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "green",
                                    lineHeight: "1.3",
                                  }}
                                >
                                  {item.Manufacturer}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </li>
                    );
                  })}
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
                    style={{ zIndex: "5" }}
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
                        <Link href="/profile">My Account</Link>
                        <Link href="/buyer/orders">My Orders</Link>
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

            {shuffledCategories
              .filter((cat) => cat.category_name !== "Medicines")
              .slice(0, 5)
              .map((cat, index) => {
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
                    {shuffledCategories
                      .slice(5)
                      .filter((cat) => cat.category_name !== "Medicines")
                      .map((cat) => (
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
    </header>
  );
};

export default SiteHeader;
