"use client";

import { useEffect, useState } from "react";
import { Button, Image, Modal } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getPrescriptionListPharmacistThunk,
  receivePrescriptionThunk,
} from "@/lib/features/pharmacistPrescriptionSlice/pharmacistPrescriptionSlice";
import { PrescriptionItem } from "@/types/prescription";
import { getUser } from "@/lib/auth/auth";
import { createWorker } from "tesseract.js";
import { useRouter } from "next/navigation";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function PatientPrescriptionModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list, loadingList, receiveLoading, lastReceived } = useAppSelector(
    (state) => state.pharmacistPrescription
  );

  const pharmacist = getUser();
  const pharmacistId = pharmacist?.id;
  const [filteredData, setFilteredData] = useState<PrescriptionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<
    number | null
  >(null);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(getPrescriptionListPharmacistThunk());
  }, [dispatch]);

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

  // filter logic
  useEffect(() => {
    let data = list;
    if (searchTerm) {
      data = data.filter((item) =>
        (item.buyer_name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (status !== "all") {
      data = data.filter(
        (item) => item.prescription_status.toString() === status
      );
    }
    setFilteredData(
      [...data].sort(
        (a, b) =>
          new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
      )
    );
    setCurrentPage(1);
  }, [list, searchTerm, status]);

  // pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // PatientPrescriptionModal.tsx (existing handleReceive ko isse replace kar de)

  // PatientPrescriptionModal.tsx ke handleReceiveAndOCR function mein

  const handleReceiveAndOCR = async (prescription: PrescriptionItem) => {
    const originalPath = prescription.prescription_pic;

    // Clean path from the backend
    const mediaPath = originalPath.replace(/^\/+/, ""); // remove starting "/"

    const realURL = `${mediaBase}/${mediaPath}`;

    // Environment-aware URL
    const finalFileUrl =
      process.env.NODE_ENV === "development"
        ? `/api/proxy?url=${encodeURIComponent(realURL)}`
        : realURL;

    console.log("✅ FINAL PDF URL =", finalFileUrl);

    try {
      await dispatch(
        receivePrescriptionThunk({
          prescriptionId: prescription.id,
          pharmacistId: Number(pharmacistId),
        })
      ).unwrap();

      router.push(
        `/pharmacist/ocr-extraction?id=${
          prescription.id
        }&imageUrl=${encodeURIComponent(finalFileUrl)}&buyerName=${
          prescription.buyer_name
        }&buyerMobile=${prescription.buyer_number}&buyerId=${
          prescription.buyer
        }`
      );
    } catch (error) {
      console.error("Receive/Navigation Failed:", error);
      alert("Failed to receive prescription or initiate process.");
    }
  };

  return (
    <>
      <div className="pageTitle mb-2">
        <i className="bi bi-receipt"></i> Patient Prescription Summary
      </div>

      <div className="row mb-3">
        <div className="col-md-8">
          <div className="search_query">
            <a className="query_search_btn" href="#">
              <i className="bi bi-search"></i>
            </a>
            <input
              type="text"
              className="txt1 rounded"
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

      <div className="scroll_table" style={{ minHeight: "400px" }}>
        <table className="table cust_table1" style={{ marginBottom: "0" }}>
          <thead>
            <tr>
              <th style={{ width: "0px" }}></th>
              <th className="fw-bold text-start">Prescription ID</th>
              <th className="fw-bold text-start">Prescription Image</th>
              <th className="fw-bold text-start">Patient Name</th>
              <th className="fw-bold text-start">Mobile</th>
              <th className="fw-bold text-start">Email</th>
              <th className="fw-bold text-start">Prescription Date</th>
              <th className="fw-bold text-start">Action</th>
            </tr>
          </thead>
          <tbody>
            {loadingList ? (
              <tr>
                <td colSpan={8} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  No data found
                </td>
              </tr>
            ) : (
              currentItems.map((p) => (
                <tr key={p.id}>
                  <td></td>
                  <td className="text-start">{p.id}</td>
                  <td className="text-start">
                    {(() => {
                      const fileUrl = `${mediaBase}${p.prescription_pic}`;
                      const ext = fileUrl.split(".").pop()?.toLowerCase();
                      return ext === "pdf" ? (
                        <i
                          className="bi bi-file-earmark-pdf"
                          style={{
                            fontSize: "2rem",
                            color: "red",
                            cursor: "pointer",
                          }}
                          onClick={() => handlePrescriptionView(p.id)}
                        ></i>
                      ) : (
                        <Image
                          src={fileUrl}
                          alt="Prescription"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                          onClick={() => handlePrescriptionView(p.id)}
                        />
                      );
                    })()}
                  </td>
                  <td className="text-start">{p.buyer_name}</td>
                  <td className="text-start">{p.buyer_number}</td>
                  <td className="text-start">{p.buyer_email}</td>
                  <td className="text-start">
                    {new Date(p.created_on).toLocaleDateString()}
                  </td>
                  <td className="text-start">
                    {/* <Button
                      variant={p.handle_by !== 1 ? "success" : "secondary"}
                      size="sm"
                      onClick={() => handleReceive(p.id)}
                      disabled={receiveLoading && lastReceived?.id === p.id}
                    >
                      {receiveLoading && lastReceived?.id === p.id
                        ? "Receiving..."
                        : p.handle_by !== 1
                        ? "Receive"
                        : "Received"}
                    </Button> */}
                    <Button
                      variant={p.handle_by !== 1 ? "success" : "secondary"}
                      size="sm"
                      // Yahan change karein: Poora item pass karein
                      onClick={() => handleReceiveAndOCR(p)}
                      // disabled={
                      //   (receiveLoading && lastReceived?.id === p.id) ||
                      //   p.handle_by === 1
                      // }
                    >
                      Receive & Scan
                      {/* {receiveLoading && lastReceived?.id === p.id
                        ? "Processing..."
                        : p.handle_by !== 1
                        ? "Receive & Scan" // Button text change kar diya
                        : "Received"} */}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* pagination controls */}
      {filteredData.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Showing {startIndex + 1} -{" "}
            {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length}
          </div>
          <div className="pagination-controls">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            <span className="mx-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Nested Modal for preview */}
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
          {selectedPrescription &&
            list
              .filter((p) => p.id === selectedPrescription)
              .map((p) => {
                const fileUrl = `${mediaBase}${p.prescription_pic}`;
                const ext = fileUrl.split(".").pop()?.toLowerCase();
                return (
                  <div key={p.id}>
                    <p>
                      <b>Patient Name:</b> {p.buyer_name}
                    </p>
                    <p>
                      <b>Mobile:</b> {p.buyer_number}
                    </p>
                    <p>
                      <b>Status:</b>{" "}
                      {p.prescription_status === "1" ? "Active" : "Received"}
                    </p>
                    <div className="text-center">
                      {ext === "pdf" ? (
                        <iframe
                          src={fileUrl}
                          width="100%"
                          height="500"
                          style={{ border: "none" }}
                        />
                      ) : (
                        <Image
                          src={fileUrl}
                          alt="Preview"
                          style={{
                            width: "100%",
                            maxHeight: "500px",
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="mt-3"
                      onClick={() => window.open(fileUrl, "_blank")}
                    >
                      <i className="bi bi-download"></i> Download File
                    </Button>
                  </div>
                );
              })}
        </Modal.Body>
      </Modal>
    </>
  );
}
