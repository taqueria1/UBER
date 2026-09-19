import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, 
  Layers, 
  Plus, 
  Minus, 
  ExternalLink, 
  Search, 
  Globe, 
  Flame, 
  Bike, 
  RotateCcw,
  MapPin,
  Flag,
  Crosshair,
  CheckCircle2,
  Loader2,
  Hand,
  Info
} from 'lucide-react';
import { ActiveTripData, LocationPoint } from '../types';
import { reverseGeocodeNavojoa, calculateDistanceKm } from '../services/geocode';

interface InteractiveMapProps {
  activeTrip: ActiveTripData | null;
  origin: LocationPoint;
  setOrigin?: (loc: LocationPoint) => void;
  destination: LocationPoint;
  setDestination?: (loc: LocationPoint) => void;
  intermediateStops?: LocationPoint[];
  isCarpoolMode: boolean;
  mapSelectionMode?: 'origin' | 'destination' | null;
  setMapSelectionMode?: (mode: 'origin' | 'destination' | null) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  activeTrip,
  origin,
  setOrigin,
  destination,
  setDestination,
  intermediateStops = [],
  isCarpoolMode,
  mapSelectionMode = null,
  setMapSelectionMode,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const trafficLayerRef = useRef<L.TileLayer | null>(null);
  const bikeLayerRef = useRef<L.TileLayer | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  // Default to interactive GPS/Google Maps tile view so clicks and selection work instantly
  const [viewMode, setViewMode] = useState<'interactive_gmaps' | 'official_embed'>('interactive_gmaps');

  // Google Maps Layers:
  // 'h': Hybrid (Satellite + Street Names & Labels)
  // 'm': Standard Road Map
  // 'k': Pure Satellite
  // 'p': Terrain / Relief
  const [googleLayerType, setGoogleLayerType] = useState<'h' | 'm' | 'k' | 'p'>('h');

  // Google Maps Overlays
  const [showTraffic, setShowTraffic] = useState(true);
  const [showBikeRoutes, setShowBikeRoutes] = useState(false);
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  const [followDriver, setFollowDriver] = useState(true);

  // Local selection mode tracking & refs for async Leaflet events
  const [localSelectionMode, setLocalSelectionMode] = useState<'origin' | 'destination' | null>(mapSelectionMode ?? null);
  const selectionModeRef = useRef<'origin' | 'destination' | null>(localSelectionMode);

  // Clicked Location Card (when tapping anywhere on the map)
  const [clickedLocationInfo, setClickedLocationInfo] = useState<{
    lat: number;
    lng: number;
    name: string;
    address: string;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Mini Toast for map action feedback
  const [mapToast, setMapToast] = useState<{ title: string; message: string; type: 'origin' | 'destination' | 'info' } | null>(null);

  // Active Center Coordinates in Navojoa
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number; name: string; zoom: number }>({
    lat: origin.lat ?? 26.8045,
    lng: origin.lng ?? -109.4442,
    name: 'Navojoa, Sonora',
    zoom: 15,
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Keep ref updated
  useEffect(() => {
    setLocalSelectionMode(mapSelectionMode ?? null);
    selectionModeRef.current = mapSelectionMode ?? null;
  }, [mapSelectionMode]);

  const updateSelectionMode = (mode: 'origin' | 'destination' | null) => {
    setLocalSelectionMode(mode);
    selectionModeRef.current = mode;
    if (setMapSelectionMode) {
      setMapSelectionMode(mode);
    }
  };

  // Toast timer auto-dismiss
  useEffect(() => {
    if (!mapToast) return;
    const timer = setTimeout(() => setMapToast(null), 4500);
    return () => clearTimeout(timer);
  }, [mapToast]);

  // Presets in Navojoa
  const NAVOJOA_PRESETS = [
    { name: '📍 Tu Vista (27.0710° N)', lat: 27.0710301, lng: -109.4391831, zoom: 14 },
    { name: '🏛️ Navojoa Centro', lat: 26.8045, lng: -109.4442, zoom: 15 },
    { name: '🏥 IMSS HGZ 16', lat: 26.8115, lng: -109.4580, zoom: 16 },
    { name: '🎓 ITSON Campus', lat: 26.7865, lng: -109.4310, zoom: 16 },
    { name: '⚾ Estadio Ciclón', lat: 26.7915, lng: -109.4585, zoom: 16 },
  ];

  // Initialize Leaflet Map with genuine Google Maps tile servers
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialLat = origin.lat ?? 26.8045;
    const initialLng = origin.lng ?? -109.4442;

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      minZoom: 10,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: false,
    });

