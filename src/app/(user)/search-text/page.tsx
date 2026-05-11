import { Suspense } from "react";
import SearchTextClient from "./SearchTextClient";

type Props = {
  searchParams: {
    text?: string;
  };
};

export const dynamic = "force-dynamic";

// ✅ server fetch
async function getSearchProducts(text: string) {
  if (!text) return [];

  const res = await fetch(
    `https://api.tncpharmacy.in/api/search?text=${encodeURIComponent(text)}`,
    { cache: "no-store" }
  );

  try {
    return await res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({ searchParams }: Props) {
  const { text } = searchParams;

  const baseUrl = "https://tncpharmacy.in";
  const searchText = text || "";

  const url = `/search?text=${encodeURIComponent(searchText)}`;

  // ❌ empty search
  if (!searchText) {
    return {
      title: "Search Medicines | TnC Pharmacy",
      description: "Search medicines and healthcare products online",

      alternates: {
        canonical: url,
      },

      robots: {
        index: false,
        follow: true,
      },

      openGraph: {
        title: "Search Medicines | TnC Pharmacy",
        description: "Search medicines online",
        url: `${baseUrl}${url}`,
        siteName: "TnC Pharmacy",
        type: "website",
      },
    };
  }

  // ✅ dynamic SEO
  return {
    title: `${searchText} Products Online | Search ${searchText} | TnC Pharmacy`,
    description: `Search results for ${searchText}. Buy ${searchText} medicines and healthcare products online.`,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: `${searchText} | TnC Pharmacy`,
      description: `Search results for ${searchText}`,
      url: `${baseUrl}${url}`,
      siteName: "TnC Pharmacy",
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: searchText,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${searchText} | TnC Pharmacy`,
      description: `Search results for ${searchText}`,
      images: [`${baseUrl}/og-image.png`],
    },
  };
}

export default async function Page({ searchParams }: Props) {
  const searchText = searchParams?.text || "";

  const products = await getSearchProducts(searchText);

  // ✅ Product schema
  const productSchema =
    searchText && products.length
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          itemListElement: products.slice(0, 20).map((p: any, i: number) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: p.name,
              image: p.image,
              description: p.short_description || p.name,
              sku: p.id.toString(),
              offers: {
                "@type": "Offer",
                priceCurrency: "INR",
                price: p.price,
                availability: "https://schema.org/InStock",
                url: `https://tncpharmacy.in/medicines-details/${btoa(
                  p.id.toString()
                )}`,
              },
            },
          })),
        }
      : null;

  return (
    <>
      {/* ✅ REAL FIX */}
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
      )}

      <Suspense fallback={<div>Loading...</div>}>
        <SearchTextClient />
      </Suspense>
    </>
  );
}
