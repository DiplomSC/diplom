import { Head, Link, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { OrderStatusBadge, PriorityBadge } from '@/Components/StatusBadge';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { ArrowLeft, Star } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

function TimelineItem({ history, last }) {
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 shrink-0" />
                {!last && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />}
            </div>
            <div className="pb-4 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{history.status_to_label ?? history.status_to}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(history.created_at)}</span>
                    {history.changed_by && <span className="text-xs text-gray-400">by {history.changed_by.name}</span>}
                </div>
                {history.comment && <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{history.comment}</p>}
            </div>
        </div>
    );
}

function ReviewModal({ order, open, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({ rating: 5, body: '' });
    const submit = (e) => {
        e.preventDefault();
        post(route('customer.orders.review', order.id), { onSuccess: () => { onClose(); reset(); } });
    };
    return (
        <Modal open={open} onClose={onClose} title="Залиште відгук" overlayClose="false">
            <form onSubmit={submit} className="space-y-4">
                <div className="form-group">
                    <label className="label">Оцінка</label>
                    <div className="flex gap-1">
                        {[1,2,3,4,5].map(n => (
                            <button key={n} type="button" onClick={() => setData('rating', n)}>
                                <Star className={`w-7 h-7 ${n <= data.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="label">Ваш відгук</label>
                    <textarea className="input h-28 resize-none" value={data.body} onChange={e => setData('body', e.target.value)} placeholder="" />
                    {errors.body && <p className="form-error">{errors.body}</p>}
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Відміна</button>
                    <button type="submit" className="btn-primary flex-1" disabled={processing}>Відправити відгук</button>
                </div>
            </form>
        </Modal>
    );
}

export default function OrderShow({ order }) {
    const [reviewModal, setReviewModal] = useState(false);

    return (
        <CustomerLayout title={`Замовлення ${order.number}`}>
            <Head title={`Замовлення ${order.number}`} />

            <div className="space-y-5">
                <div className="flex items-center gap-3">
                    <Link href={route('customer.orders.index')} className="btn-ghost btn-sm p-2">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <h1 className="page-header">Замовлення {order.number}</h1>
                    <OrderStatusBadge status={order.status} />
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                    {/* загальна інформація */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* пристрій і його проблеми */}
                        <div className="card p-5">
                            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Інформація про пристрій</h2>
                            <dl className="grid grid-cols-2 gap-3 text-sm">
                                <div><dt className="text-gray-500">Категорія</dt><dd className="font-medium text-gray-900 dark:text-white mt-0.5">{order.device_category?.name}</dd></div>
                                <div><dt className="text-gray-500">Бренд / модель</dt><dd className="font-medium text-gray-900 dark:text-white mt-0.5">{[order.device_brand, order.device_model].filter(Boolean).join(' ') || '-'}</dd></div>
                                {order.service && <div><dt className="text-gray-500">Послуга</dt><dd className="font-medium text-gray-900 dark:text-white mt-0.5">{order.service.name}</dd></div>}
                                <div><dt className="text-gray-500">Priority</dt><dd className="mt-0.5"><PriorityBadge priority={order.priority} /></dd></div>
                                {order.estimated_cost && <div><dt className="text-gray-500">Попередня вартість</dt><dd className="font-medium text-gray-900 dark:text-white mt-0.5">{formatCurrency(order.estimated_cost)}</dd></div>}
                                {order.final_cost && <div><dt className="text-gray-500">Фінальна вартість</dt><dd className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{formatCurrency(order.final_cost)}</dd></div>}
                            </dl>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-500 mb-1">Опис проблеми</p>
                                <p className="text-sm text-gray-900 dark:text-white">{order.issue_description}</p>
                            </div>
                            {order.ai_diagnosis && (
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
                                    <p className="text-xs font-semibold text-blue-600 mb-1">Попередня ШІ діагностика</p>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">{order.ai_diagnosis}</p>
                                </div>
                            )}
                        </div>

                        {/* зображення */}
                        {order.images.length > 0 && (
                            <div className="card p-5">
                                <h2 className="font-bold text-gray-900 dark:text-white mb-3">Фото</h2>
                                <div className="flex flex-wrap gap-3">
                                    {order.images.map(img => (
                                        <a key={img.id} href={img.url} target="_blank" rel="noopener">
                                            <img src={img.url} className="w-24 h-24 rounded-lg object-cover hover:scale-105 transition-transform" alt="" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* коментарі */}
                        {order.client_comments.length > 0 && (
                            <div className="card p-5">
                                <h2 className="font-bold text-gray-900 dark:text-white mb-4">Коментарі від майстра</h2>
                                <div className="space-y-3">
                                    {order.client_comments.map(c => (
                                        <div key={c.id} className="flex gap-3">
                                            <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0">
                                                {c.author?.name?.charAt(0) ?? 'T'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{c.author?.name ?? 'Майстер'}</span>
                                                    <span className="text-xs text-gray-400">{formatDateTime(c.created_at)}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{c.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* правий сайдбар */}
                    <div className="space-y-5">
                        {/* історія зміни статусів */}
                        <div className="card p-5">
                            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Прогрес</h2>
                            {order.status_history.map((h, i) => (
                                <TimelineItem key={h.id} history={h} last={i === order.status_history.length - 1} />
                            ))}
                        </div>

                        {/* підсумок вартості */}
                        {(order.final_cost || order.estimated_cost) && (
                            <div className="card p-5">
                                <h2 className="font-bold text-gray-900 dark:text-white mb-4">Підсумок вартості</h2>
                                <div className="space-y-2 text-sm">
                                    {order.estimated_cost && (
                                        <div className="flex justify-between"><span className="text-gray-500">Вартість</span><span>{formatCurrency(order.estimated_cost)}</span></div>
                                    )}
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600 dark:text-green-400"><span>Знижка</span><span>−{formatCurrency(order.discount)}</span></div>
                                    )}
                                    {order.bonus_used > 0 && (
                                        <div className="flex justify-between text-orange-500"><span>Використано бонусів</span><span>−{order.bonus_used} балів</span></div>
                                    )}
                                    {order.final_cost && (
                                        <div className="flex justify-between font-bold border-t border-gray-100 dark:border-gray-700 pt-2 text-blue-600 dark:text-blue-400 text-base">
                                            <span>Всього</span><span>{formatCurrency(order.total_paid ?? order.final_cost)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* відгук */}
                        {order.status === 'completed' && !order.review && (
                            <button onClick={() => setReviewModal(true)} className="btn-primary w-full">
                                <Star className="w-4 h-4" /> Залишити відгук
                            </button>
                        )}
                        {order.review && (
                            <div className="card p-4 text-center">
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Відгук надісланий</p>
                                <div className="flex justify-center gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < order.review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ReviewModal order={order} open={reviewModal} onClose={() => setReviewModal(false)} />
        </CustomerLayout>
    );
}
