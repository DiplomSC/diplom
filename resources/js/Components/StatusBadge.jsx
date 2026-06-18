import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/utils';

export function OrderStatusBadge({ status }) {
    const colorClass = ORDER_STATUS_COLORS[status] ?? 'badge-gray';
    const label = ORDER_STATUS_LABELS[status] ?? status;
    return <span className={colorClass}>{label}</span>;
}

export function PriorityBadge({ priority }) {
    const colorClass = PRIORITY_COLORS[priority] ?? 'badge-gray';
    return <span className={colorClass}>{PRIORITY_LABELS[priority] ?? priority}</span>;
}

export function LoyaltyBadge({ level, color }) {
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: color ?? '#CD7F32' }}>
            {level}
        </span>
    );
}
