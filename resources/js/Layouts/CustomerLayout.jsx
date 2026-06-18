import { Link, usePage } from '@inertiajs/react';
import AppLayout from './AppLayout';
import { LayoutDashboard, ShoppingBag, Gift, User, ArrowLeft } from 'lucide-react';

const navItems = [
    { href: 'customer.dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { href: 'customer.orders.index', label: 'Мої замовлення', icon: ShoppingBag },
    { href: 'customer.bonuses', label: 'Бонуси', icon: Gift },
    { href: 'customer.profile', label: 'Профіль', icon: User },
];

export default function CustomerLayout({ children, title }) {
    const { url } = usePage();

    return (
        <AppLayout title={title}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    <aside className="lg:w-56 shrink-0">
                        <nav className="card p-3 space-y-0.5">
                            {navItems.map(item => {
                                const href = route(item.href);
                                const active = url.startsWith(new URL(href, window.location.origin).pathname);
                                const Icon = item.icon;
                                return (
                                    <Link key={item.href} href={href} className={`sidebar-link ${active ? 'active' : ''}`}>
                                        <Icon className="w-4 h-4 shrink-0" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                    <main className="flex-1 min-w-0">{children}</main>
                </div>
            </div>
        </AppLayout>
    );
}
