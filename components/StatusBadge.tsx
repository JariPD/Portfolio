import type { Status } from "@/lib/blog";

const labels: Record<Status, string> = {
  published: "Published",
  pending: "Pending",
  rejected: "Rejected",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status-badge status-badge-${status}`}>
      {labels[status]}
    </span>
  );
}
