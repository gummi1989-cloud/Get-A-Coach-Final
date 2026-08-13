import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPayoutsTab } from './AdminPayoutsTab';
import {
  ShieldCheck,
  Users,
  UserCheck,
  Award,
  TrendingUp,
  Banknote,
  CalendarCheck,
  BarChart3,
  LogOut,
  ArrowLeft,
  Sparkles,
  PieChart,
  CheckCircle2,
  Clock,
  Building2,
  Lock
} from 'lucide-react';

interface AdminDashboardProps {
  initialSubTab?: 'overview' | 'payouts';
  onBackToApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialSubTab = 'overview',
  onBackToApp
}) => {
  const { currentUser, coaches, bookings, logout } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'payouts'>(
    initialSubTab === 'payouts' ? 'payouts' : 'overview'
  );

  // Key KPI Calculations
  const totalRegisteredCustomers = 0; // Unique registered customers count reset to 0
  const activeCoaches = coaches.filter(c => c.isProfileActive);
  const totalActiveCoaches = activeCoaches.length;
  const totalCoaches = coaches.length;

  const completedBookings = bookings.filter(b => b.status === 'abgeschlossen');
  const totalCompletedLessons = completedBookings.length;

  // Revenue & 15% Platform Commission
  const totalGrossRevenue = bookings
    .filter(b => b.status === 'bestaetigt' || b.status === 'abgeschlossen')
    .reduce((sum, b) => sum + b.pricePaid, 0);

  const totalPlatformCommission15Percent = totalGrossRevenue * 0.15;
  const totalCoachPayouts85Percent = totalGrossRevenue * 0.85;

  const handleLogout = () => {
    logout();
    onBackToApp();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Top Header Bar for Host Admin */}
      <div className="bg-[#1A265A] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 border border-[#50A5B1]/30">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#50A5B1]/20 rounded-xl sm:rounded-2xl flex items-center justify-center border border-[#50A5B1]/40 shrink-0">
            <Lock className="w-5 h-5 sm:w-7 sm:h-7 text-[#50A5B1]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#F1600D] text-white text-[9px] sm:text-[10px] font-extrabold uppercase px-2 sm:px-2.5 py-0.5 rounded-full tracking-wider">
                Host Admin
              </span>
              <span className="text-[11px] sm:text-xs text-[#50A5B1] font-mono truncate max-w-[160px] sm:max-w-none">
                {currentUser.email}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-oswald font-medium uppercase tracking-wide mt-1">
              Plattform-Host Dashboard
            </h1>
            <p className="text-[11px] sm:text-xs text-[#FEF6ED]/70 leading-tight">
              GET A COACH.ch · Kennzahlen & Auszahlungs-Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          <button
            onClick={onBackToApp}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#50A5B1]" />
            <span>Zur Plattform</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-red-500/30"
          >
            <LogOut className="w-3.5 h-3.5 text-red-300" />
            <span>Abmelden</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl font-oswald font-medium uppercase text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-[#1A265A] text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#50A5B1] shrink-0" />
          <span>Dashboard & Kennzahlen</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payouts')}
          className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl font-oswald font-medium uppercase text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'payouts'
              ? 'bg-[#1A265A] text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Banknote className="w-4 h-4 text-[#F1600D] shrink-0" />
          <span className="truncate">Auszahlungs-Management (85%)</span>
        </button>
      </div>

      {/* SUB-TAB 1: OVERVIEW KPI DASHBOARD */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 sm:space-y-8">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* KPI 1: Customers */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  Registrierte Kund:innen
                </span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-sky-50 text-[#50A5B1] rounded-2xl flex items-center justify-center font-bold">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-[#1A265A] font-oswald">
                  {totalRegisteredCustomers}
                </div>
                <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
                  0 aktive Anmeldungen
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Aktiv registrierte Sportler:innen
              </p>
            </div>

            {/* KPI 2: Active Coaches */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Aktive Coaches (Profil Live)
                </span>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-emerald-700 font-oswald">
                  {totalActiveCoaches} <span className="text-sm font-sans font-normal text-slate-400">/ {totalCoaches} insg.</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                  100% verifizierte Auszahlung
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Vollständige Profile im Katalog
              </p>
            </div>

            {/* KPI 3: Completed Lessons */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Durchgeführte Lektionen
                </span>
                <div className="w-10 h-10 bg-orange-50 text-[#F1600D] rounded-2xl flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-[#1A265A] font-oswald">
                  {totalCompletedLessons}
                </div>
                <span className="text-[11px] text-[#F1600D] font-semibold mt-1 inline-block">
                  7-Tage Blind-Ratings aktiv
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Absolvierte Coaching-Sessions
              </p>
            </div>

            {/* KPI 4: Gross Volume & 15% Platform Revenue */}
            <div className="bg-[#1A265A] text-white p-6 rounded-3xl shadow-md space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#50A5B1]">
                  Plattform-Umsatz & Fee
                </span>
                <div className="w-10 h-10 bg-white/10 text-[#F1600D] rounded-2xl flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white font-oswald">
                  CHF {totalGrossRevenue.toFixed(2)}
                </div>
                <span className="text-xs font-bold text-[#F1600D] bg-white/10 px-2.5 py-0.5 rounded-md mt-1 inline-block">
                  15% Provision: CHF {totalPlatformCommission15Percent.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                Netto-Anteil Coaches (85%): CHF {totalCoachPayouts85Percent.toFixed(2)}
              </p>
            </div>

          </div>

          {/* Detailed Financial & Platform Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Financial Revenue Model Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#50A5B1]" />
                  <h3 className="font-oswald text-lg font-medium uppercase text-[#1A265A]">
                    Provisions-Aufteilung & Plattform-Einnahmen
                  </h3>
                </div>
                <span className="bg-[#FEF6ED] text-[#F1600D] font-bold text-xs px-3 py-1 rounded-full border border-[#F1600D]/20">
                  Transparente 15% Fee
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Coaches Auszahlungs-Anteil (85%)
                  </span>
                  <div className="text-2xl font-extrabold text-[#1A265A] font-oswald">
                    CHF {totalCoachPayouts85Percent.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Geht direkt an die ausführenden Coaches nach erfolgreicher Absolvierung der Lektion.
                  </p>
                </div>

                <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-200/60 space-y-2">
                  <span className="text-xs font-bold text-[#F1600D] uppercase">
                    Plattform-Host Provision (15%)
                  </span>
                  <div className="text-2xl font-extrabold text-[#F1600D] font-oswald">
                    CHF {totalPlatformCommission15Percent.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Verbleibt beim Plattform-Host für Vermittlung, Zahlungsabwicklung, Support & Infrastruktur.
                  </p>
                </div>
              </div>

              {/* Quick Navigation to Payouts */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Sammelüberweisungen für Coaches ausführen
                </div>
                <button
                  onClick={() => setActiveSubTab('payouts')}
                  className="w-full sm:w-auto px-4 py-2 bg-[#1A265A] hover:bg-[#263773] text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Banknote className="w-4 h-4 text-[#F1600D] shrink-0" />
                  <span>Zum Auszahlungs-Management</span>
                </button>
              </div>

            </div>

            {/* Quick Host Rules & Quality Control */}
            <div className="bg-[#FEF6ED] p-6 rounded-3xl border border-[#F1600D]/20 space-y-4">
              <div className="flex items-center gap-2 text-[#1A265A]">
                <ShieldCheck className="w-5 h-5 text-[#F1600D]" />
                <h3 className="font-oswald text-lg font-medium uppercase">
                  Qualitätssicherung
                </h3>
              </div>

              <ul className="text-xs space-y-2 text-[#1A265A]/80 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Coaches benötigen zwingend IBAN, Kontoinhaber & AGB-Zustimmung vor Freischaltung.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Stornierungen &gt;24h werden zu 100% an die Kund:innen rückerstattet.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Blind-Ratings werden nach 7 Tagen automatisch freigeschaltet.</span>
                </li>
              </ul>

              <div className="pt-2">
                <span className="bg-white px-3 py-1.5 rounded-xl border border-[#F1600D]/20 text-[11px] font-bold text-[#1A265A] inline-block">
                  Auszahlungsrhythmus: Individuell per Stichtag
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 2: PAYOUTS MANAGEMENT */}
      {activeSubTab === 'payouts' && <AdminPayoutsTab />}

    </div>
  );
};
