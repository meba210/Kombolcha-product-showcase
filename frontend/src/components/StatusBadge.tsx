import clsx from 'clsx';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmed', className: 'badge-blue' },
  SHIPPED: { label: 'Shipped', className: 'badge-blue' },
  DELIVERED: { label: 'Delivered', className: 'badge-green' },
  CANCELLED: { label: 'Cancelled', className: 'badge-red' },
  COMPLETED: { label: 'Completed', className: 'badge-green' },
  FAILED: { label: 'Failed', className: 'badge-red' },
  REFUNDED: { label: 'Refunded', className: 'badge-gray' },
  AVAILABLE: { label: 'Available', className: 'badge-green' },
  OUT_OF_STOCK: { label: 'Out of Stock', className: 'badge-red' },
  DISCONTINUED: { label: 'Discontinued', className: 'badge-gray' },
  APPROVED: { label: 'Approved', className: 'badge-green' },
  REJECTED: { label: 'Rejected', className: 'badge-red' },
  UNREAD: { label: 'Unread', className: 'badge-blue' },
  READ: { label: 'Read', className: 'badge-gray' },
  SETTLED: { label: 'Settled', className: 'badge-green' },
  UNSETTLED: { label: 'Unsettled', className: 'badge-yellow' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'badge-gray' };
  return (
    <span className={clsx('badge', config.className, className)}>
      {config.label}
    </span>
  );
}
