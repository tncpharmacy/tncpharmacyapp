import OrderDetailsView from "./OrderDetailsView";

// Per-customer data: never statically rendered or cached.
export const dynamic = "force-dynamic";

export const metadata = { title: "Order details", robots: { index: false, follow: false } };

export default function OrderDetailsPage() {
  return <OrderDetailsView />;
}
