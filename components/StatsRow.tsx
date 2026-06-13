interface Props {
  published: number;
  pending: number;
  rejected: number;
}

export default function StatsRow({ published, pending, rejected }: Props) {
  return (
    <div className="stats-row">
      {[
        { label: "Published", count: published, color: "var(--color-success)" },
        { label: "Pending",   count: pending,   color: "var(--color-warning)" },
        { label: "Rejected",  count: rejected,  color: "var(--color-error)"   },
      ].map(({ label, count, color }) => (
        <div key={label} className="stat-card">
          <div className="stat-num" style={{ color }}>{count}</div>
          <div className="stat-lbl">{label}</div>
        </div>
      ))}
    </div>
  );
}
