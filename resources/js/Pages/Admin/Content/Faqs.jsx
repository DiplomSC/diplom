import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, useSortable, horizontalListSortingStrategy,
    verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';

// ─── категорія ────────────────────────────────────────────────
function SortableCategoryPill({ cat, active, onClick, onEdit, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer select-none transition-colors ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'}`}>
            <span {...attributes} {...listeners} className="cursor-grab touch-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <GripVertical className="w-3 h-3" />
            </span>
            <span onClick={onClick}>{cat.name}</span>
            <button onClick={e => { e.stopPropagation(); onEdit(cat); }} className="ml-1 opacity-60 hover:opacity-100">
                <Edit className="w-3 h-3" />
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(cat); }} className="opacity-60 hover:opacity-100 text-red-500">
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );
}

// ─── питання/відповідь ──────────────────────────────────────────
function SortableFaqRow({ faq, categories, onEdit, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: faq.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

    let faqCat = 'Загальні питання';
    categories.map(cat => {
        if(cat.slug == faq.category){
            faqCat = cat.name;
        }
    });

    return (
        <div ref={setNodeRef} style={style} className="card p-4 flex items-start gap-3">
            <button {...attributes} {...listeners} className="cursor-grab touch-none mt-0.5 text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 shrink-0">
                <GripVertical className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{faq.question}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{faq.answer}</p>
                <div className="flex gap-2 mt-2">
                    <span className="badge badge-gray text-xs">{faqCat}</span>
                    <span className={`badge ${faq.is_active ? 'badge-green' : 'badge-gray'} text-xs`}>
                        {faq.is_active ? 'Активний' : 'Не активний'}
                    </span>
                </div>
            </div>
            <div className="flex gap-2 shrink-0">
                <button onClick={() => onEdit(faq)} className="btn-ghost btn-sm p-1.5">
                    <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(faq)} className="btn-ghost btn-sm p-1.5 text-red-500">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// ─── категорія (модал) ───────────────────────────────────────────────────────────
function CategoryModal({ cat, onClose }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name:      cat?.name ?? '',
        is_active: cat?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (cat) {
            patch(route('admin.content.faq-categories.update', cat.id), { onSuccess: () => { onClose(); reset(); } });
        } else {
            post(route('admin.content.faq-categories.store'), { onSuccess: () => { onClose(); reset(); } });
        }
    };

    return (
        <Modal open title={cat ? 'Редагування розділу' : 'Новий розділ'} onClose={onClose} overlayClose="false">
            <form onSubmit={submit} className="space-y-4">
                <div className="form-group">
                    <label className="label">Назва</label>
                    <input className="input" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="" />
                    {errors.name && <p className="form-error">{errors.name}</p>}
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Активний</span>
                </label>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Відміна</button>
                    <button type="submit" className="btn-primary flex-1" disabled={processing}>{cat ? 'Зберегти' : 'Додати розділ'}</button>
                </div>
            </form>
        </Modal>
    );
}

// ─── питання (модал) ────────────────────────────────────────────────────────────────
function FaqModal({ faq, categories, onClose }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        question:   faq?.question ?? '',
        answer:     faq?.answer ?? '',
        category:   faq?.category ?? (categories[0]?.slug ?? ''),
        sort_order: faq?.sort_order ?? 0,
        is_active:  faq?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (faq) {
            patch(route('admin.content.faqs.update', faq.id), { onSuccess: () => { onClose(); reset(); } });
        } else {
            post(route('admin.content.faqs.store'), { onSuccess: () => { onClose(); reset(); } });
        }
    };

    return (
        <Modal open title={faq ? 'Редагування' : 'Додати питання'} onClose={onClose} overlayClose="false">
            <form onSubmit={submit} className="space-y-4">
                <div className="form-group">
                    <label className="label">Питання</label>
                    <input className="input" value={data.question} onChange={e => setData('question', e.target.value)} />
                    {errors.question && <p className="form-error">Це обов'язкове поле</p>}
                </div>
                <div className="form-group">
                    <label className="label">Відповідь</label>
                    <textarea className="input h-32 resize-none" value={data.answer} onChange={e => setData('answer', e.target.value)} />
                    {errors.answer && <p className="form-error">Це обов'язкове поле</p>}
                </div>
                <div className="form-group">
                    <label className="label">Розділ</label>
                    <select className="input" value={data.category} onChange={e => setData('category', e.target.value)}>
                        {categories.map(c => (
                            <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Активне</span>
                </label>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Відміна</button>
                    <button type="submit" className="btn-primary flex-1" disabled={processing}>{faq ? 'Зберегти' : 'Додати питання'}</button>
                </div>
            </form>
        </Modal>
    );
}

// ─── код сторінки ────────────────────────────────────────────────────────────────
export default function ContentFaqs({ faqs, categories: initialCategories }) {
    const [catItems, setCatItems]   = useState(initialCategories);
    const [faqItems, setFaqItems]   = useState(faqs);
    const [filterCat, setFilterCat] = useState('');
    const [faqModal, setFaqModal]   = useState(null);
    const [catModal, setCatModal]   = useState(null);

    useEffect(() => { setCatItems(initialCategories); }, [initialCategories]);
    useEffect(() => { setFaqItems(faqs); }, [faqs]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleCatDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = catItems.findIndex(c => c.id === active.id);
        const newIndex = catItems.findIndex(c => c.id === over.id);
        const reordered = arrayMove(catItems, oldIndex, newIndex);
        setCatItems(reordered);
        axios.post(route('admin.content.faq-categories.reorder'), { order: reordered.map(c => c.id) });
    };

    const handleFaqDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = faqItems.findIndex(f => f.id === active.id);
        const newIndex = faqItems.findIndex(f => f.id === over.id);
        const reordered = arrayMove(faqItems, oldIndex, newIndex);
        setFaqItems(reordered);
        axios.post(route('admin.content.faqs.reorder'), { order: reordered.map(f => f.id) });
    };

    const deleteCat = (cat) => {
        if (!confirm(`Видалити розділ "${cat.name}"?`)) return;
        router.delete(route('admin.content.faq-categories.destroy', cat.id));
    };

    const deleteFaq = (faq) => {
        if (!confirm('Видалити це питання?')) return;
        router.delete(route('admin.content.faqs.destroy', faq.id));
    };

    const filtered = filterCat ? faqItems.filter(f => f.category === filterCat) : faqItems;

    return (
        <AdminLayout title="FAQs">
            <Head title="FAQs" />

            <div className="space-y-6">
                {/* список категорій */}
                <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Розділи</h2>
                        <button onClick={() => setCatModal('create')} className="btn-primary btn-sm">
                            <Plus className="w-3.5 h-3.5" /> Додати розділ
                        </button>
                    </div>
                    {catItems.length > 0 ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCatDragEnd}>
                            <SortableContext items={catItems.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                                <div className="flex flex-wrap gap-2">
                                    {catItems.map(cat => (
                                        <SortableCategoryPill
                                            key={cat.id}
                                            cat={cat}
                                            active={filterCat === cat.slug}
                                            onClick={() => setFilterCat(f => f === cat.slug ? '' : cat.slug)}
                                            onEdit={c => setCatModal(c)}
                                            onDelete={deleteCat}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <p className="text-sm text-gray-400">Ще немає розділів. Строріть перший розділ для початку.</p>
                    )}
                </div>

                {/* питання/відповіді */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <select className="input w-48" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                            <option value="">Всі розділи</option>
                            {catItems.map(c => (
                                <option key={c.id} value={c.slug}>{c.name}</option>
                            ))}
                        </select>
                        <button onClick={() => setFaqModal('create')} className="btn-primary btn-sm">
                            <Plus className="w-4 h-4" /> Додати питання
                        </button>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFaqDragEnd}>
                        <SortableContext items={filtered.map(f => f.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {filtered.map(faq => (
                                    <SortableFaqRow
                                        key={faq.id}
                                        faq={faq}
                                        categories={catItems}
                                        onEdit={setFaqModal}
                                        onDelete={deleteFaq}
                                    />
                                ))}
                                {filtered.length === 0 && (
                                    <p className="text-gray-400 text-center py-8">
                                        {filterCat ? 'Ще немає питань у цьому розділі' : 'Ще немає питань'}
                                    </p>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {faqModal && (
                <FaqModal
                    faq={faqModal === 'create' ? null : faqModal}
                    categories={catItems}
                    onClose={() => setFaqModal(null)}
                />
            )}
            {catModal && (
                <CategoryModal
                    cat={catModal === 'create' ? null : catModal}
                    onClose={() => setCatModal(null)}
                />
            )}
        </AdminLayout>
    );
}
