"use client";

import React, { useState } from "react";

export default function Test() {
  const [formData, setFormData] = useState({
    id: 0,
    category_name: "",
    description: "",
    status: "Active",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let url = "http://68.183.174.17:8081/api/masterapp/category/create/";
      let method = "POST";

      // Agar id > 0 hai to Update karna h
      if (formData.id > 0) {
        url = `http://68.183.174.17:8081/api/masterapp/category/${formData.id}/`;
        method = "PATCH";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (formData.id > 0) {
        alert(`Category Updated Successfully! (ID: ${formData.id})`);
      } else {
        alert("Category Created Successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving category!");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto border rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        {formData.id > 0 ? "Update Category" : "Create Category"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1">ID</label>
          <input
            type="number"
            name="id"
            value={formData.id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <p className="text-sm text-gray-500">
            Create ke liye <strong>0</strong> likho, Update ke liye actual ID
            likho.
          </p>
        </div>

        <div>
          <label className="block mb-1">Category Name</label>
          <input
            type="text"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {formData.id > 0 ? "Update Category" : "Create Category"}
        </button>
      </form>
    </div>
  );
}
