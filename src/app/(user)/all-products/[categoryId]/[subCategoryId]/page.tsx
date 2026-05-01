import { fetchCategoryByIdForSeo } from "@/lib/api/category";
import { fetchSubcategoryByIdForSeo } from "@/lib/api/subCategory";
import AllProductsClient from "./AllProductsClient";
import { decodeId } from "@/lib/utils/encodeDecode";

type Props = {
  params: Promise<{
    categoryId: string;
    subCategoryId: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;

  const baseUrl = "https://tncpharmacy.in";

  const decodedCategoryId = decodeId(resolvedParams.categoryId);
  const decodedSubCategoryId = decodeId(resolvedParams.subCategoryId);

  const categoryId = Number(decodedCategoryId);
  const subCategoryId = Number(decodedSubCategoryId);

  const url = `${baseUrl}/all-products/${resolvedParams.categoryId}/${resolvedParams.subCategoryId}`;

  // ❌ invalid fallback
  if (isNaN(categoryId) || isNaN(subCategoryId)) {
    return {
      title: "Products | TnC Pharmacy",
      description: "Browse products at TnC Pharmacy",

      alternates: {
        canonical: url,
      },

      openGraph: {
        title: "Products | TnC Pharmacy",
        description: "Browse products at TnC Pharmacy",
        url,
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
    const [categoryRes, subCategoryRes] = await Promise.all([
      fetchCategoryByIdForSeo(categoryId),
      fetchSubcategoryByIdForSeo(subCategoryId),
    ]);

    const categoryName = categoryRes?.data?.category_name || "Products";
    const subCategoryName = subCategoryRes?.data?.sub_category_name || "";

    // ✅ FIXED (important)
    const fullName = subCategoryName
      ? `${categoryName} - ${subCategoryName}`
      : categoryName;

    return {
      title: `${fullName} Products Online | Buy ${fullName}`,
      description: `Buy ${fullName} products online with best prices and fast delivery across India.`,

      alternates: {
        canonical: url,
      },

      openGraph: {
        title: `${fullName} | TnC Pharmacy`,
        description: `Buy ${fullName} online`,
        url,
        siteName: "TnC Pharmacy",
        type: "website",
        images: [
          {
            url: `${baseUrl}/og-image.png`,
            width: 1200,
            height: 630,
            alt: fullName,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title: `${fullName} | TnC Pharmacy`,
        description: `Buy ${fullName} products online`,
        images: [`${baseUrl}/og-image.png`],
      },
    };
  } catch (err) {
    return {
      title: "Products | TnC Pharmacy",
      description: "Browse products at TnC Pharmacy",

      alternates: {
        canonical: url,
      },

      openGraph: {
        title: "Products | TnC Pharmacy",
        description: "Browse products at TnC Pharmacy",
        url,
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
  return <AllProductsClient />;
}
