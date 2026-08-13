import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface CustomerRegisterPageProps {
  onSuccess?: () => void;
  onOpenAgb?: () => void;
  onSwitchToLogin?: () => void;
  onSwitchToCoachRegister?: () => void;
}

export const CustomerRegisterPage: React.FC<CustomerRegisterPageProps> = ({
  onSuccess,
  onOpenAgb,
  onSwitchToLogin
}) => {
  const { registerCustomer } = useApp();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+41 ');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg('Bitte gib einen Benutzernamen ein.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }

    if (!phone.trim() || phone.trim() === '+41') {
      setErrorMsg('Bitte gib deine Handynummer an.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    if (!ageConfirmed) {
      setErrorMsg('Bitte bestätige, dass du mindestens 18 Jahre alt bist.');
      return;
    }

    if (!agbAccepted) {
      setErrorMsg('Bitte akzeptiere die AGB und Datenschutzerklärung, um fortzufahren.');
      return;
    }

    const res = registerCustomer({
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password
    });

    if (res.success) {
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-6 animate-in fade-in duration-200">
      
      {/* Header card - Blue Gradient Header */}
      <div className="bg-gradient-to-r from-[#1A265A] via-[#2A3B7C] to-[#50A5B1] text-white rounded-t-3xl p-6 sm:p-8 border-b border-[#50A5B1]/30 relative overflow-hidden shadow-md">
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl text-white font-black flex items-center gap-3 tracking-wide">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span>WERDE TEIL VON <span className="whitespace-nowrap">GET A COACH.CH</span></span>
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 font-medium leading-relaxed pt-1">
            Registrierung für Sportler:innen & Kursteilnehmer:innen.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-b-3xl p-6 sm:p-8 border-x border-b border-[#50A5B1]/20 shadow-xl space-y-5">
        
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold animate-in fade-in">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Username */}
        <div className="space-y-1.5">
          <label htmlFor="reg-cust-username" className="font-extrabold text-xs text-[#1A265A] block">
            Benutzername <span className="text-[#F1600D]">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#50A5B1] absolute left-3.5 top-3.5" />
            <input
              id="reg-cust-username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="z.B. Marc23 oder SportyMarc"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED]/50 text-xs font-bold text-[#1A265A] focus:outline-none focus:border-[#F1600D] focus:bg-white"
            />
          </div>
        </div>

        {/* E-Mail Address */}
        <div className="space-y-1.5">
          <label htmlFor="reg-cust-email" className="font-extrabold text-xs text-[#1A265A] block">
            E-Mail-Adresse <span className="text-[#F1600D]">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#50A5B1] absolute left-3.5 top-3.5" />
            <input
              id="reg-cust-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="marc.bieri@swissmail.ch"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED]/50 text-xs font-bold text-[#1A265A] focus:outline-none focus:border-[#F1600D] focus:bg-white"
            />
          </div>
        </div>

        {/* Mobile Phone Number */}
        <div className="space-y-1.5">
          <label htmlFor="reg-cust-phone" className="font-extrabold text-xs text-[#1A265A] block">
            Handynummer (inkl. Vorwahl) <span className="text-[#F1600D]">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-[#50A5B1] absolute left-3.5 top-3.5" />
            <input
              id="reg-cust-phone"
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+41 79 123 45 67"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED]/50 text-xs font-bold text-[#1A265A] focus:outline-none focus:border-[#F1600D] focus:bg-white"
            />
          </div>
          <p className="text-[11px] text-[#1A265A]/70">
            Für SMS-Notfall-Infos bei Terminänderungen.
          </p>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="reg-cust-password" className="font-extrabold text-xs text-[#1A265A] block">
            Passwort <span className="text-[#F1600D]">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#50A5B1] absolute left-3.5 top-3.5" />
            <input
              id="reg-cust-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mindestens 6 Zeichen"
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED]/50 text-xs font-bold text-[#1A265A] focus:outline-none focus:border-[#F1600D] focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mandatory Checkboxes */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          
          {/* Checkbox 1: Mindestalter 18 Jahre */}
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
            <input
              type="checkbox"
              required
              checked={ageConfirmed}
              onChange={e => {
                setAgeConfirmed(e.target.checked);
                if (e.target.checked && agbAccepted) setErrorMsg(null);
              }}
              className="mt-0.5 rounded border-slate-300 text-[#F1600D] focus:ring-[#F1600D] w-4.5 h-4.5 cursor-pointer shrink-0"
            />
            <span className="leading-snug">
              Ich bestätige, dass ich <strong>mindestens 18 Jahre alt</strong> bin. <span className="text-[#F1600D] font-bold">*</span>
            </span>
          </label>

          {/* Checkbox 2: AGB */}
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
            <input
              type="checkbox"
              required
              checked={agbAccepted}
              onChange={e => {
                setAgbAccepted(e.target.checked);
                if (e.target.checked && ageConfirmed) setErrorMsg(null);
              }}
              className="mt-0.5 rounded border-slate-300 text-[#F1600D] focus:ring-[#F1600D] w-4.5 h-4.5 cursor-pointer shrink-0"
            />
            <span className="leading-snug">
              Ich akzeptiere die{' '}
              <button
                type="button"
                onClick={() => {
                  if (onOpenAgb) onOpenAgb();
                  else window.open('/agb', '_blank');
                }}
                className="text-[#F1600D] font-extrabold hover:underline cursor-pointer"
              >
                AGB und die Datenschutzerklärung
              </button>
              . <span className="text-[#F1600D] font-bold">*</span>
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-sm py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Konto erstellen</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Switch to Login / Existing Account */}
        {onSwitchToLogin && (
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Bereits ein Kund:innen-Konto?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#1A265A] font-extrabold hover:underline cursor-pointer"
              >
                Hier Anmelden
              </button>
            </p>
          </div>
        )}

      </form>
    </div>
  );
};
