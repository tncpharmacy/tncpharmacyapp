"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchPharmacist,
  editPharmacist,
  togglePharmacistStatus,
} from "@/lib/features/pharmacistSlice/pharmacistSlice";
import type { Pharmacist, PharmaciesResponse } from "@/types/pharmacist";
import { useRouter } from "next/navigation";
import { formatDateTime, formatDateOnly } from "@/utils/dateFormatter";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import Link from "next/link";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import Input from "@/app/components/Input/Input";
import { fetchPharmacy } from "@/lib/features/pharmacySlice/pharmacySlice";
import toast from "react-hot-toast";
import { StockItem } from "@/types/stock";
import { getPharmacyStock } from "@/lib/features/purchaseStockSlice/purchaseStockSlice";
import { getUser } from "@/lib/auth/auth";

export default function StockList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userPharmacy = getUser();
  const pharmacy_id = Number(userPharmacy?.pharmacy_id) || 0;
  const pharmacist_id = userPharmacy?.id || 0;
  // const { list, loading } = useAppSelector((state) => state.pharmacist);
  const { items: stockData } = useAppSelector((state) => state.purchaseStock);

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

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getPharmacyStock(pharmacy_id));
  }, [dispatch]);

  console.log("stockData", stockData);
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
    setFilteredData(data);
  }, [searchTerm, stockData]);

  const loadMore = () => {
    if (loadings || visibleCount >= stockData.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return "-";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
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
            className="body_content"
          >
            <div className="pageTitle">
              <i className="bi bi-box"></i> Stock Summary
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-12">
                    <div className="txt_col">
                      <span className="lbl1">Search</span>
                      <input
                        type="text"
                        placeholder="Search..."
                        className="txt1 rounded"
                        value={searchTerm}
                        onChange={(e) => {
                          console.log("Search input:", e.target.value); // check karega kya aa raha hai
                          setSearchTerm(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* Table */}
                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead className="fw-bold text-dark">
                      <tr>
                        <th className="fw-bold text-start">Sr. No.</th>
                        <th className="fw-bold text-start">Medicine</th>
                        <th className="fw-bold text-start">Manufacturer</th>
                        <th className="fw-bold text-start">Pharmacy</th>
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

                          const toggleMedicine = () =>
                            setShowFullMedicine(!showFullMedicine);
                          const toggleManufacturer = () =>
                            setShowFullManufacturer(!showFullManufacturer);

                          return (
                            <tr key={index + 1}>
                              <td className="text-start">{index + 1}</td>
                              <td className="text-start">
                                {p.MedicineName.length > 20
                                  ? showFullMedicine
                                    ? p.MedicineName
                                    : truncateText(p.MedicineName, 20)
                                  : p.MedicineName}
                                {p.MedicineName.length > 20 && (
                                  <span
                                    style={{
                                      color: "blue",
                                      cursor: "pointer",
                                      marginLeft: 5,
                                    }}
                                    onClick={toggleMedicine}
                                  >
                                    {showFullMedicine ? "See Less" : "See More"}
                                  </span>
                                )}
                              </td>
                              <td className="text-start">
                                {p.Manufacturer.length > 20
                                  ? showFullManufacturer
                                    ? p.Manufacturer
                                    : truncateText(p.Manufacturer, 20)
                                  : p.Manufacturer}
                                {p.Manufacturer.length > 20 && (
                                  <span
                                    style={{
                                      color: "blue",
                                      cursor: "pointer",
                                      marginLeft: 5,
                                    }}
                                    onClick={toggleManufacturer}
                                  >
                                    {showFullManufacturer
                                      ? "See Less"
                                      : "See More"}
                                  </span>
                                )}
                              </td>
                              <td className="text-start">
                                {p.PharmacyName ?? "-"}
                              </td>
                              <td
                                className={`text-start ${
                                  isLowStock
                                    ? "text-danger fw-bold"
                                    : "text-success fw-bold"
                                }`}
                              >
                                {p.AvailableQty ?? "-"}
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
                        <img
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
