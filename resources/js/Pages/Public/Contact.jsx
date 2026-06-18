import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHero from '@/Components/PageHero';
import { MapPin, Phone, Clock, Mail, Send } from 'lucide-react';

export default function Contact({ contactInfo, googleMapsUrl, pageContent, pageMeta }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', phone: '', subject: '', message: '',
    });

    const info = contactInfo ?? {};
    const content = pageContent ?? {};
    const meta = pageMeta ?? {};

    return (
        <AppLayout>
            <Head title={meta.title ?? 'Контакти'}>
                {meta.description && <meta name="description" content={meta.description} />}
            </Head>
            <PageHero bgImage={content.hero_bg_image}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-3">{content.hero_title}</h1>
                    <p className="text-blue-100">{content.hero_subtitle}</p>
                </div>
            </PageHero>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-2 gap-10">
                    {/* інфо */}
                    <div>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-xl flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Адреса</p>
                                    <p className="text-gray-500 text-sm">{info.address}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-950 rounded-xl flex items-center justify-center shrink-0">
                                    <Phone className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Телефон</p>
                                    <p className="text-gray-500 text-sm">{info.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950 rounded-xl flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Email</p>
                                    <p className="text-gray-500 text-sm">{info.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950 rounded-xl flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Робочі години</p>
                                    <p className="text-gray-500 text-sm">{info.hours}</p>
                                </div>
                            </div>
                        </div>

                        {googleMapsUrl && (
                            <div className="mt-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                <iframe
                                    src={googleMapsUrl}
                                    width="100%"
                                    height="280"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Location map"
                                />
                            </div>
                        )}
                    </div>

                    {/* контакт форма */}
                    <div className="card p-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-5">Напишіть нам</h3>
                        <form className="space-y-4" onSubmit={e => { e.preventDefault(); post(route('contact.submit'), { onSuccess: () => reset() }); }}>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="label">Ваше ім'я*</label>
                                    <input className="input" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ваше ім'я" />
                                    {errors.name && <p className="form-error">Це обов'язкове поле</p>}
                                </div>
                                <div className="form-group">
                                    <label className="label">Email*</label>
                                    <input className="input" type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="your@email.com" />
                                    {errors.email && <p className="form-error">Перевірте чи правильний email</p>}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Тема</label>
                                <input className="input" value={data.subject} onChange={e => setData('subject', e.target.value)} placeholder="Причина звернення" />
                            </div>
                            <div className="form-group">
                                <label className="label">Повідомлення*</label>
                                <textarea className="input h-32 resize-none" value={data.message} onChange={e => setData('message', e.target.value)} placeholder="Як ми можемо вам допомогти?" />
                                {errors.message && <p className="form-error">Це обов'язкове поле</p>}
                            </div>
                            <button type="submit" className="btn-primary w-full" disabled={processing}>
                                <Send className="w-4 h-4" />
                                {processing ? 'Надсилаю...' : 'Надіслати'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
