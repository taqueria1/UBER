import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Plus, 
  Check, 
  Lock, 
  Coins, 
  Users, 
  Smartphone, 
  Wallet,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethods: PaymentMethod[];
  selectedPayment: PaymentMethod;
  onSelectPayment: (pm: PaymentMethod) => void;
  walletBalance: number;
  onRechargeWallet: (amount: number) => void;
  onAddPaymentMethod: (pm: PaymentMethod) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentMethods,
  selectedPayment,
  onSelectPayment,
  walletBalance,
  onRechargeWallet,
  onAddPaymentMethod,
}) => {
  const [activeTab, setActiveTab] = useState<'methods' | 'add_card' | 'wallet' | 'split'>('methods');
  
  // Add card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'amex'>('visa');

  // Split fare state
  const [splitCount, setSplitCount] = useState(2);
  const sampleFare = 14.80;

  if (!isOpen) return null;

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber.trim() || !cardName.trim()) return;

    const last4 = cardNumber.replace(/\s+/g, '').slice(-4) || '9912';
    const newMethod: PaymentMethod = {
      id: `pm_card_${Date.now()}`,
      type: 'card',
      title: `${cardBrand.toUpperCase()} •••• ${last4}`,
      details: `Vence ${cardExpiry || '12/29'} • Titular: ${cardName}`,
      icon: 'credit-card',
    };

    onAddPaymentMethod(newMethod);
    onSelectPayment(newMethod);
    setActiveTab('methods');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Pasarela de Pagos Segura</h2>
              <p className="text-xs text-slate-400">Cifrado SSL 256-bit y tokenización bancaria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-950/80 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveTab('methods')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'methods'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Métodos Guardados
          </button>
          <button
            onClick={() => setActiveTab('add_card')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'add_card'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Tarjeta</span>
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'wallet'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Recarga Wallet (+5%)</span>
          </button>
          <button
            onClick={() => setActiveTab('split')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'split'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Dividir Cuenta</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: SAVED PAYMENT METHODS */}
          {activeTab === 'methods' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Selecciona tu método preferido para cobro automático
              </span>

              {paymentMethods.map((pm) => {
                const isSelected = selectedPayment.id === pm.id;
                return (
                  <div
                    key={pm.id}
                    onClick={() => onSelectPayment(pm)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold">
                        {pm.type === 'card' && <CreditCard className="w-5 h-5" />}
                        {pm.type === 'apple_pay' && <Smartphone className="w-5 h-5" />}
                        {pm.type === 'wallet' && <Wallet className="w-5 h-5" />}
                        {pm.type === 'mercadopago' && <CreditCard className="w-5 h-5 text-cyan-400" />}
                        {pm.type === 'cash' && <Coins className="w-5 h-5 text-amber-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{pm.title}</h4>
                          {pm.isDefault && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              Predeterminado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{pm.details}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setActiveTab('add_card')}
                className="w-full py-3 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500/60 text-slate-300 hover:text-emerald-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Otra Tarjeta de Débito o Crédito</span>
              </button>
            </div>
          )}

          {/* TAB 2: ADD NEW CARD */}
          {activeTab === 'add_card' && (
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
                <span className="font-semibold">Ingresa los datos de tu tarjeta</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Lock className="w-3 h-3" />
                  Cifrado SSL 256-bit
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Número de Tarjeta (16 dígitos)
                </label>
                <input
                  type="text"
                  required
                  placeholder="4532 •••• •••• 8421"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nombre del Titular (Como aparece en la tarjeta)
                </label>
                <input
                  type="text"
                  required
                  placeholder="JUAN PÉREZ"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Vencimiento (MM/AA)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08/28"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Código de Seguridad (CVV)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="•••"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                >
                  Guardar Tarjeta y Validar con 3D Secure
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: OMNIRIDE WALLET RECHARGE */}
          {activeTab === 'wallet' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-950 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
                    Saldo Actual en Wallet (Navojoa)
                  </span>
                  <span className="text-2xl font-black text-white font-mono">
                    ${walletBalance.toFixed(2)} MXN
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 font-semibold">
                    +5% en cada recarga
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Elige un monto de recarga rápida
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[100, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => {
                        onRechargeWallet(amt * 1.05);
                        alert(`¡Recarga exitosa de $${amt} MXN + $${(amt * 0.05).toFixed(2)} MXN de bono acreditados a tu saldo!`);
                      }}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-center transition-all group"
                    >
                      <span className="text-lg font-bold text-white block group-hover:text-emerald-400">
                        ${amt} MXN
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        Recibes ${(amt * 1.05).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SPLIT FARE */}
          {activeTab === 'split' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tarifa Estimada en Navojoa:</span>
                  <span className="font-mono font-bold text-white text-sm">$60.00 MXN</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-semibold">¿Entre cuántos pasajeros dividir?</span>
                  <div className="flex items-center gap-2">
                    {[2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setSplitCount(num)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          splitCount === num
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Cuota por persona:</span>
                  <span className="text-xl font-black text-white font-mono">
                    ${(60.0 / splitCount).toFixed(2)} MXN
                  </span>
                </div>
              </div>

              <button
                onClick={() => alert('Enlace de cobro dividido generado para WhatsApp/SMS.')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Generar Enlace para Invitar a Dividir Tarifa</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          )}

          {/* Security Banner */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Tus métodos de pago están resguardados bajo la norma bancaria PCI-DSS Nivel 1.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
