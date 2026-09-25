export interface Province {
  id: string;
  name: string;
  region: string;
  popular?: boolean;
}

export interface BusStation {
  id: string;
  name: string;
  city: string;
  province: string;
}

export interface BusTrip {
  id: string;
  operatorName: string;
  operatorCode: string;
  busType: string; // e.g. "VIP 24", "ปรับอากาศชั้น 1 พิเศษ (ม.4 ข)", "VIP 32"
  busNumber: string;
  fromCity: string;
  fromStation: string;
  toCity: string;
  toStation: string;
  departureTime: string; // "17:30"
  arrivalTime: string;   // "07:30"
  duration: string;      // "14 ชม."
  distanceKm: number;
  price: number;
  availableSeats: number;
  totalSeats: number;
  amenities: string[];
  occupiedSeatIds: string[];
  rating: number;
  reviewsCount: number;
}

export interface SeatInfo {
  id: string;       // e.g. "1A"
  row: number;      // 1 to 10
  column: 'A' | 'B' | 'C' | 'D';
  label: string;
  type: 'standard' | 'vip' | 'front';
  price: number;
  isOccupied: boolean;
  isSelected?: boolean;
}

export interface PassengerInfo {
  seatId: string;
  title: 'นาย' | 'นาง' | 'นางสาว' | 'Mr.' | 'Ms.';
  firstName: string;
  lastName: string;
  phone: string;
  idCard: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  specialRequest?: string;
}

export interface Booking {
  bookingId: string;
  userId?: string;
  tripId?: string;
  trip: BusTrip;
  travelDate: string;
  passengers: PassengerInfo[];
  contact: ContactInfo;
  selectedSeatIds: string[];
  basePrice: number;
  insuranceFee: number;
  serviceFee: number;
  totalPrice: number;
  paymentMethod: 'promptpay' | 'credit_card' | 'counter_service' | 'mobile_banking';
  paymentStatus: 'paid' | 'pending';
  bookingDate: string;
  qrCodeUrl?: string;
  createdAt?: string;
}

export type BookingStep = 'search' | 'seat_selection' | 'passenger_info' | 'confirmation' | 'admin';
