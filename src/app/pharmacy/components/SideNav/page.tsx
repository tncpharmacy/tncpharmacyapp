"use client";

import { SetStateAction, useState } from "react";
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
          <Link href="/medicine" className="link">
            <i className="bi bi-capsule"></i> Medicine
          </Link>
        </li>

        <li>
          <Link href="/supplier" className="link">
            <i className="bi bi-truck"></i> Supplier
          </Link>
        </li>
        <li>
          <div onClick={() => toggleMenu("product")} className="link arrow">
            <i className="bi bi-capsule-pill"></i> Product Master
          </div>
          {openMenu === "product" && (
            <ul className="submenu">
              <li>
                <Link href="/category">Medicine Category</Link>
              </li>
              <li>
                <Link href="/brand">Medicine Brand</Link>
              </li>
              <li>
                <Link href="/unit">Medicine Unit</Link>
              </li>
              <li>
                <Link href="/manufacturer">Medicine Manufacturer</Link>
              </li>
              <li>
                <Link href="/variant">Medicine Variant</Link>
              </li>
              <li>
                <Link href="/strength">Medicine Strength</Link>
              </li>
            </ul>
          )}
        </li>

        <li>
          <div onClick={() => toggleMenu("settings")} className="link arrow">
            <i className="bi bi-gear-wide-connected"></i> Settings
          </div>
          {openMenu === "settings" && (
            <ul className="submenu">
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
