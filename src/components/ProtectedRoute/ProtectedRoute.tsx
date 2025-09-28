"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, restoreComplete, loading } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // mark component ready (like restoreComplete)
  useEffect(() => {
    setReady(true);
  }, []);

  // // ✅ redirect if no token
  // useEffect(() => {
  //   const token = getAccessToken();
  //   if (ready && !token) {
  //     router.push("/login");
  //   }
  // }, [ready, router]);

  // ✅ redirect if redux says not authenticated
  useEffect(() => {
    if (ready && restoreComplete && !isAuthenticated) {
      router.push("/");
    }
  }, [ready, restoreComplete, isAuthenticated, router]);

  if (!ready || !restoreComplete || loading) return null;

  return <>{children}</>;
}
