import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createDefaultCoachProfile } from '../utils/coachUtils';
import {
  X,
  Send,
  ShieldCheck,
  Paperclip,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Sparkles,
  Plus,
  DollarSign
} from 'lucide-react';

interface ChatDrawerProps {
  onClose: () => void;
  targetCoachId?: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ onClose, targetCoachId = 'coach_1' }) => {
  const {
    chatMessages,
    sendChatMessage,
    currentUser,
    coaches,
    customRequests,
    bookings,
    acceptBookingRequest,
    rejectBookingRequest,
    retroactiveConfirmRequest,
    acceptAndPayCustomOffer,
    createCustomOffer
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null);
  const [showOfferForm, setShowOfferForm] = useState(false);

  // Coach offer form state
  const [offerPrice, setOfferPrice] = useState<number>(120);
  const [offerSport, setOfferSport] = useState<string>('Personal Training');
  const [offerDate, setOfferDate] = useState<string>('2026-08-05');
  const [offerTime, setOfferTime] = useState<string>('14:00 - 15:00 Uhr');
  const [offerDescription, setOfferDescription] = useState<string>('Individuelles Coaching Paket');

  const targetCoach = coaches.find(c => c.id === targetCoachId) || coaches[0] || createDefaultCoachProfile();

  const conversationMsgs = chatMessages.filter(
    m => m.coachId === targetCoachId || m.userId === currentUser.id
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedPdfName) return;

    const receiverId = currentUser.role === 'kunde' ? targetCoach.userId : 'user_kunde_1';

    let pdfAttachment;
    if (selectedPdfName) {
      pdfAttachment = {
        id: 'pdf_' + Date.now(),
        name: selectedPdfName,
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        sizeKb: 340,
        uploadedAt: new Date().toISOString()
      };
    }

    // Call sendChatMessage with pdfAttachment if exists
    sendChatMessage(receiverId, targetCoach.id, inputText.trim() || '📄 PDF Anhang gesendet.');
    setSelectedPdfName(null);
    setInputText('');
  };

  const handleCreateOfferInChat = (e: React.FormEvent) => {
    e.preventDefault();
    // Find active request or create custom offer
    const activeReq = customRequests.find(r => r.coachId === targetCoach.id && r.status === 'offen');
    const reqId = activeReq ? activeReq.id : 'req_' + Date.now();

    createCustomOffer(
      reqId,
      offerPrice,
      offerSport,
      offerDate,
      offerTime,
      offerDescription,
      selectedPdfName
        ? {
            id: 'pdf_' + Date.now(),
            name: selectedPdfName,
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            sizeKb: 520,
            uploadedAt: new Date().toISOString()
          }
        : undefined
    );

    setShowOfferForm(false);
    setSelectedPdfName(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-[#1A265A] text-white p-4 flex items-center justify-between border-b border-[#50A5B1]/20">
          <div className="flex items-center gap-3">
            <img
              src={targetCoach.avatar}
              alt={targetCoach.name}
              className="w-10 h-10 rounded-xl object-cover border-2 border-[#50A5B1]/40"
            />
            <div>
              <div className="font-extrabold text-sm text-white flex items-center gap-1">
                {targetCoach.name}
                {targetCoach.isVerified && (
                  <span title="Ausweis Verifiziert">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F1600D]" />
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#FEF6ED]/70">
                {targetCoach.sports[0]} · {targetCoach.locationName}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kontaktschutz & Fairplay Policy Banner */}
        <div className="bg-[#FEF6ED] border-b border-[#50A5B1]/20 p-2.5 px-4 flex items-center gap-2 text-[11px] text-[#1A265A]/80 font-medium">
          <Lock className="w-3.5 h-3.5 text-[#F1600D] shrink-0" />
          <span>
            <strong>Kontaktschutz aktiv:</strong> E-Mails & Telefonnummern werden gefiltert. Alle Anfragen & Buchungen laufen sicher über GET A COACH.
          </span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {conversationMsgs.length === 0 ? (
            <div className="text-center py-12 text-[#1A265A]/60 text-xs">
              Keine früheren Nachrichten. Schreibe deine erste Frage an {targetCoach.name}!
            </div>
          ) : (
            conversationMsgs.map(msg => {
              const isMe = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-[#1A265A] text-white rounded-tr-none font-medium'
                        : 'bg-white text-[#1A265A] border border-[#50A5B1]/20 rounded-tl-none font-medium'
                    }`}
                  >
                    <div>{msg.message}</div>

                    {/* PDF Attachment inside standard message */}
                    {msg.pdfAttachment && (
                      <div className="mt-2.5 p-2 bg-slate-800/20 rounded-xl border border-white/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#F1600D]" />
                          <div>
                            <div className="font-bold text-[11px]">{msg.pdfAttachment.name}</div>
                            <div className="text-[9px] opacity-70">PDF Dokument ({msg.pdfAttachment.sizeKb} KB)</div>
                          </div>
                        </div>
                        <a
                          href={msg.pdfAttachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-[#F1600D] hover:underline ml-2"
                        >
                          Öffnen
                        </a>
                      </div>
                    )}

                    {/* RENDER CUSTOM OFFER CARD */}
                    {msg.type === 'custom_offer' && msg.offerDetails && (
                      <div className="mt-3 p-3.5 bg-[#FEF6ED] text-[#1A265A] rounded-2xl border-2 border-[#F1600D] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="bg-[#F1600D] text-white font-extrabold text-[9px] px-2 py-0.5 rounded uppercase flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Individuelles Angebot
                          </span>
                          <span className="text-base font-black text-[#1A265A]">CHF {msg.offerDetails.price}.–</span>
                        </div>

                        <div className="text-xs space-y-0.5 font-bold">
                          <div>{msg.offerDetails.sport}</div>
                          <div className="text-[11px] text-[#1A265A]/80 font-medium">
                            📅 {msg.offerDetails.date} ({msg.offerDetails.time})
                          </div>
                        </div>

                        <p className="text-[11px] text-[#1A265A]/80 bg-white/70 p-2 rounded-xl">
                          {msg.offerDetails.description}
                        </p>

                        {/* PDF Attachment in Offer */}
                        {msg.offerDetails.pdfAttachment && (
                          <div className="p-2 bg-white rounded-xl border border-[#50A5B1]/30 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#F1600D]" />
                              <div>
                                <div className="font-bold text-[11px]">{msg.offerDetails.pdfAttachment.name}</div>
                                <div className="text-[9px] text-[#1A265A]/60">PDF-Anhang vom Coach</div>
                              </div>
                            </div>
                            <a
                              href={msg.offerDetails.pdfAttachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-[#F1600D] hover:underline"
                            >
                              Download PDF
                            </a>
                          </div>
                        )}

                        {/* Action buttons based on Offer Status */}
                        {(msg.offerStatus === 'ausstehend' || msg.offerDetails.status === 'ausstehend') && currentUser.role === 'kunde' && (
                          <button
                            onClick={() => acceptAndPayCustomOffer(msg.customRequestId || msg.offerDetails?.offerId || '', 'TWINT')}
                            className="w-full mt-2 py-2.5 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>Angebot Akzeptieren & Bezahlen (CHF {msg.offerPrice || msg.offerDetails.price || 150}.–)</span>
                          </button>
                        )}

                        {msg.offerDetails.status === 'akzeptiert' && (
                          <div className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold p-2 rounded-xl text-center flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Angebot Bezahlt & Bestätigt ✓</span>
                          </div>
                        )}

                        {msg.offerDetails.status === 'abgelehnt' && (
                          <div className="bg-slate-200 text-slate-700 text-[11px] font-extrabold p-2 rounded-xl text-center">
                            Angebot Abgelehnt
                          </div>
                        )}
                      </div>
                    )}

                    {/* RENDER BOOKING REQUEST CARD */}
                    {msg.type === 'booking_request' && msg.bookingDetails && (
                      <div className="mt-3 p-3.5 bg-[#FEF6ED] text-[#1A265A] rounded-2xl border-2 border-[#50A5B1] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="bg-[#1A265A] text-white font-extrabold text-[9px] px-2 py-0.5 rounded uppercase flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-[#F1600D]" />
                            Standard Buchungsanfrage
                          </span>
                          <span className="text-sm font-black text-[#1A265A]">CHF {msg.bookingDetails.price}.–</span>
                        </div>

                        <div className="text-xs space-y-0.5 font-bold">
                          <div>{msg.bookingDetails.sessionTitle}</div>
                          <div className="text-[11px] text-[#1A265A]/80 font-medium">
                            📅 {msg.bookingDetails.date} ({msg.bookingDetails.time})
                          </div>
                        </div>

                        {/* Status details */}
                        {msg.bookingDetails.status === 'anfrage_ausstehend' && (
                          <div className="bg-amber-100 text-amber-900 text-[11px] font-bold p-2.5 rounded-xl border border-amber-300 space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#F1600D] animate-spin" />
                              <span>⏱️ 2-Stunden-Sperre Aktiv (Slot reserviert)</span>
                            </div>
                            <p className="text-[10px] text-amber-800 leading-tight">
                              Der Coach hat 2 Stunden Zeit zur Bestätigung. Reagiert er nicht, verfällt die Anfrage automatisch.
                            </p>
                          </div>
                        )}

                        {msg.bookingDetails.status === 'bestaetigt' && (
                          <div className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold p-2 rounded-xl text-center flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Buchung Bestätigt & Platz Gesichert ✓</span>
                          </div>
                        )}

                        {msg.bookingDetails.status === 'abgelaufen' && (
                          <div className="bg-slate-200 text-slate-800 text-[11px] p-2.5 rounded-xl space-y-1">
                            <div className="font-extrabold flex items-center gap-1 text-slate-900">
                              <AlertTriangle className="w-3.5 h-3.5 text-[#F1600D]" />
                              <span>2-Stunden Anfrage Abgelaufen</span>
                            </div>
                            <p className="text-[10px] text-slate-600">
                              Der Slot ist wieder freigeschaltet. Der Coach kann die Anfrage jedoch weiterhin nachträglich bestätigen.
                            </p>
                          </div>
                        )}

                        {/* Coach action buttons for booking request */}
                        {currentUser.role === 'coach' && (
                          <div className="pt-2 space-y-1.5">
                            {msg.bookingDetails.status === 'anfrage_ausstehend' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => acceptBookingRequest(msg.bookingDetails!.bookingId)}
                                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
                                >
                                  Anfrage Annehmen
                                </button>
                                <button
                                  onClick={() => rejectBookingRequest(msg.bookingDetails!.bookingId)}
                                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
                                >
                                  Ablehnen
                                </button>
                              </div>
                            )}

                            {msg.bookingDetails.status === 'abgelaufen' && (
                              <button
                                onClick={() => retroactiveConfirmRequest(msg.bookingDetails!.bookingId)}
                                className="w-full py-2 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-xs"
                              >
                                Nachträglich Bestätigen (Termin sichern)
                              </button>
                            )}
                          </div>
                        )}

                      </div>
                    )}

                  </div>

                  <span className="text-[10px] text-[#1A265A]/50 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Coach Offer Creation Form Modal/Panel */}
        {showOfferForm && (
          <div className="p-4 bg-[#FEF6ED] border-t-2 border-[#F1600D] space-y-3 text-xs text-[#1A265A]">
            <div className="flex items-center justify-between font-extrabold text-sm text-[#1A265A]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#F1600D]" />
                Individuelles Angebot Erstellen
              </span>
              <button
                type="button"
                onClick={() => setShowOfferForm(false)}
                className="text-[#1A265A]/60 hover:text-[#1A265A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-extrabold block mb-0.5">Sportart:</label>
                <input
                  type="text"
                  value={offerSport}
                  onChange={e => setOfferSport(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-[#50A5B1]/30 font-bold text-xs"
                />
              </div>
              <div>
                <label className="font-extrabold block mb-0.5">Preis (CHF):</label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={e => setOfferPrice(Number(e.target.value))}
                  className="w-full p-2 bg-white rounded-lg border border-[#50A5B1]/30 font-bold text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-extrabold block mb-0.5">Datum:</label>
                <input
                  type="text"
                  value={offerDate}
                  onChange={e => setOfferDate(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-[#50A5B1]/30 font-medium text-xs"
                />
              </div>
              <div>
                <label className="font-extrabold block mb-0.5">Uhrzeit:</label>
                <input
                  type="text"
                  value={offerTime}
                  onChange={e => setOfferTime(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-[#50A5B1]/30 font-medium text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-extrabold block mb-0.5">Beschreibung:</label>
              <input
                type="text"
                value={offerDescription}
                onChange={e => setOfferDescription(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-[#50A5B1]/30 text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setSelectedPdfName(selectedPdfName ? null : 'Trainingsplan_Angebot.pdf')}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                  selectedPdfName
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-white text-[#1A265A] border-slate-300 hover:border-[#50A5B1]'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5 text-[#F1600D]" />
                <span>{selectedPdfName ? `📄 ${selectedPdfName}` : '+ PDF Anhang beifügen'}</span>
              </button>

              <button
                type="button"
                onClick={handleCreateOfferInChat}
                className="py-2 px-4 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Angebot Senden
              </button>
            </div>
          </div>
        )}

        {/* Selected PDF Badge before sending */}
        {selectedPdfName && !showOfferForm && (
          <div className="px-3 py-1.5 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-bold">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>PDF beigefügt: <strong>{selectedPdfName}</strong></span>
            </span>
            <button
              onClick={() => setSelectedPdfName(null)}
              className="text-emerald-700 hover:text-emerald-900 font-extrabold text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          {currentUser.role === 'coach' && !showOfferForm && (
            <button
              type="button"
              onClick={() => setShowOfferForm(true)}
              className="p-2.5 rounded-xl bg-[#F1600D]/10 hover:bg-[#F1600D]/20 text-[#F1600D] transition cursor-pointer shrink-0 font-bold text-xs flex items-center gap-1"
              title="Individuelles Angebot erstellen"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Angebot</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (selectedPdfName) setSelectedPdfName(null);
              else setSelectedPdfName('Coaching_Details.pdf');
            }}
            className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 ${
              selectedPdfName
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-slate-100 hover:bg-slate-200 text-[#1A265A] border-slate-200'
            }`}
            title="PDF Datei anhängen"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder="Nachricht eingeben..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#F1600D]"
          />

          <button
            type="submit"
            className="bg-[#1A265A] hover:bg-[#F1600D] text-white p-2.5 rounded-xl transition shadow-xs cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
