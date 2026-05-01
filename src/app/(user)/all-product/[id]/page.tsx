import { fetchCategoryByIdForSeo } from "@/lib/api/category";
import AllProductClient from "./AllProductClient";
import { decodeId } from "@/lib/utils/encodeDecode";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;

  const decodedId = decodeId(resolvedParams.id);
  const categoryIdNum = Number(decodedId);

  const baseUrl = "https://tncpharmacy.in";

  // ❌ invalid case fallback
  if (isNaN(categoryIdNum)) {
    return {
      title: "Products | TnC Pharmacy",
      description: "Browse products at TnC Pharmacy",

      alternates: {
        canonical: `${baseUrl}/all-product/${resolvedParams.id}`,
      },

      openGraph: {
        title: "Products | TnC Pharmacy",
        description: "Browse products at TnC Pharmacy",
        url: `${baseUrl}/all-product/${resolvedParams.id}`,
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

    const url = `${baseUrl}/all-product/${resolvedParams.id}`;

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
        canonical: `${baseUrl}/all-product/${resolvedParams.id}`,
      },

      openGraph: {
        title: "Products | TnC Pharmacy",
        description: "Browse products at TnC Pharmacy",
        url: `${baseUrl}/all-product/${resolvedParams.id}`,
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

export default function Page() {
  return <AllProductClient />;
}
