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
import dynamic from "next/dynamic";
import TncLoader from "@/app/components/TncLoader/TncLoader";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function HomePage() {
  // --- Local states for instant UI ---
  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const despatch = useAppDispatch();
  const router = useRouter();
  const { groupCare, groupCareLoading } = useAppSelector(
    (state) => state.medicine
  );
  const [sliderReady, setSliderReady] = useState(false);

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

  // const Slider = dynamic(() => import("react-slick"), {
  //   ssr: false,
  // });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    "Stomach Care": "images/icons/icon-stomach-care.svg",
    "Liver Care": "images/icons/icon-liver-care.svg",
    "Oral Care": "images/icons/icon-oral-care.svg",
    "Eye Care": "images/icons/icon-eye-care.svg",
    "Hair Care": "images/icons/icon-hair-care.svg",
    "Pain Relief": "images/icons/icon-pain-relief-care.svg",
    "Heart Care": "images/icons/icon-heart-care.svg",
    "First Aid Care": "images/icons/icon-default-care.svg",
    DEFAULT: "images/icons/icon-default-care.svg",
  };
  const BG_CLASSES = ["bg-1", "bg-2", "bg-3", "bg-4", "bg-5", "bg-6"];
  const getIconPath = (groupName: string): string => {
    return CARE_GROUP_ICONS[groupName] || CARE_GROUP_ICONS.DEFAULT;
  };

  useEffect(() => {
    if (isClient) {
      const t = setTimeout(() => {
        setSliderReady(true);
      }, 0); // 👈 next tick

      return () => clearTimeout(t);
    }
  }, [isClient]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const [slides, setSlides] = useState(5);

  useEffect(() => {
    const updateSlides = () => {
      const w = window.innerWidth;

      if (w <= 360) setSlides(1);
      else if (w <= 480) setSlides(2);
      else if (w <= 768) setSlides(2);
      else if (w <= 1024) setSlides(3);
      else if (w <= 1120) setSlides(4);
      else setSlides(5); // desktop
    };

    updateSlides(); // run on load
    window.addEventListener("resize", updateSlides);

    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: slides, // 👈 NOW DYNAMIC
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    swipeToSlide: true,
  };

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
          <Image
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
          <Image
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
          <Image
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

      {/* 🔥 TOP SCROLLING TEXT */}
      <div
        style={{
          width: "100%",
          overflow: "hidden",
          whiteSpace: "nowrap",
          padding: "4px 0",
          background: "#fff",
          position: "relative",
          // textTransform: "uppercase",
        }}
      >
        <span
          style={{
            display: "inline-block",
            paddingLeft: "100%",
            color: "blue",
            fontSize: "14px",
            fontWeight: "600",
            animation: "scroll-right 30s linear infinite",
          }}
        >
          <style>
            {`
              @keyframes scroll-right {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}
          </style>
          TNC PHARMACY AND LABS PRIVATE LIMITED
        </span>

        {/* Inline keyframes */}
        <style>
          {`
      @keyframes scroll-left {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
      }
    `}
        </style>
      </div>
      {/* Make sure to check if data exists before mapping */}
      <section className="category_sec">
        <div className="container">
          <h2 className="section_title text-start">
            Browse by Health Conditions
          </h2>
          <div className="slider-container">
            {!sliderReady ? (
              <div className="d-flex justify-content-center align-items-center py-4">
                <TncLoader />
              </div>
            ) : (
              <Slider {...settings}>
                {groupCare.map((group, index) => (
                  <div key={group.id}>
                    <div
                      className="category_item"
                      onClick={() =>
                        router.push(`/all-group-care/${encodeId(group.id)}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className={`category_img ${
                          BG_CLASSES[index % BG_CLASSES.length]
                        }`}
                      >
                        <Image
                          src={getIconPath(group.group_name)}
                          alt={group.group_name}
                        />
                      </div>

                      <div>
                        <h2 className="category_title">{group.group_name}</h2>
                        <span className="category_link">
                          View Now <i className="bi bi-arrow-right-short"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            )}
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
              shuffled7
                // ✅ ONLY products having real image
                .filter(
                  (item) =>
                    item.DefaultImageURL &&
                    item.DefaultImageURL.trim() !== "" &&
                    item.DefaultImageURL !== "/images/tnc-default.png"
                )
                .slice(0, 5)
                .map((item) => {
                  const mrp = Number(item.mrp) || 0;

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
                              cursor: "pointer",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1, // ✅ only default image faded
                            }}
                            onClick={() => handleClick(item.product_id)}
                          />
                        </div>
                        <div className="pd_content">
                          <h3
                            className="pd-title hover-link fw-bold"
                            onClick={() => handleClick(item.product_id)}
                            style={{ cursor: "pointer", color: "#264b8c" }}
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
              <div className="d-flex justify-content-center align-items-center">
                <TncLoader />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="brand_section">
        <div className="container-fluid">
          <h2 className="section_title text-start">Manufacturer</h2>

          <div className="brand_wrapper">
            {/* Row 1 - Left to Right */}
            <div className="brand_list row_one">
              <div className="brand_item">
                <img src="/images/brand/abbott.png" alt="Abbott" />
                <span className="b_name">Abbott</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/alembic.png" alt="Alembic" />
                <span className="b_name">Alembic</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/alkem.png" alt="Alkem" />
                <span className="b_name">Alkem</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/arbro.png" alt="Arbro" />
                <span className="b_name">Arbro</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/avis.png" alt="Avis" />
                <span className="b_name">Avis</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/biocon.png" alt="Biocon" />
                <span className="b_name">Biocon</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/cadila.png" alt="Cadila" />
                <span className="b_name">Cadila</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/cipla.png" alt="Cipla" />
                <span className="b_name">Cipla</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/dabur.png" alt="Dabur" />
                <span className="b_name">Dabur</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/divis.png" alt="Divis" />
                <span className="b_name">Divis</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/dr-reddys.png" alt="Dr. Reddy's" />
                <span className="b_name">{"Dr. Reddy's"}</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/emcure.png" alt="Emcure" />
                <span className="b_name">Emcure</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/glaxo-smith-kline.png" alt="GSK" />
                <span className="b_name">GSK</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/glenmark.png" alt="Glenmark" />
                <span className="b_name">Glenmark</span>
              </div>
            </div>

            {/* Row 2 - Right to Left */}
            <div className="brand_list row_two">
              <div className="brand_item">
                <img src="/images/brand/hegde.png" alt="Hegde" />
                <span className="b_name">Hegde</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/himalaya.png" alt="Himalaya" />
                <span className="b_name">Himalaya</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/intas.png" alt="Intas" />
                <span className="b_name">Intas</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/kivi.png" alt="Kivi" />
                <span className="b_name">Kivi</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/knoll.png" alt="Knoll" />
                <span className="b_name">Knoll</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/laurus-labs.png" alt="Laurus Labs" />
                <span className="b_name">Laurus Labs</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/leeford.png" alt="Leeford" />
                <span className="b_name">Leeford</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/lupin.png" alt="Lupin" />
                <span className="b_name">Lupin</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/mankind.png" alt="Mankind" />
                <span className="b_name">Mankind</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/obsurge.png" alt="Obsurge" />
                <span className="b_name">Obsurge</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/patanjali.png" alt="Patanjali" />
                <span className="b_name">Patanjali</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/sun-pharma.png" alt="Sun Pharma" />
                <span className="b_name">Sun Pharma</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/wings-pharma.png" alt="Wings Pharma" />
                <span className="b_name">Wings Pharma</span>
              </div>
              <div className="brand_item">
                <img src="/images/brand/zydus-cadila.png" alt="Zydus Cadila" />
                <span className="b_name">Zydus Cadila</span>
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
              shuffled5
                // ✅ ONLY products having real image
                .filter(
                  (item) =>
                    item.DefaultImageURL &&
                    item.DefaultImageURL.trim() !== "" &&
                    item.DefaultImageURL !== "/images/tnc-default.png"
                )
                .slice(0, 5)
                .map((item) => {
                  const mrp = Number(item.mrp) || 0;

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
                              cursor: "pointer",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1, // ✅ only default image faded
                            }}
                            onClick={() => handleClick(item.product_id)}
                          />
                        </div>
                        <div className="pd_content">
                          <h3
                            className="pd-title hover-link fw-bold"
                            onClick={() => handleClick(item.product_id)}
                            style={{ cursor: "pointer", color: "#264b8c" }}
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
              <div className="d-flex justify-content-center align-items-center">
                <TncLoader />
              </div>
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
                    {/* <button className="btn-2">
                      Shop Now <i className="bi bi-chevron-right"></i>
                    </button> */}
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
                    {/* <button className="btn-2">
                      Shop Now <i className="bi bi-chevron-right"></i>
                    </button> */}
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
                    {/* <button className="btn-2">
                      Shop Now <i className="bi bi-chevron-right"></i>
                    </button> */}
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
              shuffled9
                // ✅ ONLY products having real image
                .filter(
                  (item) =>
                    item.DefaultImageURL &&
                    item.DefaultImageURL.trim() !== "" &&
                    item.DefaultImageURL !== "/images/tnc-default.png"
                )
                .slice(0, 5)
                .map((item) => {
                  const mrp = Number(item.mrp) || 0;

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
                              cursor: "pointer",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1, // ✅ only default image faded
                            }}
                            onClick={() => handleClick(item.product_id)}
                          />
                        </div>
                        <div className="pd_content">
                          <h3
                            className="pd-title hover-link fw-bold"
                            onClick={() => handleClick(item.product_id)}
                            style={{ cursor: "pointer", color: "#264b8c" }}
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
              <div className="d-flex justify-content-center align-items-center">
                <TncLoader />
              </div>
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
            <div className="col-6 col-sm-3">
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
            <div className="col-6 col-sm-3">
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
            <div className="col-6 col-sm-3">
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
            <div className="col-6 col-sm-3">
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
