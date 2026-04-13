"use client";
import React, { useEffect, useState } from "react";
import "../../css/site-style.css";
import "../../css/user-style.css";
import SiteHeader from "@/app/user/components/header/header";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Modal } from "react-bootstrap";
import { useParams, useRouter } from "next/navigation";
import { decodeId, encodeId } from "@/lib/utils/encodeDecode";
import HorizontalAccordionTabs from "@/app/user/product-details/HorizontalAccordionTabs";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getMedicineByGenericId,
  getMedicinesMenuById,
  getMedicinesMenuByOtherId,
} from "@/lib/features/medicineSlice/medicineSlice";
import {
  Medicine,
  MedicineSafety,
  SafetyFieldKeys,
  SafetyLabelKeys,
} from "@/types/medicine";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/app/user/components/footer/footer";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { HealthBag } from "@/types/healthBag";
import { formatAmount } from "@/lib/utils/formatAmount";
import { formatPrice } from "@/lib/utils/formatPrice";
import { loadLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";
import GenericModalMobileCard from "../../components/MedicineCard/GenericModalMobileCard";

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
type CompareMedicine = Medicine & {
  finalPrice: number;
  isCurrent: boolean;
};
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
  const router = useRouter();
  const { id: params } = useParams();
  const dispatch = useAppDispatch();
  const decodedId = decodeId(params);
  const getByIdMedicines = useAppSelector(
    (state) => state.medicine.medicinesList
  ) as unknown as Medicine;

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
  } = getByIdMedicines;
  const { alcohol, pregnancy, breast_feeding, driving, kidney, liver } =
    safety_advice || {};
  const [quantity, setQuantity] = useState(1);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  // --- Local states for instant UI ---
  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
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

  //new state for top 2 generic
  // const [topGenerics, setTopGenerics] = useState<Medicine[]>([]);
  const [showGenericModal, setShowGenericModal] = useState(false);
  const genericListRaw = useAppSelector(
    (state) => state.medicine.genericAlternativesMedicines
  );

  const genericList: Medicine[] = Array.isArray(genericListRaw)
    ? genericListRaw
    : genericListRaw
    ? [genericListRaw]
    : [];

  const getFinalPrice = (
    mrp?: number | string | null,
    discount?: number | string | null
  ) => {
    const m = parseFloat(String(mrp ?? 0)) || 0;
    const d = parseFloat(String(discount ?? 0)) || 0;

    return m - (m * d) / 100;
  };
  // useEffect(() => {
  //   if (!genericList.length || !mrp) return;

  //   const currentPrice = Number(mrp) - (Number(mrp) * Number(discount)) / 100;

  //   const cheaperGenerics = genericList
  //     .filter((g) => g.id !== id) // remove same medicine
  //     .map((g) => {
  //       const price = Number(g.mrp ?? 0);
  //       const disc = Number(g.discount ?? 0);
  //       const finalPrice = price - (price * disc) / 100;

  //       return { ...g, finalPrice };
  //     })
  //     .filter((g) => g.finalPrice < currentPrice) // only cheaper
  //     .sort((a, b) => a.finalPrice - b.finalPrice) // lowest first
  //     .slice(0, 2); // TOP 2

  //   setTopGenerics(cheaperGenerics);
  // }, [genericList, mrp, discount, id]);

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
  // ✅ check if images exist
  const hasImages = imageList && imageList.length > 0;

  const [selectedImage, setSelectedImage] = useState(
    "/images/product-main.jpg"
  );

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

  const handleRemove = async (productId: number) => {
    setLocalBag((prev) => prev.filter((id) => id !== productId));
    setProcessingIds((prev) => [...prev, productId]);
    try {
      await removeItem(productId);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const [qty, setQty] = useState(1);
  const [selectedPack, setSelectedPack] = useState("500g");

  // medicine details
  useEffect(() => {
    if (decodedId) {
      dispatch(getMedicinesMenuById(decodedId));
    }
  }, [dispatch, decodedId]);

  // generic medicines
  useEffect(() => {
    if (!getByIdMedicines) return;

    // console.log("Medicine:", getByIdMedicines.id);
    // console.log("Generic ID:", getByIdMedicines.generic_id);

    const genericId = Number(getByIdMedicines.generic_id);

    if (genericId > 0) {
      dispatch(getMedicineByGenericId({ id: genericId }));
    }
  }, [dispatch, getByIdMedicines]);

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

  const mrps = Number(getByIdMedicines?.mrp ?? 0);
  const discounts = Number(getByIdMedicines?.discount ?? 0);

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

  const currentPrice = getFinalPrice(mrp, discount);
  // check if any cheaper generic exists
  const hasCheaper = genericList.some((g) => {
    if (Number(g.id) === Number(id)) return false;

    const price = getFinalPrice(g.mrp, g.discount);
    return price > 0 && price < currentPrice;
  });
  // STEP 1 — calculate all generics with price
  const allGenericsWithPrice = (genericList || [])
    .filter((g) => Number(g.id) !== Number(id))
    .map((g) => ({
      ...g,
      finalPrice: getFinalPrice(g.mrp, g.discount),
    }))
    .filter((g) => g.finalPrice > 0);

  // STEP 2 — ONLY those cheaper than current medicine
  const cheaperThanCurrent = allGenericsWithPrice.filter(
    (g) => g.finalPrice < currentPrice
  );

  // STEP 3 — sort cheapest first
  const sortedCheaper = cheaperThanCurrent.sort(
    (a, b) => a.finalPrice - b.finalPrice
  );

  // STEP 4 — take maximum 2 (may be 1 or 0)
  const topCheaperGenerics: CompareMedicine[] = sortedCheaper
    .slice(0, 3)
    .map((g) => ({
      ...g, // 👈 FULL object rakho
      finalPrice: getFinalPrice(g.mrp, g.discount),
      isCurrent: false,
    }));
  const sortedGenerics = topCheaperGenerics;
  // Take TOP 2 cheaper ones
  // const top2Cheaper = cheaperGenerics;
  // ---- Build Generic List (sorted by price)
  // const sortedGenerics = (genericList || [])
  //   .filter((g) => g.id !== id)
  //   .map((g) => ({
  //     ...g,
  //     finalPrice: getFinalPrice(g.mrp, g.discount),
  //   }))
  //   .filter((g) => g.finalPrice > 0)
  //   .sort((a, b) => a.finalPrice - b.finalPrice)
  //   .slice(0, 2); // only 2 alternatives

  // ---- Calculate Saving % vs Current Medicine ----
  const savingPercents = topCheaperGenerics.map((g) => {
    const diff = currentPrice - g.finalPrice;
    return diff > 0 ? Math.round((diff / currentPrice) * 100) : 0;
  });

  const minSaving = savingPercents.length ? Math.min(...savingPercents) : 0;

  const maxSaving = savingPercents.length ? Math.max(...savingPercents) : 0;

  // Show banner only if real cheaper exists
  const showSavingBanner = topCheaperGenerics.length > 0;

  // ---- Inject Current Medicine at Top
  const currentMedicine: CompareMedicine = {
    ...getByIdMedicines, // full medicine object from API
    finalPrice: currentPrice,
    isCurrent: true,
  };
  const finalCompareList: CompareMedicine[] = [
    currentMedicine,
    ...topCheaperGenerics,
  ];
  const isScrollable = finalCompareList.length > 3;
  const savingPercent =
    sortedGenerics.length > 0
      ? Math.round(
          ((currentPrice - sortedGenerics[0].finalPrice) / currentPrice) * 100
        )
      : 0;

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
      className="slick-arrow slick-next"
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
      className="slick-arrow slick-prev"
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getMedicineImage = (medicine: any) => {
    if (medicine.primary_image) return medicine.primary_image;

    if (medicine.images?.length) {
      const primary =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        medicine.images.find((i: any) => i.default_image === 1) ||
        medicine.images[0];

      return `${mediaBase}${primary.document}`;
    }

    return "/images/tnc-default.png";
  };

  const renderGenericCompare = () => {
    if (!hasCheaper) return null;

    return (
      <>
        {showSavingBanner && (
          <div className="generic-saving-banner">
            {minSaving === maxSaving
              ? `Save ${maxSaving}% on alternative generics`
              : `Save ${minSaving}% to ${maxSaving}% on alternative generics`}
          </div>
        )}
        {finalCompareList.map((g, index) => {
          const imageUrl = getMedicineImage(g);

          const packSize = g.pack_size?.toLowerCase() || "";

          // ✅ ONLY allow tablet/capsule
          const isUnitBased =
            packSize.includes("tab") ||
            packSize.includes("tablet") ||
            packSize.includes("cap") ||
            packSize.includes("capsule");

          // ✅ extract quantity
          const packQty =
            parseInt(String(g.pack_size).match(/\d+/)?.[0] || "0") || 0;

          // ✅ calculate ONLY if valid
          const perUnit =
            isUnitBased && packQty > 0
              ? (g.finalPrice / packQty).toFixed(2)
              : null;

          // ✅ unit name
          let unit: string | null = null;

          if (packSize.includes("tab")) unit = "tablet";
          else if (packSize.includes("cap")) unit = "capsule";

          return (
            <div
              key={`compare-${g.id}-${index}`}
              className={`generic-row-card ${g.isCurrent ? "current" : ""}`}
              onClick={() => {
                if (!g.isCurrent) {
                  setShowGenericModal(false);
                  router.push(`/medicines-details/${encodeId(g.id)}`);
                }
              }}
            >
              <div className="generic-img-wrap">
                <img
                  src={imageUrl}
                  alt={g.medicine_name}
                  style={{
                    opacity: imageUrl.includes("tnc-default") ? 0.35 : 1,
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "/images/tnc-default.png";
                    e.currentTarget.style.opacity = "0.35";
                  }}
                />
              </div>

              <div className="generic-content">
                <div className="generic-name">{g.medicine_name}</div>

                {g.isCurrent && (
                  <div className="viewing-badge">Currently Viewing</div>
                )}

                <div className="generic-composition">{g.generic_name}</div>
                <div className="generic-company">{g.manufacturer_name}</div>

                <div className="generic-price">
                  ₹{formatPrice(g.finalPrice)}
                </div>

                {perUnit && unit && (
                  <div className="per-tablet">
                    ₹{perUnit} per {"unit"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </>
    );
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getSafeImageUrl = (images?: any[]) => {
    if (!images || images.length === 0) {
      return "/images/tnc-default.png";
    }

    const primary =
      images.find((img) => img.default_image === 1)?.document ||
      images[0]?.document;

    if (!primary) return "/images/tnc-default.png";

    const cleanedBase = (mediaBase || "").replace(/\/+$/, "");
    const cleanedSrc = (primary || "").replace(/^\/+/, "");

    return cleanedBase
      ? `${cleanedBase}/${cleanedSrc}`
      : "/images/tnc-default.png";
  };

  const getModalSize = (): "sm" | "lg" | "xl" | undefined => {
    const count = finalCompareList.length;

    if (count >= 4) return "xl";
    if (count === 3) return "lg";
    if (count === 2) return undefined; // 👈 default = md feel
    return "sm";
  };
  return (
    <>
      <SiteHeader />
      <div className="page-wrapper pd_detail">
        <div className="container py-4">
          <nav aria-label="breadcrumb" style={{ fontSize: "13px" }}>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
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
                  <div
                    className={`col-md-8 medicine-info-col ${
                      !hasImages && isMobile ? "col-12" : ""
                    }`}
                  >
                    <h1 className="fs-3 fw-bold">{medicine_name}</h1>
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
                      <div className="descr">{generic_name}</div>
                    </div>
                    <div className="mb-3">
                      <div className="title">Manufacturer</div>
                      <div className="descr">{manufacturer_name}</div>
                    </div>
                    <div className="mb-3">
                      <div className="title">Pack Size</div>
                      <div className="descr">{pack_size}</div>
                    </div>
                    <div className="mb-3">
                      <div className="title">Storage</div>
                      <div className="descr">{storage}</div>
                    </div>
                  </div>
                  {(hasImages || !isMobile) && (
                    <div className="col-md-4 pb-4 justify-content-center align-items-center medicine-image-col">
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

                            // debug log (remove after debugging)
                            // eslint-disable-next-line no-console
                            console.log(
                              `[PRODUCT IMAGE] index=${index} ->`,
                              fullUrl
                            );

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
                              alt="No Image Available"
                              className="product-image"
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
                        <Modal.Body className="product-modal-body">
                          <Slider {...modalSliderSettings}>
                            {imageList.map((src, index) => (
                              <div key={index}>
                                <Image
                                  src={`${mediaBase}${src}`}
                                  alt={`Modal Image ${index + 1}`}
                                  width={800} // required
                                  height={600} // required
                                  className="product-modal-img"
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
                {showSavingBanner && (
                  <div
                    className="generic-switch-link clickable"
                    onClick={() => setShowGenericModal(true)}
                    role="button"
                  >
                    <div className="generic-switch-content">
                      <span className="generic-icon">
                        <i className="bi bi-currency-rupee"></i>
                      </span>

                      <span className="generic-text">
                        {minSaving === maxSaving
                          ? `${maxSaving}% cheaper alternative available with same salt composition`
                          : `${minSaving}% to ${maxSaving}% cheaper alternatives available`}
                      </span>

                      <span className="generic-arrow">
                        <i className="bi bi-chevron-right"></i>
                      </span>
                    </div>
                  </div>
                )}
                {!isMobile && <div className="accordian-wrapper"></div>}
              </div>
              {!isMobile && <HorizontalAccordionTabs id={id} />}
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
                      <div
                        className="descr"
                        dangerouslySetInnerHTML={{ __html: description || "" }}
                      ></div>
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
                  {/* MRP and Discount */}
                  <div className="pd_price">
                    <span className="old_price">
                      <del>MRP ₹{formatPrice(mrp ?? 0)}</del> {discount}% off
                    </span>
                  </div>

                  {/* Discounted (final) price */}
                  <div className="pd_price">
                    <span className="new_price">
                      {" "}
                      ₹{formatPrice(totalPrice ?? 0)}
                    </span>
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
                  {renderGenericCompare()}
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

        {/* ===== MOBILE STICKY HEALTH BAG ===== */}
        {isMobile && (
          <div className="view_box mx-2 mb-3">{renderGenericCompare()}</div>
        )}
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
                  ? "Go To Bag"
                  : "Add to Bag"}
              </button>
            </div>
          </div>
        )}
        <Footer />
      </div>

      <Modal
        show={showGenericModal}
        onHide={() => setShowGenericModal(false)}
        centered
        size={getModalSize()}
        // scrollable={finalCompareList.length > 3}
      >
        <Modal.Header className="generic-modal-header">
          <div className="generic-header-content">
            <h5 className="generic-title">
              {minSaving === maxSaving
                ? `Save ${maxSaving}% with generic alternative`
                : `Save ${minSaving}% to ${maxSaving}% with generic alternatives`}
            </h5>
          </div>

          <button
            className="generic-close"
            onClick={() => setShowGenericModal(false)}
          >
            ×
          </button>
        </Modal.Header>

        <Modal.Body
          style={
            isMobile
              ? {
                  maxHeight: "150vh",
                  overflowY: "auto",
                  paddingBottom: "80px",
                }
              : {}
          }
        >
          <div className="generic-1mg-wrapper">
            {/* Top Strip */}
            <div className="generic-1mg-strip">✓ Contains same composition</div>

            {/* Compare Section */}
            <div className="generic-1mg-compare">
              {finalCompareList.map((g, index) => {
                const imageUrl = getMedicineImage(g);
                const compareSaving =
                  currentPrice > 0
                    ? Math.round(
                        ((currentPrice - g.finalPrice) / currentPrice) * 100
                      )
                    : 0;

                const packSize = g.pack_size?.toLowerCase() || "";

                // ✅ ONLY allow tablet/capsule
                const isUnitBased =
                  packSize.includes("tab") ||
                  packSize.includes("tablet") ||
                  packSize.includes("cap") ||
                  packSize.includes("capsule");

                // ✅ extract quantity
                const packQty =
                  parseInt(String(g.pack_size).match(/\d+/)?.[0] || "0") || 0;

                // ✅ calculate ONLY if valid
                const perUnit =
                  isUnitBased && packQty > 0
                    ? (g.finalPrice / packQty).toFixed(2)
                    : null;

                // ✅ unit name
                let unit: string | null = null;

                if (packSize.includes("tab")) unit = "tablet";
                else if (packSize.includes("cap")) unit = "capsule";

                return (
                  <div key={g.id}>
                    {/* ✅ MOBILE VIEW */}
                    <div className="d-md-none">
                      <GenericModalMobileCard
                        image={imageUrl}
                        name={g.medicine_name}
                        manufacturer={g.manufacturer_name ?? null}
                        price={g.finalPrice}
                        mrp={g.mrp ?? 0}
                        discount={Number(g.discount ?? 0)}
                        perUnit={perUnit}
                        unit={unit}
                        saving={compareSaving}
                        isCurrent={g.isCurrent}
                        onClick={() => {
                          if (!g.isCurrent) {
                            setShowGenericModal(false);
                            router.push(`/medicines-details/${encodeId(g.id)}`);
                          }
                        }}
                      />
                    </div>
                    {/* ✅ DESKTOP VIEW */}
                    <div className="d-none d-md-block">
                      <div
                        key={g.id}
                        className={`generic-1mg-card ${
                          g.isCurrent ? "current" : "alt"
                        }`}
                        onClick={() => {
                          if (!g.isCurrent) {
                            setShowGenericModal(false);
                            router.push(`/medicines-details/${encodeId(g.id)}`);
                          }
                        }}
                      >
                        {/* RADIO INDICATOR */}
                        <div
                          className={`radio-indicator ${
                            index === 0
                              ? "radio-blue"
                              : index === 1
                              ? "radio-green"
                              : index === 2
                              ? "radio-orange"
                              : "radio-yellow"
                          }`}
                        ></div>
                        <div className="img-wrap">
                          <img
                            src={imageUrl}
                            alt={g.medicine_name}
                            style={{
                              opacity: imageUrl.includes("tnc-default")
                                ? 0.35
                                : 1,
                            }}
                            onError={(e) => {
                              e.currentTarget.src = "/images/tnc-default.png";
                              e.currentTarget.style.opacity = "0.35";
                            }}
                          />
                        </div>

                        <div className="title pd-title">{g.medicine_name}</div>

                        {g.isCurrent && (
                          <div className="badge-viewing">Currently viewing</div>
                        )}

                        <div className="company pd-title">
                          {g.manufacturer_name}
                        </div>

                        <div className="price-section">
                          {/* Final Price */}
                          <div className="final-price">
                            ₹{formatPrice(g.finalPrice)}
                          </div>

                          {/* MRP + Discount */}
                          {!g.isCurrent && (
                            <div className="mrp-row">
                              <span className="mrp">
                                MRP ₹{formatPrice(g.mrp ?? 0)}
                              </span>

                              <span className="discount-badge">
                                <span className="discount-badge">
                                  {Number(g.discount ?? 0)}% OFF
                                </span>
                              </span>
                            </div>
                          )}

                          {/* Per Tablet */}
                          {perUnit && unit && (
                            <div className="per-tablet">
                              ₹{perUnit} per {"unit"}
                            </div>
                          )}
                        </div>

                        {!g.isCurrent && compareSaving > 0 && (
                          <div className="save-badge">
                            {compareSaving}% lower than current
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div
              style={
                isMobile
                  ? {
                      position: "sticky",
                      bottom: 0,
                      background: "#fff",
                      padding: "10px",
                      borderTop: "1px solid #eee",
                      zIndex: 20,
                    }
                  : {}
              }
            >
              <button
                style={
                  isMobile
                    ? {
                        width: "100%",
                        background: "#ff6f61",
                        color: "#fff",
                        border: "none",
                        padding: "12px",
                        borderRadius: "8px",
                        fontWeight: 600,
                      }
                    : {}
                }
                className="switch-btn mt-2"
                onClick={() =>
                  router.push(
                    `/medicines-details/${encodeId(topCheaperGenerics[0].id)}`
                  )
                }
              >
                Switch to cheapest
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
