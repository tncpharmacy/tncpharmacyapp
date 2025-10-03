// src/components/ui/badge.tsx
import React from "react";

type BadgeProps = React.PropsWithChildren<{ className?: string }>;

export const Badge: React.FC<BadgeProps> = ({ children, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 ${className}`}
    >
      {children}
    </span>
  );
};
