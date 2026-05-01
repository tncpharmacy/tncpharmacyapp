import { fetchMenuMedicinesByOtherIdSeo } from "@/lib/api/medicine";
import ProductDetailsClient from "./ProductDetailsClient";
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
  const productId = Number(decodedId);

  // ❌ invalid id
  if (isNaN(productId)) {
    return {
      title: "Product Details | TnC Pharmacy",
      description: "Buy healthcare products online at best price.",
    };
  }

  try {
    const res = await fetchMenuMedicinesByOtherIdSeo(productId);

    const product = res?.data;

    const name = product?.medicine_name || "Product";
    const manufacturer = product?.manufacturer_name || "";
    const image = product?.images?.[0]?.document || "/images/tnc-default.png";

    const url = `/product-details/${id}`;

    return {
      title: `${name} - Price, Uses & Details`,
      description: `Buy ${name} online at best price. Check product details, description and usage. ${manufacturer}`,

      alternates: {
        canonical: url,
      },

      openGraph: {
        title: `${name} | TnC Pharmacy`,
        description: `Buy ${name} online at best price`,
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
      title: "Product Details | TnC Pharmacy",
      description: "Buy healthcare products online at best price.",
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

      <ProductDetailsClient />
    </>
  );
}
