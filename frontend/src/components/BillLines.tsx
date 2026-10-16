import { formatINR } from '../lib/plans';

interface BillLine {
  key: string;
  name: string;
  detail?: string;
  quantity: number;
  amount: number;
}

interface BillLinesProps {
  lines: BillLine[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  totalLabel?: string;
}

/** Itemised list plus totals, shared by the checkout summary and the final receipt. */
export const BillLines: React.FC<BillLinesProps> = ({ lines, subtotal, tax, discount, total, totalLabel = 'Total' }) => (
  <>
    <ul className="divide-y divide-line border-y border-line">
      {lines.map((line) => (
        <li key={line.key} className="flex items-start justify-between gap-3 py-3 text-sm">
          <div className="min-w-0">
            <p className="truncate font-medium">{line.name}</p>
            <p className="text-xs text-muted">
              Qty {line.quantity}
              {line.detail && ` · ${line.detail}`}
            </p>
          </div>
          <p className="tabular shrink-0 font-medium">{formatINR(line.amount)}</p>
        </li>
      ))}
    </ul>

    <dl className="tabular mt-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd>{formatINR(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted">GST</dt>
        <dd>{formatINR(tax)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between">
          <dt className="text-muted">Savings</dt>
          <dd className="text-good-fg">−{formatINR(discount)}</dd>
        </div>
      )}
      <div className="flex items-baseline justify-between border-t border-line pt-3 font-bold">
        <dt>{totalLabel}</dt>
        <dd className="font-display text-2xl">{formatINR(total)}</dd>
      </div>
    </dl>
  </>
);
