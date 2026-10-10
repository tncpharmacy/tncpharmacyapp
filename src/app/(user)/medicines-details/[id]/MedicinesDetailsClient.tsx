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
import HorizontalAccordionTabs from "@/app/(user)/product-details/HorizontalAccordionTabs";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getGroupCare,
  getMedicinesMenuById,
} from "@/lib/features/medicineSlice/medicineSlice";
import {
  MedicineSafety,
  SafetyFieldKeys,
  SafetyLabelKeys,
} from "@/types/medicine";
import Link from "next/link";
import Image from "next/image";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { HealthBag } from "@/types/healthBag";
import { formatPrice } from "@/lib/utils/formatPrice";
import { loadLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";
import CompareBlock, { useMedicineCompare } from "./CompareBlock";
import BuyBox from "./BuyBox";
import dynamic from "next/dynamic";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import { getSubcategories } from "@/lib/features/subCategorySlice/subCategorySlice";
import { getGenericsAllList } from "@/lib/features/genericSlice/genericSlice";
import { getManufacturersAllList } from "@/lib/features/manufacturerSlice/manufacturerSlice";
import Slider from "react-slick";
import { resolveMediaUrl } from "@/lib/media";

const Footer = dynamic(() => import("@/app/(user)/components/footer/footer"), {
  ssr: false,
});
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function MedicinesDetailsClient({
  medicine,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  medicine: any;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: params } = useParams();
  const dispatch = useAppDispatch();
  const decodedId = decodeId(params);
  // const reduxProduct = useAppSelector(
  //   (state) => state.medicine.medicinesList
  // ) as unknown as Medicine;
  const { medicinesList, loading } = useAppSelector((state) => state.medicine);

  const source = searchParams.get("src");
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

  const data = medicine || medicinesList;
  const {
    id,
    medicine_name,
    manufacturer_name,
    generic_name,
    dose_form,
    pack_size,
    prescription_required,
    discount,
    status,
    in_stock,
    category_id,
    created_by,
    mrp,
    description,
    direction_for_use,
    safety_advice,
    side_effect,
    storage,
    uses_benefits,
    images,
  } = data || {};

  const { alcohol, pregnancy, breast_feeding, driving, kidney, liver } =
    safety_advice || {};
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
    removeItem,
    mergeGuestCart,
    fetchCart,
    increaseQty,
    decreaseQty,
    updateGuestQuantity,
  } = useHealthBag({
    userId: buyer?.id || null,
  });
  const [activeSectionId, setActiveSectionId] = useState("1");
  const sections = [
    { id: "1", title: "Description" },
    { id: "2", title: "Uses and benefits" },
    { id: "3", title: "Side effects" },
    { id: "4", title: "Direction for use" },
    { id: "5", title: "Safety advice" },
  ];
  const [isMobile, setIsMobile] = useState(false);

  if (!decodedId) {
    notFound();
  }
  // "Compare before you buy" (strict equivalents, per-unit prices)
  const { compare } = useMedicineCompare(decodedId ? Number(decodedId) : null);

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
  // 3. Mapping Object (Type-safe and complete)
  const safetyFieldLabelMap: Record<SafetyFieldKeys, SafetyLabelKeys> = {
    alcohol: "alcohol_label",
    pregnancy: "pregnancy_label",
    breast_feeding: "breast_feeding_label",
    driving: "driving_label",
    kidney: "kidney_label",
    liver: "liver_label",
    heart: "heart_label",
  };
  // --- getSafetyField Function ---
  const getSafetyField = (field: SafetyFieldKeys) => {
    if (!safety_advice) return { label: "N/A", text: "No data available." };
    const labelKey = safetyFieldLabelMap[field];
    const labelObj = (safety_advice as MedicineSafety)[labelKey];
    return {
      label: labelObj?.safety_label || "N/A",
      text: safety_advice[field] || "No data available.",
    };
  };
  // --- Usage ---
  const alcoholInfo = getSafetyField("alcohol");
  const pregnancyInfo = getSafetyField("pregnancy");
  const breastFeedingInfo = getSafetyField("breast_feeding");
  const drivingInfo = getSafetyField("driving");
  const kidneyInfo = getSafetyField("kidney");
  const liverInfo = getSafetyField("liver");

  const labelColors: Record<string, string> = {
    CAUTION: "#d83ad8",
    "CONSULT YOUR DOCTOR": "#28c038",
    UNSAFE: "#598d27db",
    "N/A": "#6c757d", // Default color अगर label न मिले
  };

  const getLabelColor = (label: string): string => {
    // label.toUpperCase() का उपयोग करें ताकि केस सेंसिटिविटी की समस्या न हो
    return labelColors[label.toUpperCase()] || labelColors["N/A"];
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
      ?.map((img: any) => resolveMediaUrl(img.document));
    return [
      ...(primaryImage ? [resolveMediaUrl(primaryImage.document)] : []),
      ...(others ?? []),
    ];
  }, [images, primaryImage]);
  // ✅ check if images exist
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
        // the bag needs this for its prescription section
        prescription_required: Number(prescription_required) === 1 ? 1 : 0,
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

  // The lowest-priced strict equivalent that is cheaper than this one (the
  // TnC Trusted card can be it), for the "Same medicine from ₹x" teaser.
  const cheaperEquivalent =
    [compare?.cheapest, compare?.tnc_trusted]
      .filter((c): c is NonNullable<typeof c> => !!c && (c.saving_percent ?? 0) > 0)
      .sort((a, b) => Number(a.unit_price) - Number(b.unit_price))[0] ?? null;

  // One place for "add this medicine" (buy box, compare card, mobile bar).
  const addThisMedicine = () =>
    handleAdd({
      product_id: id,
      medicine_name,
      manufacturer_name,
      pack_size,
      mrp,
      discount,
      image: images?.[0]?.document || null,
    });

  // Trash on the quantity stepper (at 1) takes it out of the bag again.
  const removeThisMedicine = async () => {
    await removeItem(id);
    if (!buyer?.id) {
      setGuestItems((prev) => prev.filter((i) => i.productid !== id));
    }
    setQuantity(1);
  };

  // medicine details
  useEffect(() => {
    if (!medicine && decodedId) {
      dispatch(getMedicinesMenuById(decodedId));
    }
  }, [dispatch, medicine, decodedId]);

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
                  {/* all medicine */}
                  {source === "all" && (
                    <li className="breadcrumb-item text-primary">
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => router.push("/all-medicine")}
                      >
                        All Medicines
                      </span>
                    </li>
                  )}
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
                      <div className="title">Generic Strength</div>
                      <div className="descr">
                        {loading ? (
                          <div className="skeleton text-skeleton" />
                        ) : (
                          generic_name
                        )}
                      </div>
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
                    <div className="mb-3">
                      <div className="title">Storage</div>
                      <div className="descr">
                        {loading ? (
                          <div className="skeleton text-skeleton" />
                        ) : (
                          storage
                        )}
                      </div>
                    </div>
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
                                  <Image
                                    src={fullUrl}
                                    alt={`Product ${index + 1}`}
                                    width={300}
                                    height={300}
                                    className="product-image"
                                    loading="lazy"
                                    onError={(e) => {
                                      const target =
                                        e.currentTarget as HTMLImageElement;
                                      target.src = "/images/tnc-default.png";
                                      console.warn(
                                        "[PRODUCT IMAGE] failed to load:",
                                        fullUrl
                                      );
                                    }}
                                    unoptimized
                                  />
                                </div>
                              );
                            })
                          ) : (
                            <div className="product-image-box">
                              <Image
                                src="/images/tnc-default.png"
                                alt="Medicine Default Image"
                                width={300}
                                height={300}
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
                          <Slider key={selectedIndex} {...modalSliderSettings}>
                            {imageList.map((src, index) => {
                              const cleanedBase = (mediaBase || "").replace(
                                /\/+$/,
                                ""
                              );
                              const cleanedSrc = (src || "").replace(
                                /^\/+/,
                                ""
                              );
                              const fullUrl = cleanedBase
                                ? `${cleanedBase}/${cleanedSrc}`
                                : src;

                              return (
                                <div key={index}>
                                  <Image
                                    src={fullUrl}
                                    alt={`Modal Image ${index + 1}`}
                                    width={800}
                                    height={600}
                                    className="w-100"
                                    style={{
                                      maxHeight: "80vh",
                                      objectFit: "contain",
                                    }}
                                    unoptimized
                                  />
                                </div>
                              );
                            })}
                          </Slider>
                        </Modal.Body>
                      </Modal>
                    </div>
                  )}
                </div>
                {!isMobile && <div className="accordian-wrapper"></div>}
              </div>
              <div id="compare">
                <CompareBlock
                  compare={compare}
                  isInBag={isInBag}
                  onAdd={addThisMedicine}
                  onGoToBag={() => router.push("/health-bag")}
                />
              </div>
              <HorizontalAccordionTabs id={id} />
              <div className="herotab">
                <ul className="herotab_list">
                  {sections.map(({ id, title }) => (
                    <li key={id}>
                      <a
                        href="#"
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
                <div id="1" className={activeSectionId === "1" ? "" : "d-none"}>
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

                <div id="2" className={activeSectionId === "2" ? "" : "d-none"}>
                  <div className="col-12">
                    <div className="mb-3">
                      <div className="sec_title">Uses and benefits</div>
                      <div
                        className="descr"
                        dangerouslySetInnerHTML={{
                          __html: uses_benefits || "",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div id="3" className={activeSectionId === "3" ? "" : "d-none"}>
                  <div className="col-12">
                    <div className="mb-3">
                      <div className="sec_title">Side effects</div>
                      <div
                        className="descr"
                        dangerouslySetInnerHTML={{ __html: side_effect || "" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div id="4" className={activeSectionId === "4" ? "" : "d-none"}>
                  <div className="col-12">
                    <div className="mb-3">
                      <div className="sec_title">Direction for use</div>
                      <div
                        className="descr"
                        dangerouslySetInnerHTML={{
                          __html: direction_for_use || "",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div id="5" className={activeSectionId === "5" ? "" : "d-none"}>
                  <div className="col-12">
                    <div className="mb-3">
                      <div className="sec_title">Safety Advice</div>

                      <div className="title">
                        Alcohol{" "}
                        <small
                          style={{
                            color: getLabelColor(alcoholInfo.label),
                          }}
                        >
                          ({alcoholInfo.label})
                        </small>
                      </div>
                      <div className="descr">{alcoholInfo.text}</div>
                      <div className="title">
                        Driving{" "}
                        <small
                          style={{
                            color: getLabelColor(alcoholInfo.label),
                          }}
                        >
                          ({drivingInfo.label})
                        </small>
                      </div>
                      <div className="descr">{drivingInfo.text}</div>
                      <div className="title">
                        Pregnancy{" "}
                        <small
                          style={{
                            color: getLabelColor(pregnancyInfo.label),
                          }}
                        >
                          ({pregnancyInfo.label})
                        </small>
                      </div>
                      <div className="descr">{pregnancyInfo.text}</div>

                      <div className="title">
                        Breast feeding{" "}
                        <small
                          style={{
                            color: getLabelColor(breastFeedingInfo.label),
                          }}
                        >
                          ({breastFeedingInfo.label})
                        </small>
                      </div>
                      <div className="descr">{breastFeedingInfo.text}</div>

                      <div className="title">
                        Kidney{" "}
                        <small
                          style={{
                            color: getLabelColor(breastFeedingInfo.label),
                          }}
                        >
                          ({kidneyInfo.label})
                        </small>
                      </div>
                      <div className="descr">{kidneyInfo.text}</div>

                      <div className="title">
                        Liver{" "}
                        <small
                          style={{
                            color: getLabelColor(breastFeedingInfo.label),
                          }}
                        >
                          ({liverInfo.label})
                        </small>
                      </div>
                      <div className="descr">{liverInfo.text}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 ps-0 d-none d-md-block">
              <div className="right_section">
                <div className="view_box">
                  <BuyBox
                    loading={loading}
                    rx={prescription_required === 1}
                    price={totalPrice}
                    mrp={mrp}
                    discount={discount}
                    unitPrice={compare?.selected.unit_price ?? null}
                    unitLabel={compare?.selected.unit_label ?? null}
                    inStock={in_stock !== false}
                    isInBag={isInBag}
                    quantity={quantity}
                    busy={processingIds.includes(id)}
                    onIncrease={increase}
                    onDecrease={decrease}
                    onRemove={removeThisMedicine}
                    onAdd={addThisMedicine}
                    onGoToBag={() => router.push("/health-bag")}
                    cheapest={cheaperEquivalent}
                    onCompare={() =>
                      document
                        .getElementById("compare")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== MOBILE STICKY HEALTH BAG ===== */}
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
                  else addThisMedicine();
                }}
                disabled={
                  processingIds.includes(id) ||
                  (in_stock === false && !isInBag)
                }
              >
                {processingIds.includes(id)
                  ? "Processing..."
                  : isInBag
                  ? "✓ Go to bag"
                  : in_stock === false
                  ? "Out of Stock"
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
