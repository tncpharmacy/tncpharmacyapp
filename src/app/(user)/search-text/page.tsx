import { Suspense } from "react";
import SearchTextClient from "./SearchTextClient";

type Props = {
  searchParams: {
    text?: string;
  };
};

export const dynamic = "force-dynamic";

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

export default function Page({ searchParams }: Props) {
  const searchText = searchParams?.text || "";

  return (
    <>
      {/* ⚠️ Optional Schema */}
      {searchText && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SearchResultsPage",
              name: `Search results for ${searchText}`,
              url: `https://tncpharmacy.in/search?text=${encodeURIComponent(
                searchText
              )}`,
            }),
          }}
        />
      )}

      <Suspense fallback={<div>Loading...</div>}>
        <SearchTextClient />
      </Suspense>
    </>
  );
}
