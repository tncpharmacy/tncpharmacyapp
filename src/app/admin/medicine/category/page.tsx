"use client";

import { useEffect, useState } from "react";
import "../../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/features/categorySlice/categorySlice";
import { Category, CreateCategoryDTO } from "@/types/category";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import toast from "react-hot-toast";

export default function AddCategory() {
  const dispatch = useAppDispatch();
  // redux se categories uthana
  const { list: categories } = useAppSelector((state) => state.category);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Category[]>(categories);

  //status
  const [status, setStatus] = useState<string>("");

  const [formData, setFormData] = useState<Partial<Category>>({
    id: 0,
    category_name: "",
    description: "",
    status: "Active",
  });

  // filtered records by search box + status filter
  useEffect(() => {
    let data = categories ? [...categories] : [];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((item: Category) =>
        (Object.keys(item) as (keyof Category)[]).some((key) => {
          const value = item[key];
          return (
            typeof value === "string" && value.toLowerCase().includes(lower)
          );
        })
      );
    }
    // 🔹 Status filter
    if (status) {
      data = data.filter((item: Category) => item.status === status);
    }
    // 🔹 Ascending order by id
    data = data.sort((a, b) => a.id - b.id);
    setFilteredData(data);
  }, [searchTerm, status, categories]); // ✅ use entire array, not just length

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  //infinte scroll records
  const loadMore = () => {
    if (loadings || visibleCount >= categories.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to change status of this pharmacy?")) {
      dispatch(deleteCategory(id));
    }
  };

  // const handleView = (pharmacy: Category) => {
  //   setSelectedPharmacy(pharmacy);
  //   setShowModal(true);
  // };

  const handleEdit = (id: number) => {
    // list me se category dhoondo
    const category = categories.find((item) => item.id === id);
    if (category) {
      setFormData({
        id: category.id,
        category_name: category.category_name,
        description: category.description,
        status: category.status,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToAppend: CreateCategoryDTO = {
        category_name: formData.category_name || "",
        description: formData.description || "",
        status: "Active",
      };

      console.log("Sending payload:", formDataToAppend);

      if (formData.id && formData.id > 0) {
        // ✅ Update only
        await dispatch(
          updateCategory({
            id: formData.id,
            ...formDataToAppend,
          })
        ).unwrap();
        toast.success("Category updated successfully!");
      } else {
        // ✅ Create only
        await dispatch(createCategory(formDataToAppend)).unwrap();
        toast.success("Category Created successfully!");
      }

      // ✅ Refresh list after create/update
      dispatch(getCategories());
      setVisibleCount(10);
      // Reset form
      setFormData({
        id: 0,
        category_name: "",
        description: "",
        status: "Active",
      });
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      alert("Something went wrong!");
    }
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
          <div className="body_content">
            {/* <div className="pageTitle">
              <i className="bi bi-person-add"></i> Medicine Category List
            </div> */}

            <div className="main_content">
              <div className="row">
                {/* Left Side - Table */}
                <div className="col-sm-8 shadow-sm">
                  <InfiniteScroll
                    loadMore={loadMore}
                    hasMore={visibleCount < filteredData.length}
                    className="body_content"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      {/* Left side - Title */}
                      <h5 className="mb-0">
                        <i className="bi bi-card-list"></i> Category List
                      </h5>

                      {/* Right side - Search */}
                      <div className="d-flex">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search category..."
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
                                {/* <button
                                  className="btn btn-light btn-sm"
                                  onClick={() => handleView(p)}
                                >
                                  <i className="bi bi-eye-fill"></i>
                                </button> */}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </InfiniteScroll>
                </div>

                {/* Right Side - Form */}
                <div className="col-sm-4">
                  <div className="card p-3 shadow-sm">
                    <h5>Add Category</h5>
                    <hr className="w-100" />
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="txt_col">
                            <span className="lbl1">Category</span>
                            <input
                              type="text"
                              className="txt1"
                              name="category_name"
                              value={formData.category_name || ""}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="txt_col">
                            <span className="lbl1">Description</span>
                            <textarea
                              className="txt1 h-50"
                              name="description"
                              value={formData.description || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                              required
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      <button className="btn btn-primary">Submit</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
