import { Medicine } from "@/types/medicine";
import AllMedicineClient from "./AllMedicineClient";
import { fetchMenuMedicinesList } from "@/lib/api/medicine";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Medicines Online | Buy Medicines at Best Price",
  description:
    "Explore and buy all types of medicines online at best prices with fast delivery across India from TnC Pharmacy.",

  alternates: {
    canonical: "/all-medicine",
  },

  openGraph: {
    title: "All Medicines | TnC Pharmacy",
    description:
      "Buy all types of medicines online at best prices with fast delivery.",
    url: "https://tncpharmacy.in/all-medicine",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "All Medicines - TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "All Medicines | TnC Pharmacy",
    description: "Buy all types of medicines online with fast delivery.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default async function Page() {
  let initialData: Medicine[] = [];
  let initialNext = null;
  let initialCount = 0;

  try {
    const res = await fetchMenuMedicinesList(undefined);

    initialData = res?.data || [];
    initialNext = res?.next || null;
    initialCount = res?.count || 0;
  } catch (err) {
    console.error("SSR medicine error:", err);
  }

  return (
    <AllMedicineClient
      initialData={initialData}
      initialNext={initialNext}
      initialCount={initialCount}
    />
  );
}
