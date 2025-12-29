"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Modal } from "react-bootstrap";
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
  clearSelectedMedicine,
  deleteMedicineThunk,
  getMedicinesList,
  getMedicineViewByIdThunk,
  getMenuMedicinesList,
} from "@/lib/features/medicineSlice/medicineSlice";
import { encodeId } from "@/lib/utils/encodeDecode";

export default function MedicineList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list: getCategoryList } = useAppSelector((state) => state.category);
  const { medicines: medicineList, loading } = useAppSelector(
    (state) => state.medicine
  );
  // filter directly
  // ✅ Base list (without category_id = 1)
  const filteredMedicines = useMemo(() => {
    // pura list lo aur ascending order me sort karo (A → Z)
    const sorted = [...medicineList].sort((a, b) =>
      a.medicine_name.localeCompare(b.medicine_name)
    );
    return sorted;
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

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [viewMedicine, setViewMedicine] = useState<any>(null);

  // filtered records by search box
  const [filteredData, setFilteredData] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [searchLoading, setSearchLoading] = useState(false);

  //status
  const [status, setStatus] = useState<string>("all");

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getMedicinesList());
    dispatch(getCategoriesList());
  }, [dispatch]);

  const categoryOptions = (getCategoryList || []).map((c: Category) => ({
    label: c.category_name,
    value: c.id,
  }));

  // filtered records by search box + status filter
  // 🧠 Master filter logic
  useEffect(() => {
    setSearchLoading(true); // 🔥 spinner ON

    const timeout = setTimeout(() => {
      let data = filteredMedicines;

      // Category filter
      if (selectedCategoryId) {
        data = data.filter((item) => item.category_id === selectedCategoryId);
      }

      // Search filter (Name + ID)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();

        data = data.filter(
          (item) =>
            item.medicine_name.toLowerCase().includes(term) ||
            item.id.toString().includes(term)
        );
      }

      // Status filter
      if (status !== "all") {
        data = data.filter((item) => item.status === status);
      }

      setFilteredData(data);
      setVisibleCount(10); // 🔥 reset infinite scroll
      setSearchLoading(false); // 🔥 spinner OFF
    }, 500); // ⏳ debounce (0.5 sec)

    return () => clearTimeout(timeout);
  }, [filteredMedicines, selectedCategoryId, searchTerm, status]);

  // ✅ only length (primitive)
  const loadMore = () => {
    if (loadings || visibleCount >= filteredMedicines.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 800); // spinner for 3 sec
  };

  // const handleView = (medicine: Medicine) => {
  //   setSelectedMedicine(medicine);
  //   setShowModal(true);
  // };
  const handleEdit = (id: number, category_id?: number | null) => {
    const encodedId = encodeId(id);

    // ✅ category null/undefined → other product
    if (category_id == null) {
      router.push(`/update-other-product/${encodedId}`);
      return;
    }

    // ✅ Medicines category
    if (category_id === 1) {
      router.push(`/update-medicine/${encodedId}`);
      return;
    }

    // ✅ All other categories
    router.push(`/update-other-product/${encodedId}`);
  };

  const handleSafetyAdvice = (id: number) => {
    const encodedId = encodeId(id);
    router.push(`/safety-advice/${encodedId}`);
  };

  const handleUploadImage = (id: number) => {
    const encodedId = encodeId(id);
    router.push(`/admin/medicine/medicine-item/medicine-image/${encodedId}`);
  };

  const handleToggleStatus = async (medicine: Medicine) => {
    const oldStatus = medicine.status;
    const newStatus = oldStatus === "Active" ? "Inactive" : "Active";

    // 🔥 Optimistic UI update (instant color change)
    setFilteredData((prev) =>
      prev.map((item) =>
        item.id === medicine.id ? { ...item, status: newStatus } : item
      )
    );

    // ✅ TOAST IMMEDIATELY (no delay)
    toast.success(`Status changed to ${newStatus}`);

    try {
      await dispatch(deleteMedicineThunk(medicine.id)).unwrap();
    } catch (error) {
      // ❌ rollback UI
      setFilteredData((prev) =>
        prev.map((item) =>
          item.id === medicine.id ? { ...item, status: oldStatus } : item
        )
      );

      toast.error("Failed to change status");
    }
  };

  const handleView = async (medicineId: number) => {
    try {
      setViewLoading(true);
      const res = await dispatch(getMedicineViewByIdThunk(medicineId)).unwrap();

      setViewMedicine(res.data); // 👈 API response ka data
      setShowViewModal(true);
    } catch (err) {
      toast.error("Failed to load medicine details");
    } finally {
      setViewLoading(false);
    }
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
              <i className="bi bi-shop-window"></i> Product List
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
                        href={"/add-medicine"}
                        className="btn-style2 me-2"
                        onClick={() => dispatch(clearSelectedMedicine())}
                      >
                        <i className="bi bi-plus"></i> Add Medicine
                      </Link>
                      <Link
                        href={"/add-other-product"}
                        className="btn-style2 me-2"
                        onClick={() => dispatch(clearSelectedMedicine())}
                      >
                        <i className="bi bi-plus"></i> Add Other Product
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Table */}
                <div className="scroll_table mt-4 w-full">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        {/* <th className="fw-bold text-start"></th> */}
                        <th className="fw-bold text-start">ID</th>
                        <th className="fw-bold text-start">Medicine Name</th>
                        <th className="fw-bold text-start">Pack Size</th>
                        <th className="fw-bold text-start">Unit</th>
                        <th className="fw-bold text-start">Manufacture</th>
                        <th className="fw-bold text-center">Status</th>
                        <th className="fw-bold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <TableLoader colSpan={9} text="Searching..." />
                      )}

                      {!loading &&
                        filteredData
                          .slice(0, visibleCount)
                          .map((p: Medicine, index) => {
                            return (
                              <tr key={p.id}>
                                {/* <td>{index + 1}</td> */}
                                <td className="text-start">{p.id ?? "-"}</td>
                                <td className="text-start">
                                  {p.medicine_name ?? "-"}
                                </td>
                                <td className="text-start">
                                  {p.pack_size ?? "-"}
                                </td>
                                <td className="text-start">{p.unit ?? "-"}</td>
                                <td className="text-start">
                                  {p.manufacturer_name ?? "-"}
                                </td>
                                {/* <td>{p.discount ?? "-"}</td>
                              <td>{p.mrp ?? "-"}</td> */}
                                <td className="text-center">
                                  <span
                                    onClick={() => handleToggleStatus(p)}
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
                                <td className="text-center">
                                  {/* Edit */}
                                  <button
                                    className="btn btn-light btn-sm me-2"
                                    onClick={() =>
                                      handleEdit(p.id, p.category_id)
                                    }
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  {/* View */}
                                  <button
                                    className="btn btn-light btn-sm"
                                    onClick={() => handleView(p.id)}
                                  >
                                    <i className="bi bi-eye-fill"></i>
                                  </button>

                                  {/* Safety Advice */}
                                  {p.category_id === 1 ? (
                                    /* Safety Advice */
                                    <button
                                      className="btn btn-light btn-sm me-2"
                                      title="Safety Advice"
                                      onClick={() => handleSafetyAdvice(p.id)}
                                    >
                                      <i className="bi bi-shield-check text-warning"></i>
                                    </button>
                                  ) : (
                                    /* Category / Subcategory Update */
                                    <button
                                      className="btn btn-light btn-sm me-2"
                                      title="Update Category / Subcategory"
                                      // onClick={() => handleCategoryUpdate(p.id)}
                                    >
                                      <i className="bi bi-diagram-3 text-success"></i>
                                    </button>
                                  )}

                                  {/* Upload Image */}
                                  <button
                                    type="button"
                                    className="btn btn-light btn-sm"
                                    title="Upload Medicine Image"
                                    onClick={() => handleUploadImage(p.id)}
                                  >
                                    <i className="bi bi-image text-primary"></i>
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
                      {!loading &&
                        !searchLoading &&
                        !loadings &&
                        filteredData.length === 0 && (
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
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="xl"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {viewMedicine?.medicine_name || "Medicine Details"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {viewLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            viewMedicine && (
              <>
                {/* BASIC INFO */}
                <div className="mb-3">
                  <h6 className="fw-bold">Basic Information</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Generic:</strong> {viewMedicine.generic_name}
                      </p>
                      <p>
                        <strong>Manufacturer:</strong>{" "}
                        {viewMedicine.manufacture_name}
                      </p>
                      <p>
                        <strong>Dosage Form:</strong>{" "}
                        {viewMedicine.dose_form_name}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Pack Size:</strong> {viewMedicine.pack_size}
                      </p>
                      <p>
                        <strong>Unit:</strong> {viewMedicine.unit_name}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <Badge
                          bg={
                            viewMedicine.status === "Active"
                              ? "success"
                              : "danger"
                          }
                        >
                          {viewMedicine.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>

                <hr />

                {/* PRICING */}
                <div className="mb-3">
                  <h6 className="fw-bold">Pricing & Compliance</h6>
                  <div className="row">
                    <div className="col-md-4">
                      <p>
                        <strong>GST:</strong> {viewMedicine.GST}%
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p>
                        <strong>Discount:</strong> {viewMedicine.discount}%
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p>
                        <strong>HSN:</strong> {viewMedicine.HSN_Code ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <hr />

                {/* MEDICAL FLAGS */}
                <div className="mb-3">
                  <h6 className="fw-bold">Medical Flags</h6>
                  <p>
                    <strong>Prescription Required:</strong>{" "}
                    {viewMedicine.prescription_required ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>H1 Restricted:</strong>{" "}
                    {viewMedicine.H1_Restricted === "1" ? "Yes" : "No"}
                  </p>
                </div>

                <hr />

                {/* CONTENT SECTIONS */}
                <div className="mb-3">
                  <h6 className="fw-bold">Description</h6>
                  <div
                    className="content-box"
                    dangerouslySetInnerHTML={{
                      __html: viewMedicine.description,
                    }}
                  />
                </div>
                <hr />
                <div className="mb-3">
                  <h6 className="fw-bold">Uses & Benefits</h6>
                  <div
                    className="content-box"
                    dangerouslySetInnerHTML={{
                      __html: viewMedicine.uses_benefits,
                    }}
                  />
                </div>
                <hr />
                <div className="mb-3">
                  <h6 className="fw-bold">Side Effects</h6>
                  <div
                    className="content-box"
                    dangerouslySetInnerHTML={{
                      __html: viewMedicine.side_effect,
                    }}
                  />
                </div>
                <hr />
                <div className="mb-3">
                  <h6 className="fw-bold">Direction For Use</h6>
                  <div
                    className="content-box"
                    dangerouslySetInnerHTML={{
                      __html: viewMedicine.direction_for_use,
                    }}
                  />
                </div>
                <hr />
                <div className="mb-3">
                  <h6 className="fw-bold">Storage</h6>
                  <p>{viewMedicine.storage}</p>
                </div>

                <hr />

                {/* META */}
                <div className="text-muted small">
                  Created by <b>{viewMedicine.created_by_name}</b> on{" "}
                  {formatDateOnly(viewMedicine.created_on)} <br />
                  Updated by <b>{viewMedicine.updated_by_name}</b>
                </div>
              </>
            )
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
