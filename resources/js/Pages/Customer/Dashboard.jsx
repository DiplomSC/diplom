import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { OrderStatusBadge, LoyaltyBadge } from '@/Components/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ShoppingBag, Gift, Star, TrendingUp, Plus, ArrowRight } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, href }) {
    const card = (
        <div className="stat-card hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );
    return href ? <Link href={href}>{card}</Link> : card;
}

export default function Dashboard({ activeOrders, stats, recentBonuses, nextLevel }) {
    return (
        <CustomerLayout title="Дашборд">
            <Head title="Дашборд" />

            <div className="space-y-6">
                {/* статистика */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={ShoppingBag} label="Всього замовлень" value={stats.totalOrders} color="bg-blue-500" href={route('customer.orders.index')} />
                    <StatCard icon={TrendingUp} label="Завершених" value={stats.completedOrders} color="bg-green-500" />
                    <StatCard icon={Gift} label="Баланс бонусів" value={stats.bonusBalance} color="bg-orange-500" href={route('customer.bonuses')} />
                    <div className="stat-card">
                        <p className="text-sm text-gray-900 dark:text-white font-semibold mt-2">Рівень лояльності</p>
                        <div className="flex items-center gap-2">
                            <LoyaltyBadge level={stats.loyaltyLevel} color={stats.loyaltyColor} />
                        </div>
                        
                        {nextLevel && (
                            <p className="text-xs mt-1 text-gray-400">{nextLevel.min_points - stats.bonusBalance} балів до {nextLevel.name}</p>
                        )}
                    </div>
                </div>

                {/* активні замовлення */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900 dark:text-white">Поточні замовлення</h2>
                        <Link href={route('customer.orders.index')} className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1">
                            Всі замовлення <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {activeOrders.length > 0 ? (
                        <div className="space-y-3">
                            {activeOrders.map(order => (
                                <Link key={order.id} href={route('customer.orders.show', order.id)} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-white">{order.number}</p>
                                        <p className="text-xs text-gray-500">{order.device_category?.name} · {formatDate(order.created_at)}</p>
                                    </div>
                                    <OrderStatusBadge status={order.status} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm mb-3">Немає поточних замовлень</p>
                            <Link href={route('order.create')} className="btn-primary btn-sm">
                                <Plus className="w-4 h-4" /> Замовити послугу
                            </Link>
                        </div>
                    )}
                </div>

                {/* отримані бонуси */}
                {recentBonuses.length > 0 && (
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 dark:text-white">Останні отримані бонуси</h2>
                            <Link href={route('customer.bonuses')} className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1">
                                Всі бонуси <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {recentBonuses.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <div>
                                        <p className="text-sm text-gray-900 dark:text-white">{tx.description ?? tx.type}</p>
                                        <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                                    </div>
                                    <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount} балів
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* швидкі дії */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link href={route('order.create')} className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-xl flex items-center justify-center">
                            <Plus className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Новий запит на ремонт</p>
                            <p className="text-sm text-gray-500">Запишіть ваш непрацюючий девайс на ремонт</p>
                        </div>
                    </Link>
                    <Link href={route('track.order')} className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-xl flex items-center justify-center">
                            <Star className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Відстежити замовлення</p>
                            <p className="text-sm text-gray-500">Дізнайтесь статус вашого замовлення онлайн</p>
                        </div>
                    </Link>
                </div>
            </div>
        </CustomerLayout>
    );
}
