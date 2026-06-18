import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save, Upload, X, Image, Film } from 'lucide-react';
import { useRef, useState } from 'react';
import axios from 'axios';

const PAGE_SCHEMAS = {
    home: [
        { 
            key: 'hero_title',    
            label: 'Заголовок банера',           
            type: 'text',     
            placeholder: '' 
        },
        { 
            key: 'hero_subtitle', 
            label: 'Підзаголовок банера',
            type: 'textarea', 
            placeholder: '' 
        },
        { 
            key: 'hero_badge',
            label: 'CTA для реєстрації (над заголовком)',
            type: 'text',
            placeholder: '' 
        },
        { 
            key: 'hero_bg_image', 
            label: 'Фонове зображення', 
            type: 'image',
            placeholder: '' 
        },
        { 
            key: 'hero_bg_video', 
            label: 'Фонове відео', 
            type: 'video',
            placeholder: '' 
        },
    ],
    about: [
        { 
            key: 'hero_title',
            label: 'Заголовок банера',
            type: 'text',
            placeholder: '' 
        },
        { 
            key: 'hero_subtitle',
            label: 'Підзаголовок банера',
            type: 'textarea', 
            placeholder: '' 
        },
        { 
            key: 'hero_bg_image',
            label: 'Фон банера',
            type: 'image',
            placeholder: '' 
        },
        { 
            key: 'repairs_count',
            label: 'Зроблено ремонтів',
            type: 'text',
            placeholder: '5000+' 
        },
        { 
            key: 'customers_count', 
            label: 'Задоволених клієнтів',
            type: 'text',
            placeholder: '3200+' 
        },
        { 
            key: 'years',
            label: 'Років досвіду',
            type: 'text',
            placeholder: '6+' 
        },
        { 
            key: 'rating',
            label: 'Середня оцінка',
            type: 'text',
            placeholder: '4.9 ★' 
        },
        { 
            key: 'story',
            label: 'Наша історія',
            type: 'textarea', 
            placeholder: '.' 
        },
    ],
    services: [
        { 
            key: 'hero_title',
            label: 'Заголовок банера',
            type: 'text',  
            placeholder: '' 
        },
        { 
            key: 'hero_subtitle', 
            label: 'Підзаголовок банера', 
            type: 'text',  
            placeholder: '' 
        },
        { 
            key: 'hero_bg_image', 
            label: 'Фон банера', 
            type: 'image', 
            placeholder: '' 
        },
    ],
    pricing: [
        { 
            key: 'hero_title',
            label: 'Заголовок банера',
            type: 'text',
            placeholder: '' 
        },
        { 
            key: 'hero_subtitle',
            label: 'Підзаголовок банера',
            type: 'text',
            placeholder: '' 
        },
        { 
            key: 'hero_bg_image',
            label: 'Фон банера', 
            type: 'image',  
            placeholder: '' 
        },
        { 
            key: 'disclaimer_text', 
            label: 'Дисклеймер',
            type: 'textarea', 
            placeholder: '' 
        },
    ],
    contact: [
        { 
            key: 'hero_title',
            label: 'Заголовок банера',
            type: 'text', 
            placeholder: '' 
        },
        { 
            key: 'hero_subtitle', 
            label: 'Підзаголовок банера', 
            type: 'text', 
            placeholder: ''
        },
        { 
            key: 'hero_bg_image', 
            label: 'Фон банера', 
            type: 'image', 
            placeholder: '' 
        },
    ],
    faq: [
        { 
            key: 'hero_title',
            label: 'Заголовок банера',
            type: 'text', 
            placeholder: '' 
        },
        { 
            key: 'hero_subtitle', 
            label: 'Підзаголовок банера', 
            type: 'text', 
            placeholder: '' 
        },
        { 
            key: 'hero_bg_image', 
            label: 'Фон банера', 
            type: 'image', 
            placeholder: '' 
        },
    ],
};

