import React from 'react';

export const Badge = ({ children, variant = 'teal', className = '' }) => {
  const variants = {
    teal: 'bg-[#65AFB0]/20 text-[#407778] border-[#65AFB0]/30',
    peach: 'bg-[#F7E1C9] text-[#407778] border-[#D9C5B2]',
    primary: 'bg-[#407778] text-white border-transparent',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
        variants[variant] || variants.teal
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
