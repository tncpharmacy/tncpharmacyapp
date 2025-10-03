// src/components/ui/button.tsx
import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost";
  className?: string;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "solid",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-1 text-sm font-medium transition";
  const variantClass =
    variant === "solid"
      ? "bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
      : "bg-transparent text-gray-700 hover:bg-gray-100";

  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
