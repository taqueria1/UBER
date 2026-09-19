import React from 'react';
import { X, Users, ShieldCheck, MapPin, Leaf, Award } from 'lucide-react';
import { CoRider } from '../types';

interface CarpoolRidersModalProps {
  isOpen: boolean;
  onClose: () => void;
  coRiders: CoRider[];
}

export const CarpoolRidersModal: React.FC<CarpoolRidersModalProps> = ({
  isOpen,
  onClose,
  coRiders,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Compañeros de Ruta (CoRide)</h3>
              <p className="text-xs text-slate-400">Pasajeros verificados en tu corredor vial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 text-xs text-teal-300 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Este viaje compartido ahorra 6.3 kg de emisiones de CO2 colectivas.</span>
          </div>

          <div className="space-y-3">
            {coRiders.map((rider) => (
              <div
                key={rider.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rider.avatar}
                      alt={rider.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{rider.name}</span>
                        <span className="text-amber-400 text-xs font-semibold">★ {rider.rating}</span>
                      </div>
                      <span className="text-xs text-slate-400 block">{rider.institutionOrCompany}</span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-teal-500/30 font-bold">
                    {rider.seatNumber}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Sube: {rider.pickupPoint}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">Baja: {rider.dropoffPoint}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Todos los integrantes han validado documento oficial de identidad y perfil de confianza.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
