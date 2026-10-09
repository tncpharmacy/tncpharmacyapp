"use client";

import React from "react";
import { initialOf } from "../orderView";

export type AccountTab = "profile" | "order" | "address";

interface Props {
  name?: string | null;
  mobile?: string | null;
  activeTab: string;
  orderCount: number;
  addressCount: number;
  onTab: (tab: AccountTab) => void;
  onUploadPrescription: () => void;
  onHelp: () => void;
  onLogout: () => void;
}

/**
 * Left account menu (Figma: "Account sidebar"). The three tabs keep their
 * existing URLs (?tab=profile | order | address) so links and the login
 * redirect keep working; the other rows are actions.
 */
export default function AccountSidebar(p: Props) {
  const tabs: { key: AccountTab; label: string; icon: string; count?: number }[] = [
    { key: "profile", label: "My Profile", icon: "bi-person" },
    { key: "order", label: "My Orders", icon: "bi-receipt", count: p.orderCount },
    { key: "address", label: "Saved Addresses", icon: "bi-geo-alt", count: p.addressCount },
  ];
  const first = (p.name || "").trim().split(/\s+/)[0];

  return (
    <aside className="acct-side">
      <div className="acct-card">
        <div className="acct-who">
          <div className="acct-avatar" aria-hidden>{initialOf(p.name)}</div>
          <div>
            <div className="acct-who-name">{first ? `Hi, ${first}` : "Hi there"}</div>
            {p.mobile && <div className="acct-who-mobile">+91 {p.mobile}</div>}
          </div>
        </div>
        <nav>
          <ul className="acct-menu">
            {tabs.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  className={p.activeTab === t.key ? "active" : ""}
                  aria-current={p.activeTab === t.key ? "page" : undefined}
                  onClick={() => p.onTab(t.key)}
                >
                  <i className={`bi ${t.icon} lead`} />
                  {t.label}
                  {typeof t.count === "number" && t.count > 0 && <span className="count">{t.count}</span>}
                  <i className="bi bi-chevron-right chev" />
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={p.onUploadPrescription}>
                <i className="bi bi-file-earmark-medical lead" />
                Upload Prescription
                <i className="bi bi-chevron-right chev" />
              </button>
            </li>
            <li>
              <button type="button" onClick={p.onHelp}>
                <i className="bi bi-headset lead" />
                Need Help
                <i className="bi bi-chevron-right chev" />
              </button>
            </li>
            <li>
              <button type="button" onClick={p.onLogout}>
                <i className="bi bi-box-arrow-right lead" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className="acct-trust">
        <i className="bi bi-shield-check" />
        <div>
          <b>100% genuine medicines</b>
          <span>Licensed pharmacy · Pharmacist-checked orders</span>
        </div>
      </div>
    </aside>
  );
}
