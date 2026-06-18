import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { OrderStatusBadge } from '@/Components/StatusBadge';
import { formatDate, formatCurrency, ORDER_STATUS_LABELS } from '@/lib/utils';
import { TrendingUp, ShoppingBag, Users, DollarSign, AlertTriangle, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MONTH_NAMES = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
const STATUS_COLORS = { new: '#94a3b8', accepted: '#3b82f6', diagnosing: '#8b5cf6', waiting_parts: '#eab308', in_repair: '#f97316', ready: '#22c55e', completed: '#16a34a', cancelled: '#ef4444', rejected: '#dc2626' };

function StatCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
    );
}

export default function AdminDashboard({ stats, recentOrders, revenueChart, statusChart, lowStockParts }) {
    const chartData = revenueChart.map(r => ({
        name: MONTH_NAMES[(r.month - 1)],
        revenue: parseFloat(r.total),
        orders: r.count,
    }));

    const pieData = statusChart.map(s => ({
        name: ORDER_STATUS_LABELS[s.status],
        value: s.count,
        color: STATUS_COLORS[s.status] ?? '#94a3b8',
    }));

    return (
        <AdminLayout title="Дашборд">
            <Head title="Дашборд" />

            <div className="space-y-6">
                {/* статистика */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={DollarSign} label="Виручка" value={formatCurrency(stats.totalRevenue)} color="bg-green-500" />
                    <StatCard icon={ShoppingBag} label="Замовлень" value={stats.totalOrders} sub={`${stats.activeOrders} активних`} color="bg-blue-500" />
                    <StatCard icon={TrendingUp} label="Середній чек" value={formatCurrency(stats.avgCheck)} color="bg-purple-500" />
                    <StatCard icon={Users} label="Користувачі" value={stats.totalUsers} sub={`${stats.returningPct}% постійні`} color="bg-orange-500" />
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                    {/* графік виручки */}
                    <div className="card p-5 lg:col-span-2">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart2 className="w-4 h-4" /> Виручка за 6 місяців
                        </h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* чарт з замовленнями */}
                    <div className="card p-5">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Замовлення по статусам</h2>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-2 space-y-1">
                            {pieData.map(d => (
                                <div key={d.name} className="flex items-center gap-2 text-xs">
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                                    <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                                    <span className="ml-auto font-medium text-gray-900 dark:text-white">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-5">
                    {/* останні замовлення */}
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 dark:text-white">Останні замовлення</h2>
                            <Link href={route('admin.orders.index')} className="text-blue-600 text-sm">Переглянути всі →</Link>
                        </div>
                        <div className="space-y-2">
                            {recentOrders.map(order => (
                                <Link key={order.id} href={route('admin.orders.show', order.id)} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div>
                                        <span className="font-mono font-medium text-sm text-blue-600 dark:text-blue-400">{order.number}</span>
                                        <p className="text-xs text-gray-500">{order.customer_name} · {formatDate(order.created_at)}</p>
                                    </div>
                                    <OrderStatusBadge status={order.status} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* статус складу */}
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" /> Закінчуються на складі
                            </h2>
                            <Link href={`${route('admin.inventory.index')}?low_stock=1`} className="text-blue-600 text-sm">Переглянути всі →</Link>
                        </div>
                        {lowStockParts.length > 0 ? (
                            <div className="space-y-2">
                                {lowStockParts.map(part => (
                                    <div key={part.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl">
                                        <div>
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">{part.name}</p>
                                            <p className="text-xs text-gray-500">{part.sku}</p>
                                        </div>
                                        <span className="badge-yellow">залишилось {part.stock_quantity}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-6">Склад укомплектований ✓</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
