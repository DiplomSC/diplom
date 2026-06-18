import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import Pagination from '@/Components/Pagination';
import { OrderStatusBadge } from '@/Components/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ShoppingBag, Plus, Eye } from 'lucide-react';

export default function OrdersIndex({ orders }) {
    return (
        <CustomerLayout title="Мої замовлення">
            <Head title="Мої замовлення" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="page-header">Мої замовлення</h1>
                    <Link href={route('order.create')} className="btn-primary btn-sm">
                        <Plus className="w-4 h-4" /> Нове замовлення
                    </Link>
                </div>

                {orders.data.length > 0 ? (
                    <>
                        <div className="card overflow-hidden">
                            <div className="table-wrapper">
                                <table className="table-base">
                                    <thead><tr>
                                        <th>Замовлення</th>
                                        <th>Пристрій</th>
                                        <th>Статус</th>
                                        <th>Вартість</th>
                                        <th>Дата</th>
                                        <th></th>
                                    </tr></thead>
                                    <tbody>
                                        {orders.data.map(order => (
                                            <tr key={order.id}>
                                                <td><span className="font-mono font-medium text-blue-600 dark:text-blue-400">#{order.number}</span></td>
                                                <td>
                                                    <div className="font-medium">{order.device_category?.name}</div>
                                                    <div className="text-xs text-gray-400">{[order.device_brand, order.device_model].filter(Boolean).join(' ')}</div>
                                                </td>
                                                <td><OrderStatusBadge status={order.status} /></td>
                                                <td>{order.final_cost ? formatCurrency(order.final_cost) : order.estimated_cost ? `~ ${formatCurrency(order.estimated_cost)}` : '—'}</td>
                                                <td className="text-gray-500">{formatDate(order.created_at)}</td>
                                                <td>
                                                    <Link href={route('customer.orders.show', order.id)} className="btn-ghost btn-sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <Pagination links={orders.links} />
                    </>
                ) : (
                    <div className="card p-12 text-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">У вас ще немає замовлень</h3>
                        <p className="text-gray-500 text-sm mt-2 mb-4">Відправте запит на ваш перший ремонт</p>
                        <Link href={route('order.create')} className="btn-primary mt-4 btn-sm">Запит на ремонт</Link>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
