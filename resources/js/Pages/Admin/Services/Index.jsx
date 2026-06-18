import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash2, FolderOpen, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import axios from 'axios';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── сортування категорій (drag & drop) ───────────────────────────────────────────────────
function SortableCategoryPill({ cat, onEdit, onDestroy }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm select-none">
            {cat.slug !== 'uncategorized' && (
                <span {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing">
                    <GripVertical className="w-3.5 h-3.5" />
                </span>
            )}
            <span className={`font-medium ${cat.is_active ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 line-through'}`}>
                {cat.name}
            </span>
            {cat.slug !== 'uncategorized' && (
                <>
                    <button onClick={() => onEdit(cat)} className="text-gray-400 hover:text-blue-500 transition-colors ml-1">
                        <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDestroy(cat)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </>
            )}
        </div>
    );
}

// ─── рядок з послугою (сортування drag & drop) ─────────────────────────────────────────────────────
function SortableServiceRow({ service, onEdit, onDestroy }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: service.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

    return (
        <tr ref={setNodeRef} style={style}>
            <td className="w-8">
                <span {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-400 active:cursor-grabbing flex justify-center">
                    <GripVertical className="w-4 h-4" />
                </span>
            </td>
            <td>
                <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                {service.description && <p className="text-xs text-gray-400 truncate max-w-xs">{service.description}</p>}
            </td>
            <td>{service.category?.name ?? '—'}</td>
            <td>
                {service.price_from ? (
                    <span>{formatCurrency(service.price_from)}{service.price_to ? ` – ${formatCurrency(service.price_to)}` : ''}</span>
                ) : '—'}
            </td>
            <td>{service.duration_minutes ? `${service.duration_minutes} хв` : '—'}</td>
            <td>
                <span className={`badge ${service.is_active ? 'badge-green' : 'badge-gray'}`}>
                    {service.is_active ? 'Активна' : 'Не активна'}
                </span>
            </td>
            <td>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => onEdit(service)} className="btn-ghost btn-sm p-1.5">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDestroy(service)} className="btn-ghost btn-sm p-1.5 text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── створення/редагування категорії (модал) ───────────────────────────────────────────────────────────
function CategoryModal({ category, onClose }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: category?.name ?? '',
        description: category?.description ?? '',
        icon: category?.icon ?? '',
        is_active: category?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (category) {
            patch(route('admin.services.categories.update', category.id), { onSuccess: () => { onClose(); reset(); } });
        } else {
            post(route('admin.services.categories.store'), { onSuccess: () => { onClose(); reset(); } });
        }
    };

    return (
        <Modal open title={category ? 'Редагувати категорію' : 'Нова категорія'} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <div className="form-group">
                    <label className="label">Назва категорії</label>
                    <input className="input" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. Smartphone" />
                    {errors.name && <p className="form-error">{errors.name}</p>}
                </div>
                <div className="form-group">
                    <label className="label">Іконка (emoji або текст)</label>
                    <input className="input" value={data.icon} onChange={e => setData('icon', e.target.value)} placeholder="e.g. 📱" />
                </div>
                <div className="form-group">
                    <label className="label">Опис</label>
                    <textarea className="input h-20 resize-none" value={data.description} onChange={e => setData('description', e.target.value)} />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Активна</span>
                </label>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Відміна</button>
                    <button type="submit" className="btn-primary flex-1" disabled={processing}>{category ? 'Зберегти' : 'Додати категорію'}</button>
                </div>
            </form>
        </Modal>
    );
}

// ─── створення/редагування послуги (модал) ────────────────────────────────────────────────────────────
function ServiceModal({ service, categories, onClose }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: service?.name ?? '',
        device_category_id: service?.device_category_id ?? '',
        description: service?.description ?? '',
        price_from: service?.price_from ?? '',
        price_to: service?.price_to ?? '',
        duration_minutes: service?.duration_minutes ?? 60,
        is_active: service?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (service) {
            patch(route('admin.services.update', service.id), { onSuccess: () => { onClose(); reset(); } });
        } else {
            post(route('admin.services.store'), { onSuccess: () => { onClose(); reset(); } });
        }
    };

    return (
        <Modal open title={service ? 'Редагування послуги' : 'Нова послуга'} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <div className="form-group">
                    <label className="label">Назва послуги</label>
                    <input className="input" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Заміна екрану" />
                    {errors.name && <p className="form-error">{errors.name}</p>}
                </div>
                <div className="form-group">
                    <label className="label">Категорія / пристрій</label>
                    <select className="input" value={data.device_category_id} onChange={e => setData('device_category_id', e.target.value)}>
                        <option value="">Оберіть категорію…</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.device_category_id && <p className="form-error">{errors.device_category_id}</p>}
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="form-group">
                        <label className="label">Ціна від (₴)</label>
                        <input className="input" type="number" step="0.01" min="0" value={data.price_from} onChange={e => setData('price_from', e.target.value)} />
                        {errors.price_from && <p className="form-error">{errors.price_from}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">Ціна до (₴)</label>
                        <input className="input" type="number" step="0.01" min="0" value={data.price_to} onChange={e => setData('price_to', e.target.value)} placeholder="Optional" />
                    </div>
                    <div className="form-group">
                        <label className="label">Час вик. (хв)</label>
                        <input className="input" type="number" min="0" value={data.duration_minutes} onChange={e => setData('duration_minutes', e.target.value)} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="label">Опис</label>
                    <textarea className="input h-20 resize-none" value={data.description} onChange={e => setData('description', e.target.value)} />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Активна (відображається на сайті)</span>
                </label>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Відміна</button>
                    <button type="submit" className="btn-primary flex-1" disabled={processing}>{service ? 'Зберегти' : 'Додати послугу'}</button>
                </div>
            </form>
        </Modal>
    );
}

