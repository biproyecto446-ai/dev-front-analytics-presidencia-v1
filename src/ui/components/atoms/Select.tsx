interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel?: string;
}

export function Select({ label, value, onChange, options, allLabel = "Todos" }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary shadow-sm transition-colors hover:border-border-hover focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
      >
        <option value="">{allLabel}</option>
        {options.map((opt, i) => (
          <option key={`${opt.value}-${i}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
