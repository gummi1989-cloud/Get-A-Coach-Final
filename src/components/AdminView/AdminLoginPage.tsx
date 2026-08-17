import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, ArrowLeft, KeyRound, QrCode, Copy, Check, RefreshCw, X, Smartphone, AlertCircle } from 'lucide-react';
import { Logo } from '../Logo';
import {
  getAdmin2FASecret,
  generateQRCodeDataURL,
  verifyTOTPTokenAsync,
  generateNewTOTPSecret,
  saveAdmin2FASecret,
  getOTPAuthURI
} from '../../utils/totpUtils';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBackToApp: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onBackToApp }) => {
  const { login } = useApp();
  const [username, setUsername] = useState<string>('admin');
  const [totpCode, setTotpCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Setup Modal State
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [setupSecret, setSetupSecret] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [setupTestCode, setSetupTestCode] = useState<string>('');
  const [setupTestSuccess, setSetupTestSuccess] = useState<boolean | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(30);

  // Timer for TOTP 30s cycle
  useEffect(() => {
    const updateCountdown = () => {
      const sec = 30 - (Math.floor(Date.now() / 1000) % 30);
      setSecondsLeft(sec);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize QR Code Modal with active or new secret
  const handleOpenSetupModal = async () => {
    const activeSecret = getAdmin2FASecret();
    setSetupSecret(activeSecret);
    const qrUrl = await generateQRCodeDataURL(activeSecret, username || 'admin');
    setQrCodeDataUrl(qrUrl);
    setSetupTestCode('');
    setSetupTestSuccess(null);
    setShowSetupModal(true);
  };

  const handleGenerateNewSecret = async () => {
    const newSecret = generateNewTOTPSecret();
    setSetupSecret(newSecret);
    const qrUrl = await generateQRCodeDataURL(newSecret, username || 'admin');
    setQrCodeDataUrl(qrUrl);
    setSetupTestCode('');
    setSetupTestSuccess(null);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(setupSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestSetupCode = async () => {
    if (!setupTestCode || setupTestCode.trim().length !== 6) return;
    const isValid = await verifyTOTPTokenAsync(setupTestCode, setupSecret);
    setSetupTestSuccess(isValid);
    if (isValid) {
      saveAdmin2FASecret(setupSecret);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Bitte Benutzername eingeben.');
      return;
    }

    if (!totpCode || totpCode.trim().length !== 6) {
      setError('Bitte den 6-stelligen Authenticator-Code eingeben.');
      return;
    }

    setIsVerifying(true);

    try {
      const activeSecret = getAdmin2FASecret();
      const isValid = await verifyTOTPTokenAsync(totpCode.trim(), activeSecret);

      if (!isValid) {
        setError('Ungültiger oder abgelaufener Authenticator-Code.');
        setIsVerifying(false);
        return;
      }

      // 2FA Verified -> Create Admin Session
      login('admin');
      setIsVerifying(false);
      onSuccess();
    } catch (err) {
      setError('Fehler bei der 2FA-Überprüfung. Bitte versuche es erneut.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-[#50A5B1]/30 space-y-6 relative overflow-hidden">
        
        {/* Top Decorative Gradient Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1A265A] via-[#50A5B1] to-[#F1600D]" />

        <div className="text-center space-y-2 pt-2">
          <div className="mb-2 inline-block">
            <Logo
              className="h-12 w-auto mx-auto object-contain"
              alt="GET A COACH Logo"
            />
          </div>
          <div className="w-12 h-12 bg-[#1A265A] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md border border-[#50A5B1]/30">
            <ShieldCheck className="w-6 h-6 text-[#50A5B1]" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#50A5B1] bg-[#FFFFFF] px-3.5 py-1 rounded-full border border-[#50A5B1]/20 inline-block">
            Passwortloses 2FA TOTP Login
          </span>
          <h1 className="text-2xl font-oswald font-medium uppercase tracking-wide text-[#1A265A]">
            Plattform-Host Admin
          </h1>
          <p className="text-xs text-[#1A265A]/70 max-w-xs mx-auto leading-relaxed">
            Geschützter Systemzugriff mit Google Authenticator 2FA.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-[#1A265A] mb-1">
              Benutzername / Admin E-Mail
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#1A265A] focus:ring-2 focus:ring-[#50A5B1] focus:border-transparent outline-none transition"
              placeholder="admin"
              required
            />
          </div>

          {/* 6-Digit TOTP Code Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-[#1A265A]">
                6-stelliger Authenticator-Code
              </label>
              <span className="text-[10px] font-bold text-[#50A5B1] flex items-center gap-1">
                <span>Code-Wechsel in:</span>
                <span className="bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#50A5B1]/20 text-[#F1600D] font-mono">
                  {secondsLeft}s
                </span>
              </span>
            </div>
            
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={totpCode}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setTotpCode(val);
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#1A265A]/20 text-center text-2xl font-mono tracking-[0.4em] font-extrabold text-[#1A265A] focus:border-[#F1600D] focus:ring-0 outline-none transition bg-[#FFFFFF]/30"
                placeholder="123456"
                autoComplete="one-time-code"
                required
              />
              <Smartphone className="w-5 h-5 text-[#50A5B1] absolute right-3 top-3.5 pointer-events-none opacity-60" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 bg-[#1A265A] hover:bg-[#263773] text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isVerifying ? (
              <RefreshCw className="w-4 h-4 text-[#50A5B1] animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4 text-[#50A5B1]" />
            )}
            <span>{isVerifying ? 'Überprüfe Code...' : 'Mit 2FA-Code einloggen'}</span>
          </button>
        </form>

        {/* QR Code First Time Setup Link */}
        <div className="pt-2 text-center border-t border-slate-100 space-y-3">
          <button
            onClick={handleOpenSetupModal}
            className="w-full py-2.5 px-3 bg-[#FFFFFF] hover:bg-[#fdecdb] text-[#1A265A] border border-[#50A5B1]/30 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4 text-[#F1600D]" />
            <span>Erst-Verknüpfung / QR-Code anzeigen</span>
          </button>

          <button
            onClick={onBackToApp}
            className="text-xs text-[#1A265A]/60 hover:text-[#1A265A] font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Zurück zur Plattform</span>
          </button>
        </div>

      </div>

      {/* QR CODE SETUP MODAL */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#50A5B1]/30 relative space-y-5 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowSetupModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 bg-[#FFFFFF] text-[#F1600D] rounded-2xl flex items-center justify-center mx-auto border border-[#50A5B1]/20">
                <QrCode className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#1A265A]">
                Google Authenticator Einrichten
              </h2>
              <p className="text-xs text-[#1A265A]/70">
                Scanne diesen QR-Code mit deiner <strong>Google Authenticator</strong> App auf deinem Smartphone.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-[#FFFFFF]/50 border border-[#50A5B1]/20 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Google Authenticator QR Code"
                  className="w-48 h-48 rounded-xl shadow-xs border border-slate-200 bg-white p-2"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  Lade QR-Code...
                </div>
              )}

              <div className="w-full text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Manueller Geheimschlüssel (Secret)
                </span>
                <div className="flex items-center justify-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="font-mono text-xs font-bold text-[#1A265A] tracking-wider select-all">
                    {setupSecret}
                  </span>
                  <button
                    onClick={handleCopySecret}
                    className="p-1 text-slate-500 hover:text-[#1A265A] rounded transition cursor-pointer"
                    title="Kopieren"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-step instructions */}
            <div className="text-xs space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-[#1A265A]">
              <p className="font-bold text-[11px] text-[#1A265A]">Anleitung:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
                <li>Öffne die <strong>Google Authenticator</strong> App.</li>
                <li>Tippe auf das <strong>+</strong> Symbol unten rechts.</li>
                <li>Wähle <strong>"QR-Code scannen"</strong> und richte die Kamera auf den QR-Code.</li>
              </ol>
            </div>

            {/* Live Verification Test Box in Setup */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="block text-xs font-bold text-[#1A265A]">
                Code testen & aktivieren
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={setupTestCode}
                  onChange={e => setSetupTestCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-[#1A265A] text-center outline-none focus:border-[#50A5B1]"
                />
                <button
                  onClick={handleTestSetupCode}
                  className="px-4 py-2 bg-[#50A5B1] hover:bg-[#3d8893] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Testen
                </button>
              </div>

              {setupTestSuccess === true && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>2FA erfolgreich verifiziert & gespeichert!</span>
                </div>
              )}
              {setupTestSuccess === false && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold">
                  Code ungültig. Prüfe die Uhrzeit deiner Authenticator App.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleGenerateNewSecret}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Neues Secret erzeugen</span>
              </button>

              <button
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 bg-[#1A265A] hover:bg-[#263773] text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Schliessen
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
