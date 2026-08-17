import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, CoachProfile } from '../../types';
import { roundCHF, calculateCoachPayout } from '../../utils/financeUtils';
import {
  Banknote,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Building2,
  UserCheck,
  Check,
  RotateCcw,
  Sparkles,
  CreditCard
} from 'lucide-react';

export const AdminPayoutsTab: React.FC = () => {
  const { bookings, coaches, markBookingsPaidOutUntilDate, toggleBookingPaidOut } = useApp();

  // State for cutoff date (defaults to last day of previous month or today)
  const todayIso = new Date().toISOString().split('T')[0];
  const [cutoffDate, setCutoffDate] = useState<string>('2026-07-31');
  const [payoutNotification, setPayoutNotification] = useState<string | null>(null);
  const [expandedCoachId, setExpandedCoachId] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<'pending' | 'all' | 'history'>('pending');

  // Filter completed bookings
  const completedBookings = bookings.filter(b => b.status === 'abgeschlossen');

  // Group all completed bookings by coachId
  const coachPayoutsMap = new Map<
    string,
    {
      coachProfile?: CoachProfile;
      coachName: string;
      coachAvatar: string;
      allBookings: Booking[];
      pendingBookings: Booking[];
      paidOutBookings: Booking[];
      totalGrossPending: number;
      totalNetPending: number;
      totalNetPaid: number;
    }
  >();

  // Populate map with all coaches first or those with completed bookings
  coaches.forEach(coach => {
    const coachBookings = completedBookings.filter(b => b.coachId === coach.id);
    const pending = coachBookings.filter(b => !b.isPaidOut);
    const paidOut = coachBookings.filter(b => b.isPaidOut);

    const totalGrossPending = roundCHF(pending.reduce((sum, b) => sum + b.pricePaid, 0));
    const totalNetPending = roundCHF(pending.reduce(
      (sum, b) => sum + (b.coachCompensation ?? calculateCoachPayout(b.pricePaid)),
      0
    ));
    const totalNetPaid = roundCHF(paidOut.reduce(
      (sum, b) => sum + (b.coachCompensation ?? calculateCoachPayout(b.pricePaid)),
      0
    ));

    if (coachBookings.length > 0 || coach.isProfileActive) {
      coachPayoutsMap.set(coach.id, {
        coachProfile: coach,
        coachName: coach.name,
        coachAvatar: coach.avatar,
        allBookings: coachBookings,
        pendingBookings: pending,
        paidOutBookings: paidOut,
        totalGrossPending,
        totalNetPending,
        totalNetPaid
      });
    }
  });

  const coachPayoutList = Array.from(coachPayoutsMap.entries()).map(([coachId, data]) => ({
    coachId,
    ...data
  }));

  // Overall statistics
  const totalPendingPayoutsCHF = coachPayoutList.reduce((sum, c) => sum + c.totalNetPending, 0);
  const totalPendingLessonsCount = coachPayoutList.reduce((sum, c) => sum + c.pendingBookings.length, 0);
  const totalCoachesWithPendingPayouts = coachPayoutList.filter(c => c.pendingBookings.length > 0).length;

  // Filtered coach list for display based on viewFilter
  const displayedCoaches = coachPayoutList.filter(c => {
    if (viewFilter === 'pending') return c.pendingBookings.length > 0;
    if (viewFilter === 'history') return c.paidOutBookings.length > 0;
    return true; // 'all'
  });

  // Handle Mass Payout cutoff action
  const handleCutoffPayout = () => {
    if (!cutoffDate) return;
    const result = markBookingsPaidOutUntilDate(cutoffDate);
    setPayoutNotification(result.message);
    setTimeout(() => {
      setPayoutNotification(null);
    }, 8000);
  };

  // CSV Export for eBanking
  const handleExportCSV = () => {
    const headers = [
      'Coach Name',
      'IBAN',
      'Kontoinhaber',
      'Bank Name',
      'Unbezahlte Lektionen',
      'Auszahlungsbetrag (85% Netto CHF)',
      'Plattform Fee (15% CHF)',
      'Stichtag Export'
    ];

    const rows = coachPayoutList
      .filter(c => c.pendingBookings.length > 0)
      .map(c => {
        const coach = c.coachProfile;
        const iban = coach?.iban || 'CH-- ---- ---- ---- -';
        const accountHolder = coach?.accountHolder || c.coachName;
        const bankName = coach?.bankName || 'Schweizer Bank';
        const netAmount = c.totalNetPending.toFixed(2);
        const feeAmount = (c.totalGrossPending - c.totalNetPending).toFixed(2);

        return [
          `"${c.coachName.replace(/"/g, '""')}"`,
          `"${iban.replace(/\s+/g, '')}"`,
          `"${accountHolder.replace(/"/g, '""')}"`,
          `"${bankName.replace(/"/g, '""')}"`,
          c.pendingBookings.length,
          netAmount,
          feeAmount,
          cutoffDate
        ].join(';');
      });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GET_A_COACH_Auszahlungen_Stichtag_${cutoffDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Fast Cutoff Action */}
      <div className="bg-[#1A265A] text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#50A5B1]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="bg-[#50A5B1]/20 text-[#50A5B1] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#50A5B1]/30 inline-flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5" /> Auszahlungs-Zentrale (85% Netto-Verdienst)
            </span>
            <h2 className="text-2xl md:text-3xl font-oswald font-medium uppercase tracking-wide">
              Coach-Auszahlungen & eBanking Export
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              Verwalte unbezahlte Lektionen deiner Coaches. Führe Sammel-Auszahlungen per Stichtag durch und exportiere detaillierte Zahlungs-Dateien (CSV) für deine E-Banking Überweisungen.
            </p>
          </div>

          {/* Mass Cutoff Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 w-full lg:w-auto space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#50A5B1]">
              <Calendar className="w-4 h-4 text-[#F1600D]" />
              <span>Stichtag-Auszahlungs-Funktion</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <input
                type="date"
                value={cutoffDate}
                onChange={e => setCutoffDate(e.target.value)}
                className="bg-white text-[#1A265A] text-xs font-bold px-3 py-2 rounded-xl border border-white/20 outline-none w-full sm:w-auto"
              />

              <button
                onClick={handleCutoffPayout}
                className="w-full sm:w-auto bg-[#F1600D] hover:bg-[#d85207] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-center">Bis Stichtag als erledigt markieren</span>
              </button>
            </div>
            <p className="text-[10px] text-white/60">
              Markiert alle absolvierten Lektionen bis inkl. {cutoffDate} als ausbezahlt.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {payoutNotification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{payoutNotification}</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Offener Auszahlungs-Pool (85% Netto)
          </span>
          <div className="text-2xl font-extrabold text-[#1A265A] font-oswald">
            CHF {totalPendingPayoutsCHF.toFixed(2)}
          </div>
          <span className="text-[10px] text-amber-600 font-medium block">
            {totalPendingLessonsCount} unbezahlte Lektionen insg.
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Coaches mit ausstehender Auszahlung
          </span>
          <div className="text-2xl font-extrabold text-[#F1600D] font-oswald">
            {totalCoachesWithPendingPayouts} Coaches
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            Bereit für eBanking Sammelüberweisung
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              eBanking CSV Datei
            </span>
            <span className="text-xs text-slate-600 block mt-0.5">
              Für PostFinance, UBS, Raiffeisen & ZKB
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={totalPendingPayoutsCHF === 0}
            className="mt-3 w-full py-2 bg-[#50A5B1] hover:bg-[#3d8c97] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Auszahlungsliste exportieren (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Coach Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Header Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="font-oswald text-lg font-medium uppercase text-[#1A265A]">
              Coach-Auszahlungs-Übersicht
            </h3>
            <p className="text-xs text-slate-500">
              Umsatz-Aggregation nach Coach (85% Netto-Guthaben / 15% Plattform-Provision)
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setViewFilter('pending')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                viewFilter === 'pending'
                  ? 'bg-white text-[#1A265A] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unbezahlt ({totalCoachesWithPendingPayouts})
            </button>
            <button
              onClick={() => setViewFilter('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                viewFilter === 'all'
                  ? 'bg-white text-[#1A265A] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alle Coaches ({coachPayoutList.length})
            </button>
            <button
              onClick={() => setViewFilter('history')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                viewFilter === 'history'
                  ? 'bg-white text-[#1A265A] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Historie / Ausbezahlt
            </button>
          </div>
        </div>

        {/* Coach List Rows */}
        <div className="divide-y divide-slate-100">
          {displayedCoaches.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
              <p className="text-sm font-bold text-slate-700">Keine Eintragsgruppen in diesem Filter</p>
              <p className="text-xs text-slate-400">
                Alle ausstehenden Lektionen wurden ausbezahlt oder es liegen keine absolvierten Einheiten vor.
              </p>
            </div>
          ) : (
            displayedCoaches.map(c => {
              const coach = c.coachProfile;
              const isExpanded = expandedCoachId === c.coachId;
              const iban = coach?.iban || 'CH-- ---- ---- ---- -';
              const accountHolder = coach?.accountHolder || c.coachName;
              const bankName = coach?.bankName || 'Nicht angegeben';

              return (
                <div key={c.coachId} className="transition hover:bg-slate-50/40">
                  
                  {/* Summary Row */}
                  <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    
                    {/* Coach Identity & Bank Details */}
                    <div className="flex items-start gap-3 flex-1">
                      <img
                        src={c.coachAvatar}
                        alt={c.coachName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#50A5B1]/30 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#1A265A]">
                            {c.coachName}
                          </h4>
                          {coach?.isProfileActive ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Profil Live
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                              Entwurf
                            </span>
                          )}
                        </div>

                        {/* Bank info box */}
                        <div className="text-xs text-slate-600 space-y-0.5 bg-slate-100/70 p-2 rounded-xl border border-slate-200/60 font-mono">
                          <div className="flex items-center gap-1.5 font-sans font-semibold text-[#1A265A]">
                            <Building2 className="w-3.5 h-3.5 text-[#50A5B1]" />
                            <span>Kontoinhaber:</span>
                            <span className="text-slate-900 font-bold">{accountHolder}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-700">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold text-[#1A265A]">IBAN:</span>
                            <span className="tracking-wide">{iban}</span>
                            <span className="text-slate-400 font-sans">({bankName})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pending Stats & Payout Amount */}
                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-6 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                      <div className="text-left md:text-right space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Unbezahlte Lektionen
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {c.pendingBookings.length} Lektion(en)
                        </span>
                      </div>

                      <div className="text-left md:text-right space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-amber-600 block">
                          Auszahlung Guthaben (85%)
                        </span>
                        <span className="text-lg font-extrabold text-[#1A265A] font-oswald">
                          CHF {c.totalNetPending.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedCoachId(isExpanded ? null : c.coachId)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Verbergen' : 'Lektionen'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Expanded Lessons Breakdown Table */}
                  {isExpanded && (
                    <div className="bg-slate-50/80 p-5 border-t border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-200 pb-2">
                        <span>Absolvierte Lektionen von {c.coachName}</span>
                        <span className="text-slate-400 text-[11px]">
                          Einträge durchgestrichen = bereits ausbezahlt
                        </span>
                      </div>

                      <div className="space-y-2">
                        {c.allBookings.map(booking => {
                          const isPaid = booking.isPaidOut;
                          const netEarnings = booking.coachCompensation ?? Math.round(booking.pricePaid * 0.85 * 100) / 100;
                          const platformFee = (booking.pricePaid - netEarnings).toFixed(2);

                          return (
                            <div
                              key={booking.id}
                              className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                                isPaid
                                  ? 'bg-slate-100/70 border-slate-200 text-slate-400'
                                  : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                              }`}
                            >
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${isPaid ? 'line-through text-slate-400' : 'text-[#1A265A]'}`}>
                                    {booking.sessionTitle}
                                  </span>
                                  {isPaid ? (
                                    <span className="bg-slate-200 text-slate-600 font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      Ausbezahlt {booking.paidOutAt ? `am ${booking.paidOutAt}` : ''}
                                    </span>
                                  ) : (
                                    <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-md">
                                      Offene Auszahlung
                                    </span>
                                  )}
                                </div>

                                <div className={`text-[11px] flex flex-wrap gap-x-3 gap-y-1 ${isPaid ? 'text-slate-400' : 'text-slate-600'}`}>
                                  <span>📅 Datum: {booking.date} ({booking.time})</span>
                                  <span>👤 Kund:in: {booking.userName}</span>
                                  <span>📍 Kanton: {booking.canton}</span>
                                </div>
                              </div>

                              {/* Price breakdown */}
                              <div className="flex items-center gap-4 shrink-0">
                                <div className="text-right">
                                  <div className={`font-extrabold font-oswald text-sm ${isPaid ? 'line-through text-slate-400' : 'text-[#1A265A]'}`}>
                                    Netto: CHF {netEarnings.toFixed(2)}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    Brutto CHF {booking.pricePaid} (15% Prov. CHF {platformFee})
                                  </div>
                                </div>

                                {/* Manual toggle button */}
                                <button
                                  onClick={() => toggleBookingPaidOut(booking.id)}
                                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                    isPaid
                                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                  title={isPaid ? 'Als unbezahlt zurücksetzen' : 'Einzeln als ausbezahlt markieren'}
                                >
                                  {isPaid ? (
                                    <>
                                      <RotateCcw className="w-3 h-3" />
                                      <span>Stornieren</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Als bezahlt markieren</span>
                                    </>
                                  )}
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
