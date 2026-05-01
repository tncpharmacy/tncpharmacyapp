import AllManufacturerClient from "./AllManufacturerClient";
import { decodeId } from "@/lib/utils/encodeDecode";
import { fetchMedicineByManufacturerIdSeo } from "@/lib/api/medicine";

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Props) {
  const { id } = params;

  const baseUrl = "https://tncpharmacy.in";
  const decodedId = decodeId(id);
  const manufacturerId = Number(decodedId);

  const url = `/all-manufacturer/${id}`;

  if (isNaN(manufacturerId)) {
    return {
      title: "Medicines by Manufacturer | TnC Pharmacy",
      description: "Browse medicines by manufacturer",

      alternates: { canonical: url },

      robots: {
        index: false,
        follow: false,
      },

      openGraph: {
        title: "Manufacturer Products | TnC Pharmacy",
        description: "Browse medicines by manufacturer",
        url: `${baseUrl}${url}`,
        siteName: "TnC Pharmacy",
        type: "website",
      },
    };
  }

  try {
    const res = await fetchMedicineByManufacturerIdSeo(manufacturerId);

    const name = res?.data?.manufacturer_name || "Manufacturer";

    return {
      title: `${name} Medicines Online | Buy ${name} Products`,
      description: `Buy medicines from ${name} with best prices and fast delivery.`,

      alternates: { canonical: url },

      openGraph: {
        title: `${name} | TnC Pharmacy`,
        description: `Buy ${name} medicines online`,
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
        description: `Buy ${name} medicines online`,
        images: [`${baseUrl}/og-image.png`],
      },
    };
  } catch {
    return {
      title: "Medicines by Manufacturer | TnC Pharmacy",
      description: "Browse medicines by manufacturer",

      alternates: { canonical: url },
    };
  }
}

export default function Page() {
  return <AllManufacturerClient />;
}