function MediaUpload({ fieldKey, value, onChange, type, pageId, pageSlug }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const isVideo = type === 'video';

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('field', fieldKey);
            const res = await axios.post(route('admin.content.pages.media', pageId), fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onChange(res.data.url);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {value && (
                <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                    {isVideo ? (
                        <video
                            src={value}
                            style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '8px', display: 'block' }}
                            controls
                        />
                    ) : (
                        <img
                            src={value}
                            alt="preview"
                            style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '8px', objectFit: 'cover', display: 'block' }}
                        />
                    )}
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        title="Видалити"
                        style={{
                            position: 'absolute', top: 6, right: 6,
                            background: 'rgba(0,0,0,0.55)', color: '#fff',
                            border: 'none', borderRadius: '50%',
                            width: 24, height: 24, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <X size={13} />
                    </button>
                </div>
            )}

            {/* url */}
            <input
                className="input text-sm"
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
                placeholder={isVideo ? 'Вставте URL відео або завантажте файл нижче.' : 'Вставте URL зображення або завантажте файл нижче.'}
            />

            {/* кнопка завантаження */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="btn-ghost btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    {isVideo ? <Film size={14} /> : <Image size={14} />}
                    {uploading ? 'Завантаження...' : `Оберіть ${isVideo ? 'відео' : 'зображення'}`}
                    <Upload size={13} />
                </button>
                {value && <span style={{ fontSize: '0.75rem', color: '#6b7280', wordBreak: 'break-all' }}>{value}</span>}
            </div>
            {error && <p className="form-error">{error}</p>}

            <input
                ref={inputRef}
                type="file"
                accept={isVideo ? 'video/mp4,video/webm,video/ogg' : 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml'}
                style={{ display: 'none' }}
                onChange={handleFile}
            />
        </div>
    );
}

export default function PageEdit({ page }) {
    const schema = PAGE_SCHEMAS[page.slug] ?? [];
    const existingContent = page.content ?? {};

    const initialContent = {};
    schema.forEach(({ key, placeholder, type }) => {
        if (type === 'image' || type === 'video') {
            initialContent[key] = existingContent[key] ?? '';
        } else {
            initialContent[key] = existingContent[key] ?? placeholder ?? '';
        }
    });

    const { data, setData, patch, processing, errors } = useForm({
        title:            page.title,
        meta_description: page.meta_description ?? '',
        is_published:     page.is_published ?? true,
        content:          initialContent,
    });

    const setContent = (key, value) => {
        setData('content', { ...data.content, [key]: value });
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('admin.content.pages.update', page.id));
    };

    return (
        <AdminLayout title={`Редагування: ${page.title}`}>
            <Head title={`Редагування: ${page.title}`} />

            <div className="max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('admin.content.pages')} className="btn-ghost btn-sm p-1.5">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="page-header mb-0">{page.title}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">/{page.slug}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="card p-6 space-y-4">
                        <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400">SEO &amp; Meta</h2>
                        <div className="form-group">
                            <label className="label">Назва сторінки</label>
                            <input className="input" value={data.title} onChange={e => setData('title', e.target.value)} />
                            {errors.title && <p className="form-error">{errors.title}</p>}
                        </div>
                        <div className="form-group">
                            <label className="label">Meta Description</label>
                            <textarea
                                className="input resize-none"
                                rows={3}
                                value={data.meta_description}
                                onChange={e => setData('meta_description', e.target.value)}
                                placeholder="Shown in search engine results (150–160 characters recommended)"
                            />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_published}
                                onChange={e => setData('is_published', e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Сторінка опублікована</span>
                        </label>
                    </div>

                    {/* контент сторінки */}
                    {schema.length > 0 && (
                        <div className="card p-6 space-y-5">
                            <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400">Контент</h2>
                            {schema.map(({ key, label, type, placeholder }) => (
                                <div key={key} className="form-group">
                                    <label className="label">{label}</label>
                                    {type === 'image' || type === 'video' ? (
                                        <MediaUpload
                                            fieldKey={key}
                                            value={data.content[key] ?? ''}
                                            onChange={val => setContent(key, val)}
                                            type={type}
                                            pageId={page.id}
                                            pageSlug={page.slug}
                                        />
                                    ) : type === 'textarea' ? (
                                        <textarea
                                            className="input resize-y"
                                            rows={4}
                                            value={data.content[key] ?? ''}
                                            onChange={e => setContent(key, e.target.value)}
                                            placeholder={placeholder}
                                        />
                                    ) : (
                                        <input
                                            className="input"
                                            value={data.content[key] ?? ''}
                                            onChange={e => setContent(key, e.target.value)}
                                            placeholder={placeholder}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {schema.length === 0 && (
                        <div className="card p-6">
                            <p className="text-sm text-gray-400 italic">У цієї сторінки немає елементів контенту для редагування.</p>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button type="submit" className="btn-primary" disabled={processing}>
                            <Save className="w-4 h-4" />
                            {processing ? 'Збереження...' : 'Зберегти зміни'}
                        </button>
                        <Link href={route('admin.content.pages')} className="btn-ghost">Відміна</Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
