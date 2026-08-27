const VARIANTS = {
  default: 'bg-slate-100 text-slate-700',
  strength: 'bg-emerald-50 text-emerald-700',
  missing: 'bg-red-50 text-red-700',
};

export default function SkillTag({ children, variant = 'default' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}>
      {children}
    </span>
  );
}
