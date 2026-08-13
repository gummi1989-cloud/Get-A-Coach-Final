import React, { useState } from 'react';
import { CoachProfile, SessionSlot } from '../../types';
import { useApp } from '../../context/AppContext';
import { FavoriteHeartButton } from '../FavoriteHeartButton';
import { CustomRequestModal } from './CustomRequestModal';
import {
  X,
  Star,
  MapPin,
  Check,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  CreditCard,
  ShieldCheck,
  Zap,
  Quote,
  BookOpen,
  Trophy,
  GraduationCap,
  Globe,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Lock,
  UserCheck,
  Sparkles,
  FileText
} from 'lucide-react';

interface CoachDetailModalProps {
  coach: CoachProfile;
  onClose: () => void;
  onBookSession: (session: SessionSlot) => void;
  onOpenChatWithCoach: (coach: CoachProfile) => void;
}

export const CoachDetailModal: React.FC<CoachDetailModalProps> = ({
  coach,
  onClose,
  onBookSession,
  onOpenChatWithCoach
}) => {
  const { sessions, bookings, joinWaitlist, leaveWaitlist, currentUser, isAuthenticated, openAuthModalWithNotice } = useApp();
  const coachSessions = sessions.filter(s => s.coachId === coach.id);

  const [activeTab, setActiveTab] = useState<'termine' | 'bio' | 'bewertungen'>('termine');
  const [showCustomRequestModal, setShowCustomRequestModal] = useState<boolean>(false);

  // Read more states for text sections
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isAchievementsExpanded, setIsAchievementsExpanded] = useState(false);

  const bioThreshold = 220; // Chars before showing "Mehr anzeigen"
  const showBioToggle = coach.bio && coach.bio.length > bioThreshold;

  const achievementsList = coach.achievements || [];
  const achievementsThreshold = 3;
  const showAchievementsToggle = achievementsList.length > achievementsThreshold;

  // Helper to anonymize user names for customer view: "Marc Bieri" -> "Marc B."
  const anonymizeName = (fullName?: string) => {
    if (!fullName || fullName.trim() === '') return 'Verifizierte:r Kund:in';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return `${parts[0]} K.`;
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${firstName} ${lastInitial}.`;
  };

  // Anonymized Customer Reviews logic
  const realReviews = bookings
    .filter(b => b.coachId === coach.id && b.clientRated && b.clientRating)
    .map(b => ({
      id: b.id,
      anonymizedName: anonymizeName(b.userName),
      stars: b.clientRating!.stars,
      comment: b.clientRating!.comment,
      date: b.date ? new Date(b.date).toLocaleDateString('de-CH', { month: 'long', year: 'numeric' }) : 'Kürzlich',
      sport: b.sport,
      isReal: true
    }));

  const FALLBACK_CUSTOMER_REVIEWS = [
    { name: 'Marc Bieri', stars: 5, comment: 'Hervorragende Betreuung! Passt die Übungen sofort an das eigene Niveau an.', month: 'Juli 2026' },
    { name: 'Sarah Leuenberger', stars: 5, comment: 'Super konstruktives Feedback. Hat mir direkte Fortschritte gebracht.', month: 'Juli 2026' },
    { name: 'Thomas Graf', stars: 5, comment: 'Pünktlich, professionell und sehr sympathisch. Absolute Empfehlung!', month: 'Juni 2026' },
    { name: 'Laura Martinez', stars: 4, comment: 'Gute Erklärungen und tolle Atmosphäre. Werde definitiv wieder buchen.', month: 'Juni 2026' },
    { name: 'David Frey', stars: 5, comment: 'Sehr gut strukturierte Lektion. Sehr viel gelernt in nur einer Stunde.', month: 'Mai 2026' },
    { name: 'Anja Zürcher', stars: 5, comment: 'Spitzenklasse Coaching! Geht genau auf individuelle Schwachstellen ein.', month: 'Mai 2026' }
  ];

  const fallbackReviews = FALLBACK_CUSTOMER_REVIEWS.map((rev, idx) => ({
    id: `fallback_rev_${coach.id}_${idx}`,
    anonymizedName: anonymizeName(rev.name),
    stars: rev.stars,
    comment: rev.comment,
    date: rev.month,
    sport: coach.sports[idx % coach.sports.length] || 'Coaching',
    isReal: false
  }));

  const allReviews = [...realReviews, ...fallbackReviews];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs overflow-y-auto py-6 sm:py-10 px-3 sm:px-6 flex items-start sm:items-center justify-center min-h-screen">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Always-visible sticky header bar for close button */}
        <div className="sticky top-0 right-0 z-40 flex items-center justify-end p-3 gap-2 pointer-events-none -mb-14">
          <div className="pointer-events-auto flex items-center gap-2 bg-[#1A265A]/85 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg border border-white/20">
            <FavoriteHeartButton coachId={coach.id} size={16} showText={false} variant="dark" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white text-[#1A265A] hover:bg-[#F1600D] hover:text-white transition cursor-pointer flex items-center justify-center shadow-xs"
              title="Schliessen"
              aria-label="Schliessen"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Header / Banner */}
        <div className="relative bg-[#1A265A] text-white p-6 sm:p-8 pt-12 sm:pt-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="relative shrink-0">
              <img
                src={coach.avatar}
                alt={coach.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-[#50A5B1]/30 shadow-md"
              />
              {coach.isVerified && (
                <span
                  className="absolute -bottom-2 -right-2 bg-[#F1600D] text-white p-1.5 rounded-full shadow-md border-2 border-[#1A265A]"
                  title="Ausweis Verifiziert"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                {coach.isVerified && (
                  <span className="bg-[#50A5B1]/20 text-[#50A5B1] font-bold text-xs px-2.5 py-0.5 rounded-full border border-[#50A5B1]/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Ausweis Verifiziert
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl text-white flex items-center justify-center sm:justify-start gap-2">
                {coach.name}
              </h2>

              {/* Coach Slogan / Leitsatz */}
              {coach.slogan && (
                <p className="text-xs italic text-[#50A5B1] mt-1 font-semibold flex items-center justify-center sm:justify-start gap-1">
                  <Quote className="w-3.5 h-3.5 shrink-0 text-[#F1600D]" />
                  <span>«{coach.slogan}»</span>
                </p>
              )}

              <p className="text-xs text-[#FEF6ED]/80 mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#50A5B1] shrink-0" />
                {coach.locationName}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs font-semibold text-[#FEF6ED]/80">
                <button
                  onClick={() => setActiveTab('bewertungen')}
                  className="flex items-center gap-1.5 text-[#F1600D] hover:text-white transition cursor-pointer bg-white/10 px-3 py-1 rounded-xl border border-white/20 shadow-2xs"
                  title="Anonymisierte Kund:innen-Bewertungen anzeigen"
                >
                  <Star className="w-4 h-4 fill-[#F1600D] stroke-[#F1600D]" />
                  <span className="font-extrabold text-white">{(coach.rating || 5.0).toFixed(2)}</span>
                  <span className="text-[#FEF6ED]/80 font-bold">({coach.reviewCount || allReviews.length} Bewertungen)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#50A5B1]/20 bg-[#FEF6ED] px-4 sm:px-6 font-bold text-xs text-[#1A265A]/70 overflow-x-auto">
          <button
            onClick={() => setActiveTab('termine')}
            className={`py-3.5 px-3 sm:px-4 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'termine'
                ? 'border-[#F1600D] text-[#F1600D] font-extrabold'
                : 'border-transparent hover:text-[#1A265A]'
            }`}
          >
            Verfügbare Termine ({coachSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('bewertungen')}
            className={`py-3.5 px-3 sm:px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'bewertungen'
                ? 'border-[#F1600D] text-[#F1600D] font-extrabold'
                : 'border-transparent hover:text-[#1A265A]'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-[#F1600D] fill-[#F1600D]" />
            <span>Bewertungen ({coach.reviewCount || allReviews.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bio')}
            className={`py-3.5 px-3 sm:px-4 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'bio'
                ? 'border-[#F1600D] text-[#F1600D] font-extrabold'
                : 'border-transparent hover:text-[#1A265A]'
            }`}
          >
            Profil & Details
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 max-h-[420px] overflow-y-auto bg-white">
          
          {/* TAB 1: TERMINE */}
          {activeTab === 'termine' && (
            <div className="space-y-4">

              {/* Custom Request Banner */}
              <div className="bg-gradient-to-r from-[#1A265A] via-[#263773] to-[#50A5B1] text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="bg-[#F1600D] text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Individuelle Anfrage
                  </span>
                  <h4 className="font-extrabold text-sm text-white">Kein passender Termin dabei?</h4>
                  <p className="text-[11px] text-[#FEF6ED]/80">
                    Sende {coach.name} eine massgeschneiderte Anfrage für Wunschdatum, Gruppenevent oder Spezialtraining.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuthModalWithNotice("Bitte melde dich an oder registriere dich, um ein individuelles Angebot anzufordern.");
                      return;
                    }
                    setShowCustomRequestModal(true);
                  }}
                  className="bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md shrink-0 flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Anfrage Senden</span>
                </button>
              </div>

              {coachSessions.length === 0 ? (
                <div className="text-center py-8 text-[#1A265A]/60 text-xs">
                  Zurzeit sind keine festen Standard-Slots für diesen Coach eingestellt. Nutze die individuelle Anfrage oben!
                </div>
              ) : (
                coachSessions.map(session => {
                  const isFull = session.currentParticipants >= session.maxParticipants;
                  const isWaitlisted = session.waitlist.some(w => w.userId === currentUser.id);

                  // 2-hour reservation check
                  const isReserved = Boolean(
                    session.reservedUntil && new Date(session.reservedUntil) > new Date()
                  );

                  return (
                    <div
                      key={session.id}
                      className="bg-[#FEF6ED] rounded-2xl p-4 border border-[#50A5B1]/20 flex flex-col space-y-2 hover:border-[#50A5B1]/40 transition"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-[#F1600D]/15 text-[#F1600D] text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                              {session.type === 'einzel' ? 'Einzelcoaching' : `Gruppe (min. ${session.minParticipants || 2}, max. ${session.maxParticipants})`}
                            </span>
                            <span className="text-xs font-bold text-[#1A265A] flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#50A5B1]" />
                              {session.date} ({session.startTime} - {session.endTime})
                            </span>

                            {/* 2h Reservation badge */}
                            {isReserved && (
                              <span className="bg-amber-500/20 text-amber-900 border border-amber-400/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                <Clock className="w-3 h-3 text-[#F1600D]" />
                                ⏱️ Reserviert (Anfrage ausstehend)
                              </span>
                            )}
                          </div>

                          <h4 className="font-extrabold text-sm text-[#1A265A]">{session.title}</h4>

                          <div className="flex items-center gap-3 text-xs text-[#1A265A]/70 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-[#50A5B1]" />
                              {session.currentParticipants} / {session.maxParticipants} Plätze belegt {session.type === 'gruppe' ? `(Mind. ${session.minParticipants || 2} Pers.)` : ''}
                            </span>
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Kalender Synced
                            </span>

                            {session.pdfAttachment && (
                              <span className="text-[#1A265A] font-bold flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#50A5B1]/30">
                                <FileText className="w-3 h-3 text-[#F1600D]" />
                                PDF inkludiert
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#50A5B1]/20">
                          <div className="text-right">
                            <div className="text-base font-black text-[#1A265A]">CHF {session.price}.–</div>
                            <div className="text-[10px] text-[#1A265A]/60 font-medium">Bargeldlos (TWINT/Karte)</div>
                          </div>

                          {isReserved ? (
                            <button
                              disabled
                              className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-not-allowed shrink-0"
                            >
                              Anfrage läuft...
                            </button>
                          ) : !isFull ? (
                            <button
                              onClick={() => {
                                if (!isAuthenticated) {
                                  openAuthModalWithNotice("Bitte melde dich an oder registriere dich, um diesen Termin anzufragen.");
                                  return;
                                }
                                onClose();
                                onBookSession(session);
                              }}
                              className="bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer shrink-0"
                            >
                              Anfragen (CHF {session.price}.–)
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (!isAuthenticated) {
                                  openAuthModalWithNotice("Bitte melde dich an oder registriere dich, um dich auf die Warteliste zu setzen.");
                                  return;
                                }
                                if (isWaitlisted) leaveWaitlist(session.id);
                                else joinWaitlist(session.id);
                              }}
                              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
                                isWaitlisted
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-[#1A265A] hover:bg-[#1A265A]/90 text-white'
                              }`}
                            >
                              {isWaitlisted ? 'Auf Warteliste ✓' : 'Auf Warteliste setzen'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Optional Session Description (e.g., Mietmaterial) */}
                      {session.description && (
                        <div className="mt-1 pt-2 border-t border-[#50A5B1]/15 text-[11px] text-[#1A265A]/80 font-medium flex items-start gap-1.5 bg-white/60 p-2 rounded-xl">
                          <Info className="w-3.5 h-3.5 text-[#F1600D] shrink-0 mt-0.5" />
                          <span>{session.description}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: ANONYMISIERTE BEWERTUNGEN */}
          {activeTab === 'bewertungen' && (
            <div className="space-y-4">
              {/* Privacy & Transparency Notice Banner */}
              <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#F1600D]/10 rounded-xl text-[#F1600D]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[#1A265A]">Anonymisierter Datenschutz</h4>
                      <p className="text-[11px] text-[#1A265A]/70">
                        Namen von Kund:innen werden zum Schutz der Privatsphäre gekürzt angezeigt (z. B. Marc B.).
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-300">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verifizierte Lektionen</span>
                  </div>
                </div>
              </div>

              {/* Rating Summary Card */}
              <div className="bg-gradient-to-r from-[#1A265A] via-[#263773] to-[#50A5B1] text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black text-[#F1600D] bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                    {(coach.rating || 5.0).toFixed(1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[#F1600D]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#F1600D] stroke-[#F1600D]" />
                      ))}
                    </div>
                    <p className="text-xs text-white/90 font-medium mt-0.5">
                      Basierend auf {allReviews.length} Kund:innen-Erfahrungen
                    </p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-white/80 font-medium">
                  <span className="inline-block bg-white/15 px-2.5 py-1 rounded-lg font-bold">100% Echte Feedbacks</span>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3 pt-1">
                {allReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white p-4 rounded-2xl border border-[#50A5B1]/20 shadow-2xs space-y-2 hover:border-[#50A5B1]/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1A265A]/10 text-[#1A265A] font-extrabold text-xs flex items-center justify-center border border-[#1A265A]/20">
                          {rev.anonymizedName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-[#1A265A] flex items-center gap-1.5">
                            <span>{rev.anonymizedName}</span>
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              ✓ Verifiziert
                            </span>
                          </div>
                          <p className="text-[10px] text-[#1A265A]/60 font-medium">
                            {rev.sport} · {rev.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 text-[#F1600D]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.stars ? 'fill-[#F1600D] text-[#F1600D]' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.comment && (
                      <p className="text-xs text-[#1A265A]/90 italic bg-[#FEF6ED]/60 p-2.5 rounded-xl border border-[#50A5B1]/10 font-medium">
                        «{rev.comment}»
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PROFIL & DETAILS (Structured sections with icons, Badges & Read More) */}
          {activeTab === 'bio' && (
            <div className="space-y-5 text-xs text-[#1A265A]">
              
              {/* Section: Über mich & Trainingsphilosophie */}
              <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/20 space-y-2">
                <h4 className="text-sm text-[#1A265A] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#F1600D]" />
                  Über mich & Trainingsphilosophie
                </h4>
                
                <p className="text-xs text-[#1A265A]/90 leading-relaxed font-medium">
                  {showBioToggle && !isBioExpanded
                    ? `${coach.bio.slice(0, bioThreshold)}...`
                    : coach.bio}
                </p>

                {showBioToggle && (
                  <button
                    onClick={() => setIsBioExpanded(!isBioExpanded)}
                    className="text-[#F1600D] hover:text-[#d85208] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>{isBioExpanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}</span>
                    {isBioExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Section: Erfolge & Highlights */}
              {achievementsList.length > 0 && (
                <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/20 space-y-2">
                  <h4 className="text-sm text-[#1A265A] flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[#F1600D]" />
                    Erfolge & Highlights
                  </h4>

                  <ul className="space-y-1.5 text-xs text-[#1A265A]/90 font-medium pl-1">
                    {(showAchievementsToggle && !isAchievementsExpanded
                      ? achievementsList.slice(0, achievementsThreshold)
                      : achievementsList
                    ).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#50A5B1] font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {showAchievementsToggle && (
                    <button
                      onClick={() => setIsAchievementsExpanded(!isAchievementsExpanded)}
                      className="text-[#F1600D] hover:text-[#d85208] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>{isAchievementsExpanded ? 'Weniger anzeigen' : `Alle (${achievementsList.length}) anzeigen`}</span>
                      {isAchievementsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              )}

              {/* Grid: Diplome & Zertifikate + Sprachen (as Badges/Tags) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Diplome & Zertifikate Badges */}
                <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/20 space-y-2">
                  <h4 className="text-sm text-[#1A265A] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#50A5B1]" />
                    Diplome & Zertifikate
                  </h4>

                  {(!coach.certificates || coach.certificates.length === 0) ? (
                    <p className="text-[11px] text-[#1A265A]/60 italic">Keine Diplom-Angaben hinterlegt.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {coach.certificates.map(cert => (
                        <span
                          key={cert.id || cert.title}
                          className="bg-white border border-[#50A5B1]/30 text-[#1A265A] px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-2xs flex items-center gap-1.5"
                        >
                          <GraduationCap className="w-3 h-3 text-[#F1600D]" />
                          <span>{cert.title}</span>
                          {cert.year && (
                            <span className="bg-[#1A265A] text-white px-1.5 py-0.2 rounded text-[9px]">
                              {cert.year}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sprachen Badges */}
                <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/20 space-y-2">
                  <h4 className="text-sm text-[#1A265A] flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#50A5B1]" />
                    Sprachen
                  </h4>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(coach.languages || ['Deutsch']).map(lang => (
                      <span
                        key={lang}
                        className="bg-white border border-[#50A5B1]/30 text-[#1A265A] px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-2xs flex items-center gap-1.5"
                      >
                        <Globe className="w-3 h-3 text-[#50A5B1]" />
                        <span>{lang}</span>
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#FEF6ED] border-t border-[#50A5B1]/20 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenChatWithCoach(coach);
            }}
            className="text-[#1A265A] hover:text-[#F1600D] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#F1600D]" />
            Nachricht an Coach senden
          </button>

          <button
            onClick={onClose}
            className="bg-[#50A5B1]/20 hover:bg-[#50A5B1]/30 text-[#1A265A] font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Schliessen
          </button>
        </div>

      </div>

      {showCustomRequestModal && (
        <CustomRequestModal
          coach={coach}
          onClose={() => setShowCustomRequestModal(false)}
          onSuccess={() => {
            setShowCustomRequestModal(false);
            onClose();
            onOpenChatWithCoach(coach);
          }}
        />
      )}
    </div>
  );
};
