import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';
import FlashMessages from '@/Components/FlashMessages';
import {
    LayoutDashboard, ShoppingBag, Users, Package, Star, Settings,
    Bell, FileText, BookOpen, MessageSquare, Wrench, Sun, Moon,
    Menu, X, LogOut, ChevronRight, AlertTriangle,
} from 'lucide-react';

const navSections = [
    {
        label: 'Головне',
        items: [
            { href: 'admin.dashboard', label: 'Дашборд', icon: LayoutDashboard },
            { href: 'admin.orders.index', label: 'Замовлення', icon: ShoppingBag },
            { href: 'admin.users.index', label: 'Користувачі', icon: Users },
            { href: 'admin.inventory.index', label: 'Склад', icon: Package },
        ],
    },
    {
        label: 'Бізнес',
        items: [
            { href: 'admin.services.index', label: 'Послуги', icon: Wrench },
            { href: 'admin.loyalty.index', label: 'Бонуси і промо', icon: Star },
            { href: 'admin.notifications.index', label: 'Повідомлення', icon: Bell },
        ],
    },
    {
        label: 'Контент',
        items: [
            { href: 'admin.content.pages', label: 'Сторінки', icon: FileText },
            { href: 'admin.content.faqs', label: 'FAQs', icon: MessageSquare },
            { href: 'admin.content.reviews', label: 'Відгуки', icon: Star },
            { href: 'admin.content.blog', label: 'Блог', icon: BookOpen },
        ],
    },
    {
        label: 'Система',
        items: [
            { href: 'admin.settings', label: 'Налаштування', icon: Settings },
        ],
    },
];

function SidebarLink({ item, currentUrl }) {
    const href = route(item.href);
    const active = currentUrl.startsWith(new URL(href, window.location.origin).pathname);
    const Icon = item.icon;

    return (
        <Link href={href} className={`sidebar-link ${active ? 'active' : ''}`}>
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
        </Link>
    );
}

export default function AdminLayout({ children, title }) {
    const { auth, app } = usePage().props;
    const [dark, setDark] = useDarkMode();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
            {/* моб. оверлей */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* сайдбар */}
            <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-30 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* лого */}
                <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <Link href={route('admin.dashboard')} className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
                        {app.logo ? (
                            <>
                                {app.logo_dark ? (
                                        <>
                                            <img src={app.logo} alt={app.name} className="h-6 w-auto dark:hidden" />
                                            <img src={app.logo_dark} alt={app.name} className="h-6 w-auto hidden dark:block" />
                                        </>
                                    ) : (
                                        <img src={app.logo} alt={app.name} className="h-6 w-auto" />
                                    )
                                }  
                            </>                     
                        ) : (
                            <>
                                <Wrench className="w-5 h-5 text-blue-600" />
                                <span className="font-bold text-gray-900 dark:text-white">{app.name}</span>
                            </>
                        )}
                    </Link>
                    <span className="ml-auto badge-blue text-xs">Admin</span>
                </div>

                {/* меню */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                    {navSections.map(section => (
                        <div key={section.label}>
                            <p className="px-4 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
                                {section.label}
                            </p>
                            <div className="space-y-0.5">
                                {section.items.map(item => (
                                    <SidebarLink key={item.href} item={item} currentUrl={url} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* юзер меню */}
                <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {auth.user?.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{auth.user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{auth.user?.email}</p>
                        </div>
                    </div>
                    <Link href={route('home')} className="sidebar-link -mt-1">
                        <ChevronRight className="w-4 h-4" /> Публічний сайт
                    </Link>
                    <Link href={route('logout')} method="post" as="button" className="sidebar-link w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 mt-0.5">
                        <LogOut className="w-4 h-4" /> Вийти
                    </Link>
                </div>
            </aside>

            {/* головний блок */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* хедер */}
                <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 h-16 flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost p-2 rounded-xl">
                        <Menu className="w-5 h-5" />
                    </button>
                    <h1 className="font-semibold text-gray-900 dark:text-white text-lg">{title}</h1>
                    <div className="ml-auto flex items-center gap-3">
                        {url.indexOf('admin/orders/new') == -1 && (
                            <Link href={route('admin.orders.new')} className="btn-primary btn-sm">
                                Нове замовлення
                            </Link>
                        )}
                        <button onClick={() => setDark(!dark)} className="btn-ghost p-2 rounded-xl">
                            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>

            <FlashMessages />
        </div>
    );
}
