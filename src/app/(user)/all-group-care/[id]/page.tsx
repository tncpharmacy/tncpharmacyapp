import AllGroupCareClient from "./AllGroupCareClient";
import { decodeId } from "@/lib/utils/encodeDecode";
import { fetchGroupCareById } from "@/lib/api/medicine";

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Props) {
  const { id } = params;

  const baseUrl = "https://tncpharmacy.in";
  const decodedId = decodeId(id);
  const groupId = Number(decodedId);

  const url = `/all-group-care/${id}`;

  // ❌ invalid fallback
  if (isNaN(groupId)) {
    return {
      title: "Group Care Products | TnC Pharmacy",
      description: "Browse group care products at TnC Pharmacy",

      alternates: { canonical: url },

      robots: {
        index: false,
        follow: false,
      },

      openGraph: {
        title: "Group Care | TnC Pharmacy",
        description: "Browse group care products",
        url: `${baseUrl}${url}`,
        siteName: "TnC Pharmacy",
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title: "Group Care | TnC Pharmacy",
        description: "Browse group care products",
      },
    };
  }

  try {
    const res = await fetchGroupCareById(groupId);

    const name = res?.group_name || "Group Care";

    return {
      title: `${name} Products Online | Buy ${name}`,
      description: `Buy ${name} products online with best prices and fast delivery across India.`,

      alternates: {
        canonical: url,
      },

      openGraph: {
        title: `${name} | TnC Pharmacy`,
        description: `Buy ${name} products online`,
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
        description: `Buy ${name} products online`,
        images: [`${baseUrl}/og-image.png`],
      },
    };
  } catch (error) {
    return {
      title: "Group Care Products | TnC Pharmacy",
      description: "Browse group care products at TnC Pharmacy",

      alternates: { canonical: url },

      openGraph: {
        title: "Group Care | TnC Pharmacy",
        description: "Browse group care products",
        url: `${baseUrl}${url}`,
        siteName: "TnC Pharmacy",
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title: "Group Care | TnC Pharmacy",
        description: "Browse group care products",
      },
    };
  }
}

export default function Page() {
  return <AllGroupCareClient />;
}
