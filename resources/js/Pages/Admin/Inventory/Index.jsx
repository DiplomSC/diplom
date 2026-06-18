import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

function PartModal({ part, onClose }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: part?.name ?? '',
        sku: part?.sku ?? '',
        description: part?.description ?? '',
        cost_price: part?.cost_price ?? '',
        sell_price: part?.sell_price ?? '',
        stock_quantity: part?.stock_quantity ?? 0,
        min_stock_alert: part?.min_stock_alert ?? 5,
    });

    const submit = (e) => {
        e.preventDefault();
        if (part) {
            patch(route('admin.inventory.update', part.id), { onSuccess: () => { onClose(); reset(); } });
        } else {
            post(route('admin.inventory.store'), { onSuccess: () => { onClose(); reset(); } });
        }
    };

    return (
        <Modal open title={part ? 'Редагувати деталь' : 'Додати деталь'} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group col-span-2">
                        <label className="label">Деталь</label>
                        <input className="input" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="iPhone 15 Pro Screen" />
                        {errors.name && <p className="form-error">{errors.name}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">SKU</label>
                        <input className="input" value={data.sku} onChange={e => setData('sku', e.target.value)} placeholder="SCR-IP15P-001" />
                        {errors.sku && <p className="form-error">{errors.sku}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">Кількість</label>
                        <input className="input" type="number" min="0" value={data.stock_quantity} onChange={e => setData('stock_quantity', e.target.value)} />
                        {errors.stock_quantity && <p className="form-error">{errors.stock_quantity}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">Ціна (закупка)</label>
                        <input className="input" type="number" step="0.01" min="0" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} placeholder="0.00" />
                        {errors.cost_price && <p className="form-error">{errors.cost_price}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">Ціна (продаж)</label>
                        <input className="input" type="number" step="0.01" min="0" value={data.sell_price} onChange={e => setData('sell_price', e.target.value)} placeholder="0.00" />
                        {errors.sell_price && <p className="form-error">{errors.sell_price}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">Закінчується коли (&lt;=)</label>
                        <input className="input" type="number" min="0" value={data.min_stock_alert} onChange={e => setData('min_stock_alert', e.target.value)} />
                    </div>
                    <div className="form-group col-span-2">
                        <label className="label">Опис</label>
                        <textarea className="input h-20 resize-none" value={data.description} onChange={e => setData('description', e.target.value)} />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Відміна</button>
                    <button type="submit" className="btn-primary flex-1" disabled={processing}>{part ? 'Зберегти' : 'Додати'}</button>
                </div>
            </form>
        </Modal>
    );
}

export default function InventoryIndex({ parts, filters }) {
    const [modal, setModal] = useState(null); 

    const search = (val) => router.get(route('admin.inventory.index'), { search: val }, { preserveState: true, replace: true });

    const destroy = (part) => {
        if (!confirm(`Delete "${part.name}"?`)) return;
        router.delete(route('admin.inventory.destroy', part.id));
    };

    return (
        <AdminLayout title="Склад">
            <Head title="Склад" />

            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <input
                            className="input w-64"
                            placeholder="Пошук деталі…"
                            defaultValue={filters?.search}
                            onChange={e => search(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setModal('create')} className="btn-primary">
                        <Plus className="w-4 h-4" /> Додати деталь
                    </button>
                </div>

                <div className="table-wrapper">
                    <table className="table-base">
                        <thead>
                            <tr>
                                <th>Деталь</th>
                                <th>SKU</th>
                                <th>Кількість (шт.)</th>
                                <th>Ціна (закупка/)</th>
                                <th>Ціна (продаж)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {parts.data.map(part => (
                                <tr key={part.id}>
                                    <td>
                                        <p className="font-medium text-gray-900 dark:text-white">{part.name}</p>
                                        {part.description && <p className="text-xs text-gray-400 truncate max-w-xs">{part.description}</p>}
                                    </td>
                                    <td className="font-mono text-xs">{part.sku ?? '—'}</td>
                                    <td>
                                        <span className={`badge ${part.stock_quantity <= part.min_stock_alert ? 'badge-red' : ''}`}>
                                            {part.stock_quantity <= part.min_stock_alert && <AlertTriangle title="Закінчується" className="w-3 h-3 mr-1" />}
                                            {part.stock_quantity}
                                        </span>
                                    </td>
                                    <td>{part.cost_price ? formatCurrency(part.cost_price) : '—'}</td>
                                    <td>{part.sell_price ? formatCurrency(part.sell_price) : '—'}</td>
                                    <td>
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setModal(part)} className="btn-ghost btn-sm p-1.5">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => destroy(part)} className="btn-ghost btn-sm p-1.5 text-red-500 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {parts.data.length === 0 && (
                                <tr><td colSpan={6} className="text-center text-gray-400 py-8">Не знайдено деталей</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={parts.links} />
            </div>

            {modal && (
                <PartModal
                    part={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                />
            )}
        </AdminLayout>
    );
}
