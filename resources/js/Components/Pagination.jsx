import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            {links.map((link, i) => {
                if (link.label === '&laquo; Попередня') {
                    return (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            className={`p-2 rounded-lg border transition-colors ${
                                link.url
                                    ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    : 'border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            }`}
                            preserveScroll
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Link>
                    );
                }

                if (link.label === 'Наступна &raquo;') {
                    return (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            className={`p-2 rounded-lg border transition-colors ${
                                link.url
                                    ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    : 'border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            }`}
                            preserveScroll
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    );
                }

                if (link.label === '...') {
                    return <span key={i} className="px-3 py-2 text-gray-400">…</span>;
                }

                return (
                    <Link
                        key={i}
                        href={link.url ?? '#'}
                        className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                            link.active
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                        preserveScroll
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}
