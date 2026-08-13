import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
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
  sessions,
  onSelectCoach,
  onBookSession,
  radiusKm = 25,
  selectedLocations = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Default Swiss Center (Zürich/Luzern central region)
  const defaultCenter: [number, number] = [46.8182, 8.2275]; // Geographic center of Switzerland (Älggi-Alp / Central CH)
  
  // Switzerland Geographic Bounding Box [South-West, North-East]
  const SWITZERLAND_BOUNDS: L.LatLngBoundsExpression = [
    [45.8179, 5.9559], // South-West (Valais/Geneva border region)
    [47.8085, 10.4921] // North-East (Bodensee/Grisons border region)
  ];

  // Slightly wider pan constraint box so full Switzerland can fit nicely with padding
  const MAP_MAX_BOUNDS: L.LatLngBoundsExpression = [
    [44.8, 4.8],
    [48.8, 11.8]
  ];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 6,
        minZoom: 5,
        maxZoom: 18,
        maxBounds: MAP_MAX_BOUNDS,
        maxBoundsViscosity: 0.5,
        scrollWheelZoom: false
      });

      // CartoDB Positron clean map tiles for modern design
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    if (markersLayer) {
      markersLayer.clearLayers();
    }

    // Custom Red Swiss Sport Pin Marker
    const createCustomIcon = (coachName: string, sport: string, isVerified: boolean, isProfileActive: boolean) => {
      const badgeHtml = isVerified ? `<span style="background-color: #10B981; color: white; border-radius: 9999px; padding: 1px 4px; font-size: 9px; font-weight: bold;">✓</span>` : '';
      const inactiveBadge = !isProfileActive ? `<span style="background-color: #EF4444; color: white; border-radius: 9999px; padding: 1px 4px; font-size: 8px;">MS Offline</span>` : '';

      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="group relative flex flex-col items-center transform transition-all duration-200 hover:scale-110 cursor-pointer">
            <div class="bg-[#1A265A] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 border border-[#F1600D] whitespace-nowrap">
              <span class="w-2 h-2 rounded-full ${isProfileActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}"></span>
              ${coachName.split(' ')[0]} ${badgeHtml} ${inactiveBadge}
            </div>
            <div class="w-3 h-3 bg-[#1A265A] rotate-45 -mt-1 border-r border-b border-[#F1600D]"></div>
          </div>
        `,
        iconSize: [100, 36],
        iconAnchor: [50, 36]
      });
    };

    // Add markers for active coaches
    const bounds: [number, number][] = [];

    // Draw radius circle(s) for selected location(s)
    if (selectedLocations.length > 0 && markersLayer) {
      selectedLocations.forEach(loc => {
        const city = getCityCoordsForLocation(loc);
        if (city) {
          const circle = L.circle([city.lat, city.lng], {
            radius: radiusKm * 1000,
            color: '#50A5B1',
            fillColor: '#50A5B1',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '5, 5'
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

          const circleBounds = circle.getBounds();
          bounds.push([circleBounds.getNorthEast().lat, circleBounds.getNorthEast().lng]);
          bounds.push([circleBounds.getSouthWest().lat, circleBounds.getSouthWest().lng]);
        }
      });
    }

    coaches.forEach(coach => {
      if (!coach.coordinates) return;
      // Note: If coach is inactive, we show warning badge or filter out depending on requirement
      if (!coach.isProfileActive) return; // Hide locked profiles from map

      bounds.push([coach.coordinates.lat, coach.coordinates.lng]);

      const marker = L.marker([coach.coordinates.lat, coach.coordinates.lng], {
        icon: createCustomIcon(coach.name, coach.sports[0] || 'Sport', coach.isVerified, coach.isProfileActive)
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-[#1A265A] font-sans max-w-[220px]';
      popupContent.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
          <img src="${coach.avatar}" class="w-10 h-10 rounded-full object-cover border border-slate-200" alt="${coach.name}" />
          <div>
            <div class="font-bold text-sm text-[#1A265A] flex items-center gap-1">
              ${coach.name}
              ${coach.isVerified ? '<span class="text-emerald-600 text-xs font-bold" title="Ausweis Verifiziert">✓</span>' : ''}
            </div>
            <div class="text-[11px] text-[#F1600D] font-semibold">${coach.sports[0] || 'Sport'}</div>
          </div>
        </div>
        <div class="text-xs text-[#1A265A]/70 mb-2 flex items-center justify-between">
          <span class="font-bold text-[#1A265A]">CHF ${coach.hourlyRate}.–/h</span>
        </div>
        <div class="text-[11px] text-[#1A265A]/60 mb-2 line-clamp-2">${coach.locationName}</div>
        <button id="pop-btn-${coach.id}" class="w-full bg-[#1A265A] hover:bg-[#F1600D] text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors text-center cursor-pointer">
          Profil & Termine
        </button>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`pop-btn-${coach.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            if (onSelectCoach) onSelectCoach(coach);
          });
        }
      });

      if (markersLayer) {
        marker.addTo(markersLayer);
      }
    });

    if (map) {
      const fitSwitzerland = () => {
        map.invalidateSize();
        map.fitBounds(SWITZERLAND_BOUNDS, { padding: [10, 10] });
      };

      fitSwitzerland();

      const timer1 = setTimeout(fitSwitzerland, 100);
      const timer2 = setTimeout(fitSwitzerland, 300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [coaches, sessions, radiusKm, selectedLocations]);

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
};
