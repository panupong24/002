import React, { useMemo, useState, useEffect } from 'react';
import {
  Armchair,
  ArrowLeft,
  Check,
  Info,
  ShieldCheck,
  Users,
  AlertCircle,
  HelpCircle,
  Tv,
  DoorClosed,
  ChevronRight,
  Radio
} from 'lucide-react';
import { BusTrip, SeatInfo } from '../types';
import { generateSeatLayout } from '../data/mockData';
import { subscribeToTrip } from '../services/busService';

interface SeatMapProps {
  trip: BusTrip;
  travelDate: string;
  passengersCount: number;
  selectedSeats: string[];
  onToggleSeat: (seatId: string) => void;
  onBack: () => void;
  onProceed: () => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  trip: initialTrip,
  travelDate,
  passengersCount,
  selectedSeats,
  onToggleSeat,
  onBack,
  onProceed,
}) => {
  // Live trip state synced with Firestore
  const [currentTrip, setCurrentTrip] = useState<BusTrip>(initialTrip);
  const [conflictNotice, setConflictNotice] = useState<string | null>(null);

  // Subscribe to real-time seat changes from Firestore
  useEffect(() => {
    const unsub = subscribeToTrip(initialTrip.id, (updatedTrip) => {
      if (!updatedTrip) return;
      setCurrentTrip(updatedTrip);

      // Check if any of user's selected seats were booked by someone else
      const newlyOccupied = selectedSeats.filter((seatId) =>
        updatedTrip.occupiedSeatIds.includes(seatId)
      );

      if (newlyOccupied.length > 0) {
        setConflictNotice(
          `ที่นั่งหมายเลข ${newlyOccupied.join(', ')} ถูกจองไปแล้วโดยผู้โดยสารท่านอื่น ระบบได้ยกเลิกที่นั่งดังกล่าว กรุณาเลือกที่นั่งใหม่`
        );
        newlyOccupied.forEach((seatId) => {
          onToggleSeat(seatId); // deselect
        });
      }
    });

    return () => unsub();
  }, [initialTrip.id, selectedSeats, onToggleSeat]);

  // Generate seats based on live trip state
  const seats: SeatInfo[] = useMemo(() => {
    return generateSeatLayout(currentTrip);
  }, [currentTrip]);

  // Group seats by row (1 to 9)
  const rows = useMemo(() => {
    const rowMap = new Map<number, { A?: SeatInfo; B?: SeatInfo; C?: SeatInfo; D?: SeatInfo }>();
    seats.forEach((seat) => {
      if (!rowMap.has(seat.row)) {
        rowMap.set(seat.row, {});
      }
      const r = rowMap.get(seat.row)!;
      r[seat.column] = seat;
    });
    return Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [seats]);

  // Calculate total price of selected seats
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seatId) => {
      const s = seats.find((seat) => seat.id === seatId);
      return sum + (s ? s.price : currentTrip.price);
    }, 0);
  }, [selectedSeats, seats, currentTrip.price]);

  const isSelectionComplete = selectedSeats.length === passengersCount;

  // Render a single seat item
  const renderSeat = (seat?: SeatInfo) => {
    if (!seat) return <div className="w-11 h-11 sm:w-13 sm:h-13" />;

    const isSelected = selectedSeats.includes(seat.id);
    const isOccupied = seat.isOccupied;

    let buttonClass = 'relative flex flex-col items-center justify-center transition-all duration-150 rounded-xl font-bold ';

    if (isOccupied) {
      buttonClass += 'bg-slate-200/80 border border-slate-300/80 text-slate-400 cursor-not-allowed';
    } else if (isSelected) {
      buttonClass += 'bg-blue-600 border-2 border-blue-700 text-white shadow-md shadow-blue-500/30 scale-105 cursor-pointer ring-2 ring-blue-300';
    } else {
      buttonClass += 'bg-white hover:bg-blue-50 border-2 border-blue-200/90 text-blue-900 hover:border-blue-500 cursor-pointer shadow-2xs hover:scale-105';
    }

    return (
      <button
        key={seat.id}
        type="button"
        id={`seat-${seat.id}`}
        disabled={isOccupied}
        onClick={() => onToggleSeat(seat.id)}
        className={`w-11 h-11 sm:w-13 sm:h-13 ${buttonClass}`}
        title={`ที่นั่ง ${seat.id} - ฿${seat.price.toLocaleString()} ${isOccupied ? '(จองแล้ว)' : '(ว่าง)'}`}
        aria-label={`ที่นั่ง ${seat.id} ราคา ${seat.price} บาท ${isOccupied ? 'จองแล้ว' : 'ว่าง'}`}
      >
        <span className="text-[11px] sm:text-xs tracking-tight">
          {seat.id}
        </span>
        
        {isSelected ? (
          <Check className="w-3 h-3 text-white mt-0.5" />
        ) : isOccupied ? (
          <span className="text-[9px] text-slate-400 font-normal">เต็ม</span>
        ) : (
          <Armchair className="w-3 h-3 text-blue-400 mt-0.5" />
        )}

        {/* Small badge for front row */}
        {seat.type === 'front' && !isOccupied && !isSelected && (
          <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-amber-400 text-amber-950 text-[8px] font-extrabold rounded-full">
            VIP
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back button & Trip header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับไปเลือกรอบรถ</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-800">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>สถานะที่นั่งเรียลไทม์ (Firestore)</span>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-800">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>ต้องการเลือก: {passengersCount} ที่นั่ง (เลือกแล้ว {selectedSeats.length}/{passengersCount})</span>
          </div>
        </div>
      </div>

      {/* Conflict Notice Alert */}
      {conflictNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{conflictNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setConflictNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Bus Seating Schematic (2+2 Layout) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md">
          <div className="text-center mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ผังที่นั่งรถทัวร์ 2+2
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentTrip.operatorName} • {currentTrip.busType} (เบอร์รถ {currentTrip.busNumber})
            </p>
          </div>

          {/* Seat Status Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-3 px-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-white border-2 border-blue-300 flex items-center justify-center shadow-2xs">
                <Armchair className="w-3 h-3 text-blue-500" />
              </div>
              <span className="text-slate-600 font-medium">ว่าง (เลือกได้)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-blue-900 font-bold">ที่นั่งที่คุณเลือก</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400">
                ✕
              </div>
              <span className="text-slate-400 font-medium">มีผู้โดยสารแล้ว</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-amber-400 text-amber-950 font-bold text-[9px] rounded-full">
                VIP
              </span>
              <span className="text-slate-600 font-medium">แถวหน้า (+50฿)</span>
            </div>
          </div>

          {/* Realistic Bus Frame */}
          <div className="relative mx-auto max-w-sm sm:max-w-md bg-gradient-to-b from-blue-950 to-slate-900 p-3 sm:p-4 rounded-t-[50px] rounded-b-[36px] shadow-2xl border-4 border-slate-800 text-white">
            
            {/* Front windshield & mirrors */}
            <div className="relative w-full h-16 bg-gradient-to-b from-sky-400/25 via-blue-500/20 to-transparent rounded-t-[40px] border-b-2 border-blue-400/30 flex items-center justify-center mb-4 overflow-hidden">
              <div className="absolute inset-x-8 top-2 h-1.5 bg-white/40 rounded-full blur-[1px]" />
              <span className="text-[11px] font-semibold tracking-wider text-blue-200 uppercase flex items-center gap-1">
                <Tv className="w-3.5 h-3.5" /> หน้ารถ (ทิศทางการเดินทาง)
              </span>
            </div>

            {/* Driver & Door Front Area */}
            <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-700/80 mb-4 text-xs text-slate-300">
              <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
                <DoorClosed className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px]">ประตูขึ้น-ลง</span>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-[11px]">คนขับรถ</span>
                <div className="w-5 h-5 rounded-full border border-blue-400 flex items-center justify-center text-[10px] font-bold text-blue-400">
                  ✇
                </div>
              </div>
            </div>

            {/* Column Labels Indicator */}
            <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-bold text-slate-400 mb-3 px-2">
              <div>ฝั่งซ้าย (A)</div>
              <div>ทางเดิน (B)</div>
              <div className="text-blue-400 text-[10px] uppercase tracking-wider font-normal flex items-center justify-center">
                ทางเดิน
              </div>
              <div>ทางเดิน (C)</div>
              <div>ฝั่งขวา (D)</div>
            </div>

            {/* Seating Grid (Rows 1 to 9) */}
            <div className="space-y-3 bg-slate-900/60 p-2 sm:p-3 rounded-2xl border border-slate-800">
              {rows.map(([rowNum, rowSeats]) => (
                <div key={rowNum} className="grid grid-cols-5 gap-2 items-center">
                  {/* Left Side: Seat A (Window) */}
                  <div className="flex justify-center">
                    {renderSeat(rowSeats.A)}
                  </div>

                  {/* Left Side: Seat B (Aisle) */}
                  <div className="flex justify-center">
                    {renderSeat(rowSeats.B)}
                  </div>

                  {/* Center Aisle */}
                  <div className="flex flex-col items-center justify-center text-slate-600 text-[10px] font-mono">
                    <span>{rowNum}</span>
                    <span className="text-[8px] text-slate-500">▲</span>
                  </div>

                  {/* Right Side: Seat C (Aisle) */}
                  <div className="flex justify-center">
                    {renderSeat(rowSeats.C)}
                  </div>

                  {/* Right Side: Seat D (Window) */}
                  <div className="flex justify-center">
                    {renderSeat(rowSeats.D)}
                  </div>
                </div>
              ))}
            </div>

            {/* Rear Area: Restroom & Emergency Exit */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between px-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                <span>🚻 ห้องสุขาบนรถ</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg text-rose-300">
                <span>🚪 ทางออกฉุกเฉิน</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selected Seats summary & Checkout action card */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Selected Seats Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>สรุปที่นั่งที่เลือก</span>
              <span className="text-xs font-normal text-slate-500">
                เลือกแล้ว {selectedSeats.length} จาก {passengersCount} ที่นั่ง
              </span>
            </h3>

            {selectedSeats.length === 0 ? (
              <div className="p-6 bg-blue-50/60 rounded-2xl border border-blue-100 text-center">
                <Armchair className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-blue-900">ยังไม่ได้เลือกที่นั่ง</p>
                <p className="text-xs text-blue-700/80 mt-1">
                  กรุณากดคลิกที่ผังที่นั่งด้านซ้ายเพื่อเลือก {passengersCount} ที่นั่ง
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seatId) => {
                    const seat = seats.find((s) => s.id === seatId);
                    const isWindow = seat?.column === 'A' || seat?.column === 'D';
                    return (
                      <div
                        key={seatId}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 font-semibold text-xs"
                      >
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          {seatId}
                        </span>
                        <div>
                          <p className="text-slate-800">{isWindow ? 'ริมหน้าต่าง' : 'ริมทางเดิน'}</p>
                          <p className="text-[11px] text-blue-700">฿{seat?.price.toLocaleString()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onToggleSeat(seatId)}
                          className="ml-1 text-slate-400 hover:text-rose-500 p-0.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                          title="ลบที่นั่งนี้"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>

                {!isSelectionComplete && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      กรุณาเลือกอีก {passengersCount - selectedSeats.length} ที่นั่ง เพื่อดำเนินการต่อ
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Trip Details Recap */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">สายการเดินทาง:</span>
                <span className="font-semibold text-slate-800">{currentTrip.fromCity} ➔ {currentTrip.toCity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">บริษัทเดินรถ:</span>
                <span className="font-semibold text-slate-800">{currentTrip.operatorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">วันและเวลาออก:</span>
                <span className="font-semibold text-slate-800">{travelDate} เวลา {currentTrip.departureTime} น.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">จุดขึ้นรถ:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">{currentTrip.fromStation}</span>
              </div>
            </div>

            {/* Price & Action */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-xs text-slate-500 block">ราคารวม ({selectedSeats.length} ที่นั่ง)</span>
                  <span className="text-2xl font-extrabold text-blue-700">
                    ฿{totalPrice.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                  ไม่มีค่าธรรมเนียมแอบแฝง
                </span>
              </div>

              <button
                type="button"
                id="proceed-to-passenger-btn"
                disabled={!isSelectionComplete}
                onClick={onProceed}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
                  isSelectionComplete
                    ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>ดำเนินการต่อ: ข้อมูลผู้โดยสาร</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reassurance Info Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">ธุรกรรมจองแบบปรมาณู (Atomic Transaction):</strong> ระบบรับประกันความถูกต้อง 100% ว่าจะไม่มีการจองที่นั่งซ้ำซ้อนกับผู้โดยสารท่านอื่น
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">ผังที่นั่ง 2+2:</strong> ทุกที่นั่งสะดวกสบาย มีทั้งเบาะเดี่ยวริมหน้าต่างและเบาะคู่ริมทางเดิน
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
