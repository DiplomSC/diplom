import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Mail } from 'lucide-react';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({ email: '' });

    return (
        <AuthLayout title="Скинути пароль" subtitle="Введіть свою email адресу і ми надішлемо вам посилання на&nbsp;зміну&nbsp;пароля">
            <Head title="Скинути пароль" />

            {wasSuccessful ? (
                <div className="text-center py-4">
                    <Mail className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Перевірте свою email скриньку!</p>
                    <p className="text-sm text-gray-500 mt-1">Ми надіслали вам посілання на скидання пароля.</p>
                    <Link href={route('login')} className="btn-primary mt-4">Назад до форми авторизації</Link>
                </div>
            ) : (
                <form onSubmit={(e) => { e.preventDefault(); post(route('password.email')); }} className="space-y-4">
                    <div className="form-group">
                        <label className="label">Email адреса</label>
                        <input className="input" type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="you@example.com" autoFocus />
                        {errors.email && <p className="form-error">{errors.email}</p>}
                    </div>
                    <button type="submit" className="btn-primary w-full" disabled={processing}>
                        {processing ? 'Надсилаю...' : 'Отримати посилання'}
                    </button>
                    <p className="text-center text-sm text-gray-500">
                        <Link href={route('login')} className="text-blue-600 dark:text-blue-400 hover:underline">← Назад до форми авторизації</Link>
                    </p>
                </form>
            )}
        </AuthLayout>
    );
}
