import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CoachProfile, SessionSlot } from '../../types';
import { CoachCard } from './CoachCard';
import { INITIAL_SPORTS } from '../../data/mockData';
import { SWISS_TOP_30_CITIES } from '../../data/swissTop30Cities';
import {
  Trophy,
  Search,
  Users,
  User,
  MapPin,
  Layers,
  Dumbbell,
  RotateCcw,
  ChevronDown,
  Check,
  Building2,
  Navigation,
  Loader2
} from 'lucide-react';

interface CoachesBySportPageProps {
  onSelectCoach: (coach: CoachProfile) => void;
  onBookSession: (session: SessionSlot) => void;
  onOpenChatWithCoach: (coach: CoachProfile) => void;
}

export const CoachesBySportPage: React.FC<CoachesBySportPageProps> = ({
  onSelectCoach,
  onBookSession,
  onOpenChatWithCoach
}) => {
  const {
    coaches,
    sessions,
    selectedSport,
    setSelectedSport,
    selectedLocations,
    toggleLocation,
    clearLocations,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSportDropdown, setShowSportDropdown] = useState(false);
  const [cityFilterSearch, setCityFilterSearch] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatusMsg, setGeoStatusMsg] = useState<string | null>(null);

  const locationContainerRef = useRef<HTMLDivElement>(null);
  const sportContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationContainerRef.current &&
        !locationContainerRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
      if (
        sportContainerRef.current &&
        !sportContainerRef.current.contains(event.target as Node)
      ) {
        setShowSportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter the 30 cities in the multi-select dropdown
  const filteredTop30Cities = SWISS_TOP_30_CITIES.filter(c =>
    c.name.toLowerCase().includes(cityFilterSearch.toLowerCase()) ||
    c.cityName.toLowerCase().includes(cityFilterSearch.toLowerCase()) ||
    c.canton.toLowerCase().includes(cityFilterSearch.toLowerCase())
  );

  const handleSelectSport = (sportName: string) => {
    setSelectedSport(sportName);
    setShowSportDropdown(false);
  };

  // GPS Geolocation Handler: Finds nearest Top 30 City
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatusMsg('Geolocation wird von diesem Browser nicht unterstützt.');
      return;
    }

    setIsLocating(true);
    setGeoStatusMsg('Standort wird ermittelt...');

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        
        let closestCity = SWISS_TOP_30_CITIES[0];
        let minDistance = Infinity;

        SWISS_TOP_30_CITIES.forEach(city => {
          const dLat = (city.lat - latitude) * 111;
          const dLng = (city.lng - longitude) * 111 * Math.cos(latitude * (Math.PI / 180));
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = city;
          }
        });

        if (!selectedLocations.includes(closestCity.name)) {
          toggleLocation(closestCity.name);
        }
        setGeoStatusMsg(`📍 Nächste Region erkannt: ${closestCity.name} (~${Math.round(minDistance)} km entfernt)`);
        setIsLocating(false);
        setShowLocationDropdown(false);
      },
      () => {
        setIsLocating(false);
        if (!selectedLocations.includes('Zürich')) {
          toggleLocation('Zürich');
        }
        setGeoStatusMsg('Standortzugriff nicht möglich. Standard: Zürich gewählt.');
        setShowLocationDropdown(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Filter for active coaches only (per platform requirement)
  const activeCoaches = useMemo(() => {
    return (coaches || []).filter(c => c && c.isProfileActive);
  }, [coaches]);

  // Extract all sports dynamically from active coaches
  const availableSports = useMemo(() => {
    const sportsSet = new Set<string>();
    activeCoaches.forEach(coach => {
      if (coach && Array.isArray(coach.sports)) {
        coach.sports.forEach(s => {
          if (s) sportsSet.add(s);
        });
      }
    });

    return Array.from(sportsSet).sort((a, b) => a.localeCompare(b));
  }, [activeCoaches]);

  // Group active coaches by sport name applying SearchQuery, Region (multi-select, no 20km radius), and Sport filters
  const groupedCoachesBySport = useMemo(() => {
    const map = new Map<string, CoachProfile[]>();

    // Initialize map with available sports
    availableSports.forEach(sport => {
      map.set(sport, []);
    });

    const term = searchQuery.trim().toLowerCase();

    activeCoaches.forEach(coach => {
      if (!coach || !Array.isArray(coach.sports)) return;

      // 1. Search Query / Coach Name Match
      const matchesSearch =
        !term ||
        (coach.name && coach.name.toLowerCase().includes(term)) ||
        (coach.bio && coach.bio.toLowerCase().includes(term)) ||
        (coach.locationName && coach.locationName.toLowerCase().includes(term)) ||
        (coach.canton && coach.canton.toLowerCase().includes(term)) ||
        coach.sports.some(s => s && s.toLowerCase().includes(term));

      // 2. Region Match (Multi-select from selectedLocations, WITHOUT 20km radius logic)
      let matchesRegion = true;
      if (selectedLocations.length > 0) {
        const locLower = (coach.locationName || '').toLowerCase();
        const cantonLower = (coach.canton || '').toLowerCase();

        matchesRegion = selectedLocations.some(selectedLoc => {
          const city = SWISS_TOP_30_CITIES.find(
            c => c.name.toLowerCase() === selectedLoc.toLowerCase() || c.cityName.toLowerCase() === selectedLoc.toLowerCase()
          );

          if (city) {
            if (locLower.includes(city.cityName.toLowerCase()) || locLower.includes(city.name.toLowerCase())) return true;
            if (cantonLower === city.canton.toLowerCase()) return true;
          }

          const cleanLoc = selectedLoc.toLowerCase().replace(/\s+und\s+umgebung/i, '').trim();
          return locLower.includes(cleanLoc) || cantonLower.includes(cleanLoc);
        });
      }

      // 3. Sport Filter Match
      const matchesSport =
        selectedSport === 'ALL' || coach.sports.includes(selectedSport);

      if (matchesSearch && matchesRegion && matchesSport) {
        coach.sports.forEach(sport => {
          if (map.has(sport)) {
            const list = map.get(sport)!;
            if (!list.some(c => c.id === coach.id)) {
              list.push(coach);
            }
          }
        });
      }
    });

    return map;
  }, [activeCoaches, availableSports, searchQuery, selectedLocations, selectedSport]);

  // Filter sports categories based on selectedSport
  const sportsToDisplay = useMemo(() => {
    if (selectedSport === 'ALL') {
      return availableSports.filter(sport => {
        const list = groupedCoachesBySport.get(sport);
        return list && list.length > 0;
      });
    } else {
      const list = groupedCoachesBySport.get(selectedSport);
      return list && list.length > 0 ? [selectedSport] : [];
    }
  }, [availableSports, selectedSport, groupedCoachesBySport]);

  // Helper to find sport description from INITIAL_SPORTS
  const getSportDescription = (sportName: string) => {
    const found = INITIAL_SPORTS.find(s => s.name.toLowerCase() === sportName.toLowerCase());
    return found?.description || `Verifizierte Coaches und professionelle Trainings für ${sportName} in der Schweiz.`;
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#1A265A] via-[#263773] to-[#50A5B1] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#50A5B1]/30 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <h1 className="text-2xl sm:text-4xl text-white font-black uppercase tracking-wider flex items-center gap-3">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white bg-white/10 p-2 rounded-2xl shrink-0" />
            <span>COACHES</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#FEF6ED]/80 font-medium leading-relaxed">
            Übersicht aller auf GET A COACH.ch registrierten Coaches, strukturiert nach Sportdisziplinen. Klicke auf ein Profil, um freie Termine, Videos, Preise und Bewertungen einzusehen.
          </p>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-[#50A5B1]">
            <span className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 text-[#FEF6ED]">
              <User className="w-3.5 h-3.5 text-[#50A5B1]" />
              <strong>{activeCoaches.length}</strong> Registrierte Coaches
            </span>
            <span className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 text-[#FEF6ED]">
              <Layers className="w-3.5 h-3.5 text-[#50A5B1]" />
              <strong>{availableSports.length}</strong> Sportarten
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar Dropdown Mask */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#50A5B1]/20 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* 1. Keyword / Name Search Input */}
          <div className="relative">
            <label className="block text-[11px] font-extrabold text-[#1A265A] mb-1 uppercase tracking-wider">
              Suchbegriff / Coach
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A265A]/50 pointer-events-none" />
              <input
                type="text"
                placeholder="Suchbegriff / Coach..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] focus:outline-none focus:border-[#F1600D] focus:ring-2 focus:ring-[#F1600D]/20 text-xs text-[#1A265A] font-medium transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#1A265A]/60 hover:text-[#1A265A] cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 2. Sport Select Dropdown */}
          <div className="relative" ref={sportContainerRef}>
            <label className="block text-[11px] font-extrabold text-[#1A265A] mb-1 uppercase tracking-wider">
              Sportart
            </label>
            <button
              type="button"
              onClick={() => setShowSportDropdown(!showSportDropdown)}
              className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] hover:bg-[#FEF6ED]/80 text-left focus:outline-none focus:border-[#F1600D] text-xs font-semibold transition text-[#1A265A] flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <Trophy className="w-4 h-4 text-[#F1600D] shrink-0" />
                <span className="truncate">
                  {selectedSport === 'ALL' ? `Alle Sportarten (${INITIAL_SPORTS.length})` : selectedSport}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#1A265A]/50 shrink-0" />
            </button>

            {/* Sport Selector Dropdown Menu */}
            {showSportDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#50A5B1]/30 rounded-2xl shadow-xl max-h-72 overflow-y-auto z-50 divide-y divide-[#50A5B1]/15">
                <button
                  type="button"
                  onClick={() => handleSelectSport('ALL')}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-[#FEF6ED] transition flex items-center justify-between cursor-pointer ${
                    selectedSport === 'ALL' ? 'bg-[#FEF6ED] text-[#F1600D]' : 'text-[#1A265A]'
                  }`}
                >
                  <span>Alle Sportarten ({INITIAL_SPORTS.length})</span>
                  {selectedSport === 'ALL' && <Check className="w-3.5 h-3.5 text-[#F1600D]" />}
                </button>
                {INITIAL_SPORTS.map(sport => {
                  const isSelected = selectedSport === sport.name;
                  const isSonstiges = sport.id === 'sonstiges';
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => handleSelectSport(sport.name)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-medium hover:bg-[#FEF6ED] transition flex items-center justify-between cursor-pointer ${
                        isSelected ? 'bg-[#FEF6ED] text-[#F1600D] font-bold' : 'text-[#1A265A]'
                      } ${isSonstiges ? 'bg-[#50A5B1]/15 font-bold text-[#1A265A]' : ''}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-[#1A265A] font-semibold flex items-center gap-1.5">
                          {sport.name}
                          {isSonstiges && (
                            <span className="text-[9px] bg-[#50A5B1] text-white px-1.5 py-0.2 rounded font-semibold">
                              Neu
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-[#1A265A]/60 line-clamp-1">{sport.description}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#F1600D] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Multi-Select for 30 Swiss Cities / Regions */}
          <div className="relative" ref={locationContainerRef}>
            <label className="block text-[11px] font-extrabold text-[#1A265A] mb-1 uppercase tracking-wider">
              Region (Mehrfachauswahl)
            </label>
            <button
              type="button"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-[#50A5B1]/30 bg-[#FEF6ED] hover:bg-[#FEF6ED]/80 text-left focus:outline-none focus:border-[#F1600D] text-xs font-semibold transition text-[#1A265A] flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-[#50A5B1] shrink-0" />
                <span className="truncate">
                  {selectedLocations.length === 0
                    ? 'Region wählen'
                    : selectedLocations.length === 1
                    ? selectedLocations[0]
                    : `${selectedLocations.length} Regionen gewählt`}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {selectedLocations.length > 0 && (
                  <span className="bg-[#F1600D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {selectedLocations.length}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-[#1A265A]/50" />
              </div>
            </button>

            {/* Multi-Select Cities Dropdown Menu */}
            {showLocationDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#50A5B1]/30 rounded-2xl shadow-xl max-h-80 overflow-y-auto z-50 divide-y divide-[#50A5B1]/15">
                <div className="p-3 bg-[#FEF6ED] space-y-2 sticky top-0 z-10 border-b border-[#50A5B1]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1A265A] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#50A5B1]" />
                      26 Kantonshauptorte, Winterthur & Uster
                    </span>
                    {selectedLocations.length > 0 && (
                      <button
                        type="button"
                        onClick={clearLocations}
                        className="text-[10px] font-bold text-[#F1600D] hover:underline cursor-pointer"
                      >
                        Auswahl aufheben
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Region filtern (z.B. Uster, Bern, Genf)..."
                    value={cityFilterSearch}
                    onChange={e => setCityFilterSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#50A5B1]/30 bg-white focus:outline-none focus:border-[#F1600D]"
                  />

                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-bold bg-[#50A5B1]/15 hover:bg-[#50A5B1]/25 text-[#1A265A] rounded-lg transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      {isLocating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1A265A]" />
                      ) : (
                        <Navigation className="w-3.5 h-3.5 text-[#F1600D]" />
                      )}
                      <span>Nächste Region per GPS ermitteln</span>
                    </div>
                    <span className="text-[9px] bg-[#F1600D] text-white px-1.5 py-0.2 rounded font-bold">
                      GPS
                    </span>
                  </button>
                </div>

                <div className="p-1 space-y-0.5">
                  {filteredTop30Cities.length === 0 ? (
                    <div className="p-3 text-xs text-[#1A265A]/50 text-center">
                      Keine Stadt gefunden
                    </div>
                  ) : (
                    filteredTop30Cities.map(city => {
                      const isChecked = selectedLocations.includes(city.name);
                      return (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => toggleLocation(city.name)}
                          className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition flex items-center justify-between cursor-pointer ${
                            isChecked ? 'bg-[#50A5B1]/15 text-[#1A265A] font-bold' : 'hover:bg-[#FEF6ED] text-[#1A265A]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                              isChecked ? 'bg-[#F1600D] border-[#F1600D] text-white' : 'border-[#50A5B1]/40'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{city.name}</span>
                          </div>
                          <span className="text-[10px] text-[#1A265A]/50 font-bold">{city.canton}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* GPS status feedback message */}
        {geoStatusMsg && (
          <div className="text-xs bg-[#50A5B1]/10 text-[#1A265A] p-2 rounded-xl flex items-center justify-between font-medium">
            <span>{geoStatusMsg}</span>
            <button onClick={() => setGeoStatusMsg(null)} className="text-xs text-[#1A265A]/60 font-bold">✕</button>
          </div>
        )}

        {/* Active Filters Summary & Clear Button */}
        {(searchQuery || selectedLocations.length > 0 || selectedSport !== 'ALL') && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-[#50A5B1]/15 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-[#1A265A]/80 font-medium">
              <span className="font-bold">Aktive Filter:</span>
              {searchQuery && (
                <span className="bg-[#1A265A] text-white px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1 font-semibold">
                  Suche: {searchQuery}
                </span>
              )}
              {selectedLocations.length > 0 && (
                <span className="bg-[#50A5B1] text-white px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1 font-semibold">
                  {selectedLocations.length === 1 ? `Region: ${selectedLocations[0]}` : `${selectedLocations.length} Regionen`}
                </span>
              )}
              {selectedSport !== 'ALL' && (
                <span className="bg-[#F1600D] text-white px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1 font-semibold">
                  Sport: {selectedSport}
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                clearLocations();
                setSelectedSport('ALL');
              }}
              className="px-3 py-1.5 text-xs font-extrabold text-[#F1600D] bg-[#F1600D]/10 hover:bg-[#F1600D]/20 rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Filter zurücksetzen</span>
            </button>
          </div>
        )}

        {/* Quick Sport Pills Selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none pt-1">
          <button
            onClick={() => setSelectedSport('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
              selectedSport === 'ALL'
                ? 'bg-[#1A265A] text-white shadow-xs'
                : 'bg-[#FEF6ED] text-[#1A265A] border border-[#50A5B1]/30 hover:bg-[#50A5B1]/20'
            }`}
          >
            Alle ({activeCoaches.length})
          </button>

          {availableSports.map(sport => {
            const count = groupedCoachesBySport.get(sport)?.length || 0;
            return (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedSport === sport
                    ? 'bg-[#F1600D] text-white shadow-xs'
                    : 'bg-[#FEF6ED] text-[#1A265A] border border-[#50A5B1]/30 hover:bg-[#50A5B1]/20'
                }`}
              >
                <span>{sport}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedSport === sport ? 'bg-white/20 text-white' : 'bg-[#50A5B1]/20 text-[#1A265A]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Grouped Coaches per Sport */}
      {sportsToDisplay.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#50A5B1]/20 shadow-xs space-y-3">
          <Dumbbell className="w-12 h-12 text-[#1A265A]/40 mx-auto opacity-50" />
          <h3 className="font-bold text-[#1A265A] text-base">Keine Coaches gefunden</h3>
          <p className="text-xs text-[#1A265A]/70 max-w-md mx-auto">
            Für deine gewählten Filterkriterien wurden keine passenden Coaches gefunden.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              clearLocations();
              setSelectedSport('ALL');
            }}
            className="mt-2 px-4 py-2 bg-[#F1600D] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#d85208] transition cursor-pointer"
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {sportsToDisplay.map(sportName => {
            const coachesInSport = groupedCoachesBySport.get(sportName) || [];
            if (coachesInSport.length === 0) return null;

            return (
              <section key={sportName} className="space-y-4">
                
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#50A5B1]/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#50A5B1]/15 flex items-center justify-center text-[#50A5B1] shrink-0">
                      <Trophy className="w-5 h-5 text-[#F1600D]" />
                    </div>
                    <div>
                      <h2 className="text-xl text-[#1A265A] flex items-center gap-2">
                        {sportName}
                        <span className="text-xs font-extrabold text-white bg-[#50A5B1] px-2.5 py-0.5 rounded-full">
                          {coachesInSport.length} {coachesInSport.length === 1 ? 'Coach' : 'Coaches'}
                        </span>
                      </h2>
                      <p className="text-xs text-[#1A265A]/70 line-clamp-1">
                        {getSportDescription(sportName)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coach Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {coachesInSport.map(coach => (
                    <CoachCard
                      key={`${sportName}-${coach.id}`}
                      coach={coach}
                      sessions={sessions}
                      onSelectCoach={onSelectCoach}
                      onBookSession={onBookSession}
                      onOpenChatWithCoach={onOpenChatWithCoach}
                    />
                  ))}
                </div>

              </section>
            );
          })}
        </div>
      )}

    </div>
  );
};
