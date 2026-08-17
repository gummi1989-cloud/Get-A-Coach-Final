import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import {
  Calendar,
  CalendarCheck,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  Star,
  CheckCircle2,
  Lock,
  Eye,
  RotateCcw,
  ShieldAlert,
  Inbox,
  XCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MyBookingsTab: React.FC = () => {
  const { bookings, cancelBooking, rateBooking, currentUser } = useApp();
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<Booking | null>(null);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [starsInput, setStarsInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  const myBookings = bookings.filter(b => b.userId === currentUser.id);

  // Group bookings into categories
  const pendingBookings = myBookings.filter(
    b =>
      b.status === 'bestaetigt' ||
      b.requestStatus === 'anfrage_ausstehend' ||
      (!b.status.startsWith('storniert') && b.status !== 'abgeschlossen')
  );

  const completedBookings = myBookings.filter(b => b.status === 'abgeschlossen');

  const cancelledBookings = myBookings.filter(
    b => b.status.startsWith('storniert') || b.requestStatus === 'abgelehnt'
  );

  const handleCancelClick = (b: Booking) => {
    const sessionDate = new Date(`${b.date}T${b.time.split(' - ')[0] || '10:00'}:00`);
    const now = new Date();
    const diffHours = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isGt24h = diffHours >= 24;

    const confirmMsg = isGt24h
      ? `Termin stornieren (>24h vor Termin)? Du erhältst 100% (CHF ${b.pricePaid.toFixed(2)}) auf dein ${b.paymentMethod} rückerstattet.`
      : `Termin stornieren (<24h vor Termin)? Du erhältst 50% (CHF ${(b.pricePaid * 0.5).toFixed(2)}) rückerstattet. 50% gehen als Entschädigung an den Coach.`;

    if (window.confirm(confirmMsg)) {
      const res = cancelBooking(b.id);
      alert(res.message);
    }
  };

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingBooking) return;
    rateBooking(ratingBooking.id, starsInput, commentInput);
    alert('Vielen Dank! Deine Bewertung wurde eingereicht.');
    setRatingBooking(null);
  };

  const renderBookingCard = (booking: Booking, isCompleted: boolean, isCancelled: boolean) => {
    const isPending = !isCompleted && !isCancelled;

    return (
      <div
        key={booking.id}
        className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition shadow-xs space-y-4 ${
          isPending
            ? 'border-[#F1600D]/40 border-l-8 border-l-[#F1600D] ring-2 ring-[#F1600D]/10'
            : isCompleted
            ? 'border-emerald-500/30 border-l-8 border-l-emerald-500 bg-slate-50/20'
            : 'border-slate-300 border-l-8 border-l-slate-400 bg-slate-50/60 opacity-90'
        }`}
      >
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#50A5B1]/15">
          <div className="flex items-center gap-3">
            <img
              src={booking.coachAvatar}
              alt={booking.coachName}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#50A5B1]/30 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#F1600D]/15 text-[#F1600D] text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {booking.sport}
                </span>
                <span className="text-xs font-bold text-[#1A265A]">Coach: {booking.coachName}</span>
              </div>
              <h3 className="font-extrabold text-base text-[#1A265A] mt-0.5">{booking.sessionTitle}</h3>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
            {/* Visual Status Badges */}
            {isPending && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-[#F1600D] border border-[#F1600D]/40 text-xs font-extrabold rounded-full">
                <Clock className="w-3.5 h-3.5 text-[#50A5B1] animate-pulse" />
                Ausstehend / Bevorstehend
              </span>
            )}

            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-extrabold rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#50A5B1]" />
                Abgeschlossen
              </span>
            )}

            {isCancelled && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-full">
                <XCircle className="w-3.5 h-3.5 text-[#50A5B1]" />
                Storniert
              </span>
            )}

            <div className="text-sm font-black text-[#1A265A]">
              CHF {booking.pricePaid.toFixed(2)}
              <span className="text-[10px] text-[#1A265A]/60 font-medium ml-1">({booking.paymentMethod})</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-3.5 rounded-2xl border ${
          isPending
            ? 'bg-slate-50 border-[#F1600D]/20 text-[#1A265A]'
            : isCompleted
            ? 'bg-emerald-50/40 border-emerald-200/50 text-[#1A265A]/90'
            : 'bg-slate-100/60 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#50A5B1]" />
            <span>Datum: <strong className="text-[#1A265A]">{booking.date}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#50A5B1]" />
            <span>Uhrzeit: <strong className="text-[#1A265A]">{booking.time} Uhr</strong></span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-4 h-4 shrink-0 text-[#50A5B1]" />
            <span className="truncate">{booking.locationName}</span>
          </div>
        </div>

        {/* Rating & Action Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          {/* Rating Status Info */}
          <div>
            {booking.clientRated && booking.clientRating && (
              <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Deine Bewertung:</strong> {booking.clientRating.stars} ★ {booking.clientRating.comment ? `– "${booking.clientRating.comment}"` : ''}
                </span>
              </div>
            )}
            {isPending && (
              <span className="text-[11px] text-[#F1600D] font-medium italic flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#50A5B1]" />
                Lektion bevorstehend – Vorbereitung durch den Coach läuft.
              </span>
            )}
            {isCancelled && booking.refundAmount !== undefined && (
              <span className="text-[11px] text-rose-700 font-medium">
                Rückerstattung: CHF {booking.refundAmount.toFixed(2)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* PDF Receipt Button */}
            <button
              onClick={() => setSelectedReceiptBooking(booking)}
              className="bg-white hover:bg-slate-100 text-[#1A265A] font-bold text-xs px-3.5 py-2 rounded-xl transition border border-[#50A5B1]/30 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileText className="w-4 h-4 text-[#50A5B1]" />
              PDF Quittung
            </button>

            {/* Rate Button for Completed or Past Bookings */}
            {!booking.clientRated && !isCancelled && (
              <button
                onClick={() => setRatingBooking(booking)}
                className={`font-extrabold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#F1600D] hover:bg-[#d85208] text-white'
                }`}
              >
                <Star className="w-4 h-4 fill-white" />
                Coach Bewerten
              </button>
            )}

            {/* Cancel Button for Pending Bookings */}
            {isPending && (
              <button
                onClick={() => handleCancelClick(booking)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-rose-200 transition cursor-pointer"
              >
                Stornieren
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A265A] via-[#263773] to-[#50A5B1] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#50A5B1]/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl text-white font-oswald font-medium uppercase tracking-wide flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white bg-white/10 p-2 rounded-2xl shrink-0" />
            <span>Meine Buchungen & Quittungen</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/90 mt-1">
            Optische Übersicht aller ausstehenden & abgeschlossenen Sport-Lektionen, inklusive Quittungen und Stornierungen.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md text-white text-xs font-bold p-3 rounded-2xl border border-white/20 shrink-0">
          <div className="text-center px-2">
            <div className="text-lg font-black text-[#F1600D]">{pendingBookings.length}</div>
            <div className="text-[10px] text-white/80 uppercase font-semibold">Ausstehend</div>
          </div>
          <div className="h-6 w-px bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-lg font-black text-emerald-400">{completedBookings.length}</div>
            <div className="text-[10px] text-white/80 uppercase font-semibold">Abgeschlossen</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'bg-white text-[#1A265A]/70 hover:bg-slate-100 border border-[#50A5B1]/20'
          }`}
        >
          Alle Buchungen ({myBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'bg-white text-[#1A265A]/70 hover:bg-slate-100 border border-[#50A5B1]/30'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#50A5B1]" />
          Ausstehend & Bevorstehend ({pendingBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'bg-white text-[#1A265A]/70 hover:bg-slate-100 border border-[#50A5B1]/30'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#50A5B1]" />
          Abgeschlossen ({completedBookings.length})
        </button>

        {cancelledBookings.length > 0 && (
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cancelled'
                ? 'bg-[#1A265A] text-white shadow-xs'
                : 'bg-white text-[#1A265A]/70 hover:bg-slate-100 border border-[#50A5B1]/30'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-[#50A5B1]" />
            Storniert ({cancelledBookings.length})
          </button>
        )}
      </div>

      {myBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#50A5B1]/20">
          <Calendar className="w-12 h-12 text-[#50A5B1] mx-auto mb-3 opacity-50" />
          <h3 className="font-bold text-base text-[#1A265A]">Keine Buchungen vorhanden</h3>
          <p className="text-xs text-[#1A265A]/60 mt-1">
            Suche nach Sport-Coaches in deiner Region und buche deine erste Lektion!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION 1: Ausstehende & Bevorstehende Buchungen */}
          {(activeTab === 'all' || activeTab === 'pending') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#50A5B1]" />
                <h3 className="text-lg font-bold text-[#1A265A]">
                  Ausstehende & Bevorstehende Lektionen
                </h3>
                <span className="text-xs bg-[#50A5B1] text-white font-extrabold px-2.5 py-0.5 rounded-full">
                  {pendingBookings.length}
                </span>
              </div>

              {pendingBookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-[#50A5B1]/30 text-xs text-[#1A265A]/60">
                  Aktuell keine ausstehenden Lektionen vorhanden.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map(b => renderBookingCard(b, false, false))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: Abgeschlossene Buchungen */}
          {(activeTab === 'all' || activeTab === 'completed') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#50A5B1]" />
                <h3 className="text-lg font-bold text-[#1A265A]">
                  Abgeschlossene Lektionen
                </h3>
                <span className="text-xs bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                  {completedBookings.length}
                </span>
              </div>

              {completedBookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-emerald-300 text-xs text-[#1A265A]/60">
                  Keine vergangen/abgeschlossenen Lektionen in der Historie.
                </div>
              ) : (
                <div className="space-y-4">
                  {completedBookings.map(b => renderBookingCard(b, true, false))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: Stornierte Buchungen */}
          {(activeTab === 'all' || activeTab === 'cancelled') && cancelledBookings.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-[#50A5B1]" />
                <h3 className="text-lg font-bold text-[#1A265A]">
                  Stornierte Buchungen
                </h3>
                <span className="text-xs bg-slate-600 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                  {cancelledBookings.length}
                </span>
              </div>

              <div className="space-y-4">
                {cancelledBookings.map(b => renderBookingCard(b, false, true))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PDF Receipt Modal */}
      {selectedReceiptBooking && (
        <ReceiptModal
          booking={selectedReceiptBooking}
          onClose={() => setSelectedReceiptBooking(null)}
        />
      )}

      {/* Rating Dialog */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">Coach bewerten</h3>
            <p className="text-xs text-slate-600">
              Deine Bewertung für {ratingBooking.coachName} ({ratingBooking.sport}).
            </p>

            <form onSubmit={handleRateSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-xs text-slate-700 block mb-1">Sterne (1 bis 5):</label>
                <div className="flex gap-2 text-2xl text-amber-400">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStarsInput(s)}
                      className={`cursor-pointer ${s <= starsInput ? 'fill-amber-400 opacity-100' : 'opacity-30'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-xs text-slate-700 block mb-1">Optionales Feedback:</label>
                <textarea
                  rows={3}
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  placeholder="Wie war deine Erfahrung bezüglich Technik, Pünktlichkeit und Coaching?"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-700 shadow-md"
                >
                  Bewertung Absenden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
