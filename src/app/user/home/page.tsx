"use client";

import "../css/site-style.css";
import SiteHeader from "@/app/user/components/header/header";
import {
  Carousel,
  Collapse,
  Image,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getGroupCare,
  getMedicinesByCategoryId,
  getMedicinesMenuByOtherId,
} from "@/lib/features/medicineSlice/medicineSlice";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/utils/encodeDecode";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function HomePage() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const despatch = useAppDispatch();
  const router = useRouter();
  const { groupCare } = useAppSelector((state) => state.medicine);

  const medicineMenuByCategory5 = useAppSelector(
    (state) => state.medicine.byCategory[5] || []
  );
  const medicineMenuByCategory7 = useAppSelector(
    (state) => state.medicine.byCategory[7] || []
  );
  const medicineMenuByCategory9 = useAppSelector(
    (state) => state.medicine.byCategory[9] || []
  );
  const { list: categories } = useAppSelector((state) => state.category);
  const categoryNamesById: Record<number, string> = {};
  [5, 7, 9].forEach((id) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) categoryNamesById[id] = cat.category_name;
  });
  //console.log("medicineMenuByCategory5", medicineMenuByCategory5);
  useEffect(() => {
    despatch(getGroupCare());
    despatch(getCategories());
    despatch(getMedicinesByCategoryId(5));
    despatch(getMedicinesByCategoryId(7));
    despatch(getMedicinesByCategoryId(9));
    despatch(getMedicinesMenuByOtherId(0));
  }, [despatch]);

  const CARE_GROUP_ICONS: Record<string, string> = {
    "Diabetic Care": "images/icons/icon-diabetes-care.svg",
    "Cardiac Care": "images/icons/icon-cardiac-care.svg",
    "Stomach Care": "images/icons/icon-stomach-care.svg",
    "Liver Care": "images/icons/icon-liver-care.svg",
    "Oral Care": "images/icons/icon-oral-care.svg",
    "Eye Care": "images/icons/icon-eye-care.svg",
    "Hair Care": "images/icons/icon-hair-care.svg",
    "Pain Relief": "images/icons/icon-pain-relief-care.svg",
    "Heart Care": "images/icons/icon-heart-care.svg",
    DEFAULT: "images/icons/icon-default-care.svg",
  };
  const BG_CLASSES = ["bg-1", "bg-2", "bg-3", "bg-4", "bg-5", "bg-6"];
  const getIconPath = (groupName: string): string => {
    return CARE_GROUP_ICONS[groupName] || CARE_GROUP_ICONS.DEFAULT;
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
  };

  // 👇 onClick function
  const handleClick = (product_id: number) => {
    router.push(`/product-details/${encodeId(product_id)}`);
  };

  return (
    <>
      <SiteHeader />
      <Carousel
        fade
        controls={true}
        indicators={true}
        interval={3000}
        pause={false}
      >
        <Carousel.Item>
          <img
            src="images/main-banner-1.jpg"
            className="d-block w-100"
            alt="..."
          />
          <div className="hero-banner">
            <div className="container">
              <div className="mySlides fadeInLeft">
                <h2 className="title">
                  Happiness is the Highest form of Health
                </h2>
                <span className="subtitle">#StayHealthy</span>
              </div>
            </div>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <img
            src="images/main-banner-2.jpg"
            className="d-block w-100"
            alt="..."
          />
          <div className="hero-banner">
            <div className="container">
              <div className="mySlides fadeInLeft">
                <h2 className="title">
                  Move with grace, health finds its place
                </h2>
                <span className="subtitle">#StayHealthy</span>
              </div>
            </div>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <img
            src="images/main-banner-3.jpg"
            className="d-block w-100"
            alt="..."
          />
          <div className="hero-banner">
            <div className="container">
              <div className="mySlides fadeInLeft">
                <h2 className="title">Health is the Foundation of Happiness</h2>
                <span className="subtitle">#StayHealthy</span>
              </div>
            </div>
          </div>
        </Carousel.Item>
      </Carousel>

      {/* Make sure to check if data exists before mapping */}
      <section className="category_sec">
        <div className="container">
          <h2 className="section_title">Browse by Health Conditions</h2>
          <div className="slider-container">
            {/*Slider Implementation */}
            <Slider {...settings}>
              {groupCare?.map((group, index) => (
                <div key={group.id}>
                  <div className="category_item">
                    <div
                      className={`category_img ${
                        BG_CLASSES[index % BG_CLASSES.length]
                      }`}
                    >
                      <Image
                        src={getIconPath(group.group_name)}
                        alt={`${group.group_name} Icon`}
                        width={50}
                        height={50}
                      />
                    </div>
                    <div>
                      {/* ✅ Group Name Dynamic */}
                      <h2 className="category_title">{group.group_name}</h2>
                      <span className="category_link">
                        View Now<i className="bi bi-arrow-right-short"></i>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      <section className="pd_section">
        <div className="container">
          <h2 className="section_title">{categoryNamesById[7]}</h2>
          <div className="row">
            {medicineMenuByCategory7 && medicineMenuByCategory7.length > 0 ? (
              medicineMenuByCategory7.slice(0, 5).map((item) => {
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

                return (
                  <div className="col" key={item.product_id}>
                    <div className="pd_box">
                      <div className="pd_img">
                        <Image src={imageUrl} alt={item.ProductName} />
                      </div>
                      <div className="pd_content">
                        <h3
                          className="pd-title"
                          onClick={() => handleClick(item.product_id)}
                        >
                          {item.ProductName || ""}
                        </h3>
                        <h6 className="pd-title fw-bold">
                          {item.Manufacturer || ""}
                        </h6>
                        <div className="pd_price">
                          <span className="new_price">₹{discountedPrice}</span>
                          <span className="old_price">
                            <del>MRP ₹{mrp}</del> {discount}% off
                          </span>
                        </div>

                        <button className="btn-1">ADD</button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>Loading medicines...</p>
            )}
          </div>
        </div>
      </section>

      <section className="brand_section">
        <div className="container">
          <h2 className="section_title">Shop by Brands</h2>
          <div className="brand_list">
            <div className="brand_item">
              <img src="images/brand/cipla.png" alt="" />
              <span className="b_name">Cipla</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/zydus-cadila.png" alt="" />
              <span className="b_name">Zydus Cadila</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/dr-reddys.png" alt="" />
              <span className="b_name">Dr. Reddy's</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/alkem.png" alt="" />
              <span className="b_name">Alkem</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/divis.png" alt="" />
              <span className="b_name">Divi's</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/biocon.png" alt="" />
              <span className="b_name">Biocon</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/glaxo-smith-kline.png" alt="" />
              <span className="b_name">Glaxo Smith Kline</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/laurus-labs.png" alt="" />
              <span className="b_name">Laurus Labs</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/emcure.png" alt="" />
              <span className="b_name">Emcure</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/alembic.png" alt="" />
              <span className="b_name">Alembic</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/sun-pharma.png" alt="" />
              <span className="b_name">Sun Pharma</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/arbro.png" alt="" />
              <span className="b_name">Arbro</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/glenmark.png" alt="" />
              <span className="b_name">Glenmark</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/abbott.png" alt="" />
              <span className="b_name">Abbott</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pd_section">
        <div className="container">
          <h2 className="section_title">{categoryNamesById[5]}</h2>
          <div className="row">
            {medicineMenuByCategory5 && medicineMenuByCategory5.length > 0 ? (
              medicineMenuByCategory5.slice(0, 5).map((item) => {
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

                return (
                  <div className="col" key={item.product_id}>
                    <div className="pd_box">
                      <div className="pd_img">
                        <Image src={imageUrl} alt={item.ProductName} />
                      </div>
                      <div className="pd_content">
                        <h3 className="pd-title">{item.ProductName || ""}</h3>
                        <h6 className="pd-title fw-bold">
                          {item.Manufacturer || ""}
                        </h6>
                        <div className="pd_price">
                          <span className="new_price">₹{discountedPrice}</span>
                          <span className="old_price">
                            <del>MRP ₹{mrp}</del> {discount}% off
                          </span>
                        </div>

                        <button className="btn-1">ADD</button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>Loading medicines...</p>
            )}
          </div>
        </div>
      </section>

      <section className="offer_sec">
        <div className="container">
          <div className="row">
            <div className="col-sm-4">
              <div className="pd_offer">
                <img src="images/banner-h3-01.jpg" alt="" />
                <div className="caption">
                  <span className="t1">- Upto 25% Off</span>
                  <h2 className="t2">100% Pure Hand Sanitizer</h2>
                  <div>
                    <button className="btn-2">
                      Shop Now <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="pd_offer">
                <img src="images/banner-h3-02.jpg" alt="" />
                <div className="caption">
                  <span className="t1">- Upto 25% Off</span>
                  <h2 className="t2">100% Pure Hand Sanitizer</h2>
                  <div>
                    <button className="btn-2">
                      Shop Now <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="pd_offer">
                <img src="images/banner-h3-03.jpg" alt="" />
                <div className="caption">
                  <span className="t1">- Upto 25% Off</span>
                  <h2 className="t2">100% Pure Hand Sanitizer</h2>
                  <div>
                    <button className="btn-2">
                      Shop Now <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pd_section">
        <div className="container">
          <h2 className="section_title">{categoryNamesById[9]}</h2>
          <div className="row">
            {medicineMenuByCategory9 && medicineMenuByCategory9.length > 0 ? (
              medicineMenuByCategory9.slice(0, 5).map((item) => {
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

                return (
                  <div className="col" key={item.product_id}>
                    <div className="pd_box">
                      <div className="pd_img">
                        <Image src={imageUrl} alt={item.ProductName} />
                      </div>
                      <div className="pd_content">
                        <h3 className="pd-title">{item.ProductName || ""}</h3>
                        <h6 className="pd-title fw-bold">
                          {item.Manufacturer || ""}
                        </h6>
                        <div className="pd_price">
                          <span className="new_price">₹{discountedPrice}</span>
                          <span className="old_price">
                            <del>MRP ₹{mrp}</del> {discount}% off
                          </span>
                        </div>

                        <button className="btn-1">ADD</button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>Loading medicines...</p>
            )}
          </div>
        </div>
      </section>

      <section className="adv-full">
        <div className="container">
          <img src="images/adv-banner-4.jpg" className="w-100" alt="" />
        </div>
      </section>

      <section className="why_section">
        <div className="container">
          <div className="row">
            <div className="col-sm-3">
              <div className="why_box">
                <div>
                  <img src="images/icons/icon-shipping.svg" alt="" />
                </div>
                <div>
                  <h4>Free & Fast Shipping</h4>
                  <p>Orders All Over INR 100</p>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="why_box">
                <div>
                  <img src="images/icons/icon-money-bag.svg" alt="" />
                </div>
                <div>
                  <h4>Money Back Guarantee</h4>
                  <p>With a 30 Day minimum</p>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="why_box">
                <div>
                  <img src="images/icons/icon-secure.svg" alt="" />
                </div>
                <div>
                  <h4>All Secure Payment</h4>
                  <p>Up to 12 months installments</p>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="why_box">
                <div>
                  <img src="images/icons/icon-discount.svg" alt="" />
                </div>
                <div>
                  <h4>Upto 20% Off on Purchase</h4>
                  <p>Incredible discounts on your favorite items</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer
        className="position-fixed bottom-0 end-0"
        style={{ zIndex: 1060 }}
      >
        <Toast
          className={`toast-app ${open ? "no-animation" : ""}`}
          onClose={() => {
            setShow(false);
            setOpen(false);
          }}
          show={show}
          autohide={false}
        >
          <Collapse in={open}>
            <div id="qr-collapse" style={{ marginBottom: "-30px" }}>
              <div className="mob">
                <button
                  type="button"
                  className="btn-close position-absolute top-0 end-0 m-1"
                  style={{ fontSize: "12px" }}
                  onClick={() => setOpen(!open)}
                  aria-label="Close"
                />
                <img src="images/logo.png" className="clogo" alt="logo" />
                <img
                  src="images/qr-code-whatsapp.svg"
                  className="w-100"
                  alt="QR code to upload via WhatsApp"
                />
                <span className="hint">Scan to Upload</span>
              </div>
            </div>
          </Collapse>
          <img
            src="images/upload-on-whatsapp.svg"
            className="toastimg"
            alt="QR code"
            onClick={() => setOpen(!open)}
            aria-controls="qr-collapse"
            aria-expanded={open}
          />
        </Toast>
      </ToastContainer>

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
                  <img
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
                <img src="/Content/Images/logo.svg" className="clogo" alt="" />
                <img
                  src="/Content/Images/qr-code.jpg"
                  className="w-100"
                  alt=""
                />
                <span className="hint">Scan to Download App</span>
              </div>
            </div>
            <img
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
