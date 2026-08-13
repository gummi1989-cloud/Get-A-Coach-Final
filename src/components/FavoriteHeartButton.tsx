import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart } from 'lucide-react';

interface FavoriteHeartButtonProps {
  coachId: string;
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'minimal';
}

export const FavoriteHeartButton: React.FC<FavoriteHeartButtonProps> = ({
  coachId,
  size = 18,
  className = '',
  showText = false,
  variant = 'light'
}) => {
  const { isFavoriteCoach, toggleFavoriteCoach, isAuthenticated, openAuthModalWithNotice } = useApp();
  const active = isFavoriteCoach(coachId);

  // Variant styling
  const getStyle = () => {
    if (variant === 'dark') {
      return active
        ? 'bg-[#F1600D] text-white border border-[#F1600D] hover:bg-[#d85208] shadow-sm'
        : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 backdrop-blur-xs';
    }

    if (variant === 'minimal') {
      return active
        ? 'text-[#F1600D] hover:scale-110'
        : 'text-[#1A265A]/40 hover:text-[#F1600D] hover:scale-110';
    }

    // Default 'light'
    return active
      ? 'bg-[#FEF6ED] text-[#F1600D] border border-[#F1600D]/40 hover:bg-[#F1600D]/10 shadow-2xs'
      : 'bg-white/90 hover:bg-[#FEF6ED] text-slate-400 hover:text-[#F1600D] border border-slate-200/80 hover:border-[#F1600D]/40 shadow-2xs';
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
          openAuthModalWithNotice("Bitte melde dich an oder registriere dich, um Lieblings-Coaches zu speichern.");
          return;
        }
        toggleFavoriteCoach(coachId);
      }}
      title={active ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      className={`group flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
        variant !== 'minimal' ? 'p-2 rounded-full' : 'p-1'
      } ${getStyle()} ${className}`}
    >
      <Heart
        size={size}
        className={`transition-all duration-200 shrink-0 ${
          active
            ? variant === 'dark'
              ? 'fill-white text-white scale-105'
              : 'fill-[#F1600D] text-[#F1600D] scale-105'
            : 'group-hover:scale-115'
        }`}
      />
      {showText && (
        <span className={`text-xs font-extrabold pr-0.5 ${
          variant === 'dark' ? 'text-white' : 'text-[#1A265A]'
        }`}>
          {active ? 'Favorit' : 'Merken'}
        </span>
      )}
    </button>
  );
};

