import React, { useState } from 'react';
import { CoachProfile } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  FileText,
  ShieldCheck
} from 'lucide-react';

interface CustomRequestModalProps {
  coach: CoachProfile;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CustomRequestModal: React.FC<CustomRequestModalProps> = ({ coach, onClose, onSuccess }) => {
  const { sendCustomRequest, currentUser } = useApp();

  const [selectedSport, setSelectedSport] = useState<string>(coach.sports[0] || 'Coaching');
  const [participantsCount, setParticipantsCount] = useState<number>(1);
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTimeWindow, setPreferredTimeWindow] = useState<string>('Nachmittag (14:00 - 17:00)');
  const [description, setDescription] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!preferredDate) {
      alert('Bitte wähle ein bevorzugtes Wunschdatum aus.');
      return;
    }

    if (!description.trim()) {
      alert('Bitte beschreibe deine Wünsche oder Anforderungen kurz.');
      return;
    }

    sendCustomRequest({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userPhone: currentUser.phone,
      coachId: coach.id,
      coachName: coach.name,
      sport: selectedSport,
      participantsCount,
      preferredDate,
      preferredTimeWindow,
      description
    });

    setIsSubmitted(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1A265A] via-[#263773] to-[#50A5B1] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="bg-[#F1600D] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Individuelle Anfrage
            </span>
            <h3 className="text-xl font-oswald uppercase text-white tracking-wide">
              Anfrage an {coach.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coach Preview Card */}
        <div className="p-4 bg-[#FEF6ED] border-b border-[#50A5B1]/20 flex items-center gap-3">
          <img
            src={coach.avatar}
            alt={coach.name}
            className="w-12 h-12 rounded-xl object-cover border-2 border-[#50A5B1]/30 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-extrabold text-[#1A265A] text-sm truncate">{coach.name}</h4>
            <p className="text-xs text-[#1A265A]/70 truncate">{coach.locationName} · CHF {coach.hourlyRate}.–/Std.</p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-extrabold text-[#1A265A]">Anfrage Erfolgreich Gesendet!</h4>
            <p className="text-xs text-[#1A265A]/80 leading-relaxed max-w-sm mx-auto">
              {coach.name} wurde benachrichtigt und wird dir in Kürze ein individuelles Angebot mit Preis in CHF direkt im Chat erstellen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-[#1A265A]">
            
            {/* Sport selection */}
            <div>
              <label className="font-extrabold block mb-1">Sportart wählen:</label>
              <select
                value={selectedSport}
                onChange={e => setSelectedSport(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-semibold focus:outline-none focus:border-[#F1600D]"
              >
                {coach.sports.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Participants */}
            <div>
              <label className="font-extrabold block mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#F1600D]" />
                <span>Anzahl Personen:</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 4, 6, 10].map(num => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setParticipantsCount(num)}
                    className={`flex-1 py-2 rounded-xl border text-center font-extrabold transition cursor-pointer ${
                      participantsCount === num
                        ? 'bg-[#1A265A] text-white border-[#1A265A]'
                        : 'bg-slate-50 text-[#1A265A] border-slate-200 hover:border-[#50A5B1]'
                    }`}
                  >
                    {num} {num === 1 ? 'Pers.' : 'Pers.'}
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={participantsCount}
                  onChange={e => setParticipantsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 p-2 rounded-xl border border-slate-200 text-center font-extrabold bg-slate-50"
                />
              </div>
            </div>

            {/* Preferred Date & Time Window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-extrabold block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#50A5B1]" />
                  <span>Wunschdatum:</span>
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setPreferredDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-medium focus:outline-none focus:border-[#F1600D]"
                  required
                />
              </div>

              <div>
                <label className="font-extrabold block mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#50A5B1]" />
                  <span>Zeitfenster:</span>
                </label>
                <select
                  value={preferredTimeWindow}
                  onChange={e => setPreferredTimeWindow(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-medium focus:outline-none focus:border-[#F1600D]"
                >
                  <option value="Morgen (08:00 - 12:00)">Morgen (08:00 - 12:00)</option>
                  <option value="Mittag (12:00 - 14:00)">Mittag (12:00 - 14:00)</option>
                  <option value="Nachmittag (14:00 - 17:00)">Nachmittag (14:00 - 17:00)</option>
                  <option value="Abend (17:00 - 21:00)">Abend (17:00 - 21:00)</option>
                  <option value="Ganztags flexibel">Ganztags flexibel</option>
                </select>
              </div>
            </div>

            {/* Description / Special Wishes */}
            <div>
              <label className="font-extrabold block mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#F1600D]" />
                <span>Beschreibung & spezielle Wünsche:</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="z.B. Spezialtraining für Doppel-Wettkämpfe, Mietmaterial benötigt, Teamevent mit 4 Kollegen..."
                rows={3}
                className="w-full p-3 rounded-xl border border-[#50A5B1]/30 bg-slate-50 text-xs focus:outline-none focus:border-[#F1600D]"
                required
              />
            </div>

            {/* Platform notice */}
            <div className="bg-[#FEF6ED] p-3 rounded-xl border border-[#50A5B1]/20 flex items-start gap-2 text-[11px] text-[#1A265A]/80">
              <ShieldCheck className="w-4 h-4 text-[#50A5B1] shrink-0 mt-0.5" />
              <p>
                <strong>Unverbindlich & Kostenlos:</strong> Du sendest eine Anfrage. Erst wenn du das spätere Angebot des Coaches im Chat akzeptierst, erfolgt die Zahlung.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-sm rounded-2xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Individuelle Anfrage Senden</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
