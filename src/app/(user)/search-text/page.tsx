import { Suspense } from "react";
import SearchTextClient from "./SearchTextClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchTextClient />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
