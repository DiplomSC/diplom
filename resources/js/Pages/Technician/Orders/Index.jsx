import { Head, Link, router } from '@inertiajs/react';
import TechLayout from '@/Layouts/TechLayout';
import Pagination from '@/Components/Pagination';
import { OrderStatusBadge, PriorityBadge } from '@/Components/StatusBadge';
import { formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

export default function TechOrdersIndex({ orders, status, statuses }) {
    const tabs = [['all', 'Всі'], ...Object.entries(statuses)];

    return (
        <TechLayout title="Мої замовлення">
            <Head title="Мої замовлення" />

            {/* таби статусів */}
            <div className="flex gap-1 overflow-x-auto pb-1 mb-5">
                {tabs.map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => router.get(route('tech.orders.index'), { status: key === 'all' ? undefined : key }, { preserveState: true })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${status === key || (key === 'all' && !status) ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        {ORDER_STATUS_LABELS[key] ?? 'Всі'}
                    </button>
                ))}
            </div>

            <div className="card overflow-hidden">
                <div className="table-wrapper">
                    <table className="table-base">
                        <thead><tr>
                            <th>Замовлення</th>
                            <th>Кліент</th>
                            <th>Пристрій</th>
                            <th>Пріоритет</th>
                            <th>Статус</th>
                            <th>Дата</th>
                            <th></th>
                        </tr></thead>
                        <tbody>
                            {orders.data.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <Link href={route('tech.orders.show', order.id)} className="font-mono text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                            {order.number}
                                        </Link>
                                    </td>
                                    <td>{order.customer_name}</td>
                                    <td>
                                        <div>{order.device_category?.name}</div>
                                        <div className="text-xs text-gray-400">{[order.device_brand, order.device_model].filter(Boolean).join(' ')}</div>
                                    </td>
                                    <td><PriorityBadge priority={order.priority} /></td>
                                    <td><OrderStatusBadge status={order.status} /></td>
                                    <td className="text-gray-500">{formatDate(order.created_at)}</td>
                                    <td>
                                        {order.comments_count > 0 && (
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                <MessageSquare className="w-3.5 h-3.5" />{order.comments_count}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {orders.data.length === 0 && (
                                <tr><td colSpan="7" className="text-center py-8 text-gray-400">Замовлень {status !== 'all' ? 'зі статусом "' + (ORDER_STATUS_LABELS[status] ?? status) + '"' : ''} не знайдено</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={orders.links} />
        </TechLayout>
    );
}