// ─── головний код сторінки ────────────────────────────────────────────────────────────────
export default function ServicesIndex({ services, categories: initialCategories, filters }) {
    const [serviceModal, setServiceModal] = useState(null);
    const [categoryModal, setCategoryModal] = useState(null);
    const [categories, setCategories] = useState(initialCategories);
    const [serviceItems, setServiceItems] = useState(services.data);

    useEffect(() => { setServiceItems(services.data); }, [services.data]);
    useEffect(() => { setCategories(initialCategories); }, [initialCategories]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const applyFilter = (newFilters) => {
        router.get(route('admin.services.index'), { ...filters, ...newFilters }, { preserveState: true, replace: true });
    };

    const destroyService = (service) => {
        if (!confirm(`Delete "${service.name}"?`)) return;
        router.delete(route('admin.services.destroy', service.id));
    };

    const destroyCategory = (category) => {
        if (category.slug === 'uncategorized') return;
        if (!confirm(`Delete category "${category.name}"? All its services will be moved to Uncategorized.`)) return;
        router.delete(route('admin.services.categories.destroy', category.id));
    };

    const handleCategoryDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = categories.findIndex(c => c.id === active.id);
        const newIndex = categories.findIndex(c => c.id === over.id);
        const reordered = arrayMove(categories, oldIndex, newIndex);
        setCategories(reordered);
        axios.post(route('admin.services.categories.reorder'), { ids: reordered.map(c => c.id) });
    };

    const handleServiceDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = serviceItems.findIndex(s => s.id === active.id);
        const newIndex = serviceItems.findIndex(s => s.id === over.id);
        const reordered = arrayMove(serviceItems, oldIndex, newIndex);
        setServiceItems(reordered);
        axios.post(route('admin.services.reorder'), { ids: reordered.map(s => s.id) });
    };

    // сортування категорій крім uncategorized
    const draggableCategories = categories.filter(c => c.slug !== 'uncategorized');
    const uncategorized = categories.filter(c => c.slug === 'uncategorized');

    return (
        <AdminLayout title="Послуги">
            <Head title="Послуги" />

            <div className="space-y-6">
                {/* категорії */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" /> Категорії (пристрої)
                        </h2>
                        <button onClick={() => setCategoryModal('create')} className="btn-primary btn-sm">
                            <Plus className="w-4 h-4" /> Додати категорію
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">Перетягніть для сортування — в цьому порядку категорії відображаються на сайті на сторінці Послуги.</p>
                    <div className="flex flex-wrap gap-2">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                            <SortableContext items={draggableCategories.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                                {draggableCategories.map(cat => (
                                    <SortableCategoryPill key={cat.id} cat={cat} onEdit={setCategoryModal} onDestroy={destroyCategory} />
                                ))}
                            </SortableContext>
                        </DndContext>
                        {uncategorized.map(cat => (
                            <SortableCategoryPill key={cat.id} cat={cat} onEdit={setCategoryModal} onDestroy={destroyCategory} />
                        ))}
                    </div>
                </div>

                {/* послуги */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <input
                            className="input w-64"
                            placeholder="Пошук послуги…"
                            defaultValue={filters?.search}
                            onChange={e => applyFilter({ search: e.target.value, category_id: filters?.category_id })}
                        />
                        <select
                            className="input w-48"
                            value={filters?.category_id ?? ''}
                            onChange={e => applyFilter({ category_id: e.target.value || undefined })}
                        >
                            <option value="">Всі категорії</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <button onClick={() => setServiceModal('create')} className="btn-primary ml-auto">
                            <Plus className="w-4 h-4" /> Додати послугу
                        </button>
                    </div>

                    <div className="table-wrapper">
                        <table className="table-base">
                            <thead>
                                <tr>
                                    <th className="w-8"></th>
                                    <th>Послуга</th>
                                    <th>Категорія</th>
                                    <th>Вартість</th>
                                    <th>Тривалість</th>
                                    <th>Статус</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleServiceDragEnd}>
                                    <SortableContext items={serviceItems.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                        {serviceItems.map(service => (
                                            <SortableServiceRow key={service.id} service={service} onEdit={setServiceModal} onDestroy={destroyService} />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                                {serviceItems.length === 0 && (
                                    <tr><td colSpan={7} className="text-center text-gray-400 py-8">Жодної послуги не знайдено</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination links={services.links} />
                </div>
            </div>

            {serviceModal && (
                <ServiceModal
                    service={serviceModal === 'create' ? null : serviceModal}
                    categories={categories}
                    onClose={() => setServiceModal(null)}
                />
            )}

            {categoryModal && (
                <CategoryModal
                    category={categoryModal === 'create' ? null : categoryModal}
                    onClose={() => setCategoryModal(null)}
                />
            )}
        </AdminLayout>
    );
}
