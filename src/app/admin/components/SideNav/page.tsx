"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Admin left navigation.
 *
 * Links are intentionally bare ("/order", not "/admin/order") — next.config.ts
 * rewrites all of them to /admin/*. See the 133 rewrite rules there.
 *
 * Design: Figma "admin/Sidebar" (29:1477). The only behavioural change from the
 * previous version is `usePathname()` driving an active state, which the old
 * nav had no concept of — you could not tell which section you were in.
 */

type Item = { href: string; icon: string; label: string };

const MAIN: Item[] = [
  { href: "/admin-dashboard", icon: "bi-speedometer2", label: "Dashboard" },
  { href: "/order", icon: "bi-bag-check", label: "Order" },
  { href: "/medicine", icon: "bi-box-seam", label: "Product Master" },
  { href: "/pharmacy", icon: "bi-shop-window", label: "Pharmacy" },
  { href: "/pharmacist", icon: "bi-person-workspace", label: "Pharmacist" },
  { href: "/buyer", icon: "bi-person", label: "Patient" },
  { href: "/buyerHealthBag", icon: "bi-bag-heart", label: "Patient HealthBag" },
  { href: "/purchase-invoice", icon: "bi-receipt-cutoff", label: "Purchase Invoice" },
  { href: "/supplier", icon: "bi-truck", label: "Supplier" },
];

const ADMIN_MASTER: Item[] = [
  { href: "/category", icon: "bi-collection", label: "Category" },
  { href: "/sub-category", icon: "bi-collection-fill", label: "Sub Category" },
  { href: "/unit", icon: "bi-rulers", label: "Unit" },
  { href: "/generic", icon: "bi-capsule", label: "Generic" },
  { href: "/manufacturer", icon: "bi-building", label: "Manufacturer" },
  { href: "/manufacture-bulk-upload", icon: "bi-file-earmark-arrow-up", label: "Manufacturer Upload" },
  { href: "/medicine-bulk-upload", icon: "bi-file-earmark-arrow-up", label: "Medicine Upload" },
  { href: "/medicine-document-bulk-upload", icon: "bi-file-earmark-arrow-up", label: "Medicine Document Upload" },
  { href: "/medicine-images-bulk-download", icon: "bi-file-earmark-arrow-down", label: "Medicine Image Download" },
  { href: "/safety-advice-bulk-upload", icon: "bi-file-earmark-arrow-up", label: "Safety Advice Upload" },
];

export default function SideNav() {
  const pathname = usePathname() || "";
  const [openMenu, setOpenMenu] = useState<string | null>(
    ADMIN_MASTER.some((i) => pathname.startsWith(i.href)) ? "admins" : null
  );

  const toggleMenu = (menu: string) =>
    setOpenMenu(openMenu === menu ? null : menu);

  // "/order" must not light up for "/order-something", so compare the segment.
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="side_menu">
      <ul className="side_menu-list">
        {MAIN.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`link${isActive(item.href) ? " is-active" : ""}`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <i className={`bi ${item.icon}`} /> {item.label}
            </Link>
          </li>
        ))}

        <li className={openMenu === "admins" ? "open" : ""}>
          <div
            onClick={() => toggleMenu("admins")}
            className="link arrow"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleMenu("admins");
            }}
          >
            <i className="bi bi-person-gear" /> Admin Master
          </div>
          {openMenu === "admins" && (
            <ul className="submenu">
              {ADMIN_MASTER.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={isActive(item.href) ? "is-active" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>

        <li>
          <Link
            href="/admin/contact-us"
            className={`link${isActive("/admin/contact-us") ? " is-active" : ""}`}
          >
            <i className="bi bi-person-lines-fill" /> Contact Us
          </Link>
        </li>

        <li className={openMenu === "settings" ? "open" : ""}>
          <div
            onClick={() => toggleMenu("settings")}
            className="link arrow"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleMenu("settings");
            }}
          >
            <i className="bi bi-gear-wide-connected" /> Settings
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
