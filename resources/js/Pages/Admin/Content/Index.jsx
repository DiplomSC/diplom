import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/lib/utils';
import { Plus, Edit, Trash2, FileText, MessageSquare, HelpCircle, Star, CheckCircle } from 'lucide-react';

const tabs = [
    { key: 'pages', label: 'Pages', icon: FileText },
    { key: 'blog', label: 'Blog Posts', icon: MessageSquare },
    { key: 'faqs', label: 'FAQs', icon: HelpCircle },
    { key: 'reviews', label: 'Reviews', icon: Star },
];

export default function ContentIndex({ tab = 'pages', pages, blogPosts, faqs, reviews }) {
    const setTab = (t) => router.get(route('admin.content.index'), { tab: t }, { preserveState: true, replace: true });

    const destroyPage = (page) => {
        if (!confirm(`Delete page "${page.title}"?`)) return;
        router.delete(route('admin.content.pages.destroy', page.id));
    };

    const destroyPost = (post) => {
        if (!confirm(`Delete post "${post.title}"?`)) return;
        router.delete(route('admin.content.blog.destroy', post.id));
    };

    const destroyFaq = (faq) => {
        if (!confirm('Delete this FAQ?')) return;
        router.delete(route('admin.content.faqs.destroy', faq.id));
    };

    const approveReview = (review) => router.patch(route('admin.content.reviews.approve', review.id));
    const destroyReview = (review) => {
        if (!confirm('Delete this review?')) return;
        router.delete(route('admin.content.reviews.destroy', review.id));
    };

    return (
        <AdminLayout title="Content Management">
            <Head title="Content" />

            <div className="space-y-5">
                {/* таби */}
                <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
                    {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                tab === key
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                {tab === 'pages' && (
                    <div className="card p-5">
                        <div className="table-wrapper">
                            <table className="table-base">
                                <thead><tr><th>Page</th><th>Slug</th><th>Status</th><th></th></tr></thead>
                                <tbody>
                                    {(pages ?? []).map(page => (
                                        <tr key={page.id}>
                                            <td className="font-medium text-gray-900 dark:text-white">{page.title}</td>
                                            <td className="font-mono text-xs text-gray-500">/{page.slug}</td>
                                            <td><span className={`badge ${page.is_active ? 'badge-green' : 'badge-gray'}`}>{page.is_active ? 'Active' : 'Draft'}</span></td>
                                            <td>
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={route('admin.content.pages.edit', page.id)} className="btn-ghost btn-sm p-1.5">
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => destroyPage(page)} className="btn-ghost btn-sm p-1.5 text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'blog' && (
                    <div className="space-y-3">
                        <div className="flex justify-end">
                            <Link href={route('admin.content.blog.create')} className="btn-primary btn-sm">
                                <Plus className="w-4 h-4" /> New Post
                            </Link>
                        </div>
                        <div className="card p-5">
                            <div className="table-wrapper">
                                <table className="table-base">
                                    <thead><tr><th>Title</th><th>Author</th><th>Status</th><th>Published</th><th></th></tr></thead>
                                    <tbody>
                                        {(blogPosts ?? []).map(post => (
                                            <tr key={post.id}>
                                                <td className="font-medium text-gray-900 dark:text-white">{post.title}</td>
                                                <td className="text-sm text-gray-500">{post.author?.name ?? '—'}</td>
                                                <td><span className={`badge ${post.is_published ? 'badge-green' : 'badge-gray'}`}>{post.is_published ? 'Published' : 'Draft'}</span></td>
                                                <td>{post.published_at ? formatDate(post.published_at) : '—'}</td>
                                                <td>
                                                    <div className="flex gap-2 justify-end">
                                                        <Link href={route('admin.content.blog.edit', post.id)} className="btn-ghost btn-sm p-1.5">
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button onClick={() => destroyPost(post)} className="btn-ghost btn-sm p-1.5 text-red-500">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {(blogPosts ?? []).length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-6">No posts yet</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'faqs' && (
                    <div className="space-y-3">
                        <div className="flex justify-end">
                            <Link href={route('admin.content.faqs.create')} className="btn-primary btn-sm">
                                <Plus className="w-4 h-4" /> Add FAQ
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {(faqs ?? []).map(faq => (
                                <div key={faq.id} className="card p-4 flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">{faq.question}</p>
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{faq.answer}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="badge badge-gray text-xs">{faq.category}</span>
                                            <span className={`badge ${faq.is_active ? 'badge-green' : 'badge-gray'} text-xs`}>{faq.is_active ? 'Active' : 'Off'}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Link href={route('admin.content.faqs.edit', faq.id)} className="btn-ghost btn-sm p-1.5">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => destroyFaq(faq)} className="btn-ghost btn-sm p-1.5 text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(faqs ?? []).length === 0 && <p className="text-gray-400 text-center py-6">No FAQs yet</p>}
                        </div>
                    </div>
                )}

                {tab === 'reviews' && (
                    <div className="card p-5">
                        <div className="table-wrapper">
                            <table className="table-base">
                                <thead><tr><th>Author</th><th>Rating</th><th>Review</th><th>Status</th><th></th></tr></thead>
                                <tbody>
                                    {(reviews ?? []).map(review => (
                                        <tr key={review.id}>
                                            <td>
                                                <p className="font-medium text-sm text-gray-900 dark:text-white">{review.author_name}</p>
                                                <p className="text-xs text-gray-400">{review.author_email}</p>
                                            </td>
                                            <td>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="max-w-xs text-sm text-gray-600 dark:text-gray-400 truncate">{review.body}</td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <span className={`badge ${review.is_approved ? 'badge-green' : 'badge-yellow'}`}>{review.is_approved ? 'Approved' : 'Pending'}</span>
                                                    {review.is_featured && <span className="badge badge-blue">Featured</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex gap-2 justify-end">
                                                    {!review.is_approved && (
                                                        <button onClick={() => approveReview(review)} className="btn-ghost btn-sm p-1.5 text-green-600">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => destroyReview(review)} className="btn-ghost btn-sm p-1.5 text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(reviews ?? []).length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-6">No reviews yet</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
