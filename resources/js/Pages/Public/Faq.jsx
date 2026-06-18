import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHero from '@/Components/PageHero';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function FaqItem({ faq }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="card overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
                <span className="font-medium text-gray-900 dark:text-white pr-4">{faq.question}</span>
                {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>
            {open && (
                <div className="px-5 pb-4 text-gray-600 dark:text-gray-400 text-sm border-t border-gray-100 dark:border-gray-700 pt-3">
                    {faq.answer}
                </div>
            )}
        </div>
    );
}

export default function Faq({ faqs, pageContent, pageMeta, categoryNames }) {
    const categories = Object.entries(faqs);
    const content = pageContent ?? {};
    const meta = pageMeta ?? {};
    const names = categoryNames ?? {};

    return (
        <AppLayout>
            <Head title={meta.title ?? 'FAQ'}>
                {meta.description && <meta name="description" content={meta.description} />}
            </Head>
            <PageHero bgImage={content.hero_bg_image}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-3">{content.hero_title ?? 'Frequently Asked Questions'}</h1>
                    <p className="text-blue-100">{content.hero_subtitle ?? 'Everything you need to know about our repair services'}</p>
                </div>
            </PageHero>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                {categories.map(([category, items]) => (
                    <div key={category} className="mb-10">
                        {categories.length > 1 && (
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{names[category] ?? category}</h2>
                        )}
                        <div className="space-y-3">
                            {items.map(faq => <FaqItem key={faq.id} faq={faq} />)}
                        </div>
                    </div>
                ))}
                {categories.length === 0 && (
                    <p className="text-center text-gray-500 py-10">Ще немає питань.</p>
                )}
            </div>
        </AppLayout>
    );
}
