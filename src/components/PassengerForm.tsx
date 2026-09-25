import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  CreditCard,
  QrCode,
  Building,
  Store,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight,
  AlertCircle,
  LogIn
} from 'lucide-react';
import { BusTrip, PassengerInfo, ContactInfo } from '../types';
import { useAuth } from '../context/AuthContext';

interface PassengerFormProps {
  trip: BusTrip;
  travelDate: string;
  selectedSeats: string[];
  onBack: () => void;
  isSubmitting?: boolean;
  onSubmitBooking: (data: {
    passengers: PassengerInfo[];
    contact: ContactInfo;
    paymentMethod: 'promptpay' | 'credit_card' | 'counter_service' | 'mobile_banking';
    totalPrice: number;
    basePrice: number;
    insuranceFee: number;
    serviceFee: number;
  }) => void;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({
  trip,
  travelDate,
  selectedSeats,
  onBack,
  isSubmitting = false,
  onSubmitBooking,
}) => {
  const { user, signInWithGoogle } = useAuth();

  // Initialize passenger list based on selected seats
  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    selectedSeats.map((seatId, idx) => ({
      seatId,
      title: 'นาย',
      firstName: idx === 0 ? (user?.displayName?.split(' ')[0] || 'สมชาย') : '',
      lastName: idx === 0 ? (user?.displayName?.split(' ').slice(1).join(' ') || 'ใจดี') : '',
      phone: idx === 0 ? '0812345678' : '',
      idCard: idx === 0 ? '1100200345678' : '',
    }))
  );

  // Main Contact Info
  const [contact, setContact] = useState<ContactInfo>({
    name: user?.displayName || 'สมชาย ใจดี',
    phone: '0812345678',
    email: user?.email || 'somchai.jai@gmail.com',
    specialRequest: '',
  });

  // Update contact when user logs in
  useEffect(() => {
    if (user) {
      setContact((prev) => ({
        ...prev,
        name: prev.name === 'สมชาย ใจดี' ? (user.displayName || prev.name) : prev.name,
        email: prev.email === 'somchai.jai@gmail.com' ? (user.email || prev.email) : prev.email,
      }));
    }
  }, [user]);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'credit_card' | 'mobile_banking' | 'counter_service'>('promptpay');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Calculate pricing
  const basePrice = selectedSeats.length * trip.price;
  const insuranceFee = 0; // Free promotion
  const serviceFee = 0;   // Free promotion
  const grandTotal = basePrice + insuranceFee + serviceFee;

  const handlePassengerChange = (index: number, field: keyof PassengerInfo, val: string) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleValidateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    // Prompt Google Login if not authenticated
    if (!user) {
      try {
        await signInWithGoogle();
      } catch {
        newErrors.push('กรุณาเข้าสู่ระบบด้วย Google เพื่อยืนยันและบันทึกตั๋วของคุณ');
        setErrors(newErrors);
        return;
      }
    }

    // Check contact
    if (!contact.name.trim()) newErrors.push('กรุณาระบุชื่อผู้ติดต่อ');
    if (!contact.phone.trim()) newErrors.push('กรุณาระบุเบอร์โทรศัพท์ติดต่อ');
    if (!contact.email.trim()) newErrors.push('กรุณาระบุอีเมลเพื่อรับตั๋ว');

    // Check passengers
    passengers.forEach((p) => {
      if (!p.firstName.trim()) newErrors.push(`กรุณากรอกชื่อผู้โดยสาร ที่นั่ง ${p.seatId}`);
      if (!p.lastName.trim()) newErrors.push(`กรุณากรอกนามสกุลผู้โดยสาร ที่นั่ง ${p.seatId}`);
    });

