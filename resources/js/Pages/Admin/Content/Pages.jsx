import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Edit } from 'lucide-react';

export default function ContentPages({ pages }) {
    return (
        <AdminLayout title="Інформаційні сторінки">
            <Head title="Інформаційні сторінки" />

            <div className="card">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Тут ви можете редагувати публічні інформаційні сторінки сайту.</p>
                </div>
                <div className="table-wrapper">
                    <table className="table-base">
                        <thead>
                            <tr>
                                <th>Сторінка</th>
                                <th>URL</th>
                                <th>Meta Description</th>
                                <th>Статус</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map(page => {
                                return (
                                    <tr key={page.id}>
                                        <td className="font-medium text-gray-900 dark:text-white">{page.title}</td>
                                        <td className="font-mono text-xs text-gray-500">/{page.slug}</td>
                                        <td className="text-sm text-gray-500 max-w-xs truncate">{page.meta_description ?? '—'}</td>
                                        <td>
                                            <span className={`badge ${page.is_published ? 'badge-green' : 'badge-gray'}`}>
                                                {page.is_published ? 'Опубліковано' : 'Чорнетка'}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                href={route('admin.content.pages.edit', page.id)}
                                                className="btn-ghost btn-sm p-1.5 flex items-center gap-1.5"
                                            >
                                                <Edit className="w-4 h-4" /> Редагувати
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            {pages.length === 0 && (
                                <tr><td colSpan={6} className="text-center text-gray-400 py-8">Ще немає сторінок</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
