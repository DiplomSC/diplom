import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { OrderStatusBadge, LoyaltyBadge } from '@/Components/StatusBadge';
import { formatDate, formatDateTime, formatCurrency, USER_ROLES } from '@/lib/utils';
import { ArrowLeft, Ban, Eye, CheckCircle, Gift } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

function AddBonusModal({ user, onClose }) {
    const { data, setData, post, processing, errors } = useForm({ amount: '', description: '' });
    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.bonus', user.id), { onSuccess: onClose });
    };
    return (
        <Modal open title={`Додати бонусів для ${user.name}`} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <div className="form-group">
                    <label className="label">Бонусні бали</label>
                    <input className="input" type="number" value={data.amount} onChange={e => setData('amount', e.target.value)} placeholder="100 або -50" />
                    {errors.amount && <p className="form-error">{errors.amount}</p>}
                    <small>від'ємне значення для зменшення</small>
                </div>
                <div className="form-group">
                    <label className="label">Опис/причина нарахування</label>
                    <input className="input" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Компенсація за затримку" />
                    {errors.description && <p className="form-error">{errors.description}</p>}
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Відміна</button>
                    <button type="submit" className="btn-primary flex-1" disabled={processing}>Застосувати</button>
                </div>
            </form>
        </Modal>
    );
}

export default function UserShow({ user, orders = [], bonusTransactions = [] }) {
    const [bonusModal, setBonusModal] = useState(false);

    const toggleBlock = () => {
        if (!confirm(user.is_blocked ? `Розблокувати ${user.name}?` : `Блокувати ${user.name}?`)) return;
        router.patch(route('admin.users.update', user.id), { is_blocked: !user.is_blocked });
    };

    return (
        <AdminLayout title={user.name}>
            <Head title={user.name} />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('admin.users.index')} className="btn-ghost btn-sm p-2">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <h1 className="page-header">{user.name}</h1>
                    {user.is_blocked && <span className="badge badge-red">Заблокований</span>}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* картка профілю */}
                    <div className="space-y-5">
                        <div className="card p-5">
                            <div className="flex items-center gap-4 mb-4">
                                {user.avatar ? (
                                    <img src={user.avatar} className="w-14 h-14 rounded-full object-cover" alt={user.name} />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 font-bold text-xl">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Роль</dt>
                                    <dd><span className="badge badge-blue capitalize">{USER_ROLES[user.roles[0]?.name ?? 'user']}</span></dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Телефон</dt>
                                    <dd className="text-gray-900 dark:text-white">{user.phone ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Зареєстрований</dt>
                                    <dd className="text-gray-900 dark:text-white">{formatDate(user.created_at)}</dd>
                                </div>
                                {user.roles?.[0]?.name == 'user' && (<>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Рівень</dt>
                                        <dd><LoyaltyBadge level={user.loyalty_level?.name} color={user.loyalty_level?.color} /></dd>
                                    </div>    
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Бонуси</dt>
                                        <dd className="font-semibold text-orange-500">{user.bonus_balance}</dd>
                                    </div>
                                </>)}
                            </dl>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button onClick={() => setBonusModal(true)} className="btn-secondary w-full">
                                <Gift className="w-4 h-4" /> Налаштування бонусів
                            </button>
                            <button onClick={toggleBlock} className={`w-full ${user.is_blocked ? 'btn-secondary' : 'btn-danger'}`}>
                                {user.is_blocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                {user.is_blocked ? 'Розблокувати' : 'Блокувати'}
                            </button>
                        </div>
                    </div>

                    {/* історія замовлень та бонусів */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* замовлення */}
                        <div className="card p-5">
                            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Історія замовлень ({orders.length})</h2>
                            {orders.length > 0 ? (
                                <div className="table-wrapper">
                                    <table className="table-base text-xs">
                                        <thead>
                                            <tr>
                                                <th>Замовлення</th>
                                                <th>Пристрій</th>
                                                <th>Статус</th>
                                                <th>Вартість</th>
                                                <th>Дата</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id}>
                                                    <td className="font-mono font-medium">{order.number}</td>
                                                    <td className="text-sm">{order.device_brand} {order.device_model}</td>
                                                    <td className="whitespace-nowrap"><OrderStatusBadge status={order.status} /></td>
                                                    <td>{order.final_cost ? formatCurrency(order.final_cost) : order.estimated_cost ? formatCurrency(order.estimated_cost) : '—'}</td>
                                                    <td>{formatDate(order.created_at)}</td>
                                                    <td>
                                                        <Link href={route('admin.orders.show', order.id)} className="text-blue-600 dark:text-blue-400 text-xs hover:underline"><Eye className="w-4 h-4" /></Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-6">Ще не має замовлень =(</p>
                            )}
                        </div>

                        {/* історія руху бонусів */}
                        {bonusTransactions.length > 0 && (
                            <div className="card p-5">
                                <h2 className="font-bold text-gray-900 dark:text-white mb-4">Історія бонусів</h2>
                                <div className="space-y-2">
                                    {bonusTransactions.map(tx => (
                                        <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <div>
                                                <p className="text-sm text-gray-900 dark:text-white">{tx.description ?? tx.type}</p>
                                                <p className="text-xs text-gray-400">{formatDateTime(tx.created_at)}</p>
                                            </div>
                                            <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {bonusModal && <AddBonusModal user={user} onClose={() => setBonusModal(false)} />}
        </AdminLayout>
    );
}
