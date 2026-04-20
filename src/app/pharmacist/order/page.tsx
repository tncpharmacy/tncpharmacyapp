"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import "../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useRouter } from "next/navigation";
import Input from "@/app/components/Input/InputColSm";
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
import TncLoader from "@/app/components/TncLoader/TncLoader";
import { formatDate } from "@/lib/utils/dateFormatter";
import {
  getReportOrderWiseApi,
  getReportProductWiseApi,
} from "@/lib/api/pharmacistOrder";
import { formatPrice } from "@/lib/utils/formatPrice";

const mediaPrescriptionBase = process.env.NEXT_PUBLIC_PRESCRIPTION_BASE_URL;

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
  const [orderTypes, setOrderTypes] = useState("");
  const [paymentMode, setPaymentMode] = useState("");

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
    referredByDoctor: "",
    referredByHospital: "",
  });
  const [additionalDiscount, setAdditionalDiscount] = useState<string>("0");
  // prescription view state
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const {
    buyerOrderList,
    order: pharmacistOrder,
    orders,
    loading,
    listLoading,
    detailsLoading,
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
  //  get report order wise
  const handleOrderWiseExport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    try {
      setExportLoading(true);

      let grandTotal = 0;
      const res = await getReportOrderWiseApi({
        startDate,
        endDate,
        orderType:
          orderTypes && orderTypes !== "0" ? Number(orderTypes) : undefined,
        paymentMode:
          paymentMode && paymentMode !== "0" ? Number(paymentMode) : undefined,
      });

      // ✅ FIX: correct data extraction
      const apiData = res?.data?.data;

      if (!Array.isArray(apiData) || apiData.length === 0) {
        alert("No data found for selected filters.");
        setShowReport(false);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = [];
      let serial = 1;

      for (const orderDetails of apiData) {
        const products = orderDetails.products ?? [];

        if (!products.length) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        products.forEach((p: any, index: number) => {
          // ✅ ADD TOTAL ONLY ONCE PER ORDER
          if (index === 0) {
            grandTotal += Number(orderDetails.amount || 0);
          }
          rows.push({
            "Sr. No.": index === 0 ? serial++ : "",

            // ✅ ONLY FIRST ROW FULL DATA
            "Order Id": index === 0 ? orderDetails.orderId ?? "" : "",
            "Patient Name": index === 0 ? orderDetails.buyerName ?? "" : "",
            Mobile: index === 0 ? orderDetails.buyerNumber ?? "" : "",
            "Order Date": index === 0 ? orderDetails.orderDate ?? "" : "",
            Amount: index === 0 ? formatPrice(orderDetails.amount ?? "") : "",
            "Order Type": index === 0 ? orderDetails.orderType ?? "" : "",
            "Payment Mode": index === 0 ? orderDetails.paymentMode ?? "" : "",
            // ✅ ALWAYS PRINT PRODUCT DATA
            "Medicine Name": p.medicine_name ?? "",
            Quantity: p.quantity ?? "",
          });
        });
      }

      // ✅ Excel creation
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Orders");

      const header = Object.keys(rows[0]);
      worksheet.addRow(header);

      rows.forEach((r) => worksheet.addRow(Object.values(r)));
      // 🔥 YAHAN ADD KARNA HAI
      worksheet.addRow([]);

      const totalRow = worksheet.addRow([
        "",
        "",
        "",
        "",
        "Grand Total",
        formatAmount(grandTotal),
      ]);
      totalRow.font = { bold: true };

      // Header styling
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "B4C4E0" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        };
      });

      // Borders for all cells
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          };
        });
      });

      // Download file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `orders_${startDate}_to_${endDate}.xlsx`);
      // ✅ RESET FORM
      setStartDate("");
      setEndDate("");
      setOrderTypes("");
      setPaymentMode("");
      setShowReport(false);
    } catch (error) {
      console.error("Export Error:", error);
      alert("Export failed. Check console.");
    } finally {
      setExportLoading(false);
    }
  };
  // get report product wise
  const handleProductWiseExport = async () => {
    try {
      setExportLoading(true);

      const res = await getReportProductWiseApi(); // 👈 tera API

      const apiData = res?.data?.data;

      if (!Array.isArray(apiData) || apiData.length === 0) {
        alert("No data found");
        return;
      }

      // 🔥 PRODUCT AGGREGATION
      const productMap: Record<string, number> = {};

      for (const order of apiData) {
        const products = order.products ?? [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        products.forEach((p: any) => {
          const name = p.medicine_name || "Unknown";
          const qty = Number(p.quantity || 0);

          if (productMap[name]) {
            productMap[name] += qty;
          } else {
            productMap[name] = qty;
          }
        });
      }

      // 🔥 CONVERT TO ROWS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = [];
      let serial = 1;

      Object.entries(productMap).forEach(([name, qty]) => {
        rows.push({
          "Sr. No.": serial++,
          "Product Name": name,
          Quantity: qty,
        });
      });

      // 🔥 EXCEL
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Product Report");

      const header = Object.keys(rows[0]);
      worksheet.addRow(header);

      rows.forEach((r) => worksheet.addRow(Object.values(r)));

      // Header styling
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "B4C4E0" },
        };
        cell.alignment = { horizontal: "center" };
      });

      // Borders
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          };
        });
      });

      // Download
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `product_report.xlsx`);
    } catch (error) {
      console.error(error);
      alert("Export failed");
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

  // const formatDate = (dateString: string) => {
  //   const d = new Date(dateString);
  //   return d.toLocaleString("en-IN", {
  //     day: "2-digit",
  //     month: "short",
  //     year: "numeric",
  //   });
  // };
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
      referredByDoctor: order.referred_by_doctor || "",
      referredByHospital: order.referred_by_hospital || "",
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

  const handleViewPrescription = (url?: string | null) => {
    if (url) {
      setPreviewUrl(`${url}`);
    } else {
      setPreviewUrl("");
    }
    setShowPreview(true);
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
                className="row align-items-center"
                style={{ marginLeft: 0, marginRight: 0 }}
              >
                {/* LEFT TITLE */}
                <div className="pageTitle col-md-6 col-12 text-start mt-2">
                  <i className="bi bi-receipt"></i> Order Summary
                </div>

                {/* RIGHT BUTTON GROUP */}
                <div className="col-md-6 col-12 d-flex justify-content-md-end justify-content-start mt-2 mb-2 gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowReport(true)}
                    className="btn-style1"
                  >
                    <i className="bi bi-file-earmark-text"></i>{" "}
                    <span className="fw-semibold">Sales Report Orderwise</span>
                  </Button>

                  <Button
                    variant="outline-primary"
                    onClick={handleProductWiseExport}
                    className="btn-style1"
                  >
                    <i className="bi bi-file-earmark-text"></i>{" "}
                    <span className="fw-semibold">
                      Sales Report Productwise
                    </span>
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
                        {/* <th style={{ width: "0px" }}></th> */}
                        <th className="fw-bold text-start">Order Id</th>
                        <th className="fw-bold text-start">Name</th>
                        <th className="fw-bold text-start">Mobile</th>
                        {/* <th className="fw-bold text-start">GST</th> */}
                        <th className="fw-bold text-start">Amount</th>
                        <th className="fw-bold text-start">Type</th>
                        <th className="fw-bold text-start">Mode</th>
                        <th className="fw-bold text-start">Date</th>
                        <th className="fw-bold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listLoading ? (
                        <TableLoader colSpan={9} text="Loading records..." />
                      ) : (
                        <>
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
                                  {/* <td></td> */}
                                  <td className="text-start">
                                    {p.orderId ?? ""}
                                  </td>
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
                                    {formatDate(p.orderDate ?? "")}
                                  </td>
                                  <td className="text-center">
                                    <button
                                      className="btn btn-light btn-sm"
                                      title="Order Details"
                                      onClick={() => handleHistory(p.orderId)}
                                    >
                                      <i className="bi bi-eye-fill"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-light"
                                      onClick={() =>
                                        handleViewPrescription(
                                          p.prescription_url
                                        )
                                      }
                                      title="View Prescription"
                                    >
                                      <i className="bi bi-file-earmark-text text-danger"></i>
                                    </button>
                                    <button
                                      className="btn btn-light btn-sm ms-2"
                                      title="Order Reprint"
                                      onClick={() =>
                                        handleReprintFromTable(p.orderId)
                                      }
                                    >
                                      <i className="bi bi-printer-fill"></i>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </>
                      )}
                      {/* Spinner row */}
                      {loadings && (
                        <TableLoader colSpan={9} text="Loading more..." />
                      )}

                      {/* No more records */}
                      {!listLoading &&
                        !loadings &&
                        filteredData.length === 0 && (
                          <tr>
                            <td
                              colSpan={9}
                              className="text-center py-2 text-muted fw-bold fs-6"
                            >
                              No records found
                            </td>
                          </tr>
                        )}

                      {!listLoading &&
                        !loadings &&
                        filteredData.length > 0 &&
                        visibleCount >= filteredData.length && (
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
          {modalLoading && <TncLoader />}

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
                      <div className="col-md-6 mb-2">
                        <strong>Order ID:</strong> {o.orderId}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Referred By Doctor:</strong>{" "}
                        {o.referred_by_doctor}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <strong>Order Date:</strong> {formatDate(o.orderDate)}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Referred By Hospital:</strong>{" "}
                        {o.referred_by_hospital}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-2">
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
      {/* Generate Report Modal with order wise */}
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
                colSm={3}
              />
              <Input
                label="End Date"
                type="date"
                name="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                max={today}
                colSm={3}
              />
              <Input
                label="Order Type"
                type="select"
                name="orderTypes"
                value={orderTypes}
                onChange={(e) => setOrderTypes(e.target.value)}
                required
                options={[
                  { value: "1", label: "Online" },
                  { value: "2", label: "Offline" },
                ]}
                colSm={3}
              />

              <Input
                label="Payment Mode"
                type="select"
                name="paymentMode"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                required
                options={[
                  { value: "1", label: "Online" },
                  { value: "2", label: "COD" },
                ]}
                colSm={3}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReport(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleOrderWiseExport}
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
        </Modal.Footer>
      </Modal>
      {/* Prescription view modal */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Prescription</Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {previewUrl ? (
            <iframe
              src={previewUrl}
              width="100%"
              height="100%"
              style={{ border: "none", borderRadius: "8px" }}
            />
          ) : (
            <div style={{ textAlign: "center", color: "#6c757d" }}>
              <i
                className="bi bi-file-earmark-x"
                style={{ fontSize: "60px", marginBottom: "10px" }}
              ></i>

              <h5 style={{ marginBottom: "5px" }}>No Prescription Available</h5>

              <p style={{ fontSize: "14px" }}>
                This order does not have any prescription uploaded.
              </p>
            </div>
          )}
        </Modal.Body>
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
        referredByDoctor={billPreviewData.referredByDoctor}
        referredByHospital={billPreviewData.referredByHospital}
      />
    </>
  );
}
