import React from 'react';
import { CoachProfile, SessionSlot } from '../../types';
import { Star, MapPin, ShieldCheck, Check, Calendar, MessageSquare, ArrowRight, Zap } from 'lucide-react';
import { FavoriteHeartButton } from '../FavoriteHeartButton';
import { useApp } from '../../context/AppContext';

interface CoachCardProps {
  coach: CoachProfile;
  sessions: SessionSlot[];
  onSelectCoach: (coach: CoachProfile) => void;
  onBookSession: (session: SessionSlot) => void;
  onOpenChatWithCoach: (coach: CoachProfile) => void;
}

export const CoachCard: React.FC<CoachCardProps> = ({
  coach,
  sessions,
  onSelectCoach,
  onBookSession,
  onOpenChatWithCoach
}) => {
  const { isAuthenticated, openAuthModalWithNotice } = useApp();
  const coachSessions = sessions.filter(s => s.coachId === coach.id);
  const availableCount = coachSessions.filter(s => s.status === 'verfuegbar').length;

  return (
    <div className="bg-white rounded-3xl border border-[#50A5B1]/20 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group relative">
      <div>
        {/* Top Header: Avatar, Name, Verification Badge, Rating */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={coach.avatar}
              alt={coach.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#50A5B1]/30 shadow-xs group-hover:scale-105 transition-transform"
            />
            {coach.isVerified && (
              <span
                className="absolute -bottom-1 -right-1 bg-[#F1600D] text-white p-1 rounded-full text-xs font-black shadow-xs border-2 border-white"
                title="Ausweis Verifiziert"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                onClick={() => onSelectCoach(coach)}
                className="font-oswald font-medium text-lg text-[#1A265A] truncate hover:text-[#F1600D] transition cursor-pointer"
              >
                {coach.name}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <FavoriteHeartButton coachId={coach.id} size={16} className="p-1.5" />
              </div>
            </div>

            {/* Sports tags */}
            <div className="flex flex-wrap gap-1 my-1">
              {(coach.sports || []).map(sport => (
                <span
                  key={sport}
                  className="bg-[#50A5B1]/10 text-[#1A265A] border border-[#50A5B1]/20 font-semibold text-[11px] px-2 py-0.5 rounded-md"
                >
                  {sport}
                </span>
              ))}
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1A265A]/70">
              <div className="flex items-center gap-1 text-[#F1600D]">
                <Star className="w-4 h-4 fill-[#F1600D] stroke-[#F1600D]" />
                <span className="font-extrabold text-[#1A265A]">{(coach.rating || 5.0).toFixed(2)}</span>
              </div>
              <span>({coach.reviewCount || 0} Bewertungen)</span>
            </div>
          </div>
        </div>

        {/* Bio snippet */}
        <p className="text-xs text-[#1A265A]/80 mt-3 line-clamp-2 leading-relaxed">
          {coach.bio}
        </p>

        {/* Location & Calendar Sync Indicator */}
        <div className="mt-3 pt-3 border-t border-[#50A5B1]/20 space-y-1.5 text-xs text-[#1A265A]/70">
          <div className="flex items-center gap-1.5 text-[#1A265A] font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-[#50A5B1] shrink-0" />
            <span className="truncate">{coach.locationName}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-[#1A265A]/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live Kalender-Sync
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="mt-4 pt-3 border-t border-[#50A5B1]/20 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-semibold text-[#1A265A]/60 block -mb-0.5">Einzelstunde</span>
          <span className="text-lg font-black text-[#1A265A]">CHF {coach.hourlyRate || 0}.–</span>
          <span className="text-[9px] font-bold text-emerald-700 block">0 CHF Zusatzspesen ✓</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) {
                openAuthModalWithNotice("Bitte melde dich an oder registriere dich, um mit dem Coach zu chatten.");
                return;
              }
              onOpenChatWithCoach(coach);
            }}
            className="p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 text-[#1A265A] hover:bg-[#50A5B1]/10 transition cursor-pointer"
            title="Coach kontaktieren"
          >
            <MessageSquare className="w-4 h-4 text-[#50A5B1]" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectCoach(coach);
            }}
            className="bg-[#F1600D] hover:bg-[#d85208] text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Termine ({availableCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
