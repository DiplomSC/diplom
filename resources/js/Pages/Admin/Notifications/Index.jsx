import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDateTime } from '@/lib/utils';
import { Edit, Send, Mail, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

const channelIcon = { email: Mail, telegram: MessageSquare };

function TemplateModal({ template, onClose }) {
    const { data, setData, put, processing, errors } = useForm({
        subject:          template.subject ?? '',
        email_body:       template.email_body ?? '',
        telegram_body:    template.telegram_body ?? '',
        email_enabled:    template.email_enabled ?? true,
        telegram_enabled: template.telegram_enabled ?? false,
        is_active:        template.is_active,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.notifications.update', template.id), { onSuccess: onClose });
    };

    return (
        <Modal open title={`Редагувати: ${template.name ?? template.key}`} onClose={onClose} maxWidth="3xl" overlayClose="0">
            <form onSubmit={submit} className="space-y-4">
                <div className="form-group">
                    <label className="label">Тема еmail повідомлення</label>
                    <input className="input" value={data.subject} onChange={e => setData('subject', e.target.value)} />
                    {errors.subject && <p className="form-error">{errors.subject}</p>}
                </div>
                <div className="form-group">
                    <label className="label">Текст email повідомлення</label>
                    <p className="text-xs text-gray-400 mb-1">Наявні змінні: {'{{customer_name}}'}, {'{{order_number}}'}, {'{{device}}'}, {'{{new_status}}'}, {'{{app_url}}'}</p>
                    <textarea className="input h-36 resize-none font-mono text-xs" value={data.email_body} onChange={e => setData('email_body', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="label">Текст Telegram повідомлення</label>
                    <textarea className="input h-24 resize-none font-mono text-xs" value={data.telegram_body} onChange={e => setData('telegram_body', e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[['is_active', 'Активне повідомлення'], ['email_enabled', 'Відправляти на email'], ['telegram_enabled', 'Відправляти в Telegram']].map(([field, label]) => (
                        <label key={field} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data[field]} onChange={e => setData(field, e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                        </label>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Відміна</button>
                    <button type="submit" className="btn-primary flex-1" disabled={processing}>Зберегти</button>
                </div>
            </form>
        </Modal>
    );
}

function BroadcastModal({ users, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        subject: '',
        message: '',
        channel: 'email',
        audience: 'all',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.notifications.broadcast'), { onSuccess: () => { onClose(); } });
    };

    return (
        <Modal open title="Розсилка" onClose={onClose} maxWidth="3xl">
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="label">Канал</label>
                        <select className="input" value={data.channel} onChange={e => setData('channel', e.target.value)}>
                            <option value="email">Email</option>
                            <option value="telegram">Telegram</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Аудиторія</label>
                        <select className="input" value={data.audience} onChange={e => setData('audience', e.target.value)}>
                            <option value="all">Всі клієнти</option>
                            <option value="gold">Gold рівень</option>
                            <option value="silver">Silver рівень</option>
                        </select>
                    </div>
                </div>
                {data.channel === 'email' && (
                    <div className="form-group">
                        <label className="label">Тема повідомлення</label>
                        <input className="input" value={data.subject} placeholder="Тема повідомлення" onChange={e => setData('subject', e.target.value)} />
                        {errors.subject && <p className="form-error">{errors.subject}</p>}
                    </div>
                )}
                <div className="form-group">
                    <label className="label">Текст повідомлення</label>
                    <textarea className="input h-32 resize-none" value={data.message} onChange={e => setData('message', e.target.value)} placeholder="Текст повідомлення" />
                    {errors.message && <p className="form-error">{errors.message}</p>}
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Відміна</button>
                    <button type="submit" className="btn-primary flex-1" disabled={processing}>
                        <Send className="w-4 h-4" /> Відправити
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default function NotificationsIndex({ templates, recentNotifications }) {
    const [editTemplate, setEditTemplate] = useState(null);
    const [broadcast, setBroadcast] = useState(false);

    return (
        <AdminLayout title="Повідомлення">
            <Head title="Повідомлення" />

            <div className="space-y-8">
                {/* шаблони повідомлень */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900 dark:text-white">Шаблони повідомлень</h2>
                        <button onClick={() => setBroadcast(true)} className="btn-primary btn-sm">
                            <Send className="w-4 h-4" /> Розсилка
                        </button>
                    </div>
                    <div className="space-y-3">
                        {templates.map(t => (
                            <div key={t.id} className="card p-4 flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</span>
                                        <span className={`badge ${t.is_active ? 'badge-green' : 'badge-gray'} text-xs`}>
                                            {t.is_active ? 'Активне' : 'Не активне'}
                                        </span>
                                        {t.email_enabled && <span className="badge badge-blue text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>}
                                        {t.telegram_enabled && <span className="badge badge-purple text-xs flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Telegram</span>}
                                    </div>
                                    {t.subject && <p className="text-xs text-gray-500 truncate">{t.subject}</p>}
                                </div>
                                <button onClick={() => setEditTemplate(t)} className="btn-ghost btn-sm p-1.5 shrink-0">
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* історія повідомлень */}
                {recentNotifications?.length > 0 && (
                    <div className="card p-6">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Останні повідомлення</h2>
                        <div className="table-wrapper">
                            <table className="table-base">
                                <thead>
                                    <tr>
                                        <th>Отримувач</th>
                                        <th>Тип</th>
                                        <th>Канал</th>
                                        <th>Статус</th>
                                        <th>Відправлено</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentNotifications.map(n => (
                                        <tr key={n.id}>
                                            <td>{n.user?.name ?? n.notifiable?.customer_name ?? '—'}</td>
                                            <td className="capitalize">{n.type?.replace(/_/g, ' ') ?? n.event}</td>
                                            <td className="capitalize">{n.channel}</td>
                                            <td>
                                                <span className={`badge ${n.read_at ? 'badge-gray' : 'badge-blue'}`}>
                                                    {n.read_at ? 'Переглянуто' : 'Відправлено'}
                                                </span>
                                            </td>
                                            <td>{formatDateTime(n.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {editTemplate && <TemplateModal template={editTemplate} onClose={() => setEditTemplate(null)} />}
            {broadcast && <BroadcastModal onClose={() => setBroadcast(false)} />}
        </AdminLayout>
    );
}
