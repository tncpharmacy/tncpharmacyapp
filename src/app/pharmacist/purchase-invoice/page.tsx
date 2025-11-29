"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import "../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useRouter } from "next/navigation";
import Input from "@/app/components/Input/Input";
import { StockItem } from "@/types/stock";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getPharmacistById,
  getPharmacistList,
  resetPharmacistById,
} from "@/lib/features/purchaseStockSlice/purchaseStockSlice";
import InfiniteScroll from "@/app/components/InfiniteScrollS/InfiniteScrollS";
import TableLoader from "@/app/components/TableLoader/TableLoader";

export default function PurchaseInvoice() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPrint, setShowPrint] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [showReport, setShowReport] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderType, setOrderType] = useState("");

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<StockItem[]>([]);
  //status
  const [status, setStatus] = useState<string>("");

  const { purchaseStockList, purchaseStockById } = useAppSelector(
    (state) => state.purchaseStock
  );

  console.log("purchaseStockList", purchaseStockList);

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getPharmacistList());
  }, [dispatch]);

  // filtered records by search box + status filter
  useEffect(() => {
    let data: StockItem[] = purchaseStockList || [];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();

      data = data.filter((item: StockItem) => {
        return Object.keys(item).some((key) => {
          const value = String(item[key as keyof StockItem] ?? "")
            .toLowerCase()
            .trim();

          if (key === "gender") {
            // gender exact match hona chahiye
            return value === lower;
          }

          // baaki fields substring match
          return value.includes(lower);
        });
      });
    }

    // if (status) {
    //   data = data.filter((item: StockItem) => item.status === status);
    // }

    setFilteredData(data);
  }, [searchTerm, status, purchaseStockList]);

  //infinte scroll records
  const loadMore = () => {
    if (loadings || visibleCount >= purchaseStockList.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
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

  const handleHistory = (id: number) => {
    dispatch(resetPharmacistById());
    dispatch(getPharmacistById({ id }));
    setShowHistory(true);
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
            <div className="pageTitle">
              <i className="bi bi-receipt"></i> Purchase Summary
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-8">
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
                  {/* <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Order Type</span>
                      <select
                        className="txt1"
                        name="orderType"
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                        required
                      >
                        <option>-Select-</option>
                        <option>Online</option>
                        <option>Offline</option>
                      </select>
                    </div>
                  </div> */}
                  <div className="col-md-4 text-end">
                    <div className="txt_col">
                      <Link
                        href={"/pharmacist/import"}
                        className="btn-style2 me-2"
                      >
                        <i className="bi bi-upload"></i> Import
                      </Link>
                      <Link
                        href={"/pharmacist/export"}
                        className="btn-style2 me-2"
                      >
                        <i className="bi bi-download"></i> Export
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        <th style={{ width: "0px" }}></th>
                        <th className="fw-bold text-start">Pharmacy</th>
                        <th className="fw-bold text-start">Supplier</th>
                        <th className="fw-bold text-start">Purchase Date</th>
                        <th className="fw-bold text-start">Invoice Number</th>
                        <th className="fw-bold text-start">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData
                        .slice(0, visibleCount)
                        .map((p: StockItem) => {
                          return (
                            <tr key={p.id}>
                              <td></td>
                              <td className="text-start">
                                {p.pharmacy_name ?? ""}
                              </td>
                              <td className="text-start">
                                {p.supplier_name ?? ""}
                              </td>
                              <td className="text-start">
                                {p.purchase_date ?? ""}
                              </td>
                              <td className="text-start">
                                {p.invoice_num ?? ""}
                              </td>
                              <td className="text-start">
                                <button
                                  className="btn-style1"
                                  onClick={() => handleHistory(p.id)}
                                >
                                  <i className="bi bi-card-list"></i> Purchase
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
                      {!loadings &&
                        visibleCount >= purchaseStockList.length && (
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

      {/* Purchase Details Modal */}
      <Modal
        show={showHistory}
        onHide={() => setShowHistory(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-card-list me-2"></i> Purchase Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!purchaseStockById ? (
            <p>Loading...</p>
          ) : (
            <div className="container-fluid">
              {/* TOP INFO */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Pharmacy:</strong>{" "}
                    {purchaseStockById.pharmacy_name ?? ""}
                  </p>
                  <p className="mb-1">
                    <strong>Supplier:</strong> {purchaseStockById.supplier_name}
                  </p>
                </div>

                <div className="col-md-6 text-end">
                  <p className="mb-1">
                    <strong>Invoice Number:</strong>{" "}
                    {purchaseStockById.invoice_num}
                  </p>
                  <p className="mb-1">
                    <strong>Purchase Date:</strong>{" "}
                    {new Date(
                      purchaseStockById?.purchase_date || ""
                    ).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>

              <hr />

              {/* ITEMS TABLE */}
              <h6 className="mt-3 mb-2 fw-bold">Items Purchased</h6>

              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Pack</th>
                    <th>Batch</th>
                    <th>Expiry</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {purchaseStockById.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.medicine_name}</td>
                      <td>{item.pack_size}</td>
                      <td>{item.batch}</td>
                      <td>
                        {new Date(item.expiry_date).toLocaleDateString("en-GB")}
                      </td>
                      <td>{item.quantity}</td>
                      <td>₹{item.purchase_rate}</td>
                      <td>₹{Number(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* BILLING SUMMARY */}
              <div
                style={{
                  marginTop: "20px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "15px 20px",
                  background: "#f8f9fa",
                  maxWidth: "320px",
                  marginLeft: "auto",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h5 style={{ textAlign: "center", marginBottom: "15px" }}>
                  Billing Summary
                </h5>

                <div className="d-flex justify-content-between mb-2">
                  <span>Total Amount:</span>
                  <strong>
                    ₹
                    {purchaseStockById.items
                      ?.reduce(
                        (sum: number, item) => sum + Number(item.amount),
                        0
                      )
                      .toFixed(2)}
                  </strong>
                </div>

                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Discount:</span>
                  <strong>- ₹0</strong>
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
                  <span>
                    ₹
                    {purchaseStockById.items
                      ?.reduce(
                        (sum: number, item) => sum + Number(item.amount),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>
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
