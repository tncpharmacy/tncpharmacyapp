import { fetchMenuMedicinesByIdForSeo } from "@/lib/api/medicine";
import MedicinesDetailsClient from "./MedicinesDetailsClient";
import { decodeId } from "@/lib/utils/encodeDecode";

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Props) {
  const { id } = params;

  const baseUrl = "https://tncpharmacy.in";
  const decodedId = decodeId(id);
  const medicineId = Number(decodedId);

  // ❌ invalid case
  if (isNaN(medicineId)) {
    return {
      title: "Medicine Details | TnC Pharmacy",
      description: "Buy medicines online at best price from TnC Pharmacy.",
    };
  }

  try {
    const res = await fetchMenuMedicinesByIdForSeo(medicineId);

    const medicine = res?.data;

    const name = medicine?.medicine_name || "Medicine";
    const manufacturer = medicine?.manufacturer_name || "";
    const image = medicine?.images?.[0]?.document || "/images/tnc-default.png";

    const url = `/medicines-details/${id}`;

    return {
      title: `${name} - Uses, Price, Side Effects`,
      description: `Buy ${name} online at best price. Check uses, benefits, side effects, dosage and more. ${manufacturer}`,

      alternates: {
        canonical: url,
      },

      openGraph: {
        title: `${name} | TnC Pharmacy`,
        description: `Buy ${name} online with best price`,
        url: `${baseUrl}${url}`,
        siteName: "TnC Pharmacy",
        type: "website",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: name,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title: `${name} | TnC Pharmacy`,
        description: `Buy ${name} online`,
        images: [image],
      },
    };
  } catch (err) {
    return {
      title: "Medicine Details | TnC Pharmacy",
      description: "Buy medicines online at best price from TnC Pharmacy.",
    };
  }
}

export default async function Page({ params }: Props) {
  const { id } = params;

  const decodedId = decodeId(id);
  const medicineId = Number(decodedId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let medicine: any = null;

  try {
    const res = await fetchMenuMedicinesByIdForSeo(medicineId);
    medicine = res?.data || null;
  } catch (err) {
    console.error("Medicine fetch error:", err);
  }

  const name = medicine?.medicine_name || "Medicine";
  const description = medicine?.description || "";
  const manufacturer = medicine?.manufacturer_name || "TnC Pharmacy";
  const image = medicine?.images?.[0]?.document || "/images/tnc-default.png";

  const mrp = Number(medicine?.mrp ?? 0);
  const discount = Number(medicine?.discount ?? 0);

  const finalPrice = mrp && discount ? mrp - (mrp * discount) / 100 : mrp;

  return (
    <>
      {/* ✅ DYNAMIC SCHEMA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",

            name: name,
            image: [image],
            description: description,

            brand: {
              "@type": "Brand",
              name: manufacturer,
            },

            offers: {
              "@type": "Offer",
              url: `https://tncpharmacy.in/medicines-details/${id}`,
              priceCurrency: "INR",
              price: finalPrice,
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
            },
          }),
        }}
      />
      {/* ✅ BREADCRUMB SCHEMA */}
      {medicine && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://tncpharmacy.in",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Medicines",
                  item: "https://tncpharmacy.in/all-medicine",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: name,
                  item: `https://tncpharmacy.in/medicines-details/${id}`,
                },
              ],
            }),
          }}
        />
      )}

      {/* ✅ PASS DATA TO CLIENT */}
      <MedicinesDetailsClient medicine={medicine} />
    </>
  );
}
