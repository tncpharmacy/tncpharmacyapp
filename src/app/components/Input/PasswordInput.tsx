import React, { useState } from "react";
import { InputProps } from "@/types/input";

const PasswordInput: React.FC<InputProps> = ({
  label,
  name,
  value,
  placeholder,
  required = false,
  readOnly = false,
  error,
  colClass = "col-md-4",
  onChange,
  maxLength,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className={colClass}>
      <div className="txt_col">
        <span className="lbl1">
          {label} {required && <span className="text-danger">*</span>}
        </span>

        <input
          type={show ? "text" : "password"}
          id={name}
          name={name}
          className="txt1"
          value={value ?? ""}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          onChange={onChange}
          maxLength={maxLength}
          style={{
            paddingRight: "40px", // 👈 icon ke liye proper jagah
          }}
        />

        <i
          className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`}
          onClick={() => setShow(!show)}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            fontSize: "18px",
            color: "#6c757d",
            padding: "4px",
            background: "#fff", // 👈 input ka bg maintain
          }}
        ></i>

        {error && <small className="text-danger">{error}</small>}
      </div>
    </div>
  );
};

export default PasswordInput;
