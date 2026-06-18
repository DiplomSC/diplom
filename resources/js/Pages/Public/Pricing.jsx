import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHero from '@/Components/PageHero';
import { formatCurrency } from '@/lib/utils';
import { Info, ChevronRight, ThermometerSnowflakeIcon } from 'lucide-react';

export default function Pricing({ categories, pageContent, pageMeta }) {
    const content = pageContent ?? {};
    const meta = pageMeta ?? {};
    return (
        <AppLayout>
            <Head title={meta.title ?? 'Ціни'}>
                {meta.description && <meta name="description" content={meta.description} />}
            </Head>

            <PageHero bgImage={content.hero_bg_image}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-3">{content.hero_title ?? 'Service Pricing'}</h1>
                    <p className="text-blue-100 text-lg">{content.hero_subtitle ?? 'Transparent pricing. Final cost confirmed after free diagnostics.'}</p>
                </div>
            </PageHero>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* дисклеймер */}
                {content.disclaimer_text && (
                    <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-10">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            {content.disclaimer_text}
                        </p>
                    </div>
                )}

                {categories.map(category => (
                    <div key={category.id} className="mb-10">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span>{category.icon || '🔧'}</span> {category.name}
                        </h2>
                        <div className="table-wrapper">
                            <table className="table-base">
                                <thead>
                                    <tr>
                                        <th>Послуга</th>
                                        <th>Приблизна вартість</th>
                                        <th>Час виконання</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {category.services.map(s => (
                                        <tr key={s.id}>
                                            <td>
                                                <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                                                {s.description && <div className="text-xs text-gray-400 mt-0.5">{s.description}</div>}
                                            </td>
                                            <td>
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {formatCurrency(s.price_from)}
                                                </span>
                                                {s.price_to && <span className="text-gray-400 text-sm"> – {formatCurrency(s.price_to)}</span>}
                                            </td>
                                            <td className="text-gray-500">
                                                {s.duration_minutes ? `~${Math.round(s.duration_minutes / 60)} год.` : '—'}
                                            </td>
                                            <td className="text-right">
                                                <Link href={`${route('order.create')}?service=${s.id}`} className="btn-primary btn-sm text-xs">
                                                    Замовити
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {category.services.length === 0 && (
                                        <tr><td colSpan="4" className="text-center text-gray-400 py-4">No services yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                <div className="text-center mt-12">
                    <p className="text-gray-500 mb-4">Не знайшли свій пристрій чи бажану послугу? Можливо, ми все ж зможемо вам допомогти.</p>
                    <Link href={route('order.create')} className="btn-primary">Створити запит на ремонт</Link>
                </div>
            </div>
        </AppLayout>
    );
}
