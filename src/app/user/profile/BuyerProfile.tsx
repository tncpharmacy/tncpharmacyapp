"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";

import { Image } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAddress,
  makeDefaultAddress,
  removeAddress,
} from "@/lib/features/addressSlice/addressSlice";
import toast from "react-hot-toast";
import ConfirmLocationModal from "@/app/components/address/ConfirmLocationModal";
import { LocationDetails } from "@/types/address";
import {
  getBuyerOrderDetails,
  getBuyerOrdersList,
} from "@/lib/features/buyerSlice/buyerSlice";

import { BuyerOrderItem, OrderDetails } from "@/types/order";
import { formatDateOnly } from "@/utils/dateFormatter";
import { formatAmount } from "@/lib/utils/formatAmount";
import { BuyerOrderDetail, OrderDetail } from "@/types/buyer";
import OrderDetailsModal from "@/app/components/BuyerProfileModal/OrderDetailsModal";
import { Address } from "@/types/address";
import TncLoader from "@/app/components/TncLoader/TncLoader";

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
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [pendingDefaultId, setPendingDefaultId] = useState<number | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [isClient, setIsClient] = useState(false);

  // scroll / pagination state
  const [visibleOrders, setVisibleOrders] = useState<OrderDetails[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  // Redux state
  const buyer: BuyerData | null =
    useAppSelector((state) => state.buyer.buyer) || null;
  const userId = buyer?.id ?? null;

  // rawOrderList from slice (mapped to fix TS)
  const rawOrderList = useAppSelector(
    (state) => state.buyer.list
  ) as unknown as BuyerOrderItem[];

  const { details: buyerOrderDetails } = useAppSelector((state) => state.buyer);

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
      buyerName: o.buyerName,
      orderDate: o.orderDate,
      paymentStatus: o.paymentStatus,
      amount: o.amount,
      orderType: o.orderType,
      paymentMode: o.paymentMode,
      address: o.address,
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

  // initial load when allOrders updates: reset pagination
  useEffect(() => {
    if (!allOrders || allOrders.length === 0) {
      setVisibleOrders([]);
      setPage(1);
      setHasMore(false);
      return;
    }

    // reset to first page
    setVisibleOrders(allOrders.slice(0, pageSize));
    setPage(1);
    setHasMore(allOrders.length > pageSize);
  }, [allOrders]);

  // load more function (idempotent)
  const loadMoreOrders = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);

    // calculate next slice
    const nextPage = page + 1;
    const end = nextPage * pageSize;

    // if nothing to add, mark hasMore false
    if (visibleOrders.length >= allOrders.length) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    // slice up to 'end'
    const newData = allOrders.slice(0, Math.min(end, allOrders.length));
    setVisibleOrders(newData);
    setPage(nextPage);

    // update hasMore
    setHasMore(newData.length < allOrders.length);

    setLoading(false);
  }, [allOrders, hasMore, loading, page, visibleOrders.length]);

  useEffect(() => {
    const handleScroll = () => {
      // near bottom of page
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
    }
  }, [dispatch, userId]);

  // Client check
  useEffect(() => setIsClient(true), []);

  // Redirect if not logged in
  useEffect(() => {
    if (isClient && !buyer) router.replace("/");
  }, [isClient, buyer, router]);

  // Tab from URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.replace(`?tab=${tab}`, { scroll: false });
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
  useEffect(() => {
    if (buyerOrderDetails) {
      setSelectedOrder(buyerOrderDetails);
    }
  }, [buyerOrderDetails]);

  const handleViewOrder = async (orderId: number) => {
    setSelectedOrder(null); // 🔥 loader state
    setShowOrderModal(true); // 🔥 modal open FIRST

    try {
      const result = await dispatch(getBuyerOrderDetails(orderId)).unwrap();

      setSelectedOrder(result);
    } catch (e) {
      toast.error("Failed to load order details");
      setShowOrderModal(false);
    }
  };

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

  if (!isClient || !buyer) return null;

  return (
    <>
      <div className="page-wrapper">
        <SiteHeader />
        <div className="container-fluid my-2">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div
                className="card"
                style={{
                  overflow: "hidden",
                  background: "#fff",
                  minHeight: "1000px",
                }}
              >
                {/* Profile Header */}
                <div
                  className="text-center p-4"
                  style={{
                    background: "linear-gradient(135deg, #264b8c, #ff7b00)",
                    color: "#fff",
                  }}
                >
                  <div
                    className="rounded-circle mx-auto mb-3 border border-3 border-white"
                    style={{
                      width: "100px",
                      height: "100px",
                      backgroundImage: "url('/images/user-avatar.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>
                  <h4 className="fw-bold mb-1">Welcome, {buyer.name} 👋</h4>
                  <p className="mb-0 opacity-75">Your personal dashboard</p>
                </div>

                {/* Tabs */}
                <div
                  className="d-flex text-center fw-semibold border"
                  style={{ borderColor: "#0a214aff" }}
                >
                  {["profile", "address", "order"].map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`btn py-3 w-100 border-0 ${
                          isActive ? "text-white" : "text-secondary"
                        }`}
                        style={{
                          borderRadius: 0,
                          background: isActive
                            ? "linear-gradient(135deg, #264b8c)"
                            : "rgb(241 245 249)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {tab === "profile"
                          ? "My Account"
                          : tab === "address"
                          ? "My Address"
                          : "My Orders"}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="p-4">
                  {activeTab === "profile" && (
                    <div className="p-3 position-relative border rounded bg-white shadow-sm">
                      <h5 className="fw-bold mb-3 text-primary">Hi there!</h5>
                      <div className="mb-3 d-flex align-items-center">
                        <Image
                          src="/images/person-icon.png"
                          width={45}
                          height={45}
                          className="me-4 opacity-75"
                          alt="person"
                        />
                        <div>
                          <label className="text-muted d-block">
                            Patient Name
                          </label>
                          <strong>{buyer.name}</strong>
                        </div>
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <Image
                          src="/images/mobile-icon.png"
                          width={45}
                          height={45}
                          className="me-4 opacity-75"
                          alt="phone"
                        />
                        <div>
                          <label className="text-muted d-block">
                            Mobile Number
                          </label>
                          <strong>{buyer.number}</strong>
                        </div>
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <Image
                          src="/images/email-icon.png"
                          width={45}
                          height={45}
                          className="me-4 opacity-75"
                          alt="email"
                        />
                        <div>
                          <label className="text-muted d-block">
                            Primary Email address
                          </label>
                          <strong>{buyer.email}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "address" && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0 text-primary">
                          My Address
                        </h5>
                        <button
                          className="btn btn-primary"
                          onClick={() => setShowModal(true)}
                          disabled={billingAddresses.length >= 6}
                        >
                          + Add New Address
                        </button>
                        {userId && (
                          <ConfirmLocationModal
                            show={showModal}
                            onClose={() => setShowModal(false)}
                            locationDetails={selectedLocation || {}}
                            onSubmit={() =>
                              userId && dispatch(getAddress(userId))
                            }
                            userId={userId}
                          />
                        )}
                      </div>
                      <div className="row">
                        {billingAddresses.map((addr, idx) => {
                          const isSelected =
                            selectedAddressId === addr.id ||
                            pendingDefaultId === addr.id;
                          const isDefault =
                            selectedAddressId === addr.id ||
                            pendingDefaultId === addr.id;

                          return (
                            <div className="col-md-4 mb-4" key={addr.id}>
                              <div
                                className={`card ${
                                  isSelected ? "border-danger" : "border-light"
                                } shadow-sm`}
                                style={{
                                  cursor: "pointer",
                                  borderWidth: "2px",
                                  borderRadius: "8px",
                                  transition: "all 0.2s ease-in-out",
                                }}
                              >
                                <div className="card-body p-3">
                                  <div className="d-flex align-items-center mb-2">
                                    <input
                                      type="radio"
                                      name="billingAddresses"
                                      checked={isSelected}
                                      onChange={() =>
                                        handleSetDefaultAddress(addr)
                                      }
                                      className="form-check-input me-2"
                                      title="Set Default Address"
                                    />

                                    <label
                                      className="fw-semibold mb-0"
                                      style={{
                                        fontSize: "15px",
                                        color: "#212121",
                                      }}
                                    >
                                      {addr.address_type_id === 1
                                        ? "Home"
                                        : addr.address_type_id === 2
                                        ? "Office"
                                        : "Other"}
                                    </label>
                                  </div>

                                  <div className="ps-4">
                                    <p
                                      className="mb-1"
                                      style={{
                                        fontSize: "13px",
                                        color: "#555",
                                        lineHeight: "1",
                                      }}
                                    >
                                      {addr.address}
                                    </p>
                                    <p
                                      className="mb-3"
                                      style={{
                                        fontSize: "13px",
                                        color: "#555",
                                        lineHeight: "1",
                                      }}
                                    >
                                      {addr.location} ({addr.pincode})
                                    </p>
                                    <p
                                      className="mb-0 fw-semibold"
                                      style={{
                                        fontSize: "13.5px",
                                        color: "#212121",
                                      }}
                                    >
                                      {addr.name}
                                    </p>
                                    <p
                                      className="mb-2"
                                      style={{
                                        fontSize: "13px",
                                        color: "#757575",
                                      }}
                                    >
                                      {addr.mobile}
                                    </p>

                                    {/* Remove */}
                                    {/* <button
                                      className="btn btn-link p-0 fw-semibold text-danger"
                                      style={{ fontSize: "13px" }}
                                      onClick={() =>
                                        addr.id && handleRemove(addr.id)
                                      }
                                      title="Remove Address"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button> */}
                                    <button
                                      className="btn btn-link p-0 fw-semibold"
                                      style={{
                                        fontSize: "13px",
                                        color: isDefault ? "#999" : "#e53935",
                                        textDecoration: "none",
                                        cursor: isDefault
                                          ? "not-allowed"
                                          : "pointer",
                                      }}
                                      type="button"
                                      disabled={isDefault}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isDefault) return;

                                        if (!addr.id) {
                                          toast.error("Invalid address ID");
                                          return;
                                        }
                                        handleRemove(addr.id);
                                      }}
                                      title="Remove Address"
                                    >
                                      <i
                                        className="bi bi-trash"
                                        style={{
                                          fontSize: "16px",
                                          color: isDefault ? "#999" : "red",
                                        }}
                                      ></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === "order" && (
                    <div>
                      <h5 className="fw-bold mb-3 text-primary">My Orders</h5>

                      {ordersLoading ? (
                        <div className="d-flex justify-content-center align-items-center py-5">
                          <div className="text-center">
                            <TncLoader />
                          </div>
                        </div>
                      ) : visibleOrders.length > 0 ? (
                        <div className="row">
                          {visibleOrders.map((order) => (
                            <div key={order.orderId} className="col-md-4 mb-4">
                              <div
                                className="card h-100 shadow-sm"
                                style={{
                                  borderRadius: "8px",
                                  border: "1px solid #e0e0e0",
                                }}
                              >
                                <div className="card-body d-flex flex-column justify-content-between">
                                  <div>
                                    <h6 className="mb-2 text-primary fw-semibold">
                                      Order Number: {order.orderId}
                                    </h6>

                                    <p className="mb-0 text-success">
                                      Payment Status:{" "}
                                      <span
                                        className={
                                          order.paymentStatus === "Buy"
                                            ? "text-success"
                                            : "text-warning"
                                        }
                                      >
                                        {order.paymentStatus}
                                      </span>
                                    </p>

                                    <p className="mb-0 text-success">
                                      Payment Mode: {order.paymentMode}
                                    </p>
                                    <p className="mb-0">
                                      Order Date:{" "}
                                      {formatDateOnly(order.orderDate)}
                                    </p>
                                    <p className="mb-0 text-danger">
                                      Amount: ₹
                                      {formatAmount(Number(order.amount))} |
                                      Type: {order.orderType}
                                    </p>
                                    <p className="mb-0 text-muted">
                                      {order.address}
                                    </p>
                                  </div>

                                  <div className="text-end">
                                    <button
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() =>
                                        handleViewOrder(order.orderId)
                                      }
                                      title="Order Details"
                                    >
                                      <i className="bi bi-eye-fill"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No orders found.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OrderDetailsModal */}
      <OrderDetailsModal
        show={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        order={selectedOrder}
      />
      <Footer />
    </>
  );
}
