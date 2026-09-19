export type RideType = 'private' | 'shared';

export interface LocationPoint {
  id: string;
  name: string;
  address: string;
  tag?: 'home' | 'work' | 'airport' | 'popular' | 'custom';
  lat: number; // Real geographic latitude in Navojoa, Sonora
  lng: number; // Real geographic longitude in Navojoa, Sonora
  x?: number; // Coordinates for fallback map canvas (0-1000)
  y?: number; // Coordinates for fallback map canvas (0-1000)
}

export interface VehicleCategory {
  id: string;
  name: string;
  category: 'standard' | 'comfort' | 'electric' | 'van' | 'black';
  seats: number;
  etaMinutes: number;
  pricePrivate: number;
  priceShared: number;
  savingsShared: number; // percentage, e.g. 42%
  description: string;
  tag?: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  photo: string;
  rating: number;
  totalTrips: number;
  phone: string;
  vehicleModel: string;
  vehicleColor: string;
  plate: string;
  verificationBadge: string;
  safetyLevel: string;
}

export interface CoRider {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  verifiedIdentity: boolean;
  institutionOrCompany?: string;
  pickupPoint: string;
  dropoffPoint: string;
  seatNumber: string;
  co2SavedKg: number;
  status: 'onboard' | 'next_pickup' | 'completed';
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay' | 'paypal' | 'mercadopago' | 'wallet' | 'cash';
  title: string;
  details: string; // e.g. "•••• 4242" or "Saldo: $45.00"
  icon: string;
  isDefault?: boolean;
}

export type TripState =
  | 'idle'
  | 'booking'
  | 'finding_driver'
  | 'driver_en_route'
  | 'driver_arrived'
  | 'trip_in_progress'
  | 'shared_stop'
  | 'trip_completed'
  | 'cancelled';

export interface ActiveTripData {
  id: string;
  rideType: RideType;
  origin: LocationPoint;
  destination: LocationPoint;
  intermediateStops: LocationPoint[];
  vehicle: VehicleCategory;
  driver: DriverInfo;
  coRiders: CoRider[];
  fare: number;
  originalFare: number;
  discountApplied: number;
  paymentMethod: PaymentMethod;
  safetyPin: string;
  startTime: string;
  estimatedDurationMin: number;
  elapsedSeconds: number;
  totalDistanceKm: number;
  currentSpeedKmh: number;
  etaSecondsRemaining: number;
  currentTurnDirection: string;
  state: TripState;
  routeProgress: number; // 0 to 1
}

export interface PastTrip {
  id: string;
  date: string;
  rideType: RideType;
  origin: string;
  destination: string;
  distanceKm: number;
  durationMin: number;
  farePaid: number;
  paymentMethod: string;
  driverName: string;
  driverPhoto: string;
  driverRating: number;
  vehicle: string;
  plate: string;
  userRatingGiven?: number;
  userReview?: string;
  coRidersCount?: number;
  co2SavedKg?: number;
  status: 'completed' | 'cancelled';
  folioFiscal: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'alert' | 'route' | 'payment';
  read: boolean;
  actionLabel?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'passenger' | 'driver' | 'system';
  text: string;
  time: string;
  isVoiceNote?: boolean;
  audioDuration?: string;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  time: string;
  options?: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  notifyOnTrip: boolean;
}
