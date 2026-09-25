import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Printer,
  Share2,
  Download,
  Calendar,
  Clock,
  MapPin,
  Bus,
  Armchair,
  User,
  Phone,
  Mail,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Ticket
} from 'lucide-react';
import { Booking } from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';

interface BookingConfirmationProps {
  booking: Booking;
  onBookAnother: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  onBookAnother,
}) => {
  useEffect(() => {
    // Trigger celebratory confetti on confirmation
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#38bdf8', '#fbbf24', '#34d399', '#6366f1'],
      });
    } catch {
      // Confetti fallback safely
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `ตั๋วรถทัวร์ Bus Booking #${booking.bookingId}`,
        text: `ตั๋วโดยสาร ${booking.trip.fromCity} ไป ${booking.trip.toCity} วันที่ ${booking.travelDate} ที่นั่ง ${booking.selectedSeatIds.join(', ')}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `ตั๋วรถทัวร์ Bus Booking #${booking.bookingId}\nเส้นทาง: ${booking.trip.fromCity} ➔ ${booking.trip.toCity}\nวันที่: ${booking.travelDate} เวลา: ${booking.trip.departureTime} น.\nที่นั่ง: ${booking.selectedSeatIds.join(', ')}`
      );
      alert('คัดลอกรายละเอียดตั๋วโดยสารเรียบร้อยแล้ว');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top success alert */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border-4 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>การจองตั๋วสำเร็จแล้ว (ชำระเงินเรียบร้อย)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          ขอบคุณสำหรับการจองกับ Bus Booking
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          เราได้ส่งข้อมูลบัตรโดยสาร E-Ticket และใบเสร็จรับเงินไปยัง <strong className="text-slate-800">{booking.contact.email}</strong> และ SMS เรียบร้อยแล้ว
        </p>

        {/* Action buttons (Print, Share, Book another) */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>พิมพ์ตั๋ว / บันทึกเป็น PDF</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>แชร์ตั๋วโดยสาร</span>
          </button>

          <button
            type="button"
            onClick={onBookAnother}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>จองเที่ยวรถใหม่อีกครั้ง</span>
          </button>
        </div>
      </div>

      {/* E-Ticket Card Layout */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border">
        
        {/* Ticket Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 sm:p-7 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <Ticket className="w-6 h-6 text-sky-300" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-widest text-blue-200 font-semibold block">
                  บัตรโดยสารอิเล็กทรอนิกส์ (E-TICKET)
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-['Prompt']">
                  {booking.trip.operatorName}
                </h3>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-blue-200 block">รหัสการจอง (Booking ID)</span>
              <span className="text-lg sm:text-xl font-mono font-black text-amber-300 tracking-wider">
                #{booking.bookingId}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Journey Path & Timing */}
          <div className="md:col-span-8 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {/* Origin */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">สถานีต้นทาง</span>
                <span className="text-base sm:text-lg font-extrabold text-blue-900 block">
                  {booking.trip.fromCity}
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  {booking.trip.fromStation}
                </p>
                <div className="mt-2 text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>เวลาออก: {booking.trip.departureTime} น.</span>
                </div>
              </div>

              {/* Destination */}
              <div className="pt-3 sm:pt-0 sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="text-[11px] text-slate-400 block mb-0.5">สถานีปลายทาง</span>
                <span className="text-base sm:text-lg font-extrabold text-slate-900 block">
                  {booking.trip.toCity}
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  {booking.trip.toStation}
                </p>
                <div className="mt-2 text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>เวลาถึงโดยประมาณ: {booking.trip.arrivalTime} น.</span>
                </div>
              </div>
            </div>

            {/* Travel Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">วันที่เดินทาง</span>
                <span className="font-bold text-slate-800">{booking.travelDate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">ประเภทรถ</span>
                <span className="font-bold text-slate-800 truncate block">{booking.trip.busType}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">เบอร์รถ / ชานชาลา</span>
                <span className="font-bold text-slate-800">สาย {booking.trip.busNumber}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-blue-700 block text-[11px]">ที่นั่ง (ผัง 2+2)</span>
                <span className="font-extrabold text-blue-900 text-sm">
                  {booking.selectedSeatIds.join(', ')}
                </span>
              </div>
            </div>

            {/* Passengers List */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                รายชื่อผู้โดยสารบนตั๋ว
              </h4>
              <div className="space-y-1.5">
                {booking.passengers.map((p, idx) => (
                  <div
                    key={p.seatId}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                        {p.seatId}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {p.title} {p.firstName} {p.lastName}
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {p.idCard ? `ID: ${p.idCard.slice(0, 3)}-xxxx-${p.idCard.slice(-3)}` : 'มีประกันภัย'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Boarding QR Code & Price */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-700 mb-2">
              สแกน QR เพื่อขึ้นรถ
            </span>
            
            <QRCodeDisplay code={booking.bookingId} size={150} />

            <p className="text-[11px] text-slate-500 mt-2">
              แสดง QR นี้แก่พนักงานก่อนขึ้นรถ ณ ชานชาลา
            </p>

            <div className="w-full mt-4 pt-4 border-t border-slate-200">
              <span className="text-[11px] text-slate-400 block">ยอดชำระเงินทั้งหมด</span>
              <span className="text-xl font-extrabold text-blue-800">
                ฿{booking.totalPrice.toLocaleString()}
              </span>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                ชำระแล้วผ่าน {booking.paymentMethod === 'promptpay' ? 'PromptPay พร้อมเพย์' : 'ระบบออนไลน์'}
              </p>
            </div>
          </div>

        </div>

        {/* Ticket Footer / Rules Notice */}
        <div className="bg-slate-100/70 p-4 sm:p-5 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              กรุณาเดินทางถึงสถานีขนส่งก่อนเวลาออกเดินทางอย่างน้อย <strong>30 นาที</strong>
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            จองเมื่อ {new Date(booking.bookedAt).toLocaleString('th-TH')}
          </span>
        </div>

      </div>
    </div>
  );
};
