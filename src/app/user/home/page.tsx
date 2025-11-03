"use client";

import "../css/site-style.css";
import SiteHeader from "@/app/user/components/header/header";
import {
  Button,
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
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import Footer from "@/app/user/components/footer/footer";
import { useShuffledOnce } from "@/lib/hooks/useShuffledOnce";
import { HealthBag } from "@/types/healthBag";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function HomePage() {
  // --- Local states for instant UI ---
  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const despatch = useAppDispatch();
  const router = useRouter();
  const { groupCare } = useAppSelector((state) => state.medicine);

  // start for increse header count code
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  // end for increse header count code
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
  const shuffled5 = useShuffledOnce("category5", medicineMenuByCategory5);
  const shuffled7 = useShuffledOnce("category7", medicineMenuByCategory7);
  const shuffled9 = useShuffledOnce("category9", medicineMenuByCategory9);
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

  // --- Sync localBag with Redux items ---
  useEffect(() => {
    if (items?.length) {
      setLocalBag(items.map((i) => i.productid)); // ✅ correct key
    } else {
      setLocalBag([]);
    }
  }, [items]);

  // Merge guest cart into logged-in cart once
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id, mergeGuestCart]);

  // --- Handlers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAdd = async (item: any) => {
    setLocalBag((prev) => [...prev, item.product_id]);
    setProcessingIds((prev) => [...prev, item.product_id]);
    try {
      await addItem({
        id: 0,
        buyer_id: buyer?.id || 0,
        product_id: item.product_id,
        quantity: 1,
      } as HealthBag);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== item.product_id));
    }
  };

  const handleRemove = async (productId: number) => {
    setLocalBag((prev) => prev.filter((id) => id !== productId));
    setProcessingIds((prev) => [...prev, productId]);
    try {
      await removeItem(productId);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== productId));
    }
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 className="section_title">{categoryNamesById[7]}</h2>
            <button
              className="btn-outline"
              onClick={() => router.push(`/all-product/${encodeId(7)}`)}
            >
              View All <i className="bi bi-arrow-right"></i>
            </button>
          </div>
          <div className="row">
            {shuffled7 && shuffled7.length > 0 ? (
              shuffled7.slice(0, 5).map((item) => {
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
                const isInBag =
                  localBag.includes(item.product_id) ||
                  items.some(
                    (i) =>
                      i.productid === item.product_id || // backend data
                      i.product_id === item.product_id // guest/local data
                  );

                return (
                  <div className="col" key={item.product_id}>
                    <div className="pd_box">
                      <div className="pd_img">
                        <Image
                          src={imageUrl}
                          alt={item.ProductName}
                          style={{
                            height: "220px",
                            objectFit: "contain",
                            opacity:
                              imageUrl === "/images/tnc-default.png" ? 0.3 : 1, // ✅ only default image faded
                          }}
                        />
                      </div>
                      <div className="pd_content">
                        <h3
                          className="pd-title hover-link"
                          onClick={() => handleClick(item.product_id)}
                          style={{ cursor: "pointer" }}
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

                        <Button
                          size="sm"
                          className={`btn-1 btn-HO ${
                            isInBag ? "remove" : "add"
                          }`}
                          style={{ borderRadius: "35px" }}
                          disabled={processingIds.includes(item.product_id)}
                          onClick={() =>
                            isInBag
                              ? handleRemove(item.product_id)
                              : handleAdd(item)
                          }
                        >
                          {processingIds.includes(item.product_id)
                            ? "Processing..."
                            : isInBag
                            ? "REMOVE"
                            : "ADD"}
                        </Button>
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
          <h2 className="section_title">Manufacturer</h2>
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
              <span className="b_name">{"Dr. Reddy's"}</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/alkem.png" alt="" />
              <span className="b_name">Alkem</span>
            </div>
            <div className="brand_item">
              <img src="images/brand/divis.png" alt="" />
              <span className="b_name">{"Divi's"}</span>
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 className="section_title">{categoryNamesById[5]}</h2>
            <button
              className="btn-outline"
              onClick={() => router.push(`/all-product/${encodeId(5)}`)}
            >
              View All <i className="bi bi-arrow-right"></i>
            </button>
          </div>
          <div className="row">
            {shuffled5 && shuffled5.length > 0 ? (
              shuffled5.slice(0, 5).map((item) => {
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

                const isInBag =
                  localBag.includes(item.product_id) ||
                  items.some(
                    (i) =>
                      i.productid === item.product_id || // backend data
                      i.product_id === item.product_id // guest/local data
                  );

                return (
                  <div className="col" key={item.product_id}>
                    <div className="pd_box">
                      <div className="pd_img">
                        <Image
                          src={imageUrl}
                          alt={item.ProductName}
                          style={{
                            height: "220px",
                            objectFit: "contain",
                            opacity:
                              imageUrl === "/images/tnc-default.png" ? 0.3 : 1, // ✅ only default image faded
                          }}
                        />
                      </div>
                      <div className="pd_content">
                        <h3
                          className="pd-title hover-link"
                          onClick={() => handleClick(item.product_id)}
                          style={{ cursor: "pointer" }}
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
                        <Button
                          size="sm"
                          className={`btn-1 btn-HO ${
                            isInBag ? "remove" : "add"
                          }`}
                          style={{ borderRadius: "35px" }}
                          disabled={processingIds.includes(item.product_id)}
                          onClick={() =>
                            isInBag
                              ? handleRemove(item.product_id)
                              : handleAdd(item)
                          }
                        >
                          {processingIds.includes(item.product_id)
                            ? "Processing..."
                            : isInBag
                            ? "REMOVE"
                            : "ADD"}
                        </Button>
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 className="section_title">{categoryNamesById[9]}</h2>
            <button
              className="btn-outline"
              onClick={() => router.push(`/all-product/${encodeId(9)}`)}
            >
              View All <i className="bi bi-arrow-right"></i>
            </button>
          </div>
          <div className="row">
            {shuffled9 && shuffled9.length > 0 ? (
              shuffled9.slice(0, 5).map((item) => {
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

                const isInBag =
                  localBag.includes(item.product_id) ||
                  items.some(
                    (i) =>
                      i.productid === item.product_id || // backend data
                      i.product_id === item.product_id // guest/local data
                  );

                return (
                  <div className="col" key={item.product_id}>
                    <div className="pd_box">
                      <div className="pd_img">
                        <Image
                          src={imageUrl}
                          alt={item.ProductName}
                          style={{
                            height: "220px",
                            objectFit: "contain",
                            opacity:
                              imageUrl === "/images/tnc-default.png" ? 0.3 : 1, // ✅ only default image faded
                          }}
                        />
                      </div>
                      <div className="pd_content">
                        <h3
                          className="pd-title hover-link"
                          onClick={() => handleClick(item.product_id)}
                          style={{ cursor: "pointer" }}
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

                        <Button
                          size="sm"
                          className={`btn-1 btn-HO ${
                            isInBag ? "remove" : "add"
                          }`}
                          style={{ borderRadius: "35px" }}
                          disabled={processingIds.includes(item.product_id)}
                          onClick={() =>
                            isInBag
                              ? handleRemove(item.product_id)
                              : handleAdd(item)
                          }
                        >
                          {processingIds.includes(item.product_id)
                            ? "Processing..."
                            : isInBag
                            ? "REMOVE"
                            : "ADD"}
                        </Button>
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
          <Image src="images/adv-banner-4.jpg" className="w-100" alt="" />
        </div>
      </section>

      <section className="why_section">
        <div className="container">
          <div className="row">
            <div className="col-sm-3">
              <div className="why_box">
                <div>
                  <Image src="images/icons/icon-shipping.svg" alt="" />
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
                  <Image src="images/icons/icon-money-bag.svg" alt="" />
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
                  <Image src="images/icons/icon-secure.svg" alt="" />
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
                  <Image src="images/icons/icon-discount.svg" alt="" />
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

      <Footer />
    </>
  );
}
