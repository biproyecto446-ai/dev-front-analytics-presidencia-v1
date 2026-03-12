interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  accentColor?: string;
}

export function StatCard({ label, value, icon, trend, accentColor = "from-brand-600 to-brand-400" }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface-card p-5 backdrop-blur-sm transition-all hover:border-border-hover hover:shadow-lg hover:shadow-brand-600/5">
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accentColor}`} />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-text-primary">
            {typeof value === "number" ? value.toLocaleString("es-CO") : value}
          </p>
          {trend && <p className="text-xs text-accent-green">{trend}</p>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-overlay/50 text-lg text-text-muted transition-colors group-hover:text-brand-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
