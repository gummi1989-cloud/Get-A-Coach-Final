import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SessionSlot, CoachProfile, CantonCode } from '../../types';
import { Plus, Calendar, Clock, Users, Zap, CheckCircle2, Edit, Info, X, Save, AlertCircle } from 'lucide-react';

export const SessionManagement: React.FC = () => {
  const { sessions, createSession, updateSession, currentUser, coaches } = useApp();

  const defaultCoachProfile: CoachProfile = {
    id: 'coach_' + currentUser.id,
    userId: currentUser.id,
    name: currentUser.name || 'Coach',
    avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    locationName: currentUser.city || 'Zürich',
    canton: (currentUser.canton as CantonCode) || 'ZH',
    coordinates: { lat: 47.3769, lng: 8.5417 },
    hourlyRate: 100,
    groupRate: 50,
    fiveSessionDiscount: 0,
    tenSessionDiscount: 0,
    rating: 5.0,
    reviewCount: 0,
    sports: [],
    bio: '',
    achievements: [],
    certificates: [],
    isVerified: currentUser.isVerified || false,
    languages: ['Deutsch'],
    slogan: '',
    isProfileActive: false,
    featured: false
  };

  const currentCoach = coaches.find(c => c.userId === currentUser.id || c.id === currentUser.id) || coaches[0] || defaultCoachProfile;

  const mySessions = sessions.filter(s => s.coachId === currentCoach.id);

  // New Session State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('Mietmaterial nicht im Preis enthalten.');
  const [sport, setSport] = useState(currentCoach.sports[0] || 'Padel Tennis');
  const [date, setDate] = useState('2026-08-01');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [type, setType] = useState<'einzel' | 'gruppe'>('einzel');
  const [minParticipants, setMinParticipants] = useState(2);
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [price, setPrice] = useState(currentCoach.hourlyRate);
  const [attachPdf, setAttachPdf] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('Trainingsplan_Info.pdf');

  // Edit Session Modal State
  const [editingSession, setEditingSession] = useState<SessionSlot | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSport, setEditSport] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editType, setEditType] = useState<'einzel' | 'gruppe'>('einzel');
  const [editMinParticipants, setEditMinParticipants] = useState(2);
  const [editMaxParticipants, setEditMaxParticipants] = useState(4);
  const [editPrice, setEditPrice] = useState(0);

  const handleOpenEdit = (session: SessionSlot) => {
    setEditingSession(session);
    setEditTitle(session.title);
    setEditDescription(session.description || '');
    setEditSport(session.sport);
    setEditDate(session.date);
    setEditStartTime(session.startTime);
    setEditEndTime(session.endTime);
    setEditType(session.type);
    setEditMinParticipants(session.minParticipants || 2);
    setEditMaxParticipants(session.maxParticipants);
    setEditPrice(session.price);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || !editTitle.trim()) return;

    updateSession(editingSession.id, {
      title: editTitle,
      description: editDescription,
      sport: editSport,
      date: editDate,
      startTime: editStartTime,
      endTime: editEndTime,
      type: editType,
      minParticipants: editType === 'einzel' ? 1 : editMinParticipants,
      maxParticipants: editType === 'einzel' ? 1 : editMaxParticipants,
      price: editPrice
    });

    setEditingSession(null);
    alert(`Lektion "${editTitle}" wurde erfolgreich aktualisiert!`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createSession({
      coachId: currentCoach.id,
      coachName: currentCoach.name,
      coachAvatar: currentCoach.avatar,
      sport,
      title,
      description,
      date,
      startTime,
      endTime,
      locationName: currentCoach.locationName,
      canton: currentCoach.canton,
      coordinates: currentCoach.coordinates,
      type,
      minParticipants: type === 'einzel' ? 1 : minParticipants,
      maxParticipants: type === 'einzel' ? 1 : maxParticipants,
      price,
      pdfAttachment: attachPdf
        ? {
            id: 'pdf_' + Date.now(),
            name: pdfFileName || 'Lektionsdetails.pdf',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            sizeKb: 280,
            uploadedAt: new Date().toISOString()
          }
        : undefined
    });

    setTitle('');
    setDescription('Mietmaterial nicht im Preis enthalten.');
    setShowAddForm(false);
    alert(`Lektion "${title}" wurde erfolgreich aufgeschaltet!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#F1600D] via-[#f3772b] to-[#d85208] text-white rounded-3xl p-6 sm:p-8 border border-orange-400/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl text-white font-oswald font-medium uppercase tracking-wide flex items-center gap-3">
            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white bg-white/10 p-2 rounded-2xl shrink-0" />
            <span>Lektionen & Termine Verwalten</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/90 mt-1">
            Neue Einzel- oder Gruppensessions ausschreiben oder bestehende Kurse anpassen.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white hover:bg-amber-50 text-[#1A265A] font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-[#F1600D]" />
          Neue Lektion Erstellen
        </button>
      </div>

      {/* Form Dialog / Drawer for Creating Session */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border-2 border-[#F1600D] shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[#50A5B1]/20">
            <h3 className="text-base text-[#1A265A]">Neue Lektion Ausschreiben</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-[#1A265A] font-bold text-xs cursor-pointer"
            >
              ✕ Abbrechen
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="col-span-1 sm:col-span-2">
              <label className="font-bold text-[#1A265A] block mb-1">Titel der Lektion:</label>
              <input
                type="text"
                placeholder="z.B. Padel Bandenschlag Intensivtraining"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 text-[#1A265A] font-semibold focus:outline-none focus:border-[#F1600D]"
              />
            </div>

            {/* Zusätzliches Beschreibungsfeld */}
            <div className="col-span-1 sm:col-span-2">
              <label className="font-bold text-[#1A265A] block mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#F1600D]" />
                Zusätzliche Hinweise / Beschreibung (z.B. Mietmaterial):
              </label>
              <textarea
                rows={2}
                placeholder="z.B. Mietmaterial (Schläger/Schuhe) nicht im Preis enthalten. Kann vor Ort bezogen werden."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 text-[#1A265A] font-medium text-xs focus:outline-none focus:border-[#F1600D]"
              />
            </div>

            <div>
              <label className="font-bold text-[#1A265A] block mb-1">Sportart:</label>
              <select
                value={sport}
                onChange={e => setSport(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-white text-[#1A265A] font-semibold"
              >
                {currentCoach.sports.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#1A265A] block mb-1">Datum:</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 text-[#1A265A] font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#1A265A] block mb-1">Startzeit:</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  placeholder="10:00"
                  className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 text-[#1A265A] font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-[#1A265A] block mb-1">Endzeit:</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  placeholder="11:00"
                  className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 text-[#1A265A] font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#1A265A] block mb-1">Typ:</label>
              <select
                value={type}
                onChange={e => {
                  const newType = e.target.value as 'einzel' | 'gruppe';
                  setType(newType);
                  if (newType === 'gruppe' && price === currentCoach.hourlyRate) {
                    setPrice(Math.round(currentCoach.hourlyRate * 0.45));
                  } else if (newType === 'einzel' && price === Math.round(currentCoach.hourlyRate * 0.45)) {
                    setPrice(currentCoach.hourlyRate);
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-white text-[#1A265A] font-semibold"
              >
                <option value="einzel">Einzelcoaching (1 Person)</option>
                <option value="gruppe">Gruppenkurs (Mehrere Personen)</option>
              </select>
            </div>

            {type === 'gruppe' && (
              <div className="grid grid-cols-2 gap-3 col-span-2 sm:col-span-1">
                <div>
                  <label className="font-bold text-[#1A265A] block mb-1">Min. Teilnehmer:</label>
                  <input
                    type="number"
                    min="1"
                    max={maxParticipants}
                    value={minParticipants}
                    onChange={e => setMinParticipants(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 text-[#1A265A] font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1A265A] block mb-1">Max. Teilnehmer:</label>
                  <input
                    type="number"
                    min={minParticipants}
                    max="30"
                    value={maxParticipants}
                    onChange={e => setMaxParticipants(Math.max(minParticipants, Number(e.target.value)))}
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 text-[#1A265A] font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Editable Preis pro Lektion */}
            <div>
              <label className="font-bold text-[#1A265A] block mb-1">
                Preis pro Person für diesen Kurs (CHF):
              </label>
              <input
                type="number"
                min="10"
                step="5"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 text-[#1A265A] font-black"
              />
              <span className="text-[10px] text-[#1A265A]/60 font-medium">Standard-Tarif überschreiben falls gewünscht.</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#50A5B1]/20">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#F1600D] text-white hover:bg-[#d85208] shadow-md cursor-pointer transition flex items-center gap-1.5"
            >
              <span>Aufschalten</span>
            </button>
          </div>
        </form>
      )}

      {/* Active Offered Sessions List */}
      <div className="bg-white rounded-2xl p-6 border border-[#50A5B1]/20 shadow-xs space-y-4">
        <h3 className="text-base text-[#1A265A]">Aktuell Ausgeschriebene Termine</h3>

        {mySessions.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#1A265A]/60">
            Du hast zurzeit keine eigenen Lektionen ausgeschrieben.
          </div>
        ) : (
          <div className="space-y-3">
            {mySessions.map(session => (
              <div
                key={session.id}
                className="bg-slate-50 p-4 rounded-2xl border border-[#50A5B1]/20 flex flex-col space-y-2 hover:border-[#50A5B1]/40 transition"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#1A265A] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                        {session.sport}
                      </span>
                      <span className="text-xs font-bold text-[#1A265A]">
                        {session.date} ({session.startTime} - {session.endTime})
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-[#1A265A] mt-1">{session.title}</h4>

                    <div className="text-xs text-[#1A265A]/70 flex items-center gap-2 mt-0.5">
                      <span>Plätze: {session.currentParticipants} / {session.maxParticipants}{session.type === 'gruppe' ? ` (Min. ${session.minParticipants || 2})` : ''}</span>
                      <span>·</span>
                      <span className="text-[#50A5B1] font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#50A5B1]" /> Kalender Synced
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-base font-black text-[#1A265A]">CHF {session.price}.–</div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Aktiv
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(session)}
                      className="bg-[#1A265A] hover:bg-[#253675] text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#50A5B1]" />
                      <span>Bearbeiten</span>
                    </button>
                  </div>
                </div>

                {/* Session Description / Hinweise */}
                {session.description && (
                  <div className="pt-2 border-t border-[#50A5B1]/15 text-[11px] text-[#1A265A]/80 font-medium flex items-start gap-1.5 bg-white/70 p-2 rounded-xl">
                    <Info className="w-3.5 h-3.5 text-[#F1600D] shrink-0 mt-0.5" />
                    <span>{session.description}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Edit Existing Session (Bereits erfasste Kurse bearbeiten) */}
      {editingSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#50A5B1]/30 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#50A5B1]/20">
              <h3 className="text-base text-[#1A265A] flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#F1600D]" />
                Lektion Bearbeiten
              </h3>
              <button
                onClick={() => setEditingSession(null)}
                className="text-slate-400 hover:text-[#1A265A] font-bold text-xs cursor-pointer"
              >
                ✕ Schliessen
              </button>
            </div>

            {/* Crucial Notice Banner regarding existing bookings */}
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                Hinweis für bereits gebuchte Kurse:
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Für bereits gebuchte Plätze gelten die ursprünglichen Konditionen (Preis & vereinbarte Leistungen) zum Buchungszeitpunkt. Deine Änderungen bezüglich Preis & Beschreibung gelten für alle neuen Buchungen.
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#1A265A] block mb-1">Titel der Lektion:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-semibold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1A265A] block mb-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#F1600D]" />
                  Beschreibung & Hinweise (z.B. Mietmaterial):
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-medium text-xs text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1A265A] block mb-1">Sportart:</label>
                  <select
                    value={editSport}
                    onChange={e => setEditSport(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-semibold text-[#1A265A]"
                  >
                    {currentCoach.sports.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1A265A] block mb-1">Typ:</label>
                  <select
                    value={editType}
                    onChange={e => setEditType(e.target.value as 'einzel' | 'gruppe')}
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-semibold text-[#1A265A]"
                  >
                    <option value="einzel">Einzelcoaching</option>
                    <option value="gruppe">Gruppenkurs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#1A265A] block mb-1">Datum:</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-semibold text-[#1A265A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A265A] block mb-1">Von:</label>
                  <input
                    type="text"
                    value={editStartTime}
                    onChange={e => setEditStartTime(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-semibold text-[#1A265A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A265A] block mb-1">Bis:</label>
                  <input
                    type="text"
                    value={editEndTime}
                    onChange={e => setEditEndTime(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-semibold text-[#1A265A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1A265A] block mb-1">Preis / Person (CHF):</label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={editPrice}
                    onChange={e => setEditPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-black text-[#1A265A]"
                  />
                </div>

                {editType === 'gruppe' && (
                  <>
                    <div>
                      <label className="font-bold text-[#1A265A] block mb-1">Min. Teilnehmer:</label>
                      <input
                        type="number"
                        min="1"
                        max={editMaxParticipants}
                        value={editMinParticipants}
                        onChange={e => setEditMinParticipants(Math.max(1, Number(e.target.value)))}
                        className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-semibold text-[#1A265A]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#1A265A] block mb-1">Max. Teilnehmer:</label>
                      <input
                        type="number"
                        min={editMinParticipants}
                        max="30"
                        value={editMaxParticipants}
                        onChange={e => setEditMaxParticipants(Math.max(editMinParticipants, Number(e.target.value)))}
                        className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 font-semibold text-[#1A265A]"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#50A5B1]/20">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#F1600D] text-white hover:bg-[#d85208] shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>Änderungen Speichern</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
