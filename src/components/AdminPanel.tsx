import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Bus,
  Ticket,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Users,
  DollarSign,
  ArrowRight,
  Clock,
  MapPin,
  X,
  Check,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BusTrip, Booking } from '../types';
import {
  subscribeToTrips,
  subscribeToAllBookings,
  addTrip,
  updateTrip,
  deleteTrip,
  resetTripsToSeed,
  deleteBooking,
} from '../services/busService';
import { ADMIN_EMAIL } from '../lib/firebase';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onViewBookingTicket: (booking: Booking) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onViewBookingTicket,
}) => {
  const { user, isAdmin, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'trips' | 'bookings'>('trips');

  // Real-time Firestore data
  const [trips, setTrips] = useState<BusTrip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & filter
  const [tripSearch, setTripSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  // Modal for Add/Edit Trip
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<BusTrip | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    operatorName: 'สยามเดินรถ',
    operatorCode: 'SDR',
    busType: 'VIP 24 ที่นั่งพิเศษ',
    busNumber: '992-9',
    fromCity: 'หาดใหญ่ (สงขลา)',
    fromStation: 'สถานีขนส่งผู้โดยสาร อ.หาดใหญ่ แห่งที่ 1 (เปิดท้าย)',
    toCity: 'กรุงเทพมหานคร',
    toStation: 'สถานีขนส่งผู้โดยสารกรุงเทพฯ (สายใต้ใหม่ ถนนบรมราชชนนี)',
    departureTime: '18:00',
    arrivalTime: '08:00',
    duration: '14 ชม. 00 นาที',
    distanceKm: 940,
    price: 990,
    totalSeats: 36,
    amenities: 'Wi-Fi ฟรี, ปลั๊กชาร์จ USB, เบาะนวดไฟฟ้า, ผ้าห่ม, ห้องสุขาบนรถ',
  });

  // Subscribe to Trips and Bookings
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const unsubTrips = subscribeToTrips(
      (data) => {
        setTrips(data);
        setIsLoading(false);
      },
      (err) => {
        console.error('Trips subscription error:', err);
        setIsLoading(false);
      }
    );

    let unsubBookings = () => {};
    if (isAdmin) {
      unsubBookings = subscribeToAllBookings(
        (data) => setBookings(data),
        (err) => console.error('Bookings subscription error:', err)
      );
    }

    return () => {
      unsubTrips();
      unsubBookings();
    };
  }, [isOpen, isAdmin]);

  // Flash action message
  const showNotice = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingTrip(null);
    setFormData({
      operatorName: 'สยามเดินรถ',
      operatorCode: 'SDR',
      busType: 'VIP 24 ที่นั่งพิเศษ',
      busNumber: `992-${Math.floor(10 + Math.random() * 90)}`,
      fromCity: 'หาดใหญ่ (สงขลา)',
      fromStation: 'สถานีขนส่งผู้โดยสาร อ.หาดใหญ่ แห่งที่ 1 (เปิดท้าย)',
      toCity: 'กรุงเทพมหานคร',
      toStation: 'สถานีขนส่งผู้โดยสารกรุงเทพฯ (สายใต้ใหม่ ถนนบรมราชชนนี)',
      departureTime: '18:00',
      arrivalTime: '08:00',
      duration: '14 ชม. 00 นาที',
      distanceKm: 940,
      price: 950,
      totalSeats: 36,
      amenities: 'Wi-Fi ฟรี, ปลั๊กชาร์จ USB, ผ้าห่ม, น้ำดื่ม, ห้องสุขาบนรถ',
    });
    setIsTripModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (trip: BusTrip) => {
    setEditingTrip(trip);
    setFormData({
      operatorName: trip.operatorName,
      operatorCode: trip.operatorCode,
      busType: trip.busType,
      busNumber: trip.busNumber,
      fromCity: trip.fromCity,
      fromStation: trip.fromStation,
      toCity: trip.toCity,
      toStation: trip.toStation,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      duration: trip.duration,
      distanceKm: trip.distanceKm,
      price: trip.price,
      totalSeats: trip.totalSeats,
      amenities: trip.amenities.join(', '),
    });
    setIsTripModalOpen(true);
  };

  // Save Add/Edit Trip
  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const amenitiesList = formData.amenities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingTrip) {
        // Update
        await updateTrip(editingTrip.id, {
          operatorName: formData.operatorName,
          operatorCode: formData.operatorCode,
          busType: formData.busType,
          busNumber: formData.busNumber,
          fromCity: formData.fromCity,
          fromStation: formData.fromStation,
          toCity: formData.toCity,
          toStation: formData.toStation,
          departureTime: formData.departureTime,
          arrivalTime: formData.arrivalTime,
          duration: formData.duration,
          distanceKm: Number(formData.distanceKm),
          price: Number(formData.price),
          totalSeats: Number(formData.totalSeats),
          amenities: amenitiesList,
        });
        showNotice('success', `อัปเดตรอบรถ ${formData.busNumber} สำเร็จแล้ว`);
      } else {
        // Add
        await addTrip({
          operatorName: formData.operatorName,
          operatorCode: formData.operatorCode,
          busType: formData.busType,
          busNumber: formData.busNumber,
          fromCity: formData.fromCity,
          fromStation: formData.fromStation,
          toCity: formData.toCity,
          toStation: formData.toStation,
          departureTime: formData.departureTime,
          arrivalTime: formData.arrivalTime,
          duration: formData.duration,
          distanceKm: Number(formData.distanceKm),
          price: Number(formData.price),
          availableSeats: Number(formData.totalSeats),
          totalSeats: Number(formData.totalSeats),
          amenities: amenitiesList,
          occupiedSeatIds: [],
          rating: 4.8,
          reviewsCount: 1,
        });
        showNotice('success', `เพิ่มรอบรถใหม่ ${formData.busNumber} สำเร็จแล้ว`);
      }
      setIsTripModalOpen(false);
    } catch (err: any) {
      showNotice('error', err.message || 'บันทึกรอบรถไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Trip
  const handleDeleteTrip = async (tripId: string, busNumber: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรอบรถหมายเลข ${busNumber}?`)) {
      return;
    }
    try {
      await deleteTrip(tripId);
      showNotice('success', `ลบรอบรถ ${busNumber} สำเร็จแล้ว`);
    } catch (err: any) {
      showNotice('error', err.message || 'ไม่สามารถลบรอบรถได้');
    }
  };

  // Reset to Seed
  const handleResetSeed = async () => {
    if (
      !window.confirm(
        'ต้องการรีเซ็ตข้อมูลรอบรถทั้งหมดกลับไปเป็นข้อมูลตัวอย่างตั้งต้น (หาดใหญ่ - กรุงเทพฯ) หรือไม่?'
      )
    ) {
      return;
    }
    setIsLoading(true);
    try {
      await resetTripsToSeed();
      showNotice('success', 'รีเซ็ตข้อมูลรอบรถตัวอย่างสำเร็จแล้ว');
    } catch (err: any) {
      showNotice('error', err.message || 'รีเซ็ตข้อมูลไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel Booking
  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm(`ต้องการยกเลิกและลบการจองรหัส #${bookingId} หรือไม่?`)) {
      return;
    }
    try {
      await deleteBooking(bookingId);
      showNotice('success', `ลบการจอง #${bookingId} เรียบร้อยแล้ว`);
    } catch (err: any) {
      showNotice('error', err.message || 'ไม่สามารถลบการจองได้');
    }
  };

  if (!isOpen) return null;

  // Filtered trips
  const filteredTrips = trips.filter((t) => {
    const q = tripSearch.toLowerCase();
    return (
      t.operatorName.toLowerCase().includes(q) ||
      t.busNumber.toLowerCase().includes(q) ||
      t.fromCity.toLowerCase().includes(q) ||
      t.toCity.toLowerCase().includes(q)
    );
  });

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const q = bookingSearch.toLowerCase();
    return (
      b.bookingId.toLowerCase().includes(q) ||
      b.contact.name.toLowerCase().includes(q) ||
      b.contact.phone.includes(q) ||
      b.trip.operatorName.toLowerCase().includes(q) ||
      b.trip.fromCity.toLowerCase().includes(q)
    );
  });

  // Stats calculation
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalBookedSeats = bookings.reduce((sum, b) => sum + (b.selectedSeatIds?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:px-8 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  แผงควบคุมระบบ (Admin Control Center)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 uppercase tracking-wider">
                  Admin Mode
                </span>
              </div>
              <p className="text-xs text-blue-200">
                จัดการรอบเดินรถ ที่นั่ง และตรวจสอบรายการจองทั้งหมดในระบบแบบเรียลไทม์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้าผู้โดยสาร</span>
            </button>
          </div>
        </div>

        {/* Admin Access Check */}
        {!isAdmin ? (
          <div className="p-8 sm:p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              พื้นที่เฉพาะผู้ดูแลระบบ (Admin Access Required)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              ระบบตรวจสอบพบว่าบัญชีของคุณปัจจุบันไม่ได้รับสิทธิ์ผู้ดูแลระบบ
              กรุณาเข้าสู่ระบบด้วยบัญชี Google ที่ได้รับสิทธิ์ ({ADMIN_EMAIL}) เพื่อดำเนินการ
            </p>
            {user ? (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 mb-4 text-left">
                <p><strong>ผู้ใช้ปัจจุบัน:</strong> {user.displayName || 'Google User'}</p>
                <p><strong>อีเมล:</strong> {user.email}</p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              <span>เข้าสู่ระบบด้วย Google Admin</span>
            </button>
          </div>
        ) : (
          <>
            {/* Notice Alert Banner */}
            {actionMessage && (
              <div
                className={`mx-6 mt-4 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in ${
                  actionMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <span>{actionMessage.text}</span>
                <button
                  type="button"
                  onClick={() => setActionMessage(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Stats Overview */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/60">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">รอบรถทั้งหมด</span>
                    <Bus className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{trips.length}</p>
                  <p className="text-[11px] text-blue-600 mt-0.5">ในฐานข้อมูล Firestore</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">รายการจอง</span>
                    <Ticket className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">ตั๋วที่ทำรายการแล้ว</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">ที่นั่งที่ถูกจอง</span>
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{totalBookedSeats}</p>
                  <p className="text-[11px] text-indigo-600 mt-0.5">ที่นั่งแบบ 2+2</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">ยอดรายได้รวม</span>
                    <DollarSign className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    ฿{totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-amber-600 mt-0.5">จากระบบตั๋วทั้งหมด</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 pt-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('trips')}
                  className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'trips'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Bus className="w-4 h-4" />
                  <span>จัดการรอบรถ ({trips.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('bookings')}
                  className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'bookings'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>รายการจองทั้งหมด ({bookings.length})</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pb-2">
                {activeTab === 'trips' && (
                  <>
                    <button
                      type="button"
                      onClick={handleResetSeed}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="รีเซ็ตและใส่ข้อมูลตัวอย่าง หาดใหญ่ - กรุงเทพฯ"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">รีเซ็ตข้อมูลตัวอย่าง</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenCreateModal}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>เพิ่มรอบรถใหม่</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tab 1: Manage Trips */}
            {activeTab === 'trips' && (
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={tripSearch}
                    onChange={(e) => setTripSearch(e.target.value)}
                    placeholder="ค้นหาตามชื่อบริษัท, เบอร์รถ, จังหวัด..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    กำลังโหลดข้อมูลรอบรถจาก Firestore...
                  </div>
                ) : filteredTrips.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p className="font-bold">ไม่พบรอบรถตามเงื่อนไขที่ค้นหา</p>
                    <button
                      type="button"
                      onClick={handleResetSeed}
                      className="mt-3 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
                    >
                      โหลดข้อมูลตัวอย่าง (หาดใหญ่ - กรุงเทพฯ)
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {trip.operatorName}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px] font-bold">
                                {trip.busNumber}
                              </span>
                            </div>
                            <span className="text-sm font-extrabold text-blue-700">
                              ฿{trip.price.toLocaleString()}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 font-medium">
                            {trip.busType}
                          </div>

                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 pt-1">
                            <span className="truncate">{trip.fromCity}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{trip.toCity}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div>
                              <p className="text-slate-400">เวลาเดินทาง:</p>
                              <p className="font-semibold text-slate-700">
                                {trip.departureTime} น. - {trip.arrivalTime} น.
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">ที่นั่งว่าง / ทั้งหมด:</p>
                              <p className="font-semibold text-emerald-700">
                                {trip.availableSeats} / {trip.totalSeats} ที่นั่ง
                              </p>
                            </div>
                          </div>

                          {trip.occupiedSeatIds.length > 0 && (
                            <div className="text-[11px] text-slate-500">
                              <span className="font-semibold text-slate-700">ที่นั่งที่จองแล้ว: </span>
                              <span className="font-mono text-blue-800">
                                {trip.occupiedSeatIds.slice(0, 10).join(', ')}
                                {trip.occupiedSeatIds.length > 10 ? ` และอีก ${trip.occupiedSeatIds.length - 10} ที่นั่ง` : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(trip)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTrip(trip.id, trip.busNumber)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ลบ</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: All Bookings */}
            {activeTab === 'bookings' && (
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="ค้นหาตามรหัสตั๋ว, ชื่อผู้โดยสาร, เบอร์โทร..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p className="font-bold">ยังไม่มีรายการจองตั๋วในระบบ</p>
                    <p className="text-xs text-slate-400 mt-1">
                      เมื่อผู้โดยสารทำรายการจองผ่านหน้าเว็บ จะแสดงรายการที่นี่ทันที
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map((b) => (
                      <div
                        key={b.bookingId}
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              #{b.bookingId}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {b.trip.operatorName}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              ({b.trip.busType})
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                              ชำระเงินสำเร็จ
                            </span>
                          </div>

                          <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span>{b.trip.fromCity}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                            <span>{b.trip.toCity}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                            <div>
                              <p className="text-slate-400 text-[11px]">ผู้ติดต่อ:</p>
                              <p className="font-semibold text-slate-800">{b.contact.name}</p>
                              <p className="text-[11px] text-slate-500">{b.contact.phone}</p>
                            </div>

                            <div>
                              <p className="text-slate-400 text-[11px]">วันและเวลาออก:</p>
                              <p className="font-semibold text-slate-800">
                                {b.travelDate} ({b.trip.departureTime} น.)
                              </p>
                              <p className="text-[11px] text-blue-700 font-bold">
                                ที่นั่ง: {b.selectedSeatIds.join(', ')} ({b.selectedSeatIds.length} ที่นั่ง)
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-400 text-[11px]">ยอดชำระ:</p>
                              <p className="font-bold text-blue-700 text-sm">
                                ฿{b.totalPrice.toLocaleString()}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                วิธีชำระ: {b.paymentMethod}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => onViewBookingTicket(b)}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>ดูตั๋ว</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(b.bookingId)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="ยกเลิก/ลบการจอง"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>

      {/* Modal: Add / Edit Trip */}
      {isTripModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-900 text-white">
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-sky-300" />
                <h3 className="font-bold text-base">
                  {editingTrip ? 'แก้ไขข้อมูลรอบรถ' : 'เพิ่มรอบเดินรถใหม่'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTripModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTrip} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อบริษัทเดินรถ *</label>
                  <input
                    type="text"
                    required
                    value={formData.operatorName}
                    onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">รหัสบริษัท (Operator Code) *</label>
                  <input
                    type="text"
                    required
                    value={formData.operatorCode}
                    onChange={(e) => setFormData({ ...formData, operatorCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ประเภทรถ *</label>
                  <input
                    type="text"
                    required
                    value={formData.busType}
                    onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">หมายเลขรถ / ทะเบียน *</label>
                  <input
                    type="text"
                    required
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เมือง/จังหวัดต้นทาง *</label>
                  <input
                    type="text"
                    required
                    value={formData.fromCity}
                    onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">สถานีต้นทาง *</label>
                  <input
                    type="text"
                    required
                    value={formData.fromStation}
                    onChange={(e) => setFormData({ ...formData, fromStation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เมือง/จังหวัดปลายทาง *</label>
                  <input
                    type="text"
                    required
                    value={formData.toCity}
                    onChange={(e) => setFormData({ ...formData, toCity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">สถานีปลายทาง *</label>
                  <input
                    type="text"
                    required
                    value={formData.toStation}
                    onChange={(e) => setFormData({ ...formData, toStation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เวลาออก (เช่น 18:00) *</label>
                  <input
                    type="text"
                    required
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เวลาถึง (เช่น 08:00) *</label>
                  <input
                    type="text"
                    required
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ระยะเวลาเดินทาง (เช่น 14 ชม.) *</label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ราคาตั๋ว (บาท) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">จำนวนที่นั่งรวม (ผัง 2+2 เช่น 36) *</label>
                  <input
                    type="number"
                    required
                    min="12"
                    max="60"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ระยะทาง (กม.) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">สิ่งอำนวยความสะดวก (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Wi-Fi ฟรี, ปลั๊กชาร์จ USB, เบาะนวด, ผ้าห่ม, ห้องสุขาบนรถ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTripModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : editingTrip ? 'บันทึกการแก้ไข' : 'เพิ่มรอบรถ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
