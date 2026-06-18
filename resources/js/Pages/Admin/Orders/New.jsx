import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import { ChevronRight, Gift } from 'lucide-react';
import { useState } from 'react';

export default function AdminOrdersNew({ categories, services, customers }) {

    const [promoValid, setPromoValid] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        customer_id:            '',
        customer_name:          '',
        customer_phone:         '',
        customer_email:         '',
        customer_bonus_balance: '',
        device_category_id:     '',
        service_id:             '',
        device_brand:           '',
        device_model:           '',
        issue_description:      '',
        promo_code:             '',
        bonus_used:             0,
    });

    const filteredServices = data.device_category_id
        ? services.filter(s => s.device_category_id == data.device_category_id)
        : [];

    const validatePromo = async () => {
        if (!data.promo_code) return;
        try {
            const { data: result } = await axios.post(route('customer.bonuses.validate-promo'), { code: data.promo_code });
            setPromoValid({ valid: true, ...result });
        } catch (e) {
            setPromoValid({ valid: false, message: e.response?.data?.message ?? 'Невірний промокод' });
        }
    };

    function setClientData(e){
        const customer_id = e.target.value;
        if(customer_id != ''){
            const customer_arr = customers.filter(s => s.id == customer_id);
            if(customer_arr.length){
                const customer = customer_arr[0];
                ['id', 'name', 'phone', 'email', 'bonus_balance'].map(c => setData('customer_'+c, customer[c]));
                return;
            }
        }
        ['id', 'name', 'phone', 'email', 'bonus_balance'].map(c => setData('customer_'+c, ''));
    }

    return (
        <AdminLayout title={`Нове замовлення`}>
            <Head title={`Нове замовлення`} />

            <form onSubmit={(e) => { e.preventDefault(); post(route('admin.orders.store')); }} className="space-y-6">
                <div>
                    {customers.length > 0 && (
                        <div className="form-group">
                            <label className="label">Існуючі клієнти</label>
                            <select className="input" value={data.customer_id} onChange={e => setClientData(e)}>
                                <option value="">Оберіть клієнта</option>
                                {customers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} | {s.email}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* контакти */}
                <div className="card p-6">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Дані клієнта</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="form-group">
                            <label className="label">Повне ім'я*</label>
                            <input className="input" value={data.customer_name} onChange={e => setData('customer_name', e.target.value)} placeholder="Ім'я клієнта" readOnly={data.customer_id != ''} />
                            {errors.customer_name && <p className="form-error">Це обов'язкове поле</p>}
                        </div>
                        <div className="form-group">
                            <label className="label">Номер телефону*</label>
                            <input className="input" value={data.customer_phone} onChange={e => setData('customer_phone', e.target.value)} placeholder="055 000-00-00" readOnly={data.customer_id != ''} />
                            {errors.customer_phone && <p className="form-error">Це обов'язкове поле</p>}
                        </div>
                        <div className="form-group">
                            <label className="label">Email</label>
                            <input className="input" type="email" value={data.customer_email} onChange={e => setData('customer_email', e.target.value)} placeholder="your@email.com" readOnly={data.customer_id != ''} />
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
                        <h2 className="font-semibold text-gray-900 dark:text-white">Опис проблеми</h2>
                    </div>
                    <div className="form-group">
                        <textarea
                            className="input h-32 resize-y"
                            value={data.issue_description}
                            onChange={e => setData('issue_description', e.target.value)}
                        />
                        {errors.issue_description && <p className="form-error">Це обов'язкове поле</p>}
                    </div>
                </div>

                {/* бонуси/промо */}
                {data.customer_id != '' && (
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
                                <label className="label">Використати бонуси (Баланс: {data.customer_bonus_balance})</label>
                                <input
                                    className="input"
                                    type="number"
                                    min="0"
                                    max={data.customer_bonus_balance}
                                    step="1"
                                    value={data.bonus_used}
                                    onChange={e => setData('bonus_used', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <button type="submit" className="btn-primary w-full text-base py-3.5" disabled={processing}>
                    <ChevronRight className="w-5 h-5" />
                    {processing ? 'Зберігаю...' : 'Створити замовлення'}
                </button>
            </form>

        </AdminLayout>
    );
}
