import { Loader2 } from 'lucide-react';

export const Loading: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-muted" role="status">
    <Loader2 className="h-6 w-6 animate-spin text-brand" />
    {label}
  </div>
);

interface EmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const Empty: React.FC<EmptyProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center px-6 py-12 text-center">
    {icon && <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sunken text-muted">{icon}</div>}
    <p className="font-semibold">{title}</p>
    {description && <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
