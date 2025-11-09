import { Suspense } from "react";
import BuyerProfile from "./BuyerProfile";

export const dynamic = "force-dynamic"; // ✅ Required

export default function Profile() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BuyerProfile />
    </Suspense>
  );
}
