"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import {
  setCredentials,
  markRestoreComplete,
  logout,
} from "@/lib/features/authSlice/authSlice";
import { User } from "@/types/login";
import { setUnauthorizedHandler } from "@/lib/axios";
import { safeLocalStorage } from "@/lib/utils/safeLocalStorage";

export default function AuthInitializer() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // 🔹 Restore auth on app start
  useEffect(() => {
    const accessToken = safeLocalStorage.getItem("accessToken");
    const refreshToken = safeLocalStorage.getItem("refreshToken");
    const userStr = safeLocalStorage.getItem("user");

    if (accessToken && refreshToken && userStr) {
      const user: User = JSON.parse(userStr);
      dispatch(setCredentials({ user, accessToken, refreshToken }));
    }

    dispatch(markRestoreComplete());
  }, [dispatch]);

  // 🔥 GLOBAL UNAUTHORIZED HANDLER
  useEffect(() => {
    setUnauthorizedHandler(() => {
      console.log("🚨 401 → auto logout");

      dispatch(logout()); // clears redux + storage
      window.location.href = "/";
    });
  }, [dispatch, router]);

  return null;
}
