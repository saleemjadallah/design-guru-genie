
import React from "react";

type GeometricAccentsProps = {
  className?: string;
  variant?: "hero" | "features" | "cta";
};

export const GeometricAccents: React.FC<GeometricAccentsProps> = ({
  className = "",
  variant = "hero",
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {variant === "hero" && (
        <>
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-tl from-purple-100 to-indigo-100 opacity-10"></div>
          <div className="absolute top-1/3 left-0 w-36 h-36 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 opacity-10"></div>
          <div className="absolute bottom-0 right-1/4 w-24 h-24 rounded-full bg-gradient-to-tr from-green-100 to-green-50 opacity-10"></div>
        </>
      )}
      
      {variant === "features" && (
        <>
          <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 opacity-10"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-gradient-to-bl from-blue-100 to-blue-50 opacity-10"></div>
          <div className="absolute top-1/3 right-1/4 w-32 h-32 rotate-45 rounded-lg bg-gradient-to-tr from-green-100 to-green-50 opacity-10"></div>
          <div className="absolute bottom-1/3 left-1/4 w-20 h-20 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 opacity-10"></div>
        </>
      )}
      
      {variant === "cta" && (
        <>
          <div className="absolute top-0 left-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-purple-100 to-indigo-50 opacity-10"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 opacity-10"></div>
          <div className="absolute top-1/2 right-10 w-32 h-32 rotate-12 rounded-lg bg-gradient-to-tl from-green-100 to-green-50 opacity-10"></div>
        </>
      )}
    </div>
  );
};
