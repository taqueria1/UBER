import React, { useState } from 'react';
import { 
  X, 
  History, 
  FileDown, 
  RotateCcw, 
  Star, 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  Leaf, 
  Car,
  TrendingDown
} from 'lucide-react';
import { PastTrip, LocationPoint } from '../types';
import { generateTripReceiptPDF } from '../services/pdfReceipt';

interface TripHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pastTrips: PastTrip[];
  onRepeatTrip: (originName: string, destName: string) => void;
}

export const TripHistoryModal: React.FC<TripHistoryModalProps> = ({
  isOpen,
  onClose,
  pastTrips,
  onRepeatTrip,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'shared' | 'private'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredTrips = pastTrips.filter((trip) => {
    if (filterType === 'shared' && trip.rideType !== 'shared') return false;
    if (filterType === 'private' && trip.rideType !== 'private') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        trip.origin.toLowerCase().includes(q) ||
        trip.destination.toLowerCase().includes(q) ||
        trip.driverName.toLowerCase().includes(q) ||
        trip.folioFiscal.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalSaved = pastTrips.reduce((acc, t) => acc + (t.rideType === 'shared' ? t.farePaid * 0.45 : 0), 0);
  const totalCo2 = pastTrips.reduce((acc, t) => acc + (t.co2SavedKg || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Historial Detallado de Viajes</h2>
              <p className="text-xs text-slate-400">Consulta inmediata, descarga de recibos PDF y auditoría fiscal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aggregate Stats Strip */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Viajes Registrados</span>
            <span className="text-base font-bold text-white font-mono">{pastTrips.length} viajes</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <TrendingDown className="w-3.5 h-3.5" />
              Ahorro en CoRide
            </span>
            <span className="text-base font-bold text-emerald-300 font-mono">+${totalSaved.toFixed(2)} MXN</span>
          </div>
          <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30">
            <span className="text-teal-400 flex items-center gap-1 text-[11px]">
              <Leaf className="w-3.5 h-3.5" />
              CO₂ Evitado
            </span>
            <span className="text-base font-bold text-teal-300 font-mono">-{totalCo2.toFixed(1)} kg CO₂</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por dirección, conductor o folio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg pl-9 pr-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({pastTrips.length})
            </button>
            <button
              onClick={() => setFilterType('shared')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                filterType === 'shared' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>CoRide ({pastTrips.filter(t => t.rideType === 'shared').length})</span>
            </button>
            <button
              onClick={() => setFilterType('private')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                filterType === 'private' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Privados
            </button>
          </div>
        </div>

        {/* Trip List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/40">
          {filteredTrips.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No se encontraron viajes con los filtros seleccionados.
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                {/* Top Row: Date, Ride Type, Folio */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-300">{trip.date}</span>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-slate-400">{trip.folioFiscal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {trip.rideType === 'shared' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        CoRide Compartido (-{trip.co2SavedKg}kg CO₂)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">
                        Viaje Privado
                      </span>
                    )}
                    <span className="font-mono font-bold text-sm text-white">
                      ${trip.farePaid.toFixed(2)} MXN
                    </span>
                  </div>
                </div>

                {/* Middle: Route addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Recogida</span>
                        <p className="text-slate-200 line-clamp-1">{trip.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Destino</span>
                        <p className="text-slate-200 line-clamp-1">{trip.destination}</p>
                      </div>
                    </div>
                  </div>

                  {/* Driver and Car */}
                  <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={trip.driverPhoto}
                        alt={trip.driverName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="font-bold text-white block text-xs">{trip.driverName}</span>
                        <p className="text-[10px] text-slate-400">{trip.vehicle} • {trip.plate}</p>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <span>{trip.distanceKm} km</span>
                      <span className="block">{trip.durationMin} min</span>
                    </div>
                  </div>
                </div>

                {/* Bottom user review and Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 text-xs">
                    <div className="flex items-center">
                      {[...Array(trip.userRatingGiven || 5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-slate-400 text-[11px] truncate max-w-xs">
                      {trip.userReview ? `"${trip.userReview}"` : 'Calificación de 5 estrellas'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRepeatTrip(trip.origin, trip.destination)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Volver a pedir esta misma ruta"
                    >
                      <RotateCcw className="w-3 h-3 text-cyan-400" />
                      <span>Repetir</span>
                    </button>

                    <button
                      id={`btn-pdf-${trip.id}`}
                      onClick={() => generateTripReceiptPDF(trip)}
                      className="px-3 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                      title="Descargar Comprobante Fiscal Oficial en PDF"
                    >
                      <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Recibo PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
