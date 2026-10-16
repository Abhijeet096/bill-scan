interface StatCardProps {
  label: string;
  value: string;
  note?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, note, icon }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm text-muted">{label}</p>
      {icon && <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand-fg">{icon}</span>}
    </div>
    <p className="tabular mt-2 font-display text-2xl font-bold">{value}</p>
    {note && <p className="mt-1 text-xs text-muted">{note}</p>}
  </div>
);
