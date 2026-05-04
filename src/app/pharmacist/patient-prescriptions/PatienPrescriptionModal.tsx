"use client";

import { useEffect, useState } from "react";
import { Button, Image, Modal } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  deletePrescriptionPharmacistThunk,
  getPrescriptionListPharmacistThunk,
  receivePrescriptionThunk,
} from "@/lib/features/pharmacistPrescriptionSlice/pharmacistPrescriptionSlice";
import { PrescriptionItem } from "@/types/prescription";
import { getUser } from "@/lib/auth/auth";
import { useRouter } from "next/navigation";
import TncLoader from "@/app/components/TncLoader/TncLoader";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils/dateFormatter";

const prescriptionMediaBase = process.env.NEXT_PUBLIC_PRESCRIPTION_BASE_URL;

export default function PatientPrescriptionModal({
  onClose,
}: {
  onClose?: () => void;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { list, loadingList, receiveLoading, lastReceived } = useAppSelector(
    (state) => state.pharmacistPrescription
  );

  const pharmacist = getUser();
  const pharmacistId = pharmacist?.id;

  const [filteredData, setFilteredData] = useState<PrescriptionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 LOADERS
  const [pageLoading, setPageLoading] = useState(true); // component open
  const [previewLoading, setPreviewLoading] = useState(false); // modal preview
  const [actionLoading, setActionLoading] = useState(false);

  // modal
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<
    number | null
  >(null);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);
  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    dispatch(getPrescriptionListPharmacistThunk()).finally(() => {
      setPageLoading(false);
    });
  }, [dispatch]);

  /* ---------------- FILTER ---------------- */
  useEffect(() => {
    let data = list.filter(
      (item) => item.prescription_status.toString() === "1"
    );

    const pid = Number(pharmacistId);
    data = data.filter(
      (item) =>
        item.handle_by === null ||
        item.handle_by === 0 ||
        item.handle_by === pid
    );

    if (searchTerm) {
      data = data.filter((item) => {
        const name = (item.buyer_name ?? "").toLowerCase();
        const mobile = (item.buyer_number ?? "").toString();

        return (
          name.includes(searchTerm.toLowerCase()) || mobile.includes(searchTerm)
        );
      });
    }

    setFilteredData(
      [...data].sort(
        (a, b) =>
          new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
      )
    );
  }, [list, searchTerm, pharmacistId]);

  /* ---------------- PAGINATION ---------------- */

  const currentItems = filteredData.slice(0, visibleCount);

  /* ---------------- HANDLERS ---------------- */
  const handlePrescriptionView = (id: number) => {
    setSelectedPrescription(id);
    setPreviewLoading(true);
    setShowHistory(true);
  };

  const handleReceiveAndOCR = async (p: PrescriptionItem) => {
    try {
      setActionLoading(true);
      const res = await dispatch(
        receivePrescriptionThunk({
          prescriptionId: p.id,
          pharmacistId: Number(pharmacistId),
        })
      ).unwrap();

      if (onClose) onClose();

      const pic = res.data.prescription_pic;
      const full = pic.startsWith("/") ? `${prescriptionMediaBase}${pic}` : pic;

      router.push(
        `/pharmacist/ocr-extraction?id=${p.id}&buyerId=${
          res.data.buyer
        }&imageUrl=${encodeURIComponent(full)}`
      );
    } catch {
      toast.error("Failed to receive prescription");
      setActionLoading(false);
    }
  };

  const handleDeletePrescription = async (p: PrescriptionItem) => {
    try {
      setActionLoading(true);

      await dispatch(
        deletePrescriptionPharmacistThunk({
          prescriptionId: p.id,
        })
      ).unwrap();

      toast.success("Prescription deleted successfully");
    } catch {
      toast.error("Failed to delete prescription");
    } finally {
      setActionLoading(false);
    }
  };

  const loadMore = () => {
    if (loadings || visibleCount >= filteredData.length) return;

    setLoadings(true);

    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setLoadings(false);
    }, 300);
  };

  useEffect(() => {
    const container = document.querySelector(".modal-body");

    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 50
      ) {
        loadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, [filteredData, visibleCount]);

  useEffect(() => {
    setVisibleCount(10);
  }, [searchTerm, list]);
  /* ===================================================== */
  return (
    <>
      {/* ================= PAGE LOADER ================= */}
      {actionLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(3px)",
            zIndex: 10000,
          }}
        >
          <div className="text-center">
            <TncLoader />
          </div>
        </div>
      )}

      {pageLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(2px)",
            zIndex: 9999,
          }}
        >
          <div className="text-center">
            <TncLoader />
          </div>
        </div>
      )}
      <div className="modal-right">
        <div className="pageTitle">
          <i className="bi bi-receipt"></i> Prescription Summary
        </div>

        {/* ================= SEARCH ================= */}
        <div className="row mb-3">
          <div className="col-md-8">
            <div className="search_query header_search_query">
              <a className="query_search_btn" href="#">
                <i className="bi bi-search"></i>
              </a>
              <input
                type="text"
                className="form-control"
                placeholder="Search patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div
          className="scroll_table position-relative"
          style={{ minHeight: 400 }}
        >
          <table className="table cust_table1 mb-0">
            <thead>
              <tr>
                <th className="text-start fw-semibold">ID</th>
                <th className="text-start fw-semibold">Prescription</th>
                <th className="text-start fw-semibold">Patient</th>
                <th className="text-start fw-semibold">Mobile</th>
                <th className="text-start fw-semibold">Date</th>
                <th className="text-center fw-semibold">Action</th>
              </tr>
            </thead>

            {/* 🔥 TABLE INLINE LOADER */}
            {/* {loadingList && (
            <tbody>
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <TableLoader colSpan={6} />
                </td>
              </tr>
            </tbody>
          )} */}

            {!loadingList && (
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No data found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((p) => {
                    const fileUrl = p.prescription_pic.startsWith("http")
                      ? p.prescription_pic
                      : `${prescriptionMediaBase}${p.prescription_pic}`;
                    const ext = fileUrl.split(".").pop()?.toLowerCase();
                    const isHandledByMe = p.handle_by === Number(pharmacistId);
                    const isReceived =
                      p.handle_by !== null && p.handle_by !== 0;

                    return (
                      <tr key={p.id}>
                        <td className="text-start">{p.id}</td>
                        <td className="text-start">
                          {ext === "pdf" ? (
                            <i
                              className="bi bi-file-earmark-pdf text-danger"
                              style={{ fontSize: 22, cursor: "pointer" }}
                              onClick={() => handlePrescriptionView(p.id)}
                            />
                          ) : (
                            <Image
                              src={fileUrl}
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                                cursor: "pointer",
                              }}
                              onClick={() => handlePrescriptionView(p.id)}
                            />
                          )}
                        </td>
                        <td className="text-start">{p.buyer_name}</td>
                        <td className="text-start">{p.buyer_number}</td>
                        <td className="text-start">
                          {formatDate(p.created_on)}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant={
                              isHandledByMe
                                ? "warning"
                                : isReceived
                                ? "secondary"
                                : "danger"
                            }
                            disabled={
                              receiveLoading && lastReceived?.id === p.id
                            }
                            onClick={() => handleReceiveAndOCR(p)}
                          >
                            {receiveLoading && lastReceived?.id === p.id
                              ? "Processing..."
                              : isHandledByMe
                              ? "Continue Scan"
                              : "Receive & Scan"}
                          </Button>{" "}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="delete-btn"
                            onClick={() => handleDeletePrescription(p)}
                          >
                            <i className="bi bi-trash delete-icon"></i>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* ================= PREVIEW MODAL ================= */}
        <Modal
          show={showHistory}
          onHide={() => setShowHistory(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Prescription Preview</Modal.Title>
          </Modal.Header>

          <Modal.Body className="position-relative">
            {/* 🔥 MODAL LOADER */}
            {previewLoading && (
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-ps-center"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(2px)",
                  zIndex: 20,
                }}
              >
                <TncLoader />
              </div>
            )}

            {selectedPrescription &&
              list
                .filter((p) => p.id === selectedPrescription)
                .map((p) => {
                  const fileUrl = p.prescription_pic.startsWith("http")
                    ? p.prescription_pic
                    : `${prescriptionMediaBase}${p.prescription_pic}`;
                  const ext = fileUrl.split(".").pop()?.toLowerCase();

                  return ext === "pdf" ? (
                    <iframe
                      key={p.id}
                      src={fileUrl}
                      width="100%"
                      height="500"
                      onLoad={() => setPreviewLoading(false)}
                    />
                  ) : (
                    <Image
                      key={p.id}
                      src={fileUrl}
                      fluid
                      onLoad={() => setPreviewLoading(false)}
                      onError={() => setPreviewLoading(false)}
                    />
                  );
                })}
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}
