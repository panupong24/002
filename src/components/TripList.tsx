import React, { useState, useMemo } from 'react';
import {
  Bus,
  Clock,
  MapPin,
  Wifi,
  Tv,
  Coffee,
  Zap,
  Star,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  Armchair
} from 'lucide-react';
import { BusTrip } from '../types';

interface TripListProps {
  trips: BusTrip[];
  origin: string;
  destination: string;
  travelDate: string;
  passengersCount: number;
  onSelectTrip: (trip: BusTrip) => void;
}

export const TripList: React.FC<TripListProps> = ({
  trips,
  origin,
  destination,
  travelDate,
  passengersCount,
  onSelectTrip,
}) => {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night'>('all');
  const [selectedOperator, setSelectedOperator] = useState<string>('all');
  const [selectedBusType, setSelectedBusType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time_asc' | 'price_asc' | 'price_desc' | 'rating'>('time_asc');

  // Format date display in Thai
  const formatThaiDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      return `${day} ${thaiMonths[month - 1]} ${year + 543}`;
    } catch {
      return dateStr;
    }
  };

  // Unique operators and bus types
  const operators = useMemo(() => {
    const set = new Set(trips.map((t) => t.operatorName));
    return Array.from(set);
  }, [trips]);

  const busTypes = useMemo(() => {
    const set = new Set(trips.map((t) => t.busType));
    return Array.from(set);
  }, [trips]);

  // Filtering & Sorting
  const filteredTrips = useMemo(() => {
    let result = [...trips];

    // Filter by time
    if (selectedTimeFilter !== 'all') {
      result = result.filter((t) => {
        const hour = parseInt(t.departureTime.split(':')[0], 10);
        if (selectedTimeFilter === 'morning') return hour >= 6 && hour < 12;
        if (selectedTimeFilter === 'afternoon') return hour >= 12 && hour < 18;
        if (selectedTimeFilter === 'evening') return hour >= 18 && hour < 21;
        if (selectedTimeFilter === 'night') return hour >= 21 || hour < 6;
        return true;
      });
    }

    // Filter by operator
    if (selectedOperator !== 'all') {
      result = result.filter((t) => t.operatorName === selectedOperator);
    }

    // Filter by bus type
    if (selectedBusType !== 'all') {
      result = result.filter((t) => t.busType === selectedBusType);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'time_asc') {
        return a.departureTime.localeCompare(b.departureTime);
      }
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

    return result;
  }, [trips, selectedTimeFilter, selectedOperator, selectedBusType, sortBy]);

  // Amenity icon mapper
  const getAmenityIcon = (amenity: string) => {
    if (amenity.includes('Wi-Fi')) return <Wifi className="w-3.5 h-3.5" />;
    if (amenity.includes('ปลั๊ก') || amenity.includes('USB')) return <Zap className="w-3.5 h-3.5" />;
    if (amenity.includes('ทีวี') || amenity.includes('จอ')) return <Tv className="w-3.5 h-3.5" />;
    if (amenity.includes('ว่าง') || amenity.includes('น้ำ') || amenity.includes('อาหาร')) return <Coffee className="w-3.5 h-3.5" />;
    return <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="trip-results-section">
      {/* Route & Date Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>ผลการค้นหาเที่ยวรถ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center flex-wrap gap-2">
            <span>{origin}</span>
            <ArrowRight className="w-5 h-5 text-blue-600 inline" />
            <span>{destination}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            วันที่เดินทาง: <strong className="text-slate-800">{formatThaiDate(travelDate)}</strong> • ผู้โดยสาร {passengersCount} ท่าน
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">พบทั้งหมด</p>
            <p className="text-lg font-bold text-blue-700">{filteredTrips.length} เที่ยวรถ</p>
          </div>
        </div>
      </div>

      {/* Filters & Sorting Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span>กรองและจัดเรียงรอบรถ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Time range */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ช่วงเวลาออกเดินทาง
            </label>
            <select
              value={selectedTimeFilter}
              onChange={(e) => setSelectedTimeFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">ทั้งหมด (ตลอดวัน)</option>
              <option value="morning">ช่วงเช้า (06:00 - 12:00)</option>
              <option value="afternoon">ช่วงบ่าย (12:00 - 18:00)</option>
              <option value="evening">ช่วงหัวค่ำ (18:00 - 21:00)</option>
              <option value="night">ช่วงดึก (21:00 - 06:00)</option>
            </select>
          </div>

          {/* Operator filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              บริษัทเดินรถ
            </label>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">ทุกบริษัท ({operators.length})</option>
              {operators.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          {/* Bus Type filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ประเภทรถ
            </label>
            <select
              value={selectedBusType}
              onChange={(e) => setSelectedBusType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">ทุกประเภท</option>
              {busTypes.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              เรียงลำดับตาม
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="time_asc">เวลาออก: เร็ว ➔ ช้า</option>
              <option value="price_asc">ราคา: น้อย ➔ มาก</option>
              <option value="price_desc">ราคา: มาก ➔ น้อย</option>
              <option value="rating">คะแนนรีวิวสูงสุด</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Bus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">ไม่พบรอบรถตามเงื่อนไขที่เลือก</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
            ลองปรับเปลี่ยนตัวกรองเวลาหรือประเภทรถ หรือเลือกเส้นทางยอดนิยม เช่น หาดใหญ่ - กรุงเทพฯ
          </p>
          <button
            onClick={() => {
              setSelectedTimeFilter('all');
              setSelectedOperator('all');
              setSelectedBusType('all');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip) => {
            const isVip = trip.busType.includes('VIP');
            return (
              <div
                key={trip.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition-all p-4 sm:p-6 group relative overflow-hidden"
              >
                {/* Accent top stripe for VIP */}
                {isVip && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-blue-500 to-indigo-600" />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
                  
                  {/* Left info: Operator & Bus Type */}
                  <div className="lg:col-span-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {trip.operatorName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        isVip ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {trip.busType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                      <span>เบอร์รถ: {trip.busNumber}</span>
                      <span>•</span>
                      <span>ผังที่นั่ง 2+2</span>
                    </p>

                    <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{trip.rating}</span>
                      <span className="text-slate-400 font-normal">({trip.reviewsCount} รีวิว)</span>
                    </div>

                    {/* Amenities list */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {trip.amenities.slice(0, 4).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"
                        >
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Middle: Departure & Arrival schedule */}
                  <div className="lg:col-span-5 bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      {/* Departure */}
                      <div className="text-left flex-1 min-w-0">
                        <span className="text-xs text-slate-400 block mb-0.5">เวลาออก</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-blue-900 tracking-tight">
                          {trip.departureTime}
                        </span>
                        <p className="text-xs font-semibold text-slate-800 truncate mt-0.5" title={trip.fromCity}>
                          {trip.fromCity}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1" title={trip.fromStation}>
                          {trip.fromStation}
                        </p>
                      </div>

                      {/* Duration Arrow */}
                      <div className="flex flex-col items-center px-2 shrink-0">
                        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          {trip.duration}
                        </span>
                        <div className="w-16 sm:w-24 h-0.5 bg-blue-300 relative my-1.5">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rotate-45" />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" />
                        </div>
                        <span className="text-[10px] text-slate-400">~{trip.distanceKm} กม.</span>
                      </div>

                      {/* Arrival */}
                      <div className="text-right flex-1 min-w-0">
                        <span className="text-xs text-slate-400 block mb-0.5">เวลาถึงโดยประมาณ</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                          {trip.arrivalTime}
                        </span>
                        <p className="text-xs font-semibold text-slate-800 truncate mt-0.5" title={trip.toCity}>
                          {trip.toCity}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1" title={trip.toStation}>
                          {trip.toStation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Book button */}
                  <div className="lg:col-span-3 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-slate-500 block">ราคาเริ่มต้น / ที่นั่ง</span>
                      <div className="flex items-baseline lg:justify-end gap-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                          ฿{trip.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                        <Armchair className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ว่าง {trip.availableSeats} ที่นั่ง</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      id={`select-trip-${trip.id}`}
                      onClick={() => onSelectTrip(trip)}
                      className="mt-2 sm:mt-3 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Armchair className="w-4 h-4" />
                      <span>เลือกที่นั่ง</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
