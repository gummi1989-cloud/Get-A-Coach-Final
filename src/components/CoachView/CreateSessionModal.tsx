import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CantonCode } from '../../types';
import { MOCK_COACH_PROFILE } from '../../data/mockData';
import { X, Calendar, Clock, Plus, Users, Zap, CheckCircle2, MapPin, Coins, Sparkles, FileText } from 'lucide-react';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, coaches, createSession } = useApp();
  const currentCoach = coaches.find(c => c.userId === currentUser.id || c.id === currentUser.id) || coaches[0] || MOCK_COACH_PROFILE;

  const defaultSport = currentCoach.sports && currentCoach.sports.length > 0 ? currentCoach.sports[0] : 'Padel Tennis';

  const [title, setTitle] = useState('');
  const [sport, setSport] = useState(defaultSport);
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [type, setType] = useState<'einzel' | 'gruppe'>('einzel');
  const [minParticipants, setMinParticipants] = useState(2);
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [price, setPrice] = useState(currentCoach.hourlyRate || 120);
  const [locationName, setLocationName] = useState(currentCoach.locationName || 'Hauptstandort / Sportanlage');
  const [description, setDescription] = useState('Trainingsbälle & Equipment vor Ort vorhanden.');
  
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createSession({
      coachId: currentCoach.id,
      coachName: currentCoach.name,
      coachAvatar: currentCoach.avatar,
      sport,
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      price: Number(price),
      minParticipants: type === 'einzel' ? 1 : Number(minParticipants),
      maxParticipants: type === 'einzel' ? 1 : Number(maxParticipants),
      type,
      canton: currentCoach.canton || ('ZH' as CantonCode),
      coordinates: currentCoach.coordinates || { lat: 47.3769, lng: 8.5417 },
      locationName: locationName.trim()
    });

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#50A5B1]/30 shadow-2xl overflow-hidden relative my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F1600D] via-[#f3772b] to-[#d85208] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Neuen Termin aufschalten</h3>
              <p className="text-xs text-orange-100">Lektion freigeben – Sofort für Kund:innen buchbar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {showSuccessToast ? (
          <div className="p-10 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-[#1A265A]">Termin erfolgreich aufgeschaltet!</h4>
              <p className="text-xs text-[#1A265A]/70 mt-1">
                Dein Termin <strong>"{title}"</strong> für {sport} am {date} ({startTime} - {endTime} Uhr) wurde freigeschaltet.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A265A]">Lektionstyp</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setType('einzel');
                    setMaxParticipants(1);
                  }}
                  className={`p-3 rounded-2xl border transition text-left cursor-pointer flex items-center gap-2.5 ${
                    type === 'einzel'
                      ? 'border-[#F1600D] bg-[#FEF6ED] text-[#1A265A] font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-[#50A5B1]/50'
                  }`}
                >
                  <Zap className={`w-4 h-4 ${type === 'einzel' ? 'text-[#F1600D]' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-black">1:1 Einzellektion</div>
                    <div className="text-[10px] text-slate-500">Exklusives Einzel-Coaching</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('gruppe');
                    if (maxParticipants === 1) setMaxParticipants(4);
                  }}
                  className={`p-3 rounded-2xl border transition text-left cursor-pointer flex items-center gap-2.5 ${
                    type === 'gruppe'
                      ? 'border-[#F1600D] bg-[#FEF6ED] text-[#1A265A] font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-[#50A5B1]/50'
                  }`}
                >
                  <Users className={`w-4 h-4 ${type === 'gruppe' ? 'text-[#F1600D]' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-black">Gruppenkurs</div>
                    <div className="text-[10px] text-slate-500">Mehrere Teilnehmer:innen (z.B. 2–8)</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Sport & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A265A]">Sportart</label>
                <select
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                  className="w-full bg-[#FEF6ED]/50 border border-[#50A5B1]/30 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                >
                  {(currentCoach.sports || ['Padel Tennis', 'Tennis', 'Fitness']).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A265A]">Bezeichnung / Titel *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="z.B. Padel Taktik & Volley Intensiv"
                  className="w-full bg-white border border-[#50A5B1]/30 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
              </div>
            </div>

            {/* Date & Times */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A265A] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#F1600D]" /> Datum
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-white border border-[#50A5B1]/30 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A265A] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#50A5B1]" /> Von
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full bg-white border border-[#50A5B1]/30 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A265A] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#50A5B1]" /> Bis
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-white border border-[#50A5B1]/30 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
              </div>
            </div>

            {/* Price & Location & Participants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A265A] flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" /> Preis p.P. (CHF)
                </label>
                <input
                  type="number"
                  min="10"
                  step="5"
                  required
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full bg-white border border-[#50A5B1]/30 rounded-xl px-3 py-2 text-xs font-bold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A265A] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#50A5B1]" /> Standort / Anlage
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  placeholder="z.B. Center Unterägeri"
                  className="w-full bg-white border border-[#50A5B1]/30 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
              </div>
            </div>

            {/* Participants config */}
            {type === 'gruppe' ? (
              <div className="grid grid-cols-2 gap-3 bg-[#FEF6ED] p-3 rounded-2xl border border-[#50A5B1]/30">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A265A] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#F1600D]" /> Min. Personen *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxParticipants}
                    required
                    value={minParticipants}
                    onChange={e => setMinParticipants(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-[#50A5B1]/30 rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                  />
                  <span className="text-[10px] text-[#1A265A]/70 block">Mindestteilnehmer</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A265A] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-600" /> Max. Personen *
                  </label>
                  <input
                    type="number"
                    min={minParticipants}
                    max="30"
                    required
                    value={maxParticipants}
                    onChange={e => setMaxParticipants(Math.max(minParticipants, Number(e.target.value)))}
                    className="w-full bg-white border border-[#50A5B1]/30 rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                  />
                  <span className="text-[10px] text-[#1A265A]/70 block">Maximalkapazität</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Teilnehmer:innen</label>
                <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-500">
                  1 Person (1:1 Einzelcoaching)
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A265A] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Hinweis / Ausrüstung für Kund:innen
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Details zu Ausrüstung, Treffpunkt oder Mietmaterial..."
                className="w-full bg-white border border-[#50A5B1]/30 rounded-xl p-3 text-xs font-medium text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#F1600D] hover:bg-[#d85208] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Termin jetzt aufschalten</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
