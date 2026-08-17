import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { createDefaultCoachProfile } from '../../utils/coachUtils';
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
  Upload,
  Coins,
  Send,
  Sparkles,
  Phone,
  Mail,
  User as UserIcon,
  Check
} from 'lucide-react';
import { PdfAttachment } from '../../types';

export const CoachRequestsTab: React.FC = () => {
  const {
    currentUser,
    coaches,
    bookings,
    customRequests,
    acceptBookingRequest,
    rejectBookingRequest,
    retroactiveConfirmRequest,
    createCustomOffer,
    rejectCustomRequest
  } = useApp();

  const currentCoach = coaches.find(c => c.userId === currentUser.id || c.id === currentUser.id) || coaches[0] || createDefaultCoachProfile(currentUser);
  const coachId = currentCoach.id;

  // Custom offer form modal/inline state
  const [activeOfferReqId, setActiveOfferReqId] = useState<string | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(120);
  const [offerDate, setOfferDate] = useState<string>('');
  const [offerTime, setOfferTime] = useState<string>('18:00 - 19:30 Uhr');
  const [offerMessage, setOfferMessage] = useState<string>('Individuelles Coaching-Paket inkl. Platzmiete.');
  const [offerPdf, setOfferPdf] = useState<PdfAttachment | undefined>(undefined);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);

  // Filter 2h slot booking requests for this coach
  const slotRequests = bookings.filter(b => b.coachId === coachId);
  const pendingSlotRequests = slotRequests.filter(b => b.requestStatus === 'anfrage_ausstehend');
  const expiredSlotRequests = slotRequests.filter(b => b.requestStatus === 'abgelaufen');

  // Filter custom individual requests for this coach
  const myCustomRequests = customRequests.filter(r => r.coachId === coachId);
  const pendingCustomRequests = myCustomRequests.filter(r => r.status === 'ausstehend' || r.status === 'offen');

  // Live timer tick
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPdfUploadError(null);
    if (!file) return;

    // Strict MIME type check
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfUploadError('Ungültiges Dateiformat: Es sind nur PDF-Dateien (application/pdf) erlaubt.');
      return;
    }

    // Max 5MB file size limit
    if (file.size > 5 * 1024 * 1024) {
      setPdfUploadError('Datei zu gross: Das PDF darf maximal 5 MB gross sein.');
      return;
    }

    setOfferPdf({
      name: file.name,
      url: URL.createObjectURL(file),
      sizeKb: Math.round(file.size / 1024),
      uploadedAt: new Date().toISOString()
    });
  };

  const handleSendCustomOffer = (requestId: string) => {
    createCustomOffer(
      requestId,
      offerPrice,
      'Coaching',
      offerDate || 'Nach Vereinbarung',
      offerTime || 'Flexibel',
      offerMessage,
      offerPdf
    );
    setActiveOfferReqId(null);
    setOfferPdf(undefined);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Coach Request Header */}
      <div className="bg-gradient-to-r from-[#F1600D] via-[#f3772b] to-[#d85208] text-white rounded-3xl p-6 sm:p-8 border border-orange-400/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-oswald font-medium uppercase tracking-wide text-white flex items-center gap-3">
            <Inbox className="w-8 h-8 sm:w-10 sm:h-10 text-white bg-white/10 p-2 rounded-2xl shrink-0" />
            <span>Aktuelle Anfragen & Buchungen</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-2xl">
            Hier verwaltest du eingehende Slot-Reservierungen (2-Stunden-Sperre) und Spezial-Anfragen deiner Kund:innen. Du kannst Anfragen mit 1 Klick annehmen oder ablehnen.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shrink-0">
          <div className="text-center px-2">
            <div className="text-2xl font-black text-amber-300">
              {pendingSlotRequests.length}
            </div>
            <div className="text-[10px] text-white/80 uppercase font-bold">Slot-Anfragen</div>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-2xl font-black text-emerald-300">
              {pendingCustomRequests.length}
            </div>
            <div className="text-[10px] text-white/80 uppercase font-bold">Spezial-Anfragen</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Eingehende Slot-Anfragen */}
      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F1600D]" />
              <h2 className="text-lg font-bold text-[#1A265A]">
                Slot-Anfragen
              </h2>
              <span className="w-6 h-6 rounded-full bg-[#F1600D] text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                {pendingSlotRequests.length}
              </span>
            </div>
          </div>

          {pendingSlotRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-[#50A5B1]/20 shadow-2xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-[#1A265A] text-sm">Keine offenen Slot-Anfragen</h3>
              <p className="text-xs text-[#1A265A]/60 mt-1">
                Aktuell sind alle Lektions-Slots im Kalender entweder bestätigt oder frei verfügbar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingSlotRequests.map(req => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-6 border-2 border-[#F1600D] shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#50A5B1]/15">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase bg-[#F1600D] text-white px-2.5 py-0.5 rounded-md inline-block mb-1 shadow-xs">
                        2h Slot Reservierung
                      </span>
                      <h3 className="font-bold text-[#1A265A] text-base">{req.sessionTitle}</h3>
                      <p className="text-xs font-semibold text-[#50A5B1]">{req.sport}</p>
                    </div>

                    {/* Countdown Timer Badge */}
                    <div className="bg-[#FEF6ED] border border-[#F1600D]/30 p-2 rounded-2xl text-right shrink-0">
                      <div className="text-[9px] uppercase font-bold text-[#1A265A]/70">Restzeit für Antwort</div>
                      <div className="text-xs font-mono font-black text-[#F1600D]">
                        {getRemainingTime(req.reservedUntil)}
                      </div>
                    </div>
                  </div>

                  {/* Customer details & Lektion details */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-[#FEF6ED]/70 p-3 rounded-2xl border border-[#50A5B1]/10 space-y-1.5">
                      <div className="font-bold text-[#1A265A] flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5 text-[#F1600D]" />
                        <span>Kund:in: <strong>{req.userName}</strong></span>
                      </div>
                      <div className="text-[#1A265A]/70 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#50A5B1]" />
                          {req.userEmail}
                        </span>
                        {req.userPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#50A5B1]" />
                            {req.userPhone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-[#1A265A]/80 px-1">
                      <p>📅 <strong>Datum & Uhrzeit:</strong> {req.date} ({req.time})</p>
                      <p>📍 <strong>Ort:</strong> {req.locationName}</p>
                      <p>💰 <strong>Bezahlt:</strong> CHF {req.pricePaid.toFixed(2)} ({req.paymentMethod})</p>
                    </div>
                  </div>

                  {/* PROMINENT 1-CLICK ACTION BUTTONS */}
                  <div className="pt-3 border-t border-[#50A5B1]/15 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => acceptBookingRequest(req.id)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Annehmen</span>
                    </button>

                    <button
                      onClick={() => rejectBookingRequest(req.id)}
                      className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Ablehnen</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expired Slot Requests with Retroactive Confirm */}
          {expiredSlotRequests.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-bold text-[#1A265A] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Abgelaufene Slot-Anfragen ({expiredSlotRequests.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expiredSlotRequests.map(req => (
                  <div key={req.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-xs text-[#1A265A]">{req.sessionTitle}</div>
                      <div className="text-[11px] text-[#1A265A]/70">Kund:in: {req.userName} · {req.date}</div>
                    </div>
                    <button
                      onClick={() => retroactiveConfirmRequest(req.id)}
                      className="px-3 py-1.5 bg-[#1A265A] hover:bg-[#263773] text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
                    >
                      Nachträglich Bestätigen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* SECTION 2: Eingehende Spezial- / Custom-Anfragen */}
      <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#50A5B1]" />
            <h2 className="text-lg font-bold text-[#1A265A]">
              Individuelle Kund:innen-Anfragen
            </h2>
            <span className="w-6 h-6 rounded-full bg-[#F1600D] text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
              {pendingCustomRequests.length}
            </span>
          </div>

          {pendingCustomRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-[#50A5B1]/20 shadow-2xs">
              <Inbox className="w-10 h-10 text-[#50A5B1]/50 mx-auto mb-2" />
              <h3 className="font-bold text-[#1A265A] text-sm">Keine neuen Spezial-Anfragen</h3>
              <p className="text-xs text-[#1A265A]/60 mt-1">
                Aktuell liegen keine unbeantworteten individuellen Coaching-Anfragen vor.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCustomRequests.map(req => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-6 border-2 border-[#50A5B1]/40 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#50A5B1]/15">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase bg-[#50A5B1] text-white px-2.5 py-0.5 rounded-md inline-block mb-1">
                        Spezial-Anfrage
                      </span>
                      <h3 className="font-bold text-[#1A265A] text-base">{req.sport} ({req.participantsCount} Pers.)</h3>
                      <p className="text-xs text-[#1A265A]/70">
                        Kund:in: <strong>{req.userName}</strong> ({req.userEmail})
                      </p>
                    </div>

                    <div className="text-right text-xs text-[#1A265A]/70">
                      <div>Wunschdatum: <strong>{req.preferredDate}</strong></div>
                      <div>Zeitfenster: <strong>{req.preferredTimeWindow || 'Flexibel'}</strong></div>
                    </div>
                  </div>

                  {/* Request Message */}
                  <div className="bg-[#FEF6ED] p-3.5 rounded-2xl border border-[#50A5B1]/15 text-xs text-[#1A265A]/90">
                    <span className="font-bold block text-[11px] uppercase text-[#50A5B1] mb-1">Nachricht des:der Kund:in:</span>
                    "{req.description}"
                  </div>

                  {/* Create Offer Form or 1-Click Action trigger */}
                  {activeOfferReqId === req.id ? (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-300 space-y-4 animate-in fade-in duration-150">
                      <div className="font-bold text-xs text-[#1A265A] flex items-center justify-between">
                        <span>PERSÖNLICHES ANGEBOT ERSTELLEN</span>
                        <button
                          onClick={() => setActiveOfferReqId(null)}
                          className="text-[11px] text-slate-500 hover:text-slate-800"
                        >
                          Abbrechen
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="font-bold text-[#1A265A] block mb-1">Preis (CHF):</label>
                          <input
                            type="number"
                            value={offerPrice}
                            onChange={e => setOfferPrice(Number(e.target.value))}
                            className="w-full p-2 rounded-xl border border-slate-300 font-bold text-[#1A265A]"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-[#1A265A] block mb-1">Datum:</label>
                          <input
                            type="text"
                            value={offerDate}
                            placeholder={req.preferredDate}
                            onChange={e => setOfferDate(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-300 text-[#1A265A]"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-[#1A265A] block mb-1">Uhrzeit:</label>
                          <input
                            type="text"
                            value={offerTime}
                            onChange={e => setOfferTime(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-300 text-[#1A265A]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-[#1A265A] text-xs block mb-1">Angebots-Text / Details:</label>
                        <textarea
                          rows={2}
                          value={offerMessage}
                          onChange={e => setOfferMessage(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-[#1A265A]"
                        ></textarea>
                      </div>

                      {/* Optional PDF Upload */}
                      {pdfUploadError && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{pdfUploadError}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#50A5B1]" />
                          <span className="font-medium text-[#1A265A]">
                            {offerPdf ? `PDF angehängt: ${offerPdf.name}` : 'Optional PDF-Angebot anhängen (max. 5 MB, nur PDF)'}
                          </span>
                        </div>
                        <label className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#1A265A] font-bold text-xs rounded-lg cursor-pointer transition">
                          <input type="file" accept="application/pdf,.pdf" onChange={handleFileUpload} className="hidden" />
                          PDF wählen
                        </label>
                      </div>

                      <button
                        onClick={() => handleSendCustomOffer(req.id)}
                        className="w-full py-3 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-4 h-4" />
                        <span>Angebot an Kund:in senden (CHF {offerPrice.toFixed(2)})</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        onClick={() => {
                          setOfferDate(req.preferredDate);
                          setActiveOfferReqId(req.id);
                        }}
                        className="flex-1 py-2.5 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-2xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Angebot Erstellen</span>
                      </button>

                      <button
                        onClick={() => rejectCustomRequest(req.id)}
                        className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Ablehnen</span>
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
      </div>

      {/* SECTION 3: History view */}
      <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-[#1A265A] flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-500" />
            Abgeschlossene Anfragen & Verlauf
          </h2>

          <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/20 space-y-3">
            {myCustomRequests.filter(r => r.status !== 'ausstehend' && r.status !== 'offen').length === 0 &&
            slotRequests.filter(r => r.requestStatus !== 'anfrage_ausstehend').length === 0 ? (
              <p className="text-xs text-[#1A265A]/60 text-center py-4">Keine vergangenen Anfragen im Verlauf.</p>
            ) : (
              <div className="divide-y divide-[#50A5B1]/10 text-xs">
                {myCustomRequests
                  .filter(r => r.status !== 'ausstehend' && r.status !== 'offen')
                  .map(r => (
                    <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-[#1A265A]">{r.sport} - {r.userName}</div>
                        <div className="text-[11px] text-[#1A265A]/70">Datum: {r.preferredDate}</div>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-slate-100 text-slate-700">
                        Status: {r.status}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

    </div>
  );
};
