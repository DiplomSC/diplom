import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { USER_ROLES } from '@/lib/utils';
import { LoyaltyBadge } from '@/Components/StatusBadge';
import { Search, Eye, Shield } from 'lucide-react';
import { useState } from 'react';

export default function AdminUsers({ users, filters, roles }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (newFilters) => {
        router.get(route('admin.users.index'), { ...filters, ...newFilters }, { preserveState: true });
    };

    return (
        <AdminLayout title="Користувачі">
            <Head title="Користувачі" />

            <div className="card p-4 mb-5">
                <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-48 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input className="input pl-9" placeholder="Пошук за іменем, email, телефоном…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilter({ search })} />
                    </div>
                    <select className="input w-auto" value={filters.role ?? ''} onChange={e => applyFilter({ role: e.target.value || undefined })}>
                        <option value="">Всі ролі</option>
                        {roles.map(r => <option key={r} value={r}>{ USER_ROLES[r] }</option>)}
                    </select>
                    <button onClick={() => applyFilter({ search })} className="btn-primary btn-sm">Шукати</button>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="table-wrapper">
                    <table className="table-base">
                        <thead><tr>
                            <th>Користувач</th>
                            <th>Роль</th>
                            <th>Рівень</th>
                            <th>Бонуси</th>
                            <th>Статус</th>
                            <th>Дата</th>
                            <th></th>
                        </tr></thead>
                        <tbody>
                            {users.data.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <Link href={route('admin.users.show', user.id)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                            {user.avatar
                                                ? <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                : <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">{user.name.charAt(0)}</div>
                                            }
                                            <div>
                                                <div className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{user.name}</div>
                                                <div className="text-xs text-gray-400">{user.email}</div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.roles?.[0]?.name === 'admin' ? 'badge-red' : user.roles?.[0]?.name === 'technician' ? 'badge-purple' : 'badge-blue'}`}>
                                            {USER_ROLES[user.roles?.[0]?.name ?? 'user']}
                                        </span>
                                    </td>
                                    <td>{user.roles?.[0]?.name == 'user' && user.loyalty_level ? <LoyaltyBadge level={user.loyalty_level.name} color={user.loyalty_level.color} /> : ''}</td>
                                    <td className="font-medium">{user.roles?.[0]?.name == 'user' ? user.bonus_balance : ''}</td>
                                    <td>
                                        {user.is_blocked
                                            ? <span className="badge-red">Заблокований</span>
                                            : <span className="badge-green">Активний</span>
                                        }
                                    </td>
                                    <td className="text-gray-500 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <Link href={route('admin.users.show', user.id)} className="btn-ghost btn-sm p-1.5">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr><td colSpan="7" className="text-center py-8 text-gray-400">Користувачів не знайдено</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={users.links} />
        </AdminLayout>
    );
}
