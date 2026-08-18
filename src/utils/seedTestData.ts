import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User, CoachProfile, SessionSlot, Booking, CustomRequest, ChatMessage } from '../types';

export async function seedAllTestData() {
  console.log('Starting seed of test data to Firestore...');

  // 1. Customers
  const customer1: User = {
    id: 'user_kunde_101',
    name: 'Laura Bernasconi',
    email: 'laura.bernasconi@zurich-mail.ch',
    phone: '+41 79 111 22 33',
    role: 'kunde',
    city: 'Zürich',
    canton: 'ZH',
    avatar: '',
    agb_accepted_at: new Date().toISOString()
  };

  const customer2: User = {
    id: 'user_kunde_102',
    name: 'Matthias Hofer',
    email: 'matthias.hofer@bluewin.ch',
    phone: '+41 78 222 33 44',
    role: 'kunde',
    city: 'Bern',
    canton: 'BE',
    avatar: '',
    agb_accepted_at: new Date().toISOString()
  };

  const customer3: User = {
    id: 'user_kunde_103',
    name: 'Sophie Dubois',
    email: 'sophie.dubois@geneve-sport.ch',
    phone: '+41 79 333 44 55',
    role: 'kunde',
    city: 'Luzern',
    canton: 'LU',
    avatar: '',
    agb_accepted_at: new Date().toISOString()
  };

  // 2. Coach Users & Coach Profiles
  const coachUser1: User = {
    id: 'user_coach_1',
    name: 'Svenja Meier',
    email: 'svenja.meier@swiss-padel.ch',
    phone: '+41 78 123 45 67',
    role: 'coach',
    city: 'Zürich',
    canton: 'ZH',
    avatar: '',
    isVerified: true,
    verificationStatus: 'verifiziert',
    verificationDocName: 'ausweis_svenja_meier_swisspadel.pdf'
  };

  const coachProfile1: CoachProfile = {
    id: 'coach_1',
    userId: 'user_coach_1',
    name: 'Svenja Meier',
    avatar: '',
    sports: ['Padel Tennis', 'Tennis'],
    slogan: 'Dein Erfolg ist mein Fokus – mit Präzision & Leidenschaft zum Ziel.',
    bio: 'Diplomierte Swiss Padel Head Coach mit 8 Jahren Erfahrung. Spezialisiert auf Schlagtechnik, Taktik und Wettkampfvorbereitung.',
    achievements: ['Schweizer Vizemeisterin Padel 2024', 'SGSV Zertifizierte Trainerin B'],
    certificates: [
      { id: 'cert_s1', title: 'Swiss Padel Coach A', year: '2023' },
      { id: 'cert_s2', title: 'Dipl. Fitness- & Bewegungstrainerin SAFS', year: '2021' }
    ],
    hourlyRate: 110,
    groupRate: 50,
    fiveSessionDiscount: 5,
    tenSessionDiscount: 10,
    locationName: 'Zürich Lengg',
    canton: 'ZH',
    coordinates: { lat: 47.3769, lng: 8.5417 },
    rating: 4.9,
    reviewCount: 28,
    isVerified: true,
    isProfileActive: true,
    profileStatus: 'active',
    accountHolder: 'Svenja Meier',
    iban: 'CH93 0076 2011 6238 5295 1',
    bankName: 'UBS Switzerland AG',
    languages: ['Deutsch', 'Englisch'],
    featured: true
  };

  const coachUser2: User = {
    id: 'user_coach_2',
    name: 'Lukas Keller',
    email: 'lukas.keller@surf-aare.ch',
    phone: '+41 79 987 65 43',
    role: 'coach',
    city: 'Bern',
    canton: 'BE',
    avatar: '',
    isVerified: true,
    verificationStatus: 'verifiziert',
    verificationDocName: 'ausweis_lukas_keller.pdf'
  };

  const coachProfile2: CoachProfile = {
    id: 'coach_2',
    userId: 'user_coach_2',
    name: 'Lukas Keller',
    avatar: '',
    sports: ['Wassersport (Schwimmen, Surfen, SUP)'],
    slogan: 'Flow, Balance & Wassergefühl – Dein Surfer-Coach an der Aare.',
    bio: 'Zertifizierter Flusswellen-Surfer & SUP Instruktor. 6 Jahre Guiding an der Scherzligschleuse Thun und Aare Bern.',
    achievements: ['Scherzligschleuse Contest Top 3', 'SLRG Brevet I Expert'],
    certificates: [
      { id: 'cert_l1', title: 'ISA Surf Instructor Level 2', year: '2022' },
      { id: 'cert_l2', title: 'SLRG Wasserrettung Brevet Plus', year: '2020' }
    ],
    hourlyRate: 95,
    groupRate: 40,
    fiveSessionDiscount: 8,
    tenSessionDiscount: 12,
    locationName: 'Bern Aare',
    canton: 'BE',
    coordinates: { lat: 46.948, lng: 7.4474 },
    rating: 4.8,
    reviewCount: 19,
    isVerified: true,
    isProfileActive: true,
    profileStatus: 'active',
    accountHolder: 'Lukas Keller',
    iban: 'CH93 0076 2011 6238 5295 2',
    bankName: 'PostFinance AG',
    languages: ['Deutsch', 'Englisch', 'Französisch'],
    featured: true
  };

  const coachUser3: User = {
    id: 'user_coach_3',
    name: 'Elena Rossi',
    email: 'elena.rossi@yoga-luzern.ch',
    phone: '+41 76 555 44 33',
    role: 'coach',
    city: 'Luzern',
    canton: 'LU',
    avatar: '',
    isVerified: true,
    verificationStatus: 'verifiziert',
    verificationDocName: 'ausweis_elena_rossi.pdf'
  };

  const coachProfile3: CoachProfile = {
    id: 'coach_3',
    userId: 'user_coach_3',
    name: 'Elena Rossi',
    avatar: '',
    sports: ['Yoga & Pilates'],
    slogan: 'Körperliche Stärke & geistige Klarheit im Einklang.',
    bio: 'Vinyasa Flow & Pilates Reformer Teacher. 500h RYT Ausbildung in Indien & Schweiz.',
    achievements: ['500h Registered Yoga Teacher RYT', 'Pilates Reformer Master Trainer'],
    certificates: [
      { id: 'cert_e1', title: 'Yoga Alliance RYT 500', year: '2021' },
      { id: 'cert_e2', title: 'Diplom Bodyfeet Pilates Instructor', year: '2023' }
    ],
    hourlyRate: 105,
    groupRate: 35,
    fiveSessionDiscount: 10,
    tenSessionDiscount: 15,
    locationName: 'Luzern Seeufer',
    canton: 'LU',
    coordinates: { lat: 47.0502, lng: 8.3093 },
    rating: 5.0,
    reviewCount: 34,
    isVerified: true,
    isProfileActive: true,
    profileStatus: 'active',
    accountHolder: 'Elena Rossi',
    iban: 'CH93 0076 2011 6238 5295 3',
    bankName: 'Luzerner Kantonalbank',
    languages: ['Deutsch', 'Italienisch', 'Englisch'],
    featured: true
  };

  // 3. Sessions
  const session1: SessionSlot = {
    id: 'sess_test_1',
    coachId: 'coach_1',
    coachName: 'Svenja Meier',
    coachAvatar: '',
    sport: 'Padel Tennis',
    title: 'Padel Tennis 1:1 Technikanalyse & Taktik',
    description: 'Intensives Einzelcoaching inklusive Video-Feedback für Schlagtechnik & Netztaktik.',
    date: '2026-08-18',
    startTime: '10:00',
    endTime: '11:00',
    locationName: 'Padel Arena Lengg, Zürich',
    canton: 'ZH',
    coordinates: { lat: 47.3769, lng: 8.5417 },
    type: 'einzel',
    maxParticipants: 1,
    currentParticipants: 1,
    price: 110,
    status: 'ausgebucht',
    waitlist: []
  };

  const session2: SessionSlot = {
    id: 'sess_test_2',
    coachId: 'coach_2',
    coachName: 'Lukas Keller',
    coachAvatar: '',
    sport: 'Wassersport (Schwimmen, Surfen, SUP)',
    title: 'Aare Flusswellen-Surfen für Einsteiger',
    description: 'Sicherer Einstieg ins Welle-Surfen an der Aare mit kompletter Neoprenausrüstung.',
    date: '2026-08-19',
    startTime: '14:00',
    endTime: '15:30',
    locationName: 'Aare Welle Schönausteg, Bern',
    canton: 'BE',
    coordinates: { lat: 46.948, lng: 7.4474 },
    type: 'gruppe',
    minParticipants: 2,
    maxParticipants: 4,
    currentParticipants: 1,
    price: 95,
    status: 'verfuegbar',
    waitlist: []
  };

  const session3: SessionSlot = {
    id: 'sess_test_3',
    coachId: 'coach_3',
    coachName: 'Elena Rossi',
    coachAvatar: '',
    sport: 'Yoga & Pilates',
    title: 'Vinyasa Flow & Deep Core Relaxation',
    description: 'Dynamisches Yogatraining direkt am Vierwaldstättersee mit geführter Meditation.',
    date: '2026-08-20',
    startTime: '09:00',
    endTime: '10:15',
    locationName: 'Seepromenade Carl-Spitteler-Quai, Luzern',
    canton: 'LU',
    coordinates: { lat: 47.0502, lng: 8.3093 },
    type: 'gruppe',
    minParticipants: 2,
    maxParticipants: 6,
    currentParticipants: 1,
    price: 105,
    status: 'verfuegbar',
    waitlist: []
  };

  const session4: SessionSlot = {
    id: 'sess_test_4',
    coachId: 'coach_1',
    coachName: 'Svenja Meier',
    coachAvatar: '',
    sport: 'Tennis',
    title: 'Tennis Match-Strategie & Aufschlag-Masterclass',
    description: 'Praxisorientierter Matchaufbau, Platzierung beim Aufschlag und Return-Drills.',
    date: '2026-08-21',
    startTime: '17:00',
    endTime: '18:00',
    locationName: 'Tennisclub Lengg, Zürich',
    canton: 'ZH',
    coordinates: { lat: 47.3769, lng: 8.5417 },
    type: 'einzel',
    maxParticipants: 1,
    currentParticipants: 0,
    price: 120,
    status: 'verfuegbar',
    waitlist: []
  };

  // 4. Bookings
  const booking1: Booking = {
    id: 'book_test_1',
    sessionId: 'sess_test_1',
    userId: 'user_kunde_101',
    userName: 'Laura Bernasconi',
    userEmail: 'laura.bernasconi@zurich-mail.ch',
    userPhone: '+41 79 111 22 33',
    coachId: 'coach_1',
    coachName: 'Svenja Meier',
    coachAvatar: '',
    sport: 'Padel Tennis',
    sessionTitle: 'Padel Tennis 1:1 Technikanalyse & Taktik',
    date: '2026-08-18',
    time: '10:00 - 11:00',
    locationName: 'Padel Arena Lengg, Zürich',
    canton: 'ZH',
    pricePaid: 110,
    paymentMethod: 'TWINT',
    twintRefId: 'TWINT-88239102',
    paymentStatus: 'Bezahlt',
    bookingDate: new Date().toISOString(),
    status: 'bestaetigt',
    requestStatus: 'bestaetigt',
    clientRated: false,
    coachRated: false,
    blindRatingStatus: 'ausstehend'
  };

  const booking2: Booking = {
    id: 'book_test_2',
    sessionId: 'sess_test_2',
    userId: 'user_kunde_102',
    userName: 'Matthias Hofer',
    userEmail: 'matthias.hofer@bluewin.ch',
    userPhone: '+41 78 222 33 44',
    coachId: 'coach_2',
    coachName: 'Lukas Keller',
    coachAvatar: '',
    sport: 'Wassersport (Schwimmen, Surfen, SUP)',
    sessionTitle: 'Aare Flusswellen-Surfen für Einsteiger',
    date: '2026-08-19',
    time: '14:00 - 15:30',
    locationName: 'Aare Welle Schönausteg, Bern',
    canton: 'BE',
    pricePaid: 95,
    paymentMethod: 'Kreditkarte',
    paymentStatus: 'Bezahlt',
    bookingDate: new Date().toISOString(),
    status: 'bestaetigt',
    requestStatus: 'bestaetigt',
    clientRated: false,
    coachRated: false,
    blindRatingStatus: 'ausstehend'
  };

  const booking3: Booking = {
    id: 'book_test_3',
    sessionId: 'sess_test_3',
    userId: 'user_kunde_103',
    userName: 'Sophie Dubois',
    userEmail: 'sophie.dubois@geneve-sport.ch',
    userPhone: '+41 79 333 44 55',
    coachId: 'coach_3',
    coachName: 'Elena Rossi',
    coachAvatar: '',
    sport: 'Yoga & Pilates',
    sessionTitle: 'Vinyasa Flow & Deep Core Relaxation',
    date: '2026-08-20',
    time: '09:00 - 10:15',
    locationName: 'Seepromenade Carl-Spitteler-Quai, Luzern',
    canton: 'LU',
    pricePaid: 105,
    paymentMethod: 'TWINT',
    twintRefId: 'TWINT-99381023',
    paymentStatus: 'Bezahlt',
    bookingDate: new Date().toISOString(),
    status: 'bestaetigt',
    requestStatus: 'bestaetigt',
    clientRated: false,
    coachRated: false,
    blindRatingStatus: 'ausstehend'
  };

  // 5. Custom Requests
  const request1: CustomRequest = {
    id: 'req_test_1',
    userId: 'user_kunde_101',
    userName: 'Laura Bernasconi',
    userEmail: 'laura.bernasconi@zurich-mail.ch',
    userPhone: '+41 79 111 22 33',
    coachId: 'coach_3',
    coachName: 'Elena Rossi',
    sport: 'Yoga & Pilates',
    participantsCount: 2,
    preferredDate: '2026-08-25',
    preferredTimeWindow: '18:00 - 19:30',
    description: 'Anfrage für ein privates Post-Workout Pilates direkt am Züri-Seeufer.',
    status: 'ausstehend',
    createdAt: new Date().toISOString()
  };

  const request2: CustomRequest = {
    id: 'req_test_2',
    userId: 'user_kunde_102',
    userName: 'Matthias Hofer',
    userEmail: 'matthias.hofer@bluewin.ch',
    userPhone: '+41 78 222 33 44',
    coachId: 'coach_1',
    coachName: 'Svenja Meier',
    sport: 'Racketsport (Tennis, Padel, Squash)',
    participantsCount: 2,
    preferredDate: '2026-08-22',
    preferredTimeWindow: '10:00 - 12:00',
    description: 'Doppel-Taktik Intensivtraining vor unserem Clubturnier.',
    status: 'angebot_erstellt',
    createdAt: new Date().toISOString(),
    offerPrice: 220,
    offerDate: '2026-08-22',
    offerTime: '10:00 - 12:00',
    offerMessage: 'Hoi Matthias, sehr gerne! Ich habe den Platz reserviert und freue mich.',
    offerCreatedAt: new Date().toISOString()
  };

  const request3: CustomRequest = {
    id: 'req_test_3',
    userId: 'user_kunde_103',
    userName: 'Sophie Dubois',
    userEmail: 'sophie.dubois@geneve-sport.ch',
    userPhone: '+41 79 333 44 55',
    coachId: 'coach_2',
    coachName: 'Lukas Keller',
    sport: 'Wassersport (Schwimmen, Surfen, SUP)',
    participantsCount: 4,
    preferredDate: '2026-08-28',
    preferredTimeWindow: '16:00 - 18:00',
    description: 'Stand Up Paddling Gruppenevent für unser kleines Team am Vierwaldstättersee.',
    status: 'ausstehend',
    createdAt: new Date().toISOString()
  };

  // 6. Chat Messages
  const msg1: ChatMessage = {
    id: 'msg_test_1',
    senderId: 'user_kunde_101',
    senderName: 'Laura Bernasconi',
    senderRole: 'kunde',
    receiverId: 'user_coach_1',
    coachId: 'coach_1',
    userId: 'user_kunde_101',
    message: 'Hoi Svenja! Ich freue mich riesig auf das Padel-Training am Dienstag.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    type: 'text'
  };

  const msg2: ChatMessage = {
    id: 'msg_test_2',
    senderId: 'user_coach_1',
    senderName: 'Svenja Meier',
    senderRole: 'coach',
    receiverId: 'user_kunde_101',
    coachId: 'coach_1',
    userId: 'user_kunde_101',
    message: 'Hoi Laura! Sehr gerne, bring einfach gute Hallensportschuhe mit, Padel-Schläger bringe ich mit!',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    type: 'text'
  };

  const msg3: ChatMessage = {
    id: 'msg_test_3',
    senderId: 'user_kunde_102',
    senderName: 'Matthias Hofer',
    senderRole: 'kunde',
    receiverId: 'user_coach_2',
    coachId: 'coach_2',
    userId: 'user_kunde_102',
    message: 'Hallo Lukas, ist der Flusswellen-Sicherheitstrack und die Ausrüstung im Preis enthalten?',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'text'
  };

  const msg4: ChatMessage = {
    id: 'msg_test_4',
    senderId: 'user_coach_2',
    senderName: 'Lukas Keller',
    senderRole: 'coach',
    receiverId: 'user_kunde_102',
    coachId: 'coach_2',
    userId: 'user_kunde_102',
    message: 'Hoi Matthias, ja klar! Neoprenanzug, Helm und Schwimmweste stelle ich bereit.',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    type: 'text'
  };

  // Execute setDoc writes to Firestore
  try {
    await Promise.all([
      setDoc(doc(db, 'users', customer1.id), customer1),
      setDoc(doc(db, 'users', customer2.id), customer2),
      setDoc(doc(db, 'users', customer3.id), customer3),
      setDoc(doc(db, 'users', coachUser1.id), coachUser1),
      setDoc(doc(db, 'users', coachUser2.id), coachUser2),
      setDoc(doc(db, 'users', coachUser3.id), coachUser3),

      setDoc(doc(db, 'coaches', coachProfile1.id), coachProfile1),
      setDoc(doc(db, 'coaches', coachProfile2.id), coachProfile2),
      setDoc(doc(db, 'coaches', coachProfile3.id), coachProfile3),

      setDoc(doc(db, 'sessions', session1.id), session1),
      setDoc(doc(db, 'sessions', session2.id), session2),
      setDoc(doc(db, 'sessions', session3.id), session3),
      setDoc(doc(db, 'sessions', session4.id), session4),

      setDoc(doc(db, 'bookings', booking1.id), booking1),
      setDoc(doc(db, 'bookings', booking2.id), booking2),
      setDoc(doc(db, 'bookings', booking3.id), booking3),

      setDoc(doc(db, 'customRequests', request1.id), request1),
      setDoc(doc(db, 'customRequests', request2.id), request2),
      setDoc(doc(db, 'customRequests', request3.id), request3),

      setDoc(doc(db, 'chatMessages', msg1.id), msg1),
      setDoc(doc(db, 'chatMessages', msg2.id), msg2),
      setDoc(doc(db, 'chatMessages', msg3.id), msg3),
      setDoc(doc(db, 'chatMessages', msg4.id), msg4)
    ]);
    console.log('Successfully seeded 3 customers, 3 coaches, sessions, bookings, requests, and chat messages into Firestore!');
  } catch (error) {
    console.error('Error seeding test data to Firestore:', error);
  }
}
