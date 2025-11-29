"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import "../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useRouter } from "next/navigation";
import Input from "@/app/components/Input/Input";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getPharmacistOrderByBuyerId,
  getPharmacistOrderById,
  getPharmacistOrders,
} from "@/lib/features/pharmacistOrderSlice/pharmacistOrderSlice";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import { PharmacistOrder } from "@/types/pharmacistOrder";
import InfiniteScroll from "@/app/components/InfiniteScrollS/InfiniteScrollS";
import { getPharmacyBuyersThunk } from "@/lib/features/pharmacistBuyerListSlice/pharmacistBuyerListSlice";
import { getUser } from "@/lib/auth/auth";
type Buyer = {
  id: number;
  name: string;
  number: string | null;
  email: string | null;
  uhid: string | null;
};

type PharmacyBuyerResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  pharmacy_id: number;
  data: Buyer[];
};

export default function OrderList() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pharmacy = getUser();
  const pharmacyId = Number(pharmacy?.pharmacy_id) || 0;
  const [showPrint, setShowPrint] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [showReport, setShowReport] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<PharmacistOrder[]>([]);
  //orderType
  const [orderType, setOrderType] = useState<string>("");
  const [selectedBuyer, setSelectedBuyer] = useState<number | "">("");
  const [modalLoading, setModalLoading] = useState(false);

  const {
    buyerOrderList,
    order: pharmacistOrder,
    orders,
  } = useAppSelector((state) => state.pharmacistOrder);

  const { pharmacyBuyers } = useAppSelector((state) => {
    const raw = state.pharmacistBuyerList.pharmacyBuyers;
    return {
      pharmacyBuyers: raw as unknown as PharmacyBuyerResponse | null,
    };
  });

  const orderData = Array.isArray(pharmacistOrder) ? pharmacistOrder : [];

  useEffect(() => {
    dispatch(getPharmacistOrders());
    dispatch(getPharmacyBuyersThunk(pharmacyId));
  }, [dispatch, pharmacyId]);

  // filtered records by search box + status filter
  useEffect(() => {
    // Step 1: Base data — buyer selected? then buyer orders, else all orders
    let baseData: PharmacistOrder[] = [];

    if (selectedBuyer && buyerOrderList?.length) {
      baseData = buyerOrderList as unknown as PharmacistOrder[];
    } else if (orders?.length) {
      baseData = orders;
    }

    let data = [...baseData];

    // Step 2: Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();

      data = data.filter((item) => {
        const id = String(item.orderId ?? "").toLowerCase();

        // 🔥 OrderId exact match (string or number)
        if (id === search) return true;

        // 🔥 Normal substring matching
        return Object.values(item).some((val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(search)
        );
      });
    }

    // Step 3: Order type filter
    if (orderType) {
      data = data.filter((item) => item.orderType === orderType);
    }

    // Step 4: Final output set
    setFilteredData(data);
  }, [orders, buyerOrderList, selectedBuyer, searchTerm, orderType]);

  //infinte scroll records
  const loadMore = () => {
    if (loadings || visibleCount >= orders.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  const handleBuyerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "") {
      setSelectedBuyer("");
      dispatch(getPharmacistOrders()); // Reset full list
      return;
    }

    const buyerId = Number(value);
    setSelectedBuyer(buyerId);

    dispatch(getPharmacistOrderByBuyerId({ buyerId }));
  };

  // 🗓️ Aaj ki date (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];
  const handleExport = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start Date cannot be after End Date!");
      return;
    }
    console.log("Generating report from", startDate, "to", endDate);
    // 🔽 yahan export / API call logic likho
    setShowReport(false);
  };

  const handleBook = () => {
    router.push(`/doctor/appointment/bookAppointment`);
  };
  const handleHistory = (orderId: number) => {
    setShowHistory(true); // Modal OPEN
    setModalLoading(true); // Loading START

    dispatch(getPharmacistOrderById({ orderId }))
      .unwrap()
      .finally(() => {
        setModalLoading(false); // Loading END when API finishes
      });
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <InfiniteScroll
            loadMore={loadMore}
            hasMore={visibleCount < filteredData.length}
            // className="body_content"
          >
            <div style={{ overflowX: "hidden", width: "100%" }}>
              <div
                className="row align-items-center justify-content-between"
                style={{ marginLeft: 0, marginRight: 0, width: "100%" }}
              >
                <div className="pageTitle col-md-6 col-12 text-start mt-2">
                  <i className="bi bi-receipt"></i> Order Summary
                </div>

                <div className="col-md-6 col-12 text-end mt-2 mb-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowReport(true)}
                    className="btn-style1"
                  >
                    <i className="bi bi-file-earmark-text"></i> Generate Report
                  </Button>
                </div>
              </div>
            </div>

            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-6">
                    <div className="txt_col">
                      <span className="lbl1">Search</span>
                      <input
                        type="text"
                        placeholder="Search..."
                        className="txt1"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Select Patient</span>
                      <select
                        className="txt1"
                        value={selectedBuyer}
                        onChange={handleBuyerChange}
                      >
                        <option value="">-Select Buyer-</option>
                        {pharmacyBuyers?.data?.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Order Type</span>
                      <select
                        className="txt1"
                        name="orderType"
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                        required
                      >
                        <option value="">-Select-</option>
                        <option value={"Online"}>Online</option>
                        <option value={"Offline"}>Offline</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        <th style={{ width: "0px" }}></th>
                        <th className="fw-bold text-start">Order Id</th>
                        <th className="fw-bold text-start">Name</th>
                        <th className="fw-bold text-start">Email</th>
                        {/* <th className="fw-bold text-start">GST</th> */}
                        <th className="fw-bold text-start">Amount</th>
                        <th className="fw-bold text-start">Type</th>
                        <th className="fw-bold text-start">Mode</th>
                        <th className="fw-bold text-start">Status</th>
                        <th className="fw-bold text-start">Date</th>
                        <th className="fw-bold text-start">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData
                        .slice(0, visibleCount)
                        .map((p: PharmacistOrder) => {
                          return (
                            <tr key={p.orderId}>
                              <td></td>
                              <td className="text-start">{p.orderId ?? ""}</td>
                              <td className="text-start">
                                {p.buyerName ?? ""}
                              </td>
                              <td className="text-start">{p.email_id ?? ""}</td>
                              {/* <td className="text-start">
                                {p.gst_number ?? ""}
                              </td> */}
                              <td className="text-start">{p.amount ?? ""}</td>
                              <td className="text-start">
                                {p.orderType ?? ""}
                              </td>
                              <td className="text-start">
                                {p.paymentMode ?? ""}
                              </td>
                              <td className="text-start">
                                {p.paymentStatus ?? ""}
                              </td>
                              <td className="text-start">
                                {formatDate(p.orderDate ?? "")}
                              </td>
                              <td className="text-start">
                                <button
                                  className="btn-style1"
                                  onClick={() => handleHistory(p.orderId)}
                                >
                                  <i className="bi bi-card-list"></i> Order
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {/* Spinner row */}
                      {loadings && (
                        <TableLoader colSpan={9} text="Loading more..." />
                      )}

                      {/* No more records */}
                      {!loadings && visibleCount >= orders.length && (
                        <tr>
                          <td
                            colSpan={9}
                            className="text-center py-2 text-muted fw-bold fs-6"
                          >
                            No more records
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </InfiniteScroll>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        show={showHistory}
        onHide={() => setShowHistory(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-vcard"></i> Patient Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* ====== LOADING STATE ====== */}
          {modalLoading && (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {!modalLoading && orderData.length > 0 && (
            <div className="container-fluid">
              {/* SHORTCUT */}
              {(() => {
                const o = orderData[0];

                return (
                  <>
                    {/* Patient Info */}
                    <div className="row">
                      <div className="col-md-4">
                        <p>
                          <strong>Name:</strong> {o.buyerName || "N/A"}
                        </p>
                      </div>

                      <div className="col-md-4">
                        <p>
                          <strong>Contact No:</strong> {o.buyerMobile || "N/A"}
                        </p>
                      </div>

                      <div className="col-md-4">
                        <p>
                          <strong>Email:</strong> {o.buyerEmail || "N/A"}
                        </p>
                      </div>
                    </div>

                    <br />
                    <Modal.Title>
                      <i className="bi bi-card-list"></i> Order Details
                    </Modal.Title>
                    <hr />

                    {/* Medical Details */}
                    <div className="row">
                      <div className="col-md-4">
                        <p style={{ whiteSpace: "pre-wrap" }}>
                          <strong>Order ID:</strong> {o.orderId}
                          {"\n"}
                          <strong>Order Date:</strong> {formatDate(o.orderDate)}
                        </p>
                      </div>

                      <div className="col-md-3">
                        <p style={{ whiteSpace: "pre-wrap" }}>
                          <strong>Order Type:</strong> {"\n"}
                          {o.orderType}
                        </p>
                      </div>

                      <div className="col-md-5">
                        <p style={{ whiteSpace: "pre-wrap" }}>
                          <strong>Billing Address:</strong>
                          {"\n"}
                          {o.address}
                          {"\n"}
                          <strong>Pincode:</strong> {o.pincode}
                        </p>
                      </div>
                    </div>

                    <hr />

                    {/* Prescription Table */}
                    <h5 className="fw-bold">Prescription</h5>
                    <table className="table table-bordered table-sm">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Manufacture</th>
                          <th>Dosage</th>
                          <th>Quantity</th>
                          <th>Remark</th>
                          <th>Price</th>
                          <th>Discount</th>
                          <th>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {o.products?.map((prod: any) => (
                          <tr key={prod.id}>
                            <td>{prod.medicine_name || ""}</td>
                            <td>{prod.manufacturer || ""}</td>
                            <td>{prod.doses || "-"}</td>
                            <td>{prod.quantity}</td>
                            <td>{prod.remark || "-"}</td>
                            <td>{prod.mrp}</td>
                            <td>{prod.discount}</td>
                            <td>{prod.rate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Billing Summary */}
                    <div
                      style={{
                        marginTop: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "15px 20px",
                        background: "#f8f9fa",
                        maxWidth: "300px",
                        marginLeft: "auto",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    >
                      <h5
                        style={{
                          textAlign: "center",
                          marginBottom: "15px",
                        }}
                      >
                        Billing Summary
                      </h5>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Amount:</span>
                        <strong>₹{o.amount}</strong>
                      </div>

                      <hr />

                      <div
                        className="d-flex justify-content-between"
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          color: "#007bff",
                        }}
                      >
                        <span>Net Amount:</span>
                        <span>₹{o.amount}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistory(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Generate Report Modal */}
      <Modal
        show={showReport}
        onHide={() => setShowReport(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-file-earmark-text me-2"></i> Generate Report
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="container-fluid">
            <div className="row align-items-end">
              <Input
                label="Start Date"
                type="date"
                name="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                max={today}
              />
              <Input
                label="End Date"
                type="date"
                name="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                max={today}
              />

              <div className="col-md-4 mb-3 d-flex align-items-end">
                <Button
                  variant="primary"
                  className="w-100 d-flex align-items-center justify-content-center gap-2"
                  style={{ height: "46px" }}
                  onClick={handleExport}
                >
                  <i className="bi bi-download"></i> Export Statement
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReport(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
