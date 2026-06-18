import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { OrderStatusBadge, PriorityBadge } from '@/Components/StatusBadge';
import { formatDate, formatDateTime, formatCurrency, ORDER_STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Modal from '@/Components/Modal';
import { useState } from 'react';

export default function AdminOrderShow({ order, technicians, statuses }) {
    const [editModal, setEditModal] = useState(false);

    const form = useForm({
        status:         order.status,
        technician_id:  order.technician_id ?? '',
        priority:       order.priority,
        estimated_cost: order.estimated_cost ?? '',
        final_cost:     order.final_cost ?? '',
        admin_notes:    order.admin_notes ?? '',
        deadline_at:    order.deadline_at ? order.deadline_at.substring(0, 16) : '',
        comment:        '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.patch(route('admin.orders.update', order.id), { onSuccess: () => setEditModal(false) });
    };

    return (
        <AdminLayout title={`Замовлення ${order.number}`}>
            <Head title={`Замовлення ${order.number}`} />

            <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                    <Link href={route('admin.orders.index')} className="btn-ghost btn-sm p-2">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Замовлення {order.number}</h1>
                    <OrderStatusBadge status={order.status} />
                    <PriorityBadge priority={order.priority} />
                    <button onClick={() => setEditModal(true)} className="btn-primary btn-sm ml-auto">Редагувати</button>
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="card p-5">
                            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Деталі замовлення</h2>
                            <dl className="grid grid-cols-2 gap-3 text-sm">
                                <div><dt className="text-gray-500">Кліент</dt><dd className="font-medium text-gray-900 dark:text-white mt-0.5">{order.customer_name}</dd></div>
                                <div><dt className="text-gray-500">Телефон</dt><dd className="font-medium mt-0.5">{order.customer_phone}</dd></div>
                                <div><dt className="text-gray-500">Email</dt><dd className="font-medium mt-0.5">{order.customer_email ?? '—'}</dd></div>
                                <div><dt className="text-gray-500">Майстер</dt><dd className="font-medium mt-0.5">{order.technician?.name ?? <span className="text-yellow-500">Не призначений</span>}</dd></div>
                                <div><dt className="text-gray-500">Пристрій</dt><dd className="font-medium mt-0.5">{order.device_category?.name}</dd></div>
                                <div><dt className="text-gray-500">Модель</dt><dd className="font-medium mt-0.5">{[order.device_brand, order.device_model].filter(Boolean).join(' ') || '—'}</dd></div>
                                {order.estimated_cost && <div><dt className="text-gray-500">Розрахована вартість</dt><dd className="font-medium mt-0.5">{formatCurrency(order.estimated_cost)}</dd></div>}
                                {order.final_cost && <div><dt className="text-gray-500">Фінальна вартість</dt><dd className="font-bold text-blue-600 mt-0.5">{formatCurrency(order.final_cost)}</dd></div>}
                                {order.deadline_at && <div><dt className="text-gray-500">Дедлайн</dt><dd className="font-medium mt-0.5">{formatDate(order.deadline_at)}</dd></div>}
                            </dl>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-500 mb-1">Заявлена несправність</p>
                                <p className="text-sm text-gray-900 dark:text-white">{order.issue_description}</p>
                            </div>
                            {order.admin_notes && (
                                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                                    <p className="text-xs font-semibold text-yellow-700 mb-1">Примітка адміністратора</p>
                                    <p className="text-sm text-yellow-800 dark:text-yellow-300">{order.admin_notes}</p>
                                </div>
                            )}
                        </div>

                        {/* використані запчастини */}
                        {order.order_parts.length > 0 && (
                            <div className="card p-5">
                                <h2 className="font-bold text-gray-900 dark:text-white mb-3">Використані деталі</h2>
                                <div className="space-y-2">
                                    {order.order_parts.map(op => (
                                        <div key={op.id} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <span className="font-medium">{op.part?.name} ×{op.quantity}</span>
                                            <span>{formatCurrency(op.total_price)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* коментарі */}
                        {order.comments.length > 0 && (
                            <div className="card p-5">
                                <h2 className="font-bold text-gray-900 dark:text-white mb-4">Коментарі</h2>
                                <div className="space-y-3">
                                    {order.comments.map(c => (
                                        <div key={c.id} className={`p-3 rounded-xl text-sm ${c.is_internal ? 'bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900 dark:text-white">{c.author?.name}</span>
                                                {c.is_internal && <span className="badge-yellow text-xs">Internal</span>}
                                                <span className="text-xs text-gray-400 ml-auto">{formatDateTime(c.created_at)}</span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300">{c.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* таймлайн зміни статусів */}
                    <div className="card p-5">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Прогрес</h2>
                        {order.status_history.map((h, i) => (
                            <div key={h.id} className="flex gap-3 pb-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                                    <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{ORDER_STATUS_LABELS[statuses[h.status_to]] ?? ORDER_STATUS_LABELS[h.status_to]}</p>
                                    <p className="text-xs text-gray-400">{formatDateTime(h.created_at)}{h.changed_by ? ` · ${h.changed_by.name}` : ''}</p>
                                    {h.comment && <p className="text-xs text-gray-500 mt-0.5">{h.comment}</p>}
                                </div>
                            </div>
                        ))}
                        {/* актуальний статус */}
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mt-1 shrink-0 ring-4 ring-green-100 dark:ring-green-900/40" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">{ORDER_STATUS_LABELS[statuses[order.status]] ?? ORDER_STATUS_LABELS[order.status]} <span className="text-xs font-normal text-gray-400">(поточний)</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal open={editModal} onClose={() => setEditModal(false)} title="Редагувати замовлення" maxWidth="lg">
                <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="label">Статус</label>
                        <select className="input" value={form.data.status} onChange={e => form.setData('status', e.target.value)}>
                            {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{ORDER_STATUS_LABELS[k]}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Відповідальний майстер</label>
                        <select className="input" value={form.data.technician_id} onChange={e => form.setData('technician_id', e.target.value)}>
                            <option value="">Не призначений</option>
                            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Пріорітет</label>
                        <select className="input" value={form.data.priority} onChange={e => form.setData('priority', e.target.value)}>
                            {['low', 'normal', 'high', 'urgent'].map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Дедлайн</label>
                        <input className="input" type="datetime-local" value={form.data.deadline_at} onChange={e => form.setData('deadline_at', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="label">Розрахована вартість, ₴</label>
                        <input className="input" type="number" step="0.01" value={form.data.estimated_cost} onChange={e => form.setData('estimated_cost', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="label">Фінальна вартість, ₴</label>
                        <input className="input" type="number" step="0.01" value={form.data.final_cost} onChange={e => form.setData('final_cost', e.target.value)} />
                    </div>
                    <div className="form-group sm:col-span-2">
                        <label className="label">Коментар до зміни статусу</label>
                        <input className="input" value={form.data.comment} onChange={e => form.setData('comment', e.target.value)} />
                    </div>
                    <div className="form-group sm:col-span-2">
                        <label className="label">Примітка адміністратора (внутрішня)</label>
                        <textarea className="input h-20 resize-none" value={form.data.admin_notes} onChange={e => form.setData('admin_notes', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2 flex gap-3">
                        <button type="button" onClick={() => setEditModal(false)} className="btn-ghost flex-1">Відміна</button>
                        <button type="submit" className="btn-primary flex-1" disabled={form.processing}>Зберегти</button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
