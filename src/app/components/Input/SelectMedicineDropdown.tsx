"use client";

import Select, { GroupBase, Props as SelectProps } from "react-select";
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

interface CustomSelectProps
  extends SelectProps<OptionType, true, GroupBase<OptionType>> {
  selectedIds?: Set<number>;
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

  // ✅ Convert to options + sort alphabetically (case insensitive)
  const options: OptionType[] = medicines
    .map((m) => ({
      label: m.medicine_name,
      value: m.id,
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
    );

  const selectedIds = new Set(selected.map((s) => s.value));

  return (
    <div className="custom-input-group position-relative">
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

      <Select<OptionType, true, GroupBase<OptionType>>
        inputId={id}
        isMulti
        options={options}
        value={hideSelectedText ? [] : selected}
        onChange={(value) => onChange(value as OptionType[])}
        placeholder={placeholder}
        isSearchable
        classNamePrefix="select"
        {...({ selectedIds } as CustomSelectProps)}
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

          option: (base, { data, isFocused, selectProps }) => {
            const props = selectProps as CustomSelectProps;
            const isSelected = props.selectedIds?.has(
              (data as OptionType).value
            );

            return {
              ...base,
              backgroundColor: isSelected
                ? "#d7e6feff"
                : isFocused
                ? "#e7f1ff"
                : "#fff",
              color: isSelected ? "#212529" : "#212529",
              fontWeight: isSelected ? 600 : 400,
              cursor: "pointer",
              ":active": {
                backgroundColor: isSelected ? "#0b5ed7" : "#dbe9ff",
              },
            };
          },
        }}
      />
    </div>
  );
}
