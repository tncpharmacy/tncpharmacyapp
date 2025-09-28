"use client";
import React, { useEffect, useState } from "react";
import "../../styles/header-style.css";
import "../../styles/style-login.css";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/features/authSlice/authSlice";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import { getSubcategories } from "@/lib/features/subCategorySlice/subCategorySlice";
import { Category } from "@/types/category";

const SiteHeader = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, restoreComplete } = useAppSelector(
    (state) => state.auth
  );
  const { list: categories } = useAppSelector((state) => state.category);
  const { list: subcategories } = useAppSelector((state) => state.subcategory);

  // console.log("categories", categories);
  // console.log("subcategories", subcategories);
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getSubcategories());
  }, [dispatch]);



  const [login_id, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [show, setShow] = useState(false);
  //const [error, setError] = useState<string | null>(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // ✅ redirect after login / restore
  useEffect(() => {
    if (!restoreComplete) return;
    if (user) redirectUser(user.user_type);
  }, [restoreComplete, user]);

  const [shuffledCategories, setShuffledCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Har refresh pe categories random ho jayengi
    const shuffled = [...categories].sort(() => Math.random() - 0.5);
    setShuffledCategories(shuffled);
  }, [categories]);

  const redirectUser = (userType: number) => {
    switch (userType) {
      case 1:
        router.push("/admin-dashboard");
        break;
      case 2:
      case 3:
        router.push("/doctor/doctor-dashboard");
        break;
      case 4:
        router.push("/pharmacy/pharmacy-dashboard");
        break;
      case 5:
        router.push("/pharmacist/pharmacist-dashboard");
        break;
    }
  };

  const handleLogin = async () => {
    const res = await dispatch(loginUser({ login_id, password }));
    if (loginUser.fulfilled.match(res))
      redirectUser(res.payload.user.user_type);
  };

  if (!mounted) return null;

  return (
    <header id="header">
      <div className="mid_header">
        <div className="container">
          <div className="header_wrap">
            <a href="#" className="logo">
              <img src="/images/logo.png" alt="" />
            </a>

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
                        <button className="btn1 me-2" onClick={handleShow}>
                          Login
                        </button>
                        <Modal
                          size="lg"
                          show={show}
                          onHide={handleClose}
                          centered
                          className="loginmodal"
                        >
                          <Modal.Body className="p-0">
                            <div className="row">
                              <div className="col-md-5 pe-0 d-none d-md-block">
                                <img
                                  src="../images/login-banner-1.jpg"
                                  className="w-100"
                                  alt="Login Banner"
                                />
                              </div>
                              <div className="col-md-7 ps-md-0 d-flex align-items-center">
                                <div className="login_form">
                                  <span className="login_title">
                                    Login here
                                  </span>
                                  <div className="row_login">
                                    <span className="lbllogin">Login ID</span>
                                    <input
                                      type="text"
                                      className="txtlogin"
                                      placeholder="Enter Login Id"
                                      value={login_id}
                                      maxLength={10}
                                      onChange={(e) =>
                                        setLoginId(e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="row_login">
                                    <span className="lbllogin">Password</span>
                                    <input
                                      type="password"
                                      className="txtlogin"
                                      placeholder="Enter Password"
                                      value={password}
                                      onChange={(e) =>
                                        setPassword(e.target.value)
                                      }
                                    />
                                  </div>
                                  <button
                                    onClick={handleLogin}
                                    disabled={loading}
                                    className="btnlogin"
                                  >
                                    {loading ? "Logging in..." : "Login"}
                                  </button>
                                  {error && (
                                    <p style={{ color: "red" }}>{error}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Modal.Body>
                        </Modal>
                        <a href="register.html" className="btn1">
                          SignUp
                        </a>
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
              <a href="#">
                All  Medicine <i className="bi bi-grid-fill"></i>
              </a>
            </li>

            {shuffledCategories.slice(0, 5).map((cat) => {
              const filteredSubcategories = subcategories.filter(
                (sub) => String(sub.category_id) === String(cat.id)
              );

              return (
                <li key={cat.id}                >
                  <a href="#">
                    {cat.category_name}
                  </a>

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
              <button className="btn_uoload">
                <span>
                  Upload
                  <br /> Prescription
                </span>
                <img
                  src="/images/icons/icon-upload.svg"
                  width={"20px"}
                  alt="Upload"
                />
              </button>
              
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
