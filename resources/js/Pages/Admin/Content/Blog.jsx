import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { formatDate } from '@/lib/utils';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ContentBlog({ posts }) {
    const destroy = (post) => {
        if (!confirm(`Delete "${post.title}"?`)) return;
        router.delete(route('admin.content.blog.destroy', post.id));
    };

    return (
        <AdminLayout title="Блог">
            <Head title="Блог" />

            <div className="space-y-5">
                <div className="flex justify-end">
                    <Link href={route('admin.content.blog.create')} className="btn-primary">
                        <Plus className="w-4 h-4" /> Новий пост
                    </Link>
                </div>

                <div className="table-wrapper">
                    <table className="table-base">
                        <thead>
                            <tr>
                                <th>Назва</th>
                                <th>Автор</th>
                                <th>Статус</th>
                                <th>Дата</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.data.map(post => (
                                <tr key={post.id}>
                                    <td>
                                        <p className="font-medium text-gray-900 dark:text-white">{post.title}</p>
                                        {post.excerpt && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{post.excerpt}</p>}
                                    </td>
                                    <td className="text-sm text-gray-500">{post.author?.name ?? '—'}</td>
                                    <td>
                                        <span className={`badge ${post.is_published ? 'badge-green' : 'badge-gray'}`}>
                                            {post.is_published ? 'Опублікований' : 'Чорновик'}
                                        </span>
                                    </td>
                                    <td className="text-sm text-gray-500">{post.published_at ? formatDate(post.published_at) : '—'}</td>
                                    <td>
                                        <div className="flex gap-2 justify-end">
                                            <Link href={route('admin.content.blog.edit', post.id)} className="btn-ghost btn-sm p-1.5">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button onClick={() => destroy(post)} className="btn-ghost btn-sm p-1.5 text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {posts.data.length === 0 && (
                                <tr><td colSpan={5} className="text-center text-gray-400 py-8">No posts yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={posts.links} />
            </div>
        </AdminLayout>
    );
}
