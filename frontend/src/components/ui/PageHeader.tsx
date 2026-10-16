import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Shows a back arrow linking here (used on customer sub-pages). */
  backHref?: string;
  /** Buttons or filters aligned to the right on wide screens. */
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, backHref, actions }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
    <div className="flex items-start gap-3">
      {backHref && (
        <Link href={backHref} className="btn-icon -ml-2 mt-0.5 shrink-0" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      )}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
