"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import "../../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getMedicinesList,
  getProductList,
} from "@/lib/features/medicineSlice/medicineSlice";
import type { Medicine, Product } from "@/types/medicine";
import InfiniteScroll from "@/app/components/InfiniteScroll/InfiniteScroll";
import SelectInput from "@/app/components/Input/SelectInput";
import Input from "@/app/components/Input/InputColSm";
import { getUser } from "@/lib/auth/auth";
import { createPurchaseStock } from "@/lib/features/purchaseStockSlice/purchaseStockSlice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { fetchSupplier } from "@/lib/features/supplierSlice/supplierSlice";
import CenterSpinner from "@/app/components/CenterSppiner/CenterSppiner";
import ProductDropdown from "@/app/components/ProductDropdown/ProductDropdown";

const getToday = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

type PurchaseItem = {
  product_id: number;
  product_name: string;

  product: Medicine;

  brand_category: string;
  qty: string;
  batch: string;
  expiry_date: string;

  mrp: string;
  discount: string;
  purchase_rate: string;
  amount: string;

  location: string;
  applied_discount: string;
};

export default function PurchaseInvoiceImport() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userPharmacy = getUser();
  const pharmacy_id = userPharmacy?.pharmacy_id || 0;
  const pharmacist_id = userPharmacy?.id || 0;
  const { medicines: getMedicine } = useAppSelector((state) => state.medicine);
  const { list: supplierList } = useAppSelector((state) => state.supplier);
  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadings, setLoadings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Excel preview data
  const [excelData, setExcelData] = useState<Record<string, string | number>[]>(
    []
  );

  // filtered records by search box
  const [filteredData, setFilteredData] = useState<Medicine[]>([]);
  // select medicine dropdown
  const [selectedMedicines] = useState<{ label: string; value: number }[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Medicine | null>(null);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  const [formData, setFormData] = useState<Partial<Product>>({
    id: pharmacist_id,
    supplier: "",
    medicine_name: "",
    pack_size: "",
    purchase_date: "",
    invoice_number: "",
    manufacturer_name: "",
    qty: "",
    batch: "",
    expiry_date: "",
    discount: "",
    mrp: "",
    purchase_rate: "",
    amount: "",
    location: "",
    applied_discount: "",
    brand_category: "",
  });

  // filtered records by search box + status filter
  useEffect(() => {
    let data: Medicine[] = getMedicine || [];

    if (selectedMedicines.length > 0) {
      const selectedNames = selectedMedicines.map((m) => m.label.toLowerCase());
      data = data.filter((item) =>
        selectedNames.some((name) =>
          item.medicine_name?.toLowerCase().includes(name)
        )
      );
    }

    setFilteredData(data);
  }, [selectedMedicines, getMedicine]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      purchase_date: getToday(), // ✅ default today
    }));
  }, []);

  useEffect(() => {
    dispatch(fetchSupplier());
  }, [dispatch]);

  // Convert suppliers into dropdown options
  const supplierOptions = (supplierList || []).map((s) => ({
    label: s.supplier_name,
    value: s.id, // always use id
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    if (!formData.supplier) {
      toast.error("Please select supplier");
      return;
    }

    if (!formData.invoice_number) {
      toast.error("Please enter invoice number");
      return;
    }

    const today = getToday();
    const yesterday = getYesterday();

    if (
      formData.purchase_date !== today &&
      formData.purchase_date !== yesterday
    ) {
      toast.error("Purchase date must be today or yesterday");
      return;
    }

    setIsLoading(true);

    try {
      // Build purchase_details from Excel
      const purchaseDetails = purchaseItems.map((item, i) => ({
        pharmacy_id,
        product_id: item.product_id,
        quantity: item.qty,
        batch: item.batch,
        expiry_date: item.expiry_date,
        mrp: item.mrp,
        discount: item.discount,
        purchase_rate: item.purchase_rate,
        amount: item.amount,
        location: item.location,
        applied_discount: item.applied_discount,
        brand_category: item.brand_category,
      }));

      const basePayload = {
        pharmacy_id: Number(pharmacy_id),
        supplier_id: Number(formData.supplier),
        invoice_num: String(formData.invoice_number),
        purchase_date: new Date(
          formData.purchase_date || new Date()
        ).toISOString(),
        status: "Active",
      };

      const chunkSize = 100;

      // 🚀 Send in batches
      for (let i = 0; i < purchaseDetails.length; i += chunkSize) {
        const chunk = purchaseDetails.slice(i, i + chunkSize);
        await dispatch(
          createPurchaseStock({
            ...basePayload,
            purchase_details: chunk,
          })
        ).unwrap();
      }

      toast.success("Purchase Invoice Imported Successfully!");

      // Reset
      setExcelData([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setFormData({
        id: pharmacist_id,
        supplier: "",
        medicine_name: "",
        pack_size: "",
        purchase_date: "",
        invoice_number: "",
        manufacturer_name: "",
        qty: "",
        batch: "",
        expiry_date: "",
        discount: "",
        mrp: "",
        purchase_rate: "",
        amount: "",
        location: "",
        applied_discount: "",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create purchase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const numericValue = value
      .replace(/[^0-9.]/g, "")
      .replace(/^(\d*\.?\d*).*$/, "$1");

    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error("Select Product");
      return;
    }
    if (!formData.brand_category) {
      toast.error("Please select brand category");
      return;
    }
    if (!formData.qty) {
      toast.error("Please enter qty");
      return;
    }
    if (!formData.batch) {
      toast.error("Please enter batch");
      return;
    }
    if (!formData.purchase_date) {
      toast.error("Please enter batch");
      return;
    }
    if (!formData.mrp) {
      toast.error("Please enter batch");
      return;
    }
    if (!formData.discount) {
      toast.error("Please enter batch");
      return;
    }
    if (!formData.purchase_rate) {
      toast.error("Please enter batch");
      return;
    }
    if (!formData.amount) {
      toast.error("Please enter batch");
      return;
    }
    if (!formData.location) {
      toast.error("Please enter batch");
      return;
    }
    if (!formData.applied_discount) {
      toast.error("Please enter batch");
      return;
    }

    const item: PurchaseItem = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.medicine_name,

      product: selectedProduct,

      brand_category: formData.brand_category || "",

      qty: formData.qty || "",
      batch: formData.batch || "",
      expiry_date: formData.expiry_date || "",

      mrp: formData.mrp || "",
      discount: formData.discount || "",
      purchase_rate: formData.purchase_rate || "",
      amount: formData.amount || "",

      location: formData.location || "",
      applied_discount: formData.applied_discount || "",
    };

    setPurchaseItems((prev) => [...prev, item]);
    setSelectedProduct(null);

    setFormData((prev) => ({
      ...prev,
      brand_category: "",
      qty: "",
      batch: "",
      expiry_date: "",
      mrp: "",
      discount: "",
      purchase_rate: "",
      amount: "",
      location: "",
      applied_discount: "",
    }));
  };

  const handleDelete = (index: number) => {
    setPurchaseItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          {isLoading && <CenterSpinner />}

          <div className="pageTitle">
            <i className="bi bi-shop-window"></i> Add Stock
            <button
              onClick={() => router.push("/pharmacist/purchase-invoice")}
              className="btn-style2 float-end pe-4 ps-4"
            >
              ← Back
            </button>
          </div>
          <div className="main_content">
            <div className="col-sm-12">
              <form onSubmit={handleSubmit}>
                <div className="row gy-3">
                  {/* 🔹 Row 1 */}
                  <SelectInput
                    label="Supplier"
                    name="supplier"
                    value={formData.supplier || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        supplier: e.target.value,
                      }))
                    }
                    options={supplierOptions}
                  />
                  <Input
                    label="Purchase Date"
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    min={getYesterday()} // ✅ yesterday allowed
                    max={getToday()} // ✅ today allowed
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        purchase_date: e.target.value,
                      }))
                    }
                    // required
                  />
                  <Input
                    label="Invoice Number"
                    type="text"
                    name="invoice_number"
                    value={formData.invoice_number || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        invoice_number: e.target.value,
                      }))
                    }
                    //required
                  />
                  <div className="card shadow-sm border-1 mt-4">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="bi bi-box-seam me-2 text-primary"></i>
                        Product Item
                      </h5>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddItem}
                      >
                        <i className="bi bi-plus-lg"></i> Add Item
                      </button>
                    </div>

                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="txt_col">
                            <ProductDropdown
                              label="Product"
                              value={selectedProduct}
                              onChange={(item) => {
                                setSelectedProduct(item);
                              }}
                            />
                          </div>
                        </div>

                        <Input
                          label="Brand Category"
                          type="select"
                          name="brand_category"
                          value={formData.brand_category}
                          onChange={handleChange}
                          options={[
                            { value: "1", label: "Top Brand" },
                            { value: "2", label: "TnC Trusted Brand" },
                            // { value: "3", label: "Cheapest Brand" },
                          ]}
                          colSm={2}
                        />
                        <Input
                          label="Qty"
                          type="text"
                          name="qty"
                          value={formData.qty}
                          onChange={handleNumberInput}
                          colSm={2}
                          maxLength={5}
                        />
                        <Input
                          label="Batch"
                          type="text"
                          name="batch"
                          value={formData.batch}
                          onChange={handleChange}
                          colSm={2}
                          maxLength={8}
                        />
                        <Input
                          label="Expiry Date"
                          type="date"
                          name="expiry_date"
                          value={formData.expiry_date}
                          onChange={handleChange}
                          colSm={2}
                        />
                        <Input
                          label="MRP"
                          type="text"
                          name="mrp"
                          value={formData.mrp}
                          onChange={handleNumberInput}
                          colSm={2}
                          maxLength={8}
                        />
                        <Input
                          label="Discount(%)"
                          type="text"
                          name="discount"
                          value={formData.discount}
                          onChange={handleNumberInput}
                          colSm={2}
                          maxLength={2}
                        />
                        <Input
                          label="Purchase Rate"
                          type="text"
                          name="purchase_rate"
                          value={formData.purchase_rate}
                          onChange={handleNumberInput}
                          colSm={2}
                          maxLength={8}
                        />
                        <Input
                          label="Amount"
                          type="text"
                          name="amount"
                          value={formData.amount}
                          onChange={handleNumberInput}
                          colSm={2}
                          maxLength={8}
                        />
                        <Input
                          label="Location"
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          colSm={2}
                          maxLength={25}
                        />
                        <Input
                          label="Applied Discount(%)"
                          type="text"
                          name="applied_discount"
                          value={formData.applied_discount}
                          onChange={handleNumberInput}
                          colSm={2}
                          maxLength={8}
                        />
                        {/* <div className="col-md-2 d-flex align-items-end">
                    <button
                      type="button"
                      className="btn-style1 w-100"
                      onClick={handleAddItem}
                    >
                      <i className="bi bi-plus-lg"></i> Add
                    </button>
                  </div> */}
                      </div>
                    </div>
                  </div>

                  <div className="card shadow-sm border-0 mt-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="bi bi-list-check me-2"></i>
                        Added Product Items
                      </h5>

                      <span className="badge bg-primary">
                        {purchaseItems.length}
                      </span>
                    </div>

                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-bordered table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>

                              <th>Product</th>

                              <th>Brand</th>

                              <th>Qty</th>

                              <th>Batch</th>

                              <th>Expiry</th>

                              <th>MRP</th>

                              <th>Discount(%)</th>

                              <th>Purchase Rate</th>

                              <th>Amount</th>

                              <th>Location</th>

                              <th>Additional Discount(%)</th>

                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {purchaseItems.length === 0 ? (
                              <tr>
                                <td colSpan={9} className="text-center py-4">
                                  No Product Added
                                </td>
                              </tr>
                            ) : (
                              purchaseItems.map((item, index) => (
                                <tr key={index}>
                                  <td>{index + 1}</td>

                                  <td>{item.product_name}</td>

                                  <td>
                                    {item.brand_category === "1"
                                      ? "Top Brand"
                                      : item.brand_category === "2"
                                      ? "TnC Trusted Brand"
                                      : "-"}
                                  </td>

                                  <td>{item.qty}</td>

                                  <td>{item.batch}</td>

                                  <td>{item.expiry_date}</td>

                                  <td>{item.mrp}</td>

                                  <td>{item.discount}</td>

                                  <td>{item.purchase_rate}</td>

                                  <td>{item.amount}</td>

                                  <td>{item.location}</td>

                                  <td>{item.applied_discount}</td>

                                  <td>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleDelete(index)}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  {/* 🔹 Row 2 */}

                  <div className="col-md-3 d-flex align-items-end">
                    <div className="txt_col w-100 text-end">
                      <button
                        className="btn-style1 w-100"
                        style={{ fontWeight: "600" }}
                        type="submit"
                      >
                        <i className="bi bi-check2-circle"></i> Final Submit
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* 🧾 Excel Preview Table */}
              {excelData.length > 0 && (
                <div className="scroll_table mt-4">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        {Object.keys(excelData[0]).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val, i) => (
                            <td key={i}>{val as string}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
