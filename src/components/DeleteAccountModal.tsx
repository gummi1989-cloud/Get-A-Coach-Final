import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Trash2, X, ShieldAlert, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, deleteUserAccount } = useApp();
  const [confirmationInput, setConfirmationInput] = useState('');
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prevent background scrolling while modal is active
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCoach = currentUser.role === 'coach';
  const requiredConfirmationText = 'LÖSCHEN';
  const isInputValid = confirmationInput.trim().toUpperCase() === requiredConfirmationText;
  const canConfirm = isInputValid && hasAcknowledged && !isDeleting;

  const handleDelete = async () => {
    if (!canConfirm) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await deleteUserAccount();
      if (res.success) {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setErrorMessage(res.message);
        setIsDeleting(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Fehler beim Löschen des Kontos. Bitte versuche es erneut.');
      setIsDeleting(false);
    }
  };

  const modalElement = (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-red-200 overflow-hidden my-auto flex flex-col animate-in zoom-in-95 duration-200 relative z-10"
        role="dialog"
        aria-modal="true"
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-800 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-wide text-white">
                Konto endgültig löschen
              </h3>
              <p className="text-xs text-red-100 font-medium">
                Unwiderrufliche Datenlöschung aus dem System
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Schliessen"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Red Alert Box */}
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-2">
            <div className="flex items-center gap-2 text-red-700 font-black text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Achtung: Diese Aktion kann nicht rückgängig gemacht werden!</span>
            </div>
            <p className="text-xs leading-relaxed text-red-800">
              Wenn du dein Konto löschst, werden <strong>sämtliche Daten, Einträge und Verknüpfungen von dir dauerhaft und unwiederbringlich aus dem gesamten System gelöscht</strong>.
            </p>
          </div>

          {/* List of deleted items based on role */}
          <div className="space-y-2 text-xs text-[#1A265A]">
            <h4 className="font-extrabold text-[#1A265A] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              Folgende Daten werden restlos gelöscht:
            </h4>
            
            <ul className="space-y-1.5 pl-2 text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {isCoach ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Dein komplettes Coach-Profil, Slogan, Biografie, Auszeichnungen & Zertifikate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Alle angebotenen Trainings-Slots, Termine und Gruppenlektionen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Alle Buchungshistorien, Kundenanfragen & Abrechnungsdaten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Sämtliche Chat-Verläufe, Nachrichten & versendete Angebote</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Deine hinterlegten Kalender- und Arbeitszeit-Einstellungen</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Dein Benutzerprofil, Name, E-Mail & Telefonnummer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Alle gebuchten Lektionen, Terminhistorien & Quittungen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Alle gestellten Spezial- und Preisanfragen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Sämtliche Chat-Verläufe & Nachrichten mit Coaches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Alle aktiven Abos, Wertgutscheine & Favoritenlisten</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-100 border border-red-300 text-red-800 text-xs font-bold">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Explicit Confirmation Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-2xl border border-red-200 bg-red-50/40 hover:bg-red-50 cursor-pointer transition select-none">
            <input
              type="checkbox"
              checked={hasAcknowledged}
              onChange={(e) => setHasAcknowledged(e.target.checked)}
              disabled={isDeleting}
              className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer"
            />
            <span className="text-xs font-bold text-[#1A265A] leading-snug">
              Ich verstehe und bestätige ausdrücklich, dass mein Account und alle meine Daten nach diesem Schritt dauerhaft unwiderruflich gelöscht sind.
            </span>
          </label>

          {/* Typing confirmation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[#1A265A]">
              Tippe zur Bestätigung <span className="font-mono bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-black tracking-widest">LÖSCHEN</span> ein:
            </label>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="LÖSCHEN"
              disabled={isDeleting}
              className="w-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border border-red-300 focus:border-red-600 focus:outline-none bg-slate-50 focus:bg-white text-red-900"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer disabled:opacity-50"
          >
            Abbrechen / Konto behalten
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canConfirm}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow-sm ${
              canConfirm
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Konto wird gelöscht...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ja, Konto dauerhaft löschen</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalElement, document.body);
};
