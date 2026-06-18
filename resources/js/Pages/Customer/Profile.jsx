import { Head, useForm, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { LoyaltyBadge } from '@/Components/StatusBadge';
import { User, Lock, Share2, Camera } from 'lucide-react';
import { useState } from 'react';

export default function Profile({ user }) {
    const [tab, setTab] = useState('profile');

    const profileForm = useForm({ name: user.name, email: user.email, phone: user.phone ?? '' });
    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });

    return (
        <CustomerLayout title="Налаштування профілю">
            <Head title="Налаштування профілю" />

            <div className="space-y-5">
                <h1 className="page-header">Налаштування профілю</h1>

                <div className="card p-5 flex items-center gap-4">
                    <div className="relative">
                        {user.avatar
                            ? <img src={user.avatar} className="w-16 h-16 rounded-full object-cover" alt="" />
                            : <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">{user.name.charAt(0)}</div>
                        }
                        <label className="absolute bottom-0 right-0 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm">
                            <Camera className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                router.post(route('customer.profile.avatar'), { avatar: file }, { forceFormData: true });
                            }} />
                        </label>
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="mt-1">
                            <LoyaltyBadge level={user.loyalty_level?.name ?? 'Bronze'} color={user.loyalty_level?.color ?? '#CD7F32'} />
                        </div>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-2xl font-bold text-orange-500">{user.bonus_balance}</p>
                        <p className="text-xs text-gray-500">бонусів</p>
                    </div>
                </div>

                {/* таби */}
                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    {[['profile', User, 'Профіль'], ['password', Lock, 'Змінити пароль'], ['referral', Share2, 'Реферальна програма']].map(([key, Icon, label]) => (
                        <button key={key} onClick={() => setTab(key)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                {/* таб - профіль */}
                {tab === 'profile' && (
                    <div className="card p-6">
                        <form onSubmit={(e) => { e.preventDefault(); profileForm.put(route('customer.profile.update')); }} className="space-y-4">
                            <div className="form-group">
                                <label className="label">Повне ім'я</label>
                                <input className="input" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} />
                                {profileForm.errors.name && <p className="form-error">Це обов'язкове поле</p>}
                            </div>
                            <div className="form-group">
                                <label className="label">Email адреса</label>
                                <input className="input" type="email" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} />
                                {profileForm.errors.email && <p className="form-error">{profileForm.errors.email}</p>}
                            </div>
                            <div className="form-group">
                                <label className="label">Номер телефону</label>
                                <input className="input" value={profileForm.data.phone} onChange={e => profileForm.setData('phone', e.target.value)} placeholder="055 000 -00-00" />
                            </div>
                            <button type="submit" className="btn-primary" disabled={profileForm.processing}>
                                {profileForm.processing ? 'Зберігаю...' : 'Зберегти'}
                            </button>
                        </form>
                    </div>
                )}

                {/* таб - зміна паролю */}
                {tab === 'password' && (
                    <div className="card p-6">
                        <form onSubmit={(e) => { e.preventDefault(); passwordForm.put(route('customer.profile.password'), { onSuccess: () => passwordForm.reset() }); }} className="space-y-4">
                            <div className="form-group">
                                <label className="label">Поточний пароль</label>
                                <input className="input" type="password" value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} />
                                {passwordForm.errors.current_password && <p className="form-error">{passwordForm.errors.current_password}</p>}
                            </div>
                            <div className="form-group">
                                <label className="label">Новий пароль</label>
                                <input className="input" type="password" value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} placeholder="Мінімум 8 символів" />
                                {passwordForm.errors.password && <p className="form-error">{passwordForm.errors.password}</p>}
                            </div>
                            <div className="form-group">
                                <label className="label">Повторіть новий пароль</label>
                                <input className="input" type="password" value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} />
                            </div>
                            <button type="submit" className="btn-primary" disabled={passwordForm.processing}>
                                {passwordForm.processing ? 'Зберігаю...' : 'Змінити пароль'}
                            </button>
                        </form>
                    </div>
                )}

                {/* таб - реферал */}
                {tab === 'referral' && (
                    <div className="card p-6">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Ваш реферальний код</h2>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 flex items-center justify-between gap-4 mb-4">
                            <span className="font-mono text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-widest">{user.referral_code}</span>
                            <button onClick={() => navigator.clipboard?.writeText(user.referral_code)} className="btn-ghost btn-sm text-sm">Скопіювати</button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Поділіться своїм реферальним кодом з друзями. При реєстрації з вашим кодом:
                        </p>
                        <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Ви отримаєте <strong>+200 бонусних балів</strong></li>
                            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Вони отримають <strong>+50 бонусних балів</strong></li>
                        </ul>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
