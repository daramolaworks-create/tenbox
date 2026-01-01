import React from 'react';

export const BrandLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex flex-col justify-center ${className}`}>
      <img
        src="/logo.png"
        alt="TENBOX"
        className="h-14 w-auto object-contain"
      />
    </div>
  );
};