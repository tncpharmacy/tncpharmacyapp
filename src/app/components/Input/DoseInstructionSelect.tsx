import React from "react";
import { InputPropsColSm } from "@/types/input";

const DOSE_INSTRUCTIONS = [
  { value: "1-0-1" },
  { value: "1-1-1" },
  { value: "1-0-0" },
  { value: "0-1-0" },
  { value: "0-0-1" },
  { value: "1/2-0-1/2" },
  { value: "0-1-1" },
  { value: "1-0-1/2" },
];

const DoseInstructionSelect: React.FC<InputPropsColSm> = ({
  label,
  name,
  type = "text",
  value,
  placeholder,
  required = false,
  readOnly = false,
  error,
  colSm,
  colMd,
  colLg,
  colClass,
  onChange,
  max,
  min,
  maxLength,
}) => {
  // ✅ Dynamic responsive column class (Bootstrap style)
  const colClasses = [
    colClass,
    colSm ? `col-sm-${colSm}` : "",
    colMd ? `col-md-${colMd}` : "",
    colLg ? `col-lg-${colLg}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={colClasses || "col-md-4"}>
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
            style={{ padding: "0", height: "27px", fontSize: "11px" }}
          >
            <option value="">-- Select --</option>
            {DOSE_INSTRUCTIONS.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.value}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            className="txt1"
            value={value ?? ""}
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

export default DoseInstructionSelect;
