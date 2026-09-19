import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Plus, 
  X, 
  Users, 
  User, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Tag, 
  Clock, 
  ChevronRight,
  Leaf,
  Crosshair,
  Loader2,
  Crown
} from 'lucide-react';
import { LocationPoint, PaymentMethod, RideType, VehicleCategory } from '../types';
import { PRESET_LOCATIONS, VEHICLE_CATEGORIES } from '../data/mockData';
import { calculateDistanceKm } from '../services/geocode';

interface RideBookingPanelProps {
  origin: LocationPoint;
  setOrigin: (loc: LocationPoint) => void;
  destination: LocationPoint;
  setDestination: (loc: LocationPoint) => void;
  intermediateStops: LocationPoint[];
  setIntermediateStops: React.Dispatch<React.SetStateAction<LocationPoint[]>>;
  rideType: RideType;
  setRideType: (type: RideType) => void;
  selectedVehicle: VehicleCategory;
  setSelectedVehicle: (v: VehicleCategory) => void;
  selectedPayment: PaymentMethod;
  onOpenPaymentModal: () => void;
  onRequestRide: () => void;
  mapSelectionMode?: 'origin' | 'destination' | null;
  setMapSelectionMode?: (mode: 'origin' | 'destination' | null) => void;
}

export const RideBookingPanel: React.FC<RideBookingPanelProps> = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  intermediateStops,
  setIntermediateStops,
  rideType,
  setRideType,
  selectedVehicle,
  setSelectedVehicle,
  selectedPayment,
  onOpenPaymentModal,
  onRequestRide,
  mapSelectionMode,
  setMapSelectionMode,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [searchFocus, setSearchFocus] = useState<'origin' | 'destination' | 'stop' | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setLocationStatus('Conectando con GPS...');

    if (!navigator.geolocation) {
      setLocationStatus('Geolocalización no disponible');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const myGpsLocation: LocationPoint = {
          id: 'loc_my_gps',
          name: 'Mi Ubicación Actual (GPS Navojoa)',
          address: `Navojoa, Sonora (${latitude.toFixed(4)}°N, ${Math.abs(longitude).toFixed(4)}°W - En tiempo real)`,
          tag: 'home',
          lat: latitude,
          lng: longitude,
          x: 480,
          y: 440,
        };
        setOrigin(myGpsLocation);
        setIsLocating(false);
        setLocationStatus('¡Ubicación GPS detectada!');
        setTimeout(() => setLocationStatus(null), 3500);
      },
      (err) => {
        console.warn('Geolocation fallback:', err);
        // Clean fallback to central Navojoa location
        const myGpsLocation: LocationPoint = {
          id: 'loc_my_gps_detected',
          name: 'Mi Ubicación Actual (GPS Navojoa)',
          address: 'Calle No Reelección esq. Pesqueira, Col. Centro, Navojoa, Son.',
          tag: 'home',
          lat: 26.8045,
          lng: -109.4442,
          x: 470,
          y: 430,
        };
        setOrigin(myGpsLocation);
        setIsLocating(false);
        setLocationStatus('Ubicación fijada en Centro de Navojoa');
        setTimeout(() => setLocationStatus(null), 3500);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 15000 }
    );
  };

  const handleAddStop = () => {
    if (intermediateStops.length >= 2) return;
    const nextPreset = PRESET_LOCATIONS.find(
      (l) => l.id !== origin.id && l.id !== destination.id && !intermediateStops.some((s) => s.id === l.id)
    ) || PRESET_LOCATIONS[2];
    setIntermediateStops([...intermediateStops, nextPreset]);
  };

  const handleRemoveStop = (idx: number) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== idx));
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toLowerCase() === 'omnipool' || promoCode.trim().toLowerCase() === 'laptop') {
      setPromoApplied(true);
    }
  };

  const currentPrice = rideType === 'shared' 
    ? selectedVehicle.priceShared 
    : selectedVehicle.pricePrivate;

  const finalPrice = promoApplied ? Math.max(2, currentPrice - 3) : currentPrice;

  return (
    <div className="w-full lg:w-[440px] xl:w-[480px] h-full bg-slate-900/95 backdrop-blur-md border-r border-slate-800 flex flex-col z-30 overflow-y-auto">
      <div className="p-6 space-y-6 flex-1">
        
        {/* Ride Type Selector Tabs: Private vs Shared Carpool */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Modalidad de Transporte
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <Leaf className="w-3 h-3" />
              Rutas Inteligentes
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <button
              id="ride-mode-private"
              onClick={() => setRideType('private')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                rideType === 'private'
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span>Viaje Privado</span>
            </button>

            <button
              id="ride-mode-shared"
              onClick={() => setRideType('shared')}
              className={`relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                rideType === 'shared'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40 border border-emerald-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>CoRide Compartido</span>
              <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                -45%
              </span>
            </button>
          </div>

          {/* Carpool value banner */}
          {rideType === 'shared' && (
            <div className="mt-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-300">
                  Viaja con pasajeros verificados en tu misma dirección
                </p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">
                  Ahorras hasta 45% en tarifa, reduces tráfico urbano y ahorras ~3.5 kg de CO2 por trayecto.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Route Address Selectors */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          {/* Origin */}
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Punto de Recogida
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      id="btn-pick-origin-on-map"
                      onClick={() => setMapSelectionMode?.(mapSelectionMode === 'origin' ? null : 'origin')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                        mapSelectionMode === 'origin'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold animate-pulse'
                          : 'bg-slate-800 text-emerald-400 hover:text-white border-slate-700 hover:bg-slate-700'
                      }`}
                      title="Seleccionar punto de inicio tocando el mapa"
                    >
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{mapSelectionMode === 'origin' ? 'Tocando mapa...' : 'Elegir en mapa'}</span>
                    </button>

                    <button
                      type="button"
                      id="btn-use-my-location"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                      title="Obtener mi ubicación satelital GPS actual en Navojoa"
                    >
                      {isLocating ? (
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                      ) : (
                        <Crosshair className="w-3 h-3 text-emerald-400" />
                      )}
                      <span>{isLocating ? 'Detectando...' : 'GPS'}</span>
                    </button>
                  </div>
                </div>

                {locationStatus && (
                  <div className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 mb-1 animate-pulse">
                    {locationStatus}
                  </div>
                )}

                <select
                  id="select-origin"
                  value={origin.id}
                  onChange={(e) => {
                    if (e.target.value === origin.id) return;
                    const found = PRESET_LOCATIONS.find((l) => l.id === e.target.value);
                    if (found) setOrigin(found);
                  }}
                  className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer truncate"
                >
                  {origin.id.startsWith('loc_my_gps') && (
                    <option value={origin.id} className="bg-slate-900 text-emerald-300 font-bold">
                      📍 {origin.name} — {origin.address}
                    </option>
                  )}
                  {(!PRESET_LOCATIONS.some((l) => l.id === origin.id) && !origin.id.startsWith('loc_my_gps')) && (
                    <option value={origin.id} className="bg-slate-900 text-emerald-300 font-bold">
                      📍 {origin.name} — {origin.address}
                    </option>
                  )}
                  {PRESET_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id} className="bg-slate-900 text-slate-100">
                      {loc.name} — {loc.address}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Intermediate Stops */}
          {intermediateStops.map((stop, idx) => (
            <div key={`stop-${idx}`} className="relative pl-7 flex items-center justify-between pt-1 border-t border-slate-800/60">
              <div className="flex items-center gap-2 flex-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    Parada {idx + 1}
                  </span>
                  <p className="text-xs text-slate-200 truncate">{stop.name}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveStop(idx)}
                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                title="Eliminar parada"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add Stop Button */}
          {intermediateStops.length < 2 && (
            <button
              id="btn-add-stop"
              onClick={handleAddStop}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors pl-7 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar parada intermedia</span>
            </button>
          )}

          {/* Destination */}
          <div className="relative pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white shadow-sm shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Destino Final
                  </label>
                  <button
                    type="button"
                    id="btn-pick-dest-on-map"
                    onClick={() => setMapSelectionMode?.(mapSelectionMode === 'destination' ? null : 'destination')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                      mapSelectionMode === 'destination'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold animate-pulse'
                        : 'bg-slate-800 text-cyan-400 hover:text-white border-slate-700 hover:bg-slate-700'
                    }`}
                    title="Seleccionar destino final tocando el mapa"
                  >
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{mapSelectionMode === 'destination' ? 'Tocando mapa...' : 'Elegir en mapa'}</span>
                  </button>
                </div>

                <select
                  id="select-destination"
                  value={destination.id}
                  onChange={(e) => {
                    const found = PRESET_LOCATIONS.find((l) => l.id === e.target.value);
                    if (found) setDestination(found);
                  }}
                  className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer truncate"
                >
                  {!PRESET_LOCATIONS.some((l) => l.id === destination.id) && (
                    <option value={destination.id} className="bg-slate-900 text-cyan-300 font-bold">
                      🏁 {destination.name} — {destination.address}
                    </option>
                  )}
                  {PRESET_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id} className="bg-slate-900 text-slate-100">
                      {loc.name} — {loc.address}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculated Street Distance */}
            <div className="mt-2 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Navigation className="w-3 h-3 text-emerald-400" />
                <span>Distancia de ruta:</span>
              </span>
              <span className="font-mono font-bold text-emerald-300">
                {calculateDistanceKm(origin.lat ?? 26.8045, origin.lng ?? -109.4442, destination.lat ?? 26.7865, destination.lng ?? -109.4310)} km en Navojoa
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Options List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Categorías de Vehículo
            </span>
            <span className="text-[11px] text-slate-400">
              Capacidad y Tarifas
            </span>
          </div>

          <div className="space-y-2.5">
            {VEHICLE_CATEGORIES.map((v) => {
              const isSelected = selectedVehicle.id === v.id;
              const price = rideType === 'shared' ? v.priceShared : v.pricePrivate;
              const originalPrice = v.pricePrivate;
              const isBlack = v.category === 'black';

              return (
                <div
                  key={v.id}
                  id={`vehicle-card-${v.id}`}
                  onClick={() => setSelectedVehicle(v)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isBlack
                      ? isSelected
                        ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-950/40 ring-1 ring-amber-400/50'
                        : 'bg-gradient-to-r from-slate-950 via-neutral-950 to-slate-950 border-amber-500/30 hover:border-amber-500/60'
                      : isSelected
                      ? 'bg-slate-800/90 border-emerald-500/80 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        v.category === 'electric'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : v.category === 'comfort'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : v.category === 'van'
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : isBlack
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {v.category === 'electric' ? '⚡' : v.category === 'van' ? '🚐' : isBlack ? '👑' : '🚗'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isBlack ? 'text-amber-100' : 'text-white'}`}>
                          {v.name}
                        </span>
                        {v.tag && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                            isBlack 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                              : 'bg-slate-800 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {v.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {v.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-slate-300 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {v.etaMinutes} min cerca
                        </span>
                        <span>•</span>
                        <span>{v.seats} asientos</span>
                        {isBlack && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 font-semibold">Camioneta SUV VIP</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                    <div className="text-right pl-3">
                      <p className="text-base font-bold text-white font-mono">
                        ${price.toFixed(2)}
                      </p>
                      {rideType === 'shared' && (
                        <p className="text-[11px] text-slate-500 line-through font-mono">
                          ${originalPrice.toFixed(2)}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">MXN</p>
                    </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment & Promo Code Bar */}
        <div className="space-y-3 pt-2">
          {/* Payment Method Selector */}
          <div
            id="ride-select-payment"
            onClick={onOpenPaymentModal}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Método de Pago Seguro
                </span>
                <span className="text-xs font-semibold text-white">
                  {selectedPayment.title}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs font-medium hover:text-white">
              <span>Cambiar</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Promo code mini form */}
          {!promoApplied ? (
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cupón (ej. OMNIPOOL)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 text-xs text-white rounded-lg pl-8 pr-3 py-2 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700"
              >
                Aplicar
              </button>
            </form>
          ) : (
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
              <span className="font-semibold">Cupón Aplicado: -$15.00 MXN</span>
              <button
                onClick={() => setPromoApplied(false)}
                className="text-slate-400 hover:text-white text-[11px]"
              >
                Quitar
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Booking CTA Footer */}
      <div className="p-6 bg-slate-950 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Total en Navojoa ({rideType === 'shared' ? 'CoRide' : 'Privado'}):</span>
          <div className="text-right">
            <span className="text-xl font-black text-white font-mono">
              ${finalPrice.toFixed(2)} MXN
            </span>
            {rideType === 'shared' && (
              <span className="block text-[10px] text-emerald-400 font-semibold">
                Ahorro de ~${(selectedVehicle.pricePrivate - finalPrice).toFixed(2)} MXN
              </span>
            )}
          </div>
        </div>

        <button
          id="btn-confirm-ride"
          onClick={onRequestRide}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm tracking-wide uppercase shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4 fill-current" />
          <span>Pedir Conductor en Navojoa</span>
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Viajes asegurados con monitoreo GPS 24/7 y asistencia vial</span>
        </div>
      </div>
    </div>
  );
};
