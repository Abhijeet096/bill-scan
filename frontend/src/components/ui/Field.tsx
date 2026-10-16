interface FieldProps {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + optional hint. Wrapping in <label> ties them together without ids. */
export const Field: React.FC<FieldProps> = ({ label, hint, className, children }) => (
  <label className={`block ${className ?? ''}`}>
    <span className="label">{label}</span>
    {children}
    {hint && <span className="hint block">{hint}</span>}
  </label>
);
