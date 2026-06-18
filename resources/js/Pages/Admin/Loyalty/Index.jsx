import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/lib/utils';
import { Plus, Edit, Trash2, Gift } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

function LevelModal({ level, onClose }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: level?.name ?? '',
        min_points: level?.min_points ?? 0,
        max_points: level?.max_points ?? '',
        bonus_multiplier: level?.bonus_multiplier ?? 1,
        max_spend_percent: level?.max_spend_percent ?? 30,
        color: level?.color ?? 'gray',
        description: level?.description ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (level) {
            patch(route('admin.loyalty.levels.update', level.id), { onSuccess: () => { onClose(); reset(); } });
        } else {
            post(route('admin.loyalty.levels.store'), { onSuccess: () => { onClose(); reset(); } });
        }
    };

    return (
        <Modal open title={level ? 'Редагувати рівень' : 'Новий рівень'} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group col-span-2">
                        <label className="label">Назва</label>
                        <input className="input" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Gold" />
                        {errors.name && <p className="form-error">{errors.name}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">Мінімум балів</label>
                        <input className="input" type="number" min="0" value={data.min_points} onChange={e => setData('min_points', e.target.value)} />
                        {errors.min_points && <p className="form-error">{errors.min_points}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">Примножувач бонусів</label>
                        <input className="input" type="number" step="0.01" min="1" value={data.bonus_multiplier} onChange={e => setData('bonus_multiplier', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="label">Макс. % оплати бонусами</label>
                        <input className="input" type="number" min="0" max="100" value={data.max_spend_percent} onChange={e => setData('max_spend_percent', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="label">Максимум бонусів</label>
                        <input className="input" type="number" min="0" value={data.max_points} onChange={e => setData('max_points', e.target.value)} placeholder="Залиште пустим для безліму" />
                    </div>
                    <div className="form-group">
                        <label className="label">Колір</label>
                        <select className="input" value={data.color} onChange={e => setData('color', e.target.value)}>
                            {['gray', 'blue', 'green', 'yellow', 'orange', 'red', 'purple'].map(c => (
                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label className="label">Опис</label>
                    <textarea className="input h-20 resize-none" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Опишіть що дає цей рівень…" />
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Відміна</button>
                    <button type="submit" className="btn-primary flex-1" disabled={processing}>{level ? 'Зберегти' : 'Додати рівень'}</button>
                </div>
            </form>
        </Modal>
    );
}

function PromoModal({ promo, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: promo?.code ?? '',
        type: promo?.type ?? 'percent',
        value: promo?.value ?? '',
        max_uses: promo?.max_uses ?? '',
        expires_at: promo?.expires_at ? promo.expires_at.slice(0, 10) : '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.loyalty.promo.store'), { onSuccess: () => { onClose(); reset(); } });
    };

    return (
        <Modal open title="Новий промокод" onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <div className="form-group">
                    <label className="label">Код</label>
                    <input className="input uppercase" value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())} placeholder="DIPLOM26" />
                    {errors.code && <p className="form-error">{errors.code}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="label">Тип знижки</label>
                        <select className="input" value={data.type} onChange={e => setData('type', e.target.value)}>
                            <option value="percent">Відсоток (%)</option>
                            <option value="fixed">Фіксована (грн)</option>
                            <option value="bonus_points">Бонуси</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Кількість</label>
                        <input className="input" type="number" step="0.01" min="0" value={data.value} onChange={e => setData('value', e.target.value)} />
                        {errors.value && <p className="form-error">{errors.value}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">Ліміт застосувань</label>
                        <input className="input" type="number" min="1" value={data.max_uses} onChange={e => setData('max_uses', e.target.value)} placeholder="Безлім" />
                    </div>
                    <div className="form-group">
                        <label className="label">Дійсний до</label>
                        <input className="input" type="date" value={data.expires_at} onChange={e => setData('expires_at', e.target.value)} />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Відміна</button>
                    <button type="submit" className="btn-primary flex-1" disabled={processing}>Додати код</button>
                </div>
            </form>
        </Modal>
    );
}

export default function LoyaltyIndex({ levels, promoCodes }) {
    const [levelModal, setLevelModal] = useState(null);
    const [promoModal, setPromoModal] = useState(false);

    const destroyLevel = (level) => {
        if (!confirm(`Видалити рівень "${level.name}"? Інснуючим клієнтам з цим рівнем НЕ буде автоматично призначений інший рівень.`)) return;
        router.delete(route('admin.loyalty.levels.destroy', level.id));
    };

    const destroyPromo = (promo) => {
        if (!confirm(`Видалити промокод "${promo.code}"?`)) return;
        router.delete(route('admin.loyalty.promo.destroy', promo.id));
    };

    return (
        <AdminLayout title="Програма лояльності">
            <Head title="Програма лояльності" />

            <div className="space-y-8">
                {/* рівні лояльності */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-bold text-gray-900 dark:text-white">Рівні лояльності</h2>
                        <button onClick={() => setLevelModal('create')} className="btn-primary btn-sm">
                            <Plus className="w-4 h-4" /> Додати рівень
                        </button>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {levels.map(level => (
                            <div key={level.id} className="card p-4 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`badge badge-${level.color ?? 'gray'}`}>{level.name}</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => setLevelModal(level)} className="btn-ghost btn-sm p-1">
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => destroyLevel(level)} className="btn-ghost btn-sm p-1 text-red-500 hover:text-red-600">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500">Мінімум: <span className="font-medium text-gray-900 dark:text-white">{level.min_points} балів</span></p>
                                <p className="text-sm text-gray-500">Примножувач: <span className="font-medium text-gray-900 dark:text-white">{level.bonus_multiplier}×</span></p>
                                {level.description && <p className="text-xs text-gray-400 mt-2">{level.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* промокоди */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-bold text-gray-900 dark:text-white">Промокоди</h2>
                        <button onClick={() => setPromoModal(true)} className="btn-primary btn-sm">
                            <Gift className="w-4 h-4" /> Додати промокод
                        </button>
                    </div>
                    <div className="table-wrapper">
                        <table className="table-base">
                            <thead>
                                <tr>
                                    <th>Код</th>
                                    <th>Знижка</th>
                                    <th>Використаний</th>
                                    <th>Дійсний до</th>
                                    <th>Статус</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {promoCodes.map(promo => (
                                    <tr key={promo.id}>
                                        <td className="font-mono font-bold">{promo.code}</td>
                                        <td>{promo.type === 'percent' ? `${promo.value}%` : promo.type === 'fixed' ? `${promo.value} грн.` : `+${promo.value} бонусів`}</td>
                                        <td>{promo.used_count ?? 0}{promo.max_uses ? ` / ${promo.max_uses}` : ' / ∞'}</td>
                                        <td>{promo.expires_at ? formatDate(promo.expires_at) : '—'}</td>
                                        <td>
                                            <span className={`badge ${promo.is_active ? 'badge-green' : 'badge-gray'}`}>
                                                {promo.is_active ? 'Активний' : 'Не активний'}
                                            </span>
                                        </td>
                                        <td>
                                            <button onClick={() => destroyPromo(promo)} className="btn-ghost btn-sm p-1.5 text-red-500 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {promoCodes.length === 0 && (
                                    <tr><td colSpan={6} className="text-center text-gray-400 py-6">Ще немає промокодів</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {levelModal && (
                <LevelModal level={levelModal === 'create' ? null : levelModal} onClose={() => setLevelModal(null)} />
            )}
            {promoModal && <PromoModal onClose={() => setPromoModal(false)} />}
        </AdminLayout>
    );
}
