import AllGenericClient from "./AllGenericClient";
import { decodeId } from "@/lib/utils/encodeDecode";
import { fetchMedicineByGenericIdSeo } from "@/lib/api/medicine";

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Props) {
  const { id } = params;

  const baseUrl = "https://tncpharmacy.in";
  const decodedId = decodeId(id);
  const genericId = Number(decodedId);

  const url = `/all-generic/${id}`;

  if (isNaN(genericId)) {
    return {
      title: "Generic Medicines | TnC Pharmacy",
      description: "Browse generic medicines at TnC Pharmacy",

      alternates: { canonical: url },

      robots: {
        index: false,
        follow: false,
      },

      openGraph: {
        title: "Generic Medicines | TnC Pharmacy",
        description: "Browse generic medicines",
        url: `${baseUrl}${url}`,
        siteName: "TnC Pharmacy",
        type: "website",
      },
    };
  }

  try {
    const res = await fetchMedicineByGenericIdSeo(genericId);

    const name = res?.data?.generic_name || "Generic Medicines";

    return {
      title: `${name} Alternatives | Buy ${name} Online`,
      description: `Buy ${name} generic alternatives online with best prices.`,

      alternates: { canonical: url },

      openGraph: {
        title: `${name} | TnC Pharmacy`,
        description: `Buy ${name} alternatives online`,
        url: `${baseUrl}${url}`,
        siteName: "TnC Pharmacy",
        type: "website",
        images: [
          {
            url: `${baseUrl}/og-image.png`,
            width: 1200,
            height: 630,
            alt: name,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title: `${name} | TnC Pharmacy`,
        description: `Buy ${name} alternatives online`,
        images: [`${baseUrl}/og-image.png`],
      },
    };
  } catch {
    return {
      title: "Generic Medicines | TnC Pharmacy",
      description: "Browse generic medicines",

      alternates: { canonical: url },
    };
  }
}

export default async function Page({ params }: Props) {
  const { id } = params;

  const decodedId = decodeId(id);
  const genericId = Number(decodedId);

  let genericName = "Generic Medicines";

  try {
    if (!isNaN(genericId)) {
      const res = await fetchMedicineByGenericIdSeo(genericId);
      genericName = res?.data?.generic_name || "Generic Medicines";
    }
  } catch (e) {}

  const pageUrl = `https://tncpharmacy.in/all-generic/${id}`;

  return (
    <>
      {/* ✅ CollectionPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${genericName} Alternatives`,
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
                name: "Generic Medicines",
                item: "https://tncpharmacy.in/all-generic",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: genericName,
                item: pageUrl,
              },
            ],
          }),
        }}
      />

      <AllGenericClient />
    </>
  );
}
