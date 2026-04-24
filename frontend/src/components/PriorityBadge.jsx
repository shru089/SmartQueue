import { PRIORITY_META } from '../data/mockData';

export default function PriorityBadge({ priority, showDot = true }) {
  const meta = PRIORITY_META[priority] ?? PRIORITY_META[3];

  return (
    <span
      className={`badge-${meta.color} whitespace-nowrap`}
      aria-label={`Priority: ${meta.label}`}
    >
      {showDot && <span aria-hidden="true">{meta.dot}</span>}
      {meta.label}
    </span>
  );
}
