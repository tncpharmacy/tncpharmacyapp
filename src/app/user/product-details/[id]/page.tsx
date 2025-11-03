"use client";
import React, { useEffect, useState } from "react";
import "../../css/site-style.css";
import SiteHeader from "@/app/user/components/header/header";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Modal } from "react-bootstrap";
import { useParams } from "next/navigation";
import { decodeId } from "@/lib/utils/encodeDecode";
import HorizontalAccordionTabs from "@/app/user/product-details/HorizontalAccordionTabs";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getMedicinesMenuById,
  getMedicinesMenuByOtherId,
} from "@/lib/features/medicineSlice/medicineSlice";
import {
  Medicine,
  SafetyAdvice,
  SafetyFieldKeys,
  SafetyLabelKeys,
} from "@/types/medicine";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/app/user/components/footer/footer";

// Types
interface PackOption {
  id: string;
  label: string;
  price: number;
}

interface Product {
  title: string;
  brand: string;
  rating: number;
  ratingCount: number;
  flavour: string;
  highlights: string[];
  packOptions: PackOption[];
}

// Utility
function formatRs(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// Components
const ThumbnailGallery: React.FC<{
  thumbnails: string[];
  selectedImage: string;
  setSelectedImage: (img: string) => void;
}> = ({ thumbnails, selectedImage, setSelectedImage }) => (
  <div className="w-full md:w-20 flex md:flex-col items-center gap-3 overflow-auto">
    {thumbnails.map((t) => (
      <button
        key={t}
        onClick={() => setSelectedImage(t)}
        className={`border rounded-lg p-1 hover:shadow-md transition-all duration-150 ${
          selectedImage === t ? "ring-2 ring-green-400" : ""
        }`}
      >
        <img src={t} alt="thumb" className="w-16 h-16 object-cover rounded" />
      </button>
    ))}
  </div>
);

const ProductHighlights: React.FC<{ highlights: string[] }> = ({
  highlights,
}) => (
  <div className="mt-6">
    <h3 className="text-sm font-medium text-gray-800">Product highlights</h3>
    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
      {highlights.map((h, i) => (
        <li key={i}>{h}</li>
      ))}
    </ul>
  </div>
);

const PackSelector: React.FC<{
  packOptions: PackOption[];
  selectedPack: string;
  setSelectedPack: (id: string) => void;
}> = ({ packOptions, selectedPack, setSelectedPack }) => (
  <div className="mt-4">
    <div className="text-sm text-gray-700">Pack Size</div>
    <div className="mt-2 flex gap-3">
      {packOptions.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setSelectedPack(opt.id)}
          className={`border rounded-lg px-3 py-2 text-sm font-medium hover:shadow-sm transition ${
            selectedPack === opt.id
              ? "bg-red-50 border-red-300 text-red-700"
              : "bg-white text-gray-700"
          }`}
        >
          <div>{opt.label}</div>
          <div className="text-xs mt-1">{formatRs(opt.price)}</div>
        </button>
      ))}
    </div>
  </div>
);

const QuantitySelector: React.FC<{
  qty: number;
  setQty: (qty: number) => void;
}> = ({ qty, setQty }) => (
  <div className="flex items-center border rounded-md overflow-hidden">
    <button
      onClick={() => setQty(Math.max(1, qty - 1))}
      className="px-3 py-2 text-lg"
    >
      −
    </button>
    <div className="px-4 py-2 min-w-[44px] text-center">{qty}</div>
    <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-lg">
      +
    </button>
  </div>
);

