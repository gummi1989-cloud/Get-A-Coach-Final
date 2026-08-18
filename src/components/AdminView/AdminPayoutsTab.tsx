import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, CoachProfile } from '../../types';
import { UserAvatar } from '../UserAvatar';
import {
  roundCHF,
  formatCHF,
  calculateCoachPayout,
  cleanSwissIBAN,
  formatSwissIBAN,
  getPaymentPurposeForDate
} from '../../utils/financeUtils';
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
  CreditCard,
  Copy,
  CheckCheck,
  Search,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  AlertTriangle,
  HelpCircle,
  Filter
} from 'lucide-react';

export const AdminPayoutsTab: React.FC = () => {
  const { bookings, coaches, markBookingsPaidOutUntilDate, toggleBookingPaidOut } = useApp();

  // Stichtag (Cutoff Date) - default to today's date
  const todayIso = new Date().toISOString().split('T')[0];
  const [cutoffDate, setCutoffDate] = useState<string>(todayIso);
  const [payoutNotification, setPayoutNotification] = useState<string | null>(null);
  const [expandedCoachId, setExpandedCoachId] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<'due' | 'all' | 'history'>('due');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedIbanCoachId, setCopiedIbanCoachId] = useState<string | null>(null);

  // Safety Confirmation Modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [confirmTarget, setConfirmTarget] = useState<{
    mode: 'all' | 'single';
    coachId?: string;
    coachName?: string;
    lessonCount: number;
    totalAmountCHF: number;
  } | null>(null);

  // Quick preset dates helpers
  const handleSetDatePreset = (preset: 'today' | 'monthEnd' | 'prevMonthEnd') => {
    const d = new Date();
    if (preset === 'today') {
      setCutoffDate(todayIso);
    } else if (preset === 'monthEnd') {
      // Last day of current month
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      setCutoffDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'prevMonthEnd') {
      // Last day of previous month
      const lastDayPrev = new Date(d.getFullYear(), d.getMonth(), 0);
      setCutoffDate(lastDayPrev.toISOString().split('T')[0]);
    }
  };

  // Group and aggregate bookings by Coach
  const coachPayoutData = useMemo(() => {
    const map = new Map<
      string,
      {
        coachProfile?: CoachProfile;
        coachName: string;
        coachAvatar: string;
        allBookings: Booking[];
        dueUnpaidBookings: Booking[];
        futureUnpaidBookings: Booking[];
        paidOutBookings: Booking[];
        dueGrossCHF: number;
        dueNetCHF: number;
        totalPaidOutNetCHF: number;
      }
    >();

    // Completed or confirmed bookings eligible for coach compensation
    const eligibleBookings = bookings.filter(
      b => b.status === 'abgeschlossen' || b.status === 'bestaetigt'
    );

    coaches.forEach(coach => {
      const coachBookings = eligibleBookings.filter(b => b.coachId === coach.id);
      
      const dueUnpaid = coachBookings.filter(b => !b.isPaidOut && b.date <= cutoffDate);
      const futureUnpaid = coachBookings.filter(b => !b.isPaidOut && b.date > cutoffDate);
      const paidOut = coachBookings.filter(b => b.isPaidOut);

      const dueGrossCHF = roundCHF(dueUnpaid.reduce((sum, b) => sum + b.pricePaid, 0));
      const dueNetCHF = roundCHF(
        dueUnpaid.reduce(
          (sum, b) => sum + (b.coachCompensation ?? calculateCoachPayout(b.pricePaid)),
          0
        )
      );

      const totalPaidOutNetCHF = roundCHF(
        paidOut.reduce(
          (sum, b) => sum + (b.coachCompensation ?? calculateCoachPayout(b.pricePaid)),
          0
        )
      );

      if (coachBookings.length > 0 || coach.isProfileActive) {
        map.set(coach.id, {
          coachProfile: coach,
          coachName: coach.name,
          coachAvatar: coach.avatar,
          allBookings: coachBookings,
          dueUnpaidBookings: dueUnpaid,
          futureUnpaidBookings: futureUnpaid,
          paidOutBookings: paidOut,
          dueGrossCHF,
          dueNetCHF,
          totalPaidOutNetCHF
        });
      }
    });

    return Array.from(map.entries()).map(([coachId, data]) => ({
      coachId,
      ...data
    }));
  }, [bookings, coaches, cutoffDate]);

  // Overall Global KPI Metrics for Stichtag
  const totalDueNetPayoutsCHF = useMemo(() => {
    return roundCHF(coachPayoutData.reduce((sum, c) => sum + c.dueNetCHF, 0));
  }, [coachPayoutData]);

  const totalDueGrossCHF = useMemo(() => {
    return roundCHF(coachPayoutData.reduce((sum, c) => sum + c.dueGrossCHF, 0));
  }, [coachPayoutData]);

  const totalPlatformCommissionDueCHF = useMemo(() => {
    return roundCHF(totalDueGrossCHF - totalDueNetPayoutsCHF);
  }, [totalDueGrossCHF, totalDueNetPayoutsCHF]);

  const totalDueLessonsCount = useMemo(() => {
    return coachPayoutData.reduce((sum, c) => sum + c.dueUnpaidBookings.length, 0);
  }, [coachPayoutData]);

  const totalCoachesWithDuePayouts = useMemo(() => {
    return coachPayoutData.filter(c => c.dueUnpaidBookings.length > 0).length;
  }, [coachPayoutData]);

  const totalHistoricalPaidOutCHF = useMemo(() => {
    return roundCHF(coachPayoutData.reduce((sum, c) => sum + c.totalPaidOutNetCHF, 0));
  }, [coachPayoutData]);

  // Filter coaches based on active tab and search query
  const displayedCoaches = useMemo(() => {
    return coachPayoutData.filter(c => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.coachName.toLowerCase().includes(q);
        const matchesIban = (c.coachProfile?.iban || '').toLowerCase().includes(q);
        const matchesSport = (c.coachProfile?.sports || []).some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesIban && !matchesSport) return false;
      }

      // View filter
      if (viewFilter === 'due') {
        return c.dueUnpaidBookings.length > 0;
      }
      if (viewFilter === 'history') {
        return c.paidOutBookings.length > 0;
      }
      return true; // 'all'
    });
  }, [coachPayoutData, viewFilter, searchQuery]);

  // Copy IBAN to clipboard helper
  const handleCopyIban = (ibanStr: string, coachId: string) => {
    const clean = cleanSwissIBAN(ibanStr);
    navigator.clipboard.writeText(clean);
    setCopiedIbanCoachId(coachId);
    setTimeout(() => {
      setCopiedIbanCoachId(null);
    }, 2500);
  };

  // Open Safety Confirmation Modal
  const openConfirmModal = (mode: 'all' | 'single', coachId?: string) => {
    if (mode === 'all') {
      if (totalDueLessonsCount === 0) {
        setPayoutNotification('Keine fälligen Lektionen bis zum Stichtag ' + cutoffDate + ' vorhanden.');
        setTimeout(() => setPayoutNotification(null), 5000);
        return;
      }
      setConfirmTarget({
        mode: 'all',
        lessonCount: totalDueLessonsCount,
        totalAmountCHF: totalDueNetPayoutsCHF
      });
    } else if (coachId) {
      const coachData = coachPayoutData.find(c => c.coachId === coachId);
      if (!coachData || coachData.dueUnpaidBookings.length === 0) {
        setPayoutNotification('Keine fälligen Lektionen für diesen Coach bis zum Stichtag.');
        setTimeout(() => setPayoutNotification(null), 5000);
        return;
      }
      setConfirmTarget({
        mode: 'single',
        coachId,
        coachName: coachData.coachName,
        lessonCount: coachData.dueUnpaidBookings.length,
        totalAmountCHF: coachData.dueNetCHF
      });
    }
    setConfirmModalOpen(true);
  };

  // Execute Payout upon Confirmation
  const executePayout = () => {
    if (!confirmTarget) return;

    if (confirmTarget.mode === 'all') {
      const result = markBookingsPaidOutUntilDate(cutoffDate);
      setPayoutNotification(result.message);
    } else if (confirmTarget.mode === 'single' && confirmTarget.coachId) {
      const result = markBookingsPaidOutUntilDate(cutoffDate, confirmTarget.coachId);
      setPayoutNotification(
        `Auszahlung für ${confirmTarget.coachName || 'Coach'} erfolgreich abgeschlossen: ${result.message}`
      );
    }

    setConfirmModalOpen(false);
    setConfirmTarget(null);
    setTimeout(() => {
      setPayoutNotification(null);
    }, 8000);
  };

  // 2. CSV Export for Swiss eBanking
  const handleExportCSV = () => {
    const coachesWithDue = coachPayoutData.filter(c => c.dueUnpaidBookings.length > 0);

    if (coachesWithDue.length === 0) {
      setPayoutNotification('Keine fälligen Auszahlungen zum Exportieren vorhanden.');
      setTimeout(() => setPayoutNotification(null), 5000);
      return;
    }

    // CSV Headers per requirement
    const headers = [
      'Empfaenger_Name',
      'IBAN',
      'Betrag_CHF',
      'Waehrung',
      'Zahlungszweck',
      'Anzahl_Lektionen'
    ];

    const purposeText = getPaymentPurposeForDate(cutoffDate);

    const rows = coachesWithDue.map(c => {
      const coach = c.coachProfile;
      const recipientName = coach?.accountHolder?.trim() || c.coachName.trim();
      const cleanedIban = cleanSwissIBAN(coach?.iban);
      const amountStr = formatCHF(c.dueNetCHF);
      const currency = 'CHF';
      const lessonCount = c.dueUnpaidBookings.length;

      return [
        `"${recipientName.replace(/"/g, '""')}"`,
        `"${cleanedIban}"`,
        amountStr,
        currency,
        `"${purposeText}"`,
        lessonCount
      ].join(';');
    });

    // UTF-8 BOM + Semicolon separated values (Standard for Swiss banking & Excel)
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GetACoach_Auszahlungen_Stichtag_${cutoffDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setPayoutNotification(
      `CSV-Auszahlungsdatei für ${coachesWithDue.length} Coach(es) bis Stichtag ${cutoffDate} erfolgreich generiert.`
    );
    setTimeout(() => setPayoutNotification(null), 6000);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Cutoff Date Picker */}
      <div className="bg-gradient-to-r from-[#1A265A] via-[#20306c] to-[#50A5B1] text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F1600D]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-[#50A5B1]/25 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
              <Banknote className="w-3.5 h-3.5 text-[#F1600D]" />
              <span>Schweizer eBanking & Coach-Auszahlungszentrale</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-oswald font-medium uppercase tracking-wide">
              Coach-Auszahlungen & Stichtag-Abrechnung
            </h2>
            <p className="text-xs md:text-sm text-white/85 leading-relaxed font-sans">
              Aggregiere alle absolvierten Lektionen pro Coach (85 % Netto-Guthaben abzüglich 15 % Plattform-Provision).
              Generiere Schweizer eBanking Sammelaufträge (CSV mit UTF-8-BOM & Semikolon) und markiere Überweisungen per Klick als erledigt.
            </p>
          </div>

          {/* Stichtag Selector Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 w-full lg:w-auto space-y-3.5 shrink-0 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                <Calendar className="w-4 h-4 text-[#F1600D]" />
                <span>Zahlungs-Stichtag</span>
              </div>
              <span className="text-[10px] text-white/70 bg-white/10 px-2 py-0.5 rounded-md">
                Lektionen bis & inkl. Datum
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="date"
                value={cutoffDate}
                onChange={e => setCutoffDate(e.target.value)}
                className="bg-white text-[#1A265A] font-mono text-xs font-bold px-3 py-2 rounded-xl border border-white/30 outline-none w-full sm:w-auto cursor-pointer focus:ring-2 focus:ring-[#F1600D]"
              />

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSetDatePreset('today')}
                  className="px-2.5 py-2 bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold rounded-xl transition cursor-pointer"
                  title="Auf heutigen Tag setzen"
                >
                  Heute
                </button>
                <button
                  onClick={() => handleSetDatePreset('monthEnd')}
                  className="px-2.5 py-2 bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold rounded-xl transition cursor-pointer"
                  title="Monatsende wählen"
                >
                  Monatsende
                </button>
                <button
                  onClick={() => handleSetDatePreset('prevMonthEnd')}
                  className="px-2.5 py-2 bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold rounded-xl transition cursor-pointer"
                  title="Vormonatsende wählen"
                >
                  Vormonat
                </button>
              </div>
            </div>

            {/* Mass Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-white/15">
              <button
                onClick={() => openConfirmModal('all')}
                disabled={totalDueLessonsCount === 0}
                className="w-full sm:flex-1 bg-[#F1600D] hover:bg-[#d85207] disabled:bg-slate-300 disabled:text-slate-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Als ausbezahlt markieren</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={totalDueLessonsCount === 0}
                className="w-full sm:w-auto bg-[#50A5B1] hover:bg-[#3d8c97] disabled:bg-white/10 disabled:text-white/40 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                title="CSV Sammelüberweisungs-Datei herunterladen"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">CSV Export</span>
              </button>
            </div>

            <p className="text-[10px] text-white/70 leading-tight">
              Aktuell {totalDueLessonsCount} fällige Lektion(en) für {totalCoachesWithDuePayouts} Coach(es) bis {cutoffDate}.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {payoutNotification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="flex-1">{payoutNotification}</span>
          <button
            onClick={() => setPayoutNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Offener Auszahlungs-Pool (85% Netto) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Fällige Auszahlungen (85% Netto)
            </span>
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#1A265A] font-oswald">
              CHF {formatCHF(totalDueNetPayoutsCHF)}
            </div>
            <span className="text-[11px] text-amber-700 font-semibold mt-0.5 inline-block">
              {totalDueLessonsCount} Lektion(en) bis {cutoffDate}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Kaufmännisch gerundet auf 5 Rappen (CHF 0.05)
          </p>
        </div>

        {/* Card 2: Fällige Coaches */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Betroffene Coaches
            </span>
            <div className="w-9 h-9 bg-orange-50 text-[#F1600D] rounded-xl flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#F1600D] font-oswald">
              {totalCoachesWithDuePayouts} Coaches
            </div>
            <span className="text-[11px] text-slate-600 font-medium mt-0.5 inline-block">
              Bereit für eBanking Sammelauftrag
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Von insgesamt {coaches.length} registrierten Coaches
          </p>
        </div>

        {/* Card 3: 15% Platform Commission */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Plattform-Provision (15%)
            </span>
            <div className="w-9 h-9 bg-teal-50 text-[#50A5B1] rounded-xl flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#50A5B1] font-oswald">
              CHF {formatCHF(totalPlatformCommissionDueCHF)}
            </div>
            <span className="text-[11px] text-slate-600 font-medium mt-0.5 inline-block">
              Brutto-Volumen: CHF {formatCHF(totalDueGrossCHF)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            GET A COACH.ch Marge (automatisch einbehalten)
          </p>
        </div>

        {/* Card 4: CSV Export Button */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Schweizer eBanking CSV
              </span>
              <FileSpreadsheet className="w-5 h-5 text-[#1A265A]" />
            </div>
            <span className="text-xs text-slate-600 block mt-1 leading-tight">
              Kompatibel mit PostFinance, UBS, Raiffeisen, ZKB & allen Schweizer Banken.
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={totalDueLessonsCount === 0}
            className="w-full py-2.5 bg-[#1A265A] hover:bg-[#50A5B1] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            <Download className="w-4 h-4 shrink-0 text-[#F1600D]" />
            <span>Auszahlungsdatei generieren (.csv)</span>
          </button>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Filter & Search Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-50/70">
          <div className="space-y-1">
            <h3 className="font-oswald text-xl font-medium uppercase text-[#1A265A] flex items-center gap-2">
              <Banknote className="w-5 h-5 text-[#F1600D]" />
              <span>Coach-Auszahlungsliste</span>
            </h3>
            <p className="text-xs text-slate-500">
              Gruppierung nach Coach mit bereinigter Schweizer IBAN und 85% Auszahlungsbetrag.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Coach oder IBAN suchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#1A265A] focus:outline-none focus:border-[#50A5B1] w-full sm:w-60"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none">
              <button
                onClick={() => setViewFilter('due')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  viewFilter === 'due'
                    ? 'bg-white text-[#1A265A] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Fällig bis Stichtag</span>
                <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {totalCoachesWithDuePayouts}
                </span>
              </button>

              <button
                onClick={() => setViewFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  viewFilter === 'all'
                    ? 'bg-white text-[#1A265A] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Alle Coaches ({coachPayoutData.length})
              </button>

              <button
                onClick={() => setViewFilter('history')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  viewFilter === 'history'
                    ? 'bg-white text-[#1A265A] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Historie / Ausbezahlt
              </button>
            </div>
          </div>
        </div>

        {/* Coach Table Body */}
        <div className="divide-y divide-slate-100">
          {displayedCoaches.length === 0 ? (
            <div className="p-12 sm:p-16 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-[#1A265A] text-base sm:text-lg">
                  Keine offenen Auszahlungen bis zum gewählten Datum
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Alle absolvierten Lektionen bis zum Stichtag ({cutoffDate}) wurden bereits ausbezahlt oder es liegen keine unbezahlten Einheiten in dieser Ansicht vor.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => setViewFilter('all')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1A265A] font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Alle Coaches anzeigen
                </button>
                <button
                  onClick={() => handleSetDatePreset('monthEnd')}
                  className="px-4 py-2 bg-[#50A5B1] hover:bg-[#3d8c97] text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Stichtag auf Monatsende
                </button>
              </div>
            </div>
          ) : (
            displayedCoaches.map(c => {
              const coach = c.coachProfile;
              const isExpanded = expandedCoachId === c.coachId;
              const rawIban = coach?.iban || '';
              const cleanedIban = cleanSwissIBAN(rawIban);
              const formattedIban = formatSwissIBAN(rawIban);
              const accountHolder = coach?.accountHolder || c.coachName;
              const bankName = coach?.bankName || 'Schweizer Bankinstitut';
              const hasDuePayout = c.dueUnpaidBookings.length > 0;
              const isIbanCopied = copiedIbanCoachId === c.coachId;

              return (
                <div key={c.coachId} className="transition hover:bg-slate-50/50">
                  
                  {/* Summary Row */}
                  <div className="p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    
                    {/* Coach Profile & Bank Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <UserAvatar
                        src={c.coachAvatar}
                        name={c.coachName}
                        role="coach"
                        size="md"
                        shape="circle"
                        bordered
                        borderColor="border-[#50A5B1]/30"
                        isVerified={coach?.isVerified}
                      />
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-base text-[#1A265A] truncate">
                            {c.coachName}
                          </h4>
                          {coach?.isProfileActive ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Live
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                              Entwurf
                            </span>
                          )}
                          {coach?.isVerified && (
                            <span className="bg-[#F1600D]/10 text-[#F1600D] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" /> Verifiziert
                            </span>
                          )}
                        </div>

                        {/* Swiss IBAN & Bank Details Box */}
                        <div className="text-xs text-slate-700 bg-slate-100/90 p-2.5 rounded-2xl border border-slate-200/80 space-y-1 max-w-xl">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-[#1A265A] font-semibold text-[11px]">
                              <Building2 className="w-3.5 h-3.5 text-[#50A5B1] shrink-0" />
                              <span>Kontoinhaber:</span>
                              <span className="text-slate-900 font-bold">{accountHolder}</span>
                            </div>

                            <button
                              onClick={() => handleCopyIban(rawIban, c.coachId)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#50A5B1] hover:text-[#1A265A] transition cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-slate-200"
                              title="IBAN in Zwischenablage kopieren"
                            >
                              {isIbanCopied ? (
                                <>
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Kopiert!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>IBAN kopieren</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0 font-sans" />
                            <span className="font-bold text-[#1A265A]">{formattedIban}</span>
                            {bankName && (
                              <span className="text-slate-500 font-sans text-[11px]">({bankName})</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financial Metrics & Actions */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 sm:gap-6 shrink-0 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200/80">
                      
                      {/* Due Lessons Count */}
                      <div className="text-left lg:text-right space-y-0.5">
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">
                          Fällige Lektionen
                        </span>
                        <div className="flex items-center lg:justify-end gap-1.5">
                          <span className={`text-base font-extrabold ${hasDuePayout ? 'text-amber-700' : 'text-slate-700'}`}>
                            {c.dueUnpaidBookings.length} Lektion(en)
                          </span>
                          {c.futureUnpaidBookings.length > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium" title="Nach Stichtag fällig">
                              (+{c.futureUnpaidBookings.length} zukünftig)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Total Payout Amount (85% Netto CHF) */}
                      <div className="text-left lg:text-right space-y-0.5 min-w-[130px]">
                        <span className="text-[10px] uppercase font-extrabold text-amber-600 block tracking-wider">
                          Netto-Auszahlung (85%)
                        </span>
                        <div className="text-2xl font-extrabold text-[#1A265A] font-oswald tracking-tight">
                          CHF {formatCHF(c.dueNetCHF)}
                        </div>
                        {hasDuePayout && (
                          <span className="text-[10px] text-slate-400 block">
                            Brutto: CHF {formatCHF(c.dueGrossCHF)}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {hasDuePayout && (
                          <button
                            onClick={() => openConfirmModal('single', c.coachId)}
                            className="px-3.5 py-2 bg-[#F1600D] hover:bg-[#d85207] text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Diesen Coach jetzt einzeln als ausbezahlt markieren"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Ausbezahlen</span>
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedCoachId(isExpanded ? null : c.coachId)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                          aria-label="Lektionen aufklappen"
                        >
                          <span>{isExpanded ? 'Verbergen' : 'Details'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                    </div>

                  </div>

                  {/* Expanded Lessons Details Accordion */}
                  {isExpanded && (
                    <div className="bg-slate-50/90 p-5 sm:p-6 border-t border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-1 duration-150">
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-extrabold text-[#1A265A] uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#50A5B1]" />
                            <span>Lektionen-Historie & Abrechnungsstatus von {c.coachName}</span>
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            Stichtag: <strong className="text-[#1A265A]">{cutoffDate}</strong> · Einträge durchgestrichen = bereits erfolgreich ausbezahlt
                          </p>
                        </div>

                        <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Fällig ({c.dueUnpaidBookings.length})
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Ausbezahlt ({c.paidOutBookings.length})
                          </span>
                        </div>
                      </div>

                      {/* Lesson Items List */}
                      {c.allBookings.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">
                          Noch keine gebuchten oder absolvierten Lektionen vorhanden.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {c.allBookings.map(booking => {
                            const isPaid = booking.isPaidOut;
                            const isDue = !isPaid && booking.date <= cutoffDate;
                            const isFuture = !isPaid && booking.date > cutoffDate;

                            const netEarnings = booking.coachCompensation ?? calculateCoachPayout(booking.pricePaid);
                            const platformFee = roundCHF(booking.pricePaid - netEarnings);

                            return (
                              <div
                                key={booking.id}
                                className={`p-3.5 sm:p-4 rounded-2xl border text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                                  isPaid
                                    ? 'bg-slate-100/70 border-slate-200/90 text-slate-400'
                                    : isDue
                                    ? 'bg-white border-amber-200/90 shadow-2xs text-slate-800 ring-1 ring-amber-100'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`font-bold text-sm ${isPaid ? 'line-through text-slate-400' : 'text-[#1A265A]'}`}>
                                      {booking.sessionTitle}
                                    </span>

                                    {/* Status Badge */}
                                    {isPaid ? (
                                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        Ausbezahlt {booking.paidOutAt ? `am ${booking.paidOutAt}` : ''}
                                      </span>
                                    ) : isDue ? (
                                      <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                        <AlertCircle className="w-3 h-3 text-amber-600" />
                                        Fällig (bis Stichtag {cutoffDate})
                                      </span>
                                    ) : (
                                      <span className="bg-slate-100 text-slate-600 font-medium text-[10px] px-2.5 py-0.5 rounded-full">
                                        Zukünftig ({booking.date})
                                      </span>
                                    )}

                                    <span className="text-[10px] text-slate-400 font-mono">
                                      #{booking.id.slice(-6)}
                                    </span>
                                  </div>

                                  <div className={`text-[11px] flex flex-wrap gap-x-4 gap-y-1 ${isPaid ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                    <span>📅 Datum: <strong>{booking.date}</strong> ({booking.time})</span>
                                    <span>👤 Kund:in: <strong>{booking.userName}</strong></span>
                                    <span>📍 Ort: {booking.locationName} ({booking.canton})</span>
                                    <span>💳 Zahlung: {booking.paymentMethod}</span>
                                  </div>
                                </div>

                                {/* Financial Split & Manual Actions */}
                                <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                                  <div className="text-left md:text-right space-y-0.5">
                                    <div className={`font-extrabold font-oswald text-base ${isPaid ? 'line-through text-slate-400' : 'text-[#1A265A]'}`}>
                                      Netto 85%: CHF {formatCHF(netEarnings)}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      Brutto CHF {formatCHF(booking.pricePaid)} · 15% Prov. CHF {formatCHF(platformFee)}
                                    </div>
                                  </div>

                                  {/* Individual Toggle Button */}
                                  <button
                                    onClick={() => toggleBookingPaidOut(booking.id)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                      isPaid
                                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
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
                      )}

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Safety Confirmation Modal for Payout Execution */}
      {confirmModalOpen && confirmTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-150"
            onClick={() => setConfirmModalOpen(false)}
          />

          {/* Dialog Container */}
          <div className="relative z-10 bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-[#1A265A] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#50A5B1]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F1600D]/20 border border-[#F1600D]/40 flex items-center justify-center text-[#F1600D]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-oswald text-lg uppercase font-medium tracking-wide">
                    Auszahlung bestätigen
                  </h4>
                  <p className="text-[11px] text-white/70">
                    Sicherheitsabfrage vor Abschluss der Transaktionen
                  </p>
                </div>
              </div>

              <button
                onClick={() => setConfirmModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              <p className="leading-relaxed">
                {confirmTarget.mode === 'all' ? (
                  <>
                    Möchtest du <strong>alle {confirmTarget.lessonCount} fälligen Lektionen</strong> bis zum Stichtag <strong>{cutoffDate}</strong> als <em>"Ausbezahlt"</em> markieren?
                  </>
                ) : (
                  <>
                    Möchtest du für <strong>{confirmTarget.coachName}</strong> alle <strong>{confirmTarget.lessonCount} Lektion(en)</strong> bis zum Stichtag <strong>{cutoffDate}</strong> als <em>"Ausbezahlt"</em> markieren?
                  </>
                )}
              </p>

              {/* Summary Stats Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Zahlungs-Stichtag:</span>
                  <span className="font-bold text-[#1A265A] font-mono">{cutoffDate}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Anzahl Lektionen:</span>
                  <span className="font-bold text-[#1A265A]">{confirmTarget.lessonCount} Lektion(en)</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                  <span className="font-bold text-[#1A265A]">Gesamtauszahlung (85% Netto):</span>
                  <span className="font-extrabold text-[#F1600D] font-oswald text-base">
                    CHF {formatCHF(confirmTarget.totalAmountCHF)}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Hinweis:</strong> Die Lektionen werden mit dem heutigen Zeitstempel versehen. Der Status wechselt auf <em>"Ausbezahlt"</em>.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer text-xs"
              >
                Abbrechen
              </button>

              <button
                type="button"
                onClick={executePayout}
                className="px-5 py-2.5 rounded-xl bg-[#F1600D] hover:bg-[#d85207] text-white font-extrabold shadow-md transition cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Ja, jetzt als ausbezahlt markieren</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
