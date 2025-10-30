"use client";

import React, { useState } from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";
import EditProfileModal from "@/app/components/BuyerProfileModal/EditProfileModal";
import { FaEdit } from "react-icons/fa";
import { FiPhone, FiMail } from "react-icons/fi";
import OrderDetailsModal, {
  OrderDetails,
} from "@/app/components/BuyerProfileModal/OrderDetailsModal";
import { Image } from "react-bootstrap";

export default function BuyerProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showModal, setShowModal] = useState(false);

  // Order Details modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);

  const [profile, setProfile] = useState({
    name: "Pulkit Sharma",
    mobile: "9999355555",
    email: "pulkit@example.com",
  });

  const handleUpdate = () => {
    console.log("Updated profile:", profile);
    setShowModal(false);
  };

  // Dummy orders
  const orders: OrderDetails[] = [
    {
      orderId: "12345",
      status: "Delivered",
      totalAmount: 599,
      address: "Pulkit Sharma, 123 MG Road, Delhi",
      products: [
        { name: "Paracetamol 500mg", qty: 2, price: 199 },
        { name: "Cough Syrup", qty: 1, price: 200 },
        { name: "Vitamin C Tablets", qty: 1, price: 200 },
      ],
    },
    {
      orderId: "12346",
      status: "Pending",
      totalAmount: 1299,
      address: "Pulkit Sharma, Sector 14, Gurgaon",
      products: [
        { name: "Protein Powder", qty: 1, price: 899 },
        { name: "Pain Relief Spray", qty: 1, price: 400 },
      ],
    },
  ];

  const handleViewOrder = (order: OrderDetails) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

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
                  <h4 className="fw-bold mb-1">Welcome, Pulkit 👋</h4>
                  <p className="mb-0 opacity-75">Your personal dashboard</p>
                </div>

                {/* Tabs */}
                <div
                  className="d-flex text-center fw-semibold border"
                  style={{ borderColor: "#0a214aff" }}
                >
                  {[
                    { id: "profile", label: "My Profile" },
                    { id: "address", label: "My Address" },
                    { id: "order", label: "My Orders" },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
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
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="p-4">
                  {activeTab === "profile" && (
                    <div className="p-3 position-relative border rounded bg-white shadow-sm">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="fw-bold mb-1">Hi there!</h5>
                          <p className="text-muted">Joined in Aug, 2019</p>
                        </div>
                        <FaEdit
                          size={22}
                          color="#264b8c"
                          className="cursor-pointer"
                          style={{ cursor: "pointer" }}
                          onClick={() => setShowModal(true)}
                        />
                      </div>
                      <hr />
                      <div className="mt-3">
                        <div className="mb-3 d-flex align-items-center">
                          <Image
                            src="/images/person-icon.png"
                            alt="phone"
                            width={45}
                            height={45}
                            className="me-4 opacity-75"
                          />
                          <div>
                            <label className="text-muted d-block">
                              Patient Name
                            </label>
                            <strong>{profile.name}</strong>
                          </div>
                        </div>
                        <hr />
                        <div className="mb-3 d-flex align-items-center">
                          <Image
                            src="/images/mobile-icon.png"
                            alt="phone"
                            width={45}
                            height={45}
                            className="me-4 opacity-75"
                          />
                          <div>
                            <label className="text-muted d-block">
                              Mobile Number
                            </label>
                            <strong>{profile.mobile}</strong>
                          </div>
                        </div>
                        <hr />
                        <div className="mb-3 d-flex align-items-center">
                          <Image
                            src="/images/email-icon.png"
                            alt="phone"
                            width={45}
                            height={45}
                            className="me-4 opacity-75"
                          />
                          <div>
                            <label className="text-muted d-block">
                              Primary Email address
                            </label>
                            <strong>{profile.email}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "address" && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">My Address</h5>
                        <button type="button" className="btn btn-primary">
                          + Add New Address
                        </button>
                      </div>

                      <div className="border rounded p-3 mb-3">
                        <h6 className="mb-1">Home</h6>
                        <p className="text-muted mb-0">Pulkit Srivastava</p>
                        <p className="text-muted mb-0">
                          123, Model Town, Delhi, India - 110009
                        </p>
                        <p className="text-muted mb-2">9856321478</p>
                        <i className="bi bi-trash text-danger"></i>
                      </div>
                      <div className="border rounded p-3 mb-3">
                        <h6 className="mb-1">Home</h6>
                        <p className="text-muted mb-0">Pulkit Srivastava</p>
                        <p className="text-muted mb-0">
                          123, Model Town, Delhi, India - 110009
                        </p>
                        <p className="text-muted mb-2">9856321478</p>
                        <i className="bi bi-trash text-danger"></i>
                      </div>
                    </div>
                  )}

                  {activeTab === "order" && (
                    <div>
                      <h5 className="fw-bold mb-3">My Orders</h5>

                      {orders.map((order) => (
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
                                    order.status === "Delivered"
                                      ? "text-success"
                                      : "text-warning"
                                  }
                                >
                                  {order.status}
                                </span>
                              </p>
                            </div>

                            <div className="d-flex align-items-center">
                              <span className="fw-bold text-primary me-3">
                                ₹{order.totalAmount}
                              </span>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleViewOrder(order)}
                              >
                                <i className="bi bi-eye"></i> View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* EditProfileModal */}
      <EditProfileModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        profile={profile}
        setProfile={setProfile}
        handleUpdate={handleUpdate}
      />
      {/* OrderDetailsModal */}
      <OrderDetailsModal
        show={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        order={selectedOrder}
      />

      {/* ...footer code... */}
      <Footer />
    </>
  );
}
