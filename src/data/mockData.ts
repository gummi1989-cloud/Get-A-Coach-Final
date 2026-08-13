import { CoachProfile, SportCategory, SessionSlot, Booking, User, ChatMessage } from '../types';
import { generate300CoachesAndSessions } from './mockDataGenerator';

export const INITIAL_SPORTS: SportCategory[] = [
  {
    id: 'racketsport',
    name: 'Racketsport (Tennis, Padel, Squash)',
    iconName: 'CircleDot',
    description: 'Tennis, Padel Tennis, Squash, Badminton & Tischtennis – Einzeltraining & Taktik.',
    popularInCantons: ['ZH', 'BE', 'LU', 'BS', 'ZG']
  },
  {
    id: 'kampfsport',
    name: 'Kampfsport & Selbstverteidigung',
    iconName: 'Shield',
    description: 'Kickboxen, Thaiboxen, Krav Maga, Boxen & Selbstverteidigung.',
    popularInCantons: ['ZH', 'BE', 'BS', 'SG']
  },
  {
    id: 'eissport',
    name: 'Eissport & Wintersport',
    iconName: 'Snowflake',
    description: 'Eishockey, Eiskunstlauf, Schlittschuhlaufen, Ski & Skitouren.',
    popularInCantons: ['ZH', 'GR', 'BE', 'VS', 'ZG']
  },
  {
    id: 'wassersport',
    name: 'Wassersport (Schwimmen, Surfen, SUP)',
    iconName: 'Waves',
    description: 'Schwimmen, Flusswellen-Surfen, Stand Up Paddling & Freiwasser.',
    popularInCantons: ['ZH', 'LU', 'BE', 'SG']
  },
  {
    id: 'fitness',
    name: 'Fitness, Crossfit & Calisthenics',
    iconName: 'Dumbbell',
    description: 'Personal Fitness, Crossfit, Calisthenics, Bodystyling & TRX.',
    popularInCantons: ['ZH', 'BS', 'SG', 'BE']
  },
  {
    id: 'yoga',
    name: 'Yoga & Pilates',
    iconName: 'Sun',
    description: 'Vinyasa Flow, Hatha Yoga, Pilates Reformer & Core Training.',
    popularInCantons: ['ZH', 'LU', 'GE', 'VD', 'ZG']
  },
  {
    id: 'laufsport',
    name: 'Laufsport, Sprint & Triathlon',
    iconName: 'Footprints',
    description: 'Laufstilanalyse, Marathon, Trailrunning, Leichtathletik & Triathlon.',
    popularInCantons: ['ZH', 'BE', 'LU', 'SG']
  },
  {
    id: 'radsport',
    name: 'Radsport & Mountainbike',
    iconName: 'Bike',
    description: 'Mountainbike Single-Trails, Fahrtechnik, Rennrad & Skateboarding.',
    popularInCantons: ['GR', 'BE', 'LU', 'VS', 'ZH']
  },
  {
    id: 'klettern',
    name: 'Klettern & Bouldern',
    iconName: 'Mountain',
    description: 'Bouldern in der Halle, Vorstieg & Outdoor-Klettern am Fels.',
    popularInCantons: ['ZH', 'BE', 'SG']
  },
  {
    id: 'golf',
    name: 'Golf Coaching',
    iconName: 'Target',
    description: 'Schwunganalyse, Kurzspiel & Platzreife-Coaching auf Driving Ranges.',
    popularInCantons: ['ZH', 'ZG', 'SZ', 'GE']
  },
  {
    id: 'ballsport',
    name: 'Ballsport & Beachvolleyball',
    iconName: 'Zap',
    description: 'Beachvolleyball, Hallenvolleyball, Basketball & Team-Ballsport.',
    popularInCantons: ['BE', 'ZH', 'LU', 'SG']
  },
  {
    id: 'tanzen',
    name: 'Tanz & Movement',
    iconName: 'Sparkles',
    description: 'Salsa, Bachata, Hip-Hop, Zumba & Rhythmus-Movement.',
    popularInCantons: ['ZH', 'BS', 'GE', 'VD']
  },
  {
    id: 'reiten',
    name: 'Reitsport',
    iconName: 'Activity',
    description: 'Dressur, Springreiten & Ausreiten mit diplomierten Reitlehrern.',
    popularInCantons: ['BE', 'ZH', 'TG', 'AG']
  },
  {
    id: 'sonstiges',
    name: 'Sonstiges',
    iconName: 'Activity',
    description: 'Weitere Nischen- & Spezialsportarten, Koordinationstraining und individuelle Anfragen.',
    popularInCantons: ['ZH', 'BE', 'LU', 'BS', 'SG', 'GE', 'VD', 'ZG']
  }
];

