import { fetchCategoryByIdForSeo } from "@/lib/api/category";
import AllProductClient from "./AllProductClient";
import { decodeId } from "@/lib/utils/encodeDecode";

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Props) {
  const { id } = params;

  const decodedId = decodeId(id);
  const categoryIdNum = Number(decodedId);

  const baseUrl = "https://tncpharmacy.in";

  // ❌ invalid case fallback
  if (isNaN(categoryIdNum)) {
    return {
      title: "Products | TnC Pharmacy",
      description: "Browse products at TnC Pharmacy",

      alternates: {
        canonical: `/all-product/${id}`,
      },

      robots: {
        index: false,
        follow: false,
      },

      openGraph: {
        title: "Products | TnC Pharmacy",
        description: "Browse products at TnC Pharmacy",
        url: `/all-product/${id}`,
        siteName: "TnC Pharmacy",
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title: "Products | TnC Pharmacy",
        description: "Browse products at TnC Pharmacy",
      },
    };
  }

  try {
    const res = await fetchCategoryByIdForSeo(categoryIdNum);

    const name = res?.data?.category_name || "Products";

    const url = `/all-product/${id}`;

    return {
      title: `${name} Products Online | Buy ${name}`,
      description: `Buy ${name} products online with best prices and fast delivery across India.`,

      // ✅ canonical
      alternates: {
        canonical: url,
      },

      // ✅ OpenGraph (WhatsApp / FB)
      openGraph: {
        title: `${name} Products | TnC Pharmacy`,
        description: `Buy ${name} products online`,
        url: url,
        siteName: "TnC Pharmacy",
        type: "website",

        // 👉 optional but recommended
        images: [
          {
            url: `${baseUrl}/og-image.png`, // default image
            width: 1200,
            height: 630,
            alt: name,
          },
        ],
      },

      // ✅ Twitter
      twitter: {
        card: "summary_large_image",
        title: `${name} | TnC Pharmacy`,
        description: `Buy ${name} products online`,
        images: [`${baseUrl}/og-image.png`],
      },
    };
  } catch (error) {
    // ❌ API fail fallback
    return {
      title: "Products | TnC Pharmacy",
      description: "Browse products at TnC Pharmacy",

      alternates: {
        canonical: `/all-product/${id}`,
      },

      openGraph: {
        title: "Products | TnC Pharmacy",
        description: "Browse products at TnC Pharmacy",
        url: `/all-product/${id}`,
        siteName: "TnC Pharmacy",
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title: "Products | TnC Pharmacy",
        description: "Browse products at TnC Pharmacy",
      },
    };
  }
}

export default async function Page({ params }: Props) {
  const { id } = params;

  const decodedId = decodeId(id);
  const categoryIdNum = Number(decodedId);

  let categoryName = "Products";

  try {
    if (!isNaN(categoryIdNum)) {
      const res = await fetchCategoryByIdForSeo(categoryIdNum);
      categoryName = res?.data?.category_name || "Products";
    }
  } catch (e) {}

  const pageUrl = `https://tncpharmacy.in/all-product/${id}`;

  return (
    <>
      {/* ✅ CollectionPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${categoryName} Products`,
            url: pageUrl,
          }),
        }}
      />

      {/* ✅ Breadcrumb Schema */}
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
                name: categoryName,
                item: pageUrl,
              },
            ],
          }),
        }}
      />

      <AllProductClient />
    </>
  );
}
