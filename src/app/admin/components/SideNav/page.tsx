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


      <ul className="side_menu-list">
        <li>
          <Link href="/admin-dashboard" className="link">
            <i className="bi bi-activity"></i> Dashboard
          </Link>
        </li>

        {/* <li className={`${openMenu === "order" ? "active" : ""}`}>
          <div onClick={() => toggleMenu("order")} className="link arrow">
            <i className="bi bi-cart-plus-fill"></i> Order
          </div>

          {openMenu === "order" && (
            <ul className="submenu">
              <li><Link href="#">New Order</Link></li>
              <li><Link href="#">Order Shipped</Link></li>
              <li><Link href="#">Return Request</Link></li>
            </ul>
          )}
        </li>
<hr />
        <li>
          <div onClick={() => toggleMenu("medicine")} className="link arrow">
            <i className="bi bi-capsule-pill"></i> Medicine
          </div>
          {openMenu === "medicine" && (
            <ul className="submenu">
              <li><Link href="#">Medicine Stocks</Link></li>
              <li><Link href="#">Add Medicine</Link></li>
            </ul>
          )}
        </li> */}
        <li>
          <Link href="/orders" className="link">
            <i className="bi bi-cart-plus-fill"></i> Order
          </Link>
        </li>

        <li>
          <Link href="/medicines" className="link">
            <i className="bi bi-capsule"></i> Medicine
          </Link>
        </li>

        <li>
          <Link href="/doctors" className="link">
            <i className="bi bi-person-plus"></i> Doctors
          </Link>
        </li>

        <li>
          <Link href="/pharmacy" className="link">
            <i className="bi bi-shop-window"></i> Pharmacy
          </Link>
        </li>

        <li>
          <Link href="/pharmacist" className="link">
            <i className="bi bi-people"></i> Pharmacist
          </Link>
        </li>

        <li>
          <Link href="/buyer" className="link">
            <i className="bi bi-shop-window"></i> Buyer
          </Link>
        </li>

        <li>
          <Link href="/supplier" className="link">
            <i className="bi bi-shop-window"></i> Supplier
          </Link>
        </li>

        <li>
          <div onClick={() => toggleMenu("product")} className="link arrow">
            <i className="bi bi-capsule-pill"></i> Product Master
          </div>
          {openMenu === "product" && (
            <ul className="submenu">
              <li>
                <Link href="/categories">Medicine Category</Link>
              </li>
              <li>
                <Link href="/brands">Medicine Brand</Link>
              </li>
              <li>
                <Link href="/units">Medicine Unit</Link>
              </li>
              <li>
                <Link href="/manufacturers">Medicine Manufacturer</Link>
              </li>
              <li>
                <Link href="/variants">Medicine Variant</Link>
              </li>
              <li>
                <Link href="/strengths">Medicine Strength</Link>
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
