import React, { useState } from "react";

interface EmailInputProps {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  colClass?: string;
  onChange: (value: string) => void;
}

const EmailInput: React.FC<EmailInputProps> = ({
  label,
  name,
  value,
  required = false,
  colClass = "col-md-4",
  onChange,
}) => {
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (val && !regex.test(val)) {
      setError("Please enter a valid email address");
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
          type="email"
          name={name}
          className="txt1"
          value={value || ""}
          onChange={handleChange}
          placeholder=""
        />

        {error && <small className="text-danger fw-semibold">{error}</small>}
      </div>
    </div>
  );
};

export default EmailInput;
