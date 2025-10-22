"use client";

import Select, { GroupBase, Props as SelectProps } from "react-select";
import { Medicine } from "@/types/medicine";
import { useId } from "react";

export interface OptionType {
  label: string;
  value: number;
}

interface SingleSelectDropdownProps {
  medicines: Medicine[];
  selected: OptionType | null;
  onChange: (selected: OptionType | null) => void;
  label?: string;
  placeholder?: string;
  hideSelectedText?: boolean;
}

export default function SingleSelectDropdown({
  medicines,
  selected,
  onChange,
  label = "Product",
  placeholder = "Select a product...",
}: SingleSelectDropdownProps) {
  const id = useId();

  // ✅ Variable 'options' को 'selectOptions' में बदल दिया गया है
  const selectOptions: OptionType[] = medicines
    .map((m) => {
      let cleanName = m.medicine_name;
      const idString = m.id.toString();

      // Check if the name starts with the item's ID string (e.g., "216Himalaya...")
      if (cleanName.startsWith(idString)) {
        // Remove the ID part and trim spaces
        cleanName = cleanName.substring(idString.length).trim();
      }
      return {
        label: cleanName,
        value: m.id,
      };
    })
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
    );

  return (
    <div className="custom-input-group position-relative">
      {/* ... Label JSX remains the same ... */}
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

      <Select<OptionType, false, GroupBase<OptionType>>
        inputId={id}
        isClearable={true}
        options={selectOptions}
        value={selected}
        onChange={(value) => onChange(value as OptionType | null)}
        placeholder={placeholder}
        isSearchable
        classNamePrefix="select"
        // ... styles ...
        styles={{
          // ... control styles ...
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
          // ... option styles ...
          option: (base, { isFocused, isSelected }) => ({
            ...base,
            backgroundColor: isSelected
              ? "#0d6efd"
              : isFocused
              ? "#e7f1ff"
              : "#fff",
            color: isSelected ? "#fff" : "#212529",
            fontWeight: isSelected ? 600 : 400,
            cursor: "pointer",
          }),
        }}
      />
    </div>
  );
}