    if (!acceptTerms) {
      newErrors.push('กรุณายอมรับเงื่อนไขและข้อกำหนดการเดินทาง');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setErrors([]);
    onSubmitBooking({
      passengers,
      contact,
      paymentMethod,
      totalPrice: grandTotal,
      basePrice,
      insuranceFee,
      serviceFee,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ย้อนกลับไปเปลี่ยนที่นั่ง</span>
      </button>

      {/* Errors alert */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>กรุณาตรวจสอบข้อมูลต่อไปนี้:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Auth Banner */}
      {user ? (
        <div className="mb-6 bg-blue-50/70 border border-blue-200 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-bold text-blue-950">เข้าสู่ระบบด้วย Google เรียบร้อยแล้ว</p>
              <p className="text-[11px] text-blue-700">{user.email}</p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-700 bg-emerald-100 font-bold px-3 py-1 rounded-full self-start sm:self-center">
            ✓ บันทึกตั๋วเข้าสู่ระบบอัตโนมัติ
          </span>
        </div>
      ) : (
        <div className="mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <p className="font-bold text-blue-950 flex items-center gap-1.5">
              <LogIn className="w-4 h-4 text-blue-600" />
              <span>เข้าสู่ระบบด้วย Google เพื่อบันทึกตั๋ว</span>
            </p>
            <p className="text-slate-500 text-[11px]">
              ล็อกอินง่ายๆ เพื่อติดตามสถานะ ดูตั๋ว E-Ticket และใช้บริการได้ทุกที่
            </p>
          </div>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>เข้าสู่ระบบ Google</span>
          </button>
        </div>
      )}

      <form onSubmit={handleValidateAndSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Passenger Details & Payment Methods */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Contact Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>ข้อมูลผู้ติดต่อ (รับ E-Ticket & SMS)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อ-นามสกุล ผู้ติดต่อ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายสมชาย ใจดี"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>เบอร์โทรศัพท์มือถือ</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08X-XXX-XXXX"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>อีเมล (รับบัตรโดยสารอิเล็กทรอนิกส์ E-Ticket)</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Passenger Information Cards for Each Selected Seat */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>ข้อมูลผู้โดยสาร ({passengers.length} ท่าน)</span>
              </h3>
              <span className="text-xs text-slate-500">
                ตามจำนวนที่นั่งที่เลือก
              </span>
            </div>

            <div className="space-y-6">
              {passengers.map((passenger, index) => (
                <div
                  key={passenger.seatId}
                  className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200 relative"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {passenger.seatId}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        ผู้โดยสารคนที่ {index + 1} (ที่นั่ง {passenger.seatId})
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded-full font-medium">
                      รถทัวร์ 2+2
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Title */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        คำนำหน้า
                      </label>
                      <select
                        value={passenger.title}
                        onChange={(e) => handlePassengerChange(index, 'title', e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="นาย">นาย (Mr.)</option>
                        <option value="นาง">นาง (Mrs.)</option>
                        <option value="นางสาว">นางสาว (Miss)</option>
                      </select>
                    </div>

                    {/* First Name */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        ชื่อจริง <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ชื่อจริง"
                        value={passenger.firstName}
                        onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        นามสกุล <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="นามสกุล"
                        value={passenger.lastName}
                        onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* ID Card */}
                    <div className="sm:col-span-7">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        เลขประจำตัวประชาชน / หนังสือเดินทาง (สำหรับประกันภัย)
                      </label>
                      <input
                        type="text"
                        placeholder="13 หลัก (เช่น 1100200345678)"
                        value={passenger.idCard}
                        onChange={(e) => handlePassengerChange(index, 'idCard', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    {/* Phone */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        เบอร์โทรศัพท์ผู้โดยสาร
                      </label>
                      <input
                        type="tel"
                        placeholder="08X-XXX-XXXX"
                        value={passenger.phone}
                        onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>ช่องทางการชำระเงิน</span>
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> ชำระปลอดภัย 256-bit
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PromptPay */}
              <label
                className={`relative flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'promptpay'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="promptpay"
                  checked={paymentMethod === 'promptpay'}
                  onChange={() => setPaymentMethod('promptpay')}
                  className="sr-only"
                />
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold">พร้อมเพย์ (PromptPay QR)</p>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 rounded">
                      แนะนำ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    สแกน QR ผ่านทุกแอปธนาคาร ไม่มีค่าธรรมเนียม
                  </p>
                </div>
              </label>

              {/* Credit/Debit Card */}
              <label
                className={`relative flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={paymentMethod === 'credit_card'}
                  onChange={() => setPaymentMethod('credit_card')}
                  className="sr-only"
                />
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold">บัตรเครดิต / เดบิต</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Visa, Mastercard, JCB, UnionPay
                  </p>
                </div>
              </label>

              {/* Mobile Banking */}
              <label
                className={`relative flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'mobile_banking'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mobile_banking"
                  checked={paymentMethod === 'mobile_banking'}
                  onChange={() => setPaymentMethod('mobile_banking')}
                  className="sr-only"
                />
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Building className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold">โมบายแบงก์กิ้ง</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    K PLUS, SCB EASY, Krungthai NEXT
                  </p>
                </div>
              </label>

              {/* Counter Service */}
              <label
                className={`relative flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'counter_service'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="counter_service"
                  checked={paymentMethod === 'counter_service'}
                  onChange={() => setPaymentMethod('counter_service')}
                  className="sr-only"
                />
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold">เคาน์เตอร์เซอร์วิส</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    7-Eleven, Big C, Lotus ชำระด้วยบาร์โค้ด
                  </p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Confirmation Box */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md sticky top-24">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              สรุปรายการจองตั๋ว
            </h3>

            {/* Trip brief */}
            <div className="space-y-2.5 pb-4 border-b border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 text-sm">{trip.operatorName}</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px]">
                  {trip.busType}
                </span>
              </div>

              <div className="text-slate-600 space-y-1">
                <p>
                  <strong>เส้นทาง:</strong> {trip.fromCity} ➔ {trip.toCity}
                </p>
                <p>
                  <strong>วันเดินทาง:</strong> {travelDate}
                </p>
                <p>
                  <strong>เวลาออก:</strong> {trip.departureTime} น. (ถึง {trip.arrivalTime} น.)
                </p>
                <p>
                  <strong>ที่นั่งที่เลือก ({selectedSeats.length} ที่):</strong>{' '}
                  <span className="text-blue-700 font-bold font-mono">
                    {selectedSeats.join(', ')}
                  </span>
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="py-4 border-b border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>ค่าโดยสาร ({selectedSeats.length} ที่นั่ง):</span>
                <span className="font-semibold text-slate-800">฿{basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>ประกันอุบัติเหตุคุ้มครองการเดินทาง:</span>
                <span className="font-semibold">ฟรี (0฿)</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>ค่าธรรมเนียมการออกตั๋วออนไลน์:</span>
                <span className="font-semibold">ฟรี (0฿)</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="py-4">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-xs text-slate-500 block">ยอดชำระสุทธิ</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                    ฿{grandTotal.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">ราคารวมภาษีแล้ว</span>
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-2 text-xs text-slate-600 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>
                  ฉันยอมรับเงื่อนไขการเดินทางและนโยบายความเป็นส่วนตัวของ Bus Booking
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                id="submit-booking-btn"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>กำลังจองและบันทึกข้อมูล (Atomic Transaction)...</span>
                  </>
                ) : (
                  <>
                    <span>ยืนยันการจองและชำระเงิน</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Safe reassurance */}
            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>ออกบัตรโดยสาร E-Ticket ทันทีหลังยืนยัน</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
