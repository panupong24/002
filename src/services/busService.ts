import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseErrors';
import { BusTrip, Booking, PassengerInfo, ContactInfo } from '../types';
import { MOCK_TRIPS } from '../data/mockData';

const TRIPS_COLLECTION = 'trips';
const BOOKINGS_COLLECTION = 'bookings';

/**
 * Initialize / Seed Trips to Firestore if the collection is empty
 */
export async function seedInitialTripsIfEmpty(): Promise<boolean> {
  const path = TRIPS_COLLECTION;
  try {
    const tripsSnap = await getDocs(collection(db, path));
    if (tripsSnap.empty) {
      console.log('Seeding initial bus trips to Firestore...');
      for (const trip of MOCK_TRIPS) {
        const tripRef = doc(db, path, trip.id);
        await setDoc(tripRef, {
          ...trip,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Force reset/re-seed trips data with initial mock data
 */
export async function resetTripsToSeed(): Promise<void> {
  const path = TRIPS_COLLECTION;
  try {
    const snap = await getDocs(collection(db, path));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, path, d.id));
    }
    for (const trip of MOCK_TRIPS) {
      await setDoc(doc(db, path, trip.id), {
        ...trip,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Real-time listener for trips list
 */
export function subscribeToTrips(
  callback: (trips: BusTrip[]) => void,
  onError?: (err: any) => void
) {
  const path = TRIPS_COLLECTION;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const trips: BusTrip[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        trips.push({
          id: docSnap.id,
          operatorName: data.operatorName || '',
          operatorCode: data.operatorCode || '',
          busType: data.busType || '',
          busNumber: data.busNumber || '',
          fromCity: data.fromCity || '',
          fromStation: data.fromStation || '',
          toCity: data.toCity || '',
          toStation: data.toStation || '',
          departureTime: data.departureTime || '',
          arrivalTime: data.arrivalTime || '',
          duration: data.duration || '',
          distanceKm: Number(data.distanceKm) || 0,
          price: Number(data.price) || 0,
          availableSeats: Number(data.availableSeats) || 0,
          totalSeats: Number(data.totalSeats) || 36,
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          occupiedSeatIds: Array.isArray(data.occupiedSeatIds) ? data.occupiedSeatIds : [],
          rating: Number(data.rating) || 4.5,
          reviewsCount: Number(data.reviewsCount) || 0,
        });
      });
      callback(trips);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Real-time single trip subscriber (for SeatMap real-time seat lock updates)
 */
export function subscribeToTrip(
  tripId: string,
  callback: (trip: BusTrip | null) => void,
  onError?: (err: any) => void
) {
  const path = `${TRIPS_COLLECTION}/${tripId}`;
  return onSnapshot(
    doc(db, TRIPS_COLLECTION, tripId),
    (docSnap) => {
      if (!docSnap.exists()) {
        callback(null);
        return;
      }
      const data = docSnap.data();
      callback({
        id: docSnap.id,
        operatorName: data.operatorName || '',
        operatorCode: data.operatorCode || '',
        busType: data.busType || '',
        busNumber: data.busNumber || '',
        fromCity: data.fromCity || '',
        fromStation: data.fromStation || '',
        toCity: data.toCity || '',
        toStation: data.toStation || '',
        departureTime: data.departureTime || '',
        arrivalTime: data.arrivalTime || '',
        duration: data.duration || '',
        distanceKm: Number(data.distanceKm) || 0,
        price: Number(data.price) || 0,
        availableSeats: Number(data.availableSeats) || 0,
        totalSeats: Number(data.totalSeats) || 36,
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
        occupiedSeatIds: Array.isArray(data.occupiedSeatIds) ? data.occupiedSeatIds : [],
        rating: Number(data.rating) || 4.5,
        reviewsCount: Number(data.reviewsCount) || 0,
      });
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * ATOMIC BOOKING TRANSACTION (Requirement 3):
 * 1. Checks in a transaction whether any of selectedSeatIds are already in occupiedSeatIds
 * 2. If conflict, aborts and throws an explicit error
 * 3. If available, marks seats as booked atomically and writes booking document
 */
export async function bookTripAtomic(params: {
  tripId: string;
  travelDate: string;
  selectedSeats: string[];
  passengers: PassengerInfo[];
  contact: ContactInfo;
  paymentMethod: 'promptpay' | 'credit_card' | 'counter_service' | 'mobile_banking';
  basePrice: number;
  insuranceFee: number;
  serviceFee: number;
  totalPrice: number;
}): Promise<Booking> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('กรุณาเข้าสู่ระบบด้วย Google ก่อนทำรายการจอง');
  }

  const tripRef = doc(db, TRIPS_COLLECTION, params.tripId);
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const codePrefix = 'BK';
  const bookingId = `${codePrefix}-${Date.now().toString().slice(-6)}-${randomNum}`;
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);

  try {
    const resultBooking = await runTransaction(db, async (transaction) => {
      const tripDoc = await transaction.get(tripRef);
      if (!tripDoc.exists()) {
        throw new Error('ไม่พบข้อมูลรอบรถที่เลือก');
      }

      const tripData = tripDoc.data();
      const currentOccupied: string[] = tripData.occupiedSeatIds || [];

      // Check for seat conflicts
      const conflictSeats = params.selectedSeats.filter((seatId) =>
        currentOccupied.includes(seatId)
      );

      if (conflictSeats.length > 0) {
        throw new Error(
          `ที่นั่งหมายเลข ${conflictSeats.join(', ')} ถูกจองไปแล้วโดยผู้โดยสารท่านอื่น กรุณาเลือกที่นั่งใหม่`
        );
      }

      // Merge newly occupied seats
      const updatedOccupied = [...currentOccupied, ...params.selectedSeats];
      const totalSeats = Number(tripData.totalSeats) || 36;
      const updatedAvailable = Math.max(0, totalSeats - updatedOccupied.length);

      // Atomically update trip seats
      transaction.update(tripRef, {
        occupiedSeatIds: updatedOccupied,
        availableSeats: updatedAvailable,
        updatedAt: serverTimestamp(),
      });

      const fullTrip: BusTrip = {
        id: tripDoc.id,
        operatorName: tripData.operatorName,
        operatorCode: tripData.operatorCode,
        busType: tripData.busType,
        busNumber: tripData.busNumber,
        fromCity: tripData.fromCity,
        fromStation: tripData.fromStation,
        toCity: tripData.toCity,
        toStation: tripData.toStation,
        departureTime: tripData.departureTime,
        arrivalTime: tripData.arrivalTime,
        duration: tripData.duration,
        distanceKm: tripData.distanceKm,
        price: tripData.price,
        availableSeats: updatedAvailable,
        totalSeats: totalSeats,
        amenities: tripData.amenities || [],
        occupiedSeatIds: updatedOccupied,
        rating: tripData.rating || 4.8,
        reviewsCount: tripData.reviewsCount || 100,
      };

      const bookingRecord: Booking = {
        bookingId,
        userId: currentUser.uid,
        tripId: params.tripId,
        trip: fullTrip,
        travelDate: params.travelDate,
        passengers: params.passengers,
        contact: params.contact,
        selectedSeatIds: params.selectedSeats,
        basePrice: params.basePrice,
        insuranceFee: params.insuranceFee,
        serviceFee: params.serviceFee,
        totalPrice: params.totalPrice,
        paymentMethod: params.paymentMethod,
        paymentStatus: 'paid',
        bookingDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Atomically create booking record
      transaction.set(bookingRef, bookingRecord);

      return bookingRecord;
    });

    return resultBooking;
  } catch (error: any) {
    if (error?.message && error.message.includes('ถูกจองไปแล้ว')) {
      // Re-throw user-facing conflict error
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, `${BOOKINGS_COLLECTION}/${bookingId}`);
  }
}

/**
 * Real-time listener for current user's bookings
 */
export function subscribeToUserBookings(
  userId: string,
  callback: (bookings: Booking[]) => void,
  onError?: (err: any) => void
) {
  const path = BOOKINGS_COLLECTION;
  const q = query(collection(db, path), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings: Booking[] = [];
      snapshot.forEach((docSnap) => {
        bookings.push(docSnap.data() as Booking);
      });
      // Sort newest first
      bookings.sort(
        (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );
      callback(bookings);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Real-time listener for all bookings (Admin only)
 */
export function subscribeToAllBookings(
  callback: (bookings: Booking[]) => void,
  onError?: (err: any) => void
) {
  const path = BOOKINGS_COLLECTION;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const bookings: Booking[] = [];
      snapshot.forEach((docSnap) => {
        bookings.push(docSnap.data() as Booking);
      });
      bookings.sort(
        (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );
      callback(bookings);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Delete / Cancel a booking
 */
export async function deleteBooking(bookingId: string): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${bookingId}`;
  try {
    await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Admin: Add new Bus Trip
 */
export async function addTrip(tripData: Omit<BusTrip, 'id'>): Promise<string> {
  const path = TRIPS_COLLECTION;
  try {
    const newId = `TRIP-${Date.now().toString().slice(-6)}`;
    const tripRef = doc(db, path, newId);
    await setDoc(tripRef, {
      ...tripData,
      id: newId,
      availableSeats: tripData.totalSeats - (tripData.occupiedSeatIds?.length || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Admin: Update Bus Trip
 */
export async function updateTrip(tripId: string, updates: Partial<BusTrip>): Promise<void> {
  const path = `${TRIPS_COLLECTION}/${tripId}`;
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    await updateDoc(tripRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Admin: Delete Bus Trip
 */
export async function deleteTrip(tripId: string): Promise<void> {
  const path = `${TRIPS_COLLECTION}/${tripId}`;
  try {
    await deleteDoc(doc(db, TRIPS_COLLECTION, tripId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