    // Genuine Google Maps Hybrid Satellite Tiles
    const googleHybrid = L.tileLayer(
      'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
      }
    );

    googleHybrid.on('tileerror', () => {
      googleHybrid.setUrl('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
    });

    googleHybrid.addTo(map);
    tileLayerRef.current = googleHybrid;

    // Genuine Google Maps Traffic Layer
    const googleTraffic = L.tileLayer(
      'https://mt{s}.google.com/vt/lyrs=h,traffic&x={x}&y={y}&z={z}',
      {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        opacity: 0.92,
      }
    );
    googleTraffic.addTo(map);
    trafficLayerRef.current = googleTraffic;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapRef.current = map;

    // Direct Map Click Handler for selecting Start & End
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const currentMode = selectionModeRef.current;

      setIsGeocoding(true);
      const geo = await reverseGeocodeNavojoa(lat, lng);
      setIsGeocoding(false);

      if (currentMode === 'origin') {
        const newOrigin: LocationPoint = {
          id: `loc_origin_map_${Date.now()}`,
          name: geo.name,
          address: geo.address,
          lat,
          lng,
          tag: 'custom',
        };
        if (setOrigin) setOrigin(newOrigin);
        setMapToast({
          title: '📍 Punto de Inicio Fijado',
          message: `${geo.name} — ${geo.address}`,
          type: 'origin',
        });
        // Transition to picking destination or clear
        updateSelectionMode('destination');
      } else if (currentMode === 'destination') {
        const newDest: LocationPoint = {
          id: `loc_dest_map_${Date.now()}`,
          name: geo.name,
          address: geo.address,
          lat,
          lng,
          tag: 'custom',
        };
        if (setDestination) setDestination(newDest);
        setMapToast({
          title: '🏁 Punto de Destino Fijado',
          message: `${geo.name} — ${geo.address}`,
          type: 'destination',
        });
        updateSelectionMode(null);
      } else {
        // Show interactive action card at clicked point
        setClickedLocationInfo({
          lat,
          lng,
          name: geo.name,
          address: geo.address,
        });
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Base Tile Layer when Google Layer Type changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    let lyrs = 'y'; // Hybrid
    if (googleLayerType === 'm') lyrs = 'm'; // Standard map
    if (googleLayerType === 'k') lyrs = 's'; // Pure satellite
    if (googleLayerType === 'p') lyrs = 'p'; // Terrain

    const newLayer = L.tileLayer(
      `https://mt{s}.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}`,
      {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
      }
    ).addTo(mapRef.current);

    newLayer.bringToBack();
    tileLayerRef.current = newLayer;
  }, [googleLayerType]);

  // Sync Traffic Layer
  useEffect(() => {
    if (!mapRef.current) return;

    if (showTraffic) {
      if (!trafficLayerRef.current) {
        const trafficLayer = L.tileLayer(
          'https://mt{s}.google.com/vt/lyrs=h,traffic&x={x}&y={y}&z={z}',
          {
            subdomains: ['0', '1', '2', '3'],
            maxZoom: 20,
            opacity: 0.92,
          }
        ).addTo(mapRef.current);
        trafficLayerRef.current = trafficLayer;
      }
    } else if (trafficLayerRef.current) {
      mapRef.current.removeLayer(trafficLayerRef.current);
      trafficLayerRef.current = null;
    }
  }, [showTraffic]);

  // Sync Bike Routes Layer
  useEffect(() => {
    if (!mapRef.current) return;

    if (showBikeRoutes) {
      if (!bikeLayerRef.current) {
        const bikeLayer = L.tileLayer(
          'https://mt{s}.google.com/vt/lyrs=h,bike&x={x}&y={y}&z={z}',
          {
            subdomains: ['0', '1', '2', '3'],
            maxZoom: 20,
            opacity: 0.9,
          }
        ).addTo(mapRef.current);
        bikeLayerRef.current = bikeLayer;
      }
    } else if (bikeLayerRef.current) {
      mapRef.current.removeLayer(bikeLayerRef.current);
      bikeLayerRef.current = null;
    }
  }, [showBikeRoutes]);

  // Render Origin, Destination, Intermediate Stops & Polyline
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Origin Marker (Green - DRAGGABLE when not on active trip)
    const originLat = origin.lat ?? 26.8045;
    const originLng = origin.lng ?? -109.4442;

    const originIcon = L.divIcon({
      className: 'custom-map-origin-icon',
      html: `
        <div class="relative flex items-center justify-center cursor-grab active:cursor-grabbing group">
          <div class="absolute w-10 h-10 rounded-full bg-emerald-500/30 animate-ping"></div>
          <div class="w-8 h-8 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
            <div class="w-3 h-3 rounded-full bg-emerald-400 shadow-md shadow-emerald-400"></div>
          </div>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-500/60 shadow-2xl pointer-events-none">
            📍 INICIO: ${origin.name.split('(')[0].trim()}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const originMarker = L.marker([originLat, originLng], {
      icon: originIcon,
      draggable: !activeTrip,
      autoPan: true,
    });

    originMarker.bindTooltip('📍 Punto de Inicio (Arrastra para reubicar)', {
      direction: 'top',
      offset: [0, -16],
    });

    originMarker.on('dragend', async () => {
      const newPos = originMarker.getLatLng();
      setIsGeocoding(true);
      const geo = await reverseGeocodeNavojoa(newPos.lat, newPos.lng);
      setIsGeocoding(false);

      if (setOrigin) {
        setOrigin({
          id: `loc_origin_drag_${Date.now()}`,
          name: geo.name,
          address: geo.address,
          lat: newPos.lat,
          lng: newPos.lng,
          tag: 'custom',
        });
        setMapToast({
          title: '📍 Inicio Reubicado',
          message: `${geo.name} (${newPos.lat.toFixed(4)}°N, ${Math.abs(newPos.lng).toFixed(4)}°W)`,
          type: 'origin',
        });
      }
    });

    markersGroup.addLayer(originMarker);

    // 2. Destination Marker (Cyan/Red - DRAGGABLE when not on active trip)
    const destLat = destination.lat ?? 26.7865;
    const destLng = destination.lng ?? -109.4310;

    const destIcon = L.divIcon({
      className: 'custom-map-dest-icon',
      html: `
        <div class="relative flex items-center justify-center cursor-grab active:cursor-grabbing group">
          <div class="absolute w-10 h-10 rounded-full bg-cyan-500/30 animate-pulse"></div>
          <div class="w-8 h-8 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
            <div class="w-3 h-3 rounded-sm bg-cyan-400 shadow-md shadow-cyan-400"></div>
          </div>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 text-cyan-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-cyan-500/60 shadow-2xl pointer-events-none">
            🏁 FIN: ${destination.name.split('(')[0].trim()}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const destMarker = L.marker([destLat, destLng], {
      icon: destIcon,
      draggable: !activeTrip,
      autoPan: true,
    });

    destMarker.bindTooltip('🏁 Fin de Viaje (Arrastra para reubicar)', {
      direction: 'top',
      offset: [0, -16],
    });

    destMarker.on('dragend', async () => {
      const newPos = destMarker.getLatLng();
      setIsGeocoding(true);
      const geo = await reverseGeocodeNavojoa(newPos.lat, newPos.lng);
      setIsGeocoding(false);

      if (setDestination) {
        setDestination({
          id: `loc_dest_drag_${Date.now()}`,
          name: geo.name,
          address: geo.address,
          lat: newPos.lat,
          lng: newPos.lng,
          tag: 'custom',
        });
        setMapToast({
          title: '🏁 Destino Reubicado',
          message: `${geo.name} (${newPos.lat.toFixed(4)}°N, ${Math.abs(newPos.lng).toFixed(4)}°W)`,
          type: 'destination',
        });
      }
    });

    markersGroup.addLayer(destMarker);

    // 3. Intermediate Stops (Carpool)
    intermediateStops.forEach((stop, index) => {
      const sLat = stop.lat ?? (originLat + (destLat - originLat) * 0.5);
      const sLng = stop.lng ?? (originLng + (destLng - originLng) * 0.5);

      const stopIcon = L.divIcon({
        className: 'custom-map-stop-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full bg-teal-950 border-2 border-teal-300 flex items-center justify-center text-[10px] font-black text-teal-200 shadow-xl">
              ${index + 1}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const sMarker = L.marker([sLat, sLng], { icon: stopIcon });
      markersGroup.addLayer(sMarker);
    });

    // 4. Construct Polyline along realistic street grid
    const waypoints: [number, number][] = [[originLat, originLng]];
    if (intermediateStops.length > 0) {
      intermediateStops.forEach((st) => {
        const sLat = st.lat ?? (originLat + (destLat - originLat) * 0.5);
        const sLng = st.lng ?? (originLng + (destLng - originLng) * 0.5);
        waypoints.push([sLat, originLng]);
        waypoints.push([sLat, sLng]);
      });
    } else {
      const midLat = originLat + (destLat - originLat) * 0.65;
      waypoints.push([midLat, originLng]);
      waypoints.push([midLat, destLng]);
    }
    waypoints.push([destLat, destLng]);

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
    }

    const isBlack = activeTrip?.vehicle.category === 'black';
    const routePolyline = L.polyline(waypoints, {
      color: isBlack ? '#f59e0b' : '#10b981',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: activeTrip ? undefined : '8, 6',
    }).addTo(map);

    routeLineRef.current = routePolyline;
  }, [origin, destination, intermediateStops, activeTrip?.vehicle.category, activeTrip]);

  // Clicked Location Temporary Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tempMarkerRef.current) {
      map.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }

    if (clickedLocationInfo) {
      const tempIcon = L.divIcon({
        className: 'temp-marker-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-amber-400/40 animate-ping"></div>
            <div class="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-black text-[11px]">
              📍
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([clickedLocationInfo.lat, clickedLocationInfo.lng], { icon: tempIcon }).addTo(map);
      tempMarkerRef.current = marker;
    }
  }, [clickedLocationInfo]);

  // Real-time Vehicle Tracking Simulation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!activeTrip) {
      if (driverMarkerRef.current) {
        map.removeLayer(driverMarkerRef.current);
        driverMarkerRef.current = null;
      }
      return;
    }

    const originLat = activeTrip.origin.lat ?? 26.8045;
    const originLng = activeTrip.origin.lng ?? -109.4442;
    const destLat = activeTrip.destination.lat ?? 26.7865;
    const destLng = activeTrip.destination.lng ?? -109.4310;

    const progress = Math.min(1, Math.max(0, activeTrip.routeProgress));
    const midLat = originLat + (destLat - originLat) * 0.65;
    let currLat = originLat;
    let currLng = originLng;

    if (progress <= 0.5) {
      const p1 = progress / 0.5;
      currLat = originLat + (midLat - originLat) * p1;
      currLng = originLng;
    } else {
      const p2 = (progress - 0.5) / 0.5;
      currLat = midLat + (destLat - midLat) * p2;
      currLng = originLng + (destLng - originLng) * p2;
    }

    const isBlack = activeTrip.vehicle.category === 'black';

    const carIcon = L.divIcon({
      className: 'custom-map-car-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-14 h-14 rounded-full ${isBlack ? 'bg-amber-500/25' : 'bg-emerald-500/25'} animate-ping"></div>
          <div class="relative z-10 w-9 h-9 rounded-xl ${
            isBlack 
              ? 'bg-slate-950 border-2 border-amber-400 shadow-2xl text-amber-300' 
              : 'bg-slate-900 border-2 border-emerald-400 shadow-2xl text-emerald-300'
          } flex items-center justify-center font-bold text-sm shadow-black">
            ${isBlack ? '👑' : '🚗'}
          </div>
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            isBlack ? 'border-amber-400/80 text-amber-300' : 'border-emerald-400/80 text-emerald-300'
          } shadow-xl flex items-center gap-1">
            <span>${activeTrip.driver.plate}</span>
            <span class="text-slate-400">•</span>
            <span class="text-white">${activeTrip.currentSpeedKmh} km/h</span>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    if (!driverMarkerRef.current) {
      const newMarker = L.marker([currLat, currLng], { icon: carIcon, zIndexOffset: 1000 }).addTo(map);
      driverMarkerRef.current = newMarker;
    } else {
      driverMarkerRef.current.setLatLng([currLat, currLng]);
      driverMarkerRef.current.setIcon(carIcon);
    }

    if (followDriver) {
      map.panTo([currLat, currLng], { animate: true, duration: 0.5 });
    }
  }, [activeTrip, activeTrip?.routeProgress, followDriver]);

  // Handle Search Input in Navojoa
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Search or center in Navojoa
    const query = searchQuery.trim().toLowerCase();
    const matchedPreset = NAVOJOA_PRESETS.find((p) => p.name.toLowerCase().includes(query));

    if (matchedPreset && mapRef.current) {
      mapRef.current.setView([matchedPreset.lat, matchedPreset.lng], matchedPreset.zoom, { animate: true });
      setCenterCoords({
        lat: matchedPreset.lat,
        lng: matchedPreset.lng,
        name: matchedPreset.name,
        zoom: matchedPreset.zoom,
      });
    } else if (mapRef.current) {
      mapRef.current.setView([26.8045, -109.4442], 16, { animate: true });
    }
  };

  const currentDistanceKm = calculateDistanceKm(
    origin.lat ?? 26.8045,
    origin.lng ?? -109.4442,
    destination.lat ?? 26.7865,
    destination.lng ?? -109.4310
  );

  const USER_PROVIDED_MAPS_URL = "https://www.google.com.mx/maps/@27.0710301,-109.4391831,6157m/data=!3m1!1e3?entry=ttu&g_ep=EgoyMDI2MDkxNi4wIKXMDSoASAFQAw%3D%3D";
  const embedGoogleMapsUrl = `https://maps.google.com/maps?q=${origin.lat || 26.8045},${origin.lng || -109.4442}&t=${googleLayerType}&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 select-none">
      
      {/* 1. Main Interactive Map with Google Maps Tiles (Always Mounted) */}
      <div 
        id="leaflet-interactive-map"
        ref={containerRef} 
        className={`w-full h-full z-0 transition-opacity duration-300 ${
          localSelectionMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* 2. Official Google Maps Embed Overlay (Only if switched) */}
      {viewMode === 'official_embed' && (
        <div className="absolute inset-0 z-10 bg-slate-950">
          <iframe
            title="Google Maps Navojoa"
            src={embedGoogleMapsUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {/* TOP HEADER BAR: Navigation & Selection Controls */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Map Mode & Interactive Selection Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl pointer-events-auto">
          
          {/* Direct Map Selection Buttons (USER REQUEST) */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1.5 hidden sm:inline">
              Fijar en Mapa:
            </span>

            {/* Button: Select Origin on Map */}
            <button
              id="btn-select-origin-map"
              type="button"
              onClick={() => {
                if (viewMode === 'official_embed') setViewMode('interactive_gmaps');
                updateSelectionMode(localSelectionMode === 'origin' ? null : 'origin');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                localSelectionMode === 'origin'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-300 animate-pulse'
                  : 'text-emerald-400 hover:text-white hover:bg-emerald-500/20'
              }`}
              title="Haz clic para seleccionar el punto de inicio directamente en el mapa"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950"></div>
              <span>{localSelectionMode === 'origin' ? 'Tocando Inicio...' : 'Punto Inicio'}</span>
            </button>

            {/* Button: Select Destination on Map */}
            <button
              id="btn-select-dest-map"
              type="button"
              onClick={() => {
                if (viewMode === 'official_embed') setViewMode('interactive_gmaps');
                updateSelectionMode(localSelectionMode === 'destination' ? null : 'destination');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                localSelectionMode === 'destination'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-300 animate-pulse'
                  : 'text-cyan-400 hover:text-white hover:bg-cyan-500/20'
              }`}
              title="Haz clic para seleccionar el fin de viaje directamente en el mapa"
            >
              <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 border border-slate-950"></div>
              <span>{localSelectionMode === 'destination' ? 'Tocando Fin...' : 'Punto Fin'}</span>
            </button>

            {localSelectionMode && (
              <button
                type="button"
                onClick={() => updateSelectionMode(null)}
                className="px-2 py-1 rounded text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Cancelar modo de selección"
              >
                ✕ Salir
              </button>
            )}
          </div>

          {/* Mode Switcher: Interactive Map vs Official Embed */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5">
            <button
              id="btn-switch-interactive"
              onClick={() => {
                setViewMode('interactive_gmaps');
                setTimeout(() => mapRef.current?.invalidateSize(), 150);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'interactive_gmaps'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mapa satelital interactivo con selección de ruta"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mapa Satelital GPS</span>
            </button>

            <button
              id="btn-switch-official-embed"
              onClick={() => setViewMode('official_embed')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'official_embed'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vista web oficial de Google Maps"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vista Web</span>
            </button>
          </div>
        </div>

        {/* Center/Right: Search in Navojoa */}
        <form 
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-300 px-3 py-1 pointer-events-auto w-64 lg:w-72"
        >
          <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar colonia o calle en Navojoa..."
            className="w-full text-xs text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1"
            >
              ✕
            </button>
          )}
        </form>

        {/* Right: External Google Maps link */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <a
            href={USER_PROVIDED_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold shadow-xl transition-all"
            title="Abrir vista en la app de Google Maps"
          >
            <span className="text-emerald-400 font-extrabold">Google</span>
            <span>Maps</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
          </a>
        </div>
      </div>

      {/* ACTIVE SELECTION GUIDANCE BANNER */}
      {localSelectionMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-bounce">
          <div className={`px-4 py-2 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-2.5 text-xs font-bold ${
            localSelectionMode === 'origin'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : 'bg-cyan-950/90 border-cyan-500 text-cyan-200'
          }`}>
            <Crosshair className="w-4 h-4 animate-spin shrink-0" />
            <span>
              {localSelectionMode === 'origin'
                ? '📍 Haz clic en cualquier punto o calle del mapa para fijar el INICIO (Recogida)'
                : '🏁 Haz clic en cualquier punto del mapa para fijar el FIN DE VIAJE (Destino)'}
            </span>
            <button
              onClick={() => updateSelectionMode(null)}
              className="ml-2 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[10px] hover:bg-slate-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* TOP-LEFT PRESET LOCATIONS BAR */}
      <div className="absolute top-16 left-3 z-20 flex items-center gap-1.5 overflow-x-auto max-w-[90vw] pb-1 scrollbar-none">
        {NAVOJOA_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              setCenterCoords({
                lat: preset.lat,
                lng: preset.lng,
                name: preset.name,
                zoom: preset.zoom,
              });
              if (mapRef.current) {
                mapRef.current.setView([preset.lat, preset.lng], preset.zoom, { animate: true });
              }
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap shadow-lg backdrop-blur-md transition-all border ${
              centerCoords.lat === preset.lat
                ? 'bg-slate-900 text-emerald-300 border-emerald-500/60 font-bold'
                : 'bg-slate-950/85 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* ROUTE SUMMARY & DISTANCE CHIP (When in planning mode) */}
      {!activeTrip && (
        <div className="absolute top-26 left-3 z-20 hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-xl text-xs text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-white">{origin.name.split('(')[0].trim()}</span>
          <span className="text-slate-400">➔</span>
          <span className="w-2 h-2 rounded-sm bg-cyan-400"></span>
          <span className="font-semibold text-white">{destination.name.split('(')[0].trim()}</span>
          <span className="text-slate-500">•</span>
          <span className="font-mono font-bold text-emerald-400">{currentDistanceKm} km</span>
          <span className="text-[10px] text-slate-400">(Arrastra los marcadores para reubicar)</span>
        </div>
      )}

      {/* ACTIVE TRIP TURN-BY-TURN HUD (When ride in progress) */}
      {activeTrip && activeTrip.state !== 'idle' && (
        <div className="absolute top-26 left-3 z-20 flex items-center gap-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-xl p-3 shadow-2xl max-w-sm animate-fade-in">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
            <Navigation className="w-4 h-4 transform -rotate-45 animate-pulse" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {activeTrip.currentTurnDirection}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {activeTrip.currentSpeedKmh} km/h
              </span>
            </div>
            <p className="text-xs font-semibold text-white truncate mt-0.5">
              {activeTrip.destination.address}
            </p>
          </div>
          <div className="ml-auto pl-2 border-l border-slate-700 text-right shrink-0">
            <p className="text-base font-bold text-white font-mono leading-none">
              {Math.ceil(activeTrip.etaSecondsRemaining / 60)} <span className="text-[10px] font-normal text-slate-400">min</span>
            </p>
          </div>
        </div>
      )}

      {/* CLICKED LOCATION ACTION CARD (Pop-up on map click) */}
      {clickedLocationInfo && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl max-w-md w-[92%] animate-fade-in text-white pointer-events-auto">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Ubicación Seleccionada en Navojoa
                </span>
                <h4 className="text-sm font-bold text-white truncate max-w-[280px]">
                  {clickedLocationInfo.name}
                </h4>
              </div>
            </div>
            <button 
              onClick={() => setClickedLocationInfo(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <p className="text-xs text-slate-300 mb-3 line-clamp-2">
            {clickedLocationInfo.address}
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-fix-clicked-origin"
              onClick={() => {
                if (setOrigin) {
                  setOrigin({
                    id: `loc_origin_map_${Date.now()}`,
                    name: clickedLocationInfo.name,
                    address: clickedLocationInfo.address,
                    lat: clickedLocationInfo.lat,
                    lng: clickedLocationInfo.lng,
                    tag: 'custom',
                  });
                  setMapToast({
                    title: '📍 Inicio de Viaje Fijado',
                    message: `${clickedLocationInfo.name}`,
                    type: 'origin',
                  });
                }
                setClickedLocationInfo(null);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all active:scale-95"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
              <span>Fijar como Inicio</span>
            </button>

            <button
              id="btn-fix-clicked-destination"
              onClick={() => {
                if (setDestination) {
                  setDestination({
                    id: `loc_dest_map_${Date.now()}`,
                    name: clickedLocationInfo.name,
                    address: clickedLocationInfo.address,
                    lat: clickedLocationInfo.lat,
                    lng: clickedLocationInfo.lng,
                    tag: 'custom',
                  });
                  setMapToast({
                    title: '🏁 Fin de Viaje Fijado',
                    message: `${clickedLocationInfo.name}`,
                    type: 'destination',
                  });
                }
                setClickedLocationInfo(null);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950 transition-all active:scale-95"
            >
              <div className="w-2.5 h-2.5 rounded-sm bg-white"></div>
              <span>Fijar como Fin</span>
            </button>
          </div>
        </div>
      )}

      {/* MAP INTERACTIVE TOAST FEEDBACK */}
      {mapToast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md border border-emerald-500/60 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-3 text-xs pointer-events-auto animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-white">{mapToast.title}</p>
            <p className="text-[11px] text-slate-300 max-w-xs truncate">{mapToast.message}</p>
          </div>
          <button 
            onClick={() => setMapToast(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* BOTTOM-LEFT: Authentic Google Maps "Capas" (Layers) Controller */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col items-start pointer-events-auto">
        {isLayersMenuOpen && (
          <div className="mb-2 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3.5 shadow-2xl w-64 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Capas de Google Maps
              </span>
              <button
                onClick={() => setIsLayersMenuOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Google Maps Base Layer Options */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-400">Tipo de Cartografía</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setGoogleLayerType('h')}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                    googleLayerType === 'h'
                      ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">🛰️</span>
                  <span className="text-[11px] font-semibold mt-0.5">Satélite Híbrido</span>
                </button>

                <button
                  onClick={() => setGoogleLayerType('m')}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                    googleLayerType === 'm'
                      ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">🗺️</span>
                  <span className="text-[11px] font-semibold mt-0.5">Mapa Vial</span>
                </button>

                <button
                  onClick={() => setGoogleLayerType('p')}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                    googleLayerType === 'p'
                      ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">⛰️</span>
                  <span className="text-[11px] font-semibold mt-0.5">Relieve</span>
                </button>

                <button
                  onClick={() => setGoogleLayerType('k')}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                    googleLayerType === 'k'
                      ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">🌍</span>
                  <span className="text-[11px] font-semibold mt-0.5">Satélite Puro</span>
                </button>
              </div>
            </div>

            {/* Overlays in Interactive Mode */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-400">Detalles en Tiempo Real</p>
              
              <label className="flex items-center justify-between text-slate-200 cursor-pointer hover:text-white">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-medium text-[11px]">Tráfico en Vivo</span>
                </span>
                <input
                  type="checkbox"
                  checked={showTraffic}
                  onChange={(e) => setShowTraffic(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between text-slate-200 cursor-pointer hover:text-white">
                <span className="flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-medium text-[11px]">Rutas Ciclistas / Bus</span>
                </span>
                <input
                  type="checkbox"
                  checked={showBikeRoutes}
                  onChange={(e) => setShowBikeRoutes(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 accent-emerald-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* Google Maps "Capas" Trigger Button */}
        <button
          id="btn-google-maps-layers"
          onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
          className="flex items-center gap-2.5 p-1.5 pr-3.5 bg-white/95 hover:bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-300 transition-all hover:scale-105 active:scale-95"
          title="Abrir selector de capas de Google Maps"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-inner">
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-bold text-slate-900">Capas</span>
            <span className="text-[9px] text-slate-500 font-medium">
              {googleLayerType === 'h' ? 'Satélite Híbrido' : googleLayerType === 'm' ? 'Mapa Vial' : googleLayerType === 'p' ? 'Relieve' : 'Satélite'}
            </span>
          </div>
        </button>
      </div>

      {/* BOTTOM-CENTER: Google Maps Brand & Coords Attribution */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center text-center">
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-sm tracking-tight text-white font-sans" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.95)' }}>
            Google
          </span>
          <span className="text-slate-300 text-xs font-semibold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}>
            Maps
          </span>
        </div>
        <div className="text-[10px] text-slate-300/90 font-mono" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
          Navojoa, Sonora • {origin.lat.toFixed(4)}° N, {Math.abs(origin.lng).toFixed(4)}° W
        </div>
      </div>

      {/* BOTTOM-RIGHT: Navigation Zoom and Recenter Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        <div className="flex flex-col bg-white rounded-xl shadow-xl border border-slate-300 overflow-hidden">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-9 h-9 hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-colors border-b border-slate-200 active:bg-slate-200"
            title="Acercar mapa"
          >
            <Plus className="w-4 h-4 text-slate-800 stroke-[2.5]" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-9 h-9 hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-colors active:bg-slate-200"
            title="Alejar mapa"
          >
            <Minus className="w-4 h-4 text-slate-800 stroke-[2.5]" />
          </button>
        </div>

        {/* Center on Route / Navojoa button */}
        <button
          onClick={() => {
            const oLat = origin.lat ?? 26.8045;
            const oLng = origin.lng ?? -109.4442;
            const dLat = destination.lat ?? 26.7865;
            const dLng = destination.lng ?? -109.4310;

            if (mapRef.current) {
              const bounds = L.latLngBounds([[oLat, oLng], [dLat, dLng]]);
              mapRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
            }
          }}
          className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-800 shadow-xl border border-slate-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Centrar en ruta de viaje en Navojoa"
        >
          <RotateCcw className="w-4 h-4 text-slate-700" />
        </button>
      </div>
    </div>
  );
};
