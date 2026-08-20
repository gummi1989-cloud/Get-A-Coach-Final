import React from 'react';

export const TwintBadgeIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 44 }) => {
  return (
    <img
      src="/twint_logo.png"
      alt="TWINT"
      style={{ width: size, height: size }}
      className={`rounded-xl object-contain shrink-0 shadow-xs ${className}`}
    />
  );
};

export const TwintLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/twint_logo.png"
        alt="TWINT"
        className="h-6 w-auto object-contain rounded-md"
      />
      <span className="text-sm font-black tracking-wider text-[#1A265A]">TWINT</span>
    </div>
  );
};
