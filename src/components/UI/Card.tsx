// src/components/ui/card.tsx
import React from "react";

type CardProps = React.PropsWithChildren<{ className?: string }>;

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({
  children,
  className = "",
}) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};
