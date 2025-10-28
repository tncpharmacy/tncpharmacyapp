"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../css/header-style.css";
import "../../../styles/style-login.css";
import { Image, Modal } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/features/authSlice/authSlice";
import { getCategoriesList } from "@/lib/features/categorySlice/categorySlice";
import { getSubcategories } from "@/lib/features/subCategorySlice/subCategorySlice";
import { Category } from "@/types/category";
import Link from "next/link";
import PrescriptionUploadModal from "@/app/user/components/PrescriptionUploadModal/PrescriptionUploadModal";
import Login from "@/app/admin-login/page";
import BuyerLoginModal from "@/app/buyer-login/page";
import { encodeId } from "@/lib/utils/encodeDecode";
import {
  getCategoryIdBySubcategory,
  getProductList,
} from "@/lib/features/medicineSlice/medicineSlice";
import { Medicine } from "@/types/medicine";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { buyerLogout } from "@/lib/features/buyerSlice/buyerSlice";

const SiteHeader = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showBuyerLogin, setShowBuyerLogin] = useState(false);
  const { list: categories } = useAppSelector((state) => state.category);
  const { list: subcategories } = useAppSelector((state) => state.subcategory);
  const { medicines: productList, loading } = useAppSelector(
    (state) => state.medicine
  );
  // search box related state
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredList, setFilteredList] = useState<Medicine[]>([]);
  const [showList, setShowList] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const isSelecting = useRef(false);

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [shuffledCategories, setShuffledCategories] = useState<Category[]>([]);

  const buyer = useAppSelector((state) => state.buyer.buyer);
  const userId = buyer?.id || null;
  const { items } = useHealthBag({ userId });

  const [localCount, setLocalCount] = useState(items.length);

  // whenever items change locally in this component
  useEffect(() => {
    setLocalCount(items.length);
  }, [items]);

  // listen to custom event
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      const guest = localStorage.getItem("healthBagGuest");
      const guestItems = guest ? JSON.parse(guest) : [];
      setLocalCount(guestItems.length);
    };

    window.addEventListener("healthBagUpdated", update);
    return () => window.removeEventListener("healthBagUpdated", update);
  }, []);

  useEffect(() => {
    dispatch(getCategoriesList());
    dispatch(getSubcategories());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(buyerLogout());
  };

  useEffect(() => {
    if (!searchTerm || searchTerm.length === 0) return;
    dispatch(getProductList());
  }, [dispatch, searchTerm]);

  // filter logic
  useEffect(() => {
    if (isSelecting.current) {
      isSelecting.current = false;
      return;
    }

    if (searchTerm.trim().length > 0 && productList?.length > 0) {
      const lower = searchTerm.toLowerCase();
      const filtered = productList.filter(
        (p) =>
          (p.medicine_name?.toLowerCase().includes(lower) ||
            p.Manufacturer?.toLowerCase().includes(lower)) ??
          false
      );
      setFilteredList(filtered.slice(0, 10));
      setShowList(true);
      setHighlightIndex(-1);
    } else {
      setShowList(false);
    }
  }, [searchTerm, productList]);

  // keyboard navigation
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
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < filteredList.length) {
        handleSelect(filteredList[highlightIndex]);
        setShowList(false);
      }
    }
  };

  // select function wrapper
  const handleItemSelect = (item: Medicine) => {
    isSelecting.current = true; // 👈 stop next filtering trigger
    handleSelect(item);
    setSearchTerm(item.medicine_name); // show selected item name
    setShowList(false); // close list
    setHighlightIndex(-1);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelect = (product: any) => {
    setSearchTerm(product.medicine_name);
    setShowList(false);
    if (product.category_id === 1) {
      router.push(`/medicines-details/${encodeId(product.id)}`);
    } else {
      router.push(`/product-details/${encodeId(product.id)}`);
    }
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const shuffled = [...categories].sort(() => Math.random() - 0.5);
    setShuffledCategories(shuffled);
  }, [categories]);

  const handleCategoryClick = async (
    categoryId: number,
    subCategoryId: number
  ) => {
    try {
      // 1️⃣ Redux action dispatch karo
      await dispatch(getCategoryIdBySubcategory({ categoryId, subCategoryId }));

      // 2️⃣ Navigate to new route (category + subcategory)
      router.push(
        `/all-products/${encodeId(categoryId)}/${encodeId(subCategoryId)}`
      );
    } catch (error) {
      console.error("Error navigating:", error);
    }
  };

  return (
    <header id="header">
      <div className="mid_header">
        <div className="container">
          <div className="header_wrap">
            <Link href="/" className="logo">
              <Image src="/images/logo.png" alt="" />
            </Link>

            <div className="search_query">
              <a className="query_search_btn" href="javascript:void(0)">
                <i className="bi bi-search"></i>
              </a>
              <input
                type="text"
                placeholder="Search for medicines & products..."
                style={{ borderRadius: "none" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm && setShowList(true)}
                onKeyDown={handleKeyDown}
              />
              {/* Suggestions List */}
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
                  }}
                >
                  {filteredList.map((item, index) => (
                    <li
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setHighlightIndex(index)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "20px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        backgroundColor:
                          index === highlightIndex
                            ? "rgb(237 240 243)"
                            : "transparent", // highlight color
                        color:
                          index === highlightIndex ? "rgb(31 20 20)" : "#000", // text color
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: "15px" }}>
                        {item.medicine_name}
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "rgb(208 95 95)",
                          fontWeight: "600",
                        }}
                      >
                        {item.Manufacturer || "N/A"} | ₹
                        {item.MRP === null ? 0 : item.MRP}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ul className="user_right">
              <li>
                <div className="dropdown-user">
                  <span className="user_p dropdownbtn">
                    <i>
                      <Image
                        className="user_icon"
                        src="/images/icons/icon-profile.svg"
                        alt=""
                      />
                    </i>
                    Account
                  </span>
                  <div
                    className="dropdown-user-content"
                    style={{ zIndex: "5" }}
                  >
                    {!buyer ? (
                      // ✅ Jab user login nahi hai
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
                    ) : (
                      // ✅ Jab buyer login hai
                      <div>
                        <p>
                          <b>Welcome</b>
                          <br />
                          {buyer?.name || "User"}
                        </p>
                        <hr className="border-secondary" />
                        <Link href="/buyer/profile">My Account</Link>
                        <Link href="/buyer/orders">My Orders</Link>
                        {/* <Link href="/contact-us">Contact Us</Link> */}
                        <button className="btn1 mt-2" onClick={handleLogout}>
                          Logout
                        </button>
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
                        alt=""
                      />
                      <span className="count">{localCount}</span>
                    </i>
                    Health Bag
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="menu_header">
        <div className="container">
          <ul className="main_menu">
            <li>
              <Link href="/all-medicine" className="link">
                All Medicine <i className="bi bi-grid-fill"></i>
              </Link>
            </li>

            {shuffledCategories
              .slice(0, 5)
              .filter((cat) => cat.category_name !== "Medicines")
              .map((cat) => {
                const filteredSubcategories = subcategories.filter(
                  (sub) => String(sub.category_id) === String(cat.id)
                );

                return (
                  <li key={cat.id}>
                    <Link href={`/all-product/${encodeId(cat.id)}`}>
                      {cat.category_name}
                    </Link>

                    {/* Subcategories */}
                    <div className="megamenu-panel">
                      {filteredSubcategories.length > 0 ? (
                        <ul className="megamenu-list">
                          {filteredSubcategories.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href=""
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
                <a href="#" className="">
                  More
                </a>
                <div className="megamenu-panel2">
                  <ul className="megamenu-list">
                    {shuffledCategories
                      .slice(5)
                      .filter((cat) => cat.category_name !== "Medicines")
                      .map((cat) => (
                        <li key={cat.id} className="">
                          <Link href={`/all-product/${encodeId(cat.id)}`}>
                            {cat.category_name}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </li>
            )}

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
              {/* Modal*/}
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
