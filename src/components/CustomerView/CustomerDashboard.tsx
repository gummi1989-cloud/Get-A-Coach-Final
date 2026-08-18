import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, CoachProfile, CustomRequest } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import { DeleteAccountModal } from '../DeleteAccountModal';
import { UserAvatar } from '../UserAvatar';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Star,
  CheckCircle2,
  Inbox,
  Sparkles,
  Search,
  CreditCard,
  Heart,
  MessageSquare,
  ArrowRight,
  Plus,
  Tag,
  Check,
  Camera,
  Trash2
} from 'lucide-react';

interface CustomerDashboardProps {
  setActiveTab?: (tab: string) => void;
  onSelectCoach?: (coach: CoachProfile) => void;
  onOpenChatWithCoach?: (coach: CoachProfile) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  setActiveTab,
  onSelectCoach,
  onOpenChatWithCoach
}) => {
  const {
    currentUser,
    bookings,
    customRequests,
    coaches,
    userAbos,
    userVouchers,
    favoriteCoachIds,
    cancelBooking,
    acceptAndPayCustomOffer,
    rejectCustomRequest,
    updateUserAvatar
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'requests' | 'abos' | 'favorites'>('bookings');
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<Booking | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Filter user specific data
  const myBookings = bookings.filter(b => b.userId === currentUser.id);
  const myRequests = customRequests.filter(r => r.userId === currentUser.id);
  
  const upcomingBookings = myBookings.filter(
    b => b.status === 'bestaetigt' || b.requestStatus === 'anfrage_ausstehend'
  );
  const activeRequests = myRequests.filter(r => r.status !== 'abgelehnt' && r.status !== 'zurueckgezogen');
  
  const myFavoriteCoaches = coaches.filter(c => favoriteCoachIds.includes(c.id));
  const activeAbos = userAbos.filter(a => a.remainingSessions > 0);
  const myVouchers = userVouchers.filter(v => !v.isUsed);

  // Next upcoming booking
  const nextBooking = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

  const handleCancelClick = (b: Booking) => {
    const sessionDate = new Date(`${b.date}T${b.time.split(' - ')[0] || '10:00'}:00`);
    const now = new Date();
    const diffHours = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isGt24h = diffHours >= 24;

    const confirmMsg = isGt24h
      ? `Termin stornieren (>24h vor Termin)? Du erhältst 100% (CHF ${b.pricePaid.toFixed(2)}) auf dein ${b.paymentMethod} rückerstattet.`
      : `Termin stornieren (<24h vor Termin)? Du erhältst 50% (CHF ${(b.pricePaid * 0.5).toFixed(2)}) rückerstattet.`;

    if (window.confirm(confirmMsg)) {
      const res = cancelBooking(b.id);
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner with Profile Avatar */}
      <div className="bg-gradient-to-r from-[#1A265A] via-[#263773] to-[#50A5B1] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#50A5B1]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            <UserAvatar
              src={currentUser.avatar}
              name={currentUser.name}
              role={currentUser.role}
              size="2xl"
              shape="circle"
              bordered
              borderColor="border-white/50"
              editable
              onImageChange={(dataUrl) => updateUserAvatar(dataUrl)}
              onImageRemove={() => updateUserAvatar('')}
              title="Klicke hier, um dein Profilbild hochzuladen oder zu ändern"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-oswald font-medium uppercase tracking-wide text-white">
                {currentUser.name}
              </h1>
              <span className="bg-white/20 text-white font-bold text-xs px-2.5 py-0.5 rounded-full border border-white/30">
                Kund:in
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
              {currentUser.avatar
                ? 'Profilbild aktiv. Klicke auf dein Bild, um es zu aktualisieren oder zu entfernen.'
                : 'Kein Profilbild hinterlegt – dein Benutzer-Initial wird im Kreis angezeigt. Klicke auf den Kreis, um ein Foto hochzuladen.'}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-white/80">
              <span className="bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20 font-medium">
                {currentUser.email}
              </span>
              {currentUser.phone && (
                <span className="bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20 font-medium">
                  {currentUser.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Overview Cards Grid (4 in a single horizontal row, Sticky at top) */}
      <div className="sticky top-[64px] z-30 bg-slate-50/95 backdrop-blur-md py-2.5 -mx-2 px-2 border-b border-[#50A5B1]/15">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
          {/* Card 1: Meine Termine */}
          <div 
            onClick={() => setActiveSubTab('bookings')}
            className={`p-2.5 sm:p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 sm:space-y-2 group ${
              activeSubTab === 'bookings'
                ? 'bg-slate-50 border-2 border-[#50A5B1] shadow-md ring-2 ring-[#50A5B1]/20'
                : 'bg-white border-[#50A5B1]/20 shadow-xs hover:border-[#50A5B1]/50'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="p-1.5 sm:p-2 bg-teal-100 text-[#50A5B1] rounded-xl group-hover:scale-105 transition">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#50A5B1]" />
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                Live
              </span>
            </div>
            <div>
              <span className="text-base sm:text-2xl font-black text-[#1A265A] block leading-none">
                {myBookings.length}
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-[#1A265A] block truncate mt-1">Meine Termine</span>
            </div>
            {nextBooking ? (
              <p className="text-[10px] sm:text-[11px] text-[#50A5B1] font-bold truncate">
                Nächste: {nextBooking.date}
              </p>
            ) : (
              <p className="text-[10px] sm:text-[11px] text-[#1A265A]/50 truncate">Keine Termine</p>
            )}
          </div>

          {/* Card 2: Anfragen */}
          <div 
            onClick={() => setActiveSubTab('requests')}
            className={`p-2.5 sm:p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 sm:space-y-2 group ${
              activeSubTab === 'requests'
                ? 'bg-slate-50 border-2 border-[#50A5B1] shadow-md ring-2 ring-[#50A5B1]/20'
                : 'bg-white border-[#50A5B1]/20 shadow-xs hover:border-[#50A5B1]/50'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="p-1.5 sm:p-2 bg-teal-100 text-[#50A5B1] rounded-xl group-hover:scale-105 transition">
                <Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#50A5B1]" />
              </span>
              {activeRequests.some(r => r.status === 'angebot_erstellt' || r.status === 'angebot_gesendet') ? (
                <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse shrink-0">
                  Angebot!
                </span>
              ) : (
                <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-50 text-[#1A265A]/70 shrink-0">
                  Offen
                </span>
              )}
            </div>
            <div>
              <span className="text-base sm:text-2xl font-black text-[#1A265A] block leading-none">
                {activeRequests.length}
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-[#1A265A] block truncate mt-1">Anfragen</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#1A265A]/80 font-bold truncate">
              {myRequests.filter(r => r.status === 'angebot_erstellt' || r.status === 'angebot_gesendet').length} Angebot(e)
            </p>
          </div>

          {/* Card 3: Gutscheine */}
          <div 
            onClick={() => setActiveSubTab('abos')}
            className={`p-2.5 sm:p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 sm:space-y-2 group ${
              activeSubTab === 'abos'
                ? 'bg-slate-50 border-2 border-[#50A5B1] shadow-md ring-2 ring-[#50A5B1]/20'
                : 'bg-white border-[#50A5B1]/20 shadow-xs hover:border-[#50A5B1]/50'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="p-1.5 sm:p-2 bg-teal-100 text-[#50A5B1] rounded-xl group-hover:scale-105 transition">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#50A5B1]" />
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-50 text-[#F1600D] shrink-0">
                Aktiv
              </span>
            </div>
            <div>
              <span className="text-base sm:text-2xl font-black text-[#1A265A] block leading-none">
                {myVouchers.length}
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-[#1A265A] block truncate mt-1">Gutscheine</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#50A5B1] font-bold truncate">
              {myVouchers.length} Gutschein(e)
            </p>
          </div>

          {/* Card 4: Favoriten */}
          <div 
            onClick={() => setActiveSubTab('favorites')}
            className={`p-2.5 sm:p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 sm:space-y-2 group ${
              activeSubTab === 'favorites'
                ? 'bg-slate-50 border-2 border-[#50A5B1] shadow-md ring-2 ring-[#50A5B1]/20'
                : 'bg-white border-[#50A5B1]/20 shadow-xs hover:border-[#50A5B1]/50'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="p-1.5 sm:p-2 bg-teal-100 text-[#50A5B1] rounded-xl group-hover:scale-105 transition">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#50A5B1]" />
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-teal-50 text-[#50A5B1] shrink-0">
                Gemerkt
              </span>
            </div>
            <div>
              <span className="text-base sm:text-2xl font-black text-[#1A265A] block leading-none">
                {myFavoriteCoaches.length}
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-[#1A265A] block truncate mt-1">Favoriten</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#50A5B1] font-bold truncate">
              Wunsch-Coaches
            </p>
          </div>
        </div>
      </div>

      {/* Next Lesson Spotlight Banner (if exists) */}
      {nextBooking && (
        <div className="bg-gradient-to-br from-[#1A265A] via-[#263773] to-[#1A265A] text-white p-6 sm:p-8 rounded-3xl shadow-md border border-[#50A5B1]/30 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#50A5B1] rounded-xl text-white">
                <Clock className="w-5 h-5 text-white" />
              </span>
              <div>
                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block">
                  Nächste bevorstehende Lektion
                </span>
                <h2 className="text-xl font-extrabold text-white">{nextBooking.sessionTitle}</h2>
              </div>
            </div>

            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Bestätigt & Kalender-Live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Coach Info */}
            <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/15">
              <UserAvatar
                src={nextBooking.coachAvatar}
                name={nextBooking.coachName}
                role="coach"
                size="lg"
                shape="circle"
                bordered
                borderColor="border-[#50A5B1]"
              />
              <div>
                <span className="text-[10px] text-white/70 block">Dein Coach</span>
                <h3 className="font-extrabold text-white text-sm">{nextBooking.coachName}</h3>
                <span className="text-[11px] text-amber-200 font-semibold">{nextBooking.sport}</span>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
              <span className="text-[10px] text-white/70 block">Datum & Uhrzeit</span>
              <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#50A5B1]" />
                <span>{nextBooking.date}</span>
              </div>
              <div className="text-amber-200 font-bold">{nextBooking.time} Uhr</div>
            </div>

            {/* Location */}
            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
              <span className="text-[10px] text-white/70 block">Treffpunkt / Ort</span>
              <div className="font-bold text-white flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-[#50A5B1] shrink-0 mt-0.5" />
                <span className="line-clamp-2">{nextBooking.locationName}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedReceiptBooking(nextBooking)}
                className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#50A5B1]" />
                Quittung ansehen
              </button>
              
              {onOpenChatWithCoach && (
                <button
                  onClick={() => {
                    const coachObj = coaches.find(c => c.id === nextBooking.coachId);
                    if (coachObj) onOpenChatWithCoach(coachObj);
                  }}
                  className="bg-[#50A5B1] hover:bg-[#3d838d] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                  Coach anschreiben
                </button>
              )}
            </div>

            <button
              onClick={() => handleCancelClick(nextBooking)}
              className="text-red-300 hover:text-red-100 font-semibold text-xs hover:underline cursor-pointer"
            >
              Termin stornieren
            </button>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: BOOKINGS LIST */}
      {activeSubTab === 'bookings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#50A5B1]/20 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#50A5B1]/20">
            <div>
              <h2 className="text-xl text-[#1A265A] font-extrabold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#50A5B1]" />
                Meine Gebuchten Lektionen & Quittungen
              </h2>
              <p className="text-xs text-[#1A265A]/70">
                Alle bevorstehenden und absolvierten Trainingseinheiten inklusive Zahlungsquittung.
              </p>
            </div>
          </div>

          {myBookings.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-[#50A5B1]/20 space-y-3">
              <Calendar className="w-10 h-10 text-[#50A5B1] mx-auto" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-[#1A265A] text-sm">Du hast noch keine Lektionen gebucht</h3>
                <p className="text-xs text-[#1A265A]/70 max-w-sm mx-auto">
                  Entdecke verifizierte Coaches in deiner Region und buche deine erste Trainingseinheit.
                </p>
              </div>
              {setActiveTab && (
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-4 py-2 bg-[#1A265A] hover:bg-[#263773] text-white font-extrabold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer mt-2"
                >
                  <Search className="w-3.5 h-3.5 text-[#50A5B1]" />
                  <span>Jetzt Coaches entdecken</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map(booking => (
                <div
                  key={booking.id}
                  className="bg-slate-50 p-5 rounded-2xl border border-[#50A5B1]/20 space-y-3 transition hover:shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#50A5B1]/15 pb-2">
                    <div>
                      <span className="bg-[#1A265A] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                        {booking.sport}
                      </span>
                      <h3 className="font-extrabold text-sm text-[#1A265A] mt-1">{booking.sessionTitle}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-[#F1600D]">CHF {booking.pricePaid}.–</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        booking.status === 'bestaetigt' || booking.requestStatus === 'bestaetigt'
                          ? 'bg-emerald-100 text-emerald-800'
                          : booking.status === 'abgeschlossen'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status === 'bestaetigt' ? 'Bestätigt' : booking.status === 'abgeschlossen' ? 'Absolviert' : 'Storniert'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#1A265A]/80">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Calendar className="w-4 h-4 text-[#50A5B1]" />
                      <span>{booking.date} ({booking.time})</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-semibold">
                      <MapPin className="w-4 h-4 text-[#50A5B1]" />
                      <span className="truncate">{booking.locationName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-semibold">
                      <Star className="w-4 h-4 text-[#50A5B1]" />
                      <span>Coach: {booking.coachName}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#50A5B1]/15">
                    <button
                      onClick={() => setSelectedReceiptBooking(booking)}
                      className="bg-white hover:bg-slate-50 text-[#1A265A] font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-[#50A5B1]/30 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#50A5B1]" />
                      <span>Quittung / Beleg anzeigen</span>
                    </button>

                    {booking.status === 'bestaetigt' && (
                      <button
                        onClick={() => handleCancelClick(booking)}
                        className="text-red-600 hover:text-red-800 font-bold text-xs cursor-pointer"
                      >
                        Stornieren
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 3: REQUESTS LIST */}
      {activeSubTab === 'requests' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#50A5B1]/20 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#50A5B1]/20">
            <div>
              <h2 className="text-xl text-[#1A265A] font-extrabold flex items-center gap-2">
                <Inbox className="w-6 h-6 text-[#50A5B1]" />
                Meine Individuellen Anfragen
              </h2>
              <p className="text-xs text-[#1A265A]/70">
                Anfragen an Wunsch-Coaches für massgeschneiderte Termine & Kurse.
              </p>
            </div>

            <button
              onClick={() => setActiveTab && setActiveTab('my_requests')}
              className="bg-[#F1600D] hover:bg-[#d85208] text-white font-black text-xs px-4 py-2.5 rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Neue Anfrage</span>
            </button>
          </div>

          {myRequests.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#1A265A]/60 bg-slate-50 rounded-2xl border border-[#50A5B1]/20">
              Du hast zurzeit keine Anfragen gestellt.
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map(req => (
                <div key={req.id} className="bg-slate-50 p-5 rounded-2xl border border-[#50A5B1]/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#50A5B1]/15 pb-2">
                    <div>
                      <span className="font-extrabold text-sm text-[#1A265A]">{req.sport} – Coach {req.coachName}</span>
                      <span className="text-[11px] text-[#1A265A]/60 block">Wunschtermin: {req.preferredDate}</span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      req.status === 'angebot_erstellt' || req.status === 'angebot_gesendet'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : req.status === 'akzeptiert'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {req.status === 'angebot_erstellt' || req.status === 'angebot_gesendet'
                        ? '🎉 Angebot Vorhanden'
                        : req.status === 'akzeptiert'
                        ? '✓ Akzeptiert'
                        : 'Wartet auf Antwort'}
                    </span>
                  </div>

                  <p className="text-xs text-[#1A265A]/80 leading-relaxed bg-white/70 p-3 rounded-xl border border-[#50A5B1]/10">
                    "{req.description}"
                  </p>

                  {(req.status === 'angebot_erstellt' || req.status === 'angebot_gesendet') && req.offerPrice && (
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-900">Angebot vom Coach:</span>
                        <span className="font-black text-sm text-[#F1600D]">CHF {req.offerPrice}.–</span>
                      </div>
                      {req.offerMessage && (
                        <p className="text-xs text-amber-800 italic">"{req.offerMessage}"</p>
                      )}
                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => rejectCustomRequest(req.id)}
                          className="px-3 py-1.5 bg-white text-red-600 font-bold text-xs rounded-xl border border-red-200 cursor-pointer"
                        >
                          Ablehnen
                        </button>
                        <button
                          onClick={() => {
                            const res = acceptAndPayCustomOffer(req.id, 'TWINT');
                            alert(res.message);
                          }}
                          className="px-4 py-1.5 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Angebot Akzeptieren & Buchen</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 4: VOUCHERS */}
      {activeSubTab === 'abos' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#50A5B1]/20 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#50A5B1]/20">
            <div>
              <h2 className="text-xl text-[#1A265A] font-extrabold flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-[#50A5B1]" />
                Meine Wertgutscheine
              </h2>
              <p className="text-xs text-[#1A265A]/70">
                Verwalte deine Einlöse-Codes und Rabattgutscheine.
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-xl">
            <h3 className="font-black text-base text-[#1A265A] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#50A5B1]" />
              Wertgutscheine ({myVouchers.length})
            </h3>

            {myVouchers.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#1A265A]/60 bg-slate-50 rounded-2xl border border-[#50A5B1]/20">
                Keine verbleibenden Wertgutscheine.
              </div>
            ) : (
              myVouchers.map(v => (
                <div key={v.code} className="bg-slate-50 p-4 rounded-2xl border border-[#50A5B1]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-[#1A265A]">Code: <code className="bg-white px-2 py-0.5 rounded text-[#F1600D]">{v.code}</code></span>
                    <span className="font-black text-xs text-emerald-700">
                      {v.discountAmount ? `CHF ${v.discountAmount}.– Rabatt` : `${v.discountPercent}% Rabatt`}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#1A265A]/70">{v.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 5: FAVORITES */}
      {activeSubTab === 'favorites' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#50A5B1]/20 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#50A5B1]/20">
            <div>
              <h2 className="text-xl text-[#1A265A] font-extrabold flex items-center gap-2">
                <Heart className="w-6 h-6 text-[#50A5B1] fill-[#50A5B1]" />
                Meine Favoriten-Coaches
              </h2>
              <p className="text-xs text-[#1A265A]/70">
                Deine gemerkten Wunsch-Coaches für schnellen Zugriff.
              </p>
            </div>
          </div>

          {myFavoriteCoaches.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#1A265A]/60 bg-slate-50 rounded-2xl border border-[#50A5B1]/20">
              Du hast noch keine Coaches als Favorit gespeichert. Klicke bei einem Coach-Profil auf das Herz-Icon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myFavoriteCoaches.map(coach => (
                <div key={coach.id} className="bg-slate-50 p-4 rounded-2xl border border-[#50A5B1]/20 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={coach.avatar}
                      name={coach.name}
                      role="coach"
                      size="lg"
                      shape="circle"
                      isVerified={coach.isVerified}
                    />
                    <div>
                      <h3 className="font-black text-xs text-[#1A265A]">{coach.name}</h3>
                      <p className="text-[11px] text-[#50A5B1] font-bold">{coach.sports.join(', ')}</p>
                      <div className="flex items-center gap-1 text-[10px] text-[#50A5B1] font-bold">
                        <Star className="w-3 h-3 fill-[#50A5B1]" />
                        <span>{coach.rating.toFixed(1)} ({coach.reviewCount} Bewertungen)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#50A5B1]/15">
                    {onSelectCoach && (
                      <button
                        onClick={() => onSelectCoach(coach)}
                        className="flex-1 bg-[#1A265A] hover:bg-[#263773] text-white font-bold text-xs py-2 rounded-xl transition text-center cursor-pointer"
                      >
                        Profil ansehen
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Privacy & Danger Zone: Account Deletion */}
      <div className="bg-white rounded-3xl p-6 border border-red-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#1A265A] flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Datenschutz & Konto löschen</span>
            </h3>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Möchtest du getacoach.ch nicht mehr nutzen? Du kannst dein Kund:innen-Konto und alle zugehörigen Daten (Buchungen, Chat-Nachrichten, Profil & Abos) jederzeit dauerhaft und vollständig aus dem System löschen.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Konto endgültig löschen</span>
          </button>
        </div>
      </div>

      {/* Delete Account Modal Confirmation */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      {/* Receipt Modal Popup */}
      {selectedReceiptBooking && (
        <ReceiptModal
          booking={selectedReceiptBooking}
          onClose={() => setSelectedReceiptBooking(null)}
        />
      )}
    </div>
  );
};
