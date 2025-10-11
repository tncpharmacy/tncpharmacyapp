"use client";

import Select from "react-select";
import { Medicine } from "@/types/medicine";
import { useId } from "react";

interface OptionType {
  label: string;
  value: number;
}

interface SelectMedicineDropdownProps {
  medicines: Medicine[];
  selected: OptionType[];
  onChange: (selected: OptionType[]) => void;
  label?: string;
  placeholder?: string;
  hideSelectedText?: boolean;
}

export default function SelectMedicineDropdown({
  medicines,
  selected,
  onChange,
  label = "Product",
  placeholder = "Select product(s)...",
  hideSelectedText,
}: SelectMedicineDropdownProps) {
  const id = useId();

  const options: OptionType[] = medicines.map((m) => ({
    label: m.medicine_name,
    value: m.id,
  }));

  return (
    <div className="custom-input-group position-relative">
      {/* Floating Label */}
      <label
        htmlFor={id}
        className="floating-label fw-semibold text-dark small"
        style={{
          position: "absolute",
          top: "-14px",
          left: "10px",
          background: "#fff",
          padding: "0 6px",
          fontSize: "13px",
          color: "#495057",
          zIndex: 5,
        }}
      >
        {label}
      </label>

      {/* React Select */}
      <Select
        inputId={id}
        isMulti
        options={options}
        value={hideSelectedText ? [] : selected}
        onChange={(value) => onChange(value as OptionType[])}
        placeholder={placeholder}
        isSearchable
        classNamePrefix="select"
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? "#0d6efd" : "#ced4da",
            boxShadow: state.isFocused
              ? "0 0 0 0.15rem rgba(13,110,253,.25)"
              : "none",
            borderRadius: "4px",
            minHeight: "42px",
            "&:hover": { borderColor: "#0d6efd" },
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: "#f1f3f5",
            borderRadius: "20px",
            padding: "2px 6px",
            border: "1px solid #dee2e6",
            marginRight: "4px",
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "#212529",
            fontWeight: 500,
            paddingLeft: "5px",
            paddingRight: "2px",
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: "#6c757d",
            fontSize: "14px",
            borderRadius: "50%",
            padding: "2px 4px",
            ":hover": {
              backgroundColor: "#dc3545",
              color: "#fff",
            },
          }),
          placeholder: (base) => ({
            ...base,
            color: "#adb5bd",
            fontWeight: 500,
          }),
        }}
      />
    </div>
  );
}
