"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../css/admin-style.css";
import SideNav from "../components/SideNav/page";
import Header from "../components/Header/page";
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

export default function Pharmacist() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list, loading } = useAppSelector((state) => state.pharmacist);
  const { list: pharmacyData } = useAppSelector((state) => state.pharmacy);

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
  const [filteredData, setFilteredData] = useState<Pharmacist[]>([]);
  //status
  const [status, setStatus] = useState<string>("");

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(fetchPharmacist());
    dispatch(fetchPharmacy());
  }, [dispatch]);

  // filtered records by search box + status filter
  useEffect(() => {
    let data: Pharmacist[] = list || [];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();

      data = data.filter((item: Pharmacist) => {
        return Object.keys(item).some((key) => {
          const value = String(item[key as keyof Pharmacist] ?? "")
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

    if (status) {
      data = data.filter((item: Pharmacist) => item.status === status);
    }

    setFilteredData(data);
  }, [searchTerm, status, list]);

  const handleToggleStatus = async (id: number) => {
    // Find category in the filteredData (latest UI state)
    const toggleRecords = filteredData.find((c) => c.id === id);
    if (!toggleRecords) return;

    const newStatus = toggleRecords.status === "Active" ? "Inactive" : "Active";

    try {
      // Optimistic UI update
      setFilteredData((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );

      // Update backend
      await dispatch(
        editPharmacist({
          id,
          data: {
            pharmacy_id: toggleRecords.pharmacy_id,
            user_name: toggleRecords.user_name,
            email_id: toggleRecords.email_id,
            gender: toggleRecords.gender,
            login_id: toggleRecords.login_id,
            date_of_birth: toggleRecords.date_of_birth,
            aadhar_number: toggleRecords.aadhar_number,
            license_number: toggleRecords.license_number,
            license_valid_upto: toggleRecords.license_valid_upto,
            status: newStatus,
          },
        })
      ).unwrap();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");

      // Revert UI if backend fails
      setFilteredData((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: toggleRecords.status } : c
        )
      );
    }
  };

  //infinte scroll records
  const loadMore = () => {
    if (loadings || visibleCount >= list.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  const handleView = (pharmacist: Pharmacist) => {
    setSelectedPharmacy(pharmacist);
    setShowModal(true);
  };

  const handleEdit = (id: number) => {
    const encodedId = encodeURIComponent(btoa(String(id)));
    router.push(`/update-pharmacist/${encodedId}`);
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
              <i className="bi bi-shop-window"></i> Pharmacist List
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-4">
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
                  <Input
                    label="Status"
                    name="status"
                    type="select"
                    value={status}
                    options={[
                      { label: "Active", value: "Active" },
                      { label: "Inactive", value: "Inactive" },
                    ]}
                    onChange={(event) => setStatus(event.target.value)}
                  />
                  <div className="col-md-4 text-end">
                    <div className="txt_col">
                      <Link
                        href={"/add-pharmacist"}
                        className="btn-style2 me-2"
                      >
                        <i className="bi bi-plus"></i> Add Pharmacist
                      </Link>
                      <button className="btn-style1">
                        <i className="bi bi-download"></i> Export Statement
                      </button>
                    </div>
                  </div>
                </div>
                {/* Table */}
                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead className="fw-bold text-dark">
                      <tr>
                        <th className="fw-bold">Sr. No.</th>
                        <th className="fw-bold">Pharmacy Name</th>
                        <th className="fw-bold">Contact Person</th>
                        <th className="fw-bold">Email ID</th>
                        <th className="fw-bold">Mobile</th>
                        <th className="fw-bold">Gender</th>
                        <th className="fw-bold">Date Of Birth</th>
                        <th className="fw-bold">Aadhar Number</th>
                        <th className="fw-bold">License No.</th>
                        <th className="fw-bold">License Validity</th>
                        <th className="fw-bold">Status</th>
                        <th className="fw-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData
                        .slice(0, visibleCount)
                        .map((p: Pharmacist, index) => {
                          const pharmacy = pharmacyData.find(
                            (ph) => ph.id === p.pharmacy_id
                          );
                          return (
                            <tr key={p.id}>
                              <td>{index + 1}</td>
                              <td>{pharmacy ? pharmacy.pharmacy_name : "-"}</td>
                              <td>{p.user_name ?? "-"}</td>
                              <td>{p.email_id ?? "-"}</td>
                              <td>{p.login_id ?? "-"}</td>
                              <td>{p.gender ?? "-"}</td>
                              <td>{p.date_of_birth ?? "-"}</td>
                              <td>{p.aadhar_number ?? "-"}</td>
                              <td>{p.license_number ?? "-"}</td>
                              <td>{p.license_valid_upto ?? "-"}</td>
                              <td>
                                <span
                                  onClick={() => handleToggleStatus(p.id)}
                                  className={`status ${
                                    p.status === "Active"
                                      ? "status-active"
                                      : "status-inactive"
                                  } cursor-pointer`}
                                  title="Click to change status"
                                >
                                  {p.status === "Active"
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-light btn-sm me-2"
                                  onClick={() => handleEdit(p.id)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-light btn-sm"
                                  onClick={() => handleView(p)}
                                >
                                  <i className="bi bi-eye-fill"></i>
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
                      {!loadings && visibleCount >= list.length && (
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
