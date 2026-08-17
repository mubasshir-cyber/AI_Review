import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface BusinessLogoOrIconProps {
  logoUrl?: string;
  name?: string;
  className?: string;
  iconClassName?: string;
}

export const BusinessLogoOrIcon: React.FC<BusinessLogoOrIconProps> = ({
  logoUrl,
  name,
  className = "w-12 h-12 bg-[#EEF2F7] text-[#2563EB] border border-[#DCE3EC] rounded-2xl flex items-center justify-center font-extrabold shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),2px_2px_6px_rgba(100,116,139,0.08)]",
  iconClassName = "w-6 h-6 text-[#2563EB]",
}) => {
  const [imageError, setImageError] = useState(false);

  if (logoUrl && logoUrl.trim() !== '' && !imageError) {
    return (
      <img
        src={logoUrl}
        alt={name || 'Business'}
        onError={() => setImageError(true)}
        className={`${className} object-contain`}
      />
    );
  }

  return (
    <div className={className}>
      <Building2 className={iconClassName} />
    </div>
  );
};
