"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { formatDateTime, formatDateOnly } from "@/utils/dateFormatter";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import Link from "next/link";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import Input from "@/app/components/Input/Input";
import toast from "react-hot-toast";
import SelectInput from "@/app/components/Input/SelectInput";
import { getCategoriesList } from "@/lib/features/categorySlice/categorySlice";
import { Category } from "@/types/category";
import { Medicine } from "@/types/medicine";
import {
  getMedicinesList,
  getMenuMedicinesList,
} from "@/lib/features/medicineSlice/medicineSlice";
import { encodeId } from "@/lib/utils/encodeDecode";

export default function OtherMedicineList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list: getCategoryList } = useAppSelector((state) => state.category);
  const { medicines: medicineList } = useAppSelector((state) => state.medicine);
  // filter directly
  const filteredMedicines = useMemo(() => {
    return medicineList?.filter((item) => item.category_id !== 1) || [];
  }, [medicineList]);

  // 🆕 Category filter state
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );

  // filtered records by search box
  const [filteredData, setFilteredData] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  //status
  const [status, setStatus] = useState<string>("all");

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getMedicinesList());
    dispatch(getCategoriesList());
  }, [dispatch]);

  const categoryOptions = (getCategoryList || [])
    .filter((c) => c.category_name !== "Medicines")
    .map((c: Category) => ({
      label: c.category_name,
      value: c.id,
    }));

  // filtered records by search box + status filter
  // 🧠 Master filter logic
  useEffect(() => {
    let data = filteredMedicines;

    // Category filter
    if (selectedCategoryId) {
      data = data.filter((item) => item.category_id === selectedCategoryId);
    }

    // Search filter
    if (searchTerm) {
      data = data.filter((item) =>
        item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (status !== "all") {
      data = data.filter((item) => item.status === status);
    }

    setFilteredData(data);
  }, [filteredMedicines, selectedCategoryId, searchTerm, status]);

  // ✅ only length (primitive)
  const loadMore = () => {
    if (loadings || visibleCount >= filteredMedicines.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 1500); // spinner for 3 sec
  };

  const handleView = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowModal(true);
  };
  const handleEdit = (id: number) => {
    router.push(`/update-other-product/${encodeId(id)}`);
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
              <i className="bi bi-shop-window"></i> Other Product List
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Search</span>
                      <input
                        type="text"
                        className="txt1 rounded" // Bootstrap
                        // className="border px-3 py-2 w-full rounded-md" // Tailwind
                        placeholder="Search medicine..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Category</span>
                      <select
                        className="txt1"
                        value={selectedCategoryId}
                        onChange={(e) =>
                          setSelectedCategoryId(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                      >
                        <option value="">-Select-</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="txt_col">
                      <span className="lbl1">Status</span>
                      <select
                        className="txt1"
                        value={status} // ✅ controlled component ke liye
                        onChange={(event) => setStatus(event.target.value)}
                      >
                        <option value="">-Select-</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <div className="txt_col">
                      <Link
                        href={"/add-other-product"}
                        className="btn-style2 me-2"
                      >
                        <i className="bi bi-plus"></i> Add Other Product
                      </Link>
                      <button className="btn-style1">
                        <i className="bi bi-download"></i> Export Statement
                      </button>
                    </div>
                  </div>
                </div>
                {/* Table */}
                <div className="scroll_table mt-4 w-full">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        {/* <th className="fw-bold text-start"></th> */}
                        <th className="fw-bold text-start">Medicine Name</th>
                        <th className="fw-bold text-start">Unit</th>
                        <th className="fw-bold text-start">Manufacture</th>
                        <th className="fw-bold text-start">Pack Size</th>
                        <th className="fw-bold text-start">Status</th>
                        <th className="fw-bold text-start">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(filteredData) &&
                        filteredData
                          .slice(0, visibleCount)
                          .map((p: Medicine, index) => {
                            return (
                              <tr key={p.id}>
                                {/* <td>{index + 1}</td> */}
                                <td className="text-start">
                                  {p.medicine_name ?? "-"}
                                </td>
                                <td className="text-start">{p.unit ?? "-"}</td>
                                <td className="text-start">
                                  {p.manufacturer_name ?? "-"}
                                </td>
                                <td className="text-start">
                                  {p.pack_size ?? "-"}
                                </td>
                                {/* <td>{p.discount ?? "-"}</td>
                              <td>{p.mrp ?? "-"}</td> */}
                                <td>
                                  <span
                                    //onClick={() => handleToggleStatus(p.id)}
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
                      {!loadings &&
                        visibleCount >= filteredMedicines.length && (
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
      {/* <Modal show={showModal} onHide={() => setShowModal(false)} centered>
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
                    <strong>Pharmacy Id:</strong>{" "}
                    {selectedPharmacy.pharmacy_id_code}
                  </p>
                  <p>
                    <strong>Pharmacy Name:</strong>{" "}
                    {selectedPharmacy.pharmacy_name ?? "-"}
                  </p>
                  <p>
                    <strong>Contact Person:</strong>{" "}
                    {selectedPharmacy.user_name ?? "-"}
                  </p>
                  <p>
                    <strong>GST No.:</strong> {selectedPharmacy.gst_number}
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
                    <strong>Address:</strong>{" "}
                    {selectedPharmacy.address ??
                      selectedPharmacy.district ??
                      "-"}
                  </p>
                  <p>
                    <strong>Pincode:</strong> {selectedPharmacy.pincode}
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
      </Modal> */}
    </>
  );
}
