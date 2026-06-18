import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHero from '@/Components/PageHero';
import { Shield, Clock, Wrench, Award, Users, Star } from 'lucide-react';

export default function About({ pageContent, pageMeta }) {
    const content = pageContent ?? {};
    const meta = pageMeta ?? {};

    return (
        <AppLayout>
            <Head title={meta.title ?? 'Про нас'}>
                {meta.description && <meta name="description" content={meta.description} />}
            </Head>

            <PageHero bgImage={content.hero_bg_image} className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">{content.hero_title}</h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                        {content.hero_subtitle}
                    </p>
                </div>
            </PageHero>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* статистика */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'зроблено ремонтів', value: content.repairs_count, icon: Wrench },
                        { label: 'задоволених клієнтів', value: content.customers_count, icon: Users },
                        { label: 'років досвіду', value: content.years, icon: Award },
                        { label: 'середня оцінка', value: content.rating, icon: Star },
                    ].map(stat => (
                        <div key={stat.label} className="card p-6 text-center">
                            <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* історія */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Наша історія</h2>
                        <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                            <p style={{ whiteSpace: 'pre-line' }}>{content.story}</p>
                        </div>
                        <Link href={route('order.create')} className="btn-primary mt-6">Онлайн замовлення</Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Shield, title: '90-денна гарантія', desc: 'Кожен ремонт супроводжується нашою гарантією' },
                            { icon: Clock, title: 'Швидкий ремонт', desc: 'Більшість послуг віконуються в день замовлення' },
                            { icon: Award, title: 'Сертифіковані спеціалісти', desc: 'Майстри навчені безпосередньо виробниками техніки' },
                            { icon: Wrench, title: 'Оригінальні запчастини', desc: 'Тільки оригінальні і сертифіковані виробником запчастини' },
                        ].map(f => (
                            <div key={f.title} className="card p-5">
                                <f.icon className="w-6 h-6 text-blue-600 mb-2" />
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{f.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
