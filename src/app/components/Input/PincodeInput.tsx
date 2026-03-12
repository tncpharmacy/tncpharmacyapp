import React, { useState } from "react";

interface PincodeInputProps {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  colClass?: string;
  onChange: (value: string) => void;
}

const PincodeInput: React.FC<PincodeInputProps> = ({
  label,
  name,
  value,
  required = false,
  colClass = "col-md-4",
  onChange,
}) => {
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");

    if (val.length > 6) return;

    if (val && val.length !== 6) {
      setError("Pincode must be 6 digits");
    } else {
      setError("");
    }

    onChange(val);
  };

  return (
    <div className={colClass}>
      <div className="txt_col">
        <span className="lbl1">
          {label} {required && <span className="text-danger">*</span>}
        </span>

        <input
          type="text"
          name={name}
          className="txt1"
          value={value || ""}
          onChange={handleChange}
          maxLength={6}
          placeholder=""
        />

        {error && <small className="text-danger fw-semibold">{error}</small>}
      </div>
    </div>
  );
};

export default PincodeInput;
