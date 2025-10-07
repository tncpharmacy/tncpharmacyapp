"use client";
import React, { useCallback, useEffect, useState } from "react";
import "../../css/header-style.css";
import "../../../styles/style-login.css";
import { Modal } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/features/authSlice/authSlice";
import { getCategoriesList } from "@/lib/features/categorySlice/categorySlice";
import { getSubcategories } from "@/lib/features/subCategorySlice/subCategorySlice";
import { Category } from "@/types/category";
import Link from "next/link";
import PrescriptionUploadModal from "@/app/user/components/PrescriptionUploadModal/PrescriptionUploadModal";
import Image from "next/image";
import Login from "@/app/admin-login/page";
import BuyerLoginModal from "@/app/buyer-login/page";

const SiteHeader = () => {
  const dispatch = useAppDispatch();
  const [showLogin, setShowLogin] = useState(false);
  const [showBuyerLogin, setShowBuyerLogin] = useState(false);
  const { list: categories } = useAppSelector((state) => state.category);
  const { list: subcategories } = useAppSelector((state) => state.subcategory);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getCategoriesList());
    dispatch(getSubcategories());
  }, [dispatch]);

  const [show, setShow] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const [shuffledCategories, setShuffledCategories] = useState<Category[]>([]);

  useEffect(() => {
    const shuffled = [...categories].sort(() => Math.random() - 0.5);
    setShuffledCategories(shuffled);
  }, [categories]);

  if (!mounted) return null;

  return (
    <header id="header">
      <div className="mid_header">
        <div className="container">
          <div className="header_wrap">
            <Link href="/" className="logo">
              <img src="/images/logo.png" alt="" />
            </Link>

            <div className="search_query">
              <a className="query_search_btn" href="javascript:void(0)">
                <i className="bi bi-search"></i>
              </a>
              <input
                type="text"
                placeholder="Search for Medicines and Health Products"
              />
            </div>

            <ul className="user_right">
              <li>
                <div className="dropdown-user">
                  <span className="user_p dropdownbtn">
                    <i>
                      <img
                        className="user_icon"
                        src="/images/icons/icon-profile.svg"
                      />
                    </i>
                    Account
                  </span>
                  <div className="dropdown-user-content">
                    <div className="">
                      <p>
                        <b>Welcome</b>
                        <br />
                        To access account &amp; manage orders
                      </p>
                      <div className="d-flex">
                        <button
                          className="btn1 me-2"
                          onClick={() => setShowLogin(true)}
                        >
                          Admin Login
                        </button>
                        {/* Modal Component */}
                        <Login
                          show={showLogin}
                          handleClose={() => setShowLogin(false)}
                        />
                        <button
                          className="btn1"
                          onClick={() => setShowBuyerLogin(true)}
                        >
                          Buyer Login
                        </button>
                        <BuyerLoginModal
                          show={showBuyerLogin}
                          handleClose={() => setShowBuyerLogin(false)}
                        />
                      </div>
                    </div>
                    <div className="d-none">
                      <p>
                        <b>Welcome</b>
                        <br />
                        Dharmendra Kumar
                      </p>
                      <hr className="border-secondary" />
                      <a href="#">My Profile</a>
                      <a href="#">My Orders</a>
                      <a href="#">Wishlist</a>
                      <a href="#">Contact Us</a>
                      <button className="btn1 mt-2">LogOut</button>
                    </div>
                  </div>
                </div>
              </li>
              {/* <li>
                <a href="my-wishlist.html">
                  <span className="user_p">
                    <i>
                      <img
                        className="user_icon"
                        src="/images/icons/icon-wishlist.svg"
                      />
                      <span className="count">0</span>
                    </i>
                    Wishlist
                  </span>
                </a>
              </li> */}
              <li>
                <a href="cart.html">
                  <span className="user_p">
                    <i>
                      <img
                        className="user_icon"
                        src="/images/icons/icon-cart.svg"
                      />
                      <span className="count">0</span>
                    </i>
                    Health Bag
                  </span>
                </a>
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

            {shuffledCategories.slice(0, 5).map((cat) => {
              const filteredSubcategories = subcategories.filter(
                (sub) => String(sub.category_id) === String(cat.id)
              );

              return (
                <li key={cat.id}>
                  <a href="#">{cat.category_name}</a>

                  {/* Subcategories */}
                  <div className="megamenu-panel">
                    {filteredSubcategories.length > 0 ? (
                      <ul className="megamenu-list">
                        {filteredSubcategories.map((sub) => (
                          <li key={sub.id}>
                            <a href="#">{sub.sub_category_name}</a>
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
                    {shuffledCategories.slice(5).map((cat) => (
                      <li key={cat.id} className="">
                        <a href="#">{cat.category_name}</a>
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
