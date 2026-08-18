import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Maximize2, MapPin } from 'lucide-react';
import { CoachProfile, SessionSlot } from '../types';
import { getCityCoordsForLocation } from '../utils/geoUtils';

interface InteractiveMapProps {
  coaches: CoachProfile[];
  sessions: SessionSlot[];
  onSelectCoach?: (coach: CoachProfile) => void;
  onBookSession?: (session: SessionSlot) => void;
  radiusKm?: number;
  centerCanton?: string;
  selectedLocations?: string[];
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  coaches,
  sessions: _sessions,
  onSelectCoach,
  radiusKm = 25,
  selectedLocations = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const prevLocationsRef = useRef<string[]>([]);

  // Geographic center of Switzerland (Älggi-Alp / Central CH)
  const defaultCenter: [number, number] = [46.8182, 8.2275];
  
  // Switzerland Geographic Bounding Box [South-West, North-East]
  const SWITZERLAND_BOUNDS: L.LatLngBoundsExpression = [
    [45.8179, 5.9559], // South-West
    [47.8085, 10.4921] // North-East
  ];

  // Pan constraint box around Switzerland and immediate border areas
  const MAP_MAX_BOUNDS: L.LatLngBoundsExpression = [
    [44.5, 4.5],
    [49.0, 12.0]
  ];

