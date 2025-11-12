"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Image, Modal } from "react-bootstrap";
import "../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useRouter } from "next/navigation";
import Input from "@/app/components/Input/Input";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getPrescriptionListPharmacistThunk,
  receivePrescriptionThunk,
} from "@/lib/features/pharmacistPrescriptionSlice/pharmacistPrescriptionSlice";
import InfiniteScroll from "@/app/components/InfiniteScrollS/InfiniteScrollS";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import { PrescriptionItem } from "@/types/prescription";
import { getUser } from "@/lib/auth/auth";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function Demo() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<
    number | null
  >(null);

  const { list, loadingList, receiveLoading, lastReceived } = useAppSelector(
    (state) => state.pharmacistPrescription
  );
  const pharmacist = getUser();
  const pharmacistId = pharmacist?.id;

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);
  // filtered records by search box
  const [filteredData, setFilteredData] = useState<PrescriptionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  //status
  const [status, setStatus] = useState<string>("all");

  // Fetch prescriptions on mount
  useEffect(() => {
    dispatch(getPrescriptionListPharmacistThunk());
  }, [dispatch]);

  // Receive prescription handler
  const handleReceive = (id: number) => {
    dispatch(
      receivePrescriptionThunk({
        prescriptionId: id,
        pharmacistId: Number(pharmacistId),
      })
    );
  };

  const handlePrescriptionView = (id: number) => {
    setSelectedPrescription(id);
    setShowHistory(true);
  };

  // 🧠 Master filter logic
  useEffect(() => {
    let data = list;
    // Search filter
    if (searchTerm) {
      data = data.filter((item) =>
        (item.buyer_name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Status filter
    if (status !== "all") {
      data = data.filter(
        (item) => item.prescription_status.toString() === status
      );
    }
    setFilteredData(data);
  }, [list, searchTerm, status]);

  // ✅ only length (primitive)
  const loadMore = () => {
    if (loadings || visibleCount >= list.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 1500); // spinner for 3 sec
  };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <InfiniteScroll
            loadMore={loadMore}
            hasMore={visibleCount < list.length}
          >
            <div className="pageTitle mt-2">
              <i className="bi bi-receipt"></i> Patient Prescription Summary
            </div>

            <div className="main_content">
              <div className="col-sm-12">
                <div className="row mb-3">
                  <div className="col-md-8">
                    <div className="search_query">
                      <a className="query_search_btn" href="#">
                        <i className="bi bi-search"></i>
                      </a>
                      <input
                        type="text"
                        className="txt1 rounded" // Bootstrap
                        // className="border px-3 py-2 w-full rounded-md" // Tailwind
                        placeholder="Search patient name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <div className="txt_col">
                      <span className="lbl1">Status</span>
                      <select
                        className="txt1"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                      >
                        <option value="all">-Select-</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        <th style={{ width: "0px" }}></th>
                        <th className="fw-bold text-start">
                          Prescription Image
                        </th>
                        <th className="fw-bold text-start">Patient Name</th>
                        <th className="fw-bold text-start">Mobile</th>
                        <th className="fw-bold text-start">Email</th>
                        <th className="fw-bold text-start">
                          Prescription Date
                        </th>
                        <th className="fw-bold text-start">Status</th>
                        <th className="fw-bold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingList ? (
                        <tr>
                          <td colSpan={5} className="text-center">
                            Loading...
                          </td>
                        </tr>
                      ) : list.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center">
                            No prescriptions found
                          </td>
                        </tr>
                      ) : (
                        [...filteredData] // safe copy
                          .sort(
                            (a, b) =>
                              new Date(b.created_on).getTime() -
                              new Date(a.created_on).getTime()
                          ) // sort descending by created_on
                          .slice(0, visibleCount)
                          .map((prescription) => (
                            <tr key={prescription.id}>
                              <td></td>
                              <td className="text-start">
                                {(() => {
                                  const fileUrl = `${mediaBase}${prescription.prescription_pic}`;
                                  const fileExt = fileUrl
                                    .split(".")
                                    .pop()
                                    ?.toLowerCase();

                                  return fileExt === "pdf" ? (
                                    <div
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        border: "1px solid #ddd",
                                        borderRadius: "5px",
                                        background: "#f8f9fa",
                                      }}
                                    >
                                      <i
                                        className="bi bi-file-earmark-pdf"
                                        style={{
                                          fontSize: "1.8rem",
                                          color: "red",
                                          cursor: "pointer",
                                        }}
                                        onClick={() =>
                                          handlePrescriptionView(
                                            prescription.id
                                          )
                                        }
                                      ></i>
                                    </div>
                                  ) : (
                                    <Image
                                      src={fileUrl}
                                      alt="Prescription"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  );
                                })()}
                              </td>
                              <td className="text-start">
                                {prescription.buyer_name}
                              </td>
                              <td className="text-start">
                                {prescription.buyer_number}
                              </td>
                              <td className="text-start">
                                {prescription.buyer_email}
                              </td>
                              <td className="text-start">
                                {new Date(
                                  prescription.created_on
                                ).toLocaleDateString()}
                              </td>
                              <td className="text-start">
                                {prescription.prescription_status === "1"
                                  ? "Active"
                                  : "Received"}
                              </td>
                              <td className="text-center">
                                {prescription.handle_by !== 1 ? (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() =>
                                      handleReceive(prescription.id)
                                    }
                                    disabled={
                                      receiveLoading &&
                                      lastReceived?.id === prescription.id
                                    }
                                  >
                                    {receiveLoading &&
                                    lastReceived?.id === prescription.id
                                      ? "Receiving..."
                                      : "Receive"}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled
                                  >
                                    Received
                                  </Button>
                                )}

                                <Button
                                  variant="info"
                                  size="sm"
                                  className="ms-2"
                                  onClick={() =>
                                    handlePrescriptionView(prescription.id)
                                  }
                                >
                                  <i className="bi bi-card-list"></i> Details
                                </Button>
                              </td>
                            </tr>
                          ))
                      )}

                      {loadings && (
                        <TableLoader colSpan={9} text="Loading more..." />
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </InfiniteScroll>
        </div>
      </div>

      {/* Prescription Details Modal */}
      <Modal
        show={showHistory}
        onHide={() => setShowHistory(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-card-list"></i> Prescription Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedPrescription ? (
            <div>
              {list
                .filter((p) => p.id === selectedPrescription)
                .map((p) => {
                  const fileUrl = `${mediaBase}${p.prescription_pic}`;
                  const fileExt = fileUrl.split(".").pop()?.toLowerCase();

                  return (
                    <div key={p.id}>
                      <p>
                        <strong>Patient Name:</strong> {p.buyer_name}
                      </p>
                      <p>
                        <strong>Mobile:</strong> {p.buyer_number}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {p.prescription_status === "1" ? "Active" : "Received"}
                      </p>
                      <p>
                        <strong>Created On:</strong>{" "}
                        {new Date(p.created_on).toLocaleString()}
                      </p>

                      <div
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "10px",
                          textAlign: "center",
                        }}
                      >
                        {/* ✅ Preview Section */}
                        {fileExt === "pdf" ? (
                          <iframe
                            src={fileUrl}
                            width="100%"
                            height="500px"
                            style={{ border: "none", borderRadius: "8px" }}
                          />
                        ) : (
                          <Image
                            src={fileUrl}
                            alt="Prescription Preview"
                            style={{
                              width: "100%",
                              maxHeight: "500px",
                              objectFit: "contain",
                              borderRadius: "8px",
                            }}
                          />
                        )}

                        {/* ✅ Download Button */}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="mt-3"
                          onClick={() => window.open(fileUrl, "_blank")}
                        >
                          <i className="bi bi-download"></i> Download File
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p>No details available</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistory(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
