import { Head, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token, email: email ?? '', password: '', password_confirmation: '',
    });

    return (
        <AuthLayout title="Скинути пароль" subtitle="Оберіть новий надийний пароль для вашого аккаунта">
            <Head title="Скинути пароль" />
            <form onSubmit={(e) => { e.preventDefault(); post(route('password.update')); }} className="space-y-4">
                <div className="form-group">
                    <label className="label">Email</label>
                    <input className="input" type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                    {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                <div className="form-group">
                    <label className="label">Новий пароль</label>
                    <input className="input" type="password" value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Min. 8 characters" autoFocus />
                    {errors.password && <p className="form-error">{errors.password}</p>}
                </div>
                <div className="form-group">
                    <label className="label">Підтвердіть новий пароль</label>
                    <input className="input" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} placeholder="Repeat password" />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={processing}>
                    {processing ? 'Зберігаю...' : 'Скинути пароль'}
                </button>
            </form>
        </AuthLayout>
    );
}
