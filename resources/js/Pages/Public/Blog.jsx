import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Pagination';
import { formatDate } from '@/lib/utils';
import { BookOpen, Calendar, User } from 'lucide-react';

export default function Blog({ posts }) {
    return (
        <AppLayout>
            <Head title="Блог" />
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-3">Техно новини і не тільки</h1>
                    <p className="text-blue-100">Новинки електроніки, поради щодо пристроїв та все про нашу роботу</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.data.map(post => (
                        <Link key={post.id} href={route('blog.post', post.slug)} className="card overflow-hidden hover:shadow-md transition-shadow group">
                            {post.cover_image && (
                                <img src={post.cover_image} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                            )}
                            {!post.cover_image && (
                                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-950 dark:to-indigo-900 flex items-center justify-center">
                                    <BookOpen className="w-12 h-12 text-blue-400" />
                                </div>
                            )}
                            <div className="p-5">
                                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(post.published_at)}</span>
                                    {post.author && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{post.author.name}</span>}
                                </div>
                                <h2 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{post.title}</h2>
                                {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>}
                            </div>
                        </Link>
                    ))}
                </div>
                {posts.data.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Тут ще немає постів. Завітайне наступного разу!</p>
                    </div>
                )}
                <Pagination links={posts.links} />
            </div>
        </AppLayout>
    );
}
