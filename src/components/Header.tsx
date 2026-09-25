import React, { useState } from 'react';
import {
  Bus,
  Ticket,
  Phone,
  ShieldCheck,
  MapPin,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenBookings: () => void;
  savedBookingsCount: number;
  onGoHome: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBookings,
  savedBookingsCount,
  onGoHome,
  onOpenAdmin,
}) => {
  const { user, isAdmin, signInWithGoogle, signOutUser, loading } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            id="brand-logo-btn"
            onClick={onGoHome}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-blue-950 font-['Prompt']">
                  Bus Booking
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  ไทยแลนด์
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ระบบจองตั๋วรถทัวร์ออนไลน์อันดับ 1 ทั่วไทย
              </p>
            </div>
          </button>

          {/* Center quick reassurance (desktop) */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/70">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>เส้นทางยอดนิยม: หาดใหญ่ - กรุงเทพฯ</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/70">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>จองเรียลไทม์ผ่าน Firebase</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Panel Button (visible to Admins or for easy access) */}
            {isAdmin && (
              <button
                type="button"
                id="admin-panel-btn"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="จัดการระบบและรอบรถ"
              >
                <Sliders className="w-4 h-4 text-amber-600" />
                <span className="hidden md:inline">จัดการระบบ</span>
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-md text-[10px] uppercase tracking-wider font-extrabold">
                  Admin
                </span>
              </button>
            )}

            {/* My Bookings Button */}
            <button
              id="my-bookings-btn"
              onClick={onOpenBookings}
              className="relative inline-flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold border border-blue-200 transition-colors cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-blue-700" />
              <span>ตั๋วของฉัน</span>
              {savedBookingsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                  {savedBookingsCount}
                </span>
              )}
            </button>

            {/* Auth Section */}
            {loading ? (
              <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-blue-200"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left max-w-[120px]">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {user.displayName || 'ผู้ใช้งาน'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {isAdmin ? 'ผู้ดูแลระบบ' : 'ผู้โดยสาร'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.displayName || 'บัญชี Google'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md border border-amber-200">
                          สิทธิ์ผู้ดูแลระบบ (Admin)
                        </span>
                      )}
                    </div>

                    <div className="p-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenBookings();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <Ticket className="w-4 h-4 text-blue-600" />
                        <span>ประวัติการจองของฉัน</span>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenAdmin();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <Sliders className="w-4 h-4 text-amber-600" />
                          <span>เปิดแผงควบคุมระบบ (Admin Panel)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await signOutUser();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                id="google-login-btn"
                onClick={() => signInWithGoogle()}
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                {/* Google "G" icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>เข้าสู่ระบบ Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
