"use client";

import { useEffect, useState } from "react";
import "@/app/admin/css/admin-style.css";
import { useRouter } from "next/navigation";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import toast from "react-hot-toast";
import SelectInput from "../Input/SelectInput";
import {
  fetchSafetyAdviceByIdThunk,
  fetchSafetyLabelListThunk,
  saveSafetyAdviceThunk,
} from "@/lib/features/safetyAdviceSlice/safetyAdviceSlice";
import { SafetyAdvice, SafetyLabel } from "@/types/safetyAdvice";
import InputTextArea from "../Input/InputTextArea";
import { getMedicinesMenuById } from "@/lib/features/medicineSlice/medicineSlice";
import { Medicine } from "@/types/medicine";
import Spinner from "../Sppiner/Sppiner";

interface Props {
  id?: number;
}

export default function SafetyAdviceForm({ id }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<SafetyAdvice>>({
    id: 0,
    medicine_id: 0,
    alcohol: "",
    alcohol_label: 0,
    pregnancy: "",
    pregnancy_label: 0,
    breast_feeding: "",
    breast_feeding_label: 0,
    driving: "",
    driving_label: 0,
    kidney: "",
    kidney_label: 0,
    liver: "",
    liver_label: 0,
    heart: "",
    heart_label: 0,
  });
  const { entity: satetyAdviceById, labelList: safetyAdviceList } =
    useAppSelector((state) => state.safetyAdvice);

  const { medicinesList } = useAppSelector((state) => state.medicine);
  const medicine = medicinesList as unknown as Medicine;

  useEffect(() => {
    dispatch(fetchSafetyLabelListThunk());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getMedicinesMenuById(id));
    }
  }, [dispatch, id]);

  const options = (safetyAdviceList || []).map((s: SafetyLabel) => ({
    label: s.safety_label,
    value: s.id_safetylabel,
  }));
  // 🔹 Edit mode (future API integration)
  useEffect(() => {
    if (id) {
      setLoading(true);

      dispatch(fetchSafetyAdviceByIdThunk(id))
        .unwrap()
        .then((res: SafetyAdvice) => {
          setFormData((prev) => ({
            ...prev,
            ...res,
          }));
        })
        .finally(() => setLoading(false));
    }
  }, [id, dispatch]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? Number(value) : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("Invalid medicine");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        medicine_id: id, // 🔥 important
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await dispatch(saveSafetyAdviceThunk(payload as any)).unwrap();

      toast.success("Safety advice saved successfully");
      router.push("/medicine");
    } catch (error) {
      toast.error("Failed to save safety advice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle mb-2">
              <i className="bi bi-shield-check me-2"></i>
              {" Safety Advice"}
              <button
                onClick={() => router.back()}
                className="btn-style2 float-end pe-4 ps-4"
              >
                ← Back
              </button>
            </div>

            {/* 🔽 MAIN CONTENT */}
            <div className="main_content">
              <form onSubmit={handleSubmit} className="row g-3">
                {/* Medicine (Full Width) */}

                {/* ===== Safety Advice Grid ===== */}
                <div className="row">
                  <div className="col-md-6 fw-bold text-primary mb-4 mt-4">
                    <strong>Medicine:</strong> {medicine?.medicine_name ?? "-"}
                  </div>
                  <div className="col-md-6 fw-bold text-primary mb-4 mt-4">
                    <strong>Manufacturer:</strong>{" "}
                    {medicine?.manufacturer_name ?? "-"}
                  </div>
                  {/* Alcohol */}
                  <div className="col-md-6 mb-4">
                    <div className="border rounded p-3 h-100">
                      <SelectInput
                        label="Alcohol Label"
                        name="alcohol_label"
                        value={formData.alcohol_label ?? ""}
                        options={options}
                        onChange={handleSelectChange}
                        colClass="col-md-12"
                      />

                      <InputTextArea
                        label="Alcohol"
                        name="alcohol"
                        value={formData.alcohol ?? ""}
                        onChange={handleTextChange}
                      />
                    </div>
                  </div>

                  {/* Pregnancy */}
                  <div className="col-md-6 mb-4">
                    <div className="border rounded p-3 h-100">
                      <SelectInput
                        label="Pregnancy Label"
                        name="pregnancy_label"
                        value={formData.pregnancy_label ?? ""}
                        options={options}
                        onChange={handleSelectChange}
                        colClass="col-md-12"
                      />

                      <InputTextArea
                        label="Pregnancy"
                        name="pregnancy"
                        value={formData.pregnancy ?? ""}
                        onChange={handleTextChange}
                      />
                    </div>
                  </div>

                  {/* Breast Feeding */}
                  <div className="col-md-6 mb-4">
                    <div className="border rounded p-3 h-100">
                      <SelectInput
                        label="Breast Feeding Label"
                        name="breast_feeding_label"
                        value={formData.breast_feeding_label ?? ""}
                        options={options}
                        onChange={handleSelectChange}
                        colClass="col-md-12"
                      />

                      <InputTextArea
                        label="Breast Feeding"
                        name="breast_feeding"
                        value={formData.breast_feeding ?? ""}
                        onChange={handleTextChange}
                      />
                    </div>
                  </div>

                  {/* Driving */}
                  <div className="col-md-6 mb-4">
                    <div className="border rounded p-3 h-100">
                      <SelectInput
                        label="Driving Label"
                        name="driving_label"
                        value={formData.driving_label ?? ""}
                        options={options}
                        onChange={handleSelectChange}
                        colClass="col-md-12"
                      />

                      <InputTextArea
                        label="Driving"
                        name="driving"
                        value={formData.driving ?? ""}
                        onChange={handleTextChange}
                      />
                    </div>
                  </div>

                  {/* Kidney */}
                  <div className="col-md-6 mb-4">
                    <div className="border rounded p-3 h-100">
                      <SelectInput
                        label="Kidney Label"
                        name="kidney_label"
                        value={formData.kidney_label ?? ""}
                        options={options}
                        onChange={handleSelectChange}
                        colClass="col-md-12"
                      />

                      <InputTextArea
                        label="Kidney"
                        name="kidney"
                        value={formData.kidney ?? ""}
                        onChange={handleTextChange}
                      />
                    </div>
                  </div>

                  {/* Liver */}
                  <div className="col-md-6 mb-4">
                    <div className="border rounded p-3 h-100">
                      <SelectInput
                        label="Liver Label"
                        name="liver_label"
                        value={formData.liver_label ?? ""}
                        options={options}
                        onChange={handleSelectChange}
                        colClass="col-md-12"
                      />

                      <InputTextArea
                        label="Liver"
                        name="liver"
                        value={formData.liver ?? ""}
                        onChange={handleTextChange}
                      />
                    </div>
                  </div>

                  {/* Heart */}
                  <div className="col-md-6 mb-4">
                    <div className="border rounded p-3 h-100">
                      <SelectInput
                        label="Heart Label"
                        name="heart_label"
                        value={formData.heart_label ?? ""}
                        options={options}
                        onChange={handleSelectChange}
                        colClass="col-md-12"
                      />

                      <InputTextArea
                        label="Heart"
                        name="heart"
                        value={formData.heart ?? ""}
                        onChange={handleTextChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Save */}
                <div className="text-end mt-3">
                  {loading ? (
                    <Spinner />
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-primary px-5"
                      disabled={loading}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* 🔼 MAIN CONTENT */}
          </div>
        </div>
      </div>
    </>
  );
}
