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

export default function Page() {
  return <AllGenericClient />;
}
