import React from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  Share2, 
  AlertTriangle, 
  X, 
  Users, 
  Clock, 
  Navigation, 
  KeyRound, 
  CheckCircle2, 
  Leaf, 
  Car
} from 'lucide-react';
import { ActiveTripData } from '../types';

interface ActiveTripPanelProps {
  activeTrip: ActiveTripData;
  onOpenChat: () => void;
  onOpenShareModal: () => void;
  onOpenSupport: () => void;
  onOpenCarpoolDetails: () => void;
  onCancelTrip: () => void;
  unreadChatCount: number;
}

export const ActiveTripPanel: React.FC<ActiveTripPanelProps> = ({
  activeTrip,
  onOpenChat,
  onOpenShareModal,
  onOpenSupport,
  onOpenCarpoolDetails,
  onCancelTrip,
  unreadChatCount,
}) => {
  const { driver, vehicle, state, rideType, safetyPin, coRiders, routeProgress } = activeTrip;

  const getStateBadge = () => {
    switch (state) {
      case 'finding_driver':
        return { text: 'Asignando Conductor Cercano...', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'driver_en_route':
        return { text: 'Conductor en Camino hacia Recogida', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
      case 'driver_arrived':
        return { text: '¡Conductor en el Punto de Recogida!', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'shared_stop':
        return { text: 'Parada CoRide: Recogiendo Pasajero', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
      case 'trip_in_progress':
      default:
        return { text: 'Viaje en Progreso hacia Destino', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
  };

  const badge = getStateBadge();

  return (
    <div className="w-full lg:w-[440px] xl:w-[480px] h-full bg-slate-900/95 backdrop-blur-md border-r border-slate-800 flex flex-col z-30 overflow-y-auto">
      <div className="p-6 space-y-6 flex-1">
        
        {/* Status Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${badge.color} animate-pulse flex items-center gap-1.5`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {badge.text}
            </span>
            <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              ETA: {Math.ceil(activeTrip.etaSecondsRemaining / 60)} min
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(8, Math.min(100, routeProgress * 100))}%` }}
            />
          </div>
        </div>

        {/* Finding Driver Alert Card */}
        {state === 'finding_driver' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center text-center space-y-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
              <Car className="w-6 h-6 text-amber-400 relative z-10" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Conectando con conductores en Navojoa</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Localizando la camioneta o vehículo más cercano a tu ubicación.
              </p>
            </div>
            <button
              onClick={onCancelTrip}
              className="px-4 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/30 transition-all active:scale-95"
            >
              Cancelar Búsqueda
            </button>
          </div>
        )}

        {/* Boarding Safety PIN */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PIN de Seguridad de Abordaje
              </span>
              <p className="text-xs text-slate-300">
                Verifica este código con el conductor
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-lg tracking-widest">
            {safetyPin}
          </div>
        </div>

        {/* Driver & Vehicle Information Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4 shadow-xl">
          {/* Driver row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={driver.photo}
                  alt={driver.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/60 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-white">{driver.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="text-amber-400 font-bold">★ {driver.rating.toFixed(2)}</span>
                  <span>•</span>
                  <span>{driver.totalTrips.toLocaleString()} viajes</span>
                </div>
                <span className="inline-block text-[10px] text-emerald-400 font-medium">
                  {driver.verificationBadge}
                </span>
              </div>
            </div>

            {/* Vehicle Plate Card */}
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Placas
              </span>
              <div className="px-2.5 py-1 rounded bg-slate-800 text-white font-mono font-black text-sm border border-slate-700 tracking-wider">
                {driver.plate}
              </div>
            </div>
          </div>

          {/* Vehicle specs */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Car className={`w-4 h-4 ${vehicle.category === 'black' ? 'text-amber-400' : 'text-cyan-400'}`} />
              <span className={vehicle.category === 'black' ? 'font-bold text-amber-200' : ''}>{driver.vehicleModel}</span>
              <span className="text-slate-500">({driver.vehicleColor})</span>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded font-medium border ${
              vehicle.category === 'black'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                : 'bg-slate-800/80 text-cyan-400 border-cyan-500/20'
            }`}>
              {vehicle.category === 'black' ? '👑 UberBlack Camioneta VIP' : vehicle.name}
            </span>
          </div>
        </div>

        {/* Co-Riders (Carpool Section if shared mode) */}
        {rideType === 'shared' && (
          <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Compañeros de Ruta (CoRide)
                </span>
              </div>
              <button
                id="btn-view-carpool-details"
                onClick={onOpenCarpoolDetails}
                className="text-[11px] text-emerald-400 hover:underline font-medium"
              >
                Ver Paradas
              </button>
            </div>

            <div className="space-y-2">
              {coRiders.map((rider) => (
                <div 
                  key={rider.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rider.avatar}
                      alt={rider.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white">{rider.name}</span>
                        <span className="text-[10px] text-amber-400 font-medium">★ {rider.rating}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[190px]">
                        {rider.seatNumber} • {rider.institutionOrCompany}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    -{rider.co2SavedKg}kg CO₂
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-medium pt-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ahorraste 43% en este trayecto compartido</span>
            </div>
          </div>
        )}

        {/* Route summary pins */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-400 truncate">Origen: {activeTrip.origin.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
            <span className="text-slate-200 font-medium truncate">Destino: {activeTrip.destination.name}</span>
          </div>
        </div>

        {/* Communication & Safety Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Chat with Driver */}
          <button
            id="btn-open-trip-chat"
            onClick={onOpenChat}
            className="relative flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Chat Conductor</span>
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Masked phone call */}
          <button
            id="btn-call-driver"
            onClick={() => alert(`Llamada segura enmascarada a través del conmutador de OmniRide conectando con ${driver.name}. Tu número celular no será visible.`)}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Llamada Segura</span>
          </button>

          {/* Share Live Location */}
          <button
            id="btn-share-live-ride"
            onClick={onOpenShareModal}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>Compartir Ruta</span>
          </button>

          {/* 24/7 SOS Panic Button */}
          <button
            id="btn-sos-support"
            onClick={onOpenSupport}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Soporte / SOS</span>
          </button>
        </div>

      </div>

      {/* Footer Cancel Trip Button */}
      <div className="p-4 bg-slate-950 border-t border-slate-800/80">
        <button
          id="btn-cancel-trip"
          onClick={onCancelTrip}
          className="w-full py-3 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
        >
          <X className="w-4 h-4 text-red-400" />
          <span>Cancelar Viaje (Sin penalización)</span>
        </button>
      </div>
    </div>
  );
};
