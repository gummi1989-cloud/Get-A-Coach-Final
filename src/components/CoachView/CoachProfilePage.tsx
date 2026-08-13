import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_SPORTS, MOCK_COACH_PROFILE } from '../../data/mockData';
import { SWISS_MUNICIPALITIES } from '../../data/swissMunicipalities';
import { CantonCode, CoachProfile } from '../../types';
import { validateSwissIBAN } from '../../utils/ibanUtils';
import {
  Lock,
  Zap,
  ShieldCheck,
  User,
  MapPin,
  Trophy,
  Award,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  Save,
  Check,
  ChevronDown,
  Upload,
  Camera,
  Trash2,
  Quote,
  GraduationCap,
  Globe,
  BookOpen,
  Info,
  Coins,
  Star,
  CreditCard,
  AlertCircle,
  Building2
} from 'lucide-react';
import { IDVerificationCard } from './IDVerificationCard';
import { CoachPricingAndFeesTab } from './CoachPricingAndFeesTab';
import { BlindRatingsCoachTab } from './BlindRatingsCoachTab';

const CANTONS: CantonCode[] = [
  'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL',
  'ZG', 'FR', 'SO', 'BS', 'BL', 'SH', 'AR', 'AI',
  'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE',
  'GE', 'JU'
];

interface CoachProfilePageProps {
  initialSubTab?: 'profile' | 'verification' | 'pricing' | 'reviews' | 'sessions';
  onOpenTaxInfo?: () => void;
}

