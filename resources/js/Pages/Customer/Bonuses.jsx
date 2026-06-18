import { Head, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import Pagination from '@/Components/Pagination';
import { LoyaltyBadge } from '@/Components/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Gift, TrendingUp, Award } from 'lucide-react';

function LevelCard({ level, isCurrent }) {
    return (
        <div className={`card p-4 border-2 transition-all ${isCurrent ? 'border-blue-500 dark:border-blue-400 shadow-md' : 'border-transparent'}`}>
            <div className="flex items-center gap-2 mb-2">
                <LoyaltyBadge level={level.name} color={level.color} />
                {isCurrent && <span className="badge-blue text-xs">Поточний</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">{level.min_points}{level.max_points ? `–${level.max_points}` : '+'} балів</p>
            <p className="text-xs text-gray-500">{level.bonus_multiplier}× примножувач бонусів</p>
            {level.description && <p className="text-xs text-gray-400 mt-1">{level.description}</p>}
        </div>
    );
}

export default function Bonuses({ balance, transactions, levels, currentLevel, nextLevel, progress, totalEarned }) {
    const txTypeLabel = { earn: 'Отримано', spend: 'Витрачено', expire: 'Спливають', manual: 'Бонус', referral: 'Реферал', promo: 'Промо' };
    const { loyalty } = usePage().props;

    return (
        <CustomerLayout title="Бонуси">
            <Head title="Бонуси" />

            <div className="space-y-6">
                <h1 className="page-header">Бонуси та Програма лояльності</h1>

                {/* картка поточного балансу */}
                <div className="card p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-200 text-sm mb-1 uppercase">Поточний баланс</p>
                            <p className="text-5xl font-bold">{balance}</p>
                            <p className="text-blue-200 text-sm mt-1">бонусних балів</p>
                        </div>
                        <Gift className="w-12 h-12 text-blue-300 opacity-60" />
                    </div>
                    {nextLevel && (
                        <div className="mt-5">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-blue-200">Прогрес до наступного рівня - {nextLevel.name}</span>
                                <span className="text-white font-medium">{progress}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-xs text-blue-200 mt-1">залишилось {nextLevel.min_points - balance} балів</p>
                        </div>
                    )}
                </div>

                {/* рівні лояльності */}
                <div>
                    <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-600" /> Рівні лояльності
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {levels.map(level => (
                            <LevelCard key={level.id} level={level} isCurrent={currentLevel?.id === level.id} />
                        ))}
                    </div>
                </div>

                {/* транзакції бонусів */}
                <div className="card overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="font-bold text-gray-900 dark:text-white">Історія транзакцій</h2>
                    </div>
                    {transactions.data.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {transactions.data.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {tx.description ?? txTypeLabel[tx.type] ?? tx.type}
                                        </p>
                                        {tx.order && (
                                            <p className="text-xs text-gray-400">Замовлення {tx.order.number}</p>
                                        )}
                                        <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount} балів
                                        </span>
                                        <p className="text-xs text-gray-400">Баланс: {tx.balance_after}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Тут ще нічого немає.<br />Зробіть ваше перше замовлення щоб отримати бонуси!</p>
                        </div>
                    )}
                    <Pagination links={transactions.links} />
                </div>

                {/* правила програми */}
                <div className="card p-5">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-3">Як працює бонусна програма</h2>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Отримуй {loyalty.points_per_10uah} бонусн{loyalty.points_per_10uah == 1 ? 'ий' : 'і' } бал{loyalty.points_per_10uah > 1 ? 'и' : '' } за кожні 10 грн. сплачених за замовлення</li>
                        {loyalty.welcome_bonus && (
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Бонус за реєстрацію: +{loyalty.welcome_bonus} балів одразу після реєстрації аккаунта</li>
                        )}
                        <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Реферальний бонус: +200 балів, коли хтось реєструється з вашим реферальним кодом</li>
                        <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Сплачуй до {loyalty.max_bonus_spend_pct}% від вартості замовлення бонусними балами</li>
                        {loyalty.bonus_expiry_months > 1 && (
                            <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">!</span> Бонуси можна витратити впродовж {loyalty.bonus_expiry_months} місяців від моменту нарахування</li>
                        )}
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">★</span> Вищий рівень лояльності дає вам більше бонусних балів</li>
                    </ul>
                </div>
            </div>
        </CustomerLayout>
    );
}
