import React from 'react';

interface VapeLogoProps {
  className?: string;
  height?: number | string;
  showText?: boolean;
}

export const VapeLogo: React.FC<VapeLogoProps> = ({ className = '', height = 28 }) => {
  return (
    <div className={`inline-flex items-center shrink-0 ${className}`}>
      <img
        src="/vape-logo.svg"
        alt="VAPE"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        className="w-auto object-contain brightness-105 drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]"
      />
    </div>
  );
};

export default VapeLogo;
