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

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Product Name",
            image: "image-url",
            description: "product desc",
            brand: {
              "@type": "Brand",
              name: "Brand Name",
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: "100",
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />

      <MedicinesDetailsClient />
    </>
  );
}
