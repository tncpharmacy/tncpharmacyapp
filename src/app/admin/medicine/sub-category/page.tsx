"use client";

import { useEffect, useState } from "react";
import "../../css/admin-style.css";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { SubCategory, CreateSubCategoryDTO } from "@/types/subCategory";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  updateSubcategory,
} from "@/lib/features/subCategorySlice/subCategorySlice";
import toast from "react-hot-toast";
import { getCategoriesList } from "@/lib/features/categorySlice/categorySlice";

export default function AddSubCategory() {
  const dispatch = useAppDispatch();
  // redux se categories uthana
  const { list: subcategories } = useAppSelector((state) => state.subcategory);

  const { list: categories } = useAppSelector((state) => state.category);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);

  // filtered records by search box
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] =
    useState<SubCategory[]>(subcategories);

  //status
  const [status, setStatus] = useState<string>("");

  const [formData, setFormData] = useState<Partial<SubCategory>>({
    id: 0,
    category_id: 0,
    category_name: "",
    sub_category_name: "",
    description: "",
    status: "Active",
  });

  // Reset Your From
  const handleReset = () => {
    setFormData({
      id: 0,
      category_id: 0,
      category_name: "",
      sub_category_name: "",
      description: "",
      status: "Active",
    });
  };

  // Fetch all pharmacies once
  useEffect(() => {
    dispatch(getSubcategories());
    dispatch(getCategoriesList());
  }, [dispatch]);

  // filtered records by search box + status filter
  useEffect(() => {
    let data = subcategories ? [...subcategories] : [];

    // 🔹 Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((item: SubCategory) =>
        (Object.keys(item) as (keyof SubCategory)[]).some((key) => {
          const value = item[key];
          return (
            typeof value === "string" && value.toLowerCase().includes(lower)
          );
        })
      );
    }
    // 🔹 Ascending order by id
    data = data.sort((a, b) => a.id - b.id);

    setFilteredData(data);
  }, [searchTerm, subcategories]);

  const handleToggleStatus = async (id: number) => {
    // Find category in the filteredData (latest UI state)
    const subcategory = filteredData.find((c) => c.id === id);
    if (!subcategory) return;

    const newStatus = subcategory.status === "Active" ? "Inactive" : "Active";

    try {
      // Optimistic UI update
      setFilteredData((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );

      // Update backend
      await dispatch(
        updateSubcategory({
          id,
          sub_category_name: subcategory.sub_category_name,
          description: subcategory.description,
          status: newStatus,
        })
      ).unwrap();

      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");

      // Revert UI if backend fails
      setFilteredData((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: subcategory.status } : c
        )
      );
    }
  };

  //infinte scroll records
  const loadMore = () => {
    if (loadings || visibleCount >= subcategories.length) return;
    setLoadings(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadings(false);
    }, 3000); // spinner for 3 sec
  };

  // const handleView = (category: SubCategory) => {
  //   setSelectedCategory(category);
  //   setShowModal(true);
  // };

  const handleEdit = (id: number) => {
    const subCategory = subcategories.find((item) => item.id === id);
    if (subCategory) {
      setFormData({
        id: subCategory.id,
        category_id: subCategory.category_id,
        sub_category_name: subCategory.sub_category_name,
        description: subCategory.description,
        status: subCategory.status,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToAppend: CreateSubCategoryDTO = {
        category_id: formData.category_id || 0,
        sub_category_name: formData.sub_category_name || "",
        description: formData.description || "",
        status: "Active",
      };

      // console.log("Sending payload:", formDataToAppend);

      if (formData.id && formData.id > 0) {
        // ✅ UPDATE
        const updatedSub = await dispatch(
          updateSubcategory({ id: formData.id, ...formDataToAppend })
        ).unwrap();

        toast.success("Sub Category updated successfully!");

        // 🔹 Update filteredData in-place, preserve order
        setFilteredData((prev) => {
          const newData = [...prev];
          const index = newData.findIndex((item) => item.id === updatedSub.id);
          if (index !== -1) newData[index] = updatedSub; // ✅ item apni original jagah rahe
          return newData;
        });
      } else {
        // ✅ CREATE
        const newSub = await dispatch(
          createSubcategory(formDataToAppend)
        ).unwrap();
        toast.success("Sub Category Created successfully!");

        // 🔹 Add new item at top or bottom
        setFilteredData((prev) => [newSub, ...prev]);
      }
      // ✅ Refresh list after create/update
      dispatch(getSubcategories());
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

                  <div className="scroll_table mt-4 w-full">
                    <table className="table cust_table1">
                      <thead>
                        <tr>
                          <th className="text-start">Id</th>
                          <th className="text-start">Category</th>
                          <th className="text-start">Sub Category</th>
                          <th className="text-start">Status</th>
                          <th className="text-start">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData
                          .slice(0, visibleCount)
                          .sort((a, b) => a.id - b.id) // ascending order by id
                          .map((p) => (
                            <tr key={p.id}>
                              <td className="text-start">{p.id}</td>
                              <td className="text-start">
                                {p.category_name ?? "-"}
                              </td>
                              <td className="text-start">
                                {p.sub_category_name ?? "-"}
                              </td>
                              <td className="text-start">
                                <span
                                  onClick={() => handleToggleStatus(p.id)}
                                  className={`status ${
                                    p.status === "Active"
                                      ? "status-active"
                                      : "status-inactive"
                                  } cursor-pointer`}
                                  title="Click to change status"
                                >
                                  {p.status}
                                </span>
                              </td>
                              <td className="text-start">
                                <button
                                  className="btn btn-light btn-sm me-2"
                                  onClick={() => handleEdit(p.id)}
                                >
                                  <i className="bi bi-pencil"></i>
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
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="txt_col">
                            <span className="lbl1">Category</span>
                            <select
                              className="txt1"
                              name="category_id"
                              value={formData.category_id ?? ""}
                              onChange={handleChange}
                              required
                            >
                              <option value="">Select Category</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.category_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="txt_col">
                            <span className="lbl1">Sub Category</span>
                            <input
                              type="text"
                              className="txt1"
                              name="sub_category_name"
                              value={formData.sub_category_name || ""}
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
                      <div className="d-flex justify-content-between mt-3">
                        <button className="btn btn-primary text-left">
                          Submit
                        </button>
                        <button
                          className="btn btn-primary text-right"
                          type="button"
                          onClick={handleReset}
                        >
                          Clear
                        </button>
                      </div>
                    </form>
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
