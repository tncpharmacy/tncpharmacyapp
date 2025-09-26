"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import {
  setCredentials,
  markRestoreComplete,
} from "@/lib/features/authSlice/authSlice";
import { User } from "@/types/login";

export default function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");

    if (accessToken && refreshToken && userStr) {
      const user: User = JSON.parse(userStr);
      dispatch(setCredentials({ user, accessToken, refreshToken }));
    } else {
      dispatch(markRestoreComplete());
    }
  }, [dispatch]);

  return null;
}
