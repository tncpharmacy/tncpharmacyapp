"use client";

import React, { useEffect, useState } from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";
import OrderDetailsModal, {
  OrderDetails as ModalOrderDetails,
} from "@/app/components/BuyerProfileModal/OrderDetailsModal";
import { Image } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAddress,
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
  const [selectedOrder, setSelectedOrder] = useState<ModalOrderDetails | null>(
    null
  );
  const [isClient, setIsClient] = useState(false);

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
  console.log("Raw orders:", rawOrderList);

  // Convert slice data to modal-compatible OrderDetails
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getOrderList: OrderDetails[] = (rawOrderList as unknown as any).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (o: any) => ({
      orderId: o.orderId,
      buyerName: o.buyerName,
      orderDate: o.orderDate,
      paymentStatus: o.paymentStatus,
      amount: o.amount,
      orderType: o.orderType,
      paymentMode: o.paymentMode,
      address: o.address,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: o.products.map((p: any) => ({
        id: p.id,
        productName: p.productName,
        quantity: p.quantity,
        mrp: p.mrp,
        discount: p.discount,
        rate: p.rate,
        doses: p.doses,
        instruction: p.instruction,
        status: p.status,
        manufacturer: p.manufacturer,
      })),
    })
  );

  // Fetch orders & addresses
  useEffect(() => {
    if (userId !== null) {
      dispatch(getBuyerOrdersList(userId));
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

  const handleViewOrder = async (orderId: number) => {
    try {
      const details = await dispatch(getBuyerOrderDetails(orderId)).unwrap();
      // cast to modal-compatible type
      setSelectedOrder({
        ...details,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: (details as any).paymentStatus,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalAmount: (details as any).amount,
      } as unknown as ModalOrderDetails);

      setShowOrderModal(true);
    } catch (err) {
      toast.error("Failed to fetch order details");
      console.error(err);
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
                      <h5 className="fw-bold mb-3">Hi there!</h5>
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
                        <h5 className="fw-bold mb-0">My Address</h5>
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
                      {billingAddresses.map((addr, idx) => (
                        <div key={idx} className="border rounded p-3 mb-3">
                          <label
                            className="fw-semibold mb-0"
                            style={{ fontSize: "15px", color: "#212121" }}
                          >
                            {addr.address_type_id === 1
                              ? "Home"
                              : addr.address_type_id === 2
                              ? "Office"
                              : "Other"}
                          </label>
                          <p className="text-muted mb-0">{addr.name}</p>
                          <p className="text-muted mb-0">{addr.address}</p>
                          <p className="text-muted mb-0">
                            {addr.location} - {addr.pincode}
                          </p>
                          <p className="text-muted mb-2">{addr.mobile}</p>
                          <button
                            className="btn btn-link p-0 fw-semibold text-danger"
                            style={{ fontSize: "13px" }}
                            onClick={() => addr.id && handleRemove(addr.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "order" && (
                    <div>
                      <h5 className="fw-bold mb-3">My Orders</h5>
                      {getOrderList.length > 0 ? (
                        getOrderList.map((order) => (
                          <div
                            key={order.orderId}
                            className="border rounded p-3 mb-3"
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">Order #{order.orderId}</h6>
                                <p className="mb-0 text-muted">
                                  Status:{" "}
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
                                <p className="mb-0 text-muted">
                                  Amount: ₹{order.amount} | Type:{" "}
                                  {order.orderType}
                                </p>
                                <p className="mb-0 text-muted">
                                  {order.address}
                                </p>
                              </div>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleViewOrder(order.orderId)}
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))
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
