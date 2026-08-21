interface InProgressBadgeProps {
  count?: number;
}

export function InProgressBadge({ count }: InProgressBadgeProps) {
  const label = count !== undefined ? `${count} in progress` : "In Progress";

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
      <span data-testid="in-progress-dot" className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      {label}
    </span>
  );
}
