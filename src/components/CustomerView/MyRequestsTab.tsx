import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Calendar,
  Users,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Ban,
  Download,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { CustomRequest, Booking } from '../../types';

export const MyRequestsTab: React.FC = () => {
  const {
    currentUser,
    customRequests,
    bookings,
    withdrawCustomRequest,
    acceptAndPayCustomOffer,
    cancelBooking
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'pending' | 'offers' | 'accepted' | 'closed'>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'TWINT' | 'Kreditkarte'>('TWINT');
  const [payingRequestId, setPayingRequestId] = useState<string | null>(null);
  const [withdrawConfirmId, setWithdrawConfirmId] = useState<string | null>(null);
  const [withdrawBookingId, setWithdrawBookingId] = useState<string | null>(null);

  // Filter client's custom requests
  const myCustomRequests = customRequests.filter(r => r.userId === currentUser.id);

  // Filter client's 2h-reservation slot requests
  const mySlotRequests = bookings.filter(
    b => b.userId === currentUser.id && b.requestStatus !== undefined
  );

  const myPendingSlotRequests = mySlotRequests.filter(b => b.requestStatus === 'anfrage_ausstehend');

  // Filtered lists based on tab filter
  const filteredCustomRequests = myCustomRequests.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'ausstehend' || r.status === 'offen';
    if (filter === 'offers') return r.status === 'angebot_erstellt' || r.status === 'angebot_gesendet';
    if (filter === 'accepted') return r.status === 'angenommen' || r.status === 'akzeptiert';
    if (filter === 'closed') return r.status === 'abgelehnt' || r.status === 'zurueckgezogen';
    return true;
  });

  const filteredSlotRequests = mySlotRequests.filter(b => {
    if (filter === 'all' || filter === 'pending') return b.requestStatus === 'anfrage_ausstehend';
    if (filter === 'closed') return b.requestStatus === 'abgelehnt' || b.requestStatus === 'zurueckgezogen' || b.requestStatus === 'abgelaufen';
    return false;
  });

  // Calculate live countdown for reservedUntil
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRemainingTime = (reservedUntil?: string) => {
    if (!reservedUntil) return '2:00:00';
    const target = new Date(reservedUntil).getTime();
    const diffMs = target - now.getTime();
    if (diffMs <= 0) return 'Abgelaufen';

    const totalSecs = Math.floor(diffMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;

    return `${hours > 0 ? hours + 'h ' : ''}${remMins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleWithdrawCustomRequest = (id: string) => {
    withdrawCustomRequest(id);
    setWithdrawConfirmId(null);
  };

  const handleWithdrawSlotRequest = (bookingId: string) => {
    cancelBooking(bookingId);
    setWithdrawBookingId(null);
  };

  const handlePayOffer = (requestId: string) => {
    acceptAndPayCustomOffer(requestId, selectedPaymentMethod);
    setPayingRequestId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A265A] via-[#263773] to-[#50A5B1] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#50A5B1]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-oswald font-medium uppercase tracking-wide text-white flex items-center gap-3">
            <Inbox className="w-8 h-8 sm:w-10 sm:h-10 text-white bg-white/10 p-2 rounded-2xl shrink-0" />
            <span>Meine Anfragen & Wünsche</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl">
            Hier siehst du alle deine gestellten Lektions-Anfragen und individuellen Coaching-Wünsche. Du kannst Angebote direkt annehmen oder Anfragen jederzeit mit 1 Klick zurückziehen.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shrink-0">
          <div className="text-center px-2">
            <div className="text-xl font-extrabold text-[#F1600D]">
              {myCustomRequests.filter(r => r.status === 'ausstehend' || r.status === 'angebot_erstellt').length + myPendingSlotRequests.length}
            </div>
            <div className="text-[10px] text-white/80 uppercase font-semibold">Aktive Anfragen</div>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-xl font-extrabold text-[#50A5B1]">
              {myCustomRequests.filter(r => r.status === 'angebot_erstellt').length}
            </div>
            <div className="text-[10px] text-white/80 uppercase font-semibold">Offene Angebote</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            filter === 'all'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'bg-white text-[#1A265A]/70 hover:bg-[#FEF6ED] border border-[#50A5B1]/20'
          }`}
        >
          Alle ({myCustomRequests.length + myPendingSlotRequests.length})
        </button>

        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            filter === 'pending'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'bg-white text-[#1A265A]/70 hover:bg-[#FEF6ED] border border-[#50A5B1]/20'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#50A5B1]" />
          Offen / Ausstehend ({myCustomRequests.filter(r => r.status === 'ausstehend' || r.status === 'offen').length + myPendingSlotRequests.length})
        </button>

        <button
          onClick={() => setFilter('offers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            filter === 'offers'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'bg-white text-[#1A265A]/70 hover:bg-[#FEF6ED] border border-[#50A5B1]/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#50A5B1]" />
          Angebote Erhalten ({myCustomRequests.filter(r => r.status === 'angebot_erstellt' || r.status === 'angebot_gesendet').length})
        </button>

        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            filter === 'accepted'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'bg-white text-[#1A265A]/70 hover:bg-[#FEF6ED] border border-[#50A5B1]/20'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#50A5B1]" />
          Angenommen ({myCustomRequests.filter(r => r.status === 'angenommen' || r.status === 'akzeptiert').length})
        </button>

        <button
          onClick={() => setFilter('closed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            filter === 'closed'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'bg-white text-[#1A265A]/70 hover:bg-[#FEF6ED] border border-[#50A5B1]/20'
          }`}
        >
          <Ban className="w-3.5 h-3.5 text-[#50A5B1]" />
          Storniert / Zurückgezogen ({myCustomRequests.filter(r => r.status === 'abgelehnt' || r.status === 'zurueckgezogen').length})
        </button>
      </div>

      {/* SECTION 1: Standard 2-Hour Slot Reservation Requests */}
      {filteredSlotRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#50A5B1]" />
            <h2 className="text-lg font-bold text-[#1A265A]">
              Lektionen-Reservierungen (2-Stunden-Sperre)
            </h2>
            <span className="text-xs bg-[#F1600D]/10 text-[#F1600D] font-bold px-2.5 py-0.5 rounded-full">
              {filteredSlotRequests.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSlotRequests.map(req => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 border-2 border-[#F1600D]/40 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase bg-[#F1600D] text-white px-2 py-0.5 rounded-md inline-block mb-1 shadow-xs">
                      2h Slot-Reservierung
                    </span>
                    <h3 className="font-bold text-[#1A265A] text-base">{req.sessionTitle}</h3>
                    <p className="text-xs text-[#50A5B1] font-semibold mt-0.5">Coach: {req.coachName}</p>
                  </div>

                  {/* Countdown badge */}
                  <div className="text-right bg-[#FEF6ED] border border-[#F1600D]/30 px-3 py-1.5 rounded-xl shrink-0">
                    <div className="text-[10px] text-[#1A265A]/70 font-bold uppercase">Verbleibende Zeit</div>
                    <div className="text-xs font-mono font-black text-[#F1600D]">
                      {getRemainingTime(req.reservedUntil)}
                    </div>
                  </div>
                </div>

                {/* Details list */}
                <div className="bg-[#FEF6ED]/60 rounded-xl p-3 text-xs space-y-1.5 text-[#1A265A]/80 border border-[#50A5B1]/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#50A5B1]" />
                    <span><strong>Datum & Zeit:</strong> {req.date} ({req.time})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-[#50A5B1]" />
                    <span><strong>Betrag:</strong> CHF {req.pricePaid.toFixed(2)} ({req.paymentMethod})</span>
                  </div>
                  {req.pdfAttachment && (
                    <div className="flex items-center gap-2 text-[#50A5B1] font-semibold">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Anhang: {req.pdfAttachment.name}</span>
                    </div>
                  )}
                </div>

                {/* Action button: Withdraw */}
                <div className="pt-2 border-t border-[#50A5B1]/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#1A265A]/60 italic">
                    Wartet auf Bestätigung des Coaches...
                  </span>

                  {withdrawBookingId === req.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleWithdrawSlotRequest(req.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Ja, Stornieren
                      </button>
                      <button
                        onClick={() => setWithdrawBookingId(null)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#1A265A] font-semibold text-xs rounded-xl transition cursor-pointer"
                      >
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setWithdrawBookingId(req.id)}
                      className="px-3 py-1.5 border border-rose-200 hover:border-rose-400 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Anfrage Zurückziehen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Custom Individual Requests */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#50A5B1]" />
          <h2 className="text-lg font-bold text-[#1A265A]">
            Spezielle & Individuelle Anfragen ({filteredCustomRequests.length})
          </h2>
        </div>

        {filteredCustomRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#50A5B1]/20 shadow-2xs space-y-3">
            <Inbox className="w-12 h-12 text-[#50A5B1]/60 mx-auto" />
            <h3 className="font-bold text-[#1A265A] text-sm">Keine passenden Anfragen in dieser Ansicht</h3>
            <p className="text-xs text-[#1A265A]/70 max-w-md mx-auto">
              Du hast in dieser Kategorie aktuell keine gestellten Anfragen. Du kannst bei jedem Coach über das Profil ein individuelles Spezial-Angebot anfragen.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCustomRequests.map(req => {
              const isPending = req.status === 'ausstehend' || req.status === 'offen';
              const hasOffer = req.status === 'angebot_erstellt' || req.status === 'angebot_gesendet';
              const isAccepted = req.status === 'angenommen' || req.status === 'akzeptiert';
              const isClosed = req.status === 'abgelehnt' || req.status === 'zurueckgezogen';

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition shadow-xs space-y-4 ${
                    hasOffer
                      ? 'border-2 border-emerald-500/60 ring-2 ring-emerald-500/10'
                      : isPending
                      ? 'border-[#F1600D]/30'
                      : 'border-[#50A5B1]/20 opacity-90'
                  }`}
                >
                  {/* Top Bar: Sport, Status Badge, Dates */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#50A5B1]/15">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-oswald text-lg font-medium text-[#1A265A] uppercase tracking-wide">
                          {req.sport}
                        </span>
                        <span className="text-xs bg-[#FEF6ED] text-[#1A265A] font-bold px-2.5 py-0.5 rounded-md border border-[#50A5B1]/20">
                          {req.participantsCount} {req.participantsCount === 1 ? 'Person' : 'Personen'}
                        </span>
                      </div>
                      <p className="text-xs text-[#50A5B1] font-semibold mt-0.5">
                        Coach: <strong>{req.coachName}</strong>
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          In Bearbeitung beim Coach
                        </span>
                      )}
                      {hasOffer && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-extrabold rounded-full animate-bounce">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Angebot Erhalten! (CHF {req.offerPrice?.toFixed(2)})
                        </span>
                      )}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          Angenommen & Gebucht
                        </span>
                      )}
                      {req.status === 'abgelehnt' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-full">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Vom Coach Abgelehnt
                        </span>
                      )}
                      {req.status === 'zurueckgezogen' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded-full">
                          <Ban className="w-3.5 h-3.5 text-slate-400" />
                          Von dir zurückgezogen
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Column 1: Client Request Details */}
                    <div className="md:col-span-2 space-y-2">
                      <div className="font-bold text-[#1A265A] uppercase tracking-wider text-[11px] text-[#50A5B1]">
                        Deine Anfrage-Details
                      </div>
                      <p className="text-[#1A265A]/80 italic bg-[#FEF6ED]/70 p-3 rounded-xl border border-[#50A5B1]/10">
                        "{req.description}"
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[#1A265A]/70 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#50A5B1]" />
                          Wunschdatum: <strong>{req.preferredDate}</strong>
                        </span>
                        {req.preferredTimeWindow && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#50A5B1]" />
                            Zeitfenster: <strong>{req.preferredTimeWindow}</strong>
                          </span>
                        )}
                        <span className="text-[10px] text-[#1A265A]/50 ml-auto">
                          Erstellt am: {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Column 2: Offer Panel from Coach if available */}
                    <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/20 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="font-extrabold text-[#1A265A] text-xs flex items-center justify-between">
                          <span>COACH-ANGEBOT</span>
                          {req.offerPrice && (
                            <span className="text-sm font-extrabold text-[#F1600D]">
                              CHF {req.offerPrice.toFixed(2)}.–
                            </span>
                          )}
                        </div>

                        {req.offerMessage ? (
                          <div className="mt-2 text-xs text-[#1A265A]/80 space-y-1">
                            <p className="font-medium text-[#1A265A]">"{req.offerMessage}"</p>
                            {req.offerDate && (
                              <p className="text-[11px] text-[#50A5B1]">
                                📅 Termin: {req.offerDate} ({req.offerTime || 'nach Vereinbarung'})
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 text-[11px] text-[#1A265A]/60 italic">
                            {isPending ? 'Coach prüft aktuell Verfügbarkeiten...' : 'Kein spezifisches Angebot vorliegend.'}
                          </p>
                        )}

                        {req.pdfAttachment && (
                          <div className="mt-2 pt-2 border-t border-[#50A5B1]/20 flex items-center justify-between text-xs">
                            <span className="truncate max-w-[140px] text-[#50A5B1] font-semibold">
                              📎 {req.pdfAttachment.name}
                            </span>
                            <a
                              href={req.pdfAttachment.url}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#F1600D] font-bold hover:underline flex items-center gap-1 shrink-0"
                            >
                              <Download className="w-3 h-3" />
                              PDF
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Pay Offer Action */}
                      {hasOffer && (
                        <div className="pt-2 border-t border-[#50A5B1]/20 space-y-2">
                          {payingRequestId === req.id ? (
                            <div className="space-y-2 bg-white p-3 rounded-xl border border-emerald-300 shadow-xs">
                              <label className="text-[10px] font-bold text-[#1A265A] block uppercase">
                                Zahlungsart Wählen:
                              </label>
                              <div className="grid grid-cols-2 gap-1">
                                {(['TWINT', 'Kreditkarte'] as const).map(pm => (
                                  <button
                                    key={pm}
                                    type="button"
                                    onClick={() => setSelectedPaymentMethod(pm)}
                                    className={`py-1 text-[10px] font-bold rounded-lg border transition ${
                                      selectedPaymentMethod === pm
                                        ? 'bg-[#1A265A] text-white border-[#1A265A]'
                                        : 'bg-slate-50 text-[#1A265A]/70 border-slate-200'
                                    }`}
                                  >
                                    {pm}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => handlePayOffer(req.id)}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1"
                              >
                                <span>Jetzt Bezahlen (CHF {req.offerPrice?.toFixed(2)})</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setPayingRequestId(req.id)}
                              className="w-full py-2.5 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>Angebot Akzeptieren & Bezahlen</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Bar: Withdraw Action for Customer */}
                  {(isPending || hasOffer) && (
                    <div className="pt-3 border-t border-[#50A5B1]/15 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-[#1A265A]/60 italic">
                        Möchtest du diese Anfrage nicht mehr verfolgen?
                      </span>

                      {withdrawConfirmId === req.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-700">Anfrage wirklich zurückziehen?</span>
                          <button
                            onClick={() => handleWithdrawCustomRequest(req.id)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Ja, Zurückziehen
                          </button>
                          <button
                            onClick={() => setWithdrawConfirmId(null)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#1A265A] font-semibold text-xs rounded-xl transition cursor-pointer"
                          >
                            Abbrechen
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setWithdrawConfirmId(req.id)}
                          className="px-3 py-1.5 border border-rose-200 hover:border-rose-400 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Anfrage Zurückziehen</span>
                        </button>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