  // 1. Initial Map Creation & TileLayer setup (Runs ONCE on mount)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 8,
      minZoom: 6,
      maxZoom: 18,
      maxBounds: MAP_MAX_BOUNDS,
      maxBoundsViscosity: 0.7,
      scrollWheelZoom: true,
      zoomControl: false // Custom or repositioned
    });

    // Add zoom control at bottom-right for clean uncluttered layout
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Minimalist CartoDB Positron tiles (light, subtle, high contrast, non-distracting)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Initial fit bounds only once on startup
    map.invalidateSize();
    map.fitBounds(SWITZERLAND_BOUNDS, { padding: [16, 16], maxZoom: 9 });

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    isInitializedRef.current = true;

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  // 2. Markers & Radius updates (Does NOT reset map viewport/zoom unless user changed selectedLocations)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // Custom Red & Navy Swiss Sport Pin Marker
    const createCustomIcon = (coachName: string, _sport: string, isVerified: boolean, isProfileActive: boolean) => {
      const badgeHtml = isVerified
        ? `<span style="background-color: #10B981; color: white; border-radius: 9999px; padding: 1px 4px; font-size: 9px; font-weight: bold; line-height: 1;">✓</span>`
        : '';
      const inactiveBadge = !isProfileActive
        ? `<span style="background-color: #EF4444; color: white; border-radius: 9999px; padding: 1px 4px; font-size: 8px;">MS Offline</span>`
        : '';

      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="group relative flex flex-col items-center transform transition-transform duration-200 hover:scale-110 cursor-pointer select-none">
            <div class="bg-[#1A265A] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 border border-[#50A5B1]/50 whitespace-nowrap">
              <span class="w-2 h-2 rounded-full ${isProfileActive ? 'bg-emerald-400' : 'bg-red-400'}"></span>
              <span>${coachName.split(' ')[0]}</span>
              ${badgeHtml}
              ${inactiveBadge}
            </div>
            <div class="w-2.5 h-2.5 bg-[#1A265A] rotate-45 -mt-1 border-r border-b border-[#50A5B1]/50"></div>
          </div>
        `,
        iconSize: [90, 32],
        iconAnchor: [45, 32]
      });
    };

    // Draw radius circle(s) for selected location(s)
    if (selectedLocations.length > 0) {
      selectedLocations.forEach(loc => {
        const city = getCityCoordsForLocation(loc);
        if (city) {
          const circle = L.circle([city.lat, city.lng], {
            radius: radiusKm * 1000,
            color: '#50A5B1',
            fillColor: '#50A5B1',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '6, 6'
          });
          circle.bindTooltip(`${city.name} (${radiusKm} km Umkreis)`, { permanent: false, direction: 'top' });
          markersLayer.addLayer(circle);

          const centerDot = L.circleMarker([city.lat, city.lng], {
            radius: 5,
            color: '#1A265A',
            fillColor: '#50A5B1',
            fillOpacity: 0.9,
            weight: 2
          });
          markersLayer.addLayer(centerDot);
        }
      });
    }

    // Add markers for active coaches
    coaches.forEach(coach => {
      if (!coach.coordinates) return;
      if (!coach.isProfileActive) return;

      const marker = L.marker([coach.coordinates.lat, coach.coordinates.lng], {
        icon: createCustomIcon(coach.name, coach.sports[0] || 'Sport', coach.isVerified, coach.isProfileActive)
      });

      const coachInitial = (coach.name || 'C').trim().charAt(0).toUpperCase();
      const avatarHtml = coach.avatar && coach.avatar.trim() !== ''
        ? `<img src="${coach.avatar}" class="w-10 h-10 rounded-full object-cover border border-slate-200" alt="${coach.name}" />`
        : `<div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A265A] to-[#50A5B1] text-white flex items-center justify-center font-bold text-sm shadow-xs border border-white shrink-0">${coachInitial}</div>`;

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-[#1A265A] font-sans max-w-[220px]';
      popupContent.innerHTML = `
        <div class="flex items-center gap-2.5 mb-2">
          ${avatarHtml}
          <div class="min-w-0">
            <div class="font-bold text-sm text-[#1A265A] flex items-center gap-1 truncate">
              ${coach.name}
              ${coach.isVerified ? '<span class="text-emerald-600 text-xs font-bold" title="Ausweis Verifiziert">✓</span>' : ''}
            </div>
            <div class="text-[11px] text-[#50A5B1] font-semibold truncate">${coach.sports[0] || 'Sport'}</div>
          </div>
        </div>
        <div class="text-xs text-[#1A265A]/80 mb-2 flex items-center justify-between">
          <span class="font-bold text-[#1A265A]">CHF ${coach.hourlyRate}.–/h</span>
          <span class="text-[11px] text-slate-500">${coach.locationName}</span>
        </div>
        <button id="pop-btn-${coach.id}" class="w-full bg-[#1A265A] hover:bg-[#F1600D] text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors text-center cursor-pointer">
          Profil & Termine
        </button>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'custom-leaflet-popup'
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`pop-btn-${coach.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            if (onSelectCoach) onSelectCoach(coach);
          });
        }
      });

      marker.addTo(markersLayer);
    });

    // Only pan if the selected location filter has explicitly changed
    const locChanged = JSON.stringify(prevLocationsRef.current) !== JSON.stringify(selectedLocations);
    if (locChanged && selectedLocations.length > 0) {
      const firstLoc = selectedLocations[0];
      const city = getCityCoordsForLocation(firstLoc);
      if (city) {
        map.flyTo([city.lat, city.lng], 11, { duration: 0.8 });
      }
    }
    prevLocationsRef.current = selectedLocations;
  }, [coaches, radiusKm, selectedLocations, onSelectCoach]);

  // Handler for manual "Schweiz Übersicht" button
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyToBounds(SWITZERLAND_BOUNDS, {
        padding: [16, 16],
        maxZoom: 9,
        duration: 0.8
      });
    }
  };

  const activeCoachesCount = coaches.filter(c => c.isProfileActive && c.coordinates).length;

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
      {/* Top Floating Action & Status Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2 pointer-events-auto">
          <MapPin className="w-3.5 h-3.5 text-[#50A5B1]" />
          <span className="text-xs font-bold text-[#1A265A]">
            {activeCoachesCount} {activeCoachesCount === 1 ? 'Coach' : 'Coaches'} auf der Karte
          </span>
        </div>

        <button
          onClick={handleResetView}
          type="button"
          title="Schweiz-Übersicht zentrieren"
          className="bg-white/90 hover:bg-white text-[#1A265A] hover:text-[#50A5B1] backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer pointer-events-auto"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Ganze Schweiz</span>
        </button>
      </div>

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
};
