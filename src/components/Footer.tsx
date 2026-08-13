import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  onSelectTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-[#1A265A] text-[#FEF6ED] mt-16 border-t border-[#50A5B1]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img
                src="/getacoachlogo.png"
                alt="GET A COACH Logo"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain rounded-md"
              />
            </div>
            <p className="text-xs text-[#FEF6ED]/80 leading-relaxed">
              GET A COACH.ch ist die Schweizer Plattform für Sport- & Fitness-Coaching. Verbindet Athlet:innen mit verifizierten Coaches für Padel, Surfen, Tennis, Yoga & Fitness, Skitouren und vieles mehr.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="bg-white/10 text-[#50A5B1] font-medium text-[10px] px-2.5 py-1 rounded-full border border-white/15 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#50A5B1]" /> 100% Verifizierte Coaches
              </span>
            </div>
          </div>

          {/* Payment badges */}
          <div className="space-y-3 text-xs">
            <h4 className="text-[#50A5B1] text-base font-oswald font-medium">
              Bargeldlose Zahlung
            </h4>
            <p className="text-[#FEF6ED]/80">Sichere Abrechnung in CHF:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="bg-white/10 text-[#50A5B1] font-semibold text-xs px-3 py-1.5 rounded-lg border border-white/15">
                TWINT
              </span>
              <span className="bg-white/10 text-white font-medium text-xs px-3 py-1.5 rounded-lg border border-white/15">
                Visa / Mastercard
              </span>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-center text-xs text-[#FEF6ED]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © 2026 GET A COACH.ch · Alle Rechte vorbehalten
          </div>
          <div className="flex items-center gap-4 text-[#FEF6ED]/80">
            {onSelectTab && (
              <>
                <button onClick={() => onSelectTab('coach_pricing')} className="hover:text-white cursor-pointer">Preise & Gebühren</button>
                <button onClick={() => onSelectTab('agb')} className="hover:text-white font-bold text-[#F1600D] cursor-pointer">AGB</button>
                <button onClick={() => onSelectTab('impressum')} className="hover:text-white cursor-pointer">Impressum</button>
                <button
                  onClick={() => {
                    onSelectTab('admin_login');
                    window.history.pushState(null, '', '/admin/login');
                  }}
                  className="text-white/40 hover:text-white text-[11px] flex items-center gap-1 transition cursor-pointer border-l border-white/10 pl-3 ml-1"
                  title="Plattform Host / Admin Login"
                >
                  <Lock className="w-3 h-3 text-[#50A5B1]" />
                  <span>Host-Login</span>
                </button>
              </>
            )}
            {!onSelectTab && (
              <>
                <a href="#agb" className="hover:text-white font-bold text-[#F1600D]">AGB</a>
                <a href="#impressum" className="hover:text-white">Impressum</a>
              </>
            )}
            <a href="#" className="hover:text-white">Datenschutz</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
