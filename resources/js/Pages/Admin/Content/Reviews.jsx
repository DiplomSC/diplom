import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import { formatDate } from '@/lib/utils';
import { CheckCircle, Star, Trash2, Bookmark, Edit, Plus } from 'lucide-react';
import { useState } from 'react';

function ReviewModal({ review, onClose }) {
    const isNew = !review;
    const { data, setData, post, patch, processing, errors } = useForm({
        author_name: review?.author_name ?? '',
        rating:      review?.rating ?? 5,
        body:        review?.body ?? '',
        is_approved: review?.is_approved ?? true,
        is_featured: review?.is_featured ?? false,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isNew) {
            post(route('admin.content.reviews.store'), { onSuccess: onClose });
        } else {
            patch(route('admin.content.reviews.update', review.id), { onSuccess: onClose });
        }
    };

    return (
        <Modal open title={isNew ? 'Новий відгук' : 'Редагувати відгук'} onClose={onClose} maxWidth="lg" overlayClose="false">
            <form onSubmit={submit} className="space-y-4">
                <div className="form-group">
                    <label className="label">Автор (ім'я)</label>
                    <input className="input" value={data.author_name} onChange={e => setData('author_name', e.target.value)} />
                    {errors.author_name && <p className="form-error">{errors.author_name}</p>}
                </div>
                <div className="form-group">
                    <label className="label">Оцінка</label>
                    <div className="flex gap-2 items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} type="button" onClick={() => setData('rating', star)}>
                                <Star className={`w-6 h-6 ${star <= data.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            </button>
                        ))}
                        <span className="text-sm text-gray-500 ml-1">{data.rating} / 5</span>
                    </div>
                    {errors.rating && <p className="form-error">Це обов'язкове поле</p>}
                </div>
                <div className="form-group">
                    <label className="label">Відгук</label>
                    <textarea className="input h-28 resize-none" value={data.body} onChange={e => setData('body', e.target.value)} />
                    {errors.body && <p className="form-error">Це обов'язкове поле</p>}
                </div>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                        <input type="checkbox" checked={data.is_approved} onChange={e => setData('is_approved', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                        Опублікувати
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                        <input type="checkbox" checked={data.is_featured} onChange={e => setData('is_featured', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                        Рекомендований
                    </label>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Відміна</button>
                    <button type="submit" className="btn-primary flex-1" disabled={processing}>{isNew ? 'Додати відгук' : 'Зберегти'}</button>
                </div>
            </form>
        </Modal>
    );
}

export default function ContentReviews({ reviews }) {
    const [editReview, setEditReview] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);

    const approve = (review) => router.patch(route('admin.content.reviews.approve', review.id));
    const feature = (review) => router.patch(route('admin.content.reviews.feature', review.id));
    const destroy = (review) => {
        if (!confirm('Delete this review?')) return;
        router.delete(route('admin.content.reviews.destroy', review.id));
    };

    return (
        <AdminLayout title="Відгуки">
            <Head title="Відгуки" />

            <div className="space-y-5">
                <div className="flex justify-end">
                    <button onClick={() => setCreateOpen(true)} className="btn-primary">
                        <Plus className="w-4 h-4" /> Додати відгук
                    </button>
                </div>
                <div className="table-wrapper">
                    <table className="table-base">
                        <thead>
                            <tr>
                                <th>Автор</th>
                                <th>Оцінка</th>
                                <th>Текст</th>
                                <th>Дата</th>
                                <th>Статус</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.data.map(review => (
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
                                    <td className="max-w-xs text-sm text-gray-600 dark:text-gray-400">
                                        <p className="line-clamp-2">{review.body}</p>
                                    </td>
                                    <td className="text-sm text-gray-500">{formatDate(review.created_at)}</td>
                                    <td>
                                        <div className="flex gap-1 flex-wrap">
                                            <span className={`badge ${review.is_approved ? 'badge-green' : 'badge-yellow'}`}>
                                                {review.is_approved ? 'Опублікований' : 'Не опублікований'}
                                            </span>
                                            {review.is_featured && <span className="badge badge-blue">Рекомендований</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-1 justify-end">
                                            {!review.is_approved && (
                                                <button onClick={() => approve(review)} className="btn-ghost btn-sm p-1.5 text-green-600" title="Опублікувати">
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => feature(review)} className={`btn-ghost btn-sm p-1.5 ${review.is_featured ? 'text-blue-600' : 'text-gray-400'}`} title="Рекомендувати">
                                                <Bookmark className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setEditReview(review)} className="btn-ghost btn-sm p-1.5" title="Редагувати">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => destroy(review)} className="btn-ghost btn-sm p-1.5 text-red-500" title="Видалити">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {reviews.data.length === 0 && (
                                <tr><td colSpan={6} className="text-center text-gray-400 py-8">Ще немає відгуків</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={reviews.links} />
            </div>

            {createOpen && <ReviewModal review={null} onClose={() => setCreateOpen(false)} />}
            {editReview && <ReviewModal review={editReview} onClose={() => setEditReview(null)} />}
        </AdminLayout>
    );
}
