import React from 'react';
import { Booking } from '../../types';
import { X, Printer, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

interface ReceiptModalProps {
  booking: Booking;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ booking, onClose }) => {
  const mwstAmount = (booking.pricePaid * 0.081).toFixed(2);
  const netAmount = (booking.pricePaid - parseFloat(mwstAmount)).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 print:shadow-none print:border-none print:m-0 print:w-full">
        
        {/* Print Header Action */}
        <div className="bg-[#1A265A] text-white p-4 px-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <h3 className="text-sm text-white">Offizielle Buchungsquittung</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#F1600D] hover:bg-[#d85208] text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Drucken / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#50A5B1]/20 text-[#FEF6ED]/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Document Body */}
        <div className="p-8 space-y-6 text-[#1A265A] font-sans print:p-0">
          
          {/* Header & Logo */}
          <div className="flex items-start justify-between border-b border-[#50A5B1]/20 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img
                  src="/getacoachlogo.png"
                  alt="GET A COACH Logo"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-[#1A265A]/70 font-medium mt-0.5">
                GET A COACH AG · Zürich, Schweiz
              </p>
              <p className="text-[11px] text-[#1A265A]/50">MwSt.-Nr: CHE-382.910.441 MWST</p>
            </div>

            <div className="text-right">
              <span className="bg-[#50A5B1]/20 text-[#50A5B1] font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider block mb-1">
                Zahlung Bestätigt
              </span>
              <div className="text-xs text-[#1A265A]/60">Quittungs-Nr:</div>
              <div className="text-xs font-black text-[#1A265A] font-mono">
                {booking.twintRefId || `CH-REC-${booking.id.toUpperCase()}`}
              </div>
              <div className="text-[10px] text-[#1A265A]/50 mt-0.5">
                Datum: {new Date(booking.bookingDate).toLocaleDateString('de-CH')}
              </div>
            </div>
          </div>

          {/* Client & Coach Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs p-4 bg-[#FEF6ED] rounded-2xl border border-[#50A5B1]/20">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#1A265A]/60 block mb-1">Kund:in / Rechnungsempfänger:in:</span>
              <div className="font-extrabold text-[#1A265A]">{booking.userName}</div>
              <div className="text-[#1A265A]/80">{booking.userEmail}</div>
              <div className="text-[#1A265A]/60">{booking.userPhone}</div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#1A265A]/60 block mb-1">Coach & Veranstaltungsort:</span>
              <div className="font-extrabold text-[#1A265A] flex items-center gap-1">
                {booking.coachName}
                <span title="Verifiziert">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </span>
              </div>
              <div className="text-[#1A265A]/80 truncate">{booking.locationName}</div>
              <div className="text-[#1A265A]/60 font-semibold">Kanton {booking.canton}</div>
            </div>
          </div>

          {/* Line Item Table */}
          <div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-[#1A265A] text-[#1A265A] font-black uppercase text-[10px] tracking-wider">
                  <th className="py-2">Leistung / Sportart</th>
                  <th className="py-2">Datum & Zeit</th>
                  <th className="py-2 text-right">Betrag (CHF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#50A5B1]/10">
                <tr>
                  <td className="py-3 font-bold text-[#1A265A]">
                    {booking.sessionTitle}
                    <span className="block text-[11px] font-semibold text-[#F1600D]">{booking.sport}</span>
                  </td>
                  <td className="py-3 font-semibold text-[#1A265A]/80">
                    {booking.date}
                    <span className="block text-[11px] text-[#1A265A]/60">{booking.time} Uhr</span>
                  </td>
                  <td className="py-3 text-right font-extrabold text-[#1A265A]">
                    CHF {booking.pricePaid.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* MwSt & Total Calculation */}
          <div className="pt-4 border-t border-[#50A5B1]/20 space-y-1.5 text-xs text-right">
            <div className="flex justify-between text-[#1A265A]/70">
              <span>Nettobetrag:</span>
              <span>CHF {netAmount}</span>
            </div>
            <div className="flex justify-between text-[#1A265A]/70">
              <span>Schweizer MwSt. (8.1%):</span>
              <span>CHF {mwstAmount}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Plattform- & Zahlungsgebühr (TWINT/Kreditkarte):</span>
              <span>CHF 0.00 (Kostenfrei)</span>
            </div>
            <div className="flex justify-between text-base font-black text-[#1A265A] pt-2 border-t border-[#50A5B1]/20">
              <span>Bezahlter Gesamtbetrag:</span>
              <span className="text-[#F1600D]">CHF {booking.pricePaid.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Badge & Watermark */}
          <div className="bg-[#FEF6ED] p-3 rounded-xl border border-[#50A5B1]/30 flex items-center justify-between text-xs text-[#1A265A] font-bold">
            <span>Zahlungsmittel: {booking.paymentMethod}</span>
            <span>Ref: {booking.twintRefId || 'GETACOACH-PAY-OK'}</span>
          </div>

        </div>

        {/* Modal Footer Close */}
        <div className="p-4 bg-[#FEF6ED] border-t border-[#50A5B1]/20 text-center print:hidden">
          <button
            onClick={onClose}
            className="bg-[#1A265A] hover:bg-[#1A265A]/90 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
          >
            Schliessen
          </button>
        </div>

      </div>
    </div>
  );
};
