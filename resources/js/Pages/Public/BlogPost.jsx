import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, User, BookOpen } from 'lucide-react';

export default function BlogPost({ post, related: recentPosts }) {
    return (
        <AppLayout>
            <Head>
                <title>{post.meta_title ?? post.title}</title>
                {post.meta_desc && <meta name="description" content={post.meta_desc} />}
            </Head>

            {/* post hero image */}
            {post.cover_image ? (
                <div className="relative w-full overflow-hidden" style={{ maxHeight: '480px' }}>
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full object-cover"
                        style={{ maxHeight: '480px', width: '100%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
            ) : (
                <div className="w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-950 dark:to-indigo-900" style={{ height: '200px' }}>
                    <BookOpen className="w-16 h-16 text-blue-300 dark:text-blue-700" />
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Link href={route('blog')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm mb-8">
                    <ArrowLeft className="w-4 h-4" /> Назад до постів
                </Link>

                <article>
                    <header className="mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            {post.author && (
                                <span className="flex items-center gap-1.5">
                                    <User className="w-4 h-4" /> {post.author.name}
                                </span>
                            )}
                            {post.published_at && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" /> {formatDate(post.published_at)}
                                </span>
                            )}
                        </div>
                        {post.excerpt && (
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed border-l-4 border-blue-500 pl-4">
                                {post.excerpt}
                            </p>
                        )}
                    </header>

                    <div
                        className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                        dangerouslySetInnerHTML={{ __html: post.body }}
                    />
                </article>

                {recentPosts?.length > 0 && (
                    <aside className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Також рекомендуємо</h2>
                        <div className="grid sm:grid-cols-3 gap-5">
                            {recentPosts.map(p => (
                                <Link key={p.id} href={route('blog.post', p.slug)} className="card overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                                    {p.cover_image ? (
                                        <img src={p.cover_image} alt={p.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-36 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-950 dark:to-indigo-900 flex items-center justify-center">
                                            <BookOpen className="w-8 h-8 text-blue-300" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.title}</p>
                                        <p className="text-xs text-gray-400">{formatDate(p.published_at)}</p>
                                        {p.excerpt && <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{p.excerpt}</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </aside>
                )}
            </div>
        </AppLayout>
    );
}
