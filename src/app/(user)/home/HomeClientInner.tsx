"use client";

import "../css/site-style.css";
import { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/utils/encodeDecode";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import Footer from "@/app/(user)/components/footer/footer";
import { HealthBag } from "@/types/healthBag";
import { loadLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";

import dynamic from "next/dynamic";
const ProductSection = dynamic(() => import("./components/ProductSection"), {
  loading: () => <div style={{ height: 300 }} />,
});
const WhatsAppToast = dynamic(() => import("./components/WhatsAppToast"), {
  ssr: false,
});
const BrandSection = dynamic(() => import("./components/BrandSection"));
const OfferSection = dynamic(() => import("./components/OfferSection"));
const WhySection = dynamic(() => import("./components/WhySection"));
const AdvBanner = dynamic(() => import("./components/AdvBanner"));
// const WhatsAppToast = dynamic(() => import("./components/WhatsAppToast"));

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialGroupCare: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialCategory5: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialCategory7: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialCategory9: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialCategories: any[];
};

export default function HomeClientInner({
  initialGroupCare,
  initialCategory5,
  initialCategory7,
  initialCategory9,
  initialCategories,
}: Props) {
  // --- Local states for instant UI ---
  const dispatch = useAppDispatch();
  const router = useRouter();
  // start for increse header count code
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });
  const categories = initialCategories || [];
  const categoryNamesById: Record<number, string> = {};
  [5, 7, 9].forEach((id) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) categoryNamesById[id] = cat.category_name;
  });
  const shuffled5 = initialCategory5 || [];
  const shuffled7 = initialCategory7 || [];
  const shuffled9 = initialCategory9 || [];

  const [localState, setLocalState] = useState<{ [key: number]: boolean }>({});
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  const [isMobile, setIsMobile] = useState(false);

  const [slides, setSlides] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;

      setIsMobile(w < 768);

      if (w <= 360) setSlides(1);
      else if (w <= 768) setSlides(2);
      else if (w <= 1024) setSlides(3);
      else setSlides(5);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Merge guest cart into logged-in cart once
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id, mergeGuestCart]);

  // --- Handlers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAdd = async (item: any) => {
    const id = item.product_id;
    setLocalState((prev) => ({ ...prev, [id]: true }));
    try {
      if (buyer?.id) {
        await addItem({
          id: 0,
          buyer_id: buyer?.id,
          product_id: item.product_id,
          quantity: 1,
        } as HealthBag);
      } else {
        const newItem = {
          id: 0,
          productid: item.product_id,
          qty: 1,

          // 🔥 STORE FULL DATA
          name: item.ProductName || item.productname,
          manufacturer: item.Manufacturer || item.manufacturer,
          pack_size: item.PackSize || item.pack_size,
          mrp: Number(item.MRP ?? item.mrp ?? 0),
          discount: Number(item.Discount ?? item.discount ?? 0),
          image: item.DefaultImageURL || item.medicine_image || null,
        };

        const cart = JSON.parse(localStorage.getItem("healthbag") || "[]");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const exists = cart.find((i: any) => i.productid === item.product_id);

        let updated;

        if (exists) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          updated = cart.map((i: any) =>
            i.productid === item.product_id ? { ...i, qty: i.qty + 1 } : i
          );
        } else {
          updated = [...cart, newItem];
        }

        localStorage.setItem("healthbag", JSON.stringify(updated));
        // setGuestItems(updated);
        dispatch(loadLocalHealthBag());
      }
    } catch (err) {
      // ❌ rollback
      setLocalState((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemove = async (productId: number) => {
    setLocalState((prev) => ({ ...prev, [productId]: false }));
    try {
      // 🟢 LOGIN USER
      if (buyer?.id) {
        await removeItem(productId);
      }
      // 🔵 GUEST USER
      else {
        const cart = JSON.parse(localStorage.getItem("healthbag") || "[]");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updated = cart.filter((i: any) => i.productid !== productId);

        localStorage.setItem("healthbag", JSON.stringify(updated));
        dispatch(loadLocalHealthBag());
      }
    } catch (err) {
      // ❌ rollback
      setLocalState((prev) => ({ ...prev, [productId]: true }));
    }
  };
  // 👇 onClick function
  const handleClick = (product_id: number) => {
    router.push(`/product-details/${encodeId(product_id)}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getValidProducts = (products: any[], limit = 5) => {
    return products
      .filter((item) => {
        const imgs = item.DefaultImageURL;
        if (!Array.isArray(imgs)) return false;

        return imgs.some((img) => {
          const isDefault = Number(img.default_image) === 1;
          const hasImage =
            img.document &&
            img.document !== "null" &&
            img.document.trim() !== "";

          return isDefault && hasImage;
        });
      })
      .slice(0, limit);
  };

  const validProducts7 = getValidProducts(shuffled7);
  const validProducts5 = getValidProducts(shuffled5);
  const validProducts9 = getValidProducts(shuffled9);

  return (
    <>
      {/* ProductSection 7 */}
      <ProductSection
        categoryId={7}
        title={categoryNamesById[7]}
        products={validProducts7}
        router={router}
        encodeId={encodeId}
        handleAdd={handleAdd}
        handleRemove={handleRemove}
        handleClick={handleClick}
        items={items}
        localState={localState}
        processingIds={processingIds}
        isMobile={isMobile}
        mediaBase={mediaBase}
      />

      {/* BrandSection */}
      <BrandSection />
      {/* ProductSection 5 */}
      <ProductSection
        categoryId={5}
        title={categoryNamesById[5]}
        products={validProducts5}
        router={router}
        encodeId={encodeId}
        handleAdd={handleAdd}
        handleRemove={handleRemove}
        handleClick={handleClick}
        items={items}
        localState={localState}
        processingIds={processingIds}
        isMobile={isMobile}
        mediaBase={mediaBase}
      />
      {/* OfferSection */}
      <OfferSection />
      {/* ProductSection 9 */}
      <ProductSection
        categoryId={9}
        title={categoryNamesById[9]}
        products={validProducts9}
        router={router}
        encodeId={encodeId}
        handleAdd={handleAdd}
        handleRemove={handleRemove}
        handleClick={handleClick}
        items={items}
        localState={localState}
        processingIds={processingIds}
        isMobile={isMobile}
        mediaBase={mediaBase}
      />
      {/* AdvBanner */}
      <AdvBanner />
      {/* WhySection */}
      <WhySection />
      {/* WhatsAppToast */}
      <WhatsAppToast />
      {/* Footer */}
      <Footer />
    </>
  );
}