export const CoachProfilePage: React.FC<CoachProfilePageProps> = ({ initialSubTab, onOpenTaxInfo }) => {
  const { currentUser, switchRole, coaches, updateCoachProfile, createSession, sessions, acceptAgb, acceptCoachTaxDeclaration } = useApp();

  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'verification' | 'pricing' | 'reviews' | 'sessions'>(
    initialSubTab || 'profile'
  );
  const [sessionsFilter, setSessionsFilter] = useState<'all' | 'create' | 'active'>('all');

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveProfileTab(initialSubTab);
    }
  }, [initialSubTab]);

  // SECURITY GUARD: Lock page for customers!
  if (currentUser.role === 'kunde') {
    return (
      <div className="max-w-3xl mx-auto bg-[#1A265A] text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-[#50A5B1]/30 text-center my-8 space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#50A5B1]/20 text-[#F1600D] flex items-center justify-center mx-auto shadow-lg border border-[#F1600D]/30">
          <Lock className="w-8 h-8 text-[#F1600D]" />
        </div>
        
        <div className="space-y-2">
          <span className="bg-[#F1600D]/20 text-[#F1600D] font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border border-[#F1600D]/30">
            Zugriff Gesperrt · Nur für Dienstleistungsanbieter
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white pt-1">
            Coach-Portal & Angebotsverwaltung
          </h2>
          <p className="text-xs sm:text-sm text-[#FEF6ED]/80 max-w-xl mx-auto leading-relaxed">
            Dieser Bereich ist ausschliesslich für verifizierte Coaches und Sport-Dienstleister reserviert. Hier verwalten Coaches ihr eigenes Profil, präsentieren ihr Sportangebot, legen Stundensätze fest und schalten buchbare Termine auf.
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-[#50A5B1]/30 text-left max-w-md mx-auto text-xs space-y-2 text-[#FEF6ED]">
          <div className="font-bold text-[#F1600D] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#50A5B1]" />
            Vorteile für GET A COACH Coaches:
          </div>
          <ul className="space-y-1 pl-4 list-disc text-[11px] text-[#FEF6ED]/90">
            <li>Integrierter GET A COACH-Kalender & iCal Sync (Apple, Google, Outlook)</li>
            <li>Bargeldlose TWINT-Abrechnung in CHF mit Auszahlungs-Garantie</li>
            <li>Verifiziertes Siegel & Blind-Ratings Bewertungsschutz</li>
          </ul>
        </div>

        <div className="pt-2">
          <button
            onClick={() => switchRole('coach')}
            className="bg-[#F1600D] hover:bg-[#d85208] text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition shadow-xl border border-white/20 flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <Zap className="w-4 h-4 text-white fill-white" />
            <span>Jetzt zu Coach-Konto (Svenja) wechseln</span>
          </button>
        </div>
      </div>
    );
  }

  // Find logged in coach profile
  const currentCoach = coaches.find(c => c.userId === currentUser.id || c.id === currentUser.id) || coaches[0] || MOCK_COACH_PROFILE;

  // Editable Profile Form State
  const [name, setName] = useState(currentCoach.name);
  const [avatar, setAvatar] = useState(currentCoach.avatar);
  const [locationName, setLocationName] = useState(currentCoach.locationName);
  const [canton, setCanton] = useState<CantonCode>(currentCoach.canton);
  const [hourlyRate, setHourlyRate] = useState(currentCoach.hourlyRate || 100);
  const [selectedSports, setSelectedSports] = useState<string[]>(currentCoach.sports || []);
  const [slogan, setSlogan] = useState(currentCoach.slogan || '');
  const [bio, setBio] = useState(currentCoach.bio || '');
  const [achievements, setAchievements] = useState<string[]>(currentCoach.achievements || []);
  const [newAchievement, setNewAchievement] = useState('');
  const [certificates, setCertificates] = useState(currentCoach.certificates || []);
  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertYear, setNewCertYear] = useState(new Date().getFullYear().toString());
  const [languages, setLanguages] = useState<string[]>(currentCoach.languages || ['Deutsch', 'Englisch']);
  const [customLanguage, setCustomLanguage] = useState('');

  // Bank details state (Bankverbindung)
  const [accountHolder, setAccountHolder] = useState(currentCoach.accountHolder || currentCoach.name || '');
  const [iban, setIban] = useState(currentCoach.iban || '');
  const [bankName, setBankName] = useState(currentCoach.bankName || '');
  const [ibanError, setIbanError] = useState('');
  const [activationAttemptError, setActivationAttemptError] = useState<string | null>(null);

  const [isProfileActive, setIsProfileActive] = useState(currentCoach.isProfileActive || false);
  const [agbAcceptedCoach, setAgbAcceptedCoach] = useState(true);
  const [taxDeclarationCoach, setTaxDeclarationCoach] = useState(true);
  const [agbError, setAgbError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Swiss IBAN Validation with Modulo-97 Algorithm
  const validateSwissIban = (val: string): boolean => {
    return validateSwissIBAN(val).isValid;
  };

  // Check mandatory fields for profile activation
  const getMissingProfileRequirements = (): string[] => {
    const missing: string[] = [];
    if (!avatar || !avatar.trim()) missing.push('Profilbild');
    if (!selectedSports || selectedSports.length === 0) missing.push('Mindestens eine Sportart / Kategorie');
    if (!locationName || !locationName.trim()) missing.push('Hauptstandort / Einzugsgebiet');
    if (!hourlyRate || Number(hourlyRate) <= 0) missing.push('Standard-Stundensatz (CHF)');
    if (!accountHolder || !accountHolder.trim()) missing.push('Name des Kontoinhabers');
    if (!iban || !validateSwissIban(iban)) missing.push('Gültige Schweizer IBAN (CH...)');
    if (!agbAcceptedCoach) missing.push('AGB & 15% Provision Akzeptanz');
    if (!taxDeclarationCoach) missing.push('Steuer- & AHV-Selbstdeklaration');
    return missing;
  };

  const missingRequirements = getMissingProfileRequirements();
  const isProfileComplete = missingRequirements.length === 0;

  const handleToggleActive = () => {
    if (!isProfileActive) {
      const missing = getMissingProfileRequirements();
      if (missing.length > 0) {
        setActivationAttemptError(
          'Bitte vervollständige zuerst deine Auszahlungsinformationen und Profilangaben, um dein Profil für Kunden freizuschalten.'
        );
        setIsProfileActive(false);
        return;
      }
    }
    setActivationAttemptError(null);
    setIsProfileActive(!isProfileActive);
  };

  // File input ref & upload handler for profile picture (JPG / PNG)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Bitte wähle eine gültige Bilddatei im Format JPG oder PNG aus.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Das ausgewählte Bild ist zu gross (maximal 8 MB erlaubt).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Swiss Municipalities dropdown autocomplete state
  const [showMuniDropdown, setShowMuniDropdown] = useState(false);

  // New Session Creation State
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [slotTitle, setSlotTitle] = useState('');
  const [slotDescription, setSlotDescription] = useState('Mietmaterial nicht im Preis enthalten.');
  const [slotSport, setSlotSport] = useState(selectedSports[0] || 'Tennis');
  const [slotDate, setSlotDate] = useState('2026-08-01');
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('10:00');
  const [slotType, setSlotType] = useState<'einzel' | 'gruppe'>('einzel');
  const [slotMinParticipants, setSlotMinParticipants] = useState(2);
  const [slotMaxParticipants, setSlotMaxParticipants] = useState(4);
  const [slotPrice, setSlotPrice] = useState(hourlyRate);

  // Filter municipalities for profile location input
  const filteredMunis = locationName.trim()
    ? SWISS_MUNICIPALITIES.filter(
        m =>
          m.plz.includes(locationName.trim()) ||
          m.name.toLowerCase().includes(locationName.trim().toLowerCase()) ||
          m.canton.toLowerCase().includes(locationName.trim().toLowerCase())
      )
    : SWISS_MUNICIPALITIES;

  const handleToggleSport = (sportName: string) => {
    if (selectedSports.includes(sportName)) {
      if (selectedSports.length > 1) {
        setSelectedSports(selectedSports.filter(s => s !== sportName));
      }
    } else {
      setSelectedSports([...selectedSports, sportName]);
    }
  };

  const handleAddAchievement = () => {
    if (!newAchievement.trim()) return;
    setAchievements([...achievements, newAchievement.trim()]);
    setNewAchievement('');
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleAddCert = () => {
    if (!newCertTitle.trim()) return;
    setCertificates([
      ...certificates,
      { id: 'cert_' + Date.now(), title: newCertTitle.trim(), year: newCertYear.trim() }
    ]);
    setNewCertTitle('');
  };

  const handleRemoveCert = (id: string) => {
    setCertificates(certificates.filter(c => c.id !== id));
  };

  const COMMON_LANGUAGES = ['Deutsch', 'Englisch', 'Französisch', 'Italienisch'];

  const handleToggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      if (languages.length > 1) {
        setLanguages(languages.filter(l => l !== lang));
      }
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const handleAddCustomLanguage = () => {
    if (!customLanguage.trim()) return;
    const lang = customLanguage.trim();
    if (!languages.includes(lang)) {
      setLanguages([...languages, lang]);
    }
    setCustomLanguage('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agbAcceptedCoach || !taxDeclarationCoach) {
      setAgbError(true);
      return;
    }

    const ibanCheck = validateSwissIBAN(iban);
    if (iban && !ibanCheck.isValid) {
      const errMsg = ibanCheck.error || 'Bitte gib eine gültige Schweizer IBAN ein.';
      setIbanError(errMsg);
      setActivationAttemptError(errMsg);
      return;
    } else {
      setIbanError('');
      if (ibanCheck.isValid) {
        setIban(ibanCheck.formatted);
      }
    }

    const missing = getMissingProfileRequirements();

    if (isProfileActive && missing.length > 0) {
      setActivationAttemptError(
        'Bitte vervollständige zuerst deine Auszahlungsinformationen und Profilangaben, um dein Profil für Kund:innen freizuschalten.'
      );
      setIsProfileActive(false);
      return;
    }

    setActivationAttemptError(null);
    acceptAgb("1.0");
    acceptCoachTaxDeclaration();

    const canBeActive = isProfileActive && missing.length === 0;

    updateCoachProfile(currentCoach.id, {
      name,
      avatar,
      locationName,
      canton,
      hourlyRate: Number(hourlyRate),
      sports: selectedSports,
      slogan,
      bio,
      achievements,
      certificates,
      languages,
      accountHolder,
      iban,
      bankName,
      isProfileActive: canBeActive,
      profileStatus: canBeActive ? 'active' : 'pending_completion'
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotTitle.trim()) return;

    createSession({
      coachId: currentCoach.id,
      coachName: name,
      coachAvatar: avatar,
      sport: slotSport,
      title: slotTitle,
      description: slotDescription,
      date: slotDate,
      startTime: slotStartTime,
      endTime: slotEndTime,
      locationName: locationName,
      canton: canton,
      coordinates: currentCoach.coordinates,
      type: slotType,
      minParticipants: slotType === 'einzel' ? 1 : slotMinParticipants,
      maxParticipants: slotType === 'einzel' ? 1 : slotMaxParticipants,
      price: slotPrice
    });

    setSlotTitle('');
    setSlotDescription('Mietmaterial nicht im Preis enthalten.');
    setShowAddSlotModal(false);
  };

  const mySessions = sessions.filter(s => s.coachId === currentCoach.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Sub-navigation bar inside Mein Profil */}
      <div className="bg-white rounded-3xl border border-[#50A5B1]/20 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none mb-2">
        <button
          onClick={() => setActiveProfileTab('profile')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeProfileTab === 'profile'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
          }`}
        >
          <User className="w-4 h-4 text-[#F1600D]" />
          <span>Profil & Angebot</span>
        </button>

        <button
          onClick={() => setActiveProfileTab('sessions')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeProfileTab === 'sessions'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#F1600D]" />
          <span>Neue Lektion aufschalten</span>
        </button>

        <button
          onClick={() => setActiveProfileTab('verification')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeProfileTab === 'verification'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#F1600D]" />
          <span>Ausweis-Check</span>
          {currentUser.isVerified && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeProfileTab === 'verification' ? 'bg-[#F1600D] text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              ✓
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveProfileTab('pricing')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeProfileTab === 'pricing'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
          }`}
        >
          <Coins className="w-4 h-4 text-[#F1600D]" />
          <span>Preise & Konditionen</span>
        </button>

        <button
          onClick={() => setActiveProfileTab('reviews')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeProfileTab === 'reviews'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
          }`}
        >
          <Star className="w-4 h-4 text-[#F1600D] fill-[#F1600D]" />
          <span>Kund:innen-Bewertungen</span>
        </button>
      </div>

      {activeProfileTab === 'profile' && (
        <div className="space-y-8">
          {/* Main Header Card */}
      <div className="bg-gradient-to-r from-[#F1600D] via-[#f3772b] to-[#d85208] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/50 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-[10px]" title="Aktiv">
              ✓
            </span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl text-white">{name}</h1>
            <p className="text-xs text-[#FEF6ED]/80 flex items-center gap-2">
              <span>{locationName} ({canton})</span>
              <span>·</span>
              <span>{selectedSports.join(', ')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Coach Presentation & Pricing Form */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#50A5B1]/20 shadow-xs space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-[#50A5B1]/20">
            <h2 className="text-lg text-[#1A265A] flex items-center gap-2 font-bold">
              <User className="w-5 h-5 text-[#F1600D]" />
              Profil & Präsentation verwalten
            </h2>
            {isSaved && (
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                Gespeichert!
              </span>
            )}
          </div>

          {/* Profile Completeness & Live Lock Status Banner */}
          {!isProfileComplete ? (
            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1 shadow-2xs">
                    <Lock className="w-3 h-3" /> Status: Entwurf / Unvollständig
                  </span>
                  <span className="font-bold text-amber-950 text-xs">
                    Profil-Sperre aktiv (Nicht im Katalog)
                  </span>
                </div>
              </div>
              <p className="text-amber-900 font-medium leading-relaxed">
                Bitte vervollständige zuerst deine Auszahlungsinformationen und Profilangaben, um dein Profil für Kund:innen freizuschalten.
              </p>
              <div className="pt-2 border-t border-amber-200">
                <span className="font-bold text-amber-950 text-[11px] block mb-1.5">
                  Fehlende Pflichtangaben ({missingRequirements.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {missingRequirements.map((req, i) => (
                    <span key={i} className="bg-white border border-amber-300 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Status: Bereit für Live
                </span>
                <span className="font-bold text-emerald-950">
                  Alle Pflichtangaben vollständig!
                </span>
              </div>
              <span className="text-emerald-800 font-bold">
                {isProfileActive ? '✅ Profil ist live & in der Suche sichtbar' : '⏸️ Profil ist aktuell pausiert'}
              </span>
            </div>
          )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Name */}
              <div className="col-span-1 sm:col-span-2">
                <label className="font-bold text-[#1A265A] block mb-1">Anzeigename / Titel:</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-semibold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
              </div>

              {/* Profilbild Upload (JPG / PNG) */}
              <div className="col-span-1 sm:col-span-2 bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/30">
                <label className="font-extrabold text-[#1A265A] block mb-2 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#F1600D]" />
                    Profilbild hochladen (JPG oder PNG)
                  </span>
                  <span className="text-[10px] text-[#1A265A]/60 font-semibold">Max. 8 MB</span>
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={avatar}
                      alt="Profilbild Vorschau"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-[#50A5B1] shadow-xs"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#1A265A] text-white p-1 rounded-full text-[10px]">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                      id="coach-avatar-upload"
                    />
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#1A265A] hover:bg-[#253675] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#50A5B1]" />
                        <span>Bild hochladen (JPG / PNG)</span>
                      </button>

                      {avatar !== currentCoach.avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar(currentCoach.avatar)}
                          className="px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                          title="Auf Ursprungsbild zurücksetzen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Zurücksetzen</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location with Swiss Municipalities Autocomplete */}
              <div className="relative">
                <label className="font-bold text-[#1A265A] block mb-1">Hauptstandort:</label>
                <input
                  type="text"
                  value={locationName}
                  onFocus={() => setShowMuniDropdown(true)}
                  onChange={e => {
                    setLocationName(e.target.value);
                    setShowMuniDropdown(true);
                  }}
                  required
                  placeholder="z.B. Zürich, Ebikon, Bern..."
                  className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-semibold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
                {showMuniDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#50A5B1]/30 rounded-2xl shadow-xl max-h-48 overflow-y-auto z-50 divide-y divide-[#50A5B1]/20">
                    {filteredMunis.slice(0, 25).map(m => (
                      <button
                        key={`${m.plz}-${m.name}`}
                        type="button"
                        onClick={() => {
                          setLocationName(`${m.name}`);
                          setCanton(m.canton as CantonCode);
                          setShowMuniDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-[#FEF6ED] flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-bold text-[#1A265A]">{m.plz} {m.name}</span>
                        <span className="text-[10px] bg-[#50A5B1]/20 px-1.5 py-0.5 rounded font-black text-[#1A265A]">
                          {m.canton}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Canton */}
              <div>
                <label className="font-bold text-[#1A265A] block mb-1">Kanton:</label>
                <select
                  value={canton}
                  onChange={e => setCanton(e.target.value as CantonCode)}
                  className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-semibold text-[#1A265A]"
                >
                  {CANTONS.map(c => (
                    <option key={c} value={c}>Kanton {c}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Slogan (Kurzer Leitsatz, max. 100 Zeichen) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-[#1A265A] text-xs flex items-center gap-1.5">
                  <Quote className="w-4 h-4 text-[#F1600D]" />
                  Slogan / Kurzer Leitsatz (optional, max. 100 Zeichen):
                </label>
                <span className={`text-[10px] font-bold ${slogan.length > 100 ? 'text-red-600' : 'text-[#1A265A]/60'}`}>
                  {slogan.length} / 100
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                placeholder="z.B. Dein Erfolg ist mein Fokus – mit Präzision & Leidenschaft zum Ziel."
                value={slogan}
                onChange={e => setSlogan(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-semibold text-xs text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
              />
            </div>

            {/* Offered Sports Selection */}
            <div>
              <label className="font-bold text-[#1A265A] block mb-2 text-xs flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#50A5B1]" />
                Angebotene Sportarten (Mehrfachauswahl):
              </label>
              <div className="flex flex-wrap gap-2">
                {INITIAL_SPORTS.map(sport => {
                  const isChecked = selectedSports.includes(sport.name);
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => handleToggleSport(sport.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isChecked
                          ? 'bg-[#1A265A] text-white shadow-xs'
                          : 'bg-[#FEF6ED] text-[#1A265A] border border-[#50A5B1]/30 hover:bg-[#50A5B1]/20'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#50A5B1]" />}
                      <span>{sport.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bio & Trainingsphilosophie */}
            <div>
              <label className="font-bold text-[#1A265A] block mb-1 text-xs flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#F1600D]" />
                Über mich & Trainingsphilosophie:
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={e => setBio(e.target.value)}
                required
                placeholder="Beschreibe deine Ausbildung, deine Coaching-Philosophie und deine Trainingsmethoden..."
                className="w-full p-3 rounded-2xl border border-[#50A5B1]/30 bg-[#FEF6ED] text-xs font-medium text-[#1A265A] focus:outline-none focus:border-[#F1600D] leading-relaxed"
              />
            </div>

            {/* Erfolge & Highlights */}
            <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/30 space-y-3">
              <label className="font-bold text-[#1A265A] text-xs flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#F1600D]" />
                Erfolge & Highlights:
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="z.B. Schweizer Vizemeister 2024 oder 10+ Jahre Trainererfahrung"
                  value={newAchievement}
                  onChange={e => setNewAchievement(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAchievement(); } }}
                  className="flex-1 p-2 rounded-xl border border-[#50A5B1]/30 bg-white text-xs font-medium text-[#1A265A]"
                />
                <button
                  type="button"
                  onClick={handleAddAchievement}
                  className="bg-[#1A265A] hover:bg-[#253675] text-white font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Hinzufügen
                </button>
              </div>

              {achievements.length > 0 && (
                <ul className="space-y-1.5 pt-1">
                  {achievements.map((item, idx) => (
                    <li key={idx} className="bg-white p-2 rounded-xl border border-[#50A5B1]/20 text-xs font-medium text-[#1A265A] flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[#50A5B1] font-black">•</span>
                        <span>{item}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAchievement(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md cursor-pointer"
                        title="Entfernen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Diplome & Zertifikate */}
            <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/30 space-y-3">
              <label className="font-bold text-[#1A265A] text-xs flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#50A5B1]" />
                Diplome & Zertifikate:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="z.B. Swiss Olympic Coach B"
                  value={newCertTitle}
                  onChange={e => setNewCertTitle(e.target.value)}
                  className="sm:col-span-7 p-2 rounded-xl border border-[#50A5B1]/30 bg-white text-xs font-medium text-[#1A265A]"
                />
                <input
                  type="text"
                  placeholder="Jahr (z.B. 2023)"
                  value={newCertYear}
                  onChange={e => setNewCertYear(e.target.value)}
                  className="sm:col-span-3 p-2 rounded-xl border border-[#50A5B1]/30 bg-white text-xs font-medium text-[#1A265A]"
                />
                <button
                  type="button"
                  onClick={handleAddCert}
                  className="sm:col-span-2 bg-[#1A265A] hover:bg-[#253675] text-white font-bold text-xs px-2 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Hinzufügen
                </button>
              </div>

              {certificates.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {certificates.map(cert => (
                    <span key={cert.id} className="bg-white border border-[#50A5B1]/30 text-[#1A265A] px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-[#F1600D]" />
                      <span>{cert.title} ({cert.year})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(cert.id)}
                        className="text-red-500 hover:text-red-700 ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sprachen */}
            <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/30 space-y-3">
              <label className="font-bold text-[#1A265A] text-xs flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#50A5B1]" />
                Sprachen:
              </label>

              <div className="flex flex-wrap gap-2">
                {COMMON_LANGUAGES.map(lang => {
                  const isSelected = languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleToggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A265A] text-white'
                          : 'bg-white text-[#1A265A] border border-[#50A5B1]/30 hover:bg-[#50A5B1]/20'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#50A5B1]" />}
                      <span>{lang}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Language Addition */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Weitere Sprache hinzufügen (z.B. Portugiesisch)..."
                  value={customLanguage}
                  onChange={e => setCustomLanguage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomLanguage(); } }}
                  className="flex-1 p-2 rounded-xl border border-[#50A5B1]/30 bg-white text-xs font-medium text-[#1A265A]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomLanguage}
                  className="bg-[#50A5B1] hover:bg-[#3d8a95] text-white font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
                >
                  Hinzufügen
                </button>
              </div>

              {languages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-[#1A265A]/70 font-bold self-center">Aktuell gewählt:</span>
                  {languages.map(lang => (
                    <span key={lang} className="bg-white border border-[#50A5B1]/40 text-[#1A265A] px-2 py-0.5 rounded-lg text-[11px] font-bold">
                      🌐 {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bankverbindung für Auszahlungen (Pflicht für Live-Freischaltung) */}
            <div className="pt-4 border-t border-[#50A5B1]/20 space-y-3">
              <div className="flex items-center gap-2 text-[#1A265A] font-bold text-sm">
                <CreditCard className="w-5 h-5 text-[#50A5B1]" />
                <span>Bankverbindung für Auszahlungen</span>
                <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full uppercase">Pflichtfeld für Freischaltung</span>
              </div>

              {/* Informationstext Kasten */}
              <div className="bg-[#FEF6ED] p-3.5 rounded-2xl border border-[#50A5B1]/30 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#50A5B1] shrink-0 mt-0.5" />
                <div className="text-xs text-[#1A265A] space-y-1">
                  <p className="font-bold">Warum benötigen wir deine Bankverbindung?</p>
                  <p className="text-[#1A265A]/80 leading-relaxed">
                    Damit wir dir deine Einnahmen nach erfolgreich durchgeführten Lektionen direkt und ohne Umwege auszahlen können (deine 85 % Netto-Verdienst). Deine Bankdaten werden absolut vertraulich behandelt, verschlüsselt gespeichert und ausschliesslich für deine Auszahlungen verwendet.
                  </p>
                </div>
              </div>

              {/* Formular-Bereich Bankdaten */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-2xl border border-[#50A5B1]/20">
                {/* Name des Kontoinhabers */}
                <div className="space-y-1">
                  <label className="font-bold text-[#1A265A] block">
                    Name des Kontoinhabers <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Vor- und Nachname / Firmenname"
                    value={accountHolder}
                    onChange={e => setAccountHolder(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] text-[#1A265A] font-medium text-xs focus:outline-none focus:border-[#F1600D]"
                  />
                </div>

                {/* IBAN */}
                <div className="space-y-1">
                  <label className="font-bold text-[#1A265A] block">
                    IBAN (Schweizer Bankkonto) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CH93 0000 0000 0000 0000 0"
                    value={iban}
                    onChange={e => {
                      const val = e.target.value;
                      setIban(val);
                      if (val && !validateSwissIban(val)) {
                        setIbanError('Gültige Schweizer IBAN benötigt (Format: CH...)');
                      } else {
                        setIbanError('');
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl border ${ibanError ? 'border-red-500 bg-red-50' : 'border-[#50A5B1]/30 bg-[#FEF6ED]'} text-[#1A265A] font-mono text-xs focus:outline-none focus:border-[#F1600D]`}
                  />
                  {ibanError && (
                    <p className="text-[10px] text-red-600 font-bold">{ibanError}</p>
                  )}
                </div>

                {/* Name der Bank */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-[#1A265A] flex items-center justify-between">
                    <span>Name der Bank <span className="text-slate-400 font-normal">(optional)</span></span>
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. UBS, ZKB, PostFinance, Raiffeisen"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] text-[#1A265A] font-medium text-xs focus:outline-none focus:border-[#F1600D]"
                  />
                </div>
              </div>
            </div>

            {/* Profile Visibility Toggle & Active Status */}
            <div className="pt-4 border-t border-[#50A5B1]/20 space-y-3">
              {activationAttemptError && (
                <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-red-900 font-medium">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Freischaltung nicht möglich:</span>
                    <p>{activationAttemptError}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/30">
                <div>
                  <h4 className="font-bold text-xs text-[#1A265A]">Profil-Status</h4>
                  <p className="text-[11px] text-[#1A265A]/70">
                    {isProfileComplete 
                      ? 'Wenn aktiviert, wird dein Profil mit allen Kursangeboten auf der Plattform gelistet.' 
                      : 'Profil-Sperre: Vervollständige zuerst alle Pflichtangaben oben, um dein Profil zu aktivieren.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleActive}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                    isProfileActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#F1600D] text-white'
                  }`}
                >
                  {isProfileActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{isProfileActive ? 'Aktiv (Publiziert)' : 'Entwurf / Pausiert'}</span>
                </button>
              </div>
            </div>

            {/* Coach Mandatory AGB & Tax Declaration Checkboxes */}
            <div className="pt-3 border-t border-[#50A5B1]/20 space-y-3 bg-white p-4 rounded-2xl border border-[#50A5B1]/20">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#1A265A] font-medium select-none">
                <input
                  type="checkbox"
                  checked={agbAcceptedCoach}
                  onChange={e => {
                    setAgbAcceptedCoach(e.target.checked);
                    if (e.target.checked && taxDeclarationCoach) setAgbError(false);
                  }}
                  className="mt-0.5 rounded border-[#50A5B1]/40 text-[#F1600D] focus:ring-[#F1600D] w-4 h-4 cursor-pointer shrink-0"
                />
                <span>
                  Ich akzeptiere die AGB und stimme der Plattform-Provision von 15% pro erfolgreicher Buchung zu.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#1A265A] font-medium select-none bg-amber-50/70 p-3 rounded-xl border border-amber-200/70">
                <input
                  type="checkbox"
                  checked={taxDeclarationCoach}
                  onChange={e => {
                    setTaxDeclarationCoach(e.target.checked);
                    if (e.target.checked && agbAcceptedCoach) setAgbError(false);
                  }}
                  className="mt-0.5 rounded border-amber-400 text-[#F1600D] focus:ring-[#F1600D] w-4 h-4 cursor-pointer shrink-0"
                />
                <span className="leading-snug text-amber-950 font-medium">
                  Ich bestätige, dass ich meine Coaching-Tätigkeit in eigener Verantwortung ausübe. Ich bin selbstständig dafür verantwortlich, meine Einnahmen ordnungsgemäss bei den zuständigen Steuerbehörden und Sozialversicherungen (z. B. SVA/AHV) zu deklarieren.
                </span>
              </label>

              {agbError && (
                <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  Bitte akzeptiere die AGB, die Plattform-Provision und die Steuer-Selbstdeklaration, um dein Coach-Profil zu speichern.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#F1600D] hover:bg-[#d85208] text-white font-black text-sm py-3.5 px-6 rounded-2xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4 text-white" />
                <span>Änderungen im Coach-Profil Speichern</span>
              </button>
            </div>

          </form>
        </div>
      </div>
      )}

      {/* Modal: New Slot Creation Form */}
      {showAddSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#50A5B1]/20 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#50A5B1]/20">
              <h3 className="font-black text-base text-[#1A265A] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F1600D]" />
                Neuen Termin aufschalten
              </h3>
              <button
                onClick={() => setShowAddSlotModal(false)}
                className="text-slate-400 hover:text-[#1A265A] font-bold text-xs cursor-pointer"
              >
                ✕ Schliessen
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#1A265A] block mb-1">Titel / Thema der Lektion:</label>
                <input
                  type="text"
                  placeholder="z.B. Vorhand & Aufschlag Intensivtraining"
                  value={slotTitle}
                  onChange={e => setSlotTitle(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-semibold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
                />
              </div>

              {/* Zusätzliches Beschreibungsfeld */}
              <div>
                <label className="font-bold text-[#1A265A] block mb-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#F1600D]" />
                  Zusätzliche Hinweise / Beschreibung (z.B. Mietmaterial):
                </label>
                <textarea
                  rows={2}
                  placeholder="z.B. Mietmaterial (Schläger/Schuhe) nicht im Preis enthalten. Kann vor Ort bezogen werden."
                  value={slotDescription}
                  onChange={e => setSlotDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] text-[#1A265A] font-medium text-xs focus:outline-none focus:border-[#F1600D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1A265A] block mb-1">Sportart:</label>
                  <select
                    value={slotSport}
                    onChange={e => setSlotSport(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-semibold text-[#1A265A]"
                  >
                    {selectedSports.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1A265A] block mb-1">Typ:</label>
                  <select
                    value={slotType}
                    onChange={e => setSlotType(e.target.value as 'einzel' | 'gruppe')}
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-semibold text-[#1A265A]"
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
                    value={slotDate}
                    onChange={e => setSlotDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-semibold text-[#1A265A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A265A] block mb-1">Von:</label>
                  <input
                    type="text"
                    value={slotStartTime}
                    onChange={e => setSlotStartTime(e.target.value)}
                    required
                    placeholder="09:00"
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-semibold text-[#1A265A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A265A] block mb-1">Bis:</label>
                  <input
                    type="text"
                    value={slotEndTime}
                    onChange={e => setSlotEndTime(e.target.value)}
                    required
                    placeholder="10:00"
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-semibold text-[#1A265A]"
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
                    value={slotPrice}
                    onChange={e => setSlotPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-black text-[#1A265A]"
                  />
                </div>

                {slotType === 'gruppe' && (
                  <>
                    <div>
                      <label className="font-bold text-[#1A265A] block mb-1">Min. Teilnehmer:innen:</label>
                      <input
                        type="number"
                        min="1"
                        max={slotMaxParticipants}
                        value={slotMinParticipants}
                        onChange={e => setSlotMinParticipants(Math.max(1, Number(e.target.value)))}
                        className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-semibold text-[#1A265A]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#1A265A] block mb-1">Max. Teilnehmer:innen:</label>
                      <input
                        type="number"
                        min={slotMinParticipants}
                        max="30"
                        value={slotMaxParticipants}
                        onChange={e => setSlotMaxParticipants(Math.max(slotMinParticipants, Number(e.target.value)))}
                        className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] font-semibold text-[#1A265A]"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#50A5B1]/20">
                <button
                  type="button"
                  onClick={() => setShowAddSlotModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-[#FEF6ED] cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#F1600D] text-white hover:bg-[#d85208] shadow-md flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Aufschalten</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeProfileTab === 'verification' && <IDVerificationCard />}
      {activeProfileTab === 'pricing' && <CoachPricingAndFeesTab onOpenTaxInfo={onOpenTaxInfo} />}
      {activeProfileTab === 'reviews' && <BlindRatingsCoachTab />}

      {activeProfileTab === 'sessions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#F1600D] via-[#f3772b] to-[#d85208] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-400/30">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-oswald font-medium uppercase tracking-wide text-white flex items-center gap-3">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white bg-white/10 p-2 rounded-2xl shrink-0" />
                <span>Neue Lektion aufschalten</span>
              </h1>
              <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
                Schalte neue Lektionen und Trainings-Slots im GET A COACH Kalender frei oder verwalte deine aktuell aufgeschalteten Termine.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create Slot Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/20 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#50A5B1]/20">
                  <h3 className="font-black text-base text-[#1A265A] flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#F1600D]" />
                    Termin-Ausschreibung erstellen
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#50A5B1]" /> Kalender Live
                  </span>
                </div>

                <p className="text-xs text-[#1A265A]/80 leading-snug">
                  Erstelle in wenigen Schritten eine neue Termin-Ausschreibung für Einzelcoaching oder Gruppenkurse.
                </p>

                <button
                  onClick={() => setShowAddSlotModal(true)}
                  className="w-full bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Jetzt neuen Termin aufschalten</span>
                </button>
              </div>
            </div>

            {/* Published Slots Card */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/20 shadow-xs space-y-4">
                <h3 className="font-black text-base text-[#1A265A] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#50A5B1]" />
                  Aktuell aufgeschaltete Termine ({mySessions.length})
                </h3>

                {mySessions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#1A265A]/60 bg-[#FEF6ED] rounded-2xl border border-[#50A5B1]/20">
                    Du hast zurzeit keine eigenen Termine aufgeschaltet.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {mySessions.map(session => (
                      <div
                        key={session.id}
                        className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/20 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="bg-[#1A265A] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                            {session.sport}
                          </span>
                          <span className="text-xs font-black text-[#F1600D]">CHF {session.price}.–</span>
                        </div>

                        <h4 className="font-extrabold text-xs text-[#1A265A]">{session.title}</h4>

                        <div className="text-[11px] text-[#1A265A]/80 space-y-0.5">
                          <div className="flex items-center gap-1.5 font-semibold text-[#1A265A]">
                            <Calendar className="w-3.5 h-3.5 text-[#50A5B1]" />
                            <span>{session.date} ({session.startTime} - {session.endTime})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#50A5B1]" />
                            <span>{session.locationName}</span>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center justify-between border-t border-[#50A5B1]/20 text-[10px]">
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Kalender Live
                          </span>
                          <span className="text-[#1A265A]/70 font-semibold">
                            {session.type === 'einzel' ? 'Einzelcoaching' : `Gruppe (min. ${session.minParticipants || 2}, max. ${session.maxParticipants})`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
