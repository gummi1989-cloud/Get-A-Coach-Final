import { CoachProfile, SportCategory, SessionSlot, Booking, User, ChatMessage } from '../types';

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
    description: 'Vinyasa Flow, Hatha Yoga, Pilates Reformer, Atemarbeit & Wellbeing.',
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
    description: 'Weitere Nischen- & Spezialsportarten, Wellbeing-Coaching, Koordinationstraining und individuelle Anfragen.',
    popularInCantons: ['ZH', 'BE', 'LU', 'BS', 'SG', 'GE', 'VD', 'ZG']
  }
];

export const MOCK_CLIENT_USER: User = {
  id: 'user_kunde_1',
  name: 'Marc Bieri',
  email: 'marc.bieri@swissmail.ch',
  role: 'kunde',
  avatar: '',
  phone: '+41 79 456 78 90',
  city: 'Zürich',
  canton: 'ZH'
};

export const MOCK_ADMIN_USER: User = {
  id: 'user_admin_1',
  name: 'Plattform Host (Admin)',
  email: 'admin@getacoach.ch',
  role: 'admin',
  avatar: '',
  phone: '+41 44 123 45 67',
  city: 'Zürich',
  canton: 'ZH'
};

export const MOCK_COACH_USER: User = {
  id: 'user_coach_1',
  name: 'Svenja Meier',
  email: 'svenja.meier@swiss-padel.ch',
  role: 'coach',
  avatar: '',
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

export const getFutureDate = (daysAhead: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

export const MOCK_COACH_PROFILE: CoachProfile = {
  id: 'coach_svenja_test',
  userId: 'user_coach_1',
  name: 'Svenja Meier (Test-Coach)',
  avatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300&auto=format&fit=crop&q=80',
  locationName: 'Zürich',
  canton: 'ZH',
  coordinates: { lat: 47.3769, lng: 8.5417 },
  hourlyRate: 5,
  groupRate: 5,
  fiveSessionDiscount: 5,
  tenSessionDiscount: 10,
  rating: 4.95,
  reviewCount: 28,
  sports: ['Tennis', 'Padel Tennis', 'Fitness & Ausdauer'],
  bio: 'Diplomierte Swiss Tennis & Padel Head Coach mit 8 Jahren Erfahrung. Ideal zum Testen der Online-Buchung und Stripe-Zahlung.',
  achievements: ['Schweizer Vizemeisterin Padel 2024', 'SGSV Zertifizierte Trainerin B'],
  certificates: [
    { id: 'cert_svenja_1', title: 'Swiss Padel Coach A', year: '2023' },
    { id: 'cert_svenja_2', title: 'Dipl. Fitness- & Bewegungstrainerin SAFS', year: '2021' }
  ],
  isVerified: true,
  languages: ['Deutsch', 'Englisch'],
  slogan: 'Dein persönlicher Test-Coach – Jetzt Stripe Test-Zahlung simulieren!',
  isProfileActive: true,
  featured: true,
  calendarSettings: MOCK_COACH_USER.calendarSettings
};

export const INITIAL_COACHES: CoachProfile[] = [MOCK_COACH_PROFILE];

export const INITIAL_SESSIONS: SessionSlot[] = [
  {
    id: 'session_test_5chf',
    coachId: 'coach_svenja_test',
    coachName: 'Svenja Meier (Test-Coach)',
    coachAvatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300&auto=format&fit=crop&q=80',
    sport: 'Fitness & Ausdauer',
    title: '⚡ Express Test-Session (Stripe Testzahlung CHF 5.00)',
    description: 'Perfekt zum schnellen Testen des Stripe-Zahlungsablaufs (TWINT / Kreditkarte) im Testmodus.',
    date: getFutureDate(1),
    startTime: '10:00',
    endTime: '11:00',
    locationName: 'Sportzentrum Allmend, Zürich',
    canton: 'ZH',
    coordinates: { lat: 47.3769, lng: 8.5417 },
    type: 'einzel',
    maxParticipants: 1,
    currentParticipants: 0,
    price: 5,
    status: 'verfuegbar',
    waitlist: []
  },
  {
    id: 'session_test_tennis_50chf',
    coachId: 'coach_svenja_test',
    coachName: 'Svenja Meier (Test-Coach)',
    coachAvatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300&auto=format&fit=crop&q=80',
    sport: 'Tennis',
    title: '🎾 Tennis Einzeltraining: Grundschläge & Taktik (CHF 50.00)',
    description: '1:1 Coaching auf Sandplatz inklusive Bällen, Platzmiete und individueller Videoanalyse.',
    date: getFutureDate(2),
    startTime: '14:00',
    endTime: '15:00',
    locationName: 'Tennis Club Grasshopper, Zürich',
    canton: 'ZH',
    coordinates: { lat: 47.3769, lng: 8.5417 },
    type: 'einzel',
    maxParticipants: 1,
    currentParticipants: 0,
    price: 50,
    status: 'verfuegbar',
    waitlist: []
  },
  {
    id: 'session_test_padel_25chf',
    coachId: 'coach_svenja_test',
    coachName: 'Svenja Meier (Test-Coach)',
    coachAvatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300&auto=format&fit=crop&q=80',
    sport: 'Padel Tennis',
    title: '🏓 Padel Tennis Match-Strategie (CHF 25.00)',
    description: 'Gruppentraining für 2 bis 4 Teilnehmer. Fokus auf Stellungsspiel, Bandeja und Vibora.',
    date: getFutureDate(3),
    startTime: '17:30',
    endTime: '18:30',
    locationName: 'Padel Arena Zürich-West',
    canton: 'ZH',
    coordinates: { lat: 47.3769, lng: 8.5417 },
    type: 'gruppe',
    minParticipants: 2,
    maxParticipants: 4,
    currentParticipants: 0,
    price: 25,
    status: 'verfuegbar',
    waitlist: []
  }
];

export const INITIAL_BOOKINGS: Booking[] = [];
export const INITIAL_MESSAGES: ChatMessage[] = [];

