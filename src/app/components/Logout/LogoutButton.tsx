"use client";

import { useAppDispatch } from "@/lib/hooks";
import { logout } from "@/lib/features/authSlice/authSlice";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/home");
  };

  return (
    <button className="btn_action" onClick={handleLogout}>
      <i className="bi bi-box-arrow-left"></i>&nbsp; Logout
    </button>
  );
}
