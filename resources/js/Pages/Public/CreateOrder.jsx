import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import axios from 'axios';
import { Upload, X, Sparkles, ChevronRight, Gift } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
 
export default function CreateOrder({ categories, services }) {
    const { auth } = usePage().props;
    const [aiDiagnosis, setAiDiagnosis] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [promoValid, setPromoValid] = useState(null);
    const [previews, setPreviews] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        customer_name:       auth.user?.name ?? '',
        customer_phone:      auth.user?.phone ?? '',
        customer_email:      auth.user?.email ?? '',
        device_category_id:  '',
        service_id:          '',
        device_brand:        '',
        device_model:        '',
        issue_description:   '',
        images:              [],
        promo_code:          '',
        bonus_used:          0,
    });

    const filteredServices = data.device_category_id
        ? services.filter(s => s.device_category_id == data.device_category_id)
        : [];

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        setData('images', files);
        setPreviews(files.map(f => URL.createObjectURL(f)));
    };

    const removeImage = (i) => {
        const imgs = [...data.images];
        imgs.splice(i, 1);
        setData('images', imgs);
        setPreviews(prev => { const p = [...prev]; p.splice(i, 1); return p; });
    };

    const runAiDiagnosis = async () => {
        if (!data.issue_description || data.issue_description.length < 10) return;
        setAiLoading(true);
        try {
            const cat = categories.find(c => c.id == data.device_category_id);
            const { data: result } = await axios.post(route('ai.diagnose'), {
                device_type:  cat?.name ?? 'Невідомо',
                device_model: `${data.device_brand} ${data.device_model}`.trim(),
                description:  data.issue_description,
            });
            setAiDiagnosis(result);
        } catch {}
        setAiLoading(false);
    };

    const validatePromo = async () => {
        if (!data.promo_code) return;
        try {
            const { data: result } = await axios.post(route('customer.bonuses.validate-promo'), { code: data.promo_code });
            setPromoValid({ valid: true, ...result });
        } catch (e) {
            setPromoValid({ valid: false, message: e.response?.data?.message ?? 'Невірний промокод' });
        }
    };

    return (
        <AppLayout>
            <Head title="Нове замовлення" />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <div className="mb-6">
                    <h1 className="page-header">Нове замовлення</h1>
                    <p className="text-gray-500 mt-1">Розкажіть нам про свій пристрій і проблеми з ним.</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); post(route('order.store')); }} className="space-y-6">
                    {/* контакти */}
                    <div className="card p-6">
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Ваша контактна інформація</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="label">Повне ім'я*</label>
                                <input className="input" value={data.customer_name} onChange={e => setData('customer_name', e.target.value)} placeholder="John Doe" />
                                {errors.customer_name && <p className="form-error">Це обов'язкове поле</p>}
                            </div>
                            <div className="form-group">
                                <label className="label">Номер телефону*</label>
                                <input className="input" value={data.customer_phone} onChange={e => setData('customer_phone', e.target.value)} placeholder="055 000-00-00" />
                                {errors.customer_phone && <p className="form-error">Це обов'язкове поле</p>}
                            </div>
                            <div className="form-group sm:col-span-2">
                                <label className="label">Email</label>
                                <input className="input" type="email" value={data.customer_email} onChange={e => setData('customer_email', e.target.value)} placeholder="your@email.com" />
                            </div>
                        </div>
                    </div>

                    {/* про пристрій */}
                    <div className="card p-6">
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Інформація про пристрій</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="label">Тип пристрою*</label>
                                <select className="input" value={data.device_category_id} onChange={e => { setData('device_category_id', e.target.value); setData('service_id', ''); }}>
                                    <option value="">Оберіть тип</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.device_category_id && <p className="form-error">Це обов'язкове поле</p>}
                            </div>
                            {filteredServices.length > 0 && (
                                <div className="form-group">
                                    <label className="label">Послуга</label>
                                    <select className="input" value={data.service_id} onChange={e => setData('service_id', e.target.value)}>
                                        <option value="">Оберіть послугу</option>
                                        {filteredServices.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} (від {formatCurrency(s.price_from)})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label className="label">Бренд</label>
                                <input className="input" value={data.device_brand} onChange={e => setData('device_brand', e.target.value)} placeholder="Apple, Samsung, Dell..." />
                            </div>
                            <div className="form-group">
                                <label className="label">Модель</label>
                                <input className="input" value={data.device_model} onChange={e => setData('device_model', e.target.value)} placeholder="iPhone 15, Galaxy S24..." />
                            </div>
                        </div>
                    </div>

                    {/* проблема */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-900 dark:text-white">Опишіть проблему з пристроєм</h2>
                            <button type="button" onClick={runAiDiagnosis} disabled={aiLoading || data.issue_description.length < 10} className="btn-ghost btn-sm text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                {aiLoading ? 'Аналізую...' : 'ШІ діагностика'}
                            </button>
                        </div>
                        <div className="form-group">
                            <textarea
                                className="input h-32 resize-y"
                                value={data.issue_description}
                                onChange={e => setData('issue_description', e.target.value)}
                                placeholder="Опишіть детально, що не так з вашии прстроєм..."
                            />
                            {errors.issue_description && <p className="form-error">Це обов'язкове поле</p>}
                        </div>

                        {aiDiagnosis && (
                            <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                    <span className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Попередня ШІ діагностика</span>
                                </div>
                                <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Діагноз:</strong> {aiDiagnosis.diagnosis}</p>
                                {aiDiagnosis.likely_cause && <p className="text-sm text-blue-700 dark:text-blue-300 mt-1"><strong>Ймовірна причина:</strong> {aiDiagnosis.likely_cause}</p>}
                                {aiDiagnosis.estimated_cost && <p className="text-sm text-blue-700 dark:text-blue-300 mt-1"><strong>Приблизна вартість:</strong> {aiDiagnosis.estimated_cost}</p>}
                            </div>
                        )}

                        {/* фото */}
                        <div className="mt-4">
                            <label className="label">Фотографії (за бажанням, макс. 5 фото)</label>
                            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 cursor-pointer hover:border-blue-400 transition-colors">
                                <Upload className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-500">Завантажити фото</span>
                                <input type="file" accept="image/*" multiple max="5" className="hidden" onChange={handleImages} />
                            </label>
                            {previews.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {previews.map((url, i) => (
                                        <div key={i} className="relative">
                                            <img src={url} className="w-20 h-20 rounded-lg object-cover" alt="" />
                                            <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* бонуси/промо */}
                    {auth.user && (
                        <div className="card p-6">
                            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Gift className="w-4 h-4 text-blue-600" /> Знижки і бонуси
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-10">
                                <div className="form-group">
                                    <label className="label">Промокод</label>
                                    <div className="flex gap-2">
                                        <input className="input" value={data.promo_code} onChange={e => setData('promo_code', e.target.value.toUpperCase())} placeholder="SAVE20" />
                                        <button type="button" onClick={validatePromo} className="btn-secondary btn-sm px-3 shrink-0">Застосувати</button>
                                    </div>
                                    {promoValid && (
                                        <p className={`form-error ${promoValid.valid ? '!text-green-600 dark:!text-green-400' : ''}`}>
                                            {promoValid.valid ? `✓ ${promoValid.description ?? 'Промокод дійсний!'}` : promoValid.message}
                                        </p>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="label">Використати бонуси (Баланс: {auth.user.bonus_balance})</label>
                                    <input
                                        className="input"
                                        type="number"
                                        min="0"
                                        max={auth.user.bonus_balance}
                                        value={data.bonus_used}
                                        onChange={e => setData('bonus_used', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn-primary w-full text-base py-3.5" disabled={processing}>
                        <ChevronRight className="w-5 h-5" />
                        {processing ? 'Відправляю запит...' : 'Відправити запит'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
