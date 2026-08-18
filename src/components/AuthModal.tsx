import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { X, User as UserIcon, Zap, ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck, LogIn, ArrowLeft } from 'lucide-react';
import { CustomerRegisterPage } from './CustomerRegisterPage';
import { CoachRegisterPage } from './CoachRegisterPage';
import { Logo } from './Logo';

interface AuthModalProps {
  onClose: () => void;
  onOpenAgb?: () => void;
  onSuccessRole?: (role: UserRole) => void;
  initialMode?: 'login' | 'register_customer' | 'register_coach';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onOpenAgb,
  onSuccessRole,
  initialMode = 'login'
}) => {
  const { login, acceptAgb, acceptCoachTaxDeclaration, authNotice, clearAuthNotice } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'register_customer' | 'register_coach'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('kunde');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleClose = () => {
    clearAuthNotice();
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Bitte gib deine E-Mail-Adresse und dein Passwort ein.');
      return;
    }
    setLoginError(null);
    const res = login(selectedRole, loginEmail.trim(), loginPassword);
    if (res && !res.success) {
      setLoginError(res.message || 'Anmeldung fehlgeschlagen.');
      return;
    }
    acceptAgb("1.0");
    if (selectedRole === 'coach') {
      acceptCoachTaxDeclaration();
    }
    if (onSuccessRole) {
      onSuccessRole(selectedRole);
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-0 sm:my-6 max-h-[92vh] sm:max-h-[88vh] flex flex-col">
        
        {/* Header - Optimized for mobile tap targets */}
        <div className="shrink-0 bg-[#1A265A] text-white p-4 sm:p-6 flex items-center justify-between border-b border-[#50A5B1]/30">
          <div className="flex items-center gap-3">
            {activeTab !== 'login' && (
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                aria-label="Zurück zum Login"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition flex items-center justify-center cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="mb-1 bg-white/95 p-1 rounded-lg inline-block">
                <Logo
                  className="h-8 sm:h-10 w-auto object-contain"
                  alt="GET A COACH Logo"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {activeTab === 'login' && 'Anmelden'}
                {activeTab === 'register_customer' && 'Kund:innen-Registrierung'}
                {activeTab === 'register_coach' && 'Coach-Registrierung'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Schliessen"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-slate-200 hover:text-white transition flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notice Banner if triggered from gated action */}
        {authNotice && (
          <div className="shrink-0 bg-[#FFFFFF] border-b border-[#F1600D]/30 p-3.5 sm:p-4 flex items-start gap-3 text-xs font-bold text-[#1A265A]">
            <Lock className="w-5 h-5 text-[#F1600D] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[#F1600D] uppercase font-black text-[10px] block">Anmeldung erforderlich</span>
              <p className="leading-snug">{authNotice}</p>
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
              
              {/* Role Selection Segmented Control */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('kunde')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-center gap-2.5 ${
                      selectedRole === 'kunde'
                        ? 'border-[#50A5B1] bg-gradient-to-r from-[#1A265A] via-[#2A3B7C] to-[#50A5B1] text-white shadow-md'
                        : 'border-[#50A5B1]/30 text-[#1A265A] bg-sky-50/60 hover:bg-sky-100/70 active:bg-sky-200/70'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      selectedRole === 'kunde' ? 'bg-white/20 border border-white/40' : 'bg-[#50A5B1]/20 border border-[#50A5B1]/30'
                    }`}>
                      <UserIcon className={`w-4 h-4 ${selectedRole === 'kunde' ? 'text-white' : 'text-[#1A265A]'}`} />
                    </div>
                    <span className="font-extrabold text-sm">Kund:in</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('coach')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-center gap-2.5 ${
                      selectedRole === 'coach'
                        ? 'border-[#F1600D] bg-gradient-to-r from-[#F1600D] via-orange-500 to-[#d85208] text-white shadow-md'
                        : 'border-orange-200 text-orange-950 bg-orange-50/50 hover:bg-orange-100/60 active:bg-orange-200/60'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      selectedRole === 'coach' ? 'bg-white/20 border border-white/40' : 'bg-orange-600/20 border border-orange-600/30'
                    }`}>
                      <Zap className={`w-4 h-4 ${selectedRole === 'coach' ? 'text-white' : 'text-[#F1600D]'}`} />
                    </div>
                    <span className="font-extrabold text-sm">Coach</span>
                  </button>
                </div>

                {/* Registration Buttons integrated directly underneath the two role boxes */}
                <div className="pt-1 grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register_customer')}
                    className="w-full py-2.5 px-2 rounded-xl border border-[#50A5B1]/40 bg-gradient-to-r from-[#1A265A] via-[#2A3B7C] to-[#50A5B1] text-white hover:opacity-90 active:opacity-100 font-extrabold text-[11px] sm:text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                      <UserIcon className="w-3 h-3 text-white" />
                    </div>
                    <span>Kund:innen-Registrierung</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('register_coach')}
                    className="w-full py-2.5 px-2 rounded-xl border border-[#F1600D]/30 bg-orange-50 hover:bg-orange-100 active:bg-orange-200 text-[#d85208] font-extrabold text-[11px] sm:text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#F1600D] flex items-center justify-center shrink-0">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <span>Coach-Registrierung</span>
                  </button>
                </div>
              </div>

              {/* Login Credentials Inputs */}
              <div className="space-y-3">
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-1">
                  <label htmlFor="login-email-input" className="font-extrabold text-[11px] sm:text-xs text-[#1A265A] block">
                    E-Mail-Adresse
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#50A5B1] absolute left-3.5 top-3.5" />
                    <input
                      id="login-email-input"
                      type="email"
                      autoComplete="username"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="deine.email@beispiel.ch"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#50A5B1]/30 bg-[#FFFFFF]/40 text-xs sm:text-sm font-bold text-[#1A265A] focus:outline-none focus:border-[#F1600D] focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password-input" className="font-extrabold text-[11px] sm:text-xs text-[#1A265A] block">
                      Passwort
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Passwort-Zurücksetzen: Link wird an deine E-Mail gesendet.')}
                      className="text-[10px] font-bold text-[#50A5B1] hover:text-[#1A265A] underline cursor-pointer"
                    >
                      Vergessen?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#50A5B1] absolute left-3.5 top-3.5" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="Dein Passwort"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#50A5B1]/30 bg-[#FFFFFF]/40 text-xs sm:text-sm font-bold text-[#1A265A] focus:outline-none focus:border-[#F1600D] focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full min-h-[48px] bg-[#F1600D] hover:bg-[#d85208] active:bg-[#b84204] text-white font-black text-sm py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Anmelden</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Info Note: Checkboxes collected during registration */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#50A5B1]" />
                  <span>AGB & Datenschutzerklärung wurden bei der Registrierung akzeptiert.</span>
                </p>
              </div>

            </form>
          )}

          {/* TAB 2: CUSTOMER REGISTRATION */}
          {activeTab === 'register_customer' && (
            <CustomerRegisterPage
              onSuccess={() => {
                if (onSuccessRole) onSuccessRole('kunde');
                handleClose();
              }}
              onOpenAgb={() => {
                handleClose();
                if (onOpenAgb) onOpenAgb();
              }}
              onSwitchToLogin={() => setActiveTab('login')}
              onSwitchToCoachRegister={() => setActiveTab('register_coach')}
            />
          )}

          {/* TAB 3: COACH REGISTRATION STAGE 1 */}
          {activeTab === 'register_coach' && (
            <CoachRegisterPage
              onSuccess={() => {
                if (onSuccessRole) onSuccessRole('coach');
                handleClose();
              }}
              onOpenAgb={() => {
                handleClose();
                if (onOpenAgb) onOpenAgb();
              }}
              onSwitchToLogin={() => setActiveTab('login')}
              onSwitchToCustomerRegister={() => setActiveTab('register_customer')}
            />
          )}

        </div>

      </div>
    </div>
  );
};
