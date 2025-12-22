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
  label = "",
  name = "",
  type = "select",
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

  // ⭐ NEW
  isTableEditMode = false,
}) => {
  // ⭐ TABLE MODE → No grid, no labels
  if (isTableEditMode) {
    return (
      <div style={{ minWidth: "120px" }}>
        <select
          id={name}
          name={name}
          className="form-control"
          value={value ?? ""}
          required={required}
          onChange={onChange}
          style={{
            height: "40px",
            fontSize: "14px",
          }}
        >
          <option value="">-- Select --</option>
          {DOSE_INSTRUCTIONS.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.value}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // ⭐ NORMAL FORM MODE
  const classes = [
    colClass,
    colSm ? `col-sm-${colSm}` : "",
    colMd ? `col-md-${colMd}` : "",
    colLg ? `col-lg-${colLg}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes || "col-md-4"}>
      <div className="txt_col">
        {label && (
          <span className="lbl1">
            {label} {required && <span className="text-danger">*</span>}
          </span>
        )}

        <select
          id={name}
          name={name}
          className="txt1"
          value={value ?? ""}
          required={required}
          onChange={onChange}
          style={{ height: "40px", fontSize: "14px", padding: 0 }}
        >
          <option value="">-- Select --</option>
          {DOSE_INSTRUCTIONS.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.value}
            </option>
          ))}
        </select>

        {error && <small className="text-danger">{error}</small>}
      </div>
    </div>
  );
};

export default DoseInstructionSelect;
