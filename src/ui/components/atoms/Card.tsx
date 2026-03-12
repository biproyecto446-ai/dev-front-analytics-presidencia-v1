interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, subtitle, children, className = "" }: CardProps) {
  return (
    <div className={`rounded-2xl border border-border bg-surface-card p-6 backdrop-blur-sm ${className}`}>
      <div className="mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </h3>
        {subtitle && <p className="mt-1 text-xs text-text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
