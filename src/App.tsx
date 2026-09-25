import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { StepProgress } from './components/StepProgress';
import { SearchHero } from './components/SearchHero';
import { TripList } from './components/TripList';
import { SeatMap } from './components/SeatMap';
import { PassengerForm } from './components/PassengerForm';
import { BookingConfirmation } from './components/BookingConfirmation';
import { MyBookingsModal } from './components/MyBookingsModal';
import { AdminPanel } from './components/AdminPanel';
import { BusTrip, BookingStep, Booking, PassengerInfo, ContactInfo } from './types';
import { MOCK_TRIPS } from './data/mockData';
import {
  seedInitialTripsIfEmpty,
  subscribeToTrips,
  subscribeToUserBookings,
  bookTripAtomic,
  deleteBooking,
} from './services/busService';
import {
  Bus,
  Shield,
  Phone,
  MapPin,
  AlertCircle,
  Sliders,
  Sparkles,
  Database
} from 'lucide-react';

function BusBookingApp() {
  const { user, isAdmin, signInWithGoogle } = useAuth();

  // Navigation & Step State
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');

  // Search parameters (Default to Hat Yai - Bangkok as requested for testing)
  const [origin, setOrigin] = useState('หาดใหญ่ (สงขลา)');
  const [destination, setDestination] = useState('กรุงเทพมหานคร');
  
  // Default travel date: Tomorrow
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [passengersCount, setPassengersCount] = useState(1);

  // Firestore Trips State
  const [firestoreTrips, setFirestoreTrips] = useState<BusTrip[]>([]);
  const [isTripsLoading, setIsTripsLoading] = useState(true);

  // Booking Flow State
  const [selectedTrip, setSelectedTrip] = useState<BusTrip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // User Bookings from Firestore
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  // Modals
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Initial Seed & Subscribe to Firestore Trips
  useEffect(() => {
    let isMounted = true;

    // Check and seed if Firestore collection is empty
    seedInitialTripsIfEmpty()
      .then((seeded) => {
        if (seeded) console.log('Initialized default trips into Firestore.');
      })
      .catch((err) => console.error('Seed error:', err));

    // Subscribe to live trips collection
    const unsub = subscribeToTrips(
      (trips) => {
        if (!isMounted) return;
        setFirestoreTrips(trips);
        setIsTripsLoading(false);
      },
      (error) => {
        console.error('Trip fetch error, falling back to mock:', error);
        if (!isMounted) return;
        setFirestoreTrips(MOCK_TRIPS);
        setIsTripsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Subscribe to Current User's Bookings from Firestore
  useEffect(() => {
    if (!user) {
      setUserBookings([]);
      return;
    }

    setIsBookingsLoading(true);
    const unsub = subscribeToUserBookings(
      user.uid,
      (bookings) => {
        setUserBookings(bookings);
        setIsBookingsLoading(false);
      },
      (err) => {
        console.error('Error fetching user bookings:', err);
        setIsBookingsLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // Active pool of trips
  const activeTripsPool = firestoreTrips.length > 0 ? firestoreTrips : MOCK_TRIPS;

  // Filter trips based on origin and destination
  const matchedTrips = useMemo(() => {
    const exact = activeTripsPool.filter(
      (t) => t.fromCity === origin && t.toCity === destination
    );
    if (exact.length > 0) return exact;

    // Fallback adaptable trips if user picks a custom pair
    return activeTripsPool.slice(0, 4).map((t, idx) => ({
      ...t,
      id: `${t.id}-custom-${idx}`,
      fromCity: origin,
      toCity: destination,
    }));
  }, [activeTripsPool, origin, destination]);

  // Handle Search Click
  const handleSearch = () => {
    setCurrentStep('search');
    const el = document.getElementById('trip-results-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Select Trip
  const handleSelectTrip = (trip: BusTrip) => {
    setSelectedTrip(trip);
    setSelectedSeats([]); // reset seat selection
    setBookingError(null);
    setCurrentStep('seat_selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Toggle Seat in 2+2 layout
  const handleToggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length < passengersCount) {
        setSelectedSeats([...selectedSeats, seatId]);
      } else {
        if (passengersCount === 1) {
          setSelectedSeats([seatId]);
        } else {
          const updated = [...selectedSeats.slice(1), seatId];
          setSelectedSeats(updated);
        }
      }
    }
  };

  // Handle Proceed from Seat Map to Passenger Form
  const handleProceedToPassenger = () => {
    if (selectedSeats.length === passengersCount && selectedTrip) {
      setBookingError(null);
      setCurrentStep('passenger_info');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle Submit Booking with Firestore ATOMIC TRANSACTION (Requirement 3)
  const handleSubmitBooking = async (data: {
    passengers: PassengerInfo[];
    contact: ContactInfo;
    paymentMethod: 'promptpay' | 'credit_card' | 'counter_service' | 'mobile_banking';
    totalPrice: number;
    basePrice: number;
    insuranceFee: number;
    serviceFee: number;
  }) => {
    if (!selectedTrip) return;

    setIsSubmittingBooking(true);
    setBookingError(null);

    try {
      // Execute atomic transaction in Firestore
      const newBooking = await bookTripAtomic({
        tripId: selectedTrip.id,
        travelDate,
        selectedSeats,
        passengers: data.passengers,
        contact: data.contact,
        paymentMethod: data.paymentMethod,
        basePrice: data.basePrice,
        insuranceFee: data.insuranceFee,
        serviceFee: data.serviceFee,
        totalPrice: data.totalPrice,
      });

      setCurrentBooking(newBooking);
      setCurrentStep('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Booking transaction error:', err);
      const errMsg = err?.message || 'เกิดข้อผิดพลาดในการทำรายการจอง กรุณาลองใหม่อีกครั้ง';
      setBookingError(errMsg);

      // If the error is due to a seat conflict, bounce user back to seat selection
      if (errMsg.includes('ถูกจองไปแล้ว')) {
        setCurrentStep('seat_selection');
      }
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Handle Book Another / Reset
  const handleBookAnother = () => {
    setSelectedTrip(null);
    setSelectedSeats([]);
    setCurrentBooking(null);
    setBookingError(null);
    setCurrentStep('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Delete/Cancel Booking
  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('คุณต้องการยกเลิกตั๋วการจองนี้ใช่หรือไม่?')) return;
    try {
      await deleteBooking(bookingId);
      if (currentBooking?.bookingId === bookingId) {
        setCurrentBooking(null);
      }
    } catch (err) {
      console.error('Delete booking failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Prompt',sans-serif]">
      {/* Navbar Header with Google Auth & Admin toggle */}
      <Header
        onOpenBookings={() => setIsMyBookingsOpen(true)}
        savedBookingsCount={userBookings.length}
        onGoHome={handleBookAnother}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
      />

      {/* Booking Error Banner */}
      {bookingError && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-rose-900">ไม่สามารถทำรายการจองได้</p>
                <p className="text-rose-700 mt-0.5">{bookingError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBookingError(null)}
              className="text-rose-500 hover:text-rose-800 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Progress Steps Header */}
      <StepProgress
        currentStep={currentStep}
        canGoToSeats={!!selectedTrip}
        canGoToPassenger={!!selectedTrip && selectedSeats.length === passengersCount}
        onStepClick={(step) => {
          if (step === 'search') {
            setCurrentStep('search');
          } else if (step === 'seat_selection' && selectedTrip) {
            setCurrentStep('seat_selection');
          } else if (step === 'passenger_info' && selectedTrip && selectedSeats.length === passengersCount) {
            setCurrentStep('passenger_info');
          }
        }}
      />

      {/* Main Content Area Based on Step */}
      <main className="flex-1">
        {currentStep === 'search' && (
          <div>
            {/* Search Hero with quick buttons and Hat Yai - Bangkok sample */}
            <SearchHero
              origin={origin}
              destination={destination}
              travelDate={travelDate}
              passengersCount={passengersCount}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onDateChange={setTravelDate}
              onPassengersChange={setPassengersCount}
              onSearch={handleSearch}
            />

            {/* Trip List with live Firestore data */}
            <TripList
              trips={matchedTrips}
              origin={origin}
              destination={destination}
              travelDate={travelDate}
              passengersCount={passengersCount}
              onSelectTrip={handleSelectTrip}
            />
          </div>
        )}

        {currentStep === 'seat_selection' && selectedTrip && (
          <SeatMap
            trip={selectedTrip}
            travelDate={travelDate}
            passengersCount={passengersCount}
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
            onBack={() => setCurrentStep('search')}
            onProceed={handleProceedToPassenger}
          />
        )}

        {currentStep === 'passenger_info' && selectedTrip && (
          <PassengerForm
            trip={selectedTrip}
            travelDate={travelDate}
            selectedSeats={selectedSeats}
            onBack={() => setCurrentStep('seat_selection')}
            isSubmitting={isSubmittingBooking}
            onSubmitBooking={handleSubmitBooking}
          />
        )}

        {currentStep === 'confirmation' && currentBooking && (
          <BookingConfirmation
            booking={currentBooking}
            onBookAnother={handleBookAnother}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 sm:py-12 border-t border-slate-800 mt-12 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            {/* Col 1: Brand info */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Bus className="w-5 h-5" />
                </div>
                <span>Bus Booking</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                ระบบจองตั๋วรถทัวร์ออนไลน์อันดับหนึ่งในไทย รองรับเส้นทาง หาดใหญ่ - กรุงเทพฯ และทุกจังหวัดทั่วประเทศ
              </p>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Shield className="w-4 h-4" />
                <span>ขับเคลื่อนด้วย Firebase Firestore Real-Time</span>
              </div>
            </div>

            {/* Col 2: Popular routes */}
            <div className="space-y-2">
              <p className="text-white font-semibold text-sm">เส้นทางยอดนิยม</p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button
                    onClick={() => {
                      setOrigin('หาดใหญ่ (สงขลา)');
                      setDestination('กรุงเทพมหานคร');
                      setCurrentStep('search');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    • หาดใหญ่ ➔ กรุงเทพฯ (ยอดฮิต)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setOrigin('กรุงเทพมหานคร');
                      setDestination('หาดใหญ่ (สงขลา)');
                      setCurrentStep('search');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    • กรุงเทพฯ ➔ หาดใหญ่
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setOrigin('กรุงเทพมหานคร');
                      setDestination('เชียงใหม่');
                      setCurrentStep('search');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    • กรุงเทพฯ ➔ เชียงใหม่
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setOrigin('กรุงเทพมหานคร');
                      setDestination('ภูเก็ต');
                      setCurrentStep('search');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    • กรุงเทพฯ ➔ ภูเก็ต
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Bus Operators */}
            <div className="space-y-2">
              <p className="text-white font-semibold text-sm">พันธมิตรรถร่วมบริการ</p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>• สยามเดินรถ (Siam Dernrod)</li>
                <li>• ปิยะรุ่งเรืองทัวร์ (Piya Tour)</li>
                <li>• บขส. 999 (บริษัท ขนส่ง จำกัด)</li>
                <li>• ศรีสยามทัวร์ (Sri Siam Tour)</li>
                <li>• สุวรรณนทีขนส่ง</li>
              </ul>
            </div>

            {/* Col 4: Contact & Support */}
            <div className="space-y-2">
              <p className="text-white font-semibold text-sm">ช่วยเหลือ & ติดต่อ</p>
              <div className="space-y-1.5 text-xs text-slate-400">
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Call Center: 1690 หรือ 02-123-4567</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>สายด่วนบริการ 24 ชั่วโมง ทุกวัน</span>
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminPanelOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>จัดการระบบ / ผู้ดูแลระบบ (Admin)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Bus Booking Thailand. สงวนลิขสิทธิ์ทุกประการ</p>
            <p className="flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-500" />
              <span>ผังที่นั่ง 2+2 ปลอดภัยด้วย Firebase Firestore Atomic Transactions</span>
            </p>
          </div>
        </div>
      </footer>

      {/* My Bookings History Modal (Connected to Firestore) */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        bookings={userBookings}
        isLoading={isBookingsLoading}
        onSelectBooking={(b) => {
          setCurrentBooking(b);
          setCurrentStep('confirmation');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDeleteBooking={handleDeleteBooking}
      />

      {/* Admin Panel Modal (Connected to Firestore & Security Rules) */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onViewBookingTicket={(b) => {
          setIsAdminPanelOpen(false);
          setCurrentBooking(b);
          setCurrentStep('confirmation');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BusBookingApp />
    </AuthProvider>
  );
}
