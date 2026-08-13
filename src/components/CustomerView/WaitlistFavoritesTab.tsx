import React from 'react';
import { useApp } from '../../context/AppContext';
import { CoachProfile, SessionSlot } from '../../types';
import { CoachCard } from './CoachCard';
import { Clock, Trash2, Sparkles, Heart } from 'lucide-react';

interface WaitlistFavoritesTabProps {
  onSelectCoach?: (coach: CoachProfile) => void;
  onBookSession?: (session: SessionSlot) => void;
  onOpenChatWithCoach?: (coach: CoachProfile) => void;
}

export const WaitlistFavoritesTab: React.FC<WaitlistFavoritesTabProps> = ({
  onSelectCoach,
  onBookSession,
  onOpenChatWithCoach
}) => {
  const {
    sessions,
    leaveWaitlist,
    triggerCancellationTestForWaitlist,
    coaches,
    currentUser,
    favoriteCoachIds
  } = useApp();

  const waitlistedSessions = sessions.filter(s =>
    s.waitlist.some(w => w.userId === currentUser.id || w.userEmail === currentUser.email)
  );

  // Filter coaches that are in favoriteCoachIds and profile is active
  const favoriteCoaches = coaches.filter(
    c => favoriteCoachIds.includes(c.id) && c.isProfileActive
  );

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#1A265A] via-[#263773] to-[#50A5B1] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#50A5B1]/30 relative overflow-hidden">
        <h2 className="text-2xl sm:text-3xl text-white flex items-center gap-3 font-oswald font-medium uppercase tracking-wide">
          <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white bg-white/10 p-2 rounded-2xl shrink-0" />
          <span>Wartelisten & Stornierungs-Benachrichtigung</span>
        </h2>
        <p className="text-xs sm:text-sm text-white/90 mt-1">
          Wenn ausgebuchte Lektionen storniert werden, wirst du sofort freigeschaltet und benachrichtigt.
        </p>
      </div>

      {/* Waitlist Content Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/20 shadow-xs space-y-4">

        {waitlistedSessions.length === 0 ? (
          <div className="bg-[#FEF6ED] rounded-2xl p-8 text-center text-[#1A265A]/70 text-xs border border-[#50A5B1]/20 space-y-3">
            <p>Du bist zurzeit auf keiner Warteliste eingetragen.</p>
            <div className="p-4 bg-white rounded-xl border border-[#50A5B1]/30 text-[#1A265A] text-left max-w-lg mx-auto shadow-xs">
              <span className="font-extrabold block mb-1 text-[#F1600D]">💡 Teste das Wartelisten-Feature:</span>
              <p>
                In den Demodaten ist die Lektion <strong>"Padel Gruppen-Match (4 Personen)"</strong> bei Svenja Meier am 30.07. ausgebucht mit einer aktiven Warteliste.
                Klicke unten, um eine Stornierung zu simulieren und den Live-Alarm auszulösen!
              </p>
              <button
                onClick={() => triggerCancellationTestForWaitlist('session_2')}
                className="mt-3 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Stornierung simulieren & Wartelisten-Alarm auslösen
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {waitlistedSessions.map(session => (
              <div
                key={session.id}
                className="bg-[#FEF6ED] rounded-2xl p-4 border border-[#50A5B1]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#F1600D]/15 text-[#F1600D] text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                      Warteliste Pos. 1
                    </span>
                    <span className="text-xs font-bold text-[#1A265A]">{session.sport} · {session.date} ({session.startTime} Uhr)</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#1A265A] mt-1">{session.title}</h4>
                  <p className="text-xs text-[#1A265A]/70">Coach: {session.coachName} · {session.locationName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerCancellationTestForWaitlist(session.id)}
                    className="bg-[#F1600D] hover:bg-[#d85208] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                  >
                    Stornierung testen
                  </button>

                  <button
                    onClick={() => leaveWaitlist(session.id)}
                    className="p-2 text-[#1A265A]/40 hover:text-red-600 hover:bg-[#50A5B1]/20 rounded-xl transition cursor-pointer"
                    title="Warteliste verlassen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Favorites Section */}
      <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/20 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl text-[#1A265A] flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#50A5B1] fill-[#50A5B1]" />
            Gemerkte Coaches ({favoriteCoaches.length})
          </h2>
          <span className="text-xs text-[#1A265A]/60 flex items-center gap-1">
            <Heart className="w-4 h-4 text-[#50A5B1] fill-[#50A5B1]" />
            Herz abwählen = aus Favoriten entfernen
          </span>
        </div>

        {favoriteCoaches.length === 0 ? (
          <div className="bg-[#FEF6ED] rounded-2xl p-8 text-center text-[#1A265A]/70 text-xs border border-[#50A5B1]/20 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FEF6ED] text-[#50A5B1] border border-[#50A5B1]/30 flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#50A5B1] fill-[#50A5B1]" />
            </div>
            <h3 className="font-extrabold text-sm text-[#1A265A]">Keine gemerkten Coaches</h3>
            <p className="max-w-md mx-auto text-xs leading-relaxed text-[#1A265A]/80">
              Klicke bei deinen Lieblings-Coaches auf das <strong>Herz-Symbol</strong>, um sie hier in deiner Favoritenliste abzuspeichern und jederzeit schnell wiederzufinden.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favoriteCoaches.map(coach => (
              <CoachCard
                key={coach.id}
                coach={coach}
                sessions={sessions}
                onSelectCoach={coach => onSelectCoach && onSelectCoach(coach)}
                onBookSession={session => onBookSession && onBookSession(session)}
                onOpenChatWithCoach={coach => onOpenChatWithCoach && onOpenChatWithCoach(coach)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
