"use client";

import React, { useEffect, useMemo, useState } from "react";
import "../../../css/site-style.css";
import "../../../css/user-style.css";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/utils/encodeDecode";
import SiteHeader from "@/app/user/components/header/header";
import { useParams } from "next/navigation";
import { decodeId } from "@/lib/utils/encodeDecode";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getCategoryIdBySubcategory } from "@/lib/features/medicineSlice/medicineSlice";
import { Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHealthBag } from "@/lib/hooks/useHealthBag";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function AllProducts() {
  const [isHovered, setIsHovered] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  // raw params
  const categoryIdRaw = params.categoryId;
  const subCategoryIdRaw = params.subCategoryId;
  // decode categoryId
  const categoryIdNum = Array.isArray(categoryIdRaw)
    ? decodeId(categoryIdRaw[0])
    : categoryIdRaw
    ? decodeId(categoryIdRaw)
    : null;

  // decode subCategoryId
  const subCategoryIdNum = Array.isArray(subCategoryIdRaw)
    ? decodeId(subCategoryIdRaw[0])
    : subCategoryIdRaw
    ? decodeId(subCategoryIdRaw)
    : null;

  const medicines = useAppSelector(
    (state) =>
      state.medicine.byCategorySubcategory?.[
        `${categoryIdNum}-${subCategoryIdNum}`
      ] || []
  );

  useEffect(() => {
    if (categoryIdNum && subCategoryIdNum) {
      dispatch(
        getCategoryIdBySubcategory({
          categoryId: categoryIdNum,
          subCategoryId: subCategoryIdNum,
        })
      );
    }
  }, [categoryIdNum, subCategoryIdNum, dispatch]);

  // start for increse header count code
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  // Merge guest cart into logged-in cart once
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id]);

  // end for increse header count code

  const handleClick = (product_id: number) => {
    router.push(`/product-details/${encodeId(product_id)}`);
  };

  // Filter the medicines based on the search term
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return medicines;
    const lower = searchTerm.toLowerCase();
    return medicines.filter((med) =>
      (med.ProductName || "").toLowerCase().includes(lower)
    );
  }, [medicines, searchTerm]);

  return (
    <>
      <div className="page-wrapper">
        <SiteHeader />

        <div className="body_wrap">
          {/* <FilterSidebar /> */}
          <div className="body_right">
            <div className="body_content">
              <div className="pageTitle">
                <Image src={"/images/favicon.png"} alt="" /> Product
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="search_query">
                    <a className="query_search_btn" href="javascript:void(0)">
                      <i className="bi bi-search"></i>
                    </a>
                    <input
                      type="text"
                      className="txt1 my-box"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="pd_list">
                {filteredMedicines && filteredMedicines.length > 0 ? (
                  filteredMedicines.map((item) => {
                    const mrp = item.MRP
                      ? parseFloat(item.MRP.toString())
                      : Math.floor(Math.random() * (1000 - 100 + 1)) + 100;

                    const discount = parseFloat(item.Discount) || 0;
                    const discountedPrice = Math.round(
                      mrp - (mrp * discount) / 100
                    );

                    const imageUrl = item.DefaultImageURL
                      ? item.DefaultImageURL.startsWith("http")
                        ? item.DefaultImageURL
                        : `${mediaBase}${item.DefaultImageURL}`
                      : "/images/tnc-default.png";

                    const isInBag = items.some(
                      (i) => i.product_id === item.product_id
                    );

                    return (
                      <div
                        className="pd_box shadow"
                        style={{ boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)" }}
                        key={item.product_id}
                      >
                        <div className="pd_img">
                          <Image
                            src={imageUrl}
                            alt={item.ProductName}
                            style={{ height: "220px", objectFit: "contain" }}
                          />
                        </div>
                        <div className="pd_content">
                          <h3
                            className="pd-title hover-link"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleClick(item.product_id)}
                          >
                            {item.ProductName || ""}
                          </h3>
                          <h6 className="pd-title fw-bold">
                            {item.Manufacturer || ""}
                          </h6>
                          <div className="pd_price">
                            <span className="new_price">
                              ₹{discountedPrice}
                            </span>
                            <span className="old_price">
                              <del>MRP ₹{mrp}</del> {discount}% off
                            </span>
                          </div>

                          <button
                            className="btn-1"
                            onClick={() =>
                              isInBag
                                ? removeItem(item.product_id)
                                : addItem({
                                    id: Date.now(),
                                    buyer_id: buyer?.id || 0,
                                    product_id: item.product_id,
                                    quantity: 1,
                                  })
                            }
                          >
                            {isInBag ? "REMOVE" : "ADD"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Loading products...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="container">
          <div
            className="row aos-init aos-animate"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="0"
          >
            <div className="col-sm-9">
              <div className="row">
                <div className="col-sm-3">
                  <h5 className="ftr_title">About TnC Pharmacy</h5>
                  <ul className="ftr_link">
                    <li>
                      <a href="#">About us</a>
                    </li>
                    <li>
                      <a href="#">Contact Us</a>
                    </li>
                    <li>
                      <a href="#">Our Stores</a>
                    </li>
                    <li>
                      <a href="#">Careers</a>
                    </li>
                    <li>
                      <a href="#">News & Media</a>
                    </li>
                    <li>
                      <a href="#">Our Blogs</a>
                    </li>
                    <li>
                      <a href="#">FAQ’s</a>
                    </li>
                  </ul>
                </div>
                <div className="col-sm-3">
                  <h5 className="ftr_title">Our Policies</h5>
                  <ul className="ftr_link">
                    <li>
                      <a href="#">Returns & Refunds</a>
                    </li>
                    <li>
                      <a href="#">Shipping Terms</a>
                    </li>
                    <li>
                      <a href="#">Privacy Policy</a>
                    </li>
                    <li>
                      <a href="#">Terms and Conditions</a>
                    </li>
                    <li>
                      <a href="#">Editorial Policy</a>
                    </li>
                  </ul>
                </div>
                <div className="col-sm-3">
                  <h5 className="ftr_title">Product Categories</h5>
                  <ul className="ftr_link">
                    <li>
                      <a href="#">Medicines</a>
                    </li>
                    <li>
                      <a href="#">Personal Care</a>
                    </li>
                    <li>
                      <a href="#">Women Care</a>
                    </li>
                    <li>
                      <a href="#">Baby Care</a>
                    </li>
                    <li>
                      <a href="#">Sports Nutritional</a>
                    </li>
                    <li>
                      <a href="#">Ayurveda</a>
                    </li>
                    <li>
                      <a href="#">Health Devices</a>
                    </li>
                  </ul>
                </div>
                <div className="col-sm-3">
                  <h5 className="ftr_title">Additional Links</h5>
                  <ul className="ftr_link">
                    <li>
                      <a href="#">Order Medicines</a>
                    </li>
                    <li>
                      <a href="#">Online Doctor Consultation</a>
                    </li>
                    <li>
                      <a href="#">All Doctors List</a>
                    </li>
                    <li>
                      <a href="#">Login/Register</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <h5 className="ftr_title">Customer Service</h5>
              <ul className="ftr_link">
                <li>
                  <i className="bi bi-headphones"></i>
                  <a href="#">+91 97178 XXXXX</a>
                  <span>(10:00 AM - 6:00 PM)</span>
                </li>
                <li>
                  <i className="bi bi-whatsapp"></i>
                  <a href="#">+91 97178 XXXXX</a>
                  <span>(24x7 hrs)</span>
                </li>
                <li>
                  <i className="bi bi-envelope"></i>
                  <a href="#">care@tncpharmacy.in</a>
                </li>
                <li>
                  <span>
                    <b className="fw-semibold">Address</b>
                    <br /> TnC Pharmacy, Ganga Shopping Complex, Sector 29,
                    Noida, U.P.  - 201303
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="border-top pt-3 mt-3">
            <div className="row">
              <div className="col-sm-6">
                <h5 className="ftr_title">We are social</h5>
                <ul className="ftr_sociallink">
                  <li>
                    <a href="#">
                      <i className="bi bi-facebook"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="bi bi-twitter-x"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="bi bi-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="bi bi-youtube"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="bi bi-linkedin"></i>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-sm-6 text-end">
                <div>
                  <h5 className="ftr_title">Payment Accept</h5>
                  <Image
                    src="images/payment-option.png"
                    alt=""
                    className="ftr_payment"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="ftr_copywrite">
          <div className="container">
            <div className="row">
              <div className="col-sm-6">
                © 2025 TnC Pharmacy | All Rights Reserved
              </div>
              <div className="col-sm-6 text-end">
                Developed by: <a href="#">Heuristtic Minds</a>
              </div>
            </div>
          </div>
        </div>
        <div className="toast-container position-fixed bottom-0 start-0">
          <div
            id="liveToast"
            className="toast toast-app"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            data-bs-autohide="false"
          >
            <div className="collapse show" id="mobile-qrcode">
              <div className="mob">
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="toast"
                  aria-label="Close"
                ></button>
                <Image
                  src="/Content/Images/logo.svg"
                  className="clogo"
                  alt=""
                />
                <Image
                  src="/Content/Images/qr-code.jpg"
                  className="w-100"
                  alt=""
                />
                <span className="hint">Scan to Download App</span>
              </div>
            </div>
            <Image
              src="/Content/Images/download-app.svg"
              className="toastimg"
              alt="download app"
              data-bs-toggle="collapse"
              data-bs-target="#mobile-qrcode"
              aria-expanded="true"
            />
          </div>
        </div>
      </footer>
    </>
  );
}
