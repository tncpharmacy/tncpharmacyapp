"use client";

import { useEffect, useState } from "react";
import { Button, Image, Modal } from "react-bootstrap";
import "../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import type { Pharmacist } from "@/types/pharmacist";
import { useRouter } from "next/navigation";
import { formatDateTime, formatDateOnly } from "@/utils/dateFormatter";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import { StockItem } from "@/types/stock";
import { getPharmacyStock } from "@/lib/features/purchaseStockSlice/purchaseStockSlice";
import { getUser } from "@/lib/auth/auth";
import { Archive, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import MinimumStockModal from "@/app/components/MinimumStockModal/MinimumStockModal";

type FilterType = "All" | "LowStock" | "AvailableStock";
type StockItemKey = keyof StockItem;

const getButtonStyles = (
  variant: "primary" | "success" | "danger",
  isActive: boolean
): { className: string; style: React.CSSProperties } => {
  // Minimal Tailwind classes for layout/typography/transition (inline CSS se mushkil)
  const baseClassName =
    "flex items-center space-x-2 px-3 py-2 m-1 text-sm md:text-base font-semibold transition duration-300 ease-in-out transform rounded-lg focus:outline-none";

  let backgroundColor = "";
  let activeRingColor = "";

  switch (variant) {
    case "primary": // All Stock List (Blue)
      backgroundColor = "#3B82F6"; // Blue
      activeRingColor = "rgba(59, 130, 246, 0.7)"; // Blue ring
      break;
    case "success": // Available Stock List (Green)
      backgroundColor = "#10B981"; // Green
      activeRingColor = "rgba(16, 185, 129, 0.7)"; // Green ring
      break;
    case "danger": // Minimum Stock List (Red)
      backgroundColor = "#EF4444"; // Red
      activeRingColor = "rgba(239, 68, 68, 0.7)"; // Red ring
      break;
    default:
      break;
  }

  // Pure inline CSS for color, shadows, and active state
  const style: React.CSSProperties = {
    backgroundColor: backgroundColor,
    color: "white",
    // Inline box shadow for professional look
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    // Active state ring/outline using inline CSS
    outline: isActive ? `3px solid ${activeRingColor}` : "none",
    outlineOffset: "2px",
    opacity: isActive ? 1 : 0.9,
    // Agar hover color support karna hota to external CSS use karna padta,
    // lekin user ki request inline CSS ki hai.
  };

  return { className: baseClassName, style };
};

export default function StockList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userPharmacy = getUser();
  const pharmacy_id = Number(userPharmacy?.pharmacy_id) || 0;
  const pharmacist_id = userPharmacy?.id || 0;
  // const { list, loading } = useAppSelector((state) => state.pharmacist);
  const { items: stockData } = useAppSelector((state) => state.purchaseStock);

  // --- NEW STATE FOR FILTERING ---
  const [filterType, setFilterType] = useState<FilterType>("All");

  const [showFullMedicine, setShowFullMedicine] = useState(false);
  const [showFullManufacturer, setShowFullManufacturer] = useState(false);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacist | null>(
    null
  );
  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<StockItem[]>([]);
  //status
  const [status, setStatus] = useState<string>("");

  const [showMinimumModal, setShowMinimumModal] = useState(false);
  const suppliers = [{ id: 1, name: "Ganga Pharmacy" }];

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getPharmacyStock(pharmacy_id));
  }, [dispatch, pharmacy_id]);

  // Helper function to check Low Stock status
  const isItemLowStock = (item: StockItem): boolean => {
    const available = Number(item.AvailableQty);
    const minimum = Number(item.MinStockLevel);
    if (isNaN(available) || isNaN(minimum)) return false;
    return available <= minimum;
  };

  // filtered records by search box + status filter
  useEffect(() => {
    let data: StockItem[] = stockData || [];
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

    let finalData = data;
    if (filterType === "LowStock") {
      finalData = data.filter(isItemLowStock);
    } else if (filterType === "AvailableStock") {
      finalData = data.filter((item) => !isItemLowStock(item));
    }
    setFilteredData(finalData);
    setVisibleCount(10);
  }, [searchTerm, stockData, filterType]);

  const lowStockCount = stockData.filter(isItemLowStock).length;
  const availableStockCount = stockData.length - lowStockCount;

  const loadMore = () => {
    if (loadings || visibleCount >= stockData.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  // Function to handle filter selection
  const handleFilterSelect = (key: FilterType) => {
    setFilterType(key);
  };

  // Get styles for each button
  const allStyles = getButtonStyles("primary", filterType === "All");
  // const truncateText = (text: string, maxLength: number): string => {
  //   if (!text) return "-";
  //   if (text.length <= maxLength) return text;
  //   return text.slice(0, maxLength) + "...";
  // };
  // const availableStyles = getButtonStyles(
  //   "success",
  //   filterType === "AvailableStock"
  // );
  const minimumStyles = getButtonStyles("danger", filterType === "LowStock");
  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <InfiniteScroll
            loadMore={loadMore}
            hasMore={visibleCount < filteredData.length}
            className="body_content"
          >
            <div className="pageTitle">
              <i className="bi bi-box"></i> Stock Summary
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
                        className="txt1 rounded"
                        value={searchTerm}
                        onChange={(e) => {
                          console.log("Search input:", e.target.value);
                          setSearchTerm(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  {/* ✅ Replaced Dropdown with Three Professional Buttons, applying inline styles */}
                  <div
                    className="col-md-6 text-end"
                    style={{ marginTop: "20px" }}
                  >
                    {/* 1. All Stock List - Primary (Blue) */}
                    {/* 🔙 Back button – hidden until Minimum Stock is active */}
                    {filterType === "LowStock" && (
                      <button
                        className="btn-style2 me-2"
                        style={allStyles.style}
                        onClick={() => handleFilterSelect("All")}
                      >
                        <i className="bi bi-arrow-left"></i> Back
                      </button>
                    )}
                    <button
                      className="btn"
                      style={{
                        ...minimumStyles.style,
                        backgroundColor:
                          lowStockCount === 0 ? "transparent" : "#EF4444",
                        color: lowStockCount === 0 ? "#EF4444" : "white",
                        border: "2px solid #EF4444",
                        fontWeight: "bold",
                      }}
                      disabled={lowStockCount === 0} // optional: agar 0 ho to disable bhi kar skta h
                      onClick={() => {
                        if (lowStockCount > 0) setShowMinimumModal(true);
                      }}
                    >
                      <AlertTriangle size={18} style={{ marginRight: "5px" }} />
                      <span>Minimum Stock ({lowStockCount})</span>
                    </button>

                    <MinimumStockModal
                      show={showMinimumModal}
                      onHide={() => setShowMinimumModal(false)}
                      data={filteredData
                        .filter(
                          (x) =>
                            Number(x.AvailableQty) <= Number(x.MinStockLevel)
                        )
                        .map((x) => ({
                          ...x,
                          AvailableQty: Number(x.AvailableQty),
                          MinStockLevel: Number(x.MinStockLevel),
                          location: x.location,
                        }))}
                      suppliers={suppliers}
                    />
                  </div>
                </div>
                {/* Table */}
                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead className="fw-bold text-dark">
                      <tr>
                        <th
                          className="fw-bold text-start"
                          style={{ paddingLeft: "20px" }}
                        >
                          Medicine
                        </th>
                        <th className="fw-bold text-start">Manufacturer</th>
                        <th className="fw-bold text-start">Stock</th>
                        <th className="fw-bold text-start">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData
                        .slice(0, visibleCount)
                        .map((p: StockItem, index) => {
                          const isLowStock =
                            Number(p.AvailableQty) <= Number(p.MinStockLevel);
                          return (
                            <tr key={index + 1}>
                              <td
                                className="text-start"
                                style={{ paddingLeft: "20px" }}
                              >
                                {p.MedicineName ?? ""}
                              </td>
                              <td className="text-start">
                                {p.Manufacturer ?? ""}
                              </td>
                              <td
                                className={`text-start ${
                                  isLowStock
                                    ? "text-danger fw-bold"
                                    : "text-success fw-bold"
                                }`}
                              >
                                <span
                                  style={{
                                    border: `2px solid ${
                                      isLowStock ? "red" : "green"
                                    }`,
                                    borderRadius: "35px",
                                    padding: "4px 8px",
                                    backgroundColor: isLowStock
                                      ? "red"
                                      : "green",
                                    color: "white",
                                    fontWeight: "bold",
                                    display: "inline-block",
                                  }}
                                >
                                  {p.AvailableQty ?? "-"}
                                </span>
                              </td>
                              <td className="text-start">
                                {p.location ?? "N/A"}
                              </td>
                            </tr>
                          );
                        })}

                      {/* Spinner row */}
                      {loadings && (
                        <TableLoader colSpan={9} text="Loading more..." />
                      )}

                      {/* No more records */}
                      {!loadings && visibleCount >= stockData.length && (
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

      {/* View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pharmacy Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPharmacy ? (
            (() => {
              const { date: createdDate, time: createdTime } = formatDateTime(
                selectedPharmacy?.created_on
              );
              const { date: updatedDate, time: updatedTime } = formatDateTime(
                selectedPharmacy?.updated_on
              );

              return (
                <div>
                  <p>
                    <strong>Pharmacy Id:</strong> {selectedPharmacy.pharmacy_id}
                  </p>
                  {/* <p>
                    <strong>Pharmacy Name:</strong>{" "}
                    {selectedPharmacy.user_name ?? "-"}
                  </p> */}
                  <p>
                    <strong>Contact Person:</strong>{" "}
                    {selectedPharmacy.user_name ?? "-"}
                  </p>
                  <p>
                    <strong>Gender:</strong> {selectedPharmacy.gender}
                  </p>
                  <p>
                    <strong>License No.:</strong>{" "}
                    {selectedPharmacy.license_number}
                  </p>
                  <p>
                    <strong>License Validity:</strong>{" "}
                    {formatDateOnly(selectedPharmacy.license_valid_upto)}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedPharmacy.email_id}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selectedPharmacy.login_id ?? "-"}
                  </p>
                  <p>
                    <strong>Aadhar Number:</strong>{" "}
                    {selectedPharmacy.aadhar_number}
                  </p>
                  <p>
                    <strong>Created On:</strong> {createdDate} at {createdTime}
                  </p>
                  <p>
                    <strong>Updated On:</strong> {updatedDate} at {updatedTime}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedPharmacy.status}
                  </p>
                  <hr />
                  <h5>Documents:</h5>
                  <div
                    style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
                  >
                    {selectedPharmacy.documents &&
                    selectedPharmacy.documents.length > 0 ? (
                      selectedPharmacy.documents.map((doc) => (
                        <Image
                          key={doc.id}
                          src={`http://68.183.174.17:8081${doc.document}`}
                          alt="Pharmacy Document"
                          style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                          }}
                        />
                      ))
                    ) : (
                      <p>No documents uploaded.</p>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <p>No details found.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