export const MOCK_CLIENT_USER: User = {
  id: 'user_kunde_1',
  name: 'Marc Bieri',
  email: 'marc.bieri@swissmail.ch',
  role: 'kunde',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  phone: '+41 79 456 78 90',
  city: 'Zürich',
  canton: 'ZH'
};

export const MOCK_ADMIN_USER: User = {
  id: 'user_admin_1',
  name: 'Plattform Host (Admin)',
  email: 'admin@getacoach.ch',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  phone: '+41 44 123 45 67',
  city: 'Zürich',
  canton: 'ZH'
};

export const MOCK_COACH_USER: User = {
  id: 'user_coach_1',
  name: 'Svenja Meier',
  email: 'svenja.meier@swiss-padel.ch',
  role: 'coach',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  phone: '+41 78 123 45 67',
  city: 'Zürich',
  canton: 'ZH',
  isVerified: true,
  verificationStatus: 'verifiziert',
  verificationDocName: 'ausweis_svenja_meier_swisspadel.pdf',
  calendarSettings: {
    iCalToken: 'ical_feed_svenja_2026',
    iCalFeedUrl: 'webcal://getacoach.ch/ical/coach_svenja_meier_feed.ics',
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
        id: 'block_lunch_svenja',
        coachId: 'coach_1',
        title: 'Reguläre Mittagspause',
        type: 'pause',
        startDate: '2026-07-01',
        endDate: '2026-12-31',
        startTime: '12:00',
        endTime: '13:00'
      },
      {
        id: 'block_vacation_ticino',
        coachId: 'coach_1',
        title: 'Sommerferien Ticino',
        type: 'ferien',
        startDate: '2026-08-10',
        endDate: '2026-08-17'
      }
    ],
    autoSyncExternal: true,
    externalCalendarType: 'apple',
    lastICalExportAt: new Date().toISOString()
  }
};

export const MOCK_COACH_PROFILE: CoachProfile = {
  id: 'coach_1',
  userId: 'user_coach_1',
  name: 'Svenja Meier',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  locationName: 'Zürich',
  canton: 'ZH',
  coordinates: { lat: 47.3769, lng: 8.5417 },
  hourlyRate: 110,
  groupRate: 50,
  fiveSessionDiscount: 5,
  tenSessionDiscount: 10,
  rating: 4.9,
  reviewCount: 28,
  sports: ['Padel Tennis', 'Tennis'],
  bio: 'Diplomierte Swiss Padel Head Coach mit 8 Jahren Erfahrung. Spezialisiert auf Schlagtechnik, Taktik und Wettkampfvorbereitung.',
  achievements: ['Schweizer Vizemeisterin Padel 2024', 'SGSV Zertifizierte Trainerin B'],
  certificates: [
    { id: 'cert_svenja_1', title: 'Swiss Padel Coach A', year: '2023' },
    { id: 'cert_svenja_2', title: 'Dipl. Fitness- & Bewegungstrainerin SAFS', year: '2021' }
  ],
  isVerified: true,
  languages: ['Deutsch', 'Englisch'],
  slogan: 'Dein Erfolg ist mein Fokus – mit Präzision & Leidenschaft zum Ziel.',
  isProfileActive: true,
  featured: true,
  calendarSettings: MOCK_COACH_USER.calendarSettings
};

export const INITIAL_COACHES: CoachProfile[] = [MOCK_COACH_PROFILE];
export const INITIAL_SESSIONS: SessionSlot[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];
export const INITIAL_MESSAGES: ChatMessage[] = [];

