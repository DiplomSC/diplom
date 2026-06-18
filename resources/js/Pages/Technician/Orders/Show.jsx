import { Head, Link, useForm, router } from '@inertiajs/react';
import TechLayout from '@/Layouts/TechLayout';
import { OrderStatusBadge, PriorityBadge } from '@/Components/StatusBadge';
import { formatDate, formatDateTime, formatCurrency, ORDER_STATUS_LABELS } from '@/lib/utils';
import { ArrowLeft, Plus, Trash2, MessageSquare, Package } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function TechOrderShow({ order, parts, statuses }) {
    const [statusModal, setStatusModal] = useState(false);
    const [partModal, setPartModal] = useState(false);

    const statusForm = useForm({
        status: order.status,
        comment: '',
        is_internal: false,
        final_cost: order.final_cost ?? '',
    });

    const commentForm = useForm({ body: '', is_internal: false });
    const partForm = useForm({ part_id: '', quantity: 1 });

    const submitStatus = (e) => {
        e.preventDefault();
        statusForm.patch(route('tech.orders.status', order.id), { onSuccess: () => setStatusModal(false) });
    };

    const submitComment = (e) => {
        e.preventDefault();
        commentForm.post(route('tech.orders.comment', order.id), { onSuccess: () => commentForm.reset() });
    };

    const submitPart = (e) => {
        e.preventDefault();
        partForm.post(route('tech.orders.parts.add', order.id), { onSuccess: () => { setPartModal(false); partForm.reset(); } });
    };

    const acceptOrder = () => {
        router.post(route('tech.orders.accept', order.id));
    };

    return (
        <TechLayout title={`Замовлення ${order.number}`}>
            <Head title={`Замовлення ${order.number}`} />

            <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                    <Link href={route('tech.orders.index')} className="btn-ghost btn-sm p-2">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Замовлення {order.number}</h1>
                    <OrderStatusBadge status={order.status} />
                    <PriorityBadge priority={order.priority} />
                    <div className="ml-auto flex gap-2">
                        {order.status === 'new' && !order.technician_id && (
                            <button onClick={acceptOrder} className="btn-primary btn-sm">Прийняти замовлення</button>
                        )}
                        {order.technician_id && (
                            <button onClick={() => setStatusModal(true)} className="btn-primary btn-sm">Змінити статус</button>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-5">
                        {/* пристрій */}
                        <div className="card p-5">
                            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Пристрій</h2>
                            <dl className="grid grid-cols-2 gap-3 text-sm mb-4">
                                <div><dt className="text-gray-500">Клієнт</dt><dd className="font-medium text-gray-900 dark:text-white mt-0.5">{order.customer_name}</dd></div>
                                <div><dt className="text-gray-500">Номер телефону</dt><dd className="font-medium text-gray-900 dark:text-white mt-0.5">{order.customer_phone}</dd></div>
                                <div><dt className="text-gray-500">Тип пристрою</dt><dd className="font-medium text-gray-900 dark:text-white mt-0.5">{order.device_category?.name}</dd></div>
                                <div><dt className="text-gray-500">Модель</dt><dd className="font-medium text-gray-900 dark:text-white mt-0.5">{[order.device_brand, order.device_model].filter(Boolean).join(' ') || '—'}</dd></div>
                                {order.estimated_cost && <div><dt className="text-gray-500">Попередня вартість</dt><dd className="font-medium text-gray-900 dark:text-white mt-0.5">{formatCurrency(order.estimated_cost)}</dd></div>}
                                {order.final_cost && <div><dt className="text-gray-500">Фінальна вартість</dt><dd className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{formatCurrency(order.final_cost)}</dd></div>}
                            </dl>
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-500 mb-1">Опис проблеми</p>
                                <p className="text-sm text-gray-900 dark:text-white">{order.issue_description}</p>
                            </div>
                            {order.ai_diagnosis && (
                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-sm">
                                    <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">ШІ діагноз</p>
                                    <p className="text-blue-800 dark:text-blue-300">{order.ai_diagnosis}</p>
                                </div>
                            )}
                        </div>

                        {/* фото */}
                        {order.images.length > 0 && (
                            <div className="card p-5">
                                <h2 className="font-bold text-gray-900 dark:text-white mb-3">Фото пристрою</h2>
                                <div className="flex flex-wrap gap-3">
                                    {order.images.map(img => (
                                        <a key={img.id} href={img.url} target="_blank" rel="noopener">
                                            <img src={img.url} className="w-24 h-24 rounded-lg object-cover" alt="" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* використані запчастини */}
                        <div className="card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Package className="w-4 h-4" /> Використані запчастини
                                </h2>
                                {order.technician_id && (
                                    <button onClick={() => setPartModal(true)} className="btn-ghost btn-sm text-sm">
                                        <Plus className="w-4 h-4" /> Додати
                                    </button>
                                )}
                            </div>
                            {order.order_parts.length > 0 ? (
                                <div className="space-y-2">
                                    {order.order_parts.map(op => (
                                        <div key={op.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">{op.part?.name}</span>
                                                <span className="text-gray-400 ml-2">×{op.quantity}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{formatCurrency(op.total_price)}</span>
                                                {order.technician_id && (
                                                    <button onClick={() => router.delete(route('tech.orders.parts.remove', [order.id, op.part_id]))} className="text-red-500 hover:text-red-700">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-3">Ще немає запчастин</p>
                            )}
                        </div>

                        {/* коментарі */}
                        <div className="card p-5">
                            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Коментарі
                            </h2>
                            {order.comments.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {order.comments.map(c => (
                                        <div key={c.id} className={`p-3 rounded-xl text-sm ${c.is_internal ? 'bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900 dark:text-white">{c.author?.name}</span>
                                                {c.is_internal && <span className="badge-yellow text-xs">Для внутрішнього використання</span>}
                                                <span className="text-xs text-gray-400 ml-auto">{formatDateTime(c.created_at)}</span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300">{c.body}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {order.technician_id && (
                                <form onSubmit={submitComment} className="space-y-3">
                                    <textarea
                                        className="input h-24 resize-none text-sm"
                                        value={commentForm.data.body}
                                        onChange={e => commentForm.setData('body', e.target.value)}
                                        placeholder="Ваш коментар..."
                                    />
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                                            <input type="checkbox" checked={commentForm.data.is_internal} onChange={e => commentForm.setData('is_internal', e.target.checked)} />
                                            для внутрішнього використання
                                        </label>
                                        <button type="submit" className="btn-primary btn-sm ml-auto" disabled={commentForm.processing}>Додати коментар</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* історія статусів */}
                    <div className="space-y-5">
                        <div className="card p-5">
                            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Прогрес</h2>
                            {order.status_history.map((h) => (
                                <div key={h.id} className="flex gap-3 pb-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                                        <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{ORDER_STATUS_LABELS[statuses[h.status_to]] ?? ORDER_STATUS_LABELS[h.status_to]}</p>
                                        <p className="text-xs text-gray-400">{formatDateTime(h.created_at)}</p>
                                        {h.comment && <p className="text-xs text-gray-500 mt-0.5">{h.comment}</p>}
                                    </div>
                                </div>
                            ))}
                            {/* поточний статус */}
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
            </div>

            {/* зміна статусу (модал) */}
            <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Змінити статус замовлення" overlayClose="false">
                <form onSubmit={submitStatus} className="space-y-4">
                    <div className="form-group">
                        <label className="label">Новий статус</label>
                        <select className="input" value={statusForm.data.status} onChange={e => statusForm.setData('status', e.target.value)}>
                            {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{ORDER_STATUS_LABELS[k]}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Фінальна вартість</label>
                        <input className="input" type="number" step="0.01" value={statusForm.data.final_cost} onChange={e => statusForm.setData('final_cost', e.target.value)} placeholder="0.00" />
                    </div>
                    <div className="form-group">
                        <label className="label">Коментар (видимий для клієнта)</label>
                        <textarea className="input h-24 resize-none" value={statusForm.data.comment} onChange={e => statusForm.setData('comment', e.target.value)} />
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={statusForm.data.is_internal} onChange={e => statusForm.setData('is_internal', e.target.checked)} />
                        тільки для внутрішнього використання
                    </label>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setStatusModal(false)} className="btn-ghost flex-1">Відміна</button>
                        <button type="submit" className="btn-primary flex-1" disabled={statusForm.processing}>Зберегти</button>
                    </div>
                </form>
            </Modal>

            {/* додати запчастину (модал) */}
            <Modal open={partModal} onClose={() => setPartModal(false)} title="Додати запчастину" overlayClose="false">
                <form onSubmit={submitPart} className="space-y-4">
                    <div className="form-group">
                        <label className="label">Запчастина</label>
                        <select className="input" value={partForm.data.part_id} onChange={e => partForm.setData('part_id', e.target.value)}>
                            <option value="">Оберіть...</option>
                            {parts.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity}) — {formatCurrency(p.sell_price)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Кількість</label>
                        <input className="input" type="number" min="1" value={partForm.data.quantity} onChange={e => partForm.setData('quantity', parseInt(e.target.value))} />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setPartModal(false)} className="btn-ghost flex-1">Відміна</button>
                        <button type="submit" className="btn-primary flex-1" disabled={partForm.processing}>Додати</button>
                    </div>
                </form>
            </Modal>
        </TechLayout>
    );
}
