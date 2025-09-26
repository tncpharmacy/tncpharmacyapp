// components/SelectInput.tsx
import React from "react";

interface Option {
  label: string;
  value: string | number;
}

interface SelectInputProps {
  label: string;
  name: string;
  value: string | number;
  options: Option[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  colClass?: string;
  required?: boolean;
  error?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  colClass = "col-md-4",
  required = false,
  error,
}) => {
  return (
    <div className={colClass}>
      <div className="txt_col">
        <span className="lbl1">
          {label} {required && <span className="text-danger">*</span>}
        </span>
        <select
          id={name}
          name={name}
          className="txt1"
          value={value}
          onChange={onChange}
          required={required}
        >
          <option value="">-- Select {label} --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <small className="text-danger">{error}</small>}
      </div>
    </div>
  );
};

export default SelectInput;
