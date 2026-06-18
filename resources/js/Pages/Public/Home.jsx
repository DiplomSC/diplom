import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useRef } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
    Wrench, Shield, Clock, Star, ChevronRight, ArrowRight,
    Smartphone, Laptop, Gift, CheckCircle, Play, MessageCircle,
} from 'lucide-react';

function HeroSection({ content }) {
    const { auth } = usePage().props;
    const bgImage = content.hero_bg_image || null;
    const bgVideo = content.hero_bg_video || null;

    return (
        <section className="relative overflow-hidden text-white">
            {/* фонове зображення (коли не завантажено відео) */}
            {bgImage && !bgVideo && (
                <div className="absolute inset-0" style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }} />
            )}

            {/* фонове відео */}
            {bgVideo && (
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay muted loop playsInline
                    poster={bgImage || undefined}
                >
                    <source src={bgVideo} />
                </video>
            )}

            {/* оверлей з градієнтом */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/85 to-indigo-800/90" />

            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px)',
                    backgroundSize: '48px 48px',
                }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                <div className="max-w-3xl">
                    {!auth.user && content.hero_badge && (
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">
                            <Gift className="w-4 h-4" />
                            {content.hero_badge}
                        </div>
                    )}

                    {content.hero_title && (
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                            {content.hero_title}
                        </h1>
                    )}

                    {content.hero_subtitle && (
                        <p className="text-xl text-blue-100 mb-8 max-w-xl">
                            {content.hero_subtitle}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href={route('order.create')} className="btn-primary bg-white text-blue-700 hover:bg-blue-50 text-base px-8">
                            <Wrench className="w-5 h-5" />
                            Онлайн замовлення
                        </Link>
                        <Link href={route('track.order')} className="btn-secondary bg-transparent! text-white! border-white/60 hover:bg-white/15! text-base px-8">
                            Відстежити замовлення
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-6 mt-10 text-sm text-blue-100">
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-300" /> Безкоштовна діагностика</span>
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-300" /> 90 днів гарантії</span>
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-300" /> Оригінальні запчастини</span>
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-300" /> Ремонт за один день</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

function BenefitCard({ icon: Icon, title, desc, color }) {
    return (
        <div className="card p-6 flex gap-4">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
        </div>
    );
}

function ServiceCard({ service }) {
    return (
        <div className="card p-5 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-xl flex items-center justify-center text-xl">
                    {service.icon || '🔧'}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{service.name}</h3>
                    <p className="text-xs text-gray-500">{service.category?.name}</p>
                </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 mb-4">{service.description}</p>
            <div className="flex items-center justify-between mt-auto">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                    Від {formatCurrency(service.price_from)}
                </span>
                <Link href={route('order.create')} className="btn-primary btn-sm text-xs">
                    Замовити
                </Link>
            </div>
        </div>
    );
}

function ReviewCard({ review }) {
    return (
        <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {review.author_name?.charAt(0)}
                </div>
                <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{review.author_name}</p>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                    </div>
                </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{review.body}"</p>
        </div>
    );
}

export default function Home({ popularServices, reviews, pageContent, pageMeta }) {
    const content = pageContent ?? {};
    const meta = pageMeta ?? {};
    return (
        <AppLayout>
            <Head title={meta.title ?? 'Головна'}>
                {meta.description && <meta name="description" content={meta.description} />}
            </Head>

            <HeroSection content={content} />

            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="section-title text-center mb-10">Чому обирають нас</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <BenefitCard icon={Shield} title="90 днів гарантії" desc="Гарантія на всі послуги з ремонту та запчастини 90 днів." color="bg-green-500" />
                        <BenefitCard icon={Clock} title="Ремонт за один день" desc="Переважна бильшість робіт виконується за 1-3 години." color="bg-blue-500" />
                        <BenefitCard icon={Wrench} title="Досвідчені майстри" desc="Майстри сертифіковані провідними виробниками техніки." color="bg-purple-500" />
                        <BenefitCard icon={Gift} title="Програма лояльності" desc="Отримуй бонуси за кожне замовлення і обмінюй на знижки." color="bg-orange-500" />
                    </div>
                </div>
            </section>

            {popularServices.length > 0 && (
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="section-title">Популярні послуги</h2>
                            <Link href={route('services')} className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                                Всі послуги <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {popularServices.map(s => <ServiceCard key={s.id} service={s} />)}
                        </div>
                    </div>
                </section>
            )}

            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="section-title text-center mb-10">Що ми ремонтуємо</h2>
                    <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Link href={`${route('services')}#smartphones`} className="card p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow group">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                <Smartphone className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Смартфони, планшети</h3>
                            <p className="text-sm text-gray-500">Заміна екрану, батареї, зарядного порту, ремонт після пошкодження водою та інше</p>
                        </Link>
                        <Link href={`${route('services')}#laptops`} className="card p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow group">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                                <Laptop className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Ноутбуки</h3>
                            <p className="text-sm text-gray-500">Заміна екрана, клавіатури, ремонт материнської плати, збільшення пам'яті, апгрейд SSD...</p>
                        </Link>
                    </div>
                </div>
            </section>

            {reviews.length > 0 && (
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="section-title">Відгуки наших клієнтів</h2>
                            <Link href={route('reviews')} className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                                Дивитися всі <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reviews.slice(0,3).map(r => <ReviewCard key={r.id} review={r} />)}
                        </div>
                    </div>
                </section>
            )}
        </AppLayout>
    );
}
