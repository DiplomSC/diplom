import { Head, Link } from '@inertiajs/react';
import TechLayout from '@/Layouts/TechLayout';
import { OrderStatusBadge, PriorityBadge } from '@/Components/StatusBadge';
import { formatDate } from '@/lib/utils';
import { ClipboardList, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );
}

function OrderRow({ order }) {
    return (
        <Link href={route('tech.orders.show', order.id)} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-sm text-blue-600 dark:text-blue-400">#{order.number}</span>
                    <PriorityBadge priority={order.priority} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{order.customer_name} · {order.device_category?.name}</p>
            </div>
            <OrderStatusBadge status={order.status} />
        </Link>
    );
}

export default function TechDashboard({ activeOrders, newOrders, priorityOrders, stats }) {
    return (
        <TechLayout title="Кабінет майстра">
            <Head title="Кабінет майстра" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={ClipboardList} label="Поточні замовлення" value={stats.active} color="bg-blue-500" />
                    <StatCard icon={Clock} label="Сьогоднішні" value={stats.today} color="bg-purple-500" />
                    <StatCard icon={CheckCircle} label="Завершені" value={stats.completed} color="bg-green-500" />
                    <StatCard icon={AlertTriangle} label="Всього" value={stats.total} color="bg-gray-500" />
                </div>

                {priorityOrders.length > 0 && (
                    <div className="card p-5">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" /> Пріоритетні
                        </h2>
                        <div className="space-y-2">
                            {priorityOrders.map(o => <OrderRow key={o.id} order={o} />)}
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-5">
                    {/* поточні */}
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 dark:text-white">Мої поточні замовлення</h2>
                            <Link href={route('tech.orders.index')} className="text-blue-600 text-sm">Переглянути всі →</Link>
                        </div>
                        {activeOrders.length > 0
                            ? <div className="space-y-2">{activeOrders.map(o => <OrderRow key={o.id} order={o} />)}</div>
                            : <p className="text-gray-400 text-sm text-center py-4">Наразі немає замовлень</p>
                        }
                    </div>

                    {/* нові замовлення (майтер може прийняти передічені тут замовлення) */}
                    <div className="card p-5">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Нові замовлення</h2>
                        {newOrders.length > 0 ? (
                            <div className="space-y-2">
                                {newOrders.map(o => (
                                    <Link key={o.id} href={route('tech.orders.show', o.id)} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div>
                                            <span className="font-mono font-medium text-sm text-blue-600 dark:text-blue-400">#{o.number}</span>
                                            <p className="text-xs text-gray-500">{o.customer_name} · {formatDate(o.created_at)}</p>
                                        </div>
                                        <span className="btn-primary btn-sm text-xs">Прийняти</span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm text-center py-4">Ще немає нових замовлень</p>
                        )}
                    </div>
                </div>
            </div>
        </TechLayout>
    );
}
