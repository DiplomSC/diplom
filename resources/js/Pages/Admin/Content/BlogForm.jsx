import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import RichEditor from '@/Components/RichEditor';
import { ArrowLeft, Save, Upload, X, Image } from 'lucide-react';
import { useRef, useState } from 'react';
import axios from 'axios';

function CoverImageUpload({ value, onChange }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await axios.post(route('admin.content.blog.cover'), fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onChange(res.data.url);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Помилка завантаження');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-3">
            {value && (
                <div className="relative inline-block">
                    <img
                        src={value}
                        alt=""
                        className="rounded-xl object-cover"
                        style={{ maxHeight: '220px', maxWidth: '100%', display: 'block' }}
                    />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        title="Видалити"
                        style={{
                            position: 'absolute', top: 8, right: 8,
                            background: 'rgba(0,0,0,0.55)', color: '#fff',
                            border: 'none', borderRadius: '50%',
                            width: 26, height: 26, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {!value && (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:border-blue-400 transition-colors"
                    style={{ height: '160px' }}
                >
                    <Image className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Завантажте зображення</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP - макс. 4 MБ</p>
                </div>
            )}

            {/* URL */}
            <input
                className="input text-sm"
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
                placeholder="чи вставте URL зображення сюди"
            />

            {value && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="btn-ghost btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    <Upload size={13} />
                    {uploading ? 'Завантаження...' : 'Оберіть зображення'}
                </button>
            )}

            {error && <p className="form-error">{error}</p>}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
                onChange={handleFile}
            />
        </div>
    );
}

export default function BlogForm({ post }) {
    const isEdit = !!post;
    const { data, setData, post: postReq, patch, processing, errors } = useForm({
        title:        post?.title ?? '',
        excerpt:      post?.excerpt ?? '',
        body:         post?.body ?? '',
        cover_image:  post?.cover_image ?? '',
        is_published: post?.is_published ?? false,
        published_at: post?.published_at ? post.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('admin.content.blog.update', post.id));
        } else {
            postReq(route('admin.content.blog.store'));
        }
    };

    return (
        <AdminLayout title={isEdit ? 'Редагування посту' : 'Новий пост'}>
            <Head title={isEdit ? 'Редагування посту' : 'Новий пост'} />

            <form onSubmit={submit} className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-3 mb-2">
                    <Link href={route('admin.content.blog')} className="btn-ghost btn-sm p-2">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <h1 className="page-header">{isEdit ? 'Редагування посту' : 'Новий пост'}</h1>
                </div>

                <div className="card p-6 space-y-5">
                    <div className="form-group">
                        <label className="label">Назва</label>
                        <input className="input" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Post title…" />
                        {errors.title && <p className="form-error">Це обов'язкове поле</p>}
                    </div>

                    <div className="form-group">
                        <label className="label">Зображення</label>
                        <CoverImageUpload
                            value={data.cover_image}
                            onChange={val => setData('cover_image', val)}
                        />
                        {errors.cover_image && <p className="form-error">{errors.cover_image}</p>}
                    </div>

                    <div className="form-group">
                        <label className="label">Короткий опис</label>
                        <textarea className="input h-20 resize-none" value={data.excerpt} onChange={e => setData('excerpt', e.target.value)} placeholder="Текст, що відображається в карті посту " />
                        {errors.excerpt && <p className="form-error">{errors.excerpt}</p>}
                    </div>

                    <div className="form-group">
                        <label className="label">Текст посту</label>
                        <RichEditor
                            value={data.body}
                            onChange={val => setData('body', val)}
                            placeholder="Тут буде контент вашого посту..."
                        />
                        {errors.body && <p className="form-error">{errors.body}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="form-group">
                            <label className="label">Дата публікації</label>
                            <input className="input" type="date" value={data.published_at} onChange={e => setData('published_at', e.target.value)} />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer pb-2.5">
                            <input type="checkbox" checked={data.is_published} onChange={e => setData('is_published', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Опубліковано</span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href={route('admin.content.blog')} className="btn-ghost">Відміна</Link>
                    <button type="submit" className="btn-primary" disabled={processing}>
                        <Save className="w-4 h-4" />
                        {processing ? 'Saving…' : isEdit ? 'Зберегти' : 'Опублікувати'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
