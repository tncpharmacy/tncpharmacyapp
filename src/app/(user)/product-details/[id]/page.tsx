import { fetchMenuMedicinesByOtherIdSeo } from "@/lib/api/medicine";
import ProductDetailsClient from "./ProductDetailsClient";
import { decodeId } from "@/lib/utils/encodeDecode";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const baseUrl = "https://tncpharmacy.in";
  const decodedId = decodeId(id);
  const productId = Number(decodedId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let product: any = null;

  try {
    if (!isNaN(productId)) {
      const res = await fetchMenuMedicinesByOtherIdSeo(productId);
      product = res?.data;
    }
  } catch (e) {}

  const name = product?.medicine_name || "Product";
  const description =
    product?.description || "Buy medicine online at best price";
  const image =
    product?.images?.[0]?.document || `${baseUrl}/images/tnc-default.png`;
  const brand = product?.manufacturer_name || "Generic";
  const price = Number(product?.mrp ?? 0);
  const discount = Number(product?.discount ?? 0);

  const finalPrice =
    price && discount ? price - (price * discount) / 100 : price;

  const url = `${baseUrl}/product-details/${id}`;

  return (
    <>
      {/* ✅ PRODUCT SCHEMA */}
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",

              name: name,
              image: [image],
              description: description,
              sku: productId,
              url: url,

              brand: {
                "@type": "Brand",
                name: brand,
              },

              offers: {
                "@type": "Offer",
                url: url,
                priceCurrency: "INR",
                price: finalPrice,
                availability: "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
              },

              // ⭐ optional (agar future me rating aaye)
              ...(product?.rating && {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  reviewCount: product.reviewCount || 1,
                },
              }),

              // 💊 pharmacy specific
              additionalProperty: [
                {
                  "@type": "PropertyValue",
                  name: "Prescription Required",
                  value: product?.prescription_required ? "Yes" : "No",
                },
              ],
            }),
          }}
        />
      )}
      {/* ✅ BREADCRUMB SCHEMA */}
      {product && (
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
                  item: url,
                },
              ],
            }),
          }}
        />
      )}

      <ProductDetailsClient product={product} />
    </>
  );
}
