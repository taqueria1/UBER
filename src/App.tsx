import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { InteractiveMap } from './components/InteractiveMap';
import { RideBookingPanel } from './components/RideBookingPanel';
import { ActiveTripPanel } from './components/ActiveTripPanel';
import { TripChatModal } from './components/TripChatModal';
import { ShareTripModal } from './components/ShareTripModal';
import { RatingModal } from './components/RatingModal';
import { TripHistoryModal } from './components/TripHistoryModal';
import { PaymentModal } from './components/PaymentModal';
import { Support247Modal } from './components/Support247Modal';
import { CarpoolRidersModal } from './components/CarpoolRidersModal';
import { CancelTripModal } from './components/CancelTripModal';
import { NotificationCenter } from './components/NotificationCenter';
import { NotificationToast } from './components/NotificationToast';
import { soundManager } from './services/sound';
import { 
  LocationPoint, 
  RideType, 
  VehicleCategory, 
  PaymentMethod, 
  ActiveTripData, 
  PastTrip, 
  PushNotification, 
  ChatMessage, 
  DriverInfo 
} from './types';
import { 
  PRESET_LOCATIONS, 
  VEHICLE_CATEGORIES, 
  AVAILABLE_DRIVERS, 
  SAMPLE_CO_RIDERS, 
  INITIAL_PAYMENT_METHODS, 
  INITIAL_PAST_TRIPS 
} from './data/mockData';

