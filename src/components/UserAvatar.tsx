import React, { useState, useRef } from 'react';
import { Camera, Trash2, Upload, User, Check, Zap } from 'lucide-react';

export interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'custom';
  className?: string;
  shape?: 'circle' | 'rounded';
  bordered?: boolean;
  borderColor?: string;
  role?: 'kunde' | 'coach' | 'admin';
  editable?: boolean;
  onImageChange?: (dataUrl: string) => void;
  onImageRemove?: () => void;
  isVerified?: boolean;
  alt?: string;
  title?: string;
}

// Deterministic aesthetic color generator based on name/initial
const getInitialColorTheme = (name: string, role?: 'kunde' | 'coach' | 'admin') => {
  if (role === 'admin') {
    return 'bg-gradient-to-br from-[#1A265A] via-[#2A3B7C] to-[#50A5B1] text-white';
  }

  const cleanName = (name || '').trim().toUpperCase();
  const charCode = cleanName.charCodeAt(0) || 65;

  const themes = [
    'bg-gradient-to-br from-[#1A265A] to-[#50A5B1] text-white', // Navy-Teal
    'bg-gradient-to-br from-[#1A265A] via-[#263773] to-[#F1600D] text-white', // Navy-Orange
    'bg-gradient-to-br from-[#0e7490] to-[#50A5B1] text-white', // Cyan-Teal
    'bg-gradient-to-br from-[#1e293b] to-[#475569] text-white', // Slate
    'bg-gradient-to-br from-[#1A265A] to-[#3b82f6] text-white', // Royal Blue
    'bg-gradient-to-br from-[#0f766e] to-[#14b8a6] text-white', // Emerald-Teal
    'bg-gradient-to-br from-[#4338ca] to-[#6366f1] text-white', // Indigo
    'bg-gradient-to-br from-[#c2410c] to-[#F1600D] text-white'  // Warm Orange
  ];

  return themes[charCode % themes.length];
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = '',
  size = 'md',
  className = '',
  shape = 'circle',
  bordered = false,
  borderColor = 'border-white',
  role,
  editable = false,
  onImageChange,
  onImageRemove,
  isVerified = false,
  alt,
  title
}) => {
  const [imageError, setImageError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Extract initial letter: First non-whitespace character in uppercase
  const trimmedName = (name || '').trim();
  const initialLetter = trimmedName ? trimmedName.charAt(0).toUpperCase() : (role === 'coach' ? 'C' : 'K');

  // Check if we have a valid image source that hasn't errored
  const hasValidImage = Boolean(src && src.trim() !== '' && !imageError);

  // Size mapping presets
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-24 h-24 text-3xl',
    '3xl': 'w-32 h-32 text-4xl',
    custom: ''
  };

  const currentSizeClass = size === 'custom' ? '' : sizeClasses[size] || sizeClasses.md;
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const borderClass = bordered ? `border-2 ${borderColor}` : '';
  const colorTheme = getInitialColorTheme(trimmedName, role);

  // Helper to resize and compress user-uploaded image for optimal web performance
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Bitte wähle eine gültige Bilddatei (JPG, PNG, WebP) aus.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 480;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setImageError(false);
          if (onImageChange) {
            onImageChange(dataUrl);
          }
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        alert('Das Bild konnte nicht geladen werden.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset file input value so same file can be re-uploaded if desired
    e.target.value = '';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageError(false);
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`} title={title || name}>
      {/* Hidden file input when editable */}
      {editable && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          aria-label="Profilbild hochladen"
        />
      )}

      {/* Main Avatar Container */}
      <div
        onClick={editable ? () => fileInputRef.current?.click() : undefined}
        className={`relative ${currentSizeClass} ${shapeClass} ${borderClass} overflow-hidden flex items-center justify-center select-none shadow-xs transition-all ${
          editable ? 'cursor-pointer group hover:ring-2 hover:ring-[#50A5B1]' : ''
        }`}
      >
        {hasValidImage ? (
          <img
            src={src || ''}
            alt={alt || name || 'Profilbild'}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover ${shapeClass}`}
          />
        ) : (
          /* Initial letter in circular container */
          <div
            className={`w-full h-full ${shapeClass} ${colorTheme} flex items-center justify-center font-oswald font-extrabold uppercase tracking-wider`}
          >
            <span>{initialLetter}</span>
          </div>
        )}

        {/* Hover Camera Overlay if editable */}
        {editable && (
          <div className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-2xs">
            <Camera className="w-4 h-4 text-white drop-shadow-md" />
            <span className="text-[8px] font-bold mt-0.5 tracking-tight uppercase">Ändern</span>
          </div>
        )}
      </div>

      {/* Verification Badge */}
      {isVerified && (
        <span
          className="absolute -bottom-1 -right-1 bg-[#F1600D] text-white p-0.5 sm:p-1 rounded-full shadow-xs border-2 border-white flex items-center justify-center"
          title="Verifiziert"
        >
          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
        </span>
      )}

      {/* Quick Remove Image Button if editable and has image */}
      {editable && hasValidImage && onImageRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md border border-white transition cursor-pointer"
          title="Bild entfernen (Anfangsbuchstabe anzeigen)"
          aria-label="Profilbild löschen"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
};
