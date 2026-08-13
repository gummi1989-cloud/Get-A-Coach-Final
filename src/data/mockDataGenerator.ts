import { CoachProfile, SessionSlot, CantonCode } from '../types';
import { SWISS_TOP_30_CITIES } from './swissTop30Cities';
import { INITIAL_SPORTS } from './mockData';

// Generate 35 Realistic Swiss Coaches
const COACH_NAMES = [
  { name: 'Svenja Meier', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80', bio: 'Swiss Padel Head Coach mit 8 Jahren Erfahrung. Schlagtechnik & Turniervorbereitung.' },
  { name: 'Lukas Keller', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80', bio: 'Paddel- und Surf-Instruktor an Flusswellen & Seen. Balance, Kantensteuerung & Flow.' },
  { name: 'Elena Rossi', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80', bio: 'Vinyasa Yoga Teacher & Personal Trainer. Mobilität, Tiefenentspannung & Core Strength.' },
  { name: 'Marco Odermatt-Schmid', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', bio: 'Ehemaliger Leistungssportler. Hochintensives HIIT, Langhanteltraining & Athletik.' },
  { name: 'Fabian Wenger', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80', bio: 'Swiss Tennis B-Trainer. Technikanalyse per Video & Taktik für Anfänger bis Pros.' },
  { name: 'Janine Sutter', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80', bio: 'Pilates Reformer & Bodyweight Specialist. Gezieltes Rumpftraining & Haltungskorrektur.' },
  { name: 'Patrick Baumgartner', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', bio: 'Crossfit L2 Trainer & Olympic Weightlifting Coach. Kraft, Ausdauer & Mentale Härte.' },
  { name: 'Chantal Favre', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', bio: 'Schwimm- & Aquatics Coach. Kraultechnik, Atemrhythmus & Freiwasser-Vorbereitung.' },
  { name: 'Gian-Luca Bernasconi', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', bio: 'Kampfsport- & Selbstverteidigungs-Instruktor. Kickboxen & Krav Maga.' },
  { name: 'Brigitte Huber', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80', bio: 'PGA Golf Professional. Schwunganalyse, Kurzspiel & Platzreife-Intensivkurse.' },
  { name: 'Pascal Zürcher', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80', bio: 'Marathon & Trailrun Coach. Laufstilanalyse, Laktat-Tests & Pacing-Strategien.' },
  { name: 'Rahel Tobler', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', bio: 'MTB Enduro & Road Bike Guide. Fahrtechnik, Spitzkehren & Kurvendynamik.' },
  { name: 'Nico Ammann', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80', bio: 'Dipl. Kletter- & Bouldertrainer. Vorstieg, Sturztraining & Grifftechnik.' },
  { name: 'Monika Bärtschi', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80', bio: 'Squash & Badminton Pro. Beinarbeit, Reflexe & Taktik im Court.' },
  { name: 'Simon Brunner', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', bio: 'Kickbox-Champion Schweiz. Sparring, Pratzenarbeit & Kardio-Kick.' },
  { name: 'Saskia Lüscher', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80', bio: 'SUP & Open Water Instructor. Stand Up Paddling, Balance & Core Workout.' },
  { name: 'Dominik Tschudi', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80', bio: 'Beachvolleyball Pro-Coach. Zuspiel, Block & Aufschlag-Effizienz.' },
  { name: 'Melanie Freimann', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&auto=format&fit=crop&q=80', bio: 'Zumba & Tanz-Instruktorin. Rhythmus, Ausdauer & Pure Freude an Bewegung.' },
  { name: 'Beat Inderbitzin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80', bio: 'Calisthenics & Street Workout Specialist. Muscle-ups, Handstand & Human Flag.' },
  { name: 'Cornelia Stadelmann', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80', bio: 'Triathlon & Endurance Coach. Koppeltraining, Wechselzone & Ernährungsplanung.' }
];

export function generate300CoachesAndSessions(): { coaches: CoachProfile[]; sessions: SessionSlot[] } {
  const coaches: CoachProfile[] = [];
  const sessions: SessionSlot[] = [];

  // Generate 20 Base Coaches assigned across the 30 cities
  COACH_NAMES.forEach((cData, idx) => {
    const cityObj = SWISS_TOP_30_CITIES[idx % SWISS_TOP_30_CITIES.length];
    const coachId = `coach_${idx + 1}`;
    
    // Pick 2-3 sports
    const sport1 = INITIAL_SPORTS[idx % INITIAL_SPORTS.length].name;
    const sport2 = INITIAL_SPORTS[(idx + 3) % INITIAL_SPORTS.length].name;

    const SLOGANS = [
      "Dein Erfolg ist mein Fokus – mit Präzision & Leidenschaft zum Ziel.",
      "Bewegung neu erleben – Ganzheitliches Training für Körper & Geist.",
      "Vom Einsteiger zum Turnierspieler: Technik, Taktik & Mentale Stärke.",
      "Körpergefühl, Kraft & Balance in jeder Bewegung.",
      "Freude an der Leistung – Massgeschneidertes Performance-Coaching."
    ];

    const SAMPLE_ACHIEVEMENTS = [
      ["Schweizer Vizemeister 2024", "Über 10 Jahre Erfahrung als Performance Coach", "500+ zufriedene Athleten betreut"],
      ["Top 10 Kategoriensieger CH", "Zertifizierter Mental- & Athletiktrainer", "Spezialisierung auf Bewegungsanalyse"],
      ["Ehemaliger Nationalkader-Athlet", "Dozent für Sportphysiologie & Bewegung", "Autor für Schweizer Sportfachmagazine"],
      ["Diplomierter Trainer mit Auszeichnung", "Ganzheitliches Coaching-Konzept", "Regelmässige Weiterbildungen in der Schweiz & USA"]
    ];

    const SAMPLE_CERTS = [
      [
        { id: `cert_${idx}_1`, title: 'Swiss Olympic Coach B', year: '2022' },
        { id: `cert_${idx}_2`, title: 'Dipl. Fitness & Bewegungstrainer SAFS', year: '2020' }
      ],
      [
        { id: `cert_${idx}_1`, title: 'J+S Experte & Nachwuchstrainer', year: '2021' },
        { id: `cert_${idx}_2`, title: 'Zertifikat Sportphysiologie EH', year: '2023' }
      ],
      [
        { id: `cert_${idx}_1`, title: 'Dipl. Mental Coach STV', year: '2019' },
        { id: `cert_${idx}_2`, title: 'Personal Trainer SAFS Master', year: '2022' }
      ]
    ];

    const SAMPLE_DESCRIPTIONS = [
      "Mietmaterial (Schläger/Ausrüstung) nicht im Preis enthalten. Kann auf Wunsch vor Ort gelöst werden.",
      "Bitte eigene Handtücher & Sportbekleidung mitbringen. Umkleidekabinen und Duschen stehen kostenfrei bereit.",
      "Inklusive individueller Video-Technikanalyse nach dem Training. Treffpunkt 10 Min. vor Beginn.",
      "Bring bitte eigene Hallenschuhe mit heller Sohle mit. Test-Equipment wird zur Verfügung gestellt."
    ];

    coaches.push({
      id: coachId,
      userId: `user_coach_${idx + 1}`,
      name: cData.name,
      avatar: cData.avatar,
      sports: [sport1, sport2],
      slogan: SLOGANS[idx % SLOGANS.length],
      bio: cData.bio,
      achievements: SAMPLE_ACHIEVEMENTS[idx % SAMPLE_ACHIEVEMENTS.length],
      certificates: SAMPLE_CERTS[idx % SAMPLE_CERTS.length],
      hourlyRate: 85 + (idx % 8) * 10,
      groupRate: 35 + (idx % 4) * 5,
      locationName: cityObj.subLocations[0],
      canton: cityObj.canton as CantonCode,
      coordinates: { lat: cityObj.lat, lng: cityObj.lng },
      rating: Number((4.7 + (idx % 3) * 0.1).toFixed(2)),
      reviewCount: 15 + idx * 3,
      isVerified: true,
      isProfileActive: true,
      profileStatus: 'active',
      accountHolder: cData.name,
      iban: `CH93 0076 2011 6238 5295 ${(idx % 8) + 1}`,
      bankName: idx % 2 === 0 ? 'UBS Switzerland AG' : 'PostFinance AG',
      calendarSettings: {
        iCalToken: `ical_feed_${idx + 1}_2026`,
        iCalFeedUrl: `webcal://getacoach.ch/ical/coach_${idx + 1}_feed.ics`,
        workingHours: [
          { dayOfWeek: 1, dayName: 'Montag', isWorking: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
          { dayOfWeek: 2, dayName: 'Dienstag', isWorking: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
          { dayOfWeek: 3, dayName: 'Mittwoch', isWorking: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
          { dayOfWeek: 4, dayName: 'Donnerstag', isWorking: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
          { dayOfWeek: 5, dayName: 'Freitag', isWorking: true, startTime: '08:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' },
          { dayOfWeek: 6, dayName: 'Samstag', isWorking: true, startTime: '09:00', endTime: '16:00', breakStartTime: '12:00', breakEndTime: '13:00' },
          { dayOfWeek: 0, dayName: 'Sonntag', isWorking: false, startTime: '09:00', endTime: '12:00' }
        ],
        blockedSlots: [
          {
            id: `block_lunch_${idx + 1}`,
            coachId: `coach_${idx + 1}`,
            title: 'Reguläre Mittagspause',
            type: 'pause',
            startDate: '2026-07-01',
            endDate: '2026-12-31',
            startTime: '12:00',
            endTime: '13:00'
          }
        ],
        autoSyncExternal: true,
        externalCalendarType: 'google',
        lastICalExportAt: new Date().toISOString()
      },
      fiveSessionDiscount: 10,
      tenSessionDiscount: 15,
      languages: idx % 2 === 0 ? ['Deutsch', 'Englisch'] : ['Deutsch', 'Englisch', 'Französisch'],
      featured: idx < 6
    });
  });

  // Sample titles for session generation
  const TITLE_TEMPLATES = [
    '{sport} – Grundlagen & Technik-Klinik',
    '{sport} – Intensiv-Coaching 1:1',
    '{sport} – Power & Ausdauer Workshop',
    '{sport} – Taktik & Performance Analyse',
    '{sport} – Einsteiger & Schnupperlektion',
    '{sport} – Fortgeschrittene Match-Praxis',
    '{sport} – Morgen-Energy Workout',
    '{sport} – Feierabend Gruppen-Training',
    '{sport} – Masterclass & Video-Feedback',
    '{sport} – Spezial-Coaching & Mentaltraining'
  ];

  const START_TIMES = ['07:30', '08:30', '09:00', '10:00', '11:30', '14:00', '16:30', '17:30', '18:30', '19:30'];
  const MONTHS = [8, 9, 10, 11, 12]; // Aug 2026 to Dec 2026

  let sessionCounter = 1;

  // We want EXACTLY 300 sessions spread evenly across all 30 top cities!
  for (let i = 0; i < 300; i++) {
    const city = SWISS_TOP_30_CITIES[i % SWISS_TOP_30_CITIES.length];
    const coach = coaches[i % coaches.length];
    const sportObj = INITIAL_SPORTS[i % INITIAL_SPORTS.length];
    const subLoc = city.subLocations[i % city.subLocations.length];

    // Dates spread between 2026-08-01 and 2026-12-31
    const month = MONTHS[i % MONTHS.length];
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const day = ((i * 3) % 27) + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-${monthStr}-${dayStr}`;

    const startTime = START_TIMES[i % START_TIMES.length];
    const startHour = parseInt(startTime.split(':')[0], 10);
    const endHour = startHour + 1;
    const endTime = `${endHour < 10 ? '0' + endHour : endHour}:00`;

    const isGroup = i % 3 === 0;
    const type = isGroup ? 'gruppe' : 'einzel';
    const maxParticipants = isGroup ? 4 + (i % 5) : 1;
    
    // Status: occasionally fully booked with waitlist to test waitlist feature
    const isBookedOut = i % 14 === 0;
    const currentParticipants = isBookedOut ? maxParticipants : (i % 2 === 0 && isGroup ? 2 : 0);
    const status = isBookedOut ? 'ausgebucht' : 'verfuegbar';

    const rawTitle = TITLE_TEMPLATES[i % TITLE_TEMPLATES.length];
    const title = rawTitle.replace('{sport}', sportObj.name);

    const price = isGroup ? Math.round(coach.hourlyRate * 0.45) : coach.hourlyRate;
    const SAMPLE_DESCRIPTIONS_LIST = [
      "Mietmaterial nicht im Preis enthalten. Schläger und Ausrüstung können vor Ort bezogen werden.",
      "Inklusive Video-Feedback zur Bewegungsanalyse. Bitte Handtuch & Hallenschuhe mitbringen.",
      "Bitte 10 Minuten vor Lektionsbeginn am Treffpunkt eintreffen.",
      "Getränke und Duschen stehen vor Ort kostenlos zur Verfügung."
    ];

    sessions.push({
      id: `session_gen_${sessionCounter}`,
      coachId: coach.id,
      coachName: coach.name,
      coachAvatar: coach.avatar,
      sport: sportObj.name,
      title: title,
      description: SAMPLE_DESCRIPTIONS_LIST[i % SAMPLE_DESCRIPTIONS_LIST.length],
      date: dateStr,
      startTime: startTime,
      endTime: endTime,
      locationName: subLoc,
      canton: city.canton as CantonCode,
      coordinates: {
        lat: city.lat + (Math.random() - 0.5) * 0.02,
        lng: city.lng + (Math.random() - 0.5) * 0.02
      },
      type: type,
      minParticipants: isGroup ? 2 : 1,
      maxParticipants: maxParticipants,
      currentParticipants: currentParticipants,
      price: price,
      status: status,
      waitlist: isBookedOut
        ? [
            {
              userId: 'user_kunde_test',
              userName: 'Thomas Tanner',
              userEmail: 'thomas.t@bluewin.ch',
              joinedAt: '2026-07-25T10:15:00Z'
            }
          ]
        : []
    });

    sessionCounter++;
  }

  return { coaches, sessions };
}
