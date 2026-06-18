import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Pagination';
import { Star } from 'lucide-react';

function StarRating({ rating }) {
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
            ))}
        </div>
    );
}

export default function Reviews({ reviews }) {
    return (
        <AppLayout>
            <Head title="Reviews" />
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-3">Відгуки наших клієнтів</h1>
                    <p className="text-blue-100">Досвід успішної співпраці з нами наших клієнтів</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {reviews.data.map(r => (
                        <div key={r.id} className="card p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                                    {r.author_name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{r.author_name}</p>
                                    <StarRating rating={r.rating} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{r.body}"</p>
                        </div>
                    ))}
                </div>
                {reviews.data.length === 0 && (
                    <p className="text-center text-gray-500 py-10">Ще немає відгуків. Маєте можливість залишити перший.</p>
                )}
                <Pagination links={reviews.links} />
            </div>
        </AppLayout>
    );
}
