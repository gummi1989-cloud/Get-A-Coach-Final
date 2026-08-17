import React, { useState } from 'react';
import { SessionSlot } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  CreditCard,
  QrCode,
  Smartphone,
  CheckCircle2,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Zap,
  ArrowRight,
  FileText
} from 'lucide-react';

interface BookingModalProps {
  session: SessionSlot;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
  onOpenAgb?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ session, onClose, onSuccess, onOpenAgb }) => {
  const { bookSession, acceptAgb } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'TWINT' | 'Kreditkarte'>('TWINT');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const finalPrice = session.price;

  const handleConfirmBooking = () => {
    // Auto-record AGB acceptance on booking confirmation
    acceptAgb("1.0");

    setIsProcessing(true);

    setTimeout(() => {
      const res = bookSession(session, paymentMethod);
      setIsProcessing(false);

      if (res.success && res.bookingId) {
        onSuccess(res.bookingId);
      } else {
        alert(res.message);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#1A265A] text-white p-5 sm:p-6 flex items-center justify-between">
          <div>
            <span className="text-[#F1600D] font-extrabold text-[11px] uppercase tracking-wider block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Anfrage-basiertes Buchungssystem
            </span>
            <h3 className="text-xl font-oswald text-white uppercase tracking-wide">Buchungsanfrage Senden</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1A265A]/80 hover:bg-[#50A5B1]/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Hour Lock Info Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start gap-2 text-xs text-amber-900">
          <Clock className="w-4 h-4 text-[#F1600D] shrink-0 mt-0.5" />
          <div>
            <strong className="font-extrabold text-[#F1600D]">2-Stunden-Sperre & Reservierung:</strong>
            <span className="block mt-0.5 text-[11px] leading-snug">
              Sobald du die Anfrage absendest, wird dieser Slot für <strong>2 Stunden exklusiv für dich reserviert</strong> und ist für andere gesperrt. Der Coach hat genau 2h Zeit zu bestätigen.
            </span>
          </div>
        </div>

        {/* Booking Summary Box */}
        <div className="p-5 bg-slate-50 border-b border-[#50A5B1]/20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="bg-[#F1600D]/15 text-[#F1600D] font-semibold text-[10px] px-2 py-0.5 rounded">
                {session.sport}
              </span>
              <h4 className="font-extrabold text-[#1A265A] text-sm mt-1">{session.title}</h4>
              <p className="text-xs text-[#1A265A]/80 mt-0.5">Coach: <strong className="text-[#1A265A]">{session.coachName}</strong></p>
            </div>
            <img
              src={session.coachAvatar}
              alt={session.coachName}
              className="w-12 h-12 rounded-xl object-cover border border-[#50A5B1]/30 shrink-0"
            />
          </div>

          {/* Optional PDF Attachment in Session */}
          {session.pdfAttachment && (
            <div className="mt-2.5 p-2 bg-white rounded-xl border border-[#50A5B1]/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#1A265A]">
                <FileText className="w-4 h-4 text-[#F1600D]" />
                <div>
                  <div className="font-bold text-[11px]">{session.pdfAttachment.name}</div>
                  <div className="text-[9px] text-[#1A265A]/60">PDF-Material vom Coach inkludiert</div>
                </div>
              </div>
              <a
                href={session.pdfAttachment.url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-[#F1600D] hover:underline"
              >
                Vorschau
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#50A5B1]/20 text-xs text-[#1A265A]/70">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#50A5B1]" />
              <span>{session.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#50A5B1]" />
              <span>{session.startTime} - {session.endTime} Uhr</span>
            </div>
            <div className="col-span-2 flex items-center gap-1.5 truncate text-[#1A265A]/60">
              <MapPin className="w-3.5 h-3.5 text-[#50A5B1] shrink-0" />
              <span className="truncate">{session.locationName}</span>
            </div>
          </div>
        </div>

        {/* Payment Options Selection */}
        <div className="p-5 space-y-4 bg-white">
          <label className="font-bold text-xs text-[#1A265A] block">Wähle deine Zahlungsart:</label>

          <div className="grid grid-cols-2 gap-2.5">
            {/* TWINT */}
            <button
              onClick={() => setPaymentMethod('TWINT')}
              className={`p-3 rounded-2xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
                paymentMethod === 'TWINT'
                  ? 'border-[#50A5B1] bg-[#50A5B1]/10 text-[#1A265A] font-bold'
                  : 'border-[#50A5B1]/20 hover:border-[#50A5B1]/40 text-[#1A265A]/70'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#1A265A] text-[#50A5B1] font-black text-xs flex items-center justify-center shrink-0">
                TWINT
              </div>
              <div>
                <div className="text-xs font-bold">TWINT</div>
                <div className="text-[10px] text-[#1A265A]/60">Direkt via App</div>
              </div>
            </button>

            {/* Kreditkarte */}
            <button
              onClick={() => setPaymentMethod('Kreditkarte')}
              className={`p-3 rounded-2xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
                paymentMethod === 'Kreditkarte'
                  ? 'border-[#F1600D] bg-[#F1600D]/10 text-[#1A265A] font-bold'
                  : 'border-[#50A5B1]/20 hover:border-[#50A5B1]/40 text-[#1A265A]/70'
              }`}
            >
              <CreditCard className="w-8 h-8 text-[#1A265A] shrink-0" />
              <div>
                <div className="text-xs font-bold">Kreditkarte</div>
                <div className="text-[10px] text-[#1A265A]/60">Visa / Mastercard</div>
              </div>
            </button>
          </div>

          {/* TWINT QR Preview Simulation */}
          {paymentMethod === 'TWINT' && (
            <div className="bg-slate-50 border border-[#50A5B1]/30 rounded-2xl p-3.5 flex items-center gap-3">
              <QrCode className="w-12 h-12 text-[#1A265A] shrink-0 bg-white p-1 rounded-lg border border-[#50A5B1]/30" />
              <div className="text-xs text-[#1A265A]">
                <span className="font-extrabold block">TWINT QR-Code Zahlung:</span>
                Die TWINT App öffnet sich nach Klick auf "Jetzt Bezahlen".
              </div>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="bg-[#1A265A] text-white rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-white/80">
              <span>Lektionspreis ({session.type === 'einzel' ? 'Einzel' : 'Gruppe'}):</span>
              <span className="font-bold text-white">CHF {session.price}.–</span>
            </div>
            <div className="flex justify-between text-white/60 text-[10px]">
              <span>Zahlungs- & Servicegebühren (TWINT/Kreditkarte):</span>
              <span className="text-emerald-400 font-extrabold">CHF 0.00 (Inklusive)</span>
            </div>
            <div className="flex justify-between text-white/60 text-[10px]">
              <span>MwSt. (8.1% Schweizer MwSt. inkl.):</span>
              <span>Inbegriffen</span>
            </div>
            <div className="pt-2 border-t border-[#50A5B1]/20 flex justify-between text-base font-black text-white">
              <span>Gesamttotal:</span>
              <span className="text-[#F1600D]">CHF {finalPrice}.–</span>
            </div>

            {/* Zero-Fee Guarantee Badge for Customer */}
            <div className="bg-emerald-500/15 border border-emerald-400/30 p-2.5 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>0 CHF Zusatzgebühren:</strong> Für dich fallen keinerlei Buchungs- oder Zahlungsgebühren an. Du zahlst exakt den angegebenen Preis!
              </span>
            </div>
          </div>

          {/* Checkout AGB Agreement Notice */}
          <div className="text-center text-[11px] text-[#1A265A]/80 font-medium px-2 py-1">
            Mit dem Klick auf 'Jetzt buchen' akzeptierst du die{' '}
            <button
              type="button"
              onClick={() => {
                if (onOpenAgb) onOpenAgb();
              }}
              className="text-[#F1600D] font-bold hover:underline cursor-pointer"
            >
              AGB von GET A COACH
            </button>.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-[#50A5B1]/20 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-[#1A265A]/70 hover:text-[#1A265A] px-3 py-2 rounded-xl transition"
          >
            Abbrechen
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirmBooking}
            className="bg-[#F1600D] hover:bg-[#d85208] text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Sende Anfrage an Coach...</span>
            ) : (
              <>
                <span>Anfrage Senden (CHF {finalPrice}.–)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
