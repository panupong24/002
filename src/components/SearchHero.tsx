import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  ArrowLeftRight,
  Search,
  Sparkles,
  Bus,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { PROVINCES, POPULAR_ROUTES } from '../data/mockData';

interface SearchHeroProps {
  origin: string;
  destination: string;
  travelDate: string;
  passengersCount: number;
  onOriginChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onPassengersChange: (count: number) => void;
  onSearch: () => void;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  origin,
  destination,
  travelDate,
  passengersCount,
  onOriginChange,
  onDestinationChange,
  onDateChange,
  onPassengersChange,
  onSearch,
}) => {
  const [passengerDropdownOpen, setPassengerDropdownOpen] = useState(false);

  // Helper for quick date buttons
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const handleSwap = () => {
    const temp = origin;
    onOriginChange(destination);
    onDestinationChange(temp);
  };

  const setQuickRoute = (from: string, to: string) => {
    onOriginChange(from);
    onDestinationChange(to);
  };

  return (
    <div className="relative bg-gradient-to-b from-blue-900 via-blue-800 to-blue-950 text-white pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background visual geometric accents */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-700/60 border border-blue-400/30 text-blue-200 text-xs sm:text-sm font-medium mb-3 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>ค้นหาและจองตั๋วรถทัวร์ออนไลน์ รับ E-Ticket ทันที</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            จองตั๋วรถทัวร์ทั่วไทย สะดวก รวดเร็ว
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 font-light max-w-2xl mx-auto">
            เลือกรอบรถ ดูผังที่นั่ง 2+2 แบบเรียลไทม์ ชำระเงินง่ายไม่มีค่าธรรมเนียมแอบแฝง
          </p>

          {/* Quick Route Pills - Especially Highlight Hat Yai - Bangkok */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <span className="text-xs text-blue-200 font-medium mr-1 hidden sm:inline">
              เส้นทางแนะนำ:
            </span>
            <button
              type="button"
              id="quick-route-hatyai-bkk"
              onClick={() => setQuickRoute('หาดใหญ่ (สงขลา)', 'กรุงเทพมหานคร')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/40 text-xs font-semibold transition-all shadow-xs"
            >
              <Bus className="w-3.5 h-3.5 text-amber-300" />
              <span>หาดใหญ่ ➔ กรุงเทพฯ (ตัวอย่างทดสอบ)</span>
            </button>
            <button
              type="button"
              id="quick-route-bkk-hatyai"
              onClick={() => setQuickRoute('กรุงเทพมหานคร', 'หาดใหญ่ (สงขลา)')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-medium transition-all"
            >
              <span>กรุงเทพฯ ➔ หาดใหญ่</span>
            </button>
            <button
              type="button"
              id="quick-route-bkk-cnx"
              onClick={() => setQuickRoute('กรุงเทพมหานคร', 'เชียงใหม่')}
              className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-medium transition-all"
            >
              <span>กรุงเทพฯ ➔ เชียงใหม่</span>
            </button>
            <button
              type="button"
              id="quick-route-bkk-pkt"
              onClick={() => setQuickRoute('กรุงเทพมหานคร', 'ภูเก็ต')}
              className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-medium transition-all"
            >
              <span>กรุงเทพฯ ➔ ภูเก็ต</span>
            </button>
          </div>
        </div>

        {/* Main Search Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-2xl shadow-blue-950/40 border border-white/20 text-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
            
            {/* Origin & Destination with Swap Button */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
              {/* Origin */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>ต้นทาง (ออกเดินทางจาก)</span>
                </label>
                <div className="relative">
                  <select
                    id="origin-select"
                    value={origin}
                    onChange={(e) => onOriginChange(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 transition-colors cursor-pointer appearance-none"
                  >
                    {PROVINCES.map((prov) => (
                      <option key={`origin-${prov.id}`} value={prov.name}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Swap Button (Centered on desktop, row on mobile) */}
              <button
                type="button"
                id="swap-route-btn"
                onClick={handleSwap}
                title="สลับต้นทาง-ปลายทาง"
                className="hidden sm:flex absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-300 hover:border-blue-500 shadow-md text-slate-600 hover:text-blue-600 items-center justify-center transition-all hover:scale-110 active:scale-95"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              {/* Destination */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>ปลายทาง (จุดหมายปลายทาง)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="sm:hidden text-[11px] text-blue-600 font-semibold flex items-center gap-1"
                  >
                    <ArrowLeftRight className="w-3 h-3" /> สลับ
                  </button>
                </div>
                <div className="relative">
                  <select
                    id="destination-select"
                    value={destination}
                    onChange={(e) => onDestinationChange(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 transition-colors cursor-pointer appearance-none"
                  >
                    {PROVINCES.map((prov) => (
                      <option key={`dest-${prov.id}`} value={prov.name}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Date Picker */}
            <div className="lg:col-span-3 flex flex-col">
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>วันที่เดินทาง</span>
              </label>
              <input
                id="travel-date-input"
                type="date"
                value={travelDate}
                min={getTodayString(0)}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-colors cursor-pointer"
              />
              {/* Quick Date Presets */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => onDateChange(getTodayString(0))}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                    travelDate === getTodayString(0)
                      ? 'bg-blue-100 text-blue-800 font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  วันนี้
                </button>
                <button
                  type="button"
                  onClick={() => onDateChange(getTodayString(1))}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                    travelDate === getTodayString(1)
                      ? 'bg-blue-100 text-blue-800 font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  พรุ่งนี้
                </button>
                <button
                  type="button"
                  onClick={() => onDateChange(getTodayString(2))}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                    travelDate === getTodayString(2)
                      ? 'bg-blue-100 text-blue-800 font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  มะรืนนี้
                </button>
              </div>
            </div>

            {/* Passengers count */}
            <div className="lg:col-span-3 flex flex-col relative">
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>จำนวนผู้โดยสาร</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  id="passengers-btn"
                  onClick={() => setPassengerDropdownOpen(!passengerDropdownOpen)}
                  className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 transition-colors flex items-center justify-between text-left"
                >
                  <span>{passengersCount} คน</span>
                  <span className="text-xs text-slate-500 font-normal">
                    (เลือกได้ 1-6 ที่นั่ง)
                  </span>
                </button>

                {passengerDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 animate-in fade-in zoom-in-95">
                    <p className="text-xs font-bold text-slate-800 mb-2">
                      ระบุจำนวนผู้โดยสาร
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            onPassengersChange(num);
                            setPassengerDropdownOpen(false);
                          }}
                          className={`py-2 text-center rounded-lg text-sm font-semibold transition-colors ${
                            passengersCount === num
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {num} คน
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Action Search Button */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>
                เส้นทางปัจจุบัน:{' '}
                <strong className="text-slate-800">{origin}</strong> ➔{' '}
                <strong className="text-slate-800">{destination}</strong> ({passengersCount} ที่นั่ง)
              </span>
            </div>

            <button
              type="button"
              id="search-buses-btn"
              onClick={onSearch}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="w-5 h-5" />
              <span>ค้นหาเที่ยวรถ</span>
            </button>
          </div>
        </div>

        {/* Highlight features footer */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 bg-blue-900/40 border border-blue-400/20 rounded-xl px-3 py-2 text-xs text-blue-100">
            <Bus className="w-4 h-4 text-blue-300 shrink-0" />
            <span>รถร่วม บขส. และเอกชนชั้นนำ</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-900/40 border border-blue-400/20 rounded-xl px-3 py-2 text-xs text-blue-100">
            <Clock className="w-4 h-4 text-amber-300 shrink-0" />
            <span>ตรงเวลา พร้อมระบบ GPS ติดตาม</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-900/40 border border-blue-400/20 rounded-xl px-3 py-2 text-xs text-blue-100">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>ฟรี ประกันอุบัติเหตุทุกที่นั่ง</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-900/40 border border-blue-400/20 rounded-xl px-3 py-2 text-xs text-blue-100">
            <Sparkles className="w-4 h-4 text-sky-300 shrink-0" />
            <span>ผังที่นั่ง 2+2 เห็นตำแหน่งชัดเจน</span>
          </div>
        </div>
      </div>
    </div>
  );
};
