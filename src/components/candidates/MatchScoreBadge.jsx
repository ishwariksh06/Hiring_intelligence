function getTier(score) {
  if (score >= 80) return { label: 'Strong', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', ring: '#059669' };
  if (score >= 60) return { label: 'Moderate', classes: 'bg-amber-50 text-amber-700 ring-amber-600/20', ring: '#d97706' };
  return { label: 'Weak', classes: 'bg-red-50 text-red-700 ring-red-600/20', ring: '#dc2626' };
}

export default function MatchScoreBadge({ score, showLabel = true }) {
  const tier = getTier(score);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tier.classes}`}>
      {score}%{showLabel && <span className="font-normal opacity-80">{tier.label}</span>}
    </span>
  );
}

export function MatchScoreRing({ score, size = 44 }) {
  const tier = getTier(score);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth="4" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tier.ring}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-slate-700">
        {score}
      </span>
    </div>
  );
}
