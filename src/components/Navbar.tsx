import React from 'react';
import { 
  Car, 
  ShieldCheck, 
  CreditCard, 
  History, 
  Headphones, 
  Bell, 
  Sparkles, 
  Share2,
  Users
} from 'lucide-react';
import { PushNotification } from '../types';

interface NavbarProps {
  notifications: PushNotification[];
  unreadCount: number;
  walletBalance: number;
  onOpenNotifications: () => void;
  onOpenHistory: () => void;
  onOpenPayments: () => void;
  onOpenSupport: () => void;
  onOpenShareModal: () => void;
  isTripActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  unreadCount,
  walletBalance,
  onOpenNotifications,
  onOpenHistory,
  onOpenPayments,
  onOpenSupport,
  onOpenShareModal,
  isTripActive,
}) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between z-40 select-none">
      {/* Brand & Concept */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
          <Car className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              Omni<span className="text-emerald-400">Ride</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Navojoa, Sonora
            </span>
            {isTripActive && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Viaje en Curso
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Movilidad Urbana en La Perla del Mayo • Rutas Compartidas & Monitoreo 24/7
          </p>
        </div>
      </div>

      {/* Center status / Mode indicator */}
      <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Seguridad GPS Activa</span>
        </div>
        <span className="text-slate-600">•</span>
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Red CoRide Lista</span>
        </div>
        <span className="text-slate-600">•</span>
        <div className="flex items-center gap-1.5 text-amber-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>4.96 ★ Perfil Verificado</span>
        </div>
      </div>

      {/* Right laptop tools */}
      <div className="flex items-center gap-2.5">
        {/* Wallet balance pill */}
        <button
          id="nav-wallet-btn"
          onClick={onOpenPayments}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700/70 text-slate-200 transition-all text-xs font-medium group"
          title="Ver métodos de pago y saldo"
        >
          <CreditCard className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline text-slate-400">Saldo:</span>
          <span className="font-semibold text-emerald-400 font-mono">${walletBalance.toFixed(2)} MXN</span>
        </button>

        {/* Historial & Recibos PDF */}
        <button
          id="nav-history-btn"
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700/70 text-slate-200 transition-all text-xs font-medium"
          title="Historial de viajes y facturas PDF"
        >
          <History className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline">Historial</span>
        </button>

        {/* Share live ride */}
        <button
          id="nav-share-btn"
          onClick={onOpenShareModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700/70 text-slate-200 transition-all text-xs font-medium"
          title="Compartir trayecto con contactos"
        >
          <Share2 className="w-4 h-4 text-indigo-400" />
          <span className="hidden lg:inline">Compartir Ruta</span>
        </button>

        {/* Soporte 24/7 */}
        <button
          id="nav-support-btn"
          onClick={onOpenSupport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-all text-xs font-medium"
          title="Soporte técnico 24/7 y asistencia vial"
        >
          <Headphones className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Soporte 24/7</span>
        </button>

        {/* Push Notification bell */}
        <button
          id="nav-notifications-btn"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700/70 text-slate-300 transition-all"
          title="Notificaciones push del servicio"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center animate-bounce shadow-md">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
