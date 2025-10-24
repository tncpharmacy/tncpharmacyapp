"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getAccessToken } from "@/lib/auth/auth";

export const useAuth = (redirectIfNotLoggedIn = true) => {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // ✅ Only run on client
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      if (redirectIfNotLoggedIn) {
        router.push("/"); // redirect once
      }
      return;
    }

    // ✅ If token exists
    const currentUser = getUser();
    setUser(currentUser);
    setLoading(false);
  }, [router, redirectIfNotLoggedIn]);

  return { user, setUser, loading };
};
