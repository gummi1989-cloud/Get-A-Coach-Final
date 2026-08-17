import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_SPORTS } from '../../data/mockData';
import { SWISS_TOP_30_CITIES } from '../../data/swissTop30Cities';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Map,
  Calendar,
  X,
  Check,
  ChevronDown,
  Trophy,
  Navigation,
  Loader2,
  Sparkles,
  Building2,
  Filter
} from 'lucide-react';

interface SearchFilterBarProps {
  showMap: boolean;
  setShowMap: (show: boolean) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ showMap, setShowMap }) => {
  const {
    selectedSport,
    setSelectedSport,
    selectedLocations,
    toggleLocation,
    clearLocations,
    searchRadiusKm,
    setSearchRadiusKm,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    sessions
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
        
        // Find closest Top 30 Swiss City
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

  const handleSearchClick = () => {
    setShowLocationDropdown(false);
    setShowSportDropdown(false);
    const resultsElement = document.getElementById('coach-results-section');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#50A5B1]/20 shadow-xs space-y-4">
      
      {/* Top Search Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* 1. Keyword / Name Search Input */}
        <div className="relative md:col-span-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A265A]/50" />
          <input
            type="text"
            placeholder="Suchbegriff / Coach..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 focus:outline-none focus:border-[#F1600D] focus:ring-2 focus:ring-[#F1600D]/20 text-xs sm:text-sm font-medium transition text-[#1A265A]"
          />
        </div>

        {/* 2. Sport Select Dropdown with All 30 Sports + "Sonstiges" */}
        <div className="relative md:col-span-3" ref={sportContainerRef}>
          <button
            type="button"
            onClick={() => setShowSportDropdown(!showSportDropdown)}
            className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 hover:bg-slate-100/80 text-left focus:outline-none focus:border-[#F1600D] text-xs sm:text-sm font-semibold transition text-[#1A265A] flex items-center justify-between cursor-pointer"
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
                className={`w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-slate-100 transition flex items-center justify-between cursor-pointer ${
                  selectedSport === 'ALL' ? 'bg-slate-50 text-[#F1600D]' : 'text-[#1A265A]'
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
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-medium hover:bg-slate-100 transition flex items-center justify-between cursor-pointer ${
                      isSelected ? 'bg-slate-50 text-[#F1600D] font-bold' : 'text-[#1A265A]'
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

        {/* 3. Multi-Select for 30 Largest Swiss Cities & Regions */}
        <div className="relative md:col-span-3" ref={locationContainerRef}>
          <button
            type="button"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-[#50A5B1]/30 bg-slate-50 hover:bg-slate-100/80 text-left focus:outline-none focus:border-[#F1600D] text-xs sm:text-sm font-semibold transition text-[#1A265A] flex items-center justify-between cursor-pointer"
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
              
              {/* Header Controls inside Dropdown */}
              <div className="p-3 bg-slate-50 space-y-2 sticky top-0 z-10 border-b border-[#50A5B1]/20">
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

                {/* Filter input inside city dropdown */}
                <input
                  type="text"
                  placeholder="Region filtern (z.B. Uster, Bern, Genf)..."
                  value={cityFilterSearch}
                  onChange={e => setCityFilterSearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#50A5B1]/30 bg-white focus:outline-none focus:border-[#F1600D]"
                />

                {/* GPS Button */}
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

              {/* List of 30 Cities */}
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
                          isChecked ? 'bg-[#50A5B1]/15 text-[#1A265A] font-bold' : 'hover:bg-slate-100 text-[#1A265A]'
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
                        <span className="text-[10px] font-bold text-[#1A265A] bg-[#50A5B1]/20 px-1.5 py-0.5 rounded">
                          {city.canton}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Action Buttons (Search & Map Toggle & Clear Filters) */}
        <div className="flex items-center gap-2 md:col-span-3">
          <button
            onClick={handleSearchClick}
            className="flex-1 bg-[#F1600D] hover:bg-[#d85208] text-white font-bold text-xs py-2.5 px-3 sm:px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>Suchen</span>
          </button>

          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 ${
              showMap
                ? 'bg-[#1A265A] text-white shadow-xs'
                : 'bg-slate-50 hover:bg-[#50A5B1]/10 text-[#1A265A] border border-[#50A5B1]/30'
            }`}
            title={showMap ? 'Karte ausblenden' : 'Karte anzeigen'}
          >
            <Map className="w-4 h-4 text-[#50A5B1]" />
            <span className="hidden lg:inline">{showMap ? 'Karte zu' : 'Karte'}</span>
          </button>
        </div>

      </div>

      {/* Selected Active Location Badges (Multi-Selection Tags) */}
      {selectedLocations.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#50A5B1]/20">
          <span className="text-[11px] font-bold text-[#1A265A]/70 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-[#F1600D]" />
            Gewählte Regionen ({selectedLocations.length}):
          </span>
          {selectedLocations.map(loc => (
            <span
              key={loc}
              className="inline-flex items-center gap-1.5 bg-[#F1600D] text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-2xs"
            >
              <span>{loc}</span>
              <button
                type="button"
                onClick={() => toggleLocation(loc)}
                className="hover:bg-black/20 rounded-full p-0.5 transition cursor-pointer"
                title="Region entfernen"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearLocations}
            className="text-[11px] font-bold text-[#F1600D] hover:underline ml-1 cursor-pointer"
          >
            Alle Regionen anzeigen
          </button>
        </div>
      )}

      {/* GPS Location Status Toast if active */}
      {geoStatusMsg && (
        <div className="bg-slate-50 border border-[#F1600D]/30 text-[#1A265A] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F1600D]" />
            {geoStatusMsg}
          </span>
          <button
            onClick={() => setGeoStatusMsg(null)}
            className="text-[#1A265A]/50 hover:text-[#1A265A] text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Sports Badges Grid / Wrap */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#50A5B1]/20">
        <button
          onClick={() => setSelectedSport('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
            selectedSport === 'ALL'
              ? 'bg-[#1A265A] text-white shadow-xs'
              : 'bg-slate-50 hover:bg-[#50A5B1]/10 text-[#1A265A] border border-[#50A5B1]/30'
          }`}
        >
          Alle Sportarten ({INITIAL_SPORTS.length})
        </button>
        {INITIAL_SPORTS.map(sport => {
          const isSelected = selectedSport === sport.name;
          const isSonstiges = sport.id === 'sonstiges';
          return (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-[#1A265A] text-white shadow-xs'
                  : isSonstiges
                  ? 'bg-[#50A5B1]/20 hover:bg-[#50A5B1]/30 text-[#1A265A] border border-[#50A5B1]'
                  : 'bg-slate-50 hover:bg-[#50A5B1]/10 text-[#1A265A] border border-[#50A5B1]/30'
              }`}
            >
              <span>{sport.name}</span>
              {isSonstiges && <span className="text-[10px] bg-[#50A5B1] text-white px-1 rounded font-black">★</span>}
            </button>
          );
        })}
      </div>

      {/* Sliders: Umkreis & Datum & Total Offers Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#50A5B1]/20 text-xs">
        {/* Datum Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5 font-bold text-[#1A265A]">
            <label className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#50A5B1]" />
              <span>Datum <span className="text-[10px] font-normal text-[#1A265A]/60">(optional)</span>:</span>
            </label>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-[10px] font-bold text-[#F1600D] hover:underline flex items-center gap-0.5 cursor-pointer"
                title="Datum-Filter zurücksetzen"
              >
                <X className="w-3 h-3" />
                <span>Zurücksetzen</span>
              </button>
            )}
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full p-2 rounded-xl border border-[#50A5B1]/30 font-semibold bg-slate-50 text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
          />
        </div>

        {/* Radius Slider */}
        <div>
          <div className="flex items-center justify-between font-bold text-[#1A265A] mb-1.5">
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#50A5B1]" />
              <span>Umkreis <span className="text-[10px] font-normal text-[#1A265A]/60">(ab Standort)</span>:</span>
            </span>
            <span className="text-[#F1600D] font-extrabold">{searchRadiusKm} km</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={searchRadiusKm}
            onChange={e => setSearchRadiusKm(Number(e.target.value))}
            className="w-full accent-[#F1600D] cursor-pointer"
          />
        </div>
      </div>

      {/* Total offers count banner */}
      <div className="bg-slate-50 rounded-xl p-2.5 text-center text-[11px] font-bold text-[#1A265A] border border-[#50A5B1]/20 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#F1600D]" />
        <span>Insg. {sessions.length} buchbare Angebote & Termine verfügbar</span>
      </div>

    </div>
  );
};
