import React from 'react';
import { Search, Armchair, UserCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { BookingStep } from '../types';

interface StepProgressProps {
  currentStep: BookingStep;
  onStepClick?: (step: BookingStep) => void;
  canGoToSeats?: boolean;
  canGoToPassenger?: boolean;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  onStepClick,
  canGoToSeats,
  canGoToPassenger,
}) => {
  const steps: { id: BookingStep; label: string; subLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'search', label: '1. ค้นหาเที่ยวรถ', subLabel: 'เลือกเส้นทาง & วันเดินทาง', icon: Search },
    { id: 'seat_selection', label: '2. เลือกที่นั่ง 2+2', subLabel: 'ผังที่นั่งเสมือนจริง', icon: Armchair },
    { id: 'passenger_info', label: '3. สรุป & ชำระเงิน', subLabel: 'กรอกข้อมูลผู้โดยสาร', icon: UserCheck },
    { id: 'confirmation', label: '4. ยืนยันการจอง', subLabel: 'รับตั๋วโดยสาร E-Ticket', icon: CheckCircle2 },
  ];

  const getStepIndex = (step: BookingStep) => {
    switch (step) {
      case 'search': return 0;
      case 'seat_selection': return 1;
      case 'passenger_info': return 2;
      case 'confirmation': return 3;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full bg-white border-b border-slate-200 py-3 sm:py-4 px-4 shadow-2xs">
      <div className="max-w-5xl mx-auto">
        {/* Mobile View */}
        <div className="flex sm:hidden items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              {currentIndex + 1}
            </span>
            <span className="font-semibold text-slate-800">
              {steps[currentIndex].label}
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">
            ขั้นตอนที่ {currentIndex + 1} จาก 4
          </span>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:grid grid-cols-4 gap-2 lg:gap-4 items-center">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = idx === currentIndex;
            const isCompleted = idx < currentIndex;
            const isClickable =
              (idx === 0) ||
              (idx === 1 && canGoToSeats) ||
              (idx === 2 && canGoToPassenger);

            return (
              <div key={step.id} className="relative flex items-center">
                <button
                  type="button"
                  disabled={!isClickable && !isCurrent}
                  onClick={() => isClickable && onStepClick && onStepClick(step.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                    isCurrent
                      ? 'bg-blue-50/90 border border-blue-200/90 text-blue-900 shadow-xs'
                      : isCompleted
                      ? 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                      : 'text-slate-400 cursor-not-allowed opacity-70'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                      {step.label}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate hidden lg:block">
                      {step.subLabel}
                    </p>
                  </div>
                </button>

                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
