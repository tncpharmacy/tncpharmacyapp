import React from "react";
import { InputProps } from "@/types/input";

const Input: React.FC<InputProps> = ({
  label,
  name,
  type = "text",
  value,
  placeholder,
  required = false,
  readOnly = false,
  error,
  colClass = "col-md-4",
  options = [],
  onChange,
  max,
  min,
  maxLength,
}) => {
  return (
    <div className={colClass}>
      <div className="txt_col">
        <span className="lbl1">
          {label} {required && <span className="text-danger">*</span>}
        </span>

        {type === "select" ? (
          <select
            id={name}
            name={name}
            className="txt1"
            value={value ?? ""}
            required={required}
            onChange={onChange}
          >
            <option value="">-- Select --</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            className="txt1"
            value={value !== null && value !== undefined ? value : ""}
            placeholder={placeholder}
            required={required}
            readOnly={readOnly}
            onChange={onChange}
            max={max}
            min={min}
            maxLength={maxLength}
          />
        )}

        {error && <small className="text-danger">{error}</small>}
      </div>
    </div>
  );
};

export default Input;
