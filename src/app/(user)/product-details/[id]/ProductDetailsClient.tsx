"use client";
import React, { useEffect, useState } from "react";
import "../../css/site-style.css";
import "../../css/user-style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Modal } from "react-bootstrap";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { decodeId, encodeId } from "@/lib/utils/encodeDecode";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getGroupCare,
  getMedicinesMenuByOtherId,
} from "@/lib/features/medicineSlice/medicineSlice";
import { Medicine } from "@/types/medicine";
import Link from "next/link";
import Image from "next/image";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { HealthBag } from "@/types/healthBag";
import { formatAmount } from "@/lib/utils/formatAmount";
import { formatPrice } from "@/lib/utils/formatPrice";
import { loadLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";
import dynamic from "next/dynamic";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import { getSubcategories } from "@/lib/features/subCategorySlice/subCategorySlice";
import { fetchGenericAllList } from "@/lib/api/generic";
import { getGenericsAllList } from "@/lib/features/genericSlice/genericSlice";
import { getManufacturersAllList } from "@/lib/features/manufacturerSlice/manufacturerSlice";

const Slider = dynamic(() => import("react-slick"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/app/(user)/components/footer/footer"), {
  ssr: false,
});
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductDetailsClient({ product }: { product: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: params } = useParams();
  const dispatch = useAppDispatch();
  const decodedId = decodeId(params);
  const { otherMedicines, loading } = useAppSelector((state) => state.medicine);

  const catParam = searchParams.get("cat");
  const subParam = searchParams.get("sub");
  const genParam = searchParams.get("gen");
  const manufParam = searchParams.get("manuf");
  const groupParam = searchParams.get("group");
  const groupId = decodeId(groupParam || undefined);
  const manufId = decodeId(manufParam || undefined);
  const genericId = decodeId(genParam || undefined);
  const categoryId = decodeId(catParam || undefined);
  const subCategoryId = decodeId(subParam || undefined);
  const { list: categories } = useAppSelector((state) => state.category);
  const { list: subCategories } = useAppSelector((state) => state.subcategory);
  const { list: generics } = useAppSelector((state) => state.generic);
  const { list: manufacturers } = useAppSelector((state) => state.manufacturer);
  const { groupCare: groups } = useAppSelector((state) => state.medicine);

  const categoryName = categories.find(
    (c) => c.id === categoryId
  )?.category_name;

  const subCategoryName = subCategories.find(
    (s) => s.id === subCategoryId
  )?.sub_category_name;

  const genericName = generics.find(
    (g) => g.id_generic === genericId
  )?.generic_name;

  const groupName = groups.find((g) => g.id === groupId)?.group_name;

  const manufacturerName = manufacturers.find(
    (m) => m.id_manufacturer === manufId
  )?.manufacturer_name;

  const data = product || otherMedicines;
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
    prescription_required,
    mrp,
    description,
    product_introduction,
    images,
  } = data || {};

  const [activeSectionId, setActiveSectionId] = useState("1");
  const [quantity, setQuantity] = useState(1);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  // --- Local states for instant UI ---
  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  // for modal open and close state
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // start for increse header count code
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const {
    items: bagItem,
    addItem,
    mergeGuestCart,
    increaseQty,
    decreaseQty,
    updateGuestQuantity,
  } = useHealthBag({
    userId: buyer?.id || null,
  });

  const sections = [
    { id: "1", title: "Product Introduction" },
    { id: "2", title: "Description" },
  ];
  const [isMobile, setIsMobile] = useState(false);

  if (!decodedId) {
    notFound();
  }
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getSubcategories());
    dispatch(getGenericsAllList());
    dispatch(getManufacturersAllList());
    dispatch(getGroupCare());
  }, [dispatch]);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?.images?.find((img: any) => img.default_image === 1) ||
    data?.images?.[0] ||
    null;

  // 🧩 Build image list safely
  const imageList = React.useMemo(() => {
    if (!images || images.length === 0) return [];
    const others = images
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.filter((img: any) => img.id !== primaryImage?.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((img: any) => getRelativePath(img.document));
    return [
      ...(primaryImage ? [getRelativePath(primaryImage.document)] : []),
      ...(others ?? []),
    ];
  }, [images, primaryImage]);

  const hasImages = imageList && imageList.length > 0;

  useEffect(() => {
    if (!id || !bagItem) return;

    const existingItem = bagItem.find(
      (i) => i.productid === id || i.product_id === id
    );

    if (existingItem) {
      setQuantity(Number(existingItem.qty || existingItem.quantity) || 1);
    } else {
      setQuantity(1);
    }
  }, [id, bagItem]);

  useEffect(() => {
    if (buyer?.id) return;

    const ls = localStorage.getItem("healthbag");
    if (!ls) return;

    try {
      const items = JSON.parse(ls);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingItem = items.find((i: any) => i.productid === id);

      if (existingItem) {
        setQuantity(existingItem.qty || 1);
      }
    } catch {}
  }, [id, buyer?.id]);

  // --- Sync localBag with Redux items ---
  useEffect(() => {
    const newLocalBag = bagItem?.length ? bagItem.map((i) => i.productid) : [];

    // Prevent infinite loop — only update if changed
    if (JSON.stringify(newLocalBag) !== JSON.stringify(localBag)) {
      setLocalBag(newLocalBag);
    }
  }, [bagItem, localBag]);

  const isInBag =
    localBag.includes(id) ||
    bagItem.some((i) => i.productid === id || i.product_id === id);

  // Merge guest cart into logged-in cart once
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id, mergeGuestCart]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [guestItems, setGuestItems] = useState<any[]>([]);
  useEffect(() => {
    if (!buyer?.id) {
      const lsData = localStorage.getItem("healthbag");

      if (!lsData) {
        setGuestItems([]); // 🔥 ensure empty
        return;
      }

      try {
        setGuestItems(JSON.parse(lsData));
      } catch {
        setGuestItems([]);
      }
    }
  }, [buyer?.id]);
  // --- Handlers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAdd = async (item: any) => {
    if (buyer?.id) {
      await addItem({
        id: 0,
        buyer_id: buyer?.id,
        product_id: item.product_id,
        quantity: quantity, // ✅ FIXED (dynamic qty)
      } as HealthBag);
    } else {
      const newItem = {
        id: 0,
        productid: item.product_id,

        // ✅ FIXED qty
        qty: quantity,

        // ✅ FIXED DATA
        name: item.medicine_name,
        manufacturer: item.manufacturer_name,
        pack_size: item.pack_size,

        // ✅ FIXED pricing
        mrp: Number(item.mrp ?? 0),
        discount: Number(item.discount ?? 0),

        // ✅ image fix
        image: item.image || images?.[0]?.document || null,
      };

      const exists = guestItems.find((i) => i.productid === item.product_id);

      let updated;

      if (exists) {
        updated = guestItems.map((i) =>
          i.productid === item.product_id
            ? { ...i, qty: quantity } // 🔥 replace instead of +1
            : i
        );
      } else {
        updated = [...guestItems, newItem];
      }

      localStorage.setItem("healthbag", JSON.stringify(updated));
      setGuestItems(updated);
      dispatch(loadLocalHealthBag());
    }
  };

  useEffect(() => {
    if (!product && decodedId) {
      dispatch(getMedicinesMenuByOtherId(decodedId));
    }
  }, [dispatch, decodedId, product]);

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

  const mrps = Number(data?.mrp ?? 0);
  const discounts = Number(data?.discount ?? 0);

  useEffect(() => {
    // safe calculation with fallback
    if (!isNaN(mrps) && !isNaN(discounts)) {
      const calcDiscounted = mrps - (mrps * discounts) / 100;
      setDiscountedPrice(calcDiscounted);
    }
  }, [mrps, discounts]);

  const existingItem = bagItem.find(
    (i) => i.productid === id || i.product_id === id
  );
  // ✅ Quantity change handlers
  const increase = async () => {
    const newQty = quantity + 1;
    setQuantity(newQty);

    if (!existingItem) return;

    // ✅ LOGIN USER
    if (buyer?.id) {
      await increaseQty(existingItem.id, id, newQty);
    }
    // ✅ GUEST USER
    else {
      updateGuestQuantity(id, newQty);
      dispatch(loadLocalHealthBag());
    }
  };
  const decrease = async () => {
    if (quantity <= 1) return;

    const newQty = quantity - 1;
    setQuantity(newQty);

    if (!existingItem) return;

    // ✅ LOGIN USER
    if (buyer?.id) {
      await decreaseQty(existingItem.id, id, newQty);
    }
    // ✅ GUEST USER
    else {
      updateGuestQuantity(id, newQty);
      dispatch(loadLocalHealthBag());
    }
  };

  // ✅ Final total price (depends on qty)
  // const totalPrice = (discountedPrice * quantity).toFixed(2);
  const totalPrice = Number(discountedPrice.toFixed(2));

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

  interface ArrowProps {
    onClick?: () => void;
  }

  const NextArrow: React.FC<ArrowProps> = ({ onClick }) => (
    <div
      // className="slick-arrow slick-next"
      onClick={onClick}
      style={{
        right: "-25px",
        zIndex: 2,
        cursor: "pointer",
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <i
        className="bi bi-chevron-right fs-6 text-dark"
        style={{ color: "rgb(137 141 145) !important" }}
      ></i>
    </div>
  );

  const PrevArrow: React.FC<ArrowProps> = ({ onClick }) => (
    <div
      // className="slick-arrow slick-prev"
      onClick={onClick}
      style={{
        left: "-25px",
        zIndex: 2,
        cursor: "pointer",
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <i
        className="bi bi-chevron-left fs-6 text-dark"
        style={{ color: "rgb(137 141 145) !important" }}
      ></i>
    </div>
  );

  const singleImageSlider = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1, // Show 1 image at a time
    slidesToScroll: 1,
    arrows: true,
    initialSlide: selectedIndex,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  const RenderPriceBox = () => (
    <div className="right_section">
      <div className="view_box">
        <div className="pd_price">
          <span className="old_price">
            <del>MRP ₹{formatAmount(mrp ?? 0).toLocaleString()}</del> {discount}
            % off
          </span>
        </div>

        <div className="pd_price">
          <span className="new_price">
            ₹{formatAmount(totalPrice ?? 0).toLocaleString()}
          </span>
        </div>
        <small>Inclusive of all taxes</small>

        <div className="d-flex align-items-center my-3">
          <button
            onClick={decrease}
            disabled={quantity <= 1}
            className={`btn btn-outline-secondary px-3 ${
              quantity <= 1 ? "disabled-btn" : ""
            }`}
          >
            −
          </button>
          <span className="mx-3 fs-5">{quantity}</span>
          <button onClick={increase} className="btn btn-outline-secondary px-3">
            +
          </button>
        </div>

        <button
          className="btn btn-sm mb-2 py-2 w-100 btn-primary"
          onClick={() => {
            if (isInBag) router.push("/health-bag");
            else
              handleAdd({
                product_id: id,
                medicine_name,
                manufacturer_name,
                pack_size,
                mrp,
                discount,
                image: images?.[0]?.document || null,
              });
          }}
          disabled={processingIds.includes(id)}
        >
          {processingIds.includes(id)
            ? "Processing..."
            : isInBag
            ? "Go To Health Bag"
            : "Add to Health Bag"}
        </button>
      </div>
    </div>
  );

  console.log("manu", manufacturerName);
  return (
    <>
      {/* <SiteHeader /> */}
      <div className="page-wrapper pd_detail">
        <div className="container py-4">
          <nav aria-label="breadcrumb" style={{ fontSize: "13px" }}>
            <ol className="breadcrumb">
              <nav aria-label="breadcrumb" style={{ fontSize: "13px" }}>
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link href="/" style={{ textDecoration: "none" }}>
                      Home
                    </Link>
                  </li>
                  {/* all-product */}
                  {categoryName && (
                    <li className="breadcrumb-item text-primary">
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          router.push(`/all-product/${encodeId(categoryId!)}`)
                        }
                      >
                        {categoryName}
                      </span>
                    </li>
                  )}
                  {/* all-generic */}
                  {genericName && (
                    <li className="breadcrumb-item text-primary">
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          router.push(`/all-generic/${encodeId(genericId!)}`)
                        }
                      >
                        {genericName}
                      </span>
                    </li>
                  )}
                  {/* all-manufacturer */}
                  {manufacturerName && (
                    <li className="breadcrumb-item text-primary">
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          router.push(`/all-manufacturer/${encodeId(manufId!)}`)
                        }
                      >
                        {manufacturerName}
                      </span>
                    </li>
                  )}
                  {/* all-group-care */}
                  {groupName && (
                    <li className="breadcrumb-item text-primary">
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          router.push(`/all-group-care/${encodeId(groupId!)}`)
                        }
                      >
                        {groupName}
                      </span>
                    </li>
                  )}
                  {/* all-products */}
                  {subCategoryName && (
                    <li className="breadcrumb-item text-primary">
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          router.push(
                            `/all-products/${encodeId(categoryId!)}/${encodeId(
                              subCategoryId!
                            )}`
                          )
                        }
                      >
                        {subCategoryName}
                      </span>
                    </li>
                  )}
                  <li className="breadcrumb-item active" aria-current="page">
                    {medicine_name}
                  </li>
                </ol>
              </nav>
            </ol>
          </nav>

          <div className="row">
            <div className="col-md-9 pe-4">
              <div className="view_box" id="overview">
                <div className="row">
                  <div
                    className={`col-md-8 product-info-col ${
                      !hasImages && isMobile ? "col-12" : ""
                    }`}
                  >
                    <h1 className="fs-3 fw-bold">
                      {loading ? (
                        <div className="skeleton title-skeleton" />
                      ) : (
                        medicine_name
                      )}
                    </h1>
                    <div className="mb-4">
                      {typeof prescription_required === "number" ? (
                        prescription_required === 1 ? (
                          <div className="descr d-flex align-items-center">
                            <Image
                              src="/images/RX-small.png"
                              alt="Prescription Required"
                              width={28} // same as your inline width
                              height={28} // required prop
                              style={{ marginRight: "10px" }}
                            />
                            Prescription Required
                          </div>
                        ) : (
                          <div className="descr">No Prescription Required</div>
                        )
                      ) : (
                        // Ye blank placeholder SSR ke liye taaki hydration error na aaye
                        <div className="descr" suppressHydrationWarning>
                          &nbsp;
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <div className="title">Manufacturer</div>
                      <div className="descr">
                        {loading ? (
                          <div className="skeleton text-skeleton" />
                        ) : (
                          manufacturer_name
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="title">Pack Size</div>
                      <div className="descr">
                        {loading ? (
                          <div className="skeleton text-skeleton" />
                        ) : (
                          pack_size
                        )}
                      </div>
                    </div>
                    {/* <div className="mb-4">
                      <div className="title fs-6">Variant (3)</div>
                      <ul className="pd_variant">
                        <li className="active">Fresh Active</li>
                        <li>Deep Impact Freshness</li>
                        <li>Cool Kick</li>
                      </ul>
                    </div> */}
                  </div>
                  {(hasImages || !isMobile) && (
                    <div className="col-md-4 pb-4 justify-content-center align-items-center product-image-col">
                      {loading ? (
                        <div className="image-skeleton" />
                      ) : (
                        <Slider {...singleImageSlider}>
                          {imageList && imageList.length > 0 ? (
                            imageList.map((rawSrc, index) => {
                              // normalize mediaBase + rawSrc into a full URL safely
                              const cleanedBase = (mediaBase || "").replace(
                                /\/+$/,
                                ""
                              );
                              const cleanedSrc = (rawSrc || "").replace(
                                /^\/+/,
                                ""
                              );
                              const fullUrl = cleanedBase
                                ? `${cleanedBase}/${cleanedSrc}`
                                : rawSrc;

                              return (
                                <div
                                  key={index}
                                  onClick={() => openModal(index)}
                                  className="product-image-box"
                                >
                                  <img
                                    src={fullUrl}
                                    alt={`Product ${index + 1}`}
                                    className="product-image"
                                    loading="lazy"
                                    onError={(e) => {
                                      // show fallback if image load fails
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src =
                                        "/images/tnc-default.png";
                                      // eslint-disable-next-line no-console
                                      console.warn(
                                        "[PRODUCT IMAGE] failed to load:",
                                        fullUrl
                                      );
                                    }}
                                  />
                                </div>
                              );
                            })
                          ) : (
                            <div className="product-image-box">
                              <img
                                src="/images/tnc-default.png"
                                alt=""
                                className="product-image"
                                style={{ opacity: "0.3" }}
                              />
                            </div>
                          )}
                        </Slider>
                      )}

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
                  )}
                </div>
                <div className="accordian-wrapper"></div>
              </div>{" "}
              {/* {isMobile && (
                <div className="mobile-price-box mt-3">
                  <RenderPriceBox />
                </div>
              )} */}
              <div className="herotab product-tabs">
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
                      <div className="descr">
                        {loading ? (
                          <div className="skeleton big-text-skeleton" />
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: description || "",
                            }}
                          />
                        )}
                      </div>
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
            <div className="col-md-3 ps-0 price-box-col d-none d-md-block">
              <div className="right_section">
                <div className="view_box">
                  {/* MRP and Discount */}
                  <div className="pd_price">
                    {loading ? (
                      <div className="skeleton price-skeleton" />
                    ) : (
                      <>
                        <span className="old_price">
                          <del>MRP ₹{formatPrice(mrp ?? 0)}</del> {discount}%
                          off
                        </span>
                        <span className="new_price">
                          ₹{formatPrice(totalPrice ?? 0)}
                        </span>
                      </>
                    )}
                  </div>
                  <small>Inclusive of all taxes</small>

                  {/* Quantity control */}
                  <div className="d-flex align-items-center my-3">
                    <button
                      onClick={decrease}
                      disabled={quantity <= 1}
                      className={`btn btn-outline-secondary px-3 ${
                        quantity <= 1 ? "disabled-btn" : ""
                      }`}
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

                  {/* Add to Health Bag */}

                  <button
                    className={`btn btn-sm mb-2 py-2 w-100 ${
                      isInBag ? "btn-primary" : "btn-primary"
                    }`}
                    onClick={() => {
                      if (isInBag) {
                        router.push("/health-bag"); // redirect page
                      } else {
                        handleAdd({
                          product_id: id,
                          medicine_name,
                          manufacturer_name,
                          pack_size,
                          mrp,
                          discount,
                          image: images?.[0]?.document || null,
                        });
                      }
                    }}
                    disabled={processingIds.includes(id)}
                  >
                    {processingIds.includes(id)
                      ? "Processing..."
                      : isInBag
                      ? "Go To Health Bag"
                      : "Add to Health Bag"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE STICKY ADD TO BAG */}
        {isMobile && (
          <div className="mobile-sticky-cart d-md-none">
            <div className="msc-inner">
              <div className="msc-price">
                ₹{formatPrice(totalPrice ?? 0)}
                <span>Inclusive of all taxes</span>
              </div>

              <div className="msc-qty">
                <button
                  onClick={decrease}
                  disabled={quantity <= 1}
                  className={quantity <= 1 ? "disabled-minus" : ""}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button onClick={increase}>+</button>
              </div>

              <button
                className="msc-btn"
                onClick={() => {
                  if (isInBag) router.push("/health-bag");
                  else handleAdd({ product_id: id });
                }}
                disabled={processingIds.includes(id)}
              >
                {processingIds.includes(id)
                  ? "Processing..."
                  : isInBag
                  ? "Go To Bag"
                  : "Add to Bag"}
              </button>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
}
