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
        {/* <li>
          <Link href="/pharmacy-dashboard" className="link">
            <i className="bi bi-activity"></i> Dashboard
          </Link>
        </li> */}

        {/* <li>
          <Link href="/pharmacy/retail-counter" className="link">
            <i className="bi bi-capsule"></i> Retail Counter
          </Link>
        </li> */}

        <li>
          <Link href="/pharmacy/patient-health-bag" className="link">
            <i className="bi bi-cart-plus-fill"></i> Patient HealthBag
          </Link>
        </li>
        <li>
          <Link href="/pharmacy/order" className="link">
            <i className="bi bi-clipboard-check"></i> Order
          </Link>
        </li>
        <li>
          <Link href="/pharmacy/purchase-invoice" className="link">
            <i className="bi bi-receipt-cutoff"></i> Purchase Invoice
          </Link>
        </li>
        <li>
          <Link href="/pharmacy/stock" className="link">
            <i className="bi bi-box"></i> Stock
          </Link>
        </li>
        <li>
          <Link href="/pharmacy/pharmacist" className="link">
            <i className="bi bi-capsule"></i> Pharmacist
          </Link>
        </li>
        <li>
          <Link href="/pharmacy/supplier" className="link">
            <i className="bi bi-basket"></i> Supplier
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
                <Link href="/pharmacy/change-password">Change Password</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}
