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
import { formatAmount } from "@/lib/utils/formatAmount";
import BillPreviewModal from "@/app/components/RetailCounterModal/BillPreviewModal";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
//import * as XLSX from "xlsx";
// import XLSX from "xlsx-style";

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
  // export loading
  const [exportLoading, setExportLoading] = useState(false);
  // bill print state
  const [isBillPreviewOpen, setIsBillPreviewOpen] = useState(false);
  const [billPreviewData, setBillPreviewData] = useState({
    cart: [],
    customerName: "",
    mobile: "",
    uhId: "",
    pharmacy_id: pharmacyId,
  });
  const [additionalDiscount, setAdditionalDiscount] = useState<string>("0");

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
  //  EXPORT / REPORT LOGIC
  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59.999`);

    try {
      setExportLoading(true);

      const allOrders = Array.isArray(orders) ? orders : [];

      const filteredOrders = allOrders.filter((o) => {
        if (!o?.orderDate) return false;
        const od = new Date(o.orderDate.replace(" ", "T"));
        return od >= start && od <= end;
      });

      if (!filteredOrders.length) {
        alert("No orders found for selected date range.");
        setShowReport(false);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = [];
      let serial = 1; // 🔥 START SERIAL NUMBER

      for (const ord of filteredOrders) {
        const res = await dispatch(
          getPharmacistOrderById({ orderId: ord.orderId })
        ).unwrap();

        const orderDetails =
          Array.isArray(res?.data) && res.data.length ? res.data[0] : null;

        if (!orderDetails) continue;

        const base = {
          "Sr. No.": "",
          "Order Id": orderDetails.orderId ?? "",
          "Patient Name": orderDetails.buyerName ?? "",
          Mobile: orderDetails.buyerNumber ?? "",
          Email: orderDetails.buyerEmail ?? "",
          UHID: orderDetails.buyer_uhid ?? "",
          "Order Date": orderDetails.orderDate ?? "",
          "Payment Status": orderDetails.paymentStatus ?? "",
          Amount: formatAmount(orderDetails.amount ?? ""),
          "Order Type": orderDetails.orderType ?? "",
          "Payment Mode": orderDetails.paymentMode ?? "",
          "Additional Discount": orderDetails.additional_discount ?? "",
        };

        const products = orderDetails.products ?? [];

        if (products.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          products.forEach((p: any) => {
            rows.push({
              ...base,
              "Sr. No.": serial++,
              "Medicine Name": p.medicine_name ?? "",
              Manufacturer: p.manufacturer ?? "",
              Quantity: p.quantity ?? "",
              MRP: p.mrp ?? "",
              Discount: p.discount ?? "",
              Rate: p.rate ?? "",
            });
          });
        } else {
          rows.push({
            ...base,
            "Medicine Name": "",
            Manufacturer: "",
            Quantity: "",
            MRP: "",
            Discount: "",
            Rate: "",
          });
        }
      }

      // ====== CREATE WORKBOOK ======
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Orders");

      // Set header row
      const header = Object.keys(rows[0]);
      worksheet.addRow(header);

      // Add data rows
      rows.forEach((r) => worksheet.addRow(Object.values(r)));

      // ===== HEADER STYLING =====
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "000000" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "B4C4E0" }, // light blue
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        };
      });

      // ===== BORDER FOR ALL DATA CELLS =====
      worksheet.eachRow((row, rowNum) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          };
        });
      });

      // ===== DOWNLOAD FILE =====
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        `orders_${startDate}_to_${endDate}.xlsx`
      );

      setShowReport(false);
    } catch (e) {
      console.error(e);
      alert("Export error");
    } finally {
      setExportLoading(false);
    }
  };

  //END EXPORT / REPORT LOGIC

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleReprint = (order: any) => {
    const cartItems =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order.products?.map((p: any) => ({
        medicine_name: p.medicine_name,
        price: Number(p.mrp),
        qty: Number(p.quantity),
        Disc: Number(p.discount),
        total: Number(p.rate),
        dose_form: p.doses,
        remarks: p.remark,
        duration: p.duration,
      })) || [];

    setBillPreviewData({
      cart: cartItems,
      customerName: order.buyerName || "",
      mobile: order.buyerNumber || "",
      uhId: order.buyer_uhid || "",
      pharmacy_id: pharmacyId,
    });
    setAdditionalDiscount(String(order.additional_discount || "0"));
    setIsBillPreviewOpen(true);
  };
  const handleReprintFromTable = async (orderId: number) => {
    const full = await dispatch(getPharmacistOrderById({ orderId })).unwrap();

    const order = Array.isArray(full?.data) ? full.data[0] : null;

    if (!order) return;

    handleReprint(order);
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
                        <th className="fw-bold text-start">Mobile</th>
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
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.orderDate).getTime() -
                            new Date(a.orderDate).getTime()
                        )
                        .slice(0, visibleCount)
                        .map((p: PharmacistOrder) => {
                          return (
                            <tr key={p.orderId}>
                              <td></td>
                              <td className="text-start">{p.orderId ?? ""}</td>
                              <td className="text-start">
                                {p.buyerName ?? ""}
                              </td>
                              <td className="text-start">
                                {p.buyerNumber ?? ""}
                              </td>
                              {/* <td className="text-start">
                                {p.gst_number ?? ""}
                              </td> */}
                              <td className="text-start">
                                {formatAmount(Number(p.amount))}
                              </td>
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
                                <button
                                  className="btn-style1 ms-2"
                                  onClick={() =>
                                    handleReprintFromTable(p.orderId)
                                  }
                                >
                                  <i className="bi bi-printer-fill"></i> Reprint
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
        <Modal.Header
          closeButton
          className="text-white"
          style={{
            background: "linear-gradient(90deg, #007bff, #0056d6)",
            borderBottom: "none",
          }}
        >
          <Modal.Title className="fw-semibold">
            <i className="bi bi-receipt-cutoff me-2"></i> Order Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ background: "#f4f6f9", padding: "25px" }}>
          {modalLoading && (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          )}

          {!modalLoading &&
            orderData.length > 0 &&
            (() => {
              const o = orderData[0];
              // -------------------- BILLING CALCULATIONS --------------------
              const totalAmount = o.products?.reduce(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (sum: any, p: any) => sum + Number(p.rate || 0),
                0
              );
              const additionalDiscount = Number(o.additional_discount || 0);
              const netAmount =
                totalAmount - (totalAmount * Number(additionalDiscount)) / 100;
              // --------------------------------------------------------------
              return (
                <>
                  {/* TOP 2 CARDS */}
                  <div className="row g-4 mb-4 d-flex align-items-stretch">
                    {/* PATIENT CARD */}
                    <div className="col-md-6 d-flex">
                      <div
                        className="p-4 bg-white flex-fill"
                        style={{
                          borderRadius: "14px",
                          border: "1px solid #e4e7ec",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          fontSize: "14px",
                        }}
                      >
                        <h5
                          className="fw-bold mb-3 d-flex align-items-center"
                          style={{ fontSize: "16px" }}
                        >
                          <i className="bi bi-person-badge me-2 text-primary"></i>
                          Patient Details
                        </h5>

                        <p>
                          <strong>Name:</strong> {o.buyerName}
                        </p>
                        <p>
                          <strong>Mobile:</strong> {o.buyerNumber}
                        </p>
                        <p>
                          <strong>Email:</strong> {o.buyerEmail}
                        </p>
                        <p>
                          <strong>UHID:</strong> {o.buyer_uhid}
                        </p>
                      </div>
                    </div>

                    {/* BILLING CARD */}
                    <div className="col-md-6 d-flex">
                      <div
                        className="p-4 bg-white flex-fill"
                        style={{
                          borderRadius: "14px",
                          border: "1px solid #e4e7ec",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          fontSize: "14px",
                        }}
                      >
                        <h5
                          className="fw-bold mb-3 d-flex align-items-center"
                          style={{ fontSize: "16px" }}
                        >
                          <i className="bi bi-geo-alt me-2 text-primary"></i>
                          Billing Address
                        </h5>

                        <p>
                          <strong>Name:</strong> {o.recipient_name}
                        </p>
                        <p>
                          <strong>Mobile:</strong> {o.recipient_mobile}
                        </p>
                        <p>
                          <strong>Address:</strong> {o.address}
                        </p>
                        <p>
                          <strong>Location:</strong> {o.location || "N/A"}
                        </p>
                        <p>
                          <strong>Pincode:</strong> {o.pincode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ORDER INFO */}
                  <div
                    className="p-4 mb-4 bg-white"
                    style={{
                      borderRadius: "14px",
                      border: "1px solid #e4e7ec",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <h5 className="fw-bold mb-3 d-flex align-items-center">
                      <i className="bi bi-card-checklist me-2 text-primary"></i>
                      Order Information
                    </h5>

                    <div className="row">
                      <div className="col-md-4 mb-2">
                        <strong>Order ID:</strong> {o.orderId}
                      </div>
                      <div className="col-md-4 mb-2">
                        <strong>Order Date:</strong> {formatDate(o.orderDate)}
                      </div>
                      <div className="col-md-4 mb-2">
                        <strong>Order Type:</strong> {o.orderType}
                      </div>
                    </div>
                  </div>

                  {/* PRESCRIPTION TABLE */}
                  <div
                    className="p-4 mb-4 bg-white"
                    style={{
                      borderRadius: "14px",
                      border: "1px solid #e4e7ec",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h5 className="fw-bold mb-3">Prescription</h5>

                    <table
                      className="table table-bordered table-sm"
                      style={{ borderRadius: "10px", overflow: "hidden" }}
                    >
                      <thead className="table-light">
                        <tr>
                          <th>Medicine</th>
                          <th>Manufacture</th>
                          <th>Doses</th>
                          <th>Instruction</th>
                          <th>Duration</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Discount</th>
                          <th>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {o.products?.map((p: any) => (
                          <tr key={p.id}>
                            <td>{p.medicine_name}</td>
                            <td>{p.manufacturer}</td>
                            <td>{p.doses || "-"}</td>
                            <td>{p.remark || "-"}</td>
                            <td>{p.duration || "-"}</td>
                            <td>{p.quantity}</td>
                            <td>{p.mrp}</td>
                            <td>{p.discount}</td>
                            <td>{formatAmount(p.rate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* BILLING SUMMARY */}
                  <div
                    className="p-4 bg-white"
                    style={{
                      borderRadius: "14px",
                      border: "1px solid #e4e7ec",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      maxWidth: "330px",
                      marginLeft: "auto",
                    }}
                  >
                    <h5 className="fw-bold text-center mb-3">
                      Billing Summary
                    </h5>

                    <div className="d-flex justify-content-between text-danger mb-2 fw-bold">
                      <span>Total Amount:</span>
                      <strong>₹{formatAmount(totalAmount)}</strong>
                    </div>
                    {Number(additionalDiscount) > 0 && (
                      <div className="d-flex justify-content-between text-success mb-2 fw-bold">
                        <span>Additional Discount:</span>
                        <strong>₹{formatAmount(additionalDiscount)}</strong>
                      </div>
                    )}

                    <hr />

                    <div className="d-flex justify-content-between text-primary fw-bold fs-5">
                      <span>Grand Total:</span>

                      <span>₹{formatAmount(netAmount)}</span>
                    </div>
                  </div>
                </>
              );
            })()}
        </Modal.Body>

        <Modal.Footer style={{ borderTop: "none" }}>
          <Button variant="secondary" onClick={() => setShowHistory(false)}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => {
              setShowHistory(false);
              handleReprint(orderData[0]);
            }}
          >
            <i className="bi bi-printer-fill"></i> Reprint
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
                  disabled={exportLoading}
                >
                  {exportLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span> Generating...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download"></i> Export Statement
                    </>
                  )}
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
      <BillPreviewModal
        show={isBillPreviewOpen}
        onClose={() => setIsBillPreviewOpen(false)}
        cart={billPreviewData.cart}
        customerName={billPreviewData.customerName}
        mobile={billPreviewData.mobile}
        uhid={billPreviewData.uhId}
        pharmacy_id={billPreviewData.pharmacy_id}
        additionalDiscount={additionalDiscount}
      />
    </>
  );
}
