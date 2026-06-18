import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { OrderStatusBadge } from '@/Components/StatusBadge';
import { formatDate, formatDateTime, formatCurrency, ORDER_STATUS_LABELS } from '@/lib/utils';
import { Search, CheckCircle, Clock, Package, Wrench } from 'lucide-react';

function TimelineItem({ history }) {
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
            </div>
            <div className="pb-4">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {history.status_to_label ?? ORDER_STATUS_LABELS[history.status_to]}
                    </span>
                    <span className="text-xs text-gray-400">{formatDateTime(history.created_at)}</span> 
                </div>
                {history.comment && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{history.comment}</p>
                )}
            </div>
        </div>
    );
}

export default function TrackOrder({ order, found }) {
    const { data, setData, post, processing, errors } = useForm({ number: '', phone: '' });
    
    const query = new URLSearchParams(document.location.search);
    const order_number = query.get('order');
    const phone_number = query.get('phone');
    data.number = (data.number == '' && order_number != '') ? order_number : data.number;
    data.phone = (data.phone == '' && phone_number != '') ? phone_number : data.phone;

    return (
        <AppLayout>
            <Head title="Відстежити замовлення" />
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-3">Відстежити замовлення</h1>
                    <p className="text-blue-100">Введіть номер замовлення та ваш номер телефону щоб дізнатися статус замовлення</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
                {/* форма пошуку */}
                <div className="card p-6 mb-6">
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-5">Пошук замовлення</h2>
                    <form onSubmit={(e) => { e.preventDefault(); post(route('track.order.search')); }} className="space-y-4">
                        <div className="form-group">
                            <label className="label">Номер замовлення</label>
                            <input
                                className="input"
                                value={data.number}
                                onChange={e => setData('number', e.target.value)}
                                placeholder="SC-2024-00001"
                            />
                            {errors.number && <p className="form-error">{errors.number}</p>}
                        </div>
                        <div className="form-group">
                            <label className="label">Номер телефону</label>
                            <input
                                className="input"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                placeholder="(055) 000-00-00"
                            />
                            {errors.phone && <p className="form-error">{errors.phone}</p>}
                        </div>
                        <button type="submit" className="btn-primary w-full" disabled={processing}>
                            <Search className="w-4 h-4" />
                            {processing ? 'Шукаємо...' : 'Знайти моє замовлення'}
                        </button>
                    </form>
                </div>

                {/* результат пошуку */}
                {found && order && (
                    <div className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{order.number}</h3>
                                <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                            </div>
                            <OrderStatusBadge status={order.status} />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
                            <div><span className="text-gray-500">Пристрій:</span> <span className="font-medium text-gray-900 dark:text-white">{[order.device_brand, order.device_model].filter(Boolean).join(' ') || order.device_category?.name}</span></div>
                            <div><span className="text-gray-500">Категорія:</span> <span className="font-medium text-gray-900 dark:text-white">{order.device_category?.name}</span></div>
                            {order.estimated_cost && <div><span className="text-gray-500">Приблизна вартість:</span> <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.estimated_cost)}</span></div>}
                            {order.final_cost && <div><span className="text-gray-500">Фінальна вартість:</span> <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(order.final_cost)}</span></div>}
                        </div>

                        {order.status_history?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Прогрес</h4>
                                <div>
                                    {order.status_history.map(h => <TimelineItem key={h.id} history={h} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {found === false && (
                    <div className="card p-6 text-center">
                        <p className="text-red-600 dark:text-red-400">Замовлення не знайдено. Перевірте номер замовлення і номер телефону.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
