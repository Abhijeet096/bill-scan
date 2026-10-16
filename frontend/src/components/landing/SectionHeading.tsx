interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ eyebrow, title, description, align = 'center' }) => (
  <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
    <p className="text-sm font-semibold uppercase tracking-wider text-brand-fg">{eyebrow}</p>
    <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h2>
    {description && <p className="mt-3 text-lg text-muted">{description}</p>}
  </div>
);
