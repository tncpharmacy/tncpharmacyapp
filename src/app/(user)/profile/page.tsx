import { Suspense } from "react";
import BuyerProfile from "./BuyerProfile";

export const dynamic = "force-dynamic";

export default function Profile() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BuyerProfile />
    </Suspense>
  );
}
