import { useEffect, useState } from "react";
import { gradeFor } from "@/lib/api";

type Props = { score: number; size?: number; max?: number; label?: string };

export function ScoreGauge({ score, size = 240, max = 1000, label = "NairaIQ Score" }: Props) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(score * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, displayed / max);
  const dash = circumference * progress;
  const { grade, color } = gradeFor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8DD9D7" />
            <stop offset="100%" stopColor="#4ECDC4" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(141,217,215,0.12)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="url(#gauge)" strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 60ms linear", filter: "drop-shadow(0 0 12px rgba(141,217,215,0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-5xl font-bold text-white tracking-tight">{displayed}</span>
        <span className="text-xs uppercase tracking-[0.2em] text-text-muted mt-1">{label}</span>
        <span className="mt-2 inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-semibold" style={{ backgroundColor: color, color: "#021F23" }}>
          Grade {grade}
        </span>
      </div>
    </div>
  );
}
