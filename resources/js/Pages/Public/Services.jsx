import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHero from '@/Components/PageHero';
import { formatCurrency } from '@/lib/utils';
import { Wrench, ChevronRight } from 'lucide-react';

export default function Services({ categories, pageContent, pageMeta }) {
    const content = pageContent ?? {};
    const meta = pageMeta ?? {};
    return (
        <AppLayout>
            <Head title={meta.title ?? 'Послуги'}>
                {meta.description && <meta name="description" content={meta.description} />}
            </Head>

            <PageHero bgImage={content.hero_bg_image}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-3">{content.hero_title}</h1>
                    <p className="text-blue-100 text-lg">{content.hero_subtitle}</p>
                </div>
            </PageHero>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {categories.map(category => (
                    <div key={category.id} id={category.slug} className="mb-14">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-xl flex items-center justify-center text-xl">
                                {category.icon || '🔧'}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{category.name}</h2>
                        </div>
                        {category.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{category.description}</p>
                        )}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {category.services.map(service => (
                                <div key={service.id} className="card p-5 flex flex-col hover:shadow-md transition-shadow">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                                    {service.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex-1">{service.description}</p>
                                    )}
                                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <div>
                                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                                                {formatCurrency(service.price_from)}
                                            </span>
                                            {service.price_to && (
                                                <span className="text-gray-400 text-sm"> – {formatCurrency(service.price_to)}</span>
                                            )}
                                        </div>
                                        <Link
                                            href={`${route('order.create')}?service=${service.id}`}
                                            className="btn-primary btn-sm text-xs"
                                        >
                                            Замовити
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {categories.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <Wrench className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Тут ще немає інформації про наші послуги.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
