import React from 'react';

interface VapeLogoProps {
  className?: string;
  height?: number | string;
  showText?: boolean;
}

export const VapeLogo: React.FC<VapeLogoProps> = ({ className = '', height = 28 }) => {
  return (
    <div className={`inline-flex items-center shrink-0 pointer-events-none select-none ${className}`}>
      <img
        src="/vape-logo.svg"
        alt="VAPE"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        className="w-auto object-contain brightness-105 pointer-events-none select-none"
      />
    </div>
  );
};

export default VapeLogo;
