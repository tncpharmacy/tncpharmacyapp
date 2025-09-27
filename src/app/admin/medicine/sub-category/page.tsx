"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { SubCategory } from "@/types/subCategory";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import {
  deleteSubcategory,
  getSubcategories,
} from "@/lib/features/subCategorySlice/subCategorySlice";

export default function AddSubCategory() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // redux se categories uthana
  const { list: subcategories } = useAppSelector((state) => state.subcategory);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SubCategory | null>(
    null
  );

  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] =
    useState<SubCategory[]>(subcategories);

  //status
  const [records, setRecords] = useState<SubCategory[]>([]);
  const [status, setStatus] = useState<string>("");

  const [formData, setFormData] = useState<Partial<SubCategory>>({
    id: 0,
    category_id: "",
    category_name: "",
    sub_category_name: "",
    description: "",
    status: "",
  });

  // filtered records by search box + status filter
  useEffect(() => {
    let data = subcategories || [];

    // 🔹 Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((item: SubCategory) =>
        (Object.keys(item) as (keyof SubCategory)[]).some((key) =>
          String(item[key] ?? "")
            .toLowerCase()
            .includes(lower)
        )
      );
    }

    // 🔹 Status filter
    if (status) {
      data = data.filter((item: SubCategory) => item.status === status);
    }

    setFilteredData(data);
  }, [searchTerm, status, subcategories.length]); // ✅ only length (primitive)

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getSubcategories());
  }, [dispatch]);

  //infinte scroll records
  const loadMore = () => {
    if (loadings || visibleCount >= subcategories.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to change status of this pharmacy?")) {
      dispatch(deleteSubcategory(id));
    }
  };

  const handleView = (category: SubCategory) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleEdit = (id: number) => {
    const encodedId = encodeURIComponent(btoa(String(id)));
    router.push(`/update-sub-category/${encodedId}`);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
            <div className="main_content">
              <div className="row">
                {/* Left Side - Table */}
                <div className="col-sm-8 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    {/* Left side - Title */}
                    <h5 className="mb-0">
                      <i className="bi bi-card-list"></i> Sub Category List
                    </h5>

                    {/* Right side - Search */}
                    <div className="d-flex">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search sub category..."
                        style={{ width: "550px" }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="scroll_table mt-4">
                    <table className="table cust_table1">
                      <thead>
                        <tr>
                          <th>Id</th>
                          <th>Category</th>
                          <th>Sub Category</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.slice(0, visibleCount).map((p) => (
                          <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.category_name ?? "-"}</td>
                            <td>{p.sub_category_name ?? "-"}</td>
                            <td>{p.description ?? "-"}</td>
                            <td>
                              <span
                                onClick={() => handleDelete(p.id)}
                                className={`status ${
                                  p.status === "Active"
                                    ? "status-active"
                                    : "status-inactive"
                                } cursor-pointer`}
                                title="Click to change status"
                              >
                                {p.status === "Active" ? "Active" : "Inactive"}
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Side - Form */}
                <div className="col-sm-4">
                  <div className="card p-3 shadow-sm">
                    <h5>Add Sub Category</h5>
                    <hr className="w-100" />
                    <div className="row">
                      <div className="col-md-12">
                        <div className="txt_col">
                          <span className="lbl1">Category</span>
                          <input
                            type="text"
                            className="txt1"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="txt_col">
                          <span className="lbl1">Sub Category</span>
                          <input
                            type="text"
                            className="txt1"
                            name="sub_category_name"
                            value={formData.sub_category_name}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="txt_col">
                          <span className="lbl1">Description</span>
                          <textarea
                            className="txt1 h-50"
                            name="description"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <button className="btn btn-primary">Submit</button>
                  </div>
                </div>
              </div>
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </>
  );
}
