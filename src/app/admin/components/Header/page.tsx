"use client";
import LogoutButton from "@/app/components/Logout/LogoutButton";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.push("/");
    }
  }, [accessToken, router]);
  return (
    <div className="header">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6">
            <a className="logo" href="dashboard.html">
              <img src="/images/logo.png" alt="" />
            </a>
          </div>
          <div className="col-sm-6 text-right">
            <div className="header-right">
              <div className="user_info">
                Hi: <b>Super Admin</b>
              </div>
              <div className="user_dropdown">
                <span className="dropbtn">
                  <i className="bi bi-list"></i>
                </span>
                <div className="user_dropdown-content">
                  <div className="p-2 bg-white text-center">
                    {/* <a className="btn_action" href="#"><i className="bi bi-box-arrow-left"></i>&nbsp;Logout</a> */}
                    <LogoutButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
