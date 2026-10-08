"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./account.css";
import Footer from "@/app/(user)/components/footer/footer";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getAddress,
  makeDefaultAddress,
  removeAddress,
} from "@/lib/features/addressSlice/addressSlice";
import toast from "react-hot-toast";
import ConfirmLocationModal from "@/app/components/address/ConfirmLocationModal";
import { LocationDetails } from "@/types/address";
import {
  getBuyerOrdersList,
  getBuyerProfile,
} from "@/lib/features/buyerSlice/buyerSlice";

import { BuyerOrderItem, OrderDetails } from "@/types/order";
import { Address } from "@/types/address";
import TncLoader from "@/app/components/TncLoader/TncLoader";
import PrescriptionUploadModal from "@/app/(user)/components/PrescriptionUploadModal/PrescriptionUploadModal";
import AccountSidebar, { AccountTab } from "./components/AccountSidebar";
import OrderCard from "./components/OrderCard";
import EditProfileModal from "./components/EditProfileModal";
import { OrderStage, STAGE_LABEL, orderStage } from "./orderView";
import { useAccountActions } from "./useAccountActions";

// Mapped interface to fix type errors
interface BuyerData {
  id: number;
  name: string;
  number: string;
  email: string;
}

export default function BuyerProfile() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [showModal, setShowModal] = useState(false);
  const { logout: handleLogout, reorder: handleReOrder, cancelOrder, cancellingId } = useAccountActions();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [pendingDefaultId, setPendingDefaultId] = useState<number | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [isClient, setIsClient] = useState(false);

  // My Orders: status filter + "load more on scroll" (10 at a time)
  const [orderFilter, setOrderFilter] = useState<"all" | OrderStage>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);

  // Redux state
  const buyer: BuyerData | null =
    useAppSelector((state) => state.buyer.buyer) || null;
  const userId = buyer?.id ?? null;

  // rawOrderList from slice (mapped to fix TS)
  const rawOrderList = useAppSelector(
    (state) => state.buyer.list
  ) as unknown as BuyerOrderItem[];


  // active addresses
  const activeAddresses =
    useAppSelector((state) => state.address.addresses) || [];
  const billingAddresses = activeAddresses.filter(
    (addr) => addr.status === "Active"
  );

  const [selectedLocation, setSelectedLocation] =
    useState<LocationDetails | null>(null);

  useEffect(() => {
    if (billingAddresses.length > 0 && selectedAddressId === null) {
      const defaultAddr = billingAddresses.find(
        (addr) => addr.default_address === 1
      );

      if (defaultAddr?.id) {
        setSelectedAddressId(defaultAddr.id);
      }
    }
  }, [billingAddresses.length, selectedAddressId, billingAddresses]);


  // const formatted: BuyerOrderDetail = {
  //   id: d.orderId,
  //   order_no: d.orderId.toString(),
  //   items: d.products.map((p) => ({
  //     product_id: p.id,
  //     name: p.medicine_name,
  //     qty: Number(p.quantity),
  //     price: Number(p.rate),
  //   })),
  //   total_amount: Number(d.amount),
  //   date: d.orderDate,

  //   orderId: d.orderId,
  //   buyerName: d.buyerName,
  //   buyerEmail: d.buyerEmail,
  //   buyerNumber: d.buyerNumber,
  //   buyer_uhid: d.buyer_uhid,
  //   orderDate: d.orderDate,
  //   paymentStatus: d.paymentStatus,
  //   amount: d.amount,
  //   orderType: d.orderType,
  //   paymentMode: d.paymentMode,
  //   additional_discount: d.additional_discount,
  //   address: d.address,
  //   products: d.products,
  // };

  // ------------------------------
  // MEMOIZE allOrders (so reference is stable unless rawOrderList changes)
  // ------------------------------
  const allOrders: OrderDetails[] = useMemo(() => {
    // map rawOrderList → OrderDetails only when rawOrderList changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (rawOrderList as unknown as any).map((o: any) => ({
      orderId: o.orderId,
      order_number: o.order_number,
      orderStatus: o.orderStatus,
      cancel_reason: o.cancel_reason,
      buyer_can_cancel: o.buyer_can_cancel,
      deliveryStatusName: o.deliveryStatusName,
      buyerName: o.buyerName,
      orderDate: o.orderDate,
      paymentStatus: o.paymentStatus,
      amount: o.amount,
      orderType: o.orderType,
      paymentMode: o.paymentMode,
      address: o.address,
      prescription_url: o.prescription_url,
      products:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        o.products?.map((p: any) => ({
          id: p.id,
          productName: p.medicine_name,
          manufacturer: p.manufacturer,
          image: p.image,
          quantity: p.quantity,
          mrp: p.mrp,
          discount: p.discount,
          rate: p.rate,
          doses: p.doses,
          duration: p.duration,
          remark: p.remark,
          status: p.status,
        })) || [],
    }));
    // only re-run when rawOrderList changes
  }, [rawOrderList]);

  // Orders in the chosen status, newest first (the API already sorts).
  const filteredOrders = useMemo(
    () =>
      orderFilter === "all"
        ? allOrders
        : allOrders.filter((o) => orderStage(o) === orderFilter),
    [allOrders, orderFilter]
  );
  const visibleOrders = filteredOrders.slice(0, page * pageSize);
  const hasMore = visibleOrders.length < filteredOrders.length;

  // A new list or a new filter starts again from the first page.
  useEffect(() => setPage(1), [allOrders, orderFilter]);

  const loadMoreOrders = useCallback(() => {
    if (hasMore) setPage((p) => p + 1);
  }, [hasMore]);

  const stageCounts = useMemo(() => {
    const c: Record<OrderStage, number> = { process: 0, dispatched: 0, delivered: 0, cancelled: 0 };
    allOrders.forEach((o) => (c[orderStage(o)] += 1));
    return c;
  }, [allOrders]);

  useEffect(() => {

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        loadMoreOrders();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreOrders]);

  // Fetch orders & addresses
  useEffect(() => {
    if (userId !== null) {
      setOrdersLoading(true);

      dispatch(getBuyerOrdersList(userId))
        .unwrap()
        .finally(() => setOrdersLoading(false));

      dispatch(getAddress(userId));
      // The token carries the name/email from login time; read the current
      // values so an edit made earlier shows after a reload.
      dispatch(getBuyerProfile({ id: userId }));
    }
  }, [dispatch, userId]);

  // The pharmacist moves an order In Process -> Dispatched -> Delivered from
  // another screen; nothing pushes that change here. Re-read the list (quietly,
  // no loader) when the customer comes back to this tab or opens My Orders,
  // and offer a Refresh button, so the status badge is never stale.
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const refreshOrders = useCallback(async () => {
    if (userId === null) return;
    setRefreshingOrders(true);
    try {
      await dispatch(getBuyerOrdersList(userId)).unwrap();
    } catch {
      /* keep showing the last list; the next refresh will retry */
    } finally {
      setRefreshingOrders(false);
    }
  }, [dispatch, userId]);

  // Opening My Orders later in the visit re-reads it too.
  const [ordersTabSeen, setOrdersTabSeen] = useState(false);
  useEffect(() => {
    if (activeTab !== "order") return;
    if (ordersTabSeen) refreshOrders();
    else setOrdersTabSeen(true); // first view: the mount fetch is fresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "order") return;
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshOrders();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [activeTab, refreshOrders]);

  // Client check
  useEffect(() => setIsClient(true), []);

  // Redirect if not logged in
  // useEffect(() => {
  //   if (isClient && !buyer) router.replace("/");
  // }, [isClient, buyer, router]);

  // useEffect(() => {
  //   if (
  //     isClient &&
  //     !buyer &&
  //     activeTab === "order" &&
  //     window.location.pathname === "/profile"
  //   ) {
  //     const fullPath = window.location.pathname + window.location.search;

  //     localStorage.setItem("redirectAfterLogin", fullPath);

  //     router.replace("/");

  //     setTimeout(() => {
  //       window.dispatchEvent(new Event("openLoginModal"));
  //     }, 300);
  //   }
  // }, [isClient, buyer, activeTab]);

  // Tab from URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab: AccountTab | string) => {
    setActiveTab(tab);
    router.replace(`?tab=${tab}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const handleRemove = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this address?"))
      return;
    try {
      await dispatch(removeAddress(id)).unwrap();
      toast.success("Address removed successfully!");
      if (userId !== null) dispatch(getAddress(userId));
    } catch (err) {
      toast.error("Failed to remove address!");
      console.error(err);
    }
  };
  // Track order / View details -> the order-details page.
  const handleViewOrder = (orderId: number) => router.push(`/profile/orders/${orderId}`);

  const handleSetDefaultAddress = async (address: Address) => {
    if (!address.id) return;

    try {
      setSelectedAddressId(address.id); // 🔥 instant UI update
      setPendingDefaultId(address.id);

      await dispatch(makeDefaultAddress({ addressId: address.id })).unwrap();

      toast.success("Default address updated!");
    } catch (error) {
      toast.error("Failed to set default address");
      console.error(error);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (await cancelOrder(orderId)) {
      if (userId !== null) await dispatch(getBuyerOrdersList(userId));
    }
  };

  const tab = searchParams.get("tab");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLogout =
      localStorage.getItem("justLoggedOut") === "true" ||
      sessionStorage.getItem("justLoggedOut") === "true";

    if (isLogout) {
      localStorage.removeItem("justLoggedOut");
      sessionStorage.removeItem("justLoggedOut");
      return;
    }

    if (!buyer && pathname === "/profile" && tab === "order") {
      const fullPath = `${pathname}?tab=order`;

      localStorage.setItem("redirectAfterLogin", fullPath);
      localStorage.setItem("shouldOpenLogin", "true");

      router.replace("/");
    }
  }, [buyer, pathname, tab]); // ✅ FIXED

  // UI BLOCK (sahi hai)
  if (!buyer && pathname === "/profile" && tab === "order") {
    return null;
  }

  if (!isClient) return null;

  // ---- derived values for My Profile ----
  const defaultAddress = billingAddresses.find((a) => a.default_address === 1);
  const rxCount = allOrders.filter((o) => !!o.prescription_url).length;
  const activeOrders = stageCounts.process + stageCounts.dispatched;
  const latestOrder = allOrders[0];
  const lastReorderable = allOrders.find((o) => orderStage(o) !== "cancelled");
  const reorderSubtitle = lastReorderable
    ? (() => {
        const items = lastReorderable.products || [];
        const first = items[0]?.productName || "your last order";
        return items.length > 1 ? `${first} and ${items.length - 1} more` : first;
      })()
    : "No past orders yet";
  const tabTitle =
    activeTab === "order" ? "My Orders" : activeTab === "address" ? "Saved Addresses" : "My Profile";

  const orderCardProps = {
    onView: handleViewOrder,
    onReorder: handleReOrder,
    onCancel: handleCancelOrder,
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="acct">
          <div className="acct-wrap">
            <div className="acct-crumb">
              <Link href="/">Home</Link> &nbsp;›&nbsp; My Account &nbsp;›&nbsp; {tabTitle}
            </div>

            <div className="row g-4">
              <div className="col-lg-3">
                <AccountSidebar
                  name={buyer?.name}
                  mobile={buyer?.number}
                  activeTab={activeTab}
                  orderCount={allOrders.length}
                  addressCount={billingAddresses.length}
                  onTab={handleTabChange}
                  onUploadPrescription={() => setShowRxModal(true)}
                  onHelp={() => router.push("/contact-us")}
                  onLogout={handleLogout}
                />
              </div>

              <div className="col-lg-9 d-flex flex-column gap-4">
                {/* ================= MY PROFILE ================= */}
                {activeTab === "profile" && (
                  <>
                    <div className="d-flex align-items-center gap-3">
                      <div className="flex-grow-1">
                        <h1 className="acct-title">My Profile</h1>
                        <p className="acct-sub">Your details and recent activity</p>
                      </div>
                      {userId && (
                        <button type="button" className="acct-btn" onClick={() => setShowEditProfile(true)}>
                          <i className="bi bi-pencil" /> Edit profile
                        </button>
                      )}
                    </div>

                    <div className="row g-3">
                      {[
                        { v: allOrders.length, l: "Orders placed", i: "bi-receipt" },
                        { v: billingAddresses.length, l: "Saved addresses", i: "bi-geo-alt" },
                        { v: rxCount, l: "Orders with a prescription", i: "bi-file-earmark-medical" },
                      ].map((s) => (
                        <div className="col-md-4" key={s.l}>
                          <div className="acct-card acct-stat">
                            <span className="acct-ic"><i className={`bi ${s.i}`} /></span>
                            <div>
                              <div className="acct-stat-value">{s.v}</div>
                              <div className="acct-stat-label">{s.l}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <section className="acct-card p-4">
                      <h3 className="acct-h3 mb-3">Personal details</h3>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="acct-field">
                            <div className="acct-field-label">Full name</div>
                            <div className={`acct-field-value ${buyer?.name ? "" : "empty"}`}>{buyer?.name || "Add your name"}</div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="acct-field">
                            <div className="acct-field-label">Mobile number</div>
                            <div className="acct-field-value">
                              {buyer?.number ? `+91 ${buyer.number}` : "-"}
                              {buyer?.number && (
                                <span className="acct-verified"><i className="bi bi-patch-check-fill" /> Verified</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="acct-field">
                            <div className="acct-field-label">Email address</div>
                            <div className={`acct-field-value ${buyer?.email ? "" : "empty"}`}>{buyer?.email || "Add your email for invoices"}</div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="acct-field">
                            <div className="acct-field-label">Default delivery address</div>
                            <div className={`acct-field-value ${defaultAddress ? "" : "empty"}`}>
                              {defaultAddress
                                ? `${defaultAddress.location || defaultAddress.address}${defaultAddress.pincode ? ` – ${defaultAddress.pincode}` : ""}`
                                : "No address saved yet"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <h3 className="acct-h3 mb-n2">Quick actions</h3>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <button type="button" className="acct-quick" onClick={() => setShowRxModal(true)}>
                          <span className="acct-ic accent"><i className="bi bi-file-earmark-medical" /></span>
                          <div>
                            <b>Upload prescription</b>
                            <span>A pharmacist checks it for you</span>
                          </div>
                          <i className="bi bi-chevron-right chev" />
                        </button>
                      </div>
                      <div className="col-md-4">
                        <button
                          type="button"
                          className="acct-quick"
                          disabled={!lastReorderable}
                          onClick={() => lastReorderable && handleReOrder(lastReorderable.orderId)}
                        >
                          <span className="acct-ic accent"><i className="bi bi-arrow-repeat" /></span>
                          <div>
                            <b>Reorder last order</b>
                            <span>{reorderSubtitle}</span>
                          </div>
                          <i className="bi bi-chevron-right chev" />
                        </button>
                      </div>
                      <div className="col-md-4">
                        <button
                          type="button"
                          className="acct-quick"
                          onClick={() => {
                            setOrderFilter("all");
                            handleTabChange("order");
                          }}
                        >
                          <span className="acct-ic accent"><i className="bi bi-truck" /></span>
                          <div>
                            <b>Track your order</b>
                            <span>
                              {activeOrders === 0
                                ? "Nothing on the way"
                                : `${activeOrders} order${activeOrders > 1 ? "s" : ""} on the way`}
                            </span>
                          </div>
                          <i className="bi bi-chevron-right chev" />
                        </button>
                      </div>
                    </div>

                    {latestOrder && (
                      <>
                        <div className="d-flex align-items-center mb-n2">
                          <h3 className="acct-h3 flex-grow-1">Recent order</h3>
                          <button type="button" className="acct-link" onClick={() => handleTabChange("order")}>
                            View all orders ›
                          </button>
                        </div>
                        <OrderCard
                          order={latestOrder}
                          cancelling={cancellingId === latestOrder.orderId}
                          {...orderCardProps}
                        />
                      </>
                    )}
                  </>
                )}

                {/* ================= SAVED ADDRESSES ================= */}
                {activeTab === "address" && (
                  <>
                    <div className="d-flex align-items-center gap-3">
                      <div className="flex-grow-1">
                        <h1 className="acct-title">Saved Addresses</h1>
                        <p className="acct-sub">Choose where we deliver. The default is used at checkout.</p>
                      </div>
                      <button
                        type="button"
                        className="acct-btn primary"
                        onClick={() => setShowModal(true)}
                        disabled={billingAddresses.length >= 6}
                        title={billingAddresses.length >= 6 ? "You can save up to 6 addresses" : undefined}
                      >
                        + Add new address
                      </button>
                    </div>
                    {userId && (
                      <ConfirmLocationModal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        locationDetails={selectedLocation || {}}
                        onSubmit={() => userId && dispatch(getAddress(userId))}
                        userId={userId}
                      />
                    )}

                    <div className="row g-3">
                      {billingAddresses.map((addr) => {
                        const isDefault =
                          (pendingDefaultId ?? selectedAddressId) === addr.id;
                        const tag =
                          addr.address_type_id === 1 ? "Home" : addr.address_type_id === 2 ? "Office" : "Other";
                        const tagIcon =
                          addr.address_type_id === 1 ? "bi-house" : addr.address_type_id === 2 ? "bi-briefcase" : "bi-geo-alt";
                        return (
                          <div className="col-md-6" key={addr.id}>
                            <div className={`acct-card acct-addr ${isDefault ? "is-default" : ""}`}>
                              <div className="d-flex gap-2 align-items-center">
                                <span className="acct-tag"><i className={`bi ${tagIcon}`} /> {tag}</span>
                                {isDefault && <span className="acct-default">Default</span>}
                              </div>
                              <div className="who">
                                {addr.name}
                                {addr.mobile ? `  ·  ${addr.mobile}` : ""}
                              </div>
                              <div className="lines">
                                {addr.address}
                                {addr.location ? `, ${addr.location}` : ""}
                                {addr.pincode ? ` – ${addr.pincode}` : ""}
                              </div>
                              <div className="actions">
                                <button
                                  type="button"
                                  className="remove"
                                  disabled={isDefault}
                                  title={isDefault ? "Set another address as default first" : "Remove address"}
                                  onClick={() => {
                                    if (!addr.id) return toast.error("Invalid address ID");
                                    handleRemove(addr.id);
                                  }}
                                >
                                  <i className="bi bi-trash" /> Remove
                                </button>
                                {!isDefault && (
                                  <button
                                    type="button"
                                    className="make-default"
                                    onClick={() => handleSetDefaultAddress(addr)}
                                  >
                                    Set as default
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {billingAddresses.length < 6 && (
                        <div className="col-md-6">
                          <button type="button" className="acct-add-tile" onClick={() => setShowModal(true)}>
                            <i className="bi bi-plus-lg" />
                            <b>Add a new address</b>
                            <span>Pincode, house no., landmark</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ================= MY ORDERS ================= */}
                {activeTab === "order" && (
                  <>
                    <div className="d-flex align-items-center gap-3">
                      <div className="flex-grow-1">
                        <h1 className="acct-title">My Orders</h1>
                        <p className="acct-sub">Track, reorder or get help with any order</p>
                      </div>
                      <button
                        type="button"
                        className="acct-btn"
                        onClick={refreshOrders}
                        disabled={refreshingOrders || ordersLoading}
                        title="Get the latest order status"
                      >
                        <i className="bi bi-arrow-clockwise" /> {refreshingOrders ? "Refreshing…" : "Refresh"}
                      </button>
                    </div>

                    <div className="acct-chips" role="tablist" aria-label="Filter orders by status">
                      {(["all", "process", "dispatched", "delivered", "cancelled"] as const).map((k) => {
                        const n = k === "all" ? allOrders.length : stageCounts[k];
                        const label = k === "all" ? "All" : STAGE_LABEL[k];
                        return (
                          <button
                            key={k}
                            type="button"
                            role="tab"
                            aria-selected={orderFilter === k}
                            className={`acct-chip ${orderFilter === k ? "active" : ""}`}
                            onClick={() => setOrderFilter(k)}
                          >
                            {label} ({n})
                          </button>
                        );
                      })}
                    </div>

                    {ordersLoading ? (
                      <div className="d-flex justify-content-center align-items-center py-5">
                        <TncLoader />
                      </div>
                    ) : visibleOrders.length > 0 ? (
                      <>
                        {visibleOrders.map((order) => (
                          <OrderCard
                            key={order.orderId}
                            order={order}
                            cancelling={cancellingId === order.orderId}
                            {...orderCardProps}
                          />
                        ))}
                        {hasMore && (
                          <div className="text-center">
                            <button type="button" className="acct-btn" onClick={loadMoreOrders}>
                              Show more orders
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="acct-card acct-empty">
                        <i className="bi bi-receipt" />
                        {orderFilter === "all" ? (
                          <>
                            <p className="mb-3">You haven&apos;t placed any orders yet.</p>
                            <Link href="/all-medicine" className="acct-btn primary text-decoration-none">
                              Browse medicines
                            </Link>
                          </>
                        ) : (
                          <p className="mb-0">No {STAGE_LABEL[orderFilter as OrderStage].toLowerCase()} orders.</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PrescriptionUploadModal show={showRxModal} handleClose={() => setShowRxModal(false)} />
      {userId && (
        <EditProfileModal
          show={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          buyerId={userId}
          name={buyer?.name}
          email={buyer?.email}
          mobile={buyer?.number}
        />
      )}
      <Footer />
    </>
  );
}
