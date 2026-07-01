import { getHomeData } from "@/lib/server/home";
import HomeClient from "./homeClient";

// export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata = {
  title:
    "Online Pharmacy India | Buy Medicines Online up to 70% Off | TnC Pharmacy",

  description:
    "TnC Pharmacy – India's trusted online pharmacy. Buy genuine medicines, healthcare products & ayurvedic supplements at up to 70% off. Pharmacist verified. Free delivery. COD available.",

  alternates: {
    canonical: "https://tncpharmacy.com/",
  },

  openGraph: {
    title: "Online Pharmacy India | Buy Medicines Online | TnC Pharmacy",

    description:
      "Buy medicines online with up to 70% off. Genuine products, fast delivery, and pharmacist verified orders.",

    url: "https://tncpharmacy.com/",
    siteName: "TnC Pharmacy",
    type: "website",

    images: [
      {
        url: "https://tncpharmacy.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Online Pharmacy India - TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Buy Medicines Online | TnC Pharmacy",

    description:
      "Order medicines online with fast delivery, genuine products, and best prices.",

    images: ["https://tncpharmacy.com/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default async function HomePage() {
  const { groupCare, category5, category7, category9, categories } =
    await getHomeData();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Pharmacy",

    name: "TnC Pharmacy",
    url: "https://tncpharmacy.com",
    "@id": "https://tncpharmacy.com",

    logo: "https://tncpharmacy.com/og-image.png",
    image: "https://tncpharmacy.com/og-image.png",

    telephone: "+918062521280",

    address: {
      "@type": "PostalAddress",
      streetAddress: "Sector 29",
      addressLocality: "Noida",
      addressRegion: "UP",
      postalCode: "201301",
      addressCountry: "IN",
    },

    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.5708,
      longitude: 77.326,
    },

    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "22:00",
      },
    ],

    sameAs: [
      "https://www.facebook.com/people/TnC-Pharmacy-and-Labs/6158386771534/",
      "https://www.instagram.com/",
    ],

    priceRange: "₹₹",

    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "100",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://tncpharmacy.com/",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "TnC Pharmacy",
            url: "https://tncpharmacy.com",
            logo: "https://tncpharmacy.com/og-image.png",
            sameAs: ["https://www.facebook.com/", "https://www.instagram.com/"],
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <HomeClient
        initialGroupCare={groupCare}
        initialCategory5={category5}
        initialCategory7={category7}
        initialCategory9={category9}
        initialCategories={categories}
      />
    </>
  );
}
