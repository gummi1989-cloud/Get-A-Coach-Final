import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { MOCK_COACH_PROFILE } from '../../data/mockData';
import { InternalCalendarManager } from './InternalCalendarManager';
import { CalendarSyncAndExportCard } from './CalendarSyncAndExportCard';
import { CoachPayoutReceiptModal } from './CoachPayoutReceiptModal';
import { CreateSessionModal } from './CreateSessionModal';
import {
  TrendingUp,
  Calendar,
  Star,
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  CalendarCheck,
  Download,
  Coins,
  FileText,
  CreditCard,
  Receipt,
  Sparkles,
  MessageSquare,
  Mail,
  MapPin,
  XCircle,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react';

interface CoachDashboardProps {
  activeSubTab?: string;
  setActiveTab?: (tab: string) => void;
  onOpenTaxInfo?: () => void;
  onOpenChat?: () => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({
  activeSubTab,
  setActiveTab,
  onOpenTaxInfo,
  onOpenChat
}) => {
  const {
    coaches,
    currentUser,
    bookings,
    customRequests,
    acceptBookingRequest,
    rejectBookingRequest,
    retroactiveConfirmRequest,
    createCustomOffer,
    cancelBooking,
    sendChatMessage
  } = useApp();

  const currentCoach = coaches.find(c => c.userId === currentUser.id || c.id === currentUser.id) || coaches[0] || MOCK_COACH_PROFILE;
  const coachBookings = bookings.filter(b => b.coachId === currentCoach.id);
  const pendingBookingRequests = coachBookings.filter(b => b.requestStatus === 'anfrage_ausstehend' || b.requestStatus === 'abgelaufen');
  const coachCustomRequests = customRequests.filter(r => r.coachId === currentCoach.id);

  // Confirmed bookings filter
  const confirmedBookings = coachBookings.filter(b => {
    if (b.status === 'storniert_gt24h' || b.status === 'storniert_lt24h') return false;
    if (b.status === 'bestaetigt' || b.status === 'abgeschlossen' || b.requestStatus === 'bestaetigt') return true;
    if (!b.requestStatus) return true;
    return false;
  });

  const [activeDashboardTab, setActiveDashboardTab] = useState<
    'requests' | 'calendar' | 'confirmed' | 'ical_export' | 'overview' | 'accounting'
  >('overview');

  useEffect(() => {
    if (activeSubTab) {
      if (activeSubTab === 'coach_calendar') setActiveDashboardTab('calendar');
      else if (activeSubTab === 'coach_confirmed') setActiveDashboardTab('confirmed');
      else if (activeSubTab === 'coach_requests') setActiveDashboardTab('requests');
      else if (activeSubTab === 'coach_ms_sync') setActiveDashboardTab('ical_export');
      else if (activeSubTab === 'coach_accounting') setActiveDashboardTab('accounting');
      else if (activeSubTab === 'coach_overview' || activeSubTab === 'coach_dashboard') setActiveDashboardTab('overview');
    }
  }, [activeSubTab]);

  const handleTabClick = (
    tab: 'calendar' | 'confirmed' | 'requests' | 'ical_export' | 'overview' | 'accounting'
  ) => {
    setActiveDashboardTab(tab);
    if (setActiveTab) {
      if (tab === 'calendar') setActiveTab('coach_calendar');
      else if (tab === 'confirmed') setActiveTab('coach_confirmed');
      else if (tab === 'requests') setActiveTab('coach_requests');
      else if (tab === 'ical_export') setActiveTab('coach_ms_sync');
      else if (tab === 'accounting') setActiveTab('coach_accounting');
      else if (tab === 'overview') setActiveTab('coach_overview');
    }
  };

  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState<boolean>(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('Juli 2026');
  const [autoPrintReceipt, setAutoPrintReceipt] = useState<boolean>(false);
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string>('Juni 2026');

  const archiveMonths: Array<{ id: string; label: string; courses: number; gross: number; fee: number; net: number }> = [];

  // Calculate gross earnings, 15% commission and 85% net payout
  const totalGrossEarnings = coachBookings.reduce((sum, b) => {
    if (b.status === 'storniert_gt24h') return sum;
    if (b.status === 'storniert_lt24h') return sum + (b.coachCompensation || b.pricePaid * 0.5);
    return sum + b.pricePaid;
  }, 0);

  const totalPlatformCommission = totalGrossEarnings * 0.15;
  const totalNetPayout = totalGrossEarnings * 0.85;

  // YTD (Jahresumsatz 2026 - Laufendes Jahr)
  const ytdGross = totalGrossEarnings + archiveMonths.reduce((sum, m) => sum + m.gross, 0);
  const ytdFee = totalPlatformCommission + archiveMonths.reduce((sum, m) => sum + m.fee, 0);
  const ytdNet = totalNetPayout + archiveMonths.reduce((sum, m) => sum + m.net, 0);
  const ytdCourses = coachBookings.length + archiveMonths.reduce((sum, m) => sum + m.courses, 0);

  const selectedArchiveData = archiveMonths.find(m => m.id === selectedArchiveMonth) || archiveMonths[0] || {
    id: 'Keine Archive', label: 'Keine Daten', courses: 0, gross: 0, fee: 0, net: 0
  };

  const completedCount = coachBookings.filter(b => b.status === 'abgeschlossen' || b.status === 'bestaetigt').length;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Header & KPI Cards (Shown on Overview only) */}
      {activeDashboardTab === 'overview' && (
        <>
          {/* Top Welcome Header */}
          <div className="bg-gradient-to-r from-[#F1600D] via-[#f3772b] to-[#d85208] text-white rounded-3xl p-6 sm:p-8 border border-orange-400/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={currentCoach.avatar}
                alt={currentCoach.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/50 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl text-white">{currentCoach.name}</h2>
                  {currentCoach.isVerified ? (
                    <span className="bg-white/20 text-white font-semibold text-xs px-2.5 py-0.5 rounded-full border border-white/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
                      Ausweis Verifiziert
                    </span>
                  ) : (
                    <span className="bg-white/20 text-white font-semibold text-xs px-2.5 py-0.5 rounded-full border border-white/30">
                      Ausweis-Check Ausstehend
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#FEF6ED]/90 mt-1">
                  {(currentCoach.sports || []).join(', ')} · {currentCoach.locationName || ''}
                </p>
              </div>
            </div>

            {/* Action Button & Status */}
            <div className="flex flex-wrap items-center gap-2.5">
              {onOpenTaxInfo && (
                <button
                  onClick={onOpenTaxInfo}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/30 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-200" />
                  <span>Steuern & Rechtliches</span>
                </button>
              )}
            </div>
          </div>

          {/* KPI Cards Grid with Transparent 15% Platform Fee & 85% Net Payout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Net Payout Card */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/30 shadow-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-[#1A265A]/70">
                <span className="text-[11px] font-semibold text-emerald-800">Netto-Auszahlung (85%)</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700">CHF {totalNetPayout.toFixed(2)}</div>
              <div className="text-[10px] bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded border border-emerald-200 inline-block">
                ✓ Direkt auf IBAN ausbezahlt
              </div>
            </div>

            {/* Gross Revenue & Fee Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-[#50A5B1]/20 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#1A265A]/70">
                <span className="text-[11px] font-semibold">Bruttoumsatz Kunden</span>
                <TrendingUp className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-xl font-bold text-[#1A265A]">CHF {totalGrossEarnings.toFixed(2)}</div>
              <div className="text-[11px] text-amber-700 font-medium">
                Abzüglich 15% Provision: <strong>-CHF {totalPlatformCommission.toFixed(2)}</strong> (All-in)
              </div>
            </div>

            {/* Lessons Count */}
            <div className="bg-white p-5 rounded-2xl border border-[#50A5B1]/20 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#1A265A]/70">
                <span className="text-[11px] font-semibold">Gebuchte Lektionen</span>
                <Calendar className="w-4 h-4 text-[#50A5B1]" />
              </div>
              <div className="text-2xl font-bold text-[#1A265A]">{completedCount}</div>
              <div className="text-[11px] text-[#1A265A]/60">Inkl. Gruppen- & Einzelkurse</div>
            </div>

            {/* Average Rating */}
            <div className="bg-white p-5 rounded-2xl border border-[#50A5B1]/20 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#1A265A]/70">
                <span className="text-[11px] font-semibold">Notendurchschnitt</span>
                <Star className="w-4 h-4 text-[#F1600D] fill-[#F1600D]" />
              </div>
              <div className="text-2xl font-bold text-[#1A265A]">{currentCoach.rating.toFixed(2)} ★</div>
              <div className="text-[11px] text-[#1A265A]/60">Basiert auf {currentCoach.reviewCount} Ratings</div>
            </div>

          </div>
        </>
      )}

      {/* Tab Content */}
      {(activeDashboardTab === 'calendar' || activeDashboardTab === 'ical_export') && (
        <div className="space-y-6">
          <InternalCalendarManager onOpenCreateSessionModal={() => setShowAddSessionModal(true)} />
          <CalendarSyncAndExportCard />
        </div>
      )}

      {/* BESTÄTIGTE BUCHUNGEN VIEW */}
      {activeDashboardTab === 'confirmed' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#F1600D] via-[#f3772b] to-[#d85208] text-white rounded-3xl p-6 sm:p-8 border border-orange-400/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-oswald font-medium uppercase tracking-wide text-white flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white bg-white/10 p-2 rounded-2xl shrink-0" />
                <span>Bestätigte Kunden-Buchungen</span>
              </h1>
              <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
                Sämtliche von Kunden gebuchten und bezahlten Lektionen. Du kannst deine Kunden hier direkt kontaktieren, Gutschriften einsehen oder bei Bedarf Stornierungen vornehmen.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/20 shadow-xs space-y-4">
            {confirmedBookings.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#1A265A]/60 bg-[#FEF6ED] rounded-2xl border border-[#50A5B1]/20 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-[#1A265A]">Zurzeit keine bestätigten Buchungen in der Liste.</p>
                <p className="text-[11px] text-[#1A265A]/60">
                  Sobald ein Kunde eine Lektion bucht oder du eine Anfrage akzeptierst, erscheint die gebuchte Lektion hier.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {confirmedBookings.map(b => {
                  const gross = b.status === 'storniert_lt24h' ? (b.coachCompensation || b.pricePaid * 0.5) : b.pricePaid;
                  const net = gross * 0.85;

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-[#50A5B1]/30 p-5 shadow-xs hover:border-[#F1600D]/50 transition space-y-4"
                    >
                      {/* Top bar with Session title & date */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#50A5B1]/15 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-base text-[#1A265A]">{b.sessionTitle}</h4>
                            <span className="bg-[#1A265A] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                              {b.sport || 'Coaching'}
                            </span>
                            {b.status === 'abgeschlossen' ? (
                              <span className="bg-blue-100 text-blue-900 border border-blue-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                Abgeschlossen
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Bestätigt & Bezahlt
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-[#1A265A]/80 flex flex-wrap items-center gap-3">
                            <span>📅 <strong>Datum:</strong> {b.date}</span>
                            <span>⏰ <strong>Zeit:</strong> {b.time}</span>
                            <span>📍 <strong>Ort:</strong> {b.locationName || 'Zürich'}</span>
                          </div>
                        </div>

                        {/* Booking reference */}
                        <div className="text-right text-[10px] text-[#1A265A]/60 font-mono">
                          ID: {b.id.slice(0, 12)}...
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        
                        {/* Customer Info */}
                        <div className="bg-[#FEF6ED]/60 p-3.5 rounded-xl border border-[#50A5B1]/20 space-y-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#50A5B1] block">
                            Kunde
                          </span>
                          <div className="font-extrabold text-sm text-[#1A265A] flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#F1600D]" />
                            {b.userName}
                          </div>
                          <div className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 inline-block">
                            Zahlung erhalten ({b.paymentMethod || 'TWINT'})
                          </div>
                        </div>

                        {/* Financials */}
                        <div className="bg-[#FEF6ED]/60 p-3.5 rounded-xl border border-[#50A5B1]/20 space-y-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#50A5B1] block">
                            Einnahmen & Auszahlung
                          </span>
                          <div className="flex justify-between items-center text-[#1A265A]/80">
                            <span>Kundenpreis brutto:</span>
                            <span className="font-bold text-[#1A265A]">CHF {gross.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-amber-800">
                            <span>Plattformgebühr (15%):</span>
                            <span className="font-semibold">-CHF {(gross * 0.15).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-[#50A5B1]/20 font-black text-emerald-700 text-sm">
                            <span>Deine Netto-Auszahlung:</span>
                            <span>CHF {net.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-[#FEF6ED]/60 p-3.5 rounded-xl border border-[#50A5B1]/20 space-y-2 flex flex-col justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#50A5B1] block">
                            Coach-Aktionen
                          </span>

                          <button
                            onClick={() => {
                              sendChatMessage(
                                b.userId,
                                currentCoach.id,
                                `Hallo ${b.userName}! Ich freue mich auf unsere Lektion am ${b.date} um ${b.time}. Gibt es noch Fragen dazu?`,
                                'text'
                              );
                              if (onOpenChat) {
                                onOpenChat();
                              } else {
                                setToastMessage(`Chat-Nachricht an ${b.userName} wurde versendet!`);
                                setTimeout(() => setToastMessage(null), 4000);
                              }
                            }}
                            className="w-full py-2 px-3 bg-[#1A265A] hover:bg-[#253575] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#F1600D]" />
                            Chat mit Kunde öffnen
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedMonth('Juli 2026');
                                setShowPayoutModal(true);
                              }}
                              className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-[#1A265A] border border-slate-300 font-bold rounded-lg text-[11px] text-center cursor-pointer font-semibold"
                            >
                              Gutschrift PDF
                            </button>
                            <button
                              onClick={() => setCancellingBooking(b)}
                              className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-lg text-[11px] text-center cursor-pointer transition"
                            >
                              Stornieren
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeDashboardTab === 'requests' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* SECTION 1: Standard Buchungsanfragen (2-Stunden-Sperre) */}
          <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#50A5B1]/20">
              <div>
                <span className="bg-[#1A265A] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#F1600D]" />
                  2-Stunden-Sperre
                </span>
                <h3 className="font-extrabold text-base text-[#1A265A] mt-1 flex items-center gap-2">
                  <span>Slot-Anfragen</span>
                  <span className="w-5 h-5 rounded-full bg-[#F1600D] text-white font-extrabold text-[11px] flex items-center justify-center shadow-xs">
                    {pendingBookingRequests.length}
                  </span>
                </h3>
                <p className="text-xs text-[#1A265A]/70">
                  Sobald ein Kunde bucht, wird der Slot 2 Stunden lang reserviert. Reagierst du nicht, verfällt die Anfrage, bleibt aber hier als "Abgelaufen" zur nachträglichen Bestätigung erhalten.
                </p>
              </div>
            </div>

            {pendingBookingRequests.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-[#1A265A]/70 bg-[#FEF6ED] rounded-2xl border border-[#50A5B1]/20 space-y-2">
                <Clock className="w-8 h-8 text-[#50A5B1] mx-auto" />
                <p className="font-extrabold text-[#1A265A] text-sm">
                  Du hast aktuell keine ausstehenden Anfragen.
                </p>
                <p className="text-[11px] text-[#1A265A]/60">
                  Sobald Kunden einen deiner Termine reservieren, erscheinen die Anfragen hier.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBookingRequests.map(req => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      req.requestStatus === 'anfrage_ausstehend'
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1 text-xs text-[#1A265A]">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm">{req.sessionTitle}</span>
                        {req.requestStatus === 'anfrage_ausstehend' && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#F1600D]" />
                            Ausstehend (2h Reserviert)
                          </span>
                        )}
                        {req.requestStatus === 'abgelaufen' && (
                          <span className="bg-slate-200 text-slate-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                            Abgelaufen
                          </span>
                        )}
                      </div>
                      <div className="text-[#1A265A]/80 font-medium">
                        Kunde: <strong>{req.userName}</strong> ({req.userEmail}) · Datum: {req.date} ({req.time})
                      </div>
                      <div className="font-black text-[#1A265A]">Preis: CHF {req.pricePaid}.–</div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {req.requestStatus === 'anfrage_ausstehend' && (
                        <>
                          <button
                            onClick={() => acceptBookingRequest(req.id)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-xs"
                          >
                            Bestätigen
                          </button>
                          <button
                            onClick={() => rejectBookingRequest(req.id)}
                            className="flex-1 sm:flex-none px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Ablehnen
                          </button>
                        </>
                      )}

                      {req.requestStatus === 'abgelaufen' && (
                        <button
                          onClick={() => retroactiveConfirmRequest(req.id)}
                          className="w-full sm:w-auto px-4 py-2 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-xs"
                        >
                          Nachträglich Bestätigen (Termin sichern)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: Individuelle Anfragen von Kunden */}
          <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#50A5B1]/20">
              <div>
                <span className="bg-[#F1600D] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Spezialanfragen
                </span>
                <h3 className="font-extrabold text-base text-[#1A265A] mt-1 flex items-center gap-2">
                  <span>Individuelle Kundenanfragen</span>
                  <span className="w-5 h-5 rounded-full bg-[#F1600D] text-white font-extrabold text-[11px] flex items-center justify-center shadow-xs">
                    {coachCustomRequests.filter(r => r.status === 'ausstehend' || r.status === 'offen').length}
                  </span>
                </h3>
                <p className="text-xs text-[#1A265A]/70">
                  Kunden fragen massgeschneiderte Lektionen an. Erstelle direkt ein Angebot mit Preis in CHF und optionalem PDF-Anhang.
                </p>
              </div>
            </div>

            {coachCustomRequests.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#1A265A]/60 bg-[#FEF6ED] rounded-2xl border border-[#50A5B1]/20">
                Zurzeit keine individuellen Spezialanfragen vorhanden.
              </div>
            ) : (
              <div className="space-y-4">
                {coachCustomRequests.map(cReq => (
                  <div
                    key={cReq.id}
                    className="p-4 rounded-2xl border border-[#50A5B1]/30 bg-[#FEF6ED] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#50A5B1]/20 pb-2">
                      <div>
                        <span className="bg-[#F1600D]/20 text-[#F1600D] font-extrabold text-[10px] px-2 py-0.5 rounded">
                          {cReq.sport} · {cReq.participantsCount} Personen
                        </span>
                        <h4 className="font-extrabold text-sm text-[#1A265A] mt-1">Anfrage von {cReq.userName}</h4>
                      </div>
                      <span className={`font-extrabold text-xs px-2.5 py-1 rounded-full ${
                        cReq.status === 'offen' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        cReq.status === 'angebot_gesendet' ? 'bg-blue-100 text-blue-900' :
                        cReq.status === 'akzeptiert' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {cReq.status === 'offen' && 'Wartet auf Angebot'}
                        {cReq.status === 'angebot_gesendet' && 'Angebot gesendet'}
                        {cReq.status === 'akzeptiert' && 'Akzeptiert & Bezahlt ✓'}
                        {cReq.status === 'abgelehnt' && 'Abgelehnt'}
                      </span>
                    </div>

                    <div className="text-xs text-[#1A265A]/80 space-y-1">
                      <div>📅 <strong>Wunschdatum:</strong> {cReq.preferredDate} ({cReq.preferredTimeWindow})</div>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-[#50A5B1]/20 italic">
                        «{cReq.description}»
                      </div>
                    </div>

                    {/* Offer details if already sent */}
                    {cReq.offerPrice && (
                      <div className="bg-white p-3 rounded-xl border border-[#50A5B1]/30 text-xs space-y-1">
                        <div className="font-extrabold text-[#1A265A] flex items-center justify-between">
                          <span>Gesendetes Angebot:</span>
                          <span className="text-[#F1600D] text-sm">CHF {cReq.offerPrice}.–</span>
                        </div>
                        {cReq.offerPdfAttachment && (
                          <div className="text-[11px] text-[#50A5B1] font-bold flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            PDF Anhang: {cReq.offerPdfAttachment.name}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Offer creation form if open */}
                    {cReq.status === 'offen' && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const price = Number((form.elements.namedItem('price') as HTMLInputElement).value);
                          const sport = cReq.sport;
                          const date = cReq.preferredDate;
                          const time = cReq.preferredTimeWindow;
                          const desc = (form.elements.namedItem('description') as HTMLInputElement).value;
                          const attachPdf = (form.elements.namedItem('attachPdf') as HTMLInputElement).checked;

                          createCustomOffer(
                            cReq.id,
                            price,
                            sport,
                            date,
                            time,
                            desc,
                            attachPdf
                              ? {
                                  id: 'pdf_' + Date.now(),
                                  name: 'Spezialcoaching_Details.pdf',
                                  url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                                  sizeKb: 450,
                                  uploadedAt: new Date().toISOString()
                                }
                              : undefined
                          );
                        }}
                        className="p-3.5 bg-white rounded-xl border border-[#F1600D]/40 space-y-3 text-xs"
                      >
                        <div className="font-extrabold text-[#1A265A] flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-[#F1600D]" />
                          <span>Angebot an Kunde senden:</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold block mb-1">Angebotspreis (CHF):</label>
                            <input
                              type="number"
                              name="price"
                              defaultValue={150}
                              className="w-full p-2 rounded-lg border border-slate-300 font-extrabold text-[#1A265A]"
                              required
                            />
                          </div>
                          <div>
                            <label className="font-bold block mb-1">Kurzbeschreibung:</label>
                            <input
                              type="text"
                              name="description"
                              defaultValue="Inkl. Mietmaterial & individuelle Betreuung"
                              className="w-full p-2 rounded-lg border border-slate-300 text-[#1A265A]"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <label className="flex items-center gap-2 text-xs font-bold text-[#1A265A] cursor-pointer">
                            <input type="checkbox" name="attachPdf" defaultChecked className="rounded accent-[#F1600D]" />
                            <span>PDF-Infoblatt / Vorbereitungs-PDF beifügen</span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Verbindliches Angebot im Chat Freigeben
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {(activeDashboardTab === 'overview' || activeDashboardTab === 'accounting') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#50A5B1]/20 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#50A5B1]/10">
            <div>
              <h3 className="font-extrabold text-base text-[#1A265A] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#F1600D]" />
                Monatsabrechnungen & Gutschriften
              </h3>
              <p className="text-xs text-[#1A265A]/70 mt-0.5">
                GET A COACH.ch erstellt dir jeden Monat automatisch eine offizielle Gutschrift mit separat ausgewiesener 15%-Vermittlungsprovision für deine Buchhaltung.
              </p>
            </div>
          </div>

          {/* 1. JAHRESUMSATZ 2026 (YTD - Laufendes Jahr) - Immer angezeigt */}
          <div className="bg-gradient-to-r from-[#1A265A] via-[#21306a] to-[#1A265A] text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#F1600D]" />
                <span className="font-extrabold text-sm sm:text-base">Jahresumsatz 2026 (Laufendes Jahr YTD)</span>
              </div>
              <span className="text-xs bg-white/10 text-amber-200 border border-white/20 px-3 py-1 rounded-full font-semibold">
                Januar – Juli 2026 ({ytdCourses} Lektionen)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <span className="text-[11px] text-white/70 block">Gesamt-Brutto (Kunden)</span>
                <span className="text-base sm:text-lg font-black text-white">CHF {ytdGross.toFixed(2)}</span>
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <span className="text-[11px] text-amber-200/80 block">Provision (15% All-In)</span>
                <span className="text-base sm:text-lg font-bold text-amber-300">-CHF {ytdFee.toFixed(2)}</span>
              </div>
              <div className="bg-emerald-500/20 col-span-2 sm:col-span-1 p-3 rounded-xl border border-emerald-400/30">
                <span className="text-[11px] text-emerald-200 block">Gesamt-Netto Auszahlung (85%)</span>
                <span className="text-base sm:text-lg font-black text-emerald-300">CHF {ytdNet.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setSelectedMonth('Jahresumsatz 2026 (YTD)');
                  setAutoPrintReceipt(false);
                  setShowPayoutModal(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md hover:shadow-lg active:scale-98"
              >
                <Eye className="w-4 h-4 text-white" />
                <span>Abrechnung anzeigen (Jahresumsatz 2026)</span>
              </button>
            </div>
          </div>

          {/* 2. AKTUELLES MONAT (Juli 2026) - Immer angezeigt */}
          <div className="bg-[#FEF6ED] border border-[#F1600D]/30 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1600D]/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-extrabold text-sm text-[#1A265A]">Aktueller Monat: Juli 2026</h4>
                <span className="text-[11px] bg-[#F1600D]/10 text-[#F1600D] font-bold px-2.5 py-0.5 rounded-md border border-[#F1600D]/20">
                  Abrechnung bereit
                </span>
              </div>
              <span className="text-xs text-[#1A265A]/70 font-semibold">{coachBookings.length} Gebuchte Lektionen</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#50A5B1]/15">
                <span className="text-[10px] text-slate-500 block">Brutto Einnahmen</span>
                <span className="font-bold text-sm text-[#1A265A]">CHF {totalGrossEarnings.toFixed(2)}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#50A5B1]/15">
                <span className="text-[10px] text-slate-500 block">GET A COACH Provision (15%)</span>
                <span className="font-bold text-sm text-amber-700">-CHF {totalPlatformCommission.toFixed(2)}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-semibold block">Deine Netto-Auszahlung (85%)</span>
                <span className="font-black text-sm text-emerald-700">CHF {totalNetPayout.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end pt-1">
              <button
                onClick={() => {
                  setSelectedMonth('Juli 2026');
                  setAutoPrintReceipt(false);
                  setShowPayoutModal(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md hover:shadow-lg active:scale-98"
              >
                <Eye className="w-4 h-4 text-white" />
                <span>Abrechnung anzeigen (Juli 2026)</span>
              </button>
            </div>
          </div>

          {/* 3. ÄLTERE ABRECHNUNGEN MIT DROPDOWN */}
          <div className="border border-[#50A5B1]/20 rounded-2xl p-5 space-y-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-sm text-[#1A265A] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#50A5B1]" />
                  Ältere Monatsabrechnungen (Archiv)
                </h4>
                <p className="text-xs text-[#1A265A]/60 mt-0.5">Wähle einen vergangenen Monat aus dem Dropdown aus, um die Details einzusehen.</p>
              </div>

              {/* Dropdown Selector */}
              <div className="w-full sm:w-auto flex items-center gap-2">
                <label htmlFor="archive-month-select" className="text-xs font-bold text-[#1A265A] shrink-0">Monat:</label>
                <select
                  id="archive-month-select"
                  value={selectedArchiveMonth}
                  onChange={(e) => setSelectedArchiveMonth(e.target.value)}
                  className="w-full sm:w-auto bg-white border border-[#50A5B1]/30 rounded-xl px-3.5 py-2 text-xs font-bold text-[#1A265A] shadow-xs focus:ring-2 focus:ring-[#F1600D] focus:outline-none cursor-pointer"
                >
                  {archiveMonths.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} (Netto: CHF {m.net.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Archive Month Details Card */}
            {selectedArchiveData && (
              <div className="bg-white border border-[#50A5B1]/20 rounded-xl p-4 space-y-3 shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-[#50A5B1]/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#1A265A]">{selectedArchiveData.label}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                      Ausbezahlt
                    </span>
                  </div>
                  <span className="text-xs text-[#1A265A]/70">{selectedArchiveData.courses} Gebuchte Lektionen</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Brutto (Kunden)</span>
                    <span className="font-bold text-[#1A265A]">CHF {selectedArchiveData.gross.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Provision (15%)</span>
                    <span className="font-semibold text-amber-700">-CHF {selectedArchiveData.fee.toFixed(2)}</span>
                  </div>
                  <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 font-semibold block">Netto Auszahlung</span>
                    <span className="font-black text-emerald-700">CHF {selectedArchiveData.net.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end pt-1">
                  <button
                    onClick={() => {
                      setSelectedMonth(selectedArchiveData.label);
                      setAutoPrintReceipt(false);
                      setShowPayoutModal(true);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md hover:shadow-lg active:scale-98"
                  >
                    <Eye className="w-4 h-4 text-white" />
                    <span>Abrechnung anzeigen ({selectedArchiveData.label})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payout Statement Modal */}
      {showPayoutModal && (
        <CoachPayoutReceiptModal
          coach={currentCoach}
          bookings={coachBookings}
          monthLabel={selectedMonth}
          autoPrint={autoPrintReceipt}
          onClose={() => setShowPayoutModal(false)}
        />
      )}

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={showAddSessionModal}
        onClose={() => setShowAddSessionModal(false)}
      />

      {/* Cancellation Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#1A265A]">Buchung stornieren?</h3>
                <p className="text-xs text-slate-500">Kunde wird automatisch informiert</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1 text-[#1A265A]">
              <p className="font-bold">{cancellingBooking.sessionTitle}</p>
              <p className="text-slate-600">Kunde: <strong>{cancellingBooking.userName}</strong></p>
              <p className="text-slate-600">Datum & Zeit: {cancellingBooking.date} um {cancellingBooking.time}</p>
              <p className="text-slate-600">Preis: CHF {cancellingBooking.pricePaid.toFixed(2)}</p>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <p className="font-bold">Stornierungs-Reglement:</p>
              <p className="leading-snug">
                Bei Stornierung wird der Termin im Kalender freigegeben und dem Kunden zurückerstattet (&gt;24h vor Termin: 100% Rückerstattung / &lt;24h vor Termin: 50% Rückerstattung + 50% Ausfallsentschädigung an dich).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  const bId = cancellingBooking.id;
                  const res = cancelBooking(bId);
                  setCancellingBooking(null);
                  setToastMessage(`Die Buchung wurde erfolgreich storniert. (${res?.message || 'Kunde benachrichtigt'})`);
                  setTimeout(() => setToastMessage(null), 5000);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm cursor-pointer"
              >
                Ja, Buchung stornieren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A265A] text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
