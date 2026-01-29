"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import "../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
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
import { formatAmount } from "@/lib/utils/formatAmount";
import { formatDateOnly } from "@/utils/dateFormatter";
import TncLoader from "@/app/components/TncLoader/TncLoader";
import SelectInput from "@/app/components/Input/SelectInput";
import { fetchPharmacyList } from "@/lib/features/pharmacyListSlice/pharmacyListSlice";

export default function PurchaseInvoice() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPrint, setShowPrint] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [showReport, setShowReport] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<number | null>(
    null
  );

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<StockItem[]>([]);
  //status
  const [status, setStatus] = useState<string>("");

  const { purchaseStockList, purchaseStockById, loading } = useAppSelector(
    (state) => state.purchaseStock
  );
  const { list, loading: pharmacyListLoading } = useAppSelector(
    (state) => state.pharmacyList
  );

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getPharmacistList());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPharmacyList());
  }, [dispatch]);

  // ✅ list ka type pharmacyData h (id + pharmacy_name)
  const options = list.map((p) => ({
    label: p.pharmacy_name ?? "-",
    value: p.id,
  }));

  // filtered records by search box + status filter
  useEffect(() => {
    let data: StockItem[] = purchaseStockList || [];

    // 🔍 Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();

      data = data.filter((item: StockItem) => {
        return Object.keys(item).some((key) => {
          const value = String(item[key as keyof StockItem] ?? "")
            .toLowerCase()
            .trim();
          return value.includes(lower);
        });
      });
    }

    // 🏥 Pharmacy filter
    if (selectedPharmacyId) {
      data = data.filter(
        (item) => Number(item.pharmacy_id) === selectedPharmacyId
      );
    }

    setFilteredData(data);
  }, [searchTerm, selectedPharmacyId, purchaseStockList]);

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
    setModalLoading(true);
    setTimeout(() => {
      setModalLoading(false);
    }, 5000);
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
                  <i className="bi bi-receipt"></i> Purchase Summary
                </div>

                <div className="col-md-6 col-12 text-end mb-2">
                  {/* <Button
                    variant="outline-primary"
                    className="btn-style1"
                    onClick={exportToExcel}
                  >
                    <i className="bi bi-file-earmark-text"></i> Generate Report
                  </Button> */}
                </div>
              </div>
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
                  <SelectInput
                    label="Pharmacy"
                    name="pharmacy_id"
                    value={selectedPharmacyId ?? ""}
                    options={options}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedPharmacyId(value ? Number(value) : null);
                    }}
                  />

                  {/* <div className="col-md-4 text-end">
                    <div className="txt_col">
                      <Link href={"/import"} className="btn-style2 me-2">
                        <i className="bi bi-upload"></i> Import
                      </Link>
                      <Link href={"/export"} className="btn-style2 me-2">
                        <i className="bi bi-download"></i> Export
                      </Link>
                    </div>
                  </div> */}
                </div>

                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        {/* <th style={{ width: "0px" }}></th> */}
                        <th className="fw-bold text-start">Pharmacy</th>
                        <th className="fw-bold text-start">Supplier</th>
                        <th className="fw-bold text-start">Purchase Date</th>
                        <th className="fw-bold text-start">Invoice Number</th>
                        <th className="fw-bold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <TableLoader colSpan={9} text="Loading records..." />
                      ) : (
                        <>
                          {filteredData
                            ?.slice() // copy array
                            .sort((a, b) => {
                              return (
                                new Date(b.purchase_date || "").getTime() -
                                new Date(a.purchase_date || "").getTime()
                              );
                            }) // LATEST FIRST
                            .slice(0, visibleCount) // visible limit
                            .map((p: StockItem) => {
                              return (
                                <tr key={p.id}>
                                  {/* <td></td> */}
                                  <td className="text-start">
                                    {p.pharmacy_name ?? ""}
                                  </td>
                                  <td className="text-start">
                                    {p.supplier_name ?? ""}
                                  </td>
                                  <td className="text-start">
                                    {formatDateOnly(p.purchase_date ?? "")}
                                  </td>
                                  <td className="text-start">
                                    {p.invoice_num ?? ""}
                                  </td>
                                  <td className="text-center">
                                    <button
                                      className="btn btn-light btn-sm"
                                      title="Purchase Details"
                                      onClick={() => handleHistory(p.id)}
                                    >
                                      <i className="bi bi-eye-fill"></i>
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
                      {!loading &&
                        !loadings &&
                        purchaseStockList.length === 0 && (
                          <tr>
                            <td
                              colSpan={9}
                              className="text-center py-2 text-muted fw-bold fs-6"
                            >
                              No records found
                            </td>
                          </tr>
                        )}

                      {!loading &&
                        !loadings &&
                        purchaseStockList.length > 0 &&
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
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-card-list me-2"></i> Purchase Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {modalLoading ? (
            <div className="py-5 text-center">
              <TncLoader size={50} text="Loading details..." />
            </div>
          ) : !purchaseStockById ? (
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
              <h6 className="mt-3 mb-2 fw-bold">Items Purchased</h6>

              <div className="table-responsive" style={{ maxHeight: "450px" }}>
                <table
                  className="table table-bordered table-sm"
                  style={{ whiteSpace: "nowrap", fontSize: "14px" }}
                >
                  <thead>
                    <tr>
                      <th style={{ minWidth: "100px" }}>Medicine</th>
                      <th style={{ minWidth: "90px" }}>Pack</th>
                      <th style={{ minWidth: "110px" }}>Batch</th>
                      <th style={{ minWidth: "110px" }}>Expiry</th>
                      <th style={{ minWidth: "70px" }}>Stock</th>
                      <th style={{ minWidth: "70px" }}>Qty</th>
                      <th className="text-end" style={{ minWidth: "90px" }}>
                        MRP
                      </th>
                      <th className="text-end" style={{ minWidth: "110px" }}>
                        Discount (%)
                      </th>
                      <th className="text-end" style={{ minWidth: "90px" }}>
                        Rate
                      </th>
                      <th className="text-end" style={{ minWidth: "110px" }}>
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {purchaseStockById.items?.map((item) => (
                      <tr key={item.id}>
                        <td>{item.medicine_name}</td>
                        <td>{item.pack_size}</td>
                        <td>{item.batch}</td>
                        <td>{formatDateOnly(item.expiry_date)}</td>
                        <td>{item.available_quantity}</td>
                        <td>{item.quantity}</td>
                        <td className="text-end">
                          {formatAmount(Number(item.mrp))}
                        </td>
                        <td className="text-end">{item.discount}</td>
                        <td className="text-end">
                          {formatAmount(Number(item.purchase_rate))}
                        </td>
                        <td className="text-end">
                          {formatAmount(Number(item.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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

                <div className="d-flex justify-content-between mb-2 text-danger">
                  <span className="fw-bold">Total Amount:</span>
                  <strong>
                    ₹
                    {formatAmount(
                      purchaseStockById.items?.reduce(
                        (sum: number, item) => sum + Number(item.amount),
                        0
                      )
                    )}
                  </strong>
                </div>

                {/* <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Discount:</span>
                  <strong>- ₹0</strong>
                </div> */}

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
                    {formatAmount(
                      purchaseStockById.items?.reduce(
                        (sum: number, item) => sum + Number(item.amount),
                        0
                      )
                    )}
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
