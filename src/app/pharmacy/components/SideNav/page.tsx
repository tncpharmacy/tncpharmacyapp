"use client";

import { useState } from "react";
import Link from "next/link";

export default function SideNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="side_menu">
      <span className="btnsidemenu cursor-pointer text-xl">
        <i className="bi bi-arrow-left"></i>
      </span>

      <ul className="side_menu-list">
        <li>
          <Link href="/pharmacy-dashboard" className="link">
            <i className="bi bi-activity"></i> Dashboard
          </Link>
        </li>
        <li>
          <Link href="/order" className="link">
            <i className="bi bi-cart-plus-fill"></i> Order
          </Link>
        </li>
        <li>
          <Link href="/pharmacy/pharmacist" className="link">
            <i className="bi bi-capsule"></i> Pharmacist
          </Link>
        </li>
        <li>
          <div
            onClick={() => toggleMenu("purchase-invoice")}
            className="link arrow"
          >
            <i className="bi bi-receipt-cutoff"></i> Purchase Invoice
          </div>
          {openMenu === "purchase-invoice" && (
            <ul className="submenu">
              <li>
                <Link href="/pharmacy/import">
                  <i className="bi bi-box-arrow-in-up"></i> Import
                </Link>
              </li>
              <li>
                <Link href="/pharmacy/export">
                  <i className="bi bi-box-arrow-down"></i> Export
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <Link href="/supplier" className="link">
            <i className="bi bi-truck"></i> Supplier
          </Link>
        </li>
        <li>
          <div onClick={() => toggleMenu("settings")} className="link arrow">
            <i className="bi bi-gear-wide-connected"></i> Settings
          </div>
          {openMenu === "settings" && (
            <ul className="submenu">
              <li>
                <Link href="/view-profile">Profile</Link>
              </li>
              <li>
                <Link href="#">Reset Password</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}
