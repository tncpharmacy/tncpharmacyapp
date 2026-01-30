"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, restoreComplete } = useSelector(
    (state: RootState) => state.auth
  );

  // 🔐 Redirect-only guard (NO render blocking)
  useEffect(() => {
    if (!restoreComplete) return;

    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [restoreComplete, isAuthenticated, router]);

  // ❗ IMPORTANT: always render children
  return <>{children}</>;
}
