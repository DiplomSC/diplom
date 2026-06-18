import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { OrderStatusBadge, PriorityBadge } from '@/Components/StatusBadge';
import { formatDate, formatCurrency, ORDER_STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils';
import { Search, Filter, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function AdminOrders({ orders, filters, statuses, technicians, categories }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (newFilters) => {
        router.get(route('admin.orders.index'), { ...filters, ...newFilters }, { preserveState: true });
    };

    return (
        <AdminLayout title="Замовлення">
            <Head title="Замовлення" />

            {/* фільтр */}
            <div className="card p-4 mb-5">
                <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-48">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                className="input pl-9"
                                placeholder="Пошук за номером, ім'ям, телефоном…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
                            />
                        </div>
                    </div>
                    <select className="input w-auto" value={filters.status ?? ''} onChange={e => applyFilter({ status: e.target.value || undefined })}>
                        <option value="">Всі статуси</option>
                        {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{ORDER_STATUS_LABELS[k]}</option>)}
                    </select>
                    <select className="input w-auto" value={filters.technician_id ?? ''} onChange={e => applyFilter({ technician_id: e.target.value || undefined })}>
                        <option value="">Всі майстри</option>
                        {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button onClick={() => applyFilter({ search })} className="btn-primary btn-sm px-6">
                        Знайти
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="table-wrapper">
                    <table className="table-base">
                        <thead><tr>
                            <th>№</th>
                            <th>Клієнт</th>
                            <th>Пристрій</th>
                            <th>Майстер</th>
                            <th>Пріоритет</th>
                            <th>Статус</th>
                            <th>Вартість</th>
                            <th>Дата</th>
                            <th></th>
                        </tr></thead>
                        <tbody>
                            {orders.data.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <Link href={route('admin.orders.show', order.id)} className="font-mono text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                            {order.number}
                                        </Link>
                                    </td>
                                    <td>
                                        <div className="font-medium">{order.customer_name}</div>
                                        <div className="text-xs text-gray-400">{order.customer_phone}</div>
                                    </td>
                                    <td>{order.device_category?.name}</td>
                                    <td className="text-gray-500">{order.technician?.name ?? <span className="badge-yellow">Не призначений</span>}</td>
                                    <td><PriorityBadge priority={order.priority} /></td>
                                    <td><OrderStatusBadge status={order.status} /></td>
                                    <td>{order.final_cost ? formatCurrency(order.final_cost) : '—'}</td>
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
                                <tr><td colSpan="9" className="text-center py-8 text-gray-400">Замовлень не знайдено</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={orders.links} />
        </AdminLayout>
    );
}
