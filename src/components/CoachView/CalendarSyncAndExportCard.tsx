import React from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_COACH_PROFILE } from '../../data/mockData';
import {
  Calendar,
  Download
} from 'lucide-react';

export const CalendarSyncAndExportCard: React.FC = () => {
  const { coaches, currentUser, bookings } = useApp();

  const currentCoach = coaches.find(c => c.userId === currentUser.id || c.id === currentUser.id) || coaches[0] || MOCK_COACH_PROFILE;

  // Filter bookings for this coach
  const coachBookings = bookings.filter(b => b.coachId === currentCoach.id && b.status === 'bestaetigt');

  // Generate & Download .ics file
  const handleDownloadICS = () => {
    const icsHeader = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//GetACoach.ch//Coach Calendar//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:GetACoach - ' + currentCoach.name,
      'X-WR-TIMEZONE:Europe/Zurich'
    ];

    const icsEvents: string[] = [];

    coachBookings.forEach(b => {
      const dateClean = b.date.replace(/-/g, '');
      const timeParts = b.time.split(' - ');
      const startClean = (timeParts[0] || '10:00').replace(':', '') + '00';
      const endClean = (timeParts[1] || '11:00').replace(':', '') + '00';

      icsEvents.push(
        'BEGIN:VEVENT',
        `UID:booking-${b.id}@getacoach.ch`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;TZID=Europe/Zurich:${dateClean}T${startClean}`,
        `DTEND;TZID=Europe/Zurich:${dateClean}T${endClean}`,
        `SUMMARY:GetACoach: ${b.sessionTitle}`,
        `DESCRIPTION:Lektion: ${b.sport}\\nKunde: ${b.userName} (${b.userEmail} / ${b.userPhone})\\nZahlungsstatus: Bezahlt via ${b.paymentMethod}`,
        `LOCATION:${b.locationName}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    const icsFooter = ['END:VCALENDAR'];
    const icsContent = [...icsHeader, ...icsEvents, ...icsFooter].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `getacoach_kalender_${currentCoach.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#1A265A] via-[#243A70] to-[#121B42] text-white rounded-3xl p-6 sm:p-8 border border-blue-400/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold shadow-xs border border-white/30">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-oswald font-medium uppercase tracking-wide text-white flex items-center gap-2">
              <span>iCal & Kalender-Export</span>
              <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-white/30">
                Aktiv & Synchronisiert
              </span>
            </h3>
            <p className="text-xs text-white/90">
              Exportiere deine GET A COACH-Termine in dein privates Kalenderprogramm (Apple Calendar, Google, Outlook).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadICS}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>.ICS Datei Herunterladen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
