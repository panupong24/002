import React from 'react';

// Generates a crisp, visually authentic QR code pattern for the boarding pass
export const QRCodeDisplay: React.FC<{ code: string; size?: number }> = ({ code, size = 130 }) => {
  // Generate deterministic pattern based on the code string
  const gridSize = 21;
  const hash = code.split('').reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);

  const isDark = (r: number, c: number) => {
    // 3 Corner finder patterns (7x7)
    // Top-left
    if (r < 7 && c < 7) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Top-right
    if (r < 7 && c >= gridSize - 7) {
      const cc = c - (gridSize - 7);
      if (r === 0 || r === 6 || cc === 0 || cc === 6) return true;
      if (r >= 2 && r <= 4 && cc >= 2 && cc <= 4) return true;
      return false;
    }
    // Bottom-left
    if (r >= gridSize - 7 && c < 7) {
      const rr = r - (gridSize - 7);
      if (rr === 0 || rr === 6 || c === 0 || c === 6) return true;
      if (rr >= 2 && rr <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }

    // Timing patterns
    if (r === 6 && c % 2 === 0) return true;
    if (c === 6 && r % 2 === 0) return true;

    // Pseudo-random deterministic data bits
    const val = (r * 31 + c * 17 + hash) % 100;
    return val > 48;
  };

  const cellSize = size / gridSize;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rounded"
        role="img"
        aria-label={`QR Code for ${code}`}
      >
        <rect width={size} height={size} fill="#ffffff" />
        {Array.from({ length: gridSize }).map((_, r) =>
          Array.from({ length: gridSize }).map((_, c) => {
            if (isDark(r, c)) {
              return (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize - 0.2}
                  height={cellSize - 0.2}
                  fill="#0f172a"
                  rx={0.5}
                />
              );
            }
            return null;
          })
        )}
      </svg>
      <span className="mt-1.5 text-[10px] font-mono tracking-wider text-slate-500 font-semibold">
        {code}
      </span>
    </div>
  );
};
