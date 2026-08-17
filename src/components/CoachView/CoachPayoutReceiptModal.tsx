import React, { useEffect } from 'react';
import { CoachProfile, Booking } from '../../types';
import { FileText, Download, CheckCircle2, ShieldCheck, Printer, X, Building2 } from 'lucide-react';
import { Logo } from '../Logo';

interface CoachPayoutReceiptModalProps {
  coach: CoachProfile;
  bookings: Booking[];
  monthLabel: string; // e.g. "Juli 2026"
  onClose: () => void;
  autoPrint?: boolean;
}

export const CoachPayoutReceiptModal: React.FC<CoachPayoutReceiptModalProps> = ({
  coach,
  bookings,
  monthLabel,
  onClose,
  autoPrint = false
}) => {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);
  // Check if viewing full year 2026 statement or specific month
  const isYearly = monthLabel.includes('Jahresumsatz') || monthLabel.includes('YTD') || monthLabel.includes('Jahresabrechnung');
  const isCurrentMonth = monthLabel.includes('Juli 2026');

  const getPastBookings = (): Booking[] => {
    let count = 12;
    let price = 100;
    if (monthLabel.includes('Juni')) { count = 12; price = 100; }
    else if (monthLabel.includes('Mai')) { count = 9; price = 100; }
    else if (monthLabel.includes('April')) { count = 10; price = 100; }
    else if (monthLabel.includes('März')) { count = 8; price = 100; }
    else if (monthLabel.includes('Februar')) { count = 11; price = 100; }
    else if (monthLabel.includes('Januar')) { count = 7; price = 100; }

    const customers = ['Marc Keller', 'Sophie Huber', 'Lukas Frei', 'Elena Rossi', 'Thomas Weber', 'Laura Meyer'];
    const sports = (coach?.sports && coach.sports.length > 0) ? coach.sports[0] : 'Fitness Coaching';

    return Array.from({ length: count }, (_, i) => ({
      id: `past-b-${i + 1}`,
      sessionId: `sess-${i + 1}`,
      sessionTitle: `${sports} - Session ${i + 1}`,
      coachId: coach?.id || 'COACH-1',
      coachName: coach?.name || 'Coach',
      coachAvatar: coach?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      userId: `usr-${i + 1}`,
      userName: customers[i % customers.length],
      userEmail: `kunden${i+1}@example.ch`,
      userPhone: '+41 79 123 45 67',
      sport: sports,
      date: `15.${monthLabel.split(' ')[0].substring(0, 3)}.2026`,
      time: '14:00 - 15:00',
      locationName: coach?.locationName || 'Zürich',
      canton: coach?.canton || 'ZH',
      pricePaid: price,
      paymentMethod: (i % 2 === 0 ? 'TWINT' : 'Kreditkarte') as any,
      paymentStatus: 'Bezahlt',
      bookingDate: new Date().toISOString(),
      status: 'bestaetigt',
      clientRated: false,
      coachRated: false,
      blindRatingStatus: 'ausstehend'
    }));
  };

  const getYearlyBookings = (): Booking[] => {
    const customers = ['Marc Keller', 'Sophie Huber', 'Lukas Frei', 'Elena Rossi', 'Thomas Weber', 'Laura Meyer', 'Sven Fischer', 'Anna Schmid'];
    const sports = (coach?.sports && coach.sports.length > 0) ? coach.sports[0] : 'Fitness Coaching';
    const monthNames = ['Jan', 'Feb', 'März', 'April', 'Mai', 'Juni', 'Juli'];
    
    const yearList: Booking[] = [];
    let idCounter = 1;

    monthNames.forEach((m) => {
      let count = 8;
      if (m === 'Juni') count = 12;
      if (m === 'Mai') count = 9;
      if (m === 'April') count = 10;
      if (m === 'März') count = 8;
      if (m === 'Feb') count = 11;
      if (m === 'Jan') count = 7;
      if (m === 'Juli') count = Math.max(bookings.length, 3);

      for (let i = 0; i < count; i++) {
        yearList.push({
          id: `ytd-b-${idCounter}`,
          sessionId: `sess-${idCounter}`,
          sessionTitle: `${sports} - Session ${idCounter}`,
          coachId: coach?.id || 'COACH-1',
          coachName: coach?.name || 'Coach',
          coachAvatar: coach?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          userId: `usr-${idCounter}`,
          userName: customers[idCounter % customers.length],
          userEmail: `kunden${idCounter}@example.ch`,
          userPhone: '+41 79 123 45 67',
          sport: sports,
          date: `15. ${m} 2026`,
          time: '14:00 - 15:00',
          locationName: coach?.locationName || 'Zürich',
          canton: coach?.canton || 'ZH',
          pricePaid: 100,
          paymentMethod: (idCounter % 2 === 0 ? 'TWINT' : 'Kreditkarte') as any,
          paymentStatus: 'Bezahlt',
          bookingDate: new Date().toISOString(),
          status: 'bestaetigt',
          clientRated: false,
          coachRated: false,
          blindRatingStatus: 'ausstehend'
        });
        idCounter++;
      }
    });

    return yearList;
  };

  const validBookings = isYearly
    ? getYearlyBookings()
    : (isCurrentMonth && bookings.length > 0)
      ? bookings.filter(b => b.status !== 'storniert_gt24h')
      : getPastBookings();

  const totalGross = validBookings.reduce((sum, b) => {
    if (b.status === 'storniert_lt24h') return sum + (b.coachCompensation || b.pricePaid * 0.5);
    return sum + b.pricePaid;
  }, 0);

  const platformFee = totalGross * 0.15;
  const netPayout = totalGross * 0.85;

  const invoiceNumber = `GUT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Print CSS to isolate printable receipt and preserve background colors for PDF generation */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible !important;
          }
          #printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          .mobile-receipt-cards {
            display: none !important;
          }
          .desktop-receipt-table {
            display: block !important;
          }
        }
      `}</style>

      <div id="printable-receipt" className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 space-y-4 sm:space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <FileText className="w-5 h-5 text-[#F1600D] shrink-0" />
            <span className="font-extrabold text-xs sm:text-sm text-[#1A265A] truncate">
              {isYearly ? 'Offizielle Jahresabrechnung & Gutschrift 2026' : 'Offizielle Monatsabrechnung & Gutschrift'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
            title="Schliessen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Printable Document */}
        <div className="space-y-4 sm:space-y-6 font-sans text-slate-800">
          
          {/* Company & Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Logo
                  className="h-10 w-auto object-contain"
                  alt="GET A COACH Logo"
                />
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 leading-snug">
                GET A COACH Schweiz AG · Seefeldstrasse 123 · 8008 Zürich<br />
                CHE-482.910.331 MWST · support@getacoach.ch
              </p>
            </div>

            <div className="text-left sm:text-right pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto">
              <span className="inline-block bg-emerald-100 text-emerald-800 font-extrabold text-[10px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-300 mb-1.5">
                ✓ Ausbezahlt auf Bankkonto
              </span>
              <h1 className="text-base sm:text-lg font-black text-[#1A265A]">
                {isYearly ? 'JAHRESABRECHNUNG & GUTSCHRIFT 2026' : 'GUTSCHRIFT & ABRECHNUNG'}
              </h1>
              <p className="text-xs font-bold text-slate-600 mt-0.5">
                Abrechnungsperiode: {isYearly ? 'Januar – Juli 2026 (Laufendes Jahr)' : monthLabel}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500">Gutschrift-Nr: {invoiceNumber}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500">Datum: {new Date().toLocaleDateString('de-CH')}</p>
            </div>
          </div>

          {/* Coach Recipient Details */}
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#50A5B1]/20 flex flex-col sm:flex-row justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] font-extrabold text-[#50A5B1] uppercase tracking-wider block mb-0.5">Empfänger (Coach)</span>
              <h3 className="font-extrabold text-xs sm:text-sm text-[#1A265A]">{coach?.name || 'Coach'}</h3>
              <p className="text-slate-600">{(coach?.sports || ['Fitness']).join(', ')} · {coach?.locationName || 'Schweiz'}</p>
              <p className="text-slate-600 text-[11px]">Coach-ID: {coach?.id || 'COACH-1'}</p>
            </div>
            <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-[#50A5B1]/15">
              <span className="text-[10px] font-extrabold text-[#50A5B1] uppercase tracking-wider block mb-0.5">Auszahlungskonto (IBAN)</span>
              <p className="font-bold text-[#1A265A] text-xs">{coach?.iban || 'CH89 0000 0000 0000 0000 0'}</p>
              <p className="text-slate-500 text-[10px] sm:text-[11px]">Gutschrift erfolgt per Valuta 1. des Folgemonats</p>
            </div>
          </div>

          {/* Itemized Section */}
          <div>
            <h4 className="font-extrabold text-xs text-[#1A265A] uppercase tracking-wider mb-2">
              Aufstellung der vermittelten Lektionen ({validBookings.length})
            </h4>
            
            {/* Desktop & Print Table View */}
            <div className="hidden sm:block desktop-receipt-table border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <th className="py-2.5 px-3">Datum / Kund:in</th>
                    <th className="py-2.5 px-3">Lektion</th>
                    <th className="py-2.5 px-3 text-right">Brutto (CHF)</th>
                    <th className="py-2.5 px-3 text-right">GET A COACH 15%</th>
                    <th className="py-2.5 px-3 text-right">Netto (85%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                        Keine gebuchten Lektionen im Abrechnungszeitraum.
                      </td>
                    </tr>
                  ) : (
                    validBookings.map(b => {
                      const gross = b.status === 'storniert_lt24h' ? (b.coachCompensation || b.pricePaid * 0.5) : b.pricePaid;
                      const fee = gross * 0.15;
                      const net = gross * 0.85;

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-800 block">{b.date}</span>
                            <span className="text-[11px] text-slate-500">{b.userName} ({b.paymentMethod})</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-slate-800 block">{b.sessionTitle}</span>
                            <span className="text-[11px] text-[#50A5B1] font-semibold">{b.sport}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                            CHF {gross.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-amber-700">
                            -CHF {fee.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                            CHF {net.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block sm:hidden mobile-receipt-cards space-y-2 max-h-64 overflow-y-auto pr-1">
              {validBookings.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500 italic">
                  Keine gebuchten Lektionen im Abrechnungszeitraum.
                </div>
              ) : (
                validBookings.map(b => {
                  const gross = b.status === 'storniert_lt24h' ? (b.coachCompensation || b.pricePaid * 0.5) : b.pricePaid;
                  const fee = gross * 0.15;
                  const net = gross * 0.85;

                  return (
                    <div key={b.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-extrabold text-slate-800 block">{b.date}</span>
                          <span className="text-[10px] text-slate-500">{b.userName} ({b.paymentMethod})</span>
                        </div>
                        <span className="font-black text-emerald-700 text-xs bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300 shrink-0">
                          CHF {net.toFixed(2)}
                        </span>
                      </div>
                      <div className="pt-1 border-t border-slate-200/80 flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-700 truncate max-w-[170px]">{b.sessionTitle}</span>
                        <span className="text-slate-500 shrink-0">
                          Brutto: CHF {gross.toFixed(0)} | Prov: -CHF {fee.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Financial Calculation Summary Box */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span>Total Kund:innen-Buchungen (Brutto):</span>
              <span className="font-bold">CHF {totalGross.toFixed(2)}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-amber-800 font-medium gap-1 sm:gap-0">
              <span className="flex flex-wrap items-center gap-1">
                <span>GET A COACH Vermittlungsprovision (15%):</span>
                <span className="text-[9px] sm:text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 border border-amber-200 font-semibold">
                  Inkl. TWINT/Karten-Gebühren
                </span>
              </span>
              <span className="font-bold self-end sm:self-auto">-CHF {platformFee.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-xs sm:text-sm font-black text-[#1A265A]">
              <span>Ausbezahlter Nettobetrag (85%):</span>
              <span className="text-sm sm:text-base text-emerald-700">CHF {netPayout.toFixed(2)}</span>
            </div>
          </div>

          {/* Guarantee Note */}
          <div className="text-[10px] sm:text-[11px] text-slate-500 bg-emerald-50/60 p-2.5 sm:p-3 rounded-xl border border-emerald-200/60 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-900">GET A COACH All-In Gebühren-Garantie:</strong> In der 15%-Vermittlungsprovision sind 100% aller Transaktionsspesen von TWINT, Kreditkarten sowie Stripe Verarbeitungsgebühren enthalten. Es gibt keine versteckten monatlichen Grundgebühren.
            </div>
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-slate-100 no-print">
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium text-center sm:text-left">
            💡 Tipp: Wähle im Druckfenster <span className="font-bold text-slate-700">"Als PDF speichern"</span> für deinen PDF-Download.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Schliessen
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black bg-[#F1600D] hover:bg-[#d85208] text-white transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>PDF herunterladen / Drucken</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