const PriceBox: React.FC<{
  price: number;
  qty: number;
  addToCart: () => void;
}> = ({ price, qty, addToCart }) => (
  <div className="bg-gray-50 border rounded-lg p-4 shadow-sm sticky bottom-4 md:static">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">Price</div>
        <div className="text-2xl font-semibold text-gray-900">
          {formatRs(price)}
        </div>
        <div className="text-xs text-gray-400">Inclusive of all taxes</div>
      </div>
      <QuantitySelector qty={qty} setQty={() => {}} />
    </div>
    <div className="mt-4">
      <button
        onClick={addToCart}
        className="w-full bg-red-500 hover:bg-red-600 text-white rounded-md py-3 font-medium shadow"
      >
        Add to cart
      </button>
      <div className="mt-2 text-xs text-gray-500">
        <p>New GST benefit included in this MRP, may differ from label</p>
        <p>Not returnable • Read policy</p>
      </div>
    </div>
  </div>
);

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
// Main Page
export default function ProductPage() {
  const { id: params } = useParams();
  const dispatch = useAppDispatch();
  const decodedId = decodeId(params);
  const getByIdMedicines = useAppSelector(
    (state) => state.medicine.otherMedicines
  ) as unknown as Medicine;
  const {
    id,
    medicine_name,
    manufacturer_name,
    dose_form,
    pack_size,
    discount,
    status,
    category_id,
    created_by,
    mrp,
    description,
    product_introduction,
    images,
  } = getByIdMedicines;

  const [activeSectionId, setActiveSectionId] = useState("1");
  const sections = [
    { id: "1", title: "Product Introduction" },
    { id: "2", title: "Description" },
  ];

  // 🧩 Utility function — remove domain
  const getRelativePath = (url: string) => {
    try {
      const domain = "http://68.183.174.17";
      return url.replace(domain, "");
    } catch {
      return url;
    }
  };
  // 🧩 Find default image safely
  const primaryImage =
    images?.find((img) => img.default_image === 1) || images?.[0] || null;

  // 🧩 Build image list safely
  const imageList = React.useMemo(() => {
    if (!images || images.length === 0) return [];
    const others = images
      ?.filter((img) => img.id !== primaryImage?.id)
      ?.map((img) => getRelativePath(img.document));
    return [
      ...(primaryImage ? [getRelativePath(primaryImage.document)] : []),
      ...(others ?? []),
    ];
  }, [images, primaryImage]);

  const [selectedImage, setSelectedImage] = useState(
    "/images/product-main.jpg"
  );
  const [qty, setQty] = useState(1);
  const [selectedPack, setSelectedPack] = useState("500g");
  useEffect(() => {
    if (decodedId) dispatch(getMedicinesMenuByOtherId(decodedId));
  }, [decodedId]);

  const product: Product = {
    title:
      "Nutrabay Wellness All-Natural Plant Protein + Superfoods | For Muscles & Digestion | Gourmet Chocolate",
    brand: "Nutrabay Retail Pvt. Ltd.",
    rating: 4.3,
    ratingCount: 14,
    flavour: "Gourmet Chocolate",
    highlights: [
      "It may help in faster absorption of protein",
      "It is gluten and dairy-free",
      "It can help in managing appetite",
    ],
    packOptions: [
      { id: "500g", label: "500 gm Powder", price: 901 },
      { id: "1kg", label: "1 kg Powder", price: 1525 },
    ],
  };

  const thumbnails = [
    "/images/thumb-1.jpg",
    "/images/thumb-2.jpg",
    "/images/thumb-3.jpg",
    "/images/thumb-4.jpg",
  ];

  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openModal = (index: React.SetStateAction<number>) => {
    setSelectedIndex(index);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const modalSliderSettings = {
    ...sliderSettings,
    initialSlide: selectedIndex,
  };

  const price =
    product.packOptions.find((p) => p.id === selectedPack)?.price ??
    product.packOptions[0].price;

  const addToCart = () => {
    alert(`${product.title}\nAdded ${qty} × ${selectedPack} to cart`);
  };

  const [quantity, setQuantity] = useState(1);

  const increase = () => setQuantity((prev) => prev + 1);
  const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 150;

      sections.forEach(({ id }) => {
        const section = document.getElementById(id);
        const link = document.querySelector(`a[href="#${id}"]`);

        if (section && link) {
          const { offsetTop, offsetHeight } = section;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const singleImageSlider = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1, // Show 1 image at a time
    slidesToScroll: 1,
    arrows: true,
    initialSlide: selectedIndex,
  };

  return (
    <>
      <SiteHeader />
      <div className="page-wrapper pd_detail">
        <div className="container py-4">
          <nav aria-label="breadcrumb" style={{ fontSize: "13px" }}>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="#">Home</a>
              </li>
              {/* <li className="breadcrumb-item">
                <a href="#">All Medicine</a>
              </li> */}
              <li className="breadcrumb-item active" aria-current="page">
                {medicine_name}
              </li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-md-9 pe-4">
              <div className="view_box" id="overview">
                <div className="row">
                  <div className="col-md-8">
                    <h3 className="fw-bold">{medicine_name}</h3>

                    <div className="mb-2">
                      <div className="title">Manufacturer</div>
                      <div className="descr">{manufacturer_name}</div>
                    </div>
                    <div className="mb-2">
                      <div className="title">Pack Size</div>
                      <div className="descr">
                        <Link href="#">{pack_size}</Link>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="title fs-6">Variant (3)</div>
                      <ul className="pd_variant">
                        <li className="active">Fresh Active</li>
                        <li>Deep Impact Freshness</li>
                        <li>Cool Kick</li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-4 pb-4">
                    <Slider {...singleImageSlider}>
                      {imageList.length > 0 ? (
                        imageList.map((src, index) => (
                          <div
                            key={index}
                            onClick={() => openModal(index)}
                            style={{ cursor: "pointer" }}
                          >
                            <Image
                              src={`${mediaBase}${src}`} // ✅ Full image path
                              alt={`Product ${index + 1}`}
                              className="w-100 h-100 rounded"
                              width={100}
                              height={100}
                            />
                          </div>
                        ))
                      ) : (
                        // 🔹 Default image if no images found
                        <div>
                          <Image
                            src="/images/tnc-default.png" // 👉 default image path (put in /public/images)
                            alt="No Image Available"
                            className="w-100 h-100 rounded"
                            width={100}
                            height={100}
                            style={{ opacity: "0.3" }}
                          />
                        </div>
                      )}
                    </Slider>

                    {/* 🪟 Modal with Fullscreen Slider */}
                    <Modal
                      show={showModal}
                      onHide={closeModal}
                      size="lg"
                      centered
                    >
                      <Modal.Body>
                        <Slider {...modalSliderSettings}>
                          {imageList.map((src, index) => (
                            <div key={index}>
                              <Image
                                src={`${mediaBase}${src}`}
                                alt={`Modal Image ${index + 1}`}
                                width={800} // required
                                height={600} // required
                                className="w-100"
                                style={{
                                  maxHeight: "80vh",
                                  objectFit: "contain",
                                  width: "100%",
                                  height: "auto",
                                }}
                                priority={index === 0} // first image loads fast
                              />
                            </div>
                          ))}
                        </Slider>
                      </Modal.Body>
                    </Modal>
                  </div>
                </div>
                <div className="accordian-wrapper"></div>
              </div>
              <div className="herotab">
                <ul className="herotab_list">
                  {sections.map(({ id, title }) => (
                    <li key={id}>
                      <a
                        href="#"
                        style={{ maxWidth: "none" }}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSectionId(id);
                        }}
                        className={activeSectionId === id ? "active" : ""}
                      >
                        <span>{title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="view_box">
                <div id="2" className={activeSectionId === "2" ? "" : "d-none"}>
                  <div className="col-12">
                    <div className="mb-3">
                      <div className="sec_title">Description</div>
                      <div
                        className="descr"
                        dangerouslySetInnerHTML={{ __html: description || "" }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div id="1" className={activeSectionId === "1" ? "" : "d-none"}>
                  <div className="col-12">
                    <div className="mb-3">
                      <div className="sec_title">Product Introduction</div>
                      <div
                        className="descr"
                        dangerouslySetInnerHTML={{
                          __html: product_introduction || "",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 ps-0">
              <div className="right_section">
                <div className="view_box">
                  <div className="pd_price">
                    <span className="old_price">
                      <del>MRP ₹8.67</del>5% off
                    </span>
                  </div>
                  <div className="pd_price">
                    <span className="new_price">₹8.2</span>
                  </div>
                  <small>Inclusive of all taxes</small>

                  <div className="d-flex align-items-center my-3">
                    <button
                      onClick={decrease}
                      className="btn btn-outline-secondary px-3"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="mx-3 fs-5">{quantity}</span>
                    <button
                      onClick={increase}
                      className="btn btn-outline-secondary px-3"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button className="btn btn-primary btn-sm mb-2 py-2 w-100">
                    Add to Cart
                  </button>
                  <button className="btn btn-outline-secondary btn-sm me-2 py-2 w-100">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12 lg:px-20 d-none">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Gallery */}
              <div className="md:col-span-7 p-6 flex flex-col md:flex-row gap-6">
                <ThumbnailGallery
                  thumbnails={thumbnails}
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                />
                <div className="flex-1 flex items-start justify-center">
                  <div className="w-full max-w-lg">
                    <img
                      src={selectedImage}
                      alt="product"
                      className="w-full h-auto rounded-lg object-contain shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="md:col-span-5 p-6 flex flex-col gap-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold">
                    {product.title}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                      {product.rating} ★
                    </div>
                    <div className="text-sm text-gray-600">
                      {product.ratingCount} Ratings
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-700">Flavour</div>
                    <div className="mt-2 inline-block border rounded-md px-3 py-1 text-sm text-orange-800 bg-orange-50">
                      {product.flavour}
                    </div>
                  </div>
                  <PackSelector
                    packOptions={product.packOptions}
                    selectedPack={selectedPack}
                    setSelectedPack={setSelectedPack}
                  />
                  <ProductHighlights highlights={product.highlights} />
                </div>
                <PriceBox price={price} qty={qty} addToCart={addToCart} />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
