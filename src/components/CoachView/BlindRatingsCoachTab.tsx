import React from 'react';
import { useApp } from '../../context/AppContext';
import { createDefaultCoachProfile } from '../../utils/coachUtils';
import { Star, MessageSquare, CheckCircle2, User, Calendar } from 'lucide-react';

export const BlindRatingsCoachTab: React.FC = () => {
  const { bookings, coaches, currentUser } = useApp();
  const currentCoach = coaches.find(c => c.userId === currentUser.id || c.id === currentUser.id) || coaches[0] || createDefaultCoachProfile(currentUser);

  const coachBookings = bookings.filter(b => b.coachId === currentCoach.id);
  const reviewedBookings = coachBookings.filter(b => b.clientRated && b.clientRating);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#F1600D] via-[#f3772b] to-[#d85208] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-400/30">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-oswald font-medium uppercase tracking-wide text-white flex items-center gap-3">
            <Star className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white bg-white/10 p-2 rounded-2xl shrink-0" />
            <span>Kund:innen-Bewertungen & Feedback</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
            Hier siehst du alle Bewertungen und Erfahrungsberichte, die von Kund:innen nach absolvierten Lektionen abgegeben wurden.
          </p>
        </div>
      </div>

      {/* Summary Stat Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#50A5B1]/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#FEF6ED] rounded-2xl border border-[#50A5B1]/20 text-[#F1600D] flex items-center justify-center">
            <Star className="w-8 h-8 fill-[#F1600D]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1A265A]">
                {(currentCoach.rating || 5.0).toFixed(1)}
              </span>
              <span className="text-xs text-[#1A265A]/60 font-bold">/ 5.0 Sterne</span>
            </div>
            <p className="text-xs text-[#1A265A]/70 font-medium mt-0.5">
              Gesamtnote aus {reviewedBookings.length} abgegebenen Kund:innen-Bewertungen
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-oswald font-medium text-lg text-[#1A265A] uppercase tracking-wide flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#F1600D]" />
          Erfahrungsberichte ({coachBookings.length})
        </h3>

        {coachBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#50A5B1]/20 text-xs text-[#1A265A]/60">
            Noch keine Buchungen oder Bewertungen für dein Coach-Profil vorhanden.
          </div>
        ) : (
          coachBookings.map(b => (
            <div key={b.id} className="bg-white p-5 rounded-2xl border border-[#50A5B1]/20 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#50A5B1]/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#F1600D]/15 text-[#F1600D] text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                      {b.sport}
                    </span>
                    <span className="text-xs font-bold text-[#1A265A]">{b.sessionTitle}</span>
                  </div>
                  <p className="text-xs text-[#1A265A]/70 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1 font-semibold text-[#1A265A]">
                      <User className="w-3.5 h-3.5 text-[#50A5B1]" />
                      {b.userName}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#50A5B1]" />
                      {b.date}
                    </span>
                  </p>
                </div>

                <div>
                  {b.clientRated && b.clientRating ? (
                    <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{b.clientRating.stars} ★ Bewertet</span>
                    </div>
                  ) : (
                    <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600 text-xs font-medium">
                      Ausstehende Bewertung
                    </div>
                  )}
                </div>
              </div>

              {/* Review Comment Content */}
              {b.clientRated && b.clientRating ? (
                <div className="bg-[#FEF6ED]/70 p-3.5 rounded-xl border border-[#50A5B1]/20 text-xs space-y-1">
                  <div className="flex items-center gap-1 text-[#F1600D] font-bold">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < b.clientRating!.stars ? 'fill-[#F1600D] text-[#F1600D]' : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-[#1A265A]">{b.clientRating.stars}.0 / 5.0</span>
                  </div>
                  {b.clientRating.comment && (
                    <p className="text-[#1A265A] italic font-medium pt-1">
                      «{b.clientRating.comment}»
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#1A265A]/50 italic">
                  Der:die Kund:in hat für diese Lektion noch keinen schriftlichen Erfahrungsbericht abgegeben.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
