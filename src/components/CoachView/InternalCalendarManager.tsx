import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_COACH_PROFILE } from '../../data/mockData';
import { WorkingHoursDay, BlockedTimeSlot, SessionSlot } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Sun,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  CalendarCheck,
  User,
  MapPin,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface InternalCalendarManagerProps {
  onOpenCreateSessionModal?: () => void;
}

export const InternalCalendarManager: React.FC<InternalCalendarManagerProps> = ({
  onOpenCreateSessionModal
}) => {
  const {
    currentUser,
    coaches,
    sessions,
    bookings,
    updateWorkingHours,
    addBlockedSlot,
    deleteBlockedSlot,
    createSession
  } = useApp();

  // Find coach profile for current user
  const currentCoach = coaches.find(c => c.userId === currentUser.id || c.id === currentUser.id) || coaches[0] || MOCK_COACH_PROFILE;

  // Calendar view state: Selected Date (defaults to today or 2026-07-27)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-07-27');
  const [activeTab, setActiveTab] = useState<'calendar_view' | 'working_hours' | 'blocked_slots'>('calendar_view');

  // Working Hours Local State
  const [localWorkingHours, setLocalWorkingHours] = useState<WorkingHoursDay[]>(
    currentCoach?.calendarSettings?.workingHours || currentUser?.calendarSettings?.workingHours || [
      { dayOfWeek: 1, dayName: 'Montag', isWorking: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 2, dayName: 'Dienstag', isWorking: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 3, dayName: 'Mittwoch', isWorking: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 4, dayName: 'Donnerstag', isWorking: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 5, dayName: 'Freitag', isWorking: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 6, dayName: 'Samstag', isWorking: true, startTime: '09:00', endTime: '16:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 0, dayName: 'Sonntag', isWorking: false, startTime: '09:00', endTime: '12:00' }
    ]
  );

  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // New Blocked Slot Modal / Form State
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [blockTitle, setBlockTitle] = useState('');
  const [blockType, setBlockType] = useState<'pause' | 'ferien' | 'blockierung'>('pause');
  const [blockStartDate, setBlockStartDate] = useState(selectedDateStr);
  const [blockEndDate, setBlockEndDate] = useState(selectedDateStr);
  const [blockStartTime, setBlockStartTime] = useState('12:00');
  const [blockEndTime, setBlockEndTime] = useState('13:00');

  // Filter coach sessions & bookings for the coach
  const coachSessions = sessions.filter(s => s.coachId === currentCoach.id);
  const coachBookings = bookings.filter(b => b.coachId === currentCoach.id && b.status === 'bestaetigt');
  const blockedSlots = currentCoach?.calendarSettings?.blockedSlots || [];

  // Helper date navigation
  const shiftSelectedDate = (days: number) => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() + days);
    setSelectedDateStr(d.toISOString().split('T')[0]);
  };

  // Get day name for selected date
  const selectedDateObj = new Date(selectedDateStr);
  const dayOfWeekNum = selectedDateObj.getDay(); // 0-6
  const currentDayWorkingConfig = localWorkingHours.find(w => w.dayOfWeek === dayOfWeekNum);

  // Filter sessions and bookings for selected date
  const sessionsOnSelectedDate = coachSessions.filter(s => s.date === selectedDateStr);
  const bookingsOnSelectedDate = coachBookings.filter(b => b.date === selectedDateStr);

  // Check if whole day is blocked by vacation
  const isDayBlockedByVacation = blockedSlots.some(b => {
    if (b.type === 'ferien') {
      return selectedDateStr >= b.startDate && selectedDateStr <= b.endDate;
    }
    return false;
  });

  // Handle Save Working Hours
  const handleSaveWorkingHours = () => {
    updateWorkingHours(localWorkingHours);
    setSaveSuccessMessage('Arbeitszeiten & Pausen erfolgreich gespeichert!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Handle Add Blocked Slot
  const handleCreateBlockedSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle) return;

    addBlockedSlot({
      coachId: currentCoach.id,
      title: blockTitle,
      type: blockType,
      startDate: blockStartDate,
      endDate: blockEndDate,
      startTime: blockType === 'ferien' ? undefined : blockStartTime,
      endTime: blockType === 'ferien' ? undefined : blockEndTime
    });

    setBlockTitle('');
    setShowAddBlockModal(false);
    setSaveSuccessMessage('Sperrzeit / Ferien-Eintrag erfolgreich hinzugefügt!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Hours list for grid display (07:00 to 20:00)
  const timeHours = Array.from({ length: 14 }, (_, i) => i + 7);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#F1600D] via-[#f3772b] to-[#d85208] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl text-white font-oswald font-medium uppercase tracking-wide flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white bg-white/10 p-2 rounded-2xl shrink-0" />
            <span>Verfügbarkeiten, Arbeitszeiten & Pausen</span>
          </h2>
          <p className="text-xs text-[#FEF6ED]/90 mt-1 max-w-xl">
            Verwalte deine Arbeitszeiten, trage Ferientage ein und erstelle Kursslots. Gebuchte Lektionen blockieren automatisch deine Zeit im GET A COACH-System und im iCal-Feed.
          </p>
        </div>
      </div>

      {/* Success Notification Toast */}
      {saveSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-xs shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#50A5B1]/20 pb-2">
        <button
          onClick={() => setActiveTab('calendar_view')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'calendar_view'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'text-[#1A265A]/70 hover:bg-[#50A5B1]/20 hover:text-[#1A265A]'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-[#50A5B1]" />
          <span>Tages- & Wochenübersicht</span>
        </button>

        <button
          onClick={() => setActiveTab('working_hours')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'working_hours'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'text-[#1A265A]/70 hover:bg-[#50A5B1]/20 hover:text-[#1A265A]'
          }`}
        >
          <Clock className="w-4 h-4 text-[#50A5B1]" />
          <span>Arbeitszeiten & Pausen</span>
        </button>

        <button
          onClick={() => setActiveTab('blocked_slots')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'blocked_slots'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'text-[#1A265A]/70 hover:bg-[#50A5B1]/20 hover:text-[#1A265A]'
          }`}
        >
          <Sun className="w-4 h-4 text-[#50A5B1]" />
          <span>Ferien & Sperrzeiten ({blockedSlots.length})</span>
        </button>
      </div>

      {/* TAB 1: CALENDAR VIEW */}
      {activeTab === 'calendar_view' && (
        <div className="space-y-6">
          
          {/* Date Picker Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#50A5B1]/20 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => shiftSelectedDate(-1)}
                className="p-2 bg-[#FEF6ED] border border-[#50A5B1]/30 rounded-xl hover:bg-[#50A5B1]/20 text-[#1A265A] transition"
                title="Vorheriger Tag"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={e => setSelectedDateStr(e.target.value)}
                  className="px-3 py-2 bg-[#FEF6ED] border border-[#50A5B1]/30 rounded-xl font-extrabold text-xs text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
                <button
                  onClick={() => setSelectedDateStr('2026-07-27')}
                  className="px-3 py-2 bg-[#F1600D]/10 text-[#F1600D] hover:bg-[#F1600D]/20 font-bold text-xs rounded-xl transition"
                >
                  Heute
                </button>
              </div>

              <button
                onClick={() => shiftSelectedDate(1)}
                className="p-2 bg-[#FEF6ED] border border-[#50A5B1]/30 rounded-xl hover:bg-[#50A5B1]/20 text-[#1A265A] transition"
                title="Nächster Tag"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Date Summary Pill */}
            <div className="flex items-center gap-3 text-xs">
              <span className="font-extrabold text-[#1A265A] text-sm">
                {selectedDateObj.toLocaleDateString('de-CH', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </span>

              {isDayBlockedByVacation ? (
                <span className="bg-red-100 text-red-800 font-extrabold px-2.5 py-1 rounded-full text-[11px] border border-red-200">
                  🌴 FERIENTAG / GESPERRT
                </span>
              ) : currentDayWorkingConfig?.isWorking ? (
                <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full text-[11px] border border-emerald-200">
                  🟢 Arbeitstag ({currentDayWorkingConfig.startTime} - {currentDayWorkingConfig.endTime})
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-700 font-extrabold px-2.5 py-1 rounded-full text-[11px] border border-slate-200">
                  ⚪ Freier Tag (Nicht arbeitend)
                </span>
              )}
            </div>
          </div>

          {/* Daily Schedule Timeline Grid */}
          <div className="bg-white rounded-3xl p-5 border border-[#50A5B1]/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#50A5B1]/20 pb-3">
              <h3 className="font-extrabold text-sm text-[#1A265A] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F1600D]" />
                <span>Tagesablauf für den {selectedDateStr}</span>
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#1A265A]/70">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Gebucht
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#50A5B1]"></span> Freier Slot
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F1600D]"></span> Pause / Sperrung
                </span>
              </div>
            </div>

            {/* Time Slot List */}
            <div className="space-y-2">
              {timeHours.map(hour => {
                const hourStr = `${hour < 10 ? '0' + hour : hour}:00`;
                const nextHourStr = `${hour + 1 < 10 ? '0' + (hour + 1) : hour + 1}:00`;

                // Find session in this hour
                const sessionInHour = sessionsOnSelectedDate.find(s => {
                  const startH = parseInt(s.startTime.split(':')[0]);
                  return startH === hour;
                });

                // Find booking in this hour
                const bookingInHour = bookingsOnSelectedDate.find(b => {
                  const startH = parseInt(b.time.split(':')[0]);
                  return startH === hour;
                });

                // Check if in break
                const isBreak = currentDayWorkingConfig?.breakStartTime &&
                  hourStr >= currentDayWorkingConfig.breakStartTime &&
                  hourStr < (currentDayWorkingConfig.breakEndTime || '13:00');

                // Check if outside working hours
                const isOutsideWorkingHours = !currentDayWorkingConfig?.isWorking ||
                  hourStr < (currentDayWorkingConfig.startTime || '08:00') ||
                  hourStr >= (currentDayWorkingConfig.endTime || '18:00');

                return (
                  <div
                    key={hour}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs transition ${
                      bookingInHour
                        ? 'bg-emerald-50/80 border-emerald-300'
                        : sessionInHour
                        ? 'bg-[#50A5B1]/10 border-[#50A5B1]'
                        : isDayBlockedByVacation
                        ? 'bg-red-50/40 border-red-200 opacity-75'
                        : isBreak
                        ? 'bg-[#F1600D]/10 border-[#F1600D]/30'
                        : isOutsideWorkingHours
                        ? 'bg-slate-50 border-slate-200 text-slate-400'
                        : 'bg-[#FEF6ED] border-[#50A5B1]/20 hover:border-[#F1600D]'
                    }`}
                  >
                    {/* Time Label */}
                    <div className="w-20 font-black text-[#1A265A] flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#50A5B1]" />
                      <span>{hourStr}</span>
                    </div>

                    {/* Content Detail */}
                    <div className="flex-1">
                      {bookingInHour ? (
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                            GEBUCHT
                          </span>
                          <span className="font-bold text-emerald-950">
                            {bookingInHour.sessionTitle}
                          </span>
                          <span className="text-emerald-700 text-[11px]">
                            • Kunde: <strong>{bookingInHour.userName}</strong> ({bookingInHour.userPhone})
                          </span>
                        </div>
                      ) : sessionInHour ? (
                        <div className="flex items-center gap-2">
                          <span className="bg-[#50A5B1] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                            AUSSGESCHRIEBEN
                          </span>
                          <span className="font-bold text-[#1A265A]">
                            {sessionInHour.title} ({sessionInHour.currentParticipants}/{sessionInHour.maxParticipants} Teilnehmende)
                          </span>
                        </div>
                      ) : isDayBlockedByVacation ? (
                        <span className="font-extrabold text-red-700 flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5 text-red-500" />
                          Ferientag / Abwesenheit (Ganzes Tagesfenster gesperrt)
                        </span>
                      ) : isBreak ? (
                        <span className="font-bold text-[#F1600D] flex items-center gap-1">
                          <Coffee className="w-3.5 h-3.5 text-[#F1600D]" />
                          Reguläre Pause ({currentDayWorkingConfig?.breakStartTime} - {currentDayWorkingConfig?.breakEndTime})
                        </span>
                      ) : isOutsideWorkingHours ? (
                        <span className="text-slate-400 font-medium italic">
                          Ausserhalb der regulären Arbeitszeiten
                        </span>
                      ) : (
                        <span className="text-[#1A265A]/70 font-medium">
                          Freier Slot verfügbar – Bereit für Kurse oder Einzelbuchungen
                        </span>
                      )}
                    </div>

                    {/* Action Button for free slots */}
                    {!bookingInHour && !sessionInHour && !isDayBlockedByVacation && !isOutsideWorkingHours && (
                      <button
                        onClick={() => {
                          if (createSession) {
                            createSession({
                              coachId: currentCoach.id,
                              coachName: currentCoach.name,
                              coachAvatar: currentCoach.avatar,
                              sport: currentCoach.sports[0] || 'Fitness',
                              title: `${currentCoach.sports[0] || 'Sport'} Lektion`,
                              date: selectedDateStr,
                              startTime: hourStr,
                              endTime: nextHourStr,
                              locationName: currentCoach.locationName,
                              canton: currentCoach.canton,
                              coordinates: currentCoach.coordinates,
                              type: 'einzel',
                              maxParticipants: 1,
                              price: currentCoach.hourlyRate
                            });
                            setSaveSuccessMessage(`Slot für ${hourStr} - ${nextHourStr} erstellt!`);
                            setTimeout(() => setSaveSuccessMessage(null), 3000);
                          }
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-[#F1600D] text-[#F1600D] hover:text-white border border-[#F1600D] rounded-xl font-bold text-[11px] transition shrink-0 cursor-pointer shadow-xs"
                      >
                        + Slot freischalten
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKING HOURS & BREAKS */}
      {activeTab === 'working_hours' && (
        <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/20 shadow-xs space-y-6">
          <div className="border-b border-[#50A5B1]/20 pb-4">
            <h3 className="font-extrabold text-base text-[#1A265A]">
              Reguläre Arbeitszeiten & Mittagspausen
            </h3>
            <p className="text-xs text-[#1A265A]/70 mt-1">
              Definiere deine Standard-Arbeitszeiten pro Wochentag. Nur innerhalb dieser Zeiten können Kunden freie Slots buchen.
            </p>
          </div>

          <div className="space-y-3">
            {localWorkingHours.map((wh, idx) => (
              <div
                key={wh.dayOfWeek}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  wh.isWorking ? 'bg-[#FEF6ED] border-[#50A5B1]/20' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                {/* Day Toggle */}
                <div className="flex items-center gap-3 w-40">
                  <input
                    type="checkbox"
                    id={`day_${wh.dayOfWeek}`}
                    checked={wh.isWorking}
                    onChange={e => {
                      const updated = [...localWorkingHours];
                      updated[idx].isWorking = e.target.checked;
                      setLocalWorkingHours(updated);
                    }}
                    className="w-4 h-4 rounded text-[#F1600D] focus:ring-[#F1600D]"
                  />
                  <label htmlFor={`day_${wh.dayOfWeek}`} className="font-extrabold text-sm text-[#1A265A] cursor-pointer">
                    {wh.dayName}
                  </label>
                </div>

                {/* Hours Pickers */}
                {wh.isWorking ? (
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {/* Working Window */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1A265A]/70">Arbeitszeit:</span>
                      <input
                        type="time"
                        value={wh.startTime}
                        onChange={e => {
                          const updated = [...localWorkingHours];
                          updated[idx].startTime = e.target.value;
                          setLocalWorkingHours(updated);
                        }}
                        className="px-2 py-1 bg-white border border-[#50A5B1]/30 rounded-lg font-bold text-[#1A265A]"
                      />
                      <span>bis</span>
                      <input
                        type="time"
                        value={wh.endTime}
                        onChange={e => {
                          const updated = [...localWorkingHours];
                          updated[idx].endTime = e.target.value;
                          setLocalWorkingHours(updated);
                        }}
                        className="px-2 py-1 bg-white border border-[#50A5B1]/30 rounded-lg font-bold text-[#1A265A]"
                      />
                    </div>

                    {/* Pause Window */}
                    <div className="flex items-center gap-1.5 border-l border-[#50A5B1]/20 pl-4">
                      <Coffee className="w-3.5 h-3.5 text-[#F1600D]" />
                      <span className="font-bold text-[#1A265A]/70">Pause:</span>
                      <input
                        type="time"
                        value={wh.breakStartTime || '12:00'}
                        onChange={e => {
                          const updated = [...localWorkingHours];
                          updated[idx].breakStartTime = e.target.value;
                          setLocalWorkingHours(updated);
                        }}
                        className="px-2 py-1 bg-white border border-[#50A5B1]/30 rounded-lg font-bold text-[#1A265A]"
                      />
                      <span>bis</span>
                      <input
                        type="time"
                        value={wh.breakEndTime || '13:00'}
                        onChange={e => {
                          const updated = [...localWorkingHours];
                          updated[idx].breakEndTime = e.target.value;
                          setLocalWorkingHours(updated);
                        }}
                        className="px-2 py-1 bg-white border border-[#50A5B1]/30 rounded-lg font-bold text-[#1A265A]"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-bold italic">Ruhetag (Nicht arbeiten)</span>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#50A5B1]/20 flex justify-end">
            <button
              onClick={handleSaveWorkingHours}
              className="px-6 py-2.5 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Arbeitszeiten Speichern</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: BLOCKED SLOTS & FERIEN */}
      {activeTab === 'blocked_slots' && (
        <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/20 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#50A5B1]/20 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-[#1A265A]">
                Ferientage, Abwesenheiten & Sperrzeiten
              </h3>
              <p className="text-xs text-[#1A265A]/70 mt-1">
                Eingetragene Ferientage und Sperrungen blockieren automatisch alle Buchungen im entsprechenden Zeitraum.
              </p>
            </div>
            <button
              onClick={() => setShowAddBlockModal(true)}
              className="px-4 py-2 bg-[#F1600D] text-white font-bold text-xs rounded-xl hover:bg-[#d85208] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Eintrag Hinzufügen</span>
            </button>
          </div>

          {blockedSlots.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#1A265A]/60 space-y-2">
              <Sun className="w-8 h-8 text-[#F1600D] mx-auto opacity-70" />
              <p className="font-bold text-[#1A265A]">Keine aktiven Ferientage oder Sperrungen vorhanden.</p>
              <p>Trage geplante Abwesenheiten ein, damit Kunden keine Kurse in deinen Ferien buchen.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedSlots.map(slot => (
                <div
                  key={slot.id}
                  className="p-4 bg-[#FEF6ED] border border-[#50A5B1]/20 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      slot.type === 'ferien' ? 'bg-red-100 text-red-700' : 'bg-[#F1600D]/20 text-[#1A265A]'
                    }`}>
                      {slot.type === 'ferien' ? <Sun className="w-4 h-4" /> : <Coffee className="w-4 h-4 text-[#1A265A]" />}
                    </div>

                    <div>
                      <span className="font-extrabold text-sm text-[#1A265A] block">
                        {slot.title}
                      </span>
                      <span className="text-[#1A265A]/70 font-medium text-[11px]">
                        Zeitraum: <strong>{slot.startDate}</strong> bis <strong>{slot.endDate}</strong>
                        {slot.startTime && ` (${slot.startTime} - ${slot.endTime})`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      deleteBlockedSlot(slot.id);
                      setSaveSuccessMessage('Eintrag gelöscht.');
                      setTimeout(() => setSaveSuccessMessage(null), 3000);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Eintrag löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD BLOCKED SLOT MODAL */}
      {showAddBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#50A5B1]/20 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#50A5B1]/20 pb-3">
              <h3 className="font-black text-base text-[#1A265A] flex items-center gap-2">
                <Coffee className="w-5 h-5 text-[#F1600D]" />
                <span>Abwesenheit / Sperrzeit Eintragen</span>
              </h3>
              <button
                onClick={() => setShowAddBlockModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBlockedSlot} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1A265A] mb-1">Bezeichnung / Grund:</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Sommerferien Tessin, Zahnarzt, Privater Termin"
                  value={blockTitle}
                  onChange={e => setBlockTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FEF6ED] border border-[#50A5B1]/30 rounded-xl text-xs text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A265A] mb-1">Art der Sperrung:</label>
                <select
                  value={blockType}
                  onChange={e => setBlockType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FEF6ED] border border-[#50A5B1]/30 rounded-xl text-xs text-[#1A265A]"
                >
                  <option value="pause">Kurze Pause / Privater Termin</option>
                  <option value="ferien">Ferien / Mehrtägige Abwesenheit</option>
                  <option value="blockierung">Sonstige Blockierung</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1A265A] mb-1">Startdatum:</label>
                  <input
                    type="date"
                    required
                    value={blockStartDate}
                    onChange={e => setBlockStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FEF6ED] border border-[#50A5B1]/30 rounded-xl text-xs text-[#1A265A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1A265A] mb-1">Enddatum:</label>
                  <input
                    type="date"
                    required
                    value={blockEndDate}
                    onChange={e => setBlockEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FEF6ED] border border-[#50A5B1]/30 rounded-xl text-xs text-[#1A265A]"
                  />
                </div>
              </div>

              {blockType !== 'ferien' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A265A] mb-1">Startzeit:</label>
                    <input
                      type="time"
                      value={blockStartTime}
                      onChange={e => setBlockStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FEF6ED] border border-[#50A5B1]/30 rounded-xl text-xs text-[#1A265A]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A265A] mb-1">Endzeit:</label>
                    <input
                      type="time"
                      value={blockEndTime}
                      onChange={e => setBlockEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FEF6ED] border border-[#50A5B1]/30 rounded-xl text-xs text-[#1A265A]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#50A5B1]/20">
                <button
                  type="button"
                  onClick={() => setShowAddBlockModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Eintrag Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
