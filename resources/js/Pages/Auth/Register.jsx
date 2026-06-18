import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Gift } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name:                  '',
        email:                 '',
        phone:                 '',
        password:              '',
        password_confirmation: '',
        referral_code:         '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register.store'));
    };

    return (
        <AuthLayout title="Реєстрація" subtitle="Реєструйся за кілька хвилин і отримуй винагороди, вигідні пропозиції та заощаджуй на кожному замовленні">
            <Head title="Реєстрація" />

            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 mb-5">
                <Gift className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">Зареєструйтеся і отримайте 100 бонусних балів на ваш особистий бонусний рахунок!</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="form-group">
                    <label className="label">Повне ім'я*</label>
                    <input className="input" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Олександр Швець" autoFocus />
                    {errors.name && <p className="form-error">Це обов'язкове поле</p>}
                </div>

                <div className="form-group">
                    <label className="label">Email*</label>
                    <input className="input" type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="you@example.com" />
                    {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Номер телефону*</label>
                    <input className="input" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="055 000-00-00" />
                    {errors.phone && <p className="form-error">Це обов'язкове поле</p>}
                </div>

                <div className="form-group">
                    <label className="label">Пароль*</label>
                    <input className="input" type="password" value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Мінімум 8 символів" />
                    {errors.password && <p className="form-error">{errors.password}</p>}
                </div>
                
                <div className="form-group">
                    <label className="label">Підтвердіть пароль*</label>
                    <input className="input" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} placeholder="Введіть пароль ще раз" />
                </div>

                <div className="form-group">
                    <label className="label">Реферальний код (за наявності)</label>
                    <input className="input" value={data.referral_code} onChange={e => setData('referral_code', e.target.value.toUpperCase())} placeholder="ABCD1234" />
                    {errors.referral_code && <p className="form-error">{errors.referral_code}</p>}
                </div>

                <button type="submit" className="btn-primary w-full" disabled={processing}>
                    {processing ? 'Створюю аккаунт...' : 'Зареєструватися'}
                </button>
            </form>

            {/* OAuth */}
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
                    <div className="relative flex justify-center text-xs text-gray-400"><span className="bg-white dark:bg-gray-800 px-3">або реєструйтеся через</span></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <a href={route('auth.social.redirect', 'google')} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Google
                    </a>
                    <a href={route('auth.social.redirect', 'facebook')} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <svg className="w-5 h-5 text-blue-600 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Facebook
                    </a>
                </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
                Вже маєте аккаунт?{' '}
                <Link href={route('login')} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Увійдіть тут</Link>
            </p>
        </AuthLayout>
    );
}