export default function App() {
  // Navigation & Route states
  const [origin, setOrigin] = useState<LocationPoint>(PRESET_LOCATIONS[0]);
  const [destination, setDestination] = useState<LocationPoint>(PRESET_LOCATIONS[1]);
  const [intermediateStops, setIntermediateStops] = useState<LocationPoint[]>([]);
  const [rideType, setRideType] = useState<RideType>('shared');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCategory>(VEHICLE_CATEGORIES[0]);

  // Payments & Balance
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(INITIAL_PAYMENT_METHODS[0]);
  const [walletBalance, setWalletBalance] = useState(74.50);

  // Active Trip state
  const [activeTrip, setActiveTrip] = useState<ActiveTripData | null>(null);
  const [completedTripForRating, setCompletedTripForRating] = useState<ActiveTripData | null>(null);

  // Past Trips History
  const [pastTrips, setPastTrips] = useState<PastTrip[]>(INITIAL_PAST_TRIPS);

  // Notifications
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: 'notif_init',
      title: 'Bienvenido a OmniRide',
      message: 'Tu cuenta corporativa está lista con verificación 4.96 ★ y saldo disponible.',
      timestamp: '15:30',
      type: 'info',
      read: false,
    },
    {
      id: 'notif_coride_promo',
      title: 'Ahorro CoRide Activado',
      message: 'Los viajes compartidos reducen tu tarifa un 45% y evitan emisiones de CO2.',
      timestamp: '15:45',
      type: 'route',
      read: false,
    }
  ]);
  const [latestToast, setLatestToast] = useState<PushNotification | null>(null);

  // In-trip Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'system',
      text: 'Conexión encriptada establecida con tu conductor asignado.',
      time: '15:52',
    }
  ]);

  // Modal open states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isCarpoolModalOpen, setIsCarpoolModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const tripTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stage1Ref = useRef<NodeJS.Timeout | null>(null);
  const stage2Ref = useRef<NodeJS.Timeout | null>(null);
  const stage3Ref = useRef<NodeJS.Timeout | null>(null);

  // Helper to add and toast push notification
  const addNotification = (title: string, message: string, type: PushNotification['type'] = 'info') => {
    const newNotif: PushNotification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setLatestToast(newNotif);
    soundManager.playNotification();
  };

  // Trigger Ride Request Flow
  const handleRequestRide = () => {
    // Clear any previous running timers
    if (stage1Ref.current) clearTimeout(stage1Ref.current);
    if (stage2Ref.current) clearTimeout(stage2Ref.current);
    if (stage3Ref.current) clearTimeout(stage3Ref.current);
    if (tripTimerRef.current) clearInterval(tripTimerRef.current);

    const fare = rideType === 'shared' ? selectedVehicle.priceShared : selectedVehicle.pricePrivate;
    const discount = rideType === 'shared' ? selectedVehicle.pricePrivate * 0.43 : 0;
    
    // Choose appropriate driver based on vehicle type
    const assignedDriver = selectedVehicle.category === 'black'
      ? (AVAILABLE_DRIVERS.find((d) => d.id === 'drv_black') || AVAILABLE_DRIVERS[0])
      : selectedVehicle.category === 'electric'
      ? (AVAILABLE_DRIVERS.find((d) => d.id === 'drv_2') || AVAILABLE_DRIVERS[0])
      : AVAILABLE_DRIVERS[0];

    const newTrip: ActiveTripData = {
      id: `OMNI-${Math.floor(100000 + Math.random() * 900000)}`,
      rideType,
      origin,
      destination,
      intermediateStops,
      vehicle: selectedVehicle,
      driver: assignedDriver,
      coRiders: rideType === 'shared' ? SAMPLE_CO_RIDERS : [],
      fare,
      originalFare: selectedVehicle.pricePrivate,
      discountApplied: discount,
      paymentMethod: selectedPayment,
      safetyPin: Math.floor(1000 + Math.random() * 9000).toString(),
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedDurationMin: 18,
      elapsedSeconds: 0,
      totalDistanceKm: 7.4,
      currentSpeedKmh: 42,
      etaSecondsRemaining: 18 * 60,
      currentTurnDirection: 'En 150m continúa recto',
      state: 'finding_driver',
      routeProgress: 0,
    };

    setActiveTrip(newTrip);
    addNotification(
      selectedVehicle.category === 'black' 
        ? 'Buscando camioneta UberBlack VIP...' 
        : 'Buscando conductor cercano...', 
      `Localizando ${selectedVehicle.name} en el área de Navojoa.`, 
      'route'
    );

    // Stage 1: Driver Assigned (after 2.2 seconds)
    stage1Ref.current = setTimeout(() => {
      setActiveTrip((prev) => prev ? { ...prev, state: 'driver_en_route' } : null);
      addNotification(
        selectedVehicle.category === 'black' ? '¡Camioneta VIP Asignada!' : '¡Conductor asignado!',
        `${assignedDriver.name} (${assignedDriver.vehicleModel} • ${assignedDriver.plate}) está en camino a tu punto de recogida en Navojoa.`,
        'success'
      );
    }, 2200);

    // Stage 2: Driver Arrived at Origin (after 5 seconds)
    stage2Ref.current = setTimeout(() => {
      setActiveTrip((prev) => prev ? { ...prev, state: 'driver_arrived' } : null);
      soundManager.playDriverArrived();
      addNotification(
        '¡Tu vehículo ha llegado!',
        `${assignedDriver.name} está afuera esperando en ${origin.name}. Recuerda verificar el PIN de abordaje.`,
        'alert'
      );
    }, 5000);

    // Stage 3: Trip In Progress (after 8 seconds)
    stage3Ref.current = setTimeout(() => {
      setActiveTrip((prev) => prev ? { ...prev, state: 'trip_in_progress' } : null);
      addNotification(
        'Viaje iniciado',
        `Disfruta tu recorrido por Navojoa con monitoreo satelital GPS 24/7 y seguro de viaje activo.`,
        'route'
      );
    }, 8000);
  };

  // Real-time route movement simulation when in progress
  useEffect(() => {
    if (!activeTrip || activeTrip.state !== 'trip_in_progress') return;

    tripTimerRef.current = setInterval(() => {
      setActiveTrip((prev) => {
        if (!prev) return null;
        const nextProgress = prev.routeProgress + 0.025; // advance ~2.5% every 800ms
        const newElapsed = prev.elapsedSeconds + 15;
        const newEtaRemaining = Math.max(0, prev.etaSecondsRemaining - 20);

        // Turn directions based on progress
        let turn = 'Continúa recto por Av. Insurgentes';
        if (nextProgress > 0.3 && nextProgress < 0.6) {
          turn = 'En 200m gira a la derecha hacia Av. Chapultepec';
        } else if (nextProgress >= 0.6 && nextProgress < 0.85) {
          turn = 'Toma la salida lateral hacia tu destino';
        } else if (nextProgress >= 0.85) {
          turn = 'Aproximándote al punto de bajada';
        }

        // Shared intermediate stop trigger
        if (prev.rideType === 'shared' && nextProgress > 0.45 && nextProgress < 0.52 && prev.state !== 'shared_stop') {
          addNotification(
            'Parada CoRide en curso',
            'Subiendo Camila Ramos en Av. Reforma 240. Parada estimada: 45 segundos.',
            'route'
          );
        }

        // Trip Completed!
        if (nextProgress >= 1) {
          clearInterval(tripTimerRef.current as NodeJS.Timeout);
          soundManager.playTripComplete();
          addNotification(
            '¡Has llegado a tu destino!',
            `Recorrido finalizado con éxito. Tarifa de $${prev.fare.toFixed(2)} USD procesada mediante ${prev.paymentMethod.title}.`,
            'payment'
          );
          setCompletedTripForRating(prev);
          setIsRatingModalOpen(true);
          return null; // Reset active trip
        }

        return {
          ...prev,
          routeProgress: nextProgress,
          elapsedSeconds: newElapsed,
          etaSecondsRemaining: newEtaRemaining,
          currentSpeedKmh: Math.floor(40 + Math.random() * 22),
          currentTurnDirection: turn,
        };
      });
    }, 800);

    return () => {
      if (tripTimerRef.current) clearInterval(tripTimerRef.current);
    };
  }, [activeTrip?.state]);

  // Chat message sending with realistic auto-reply from driver
  const handleSendMessageToDriver = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'passenger',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Driver auto reply
    setTimeout(() => {
      const driverReplies = [
        '¡Entendido! Ya te ubiqué, voy con intermitentes puestas.',
        'Perfecto, estoy a unos metros de la esquina.',
        'Excelente, no te preocupes por el equipaje, te asisto en seguida.',
        'De acuerdo, gracias por avisar.',
      ];
      const reply = driverReplies[Math.floor(Math.random() * driverReplies.length)];

      const driverMsg: ChatMessage = {
        id: `drv_msg_${Date.now()}`,
        sender: 'driver',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, driverMsg]);
      soundManager.playChat();
    }, 1200);
  };

  // Rating submission at trip end
  const handleRatingSubmit = (rating: number, review: string, tip: number) => {
    if (!completedTripForRating) return;

    const newHistoryItem: PastTrip = {
      id: `trip_hist_${Date.now()}`,
      date: `${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hrs`,
      rideType: completedTripForRating.rideType,
      origin: completedTripForRating.origin.address,
      destination: completedTripForRating.destination.address,
      distanceKm: completedTripForRating.totalDistanceKm,
      durationMin: completedTripForRating.estimatedDurationMin,
      farePaid: completedTripForRating.fare + tip,
      paymentMethod: completedTripForRating.paymentMethod.title,
      driverName: completedTripForRating.driver.name,
      driverPhoto: completedTripForRating.driver.photo,
      driverRating: completedTripForRating.driver.rating,
      vehicle: `${completedTripForRating.driver.vehicleModel} (${completedTripForRating.driver.vehicleColor})`,
      plate: completedTripForRating.driver.plate,
      userRatingGiven: rating,
      userReview: review || 'Excelente servicio y puntualidad.',
      coRidersCount: completedTripForRating.rideType === 'shared' ? 2 : 0,
      co2SavedKg: completedTripForRating.rideType === 'shared' ? 3.6 : 0,
      status: 'completed',
      folioFiscal: `OMNI-${Date.now().toString().slice(-8)}`,
    };

    setPastTrips((prev) => [newHistoryItem, ...prev]);
    setIsRatingModalOpen(false);
    setCompletedTripForRating(null);

    addNotification(
      'Calificación enviada',
      `Gracias por tus comentarios. Tu recibo fiscal ha sido almacenado en tu historial.`,
      'success'
    );
  };

  // Cancel trip modal opener
  const handleCancelTrip = () => {
    setIsCancelModalOpen(true);
  };

  // Confirm cancel trip with specific reason
  const handleConfirmCancelTrip = (reason: string) => {
    if (stage1Ref.current) clearTimeout(stage1Ref.current);
    if (stage2Ref.current) clearTimeout(stage2Ref.current);
    if (stage3Ref.current) clearTimeout(stage3Ref.current);
    if (tripTimerRef.current) clearInterval(tripTimerRef.current);

    if (activeTrip) {
      const cancelledTripItem: PastTrip = {
        id: `trip_canc_${Date.now()}`,
        date: `${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hrs`,
        rideType: activeTrip.rideType,
        origin: activeTrip.origin.name,
        destination: activeTrip.destination.name,
        distanceKm: activeTrip.totalDistanceKm,
        durationMin: 0,
        farePaid: 0,
        paymentMethod: activeTrip.paymentMethod.title,
        driverName: activeTrip.driver.name,
        driverPhoto: activeTrip.driver.photo,
        driverRating: activeTrip.driver.rating,
        vehicle: `${activeTrip.driver.vehicleModel} (${activeTrip.driver.vehicleColor})`,
        plate: activeTrip.driver.plate,
        status: 'cancelled',
        userReview: `Cancelado: ${reason}`,
        folioFiscal: `CANC-${Date.now().toString().slice(-8)}`,
      };
      setPastTrips((prev) => [cancelledTripItem, ...prev]);
    }

    setActiveTrip(null);
    setIsCancelModalOpen(false);

    soundManager.playNotification();
    addNotification(
      'Viaje cancelado',
      `Motivo: "${reason}". Tu solicitud fue cancelada inmediatamente sin ningún costo.`,
      'alert'
    );
  };

  // Repeat trip from history
  const handleRepeatTrip = (originName: string, destName: string) => {
    const o = PRESET_LOCATIONS.find((l) => originName.includes(l.name)) || PRESET_LOCATIONS[0];
    const d = PRESET_LOCATIONS.find((l) => destName.includes(l.name)) || PRESET_LOCATIONS[1];
    setOrigin(o);
    setDestination(d);
    setIsHistoryModalOpen(false);
    addNotification('Ruta cargada', `Ruta configurada: ${o.name} -> ${d.name}`, 'info');
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const unreadChatCount = chatMessages.filter((m) => m.sender === 'driver').length;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <Navbar
        notifications={notifications}
        unreadCount={unreadNotifCount}
        walletBalance={walletBalance}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenPayments={() => setIsPaymentModalOpen(true)}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        isTripActive={!!activeTrip}
      />

      {/* Main Split Body: Left Booking/Telemetry Panel + Right Live Interactive Map */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Left Side: Booking Panel OR Active Trip Telemetry Panel */}
        <div className="w-full lg:w-[440px] xl:w-[480px] h-full shrink-0 relative z-20">
          {!activeTrip ? (
            <RideBookingPanel
              origin={origin}
              setOrigin={setOrigin}
              destination={destination}
              setDestination={setDestination}
              intermediateStops={intermediateStops}
              setIntermediateStops={setIntermediateStops}
              rideType={rideType}
              setRideType={setRideType}
              selectedVehicle={selectedVehicle}
              setSelectedVehicle={setSelectedVehicle}
              selectedPayment={selectedPayment}
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
              onRequestRide={handleRequestRide}
            />
          ) : (
            <ActiveTripPanel
              activeTrip={activeTrip}
              onOpenChat={() => setIsChatOpen(true)}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onOpenSupport={() => setIsSupportModalOpen(true)}
              onOpenCarpoolDetails={() => setIsCarpoolModalOpen(true)}
              onCancelTrip={handleCancelTrip}
              unreadChatCount={unreadChatCount}
            />
          )}
        </div>

        {/* Center/Right: Live Interactive Real-Time Map */}
        <div className="flex-1 h-full relative z-10">
          <InteractiveMap
            activeTrip={activeTrip}
            origin={origin}
            destination={destination}
            intermediateStops={intermediateStops}
            isCarpoolMode={rideType === 'shared'}
          />
        </div>
      </div>

      {/* Floating Push Notification Toast */}
      <NotificationToast
        notification={latestToast}
        onDismiss={() => setLatestToast(null)}
      />

      {/* MODALS */}
      {/* 1. In-Trip Private Messenger */}
      {activeTrip && (
        <TripChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          driver={activeTrip.driver}
          messages={chatMessages}
          onSendMessage={handleSendMessageToDriver}
        />
      )}

      {/* 2. Share Live Location */}
      <ShareTripModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeTrip={activeTrip}
      />

      {/* 3. Bidirectional Rating Modal */}
      {completedTripForRating && (
        <RatingModal
          isOpen={isRatingModalOpen}
          activeTrip={completedTripForRating}
          onSubmitRating={handleRatingSubmit}
        />
      )}

      {/* 4. Past Trip History & PDF Invoices */}
      <TripHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        pastTrips={pastTrips}
        onRepeatTrip={handleRepeatTrip}
      />

      {/* 5. Secure Payment Gateway & OmniRide Wallet */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentMethods={paymentMethods}
        selectedPayment={selectedPayment}
        onSelectPayment={(pm) => setSelectedPayment(pm)}
        walletBalance={walletBalance}
        onRechargeWallet={(amt) => setWalletBalance((b) => b + amt)}
        onAddPaymentMethod={(pm) => setPaymentMethods((prev) => [pm, ...prev])}
      />

      {/* 6. 24/7 Technical Support & SOS Alert */}
      <Support247Modal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* 7. Shared Carpool Riders Detail */}
      {activeTrip && (
        <CarpoolRidersModal
          isOpen={isCarpoolModalOpen}
          onClose={() => setIsCarpoolModalOpen(false)}
          coRiders={activeTrip.coRiders}
        />
      )}

      {/* 8. Notification Center Slide-over */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
      />

      {/* 9. Trip Cancellation Modal */}
      <CancelTripModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleConfirmCancelTrip}
        activeTrip={activeTrip}
      />
    </div>
  );
}
