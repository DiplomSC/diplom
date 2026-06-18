import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';
import FlashMessages from '@/Components/FlashMessages';
import {
    Menu, X, Sun, Moon, Wrench, ChevronDown, User, LogOut,
    LayoutDashboard, Gift, ShoppingBag, Star,
} from 'lucide-react';

function NavLink({ href, children }) {
    const { url } = usePage();
    const linkUrl = '/' + href.split('/').pop();
    const active = url.includes(linkUrl) && linkUrl !== '/' && href !== route('home') || url === '/' && href === route('home');

    return (
        <Link href={href} className={`nav-link px-1 py-0.5 transition-colors ${active ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}`}
        >
            {children}
        </Link>
    );
}

export default function AppLayout({ children, title }) {
    const { auth, app } = usePage().props;
    const [dark, setDark] = useDarkMode();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const navLinks = [
        { href: route('home'),      label: 'Головна' },
        { href: route('services'),  label: 'Послуги' },
        { href: route('pricing'),   label: 'Ціни' },
        { href: route('faq'),       label: 'FAQ' },
        { href: route('blog'),      label: 'Блог' },
        { href: route('contact'),   label: 'Контакти' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            {/* навігація */}
            <nav className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* лого */}
                        <Link href={route('home')} className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
                            {app.logo ? (
                                <>
                                    {app.logo_dark ? (
                                            <>
                                                <img src={app.logo} alt={app.name} className="h-9 w-auto dark:hidden" />
                                                <img src={app.logo_dark} alt={app.name} className="h-9 w-auto hidden dark:block" />
                                            </>
                                        ) : (
                                            <img src={app.logo} alt={app.name} className="h-10 w-auto" />
                                        )
                                    }  
                                </>                     
                            ) : (
                                <>
                                    <Wrench className="w-6 h-6" />
                                    <span>{app.name}</span>
                                </>
                            )}
                        </Link>

                        {/* навігація (десктоп) */}
                        <div className="hidden lg:flex items-center gap-8">
                            {navLinks.map(l => (
                                <NavLink key={l.href} href={l.href}>
                                    {l.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setDark(!dark)}
                                className="btn-ghost btn-sm p-2 rounded-xl"
                                aria-label="Toggle dark mode"
                            >
                                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>

                            {(!auth.user || auth.user.role === 'user') && (
                                <Link href={route('order.create')} className="hidden sm:flex btn-primary btn-sm text-sm">
                                    <Wrench className="w-4 h-4" /> Замовити
                                </Link>
                            )}

                            {/* юзер меню */}
                            {auth.user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 btn-ghost btn-sm rounded-xl px-3"
                                    >
                                        {auth.user.avatar
                                            ? <img src={auth.user.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                                            : <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                                {auth.user.name.charAt(0)}
                                              </div>
                                        }
                                        <span className="hidden sm:block text-sm font-medium max-w-24 truncate">
                                            {auth.user.name}
                                        </span>
                                        <ChevronDown className="w-3 h-3" />
                                    </button>

                                    {userMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                                            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1">
                                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{auth.user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{auth.user.email}</p>
                                                </div>
                                                <Link href={route('customer.dashboard')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <LayoutDashboard className="w-4 h-4" /> Мій кабінет
                                                </Link>
                                                {auth.user.role === 'user' && (<>
                                                    <Link href={route('customer.orders.index')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <ShoppingBag className="w-4 h-4" /> Мої замовлення
                                                    </Link>
                                                    <Link href={route('customer.bonuses')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <Gift className="w-4 h-4" /> Бонуси
                                                        <span className="ml-auto badge-blue text-xs">{auth.user.bonus_balance}</span>
                                                    </Link>
                                                </>)}
                                                <Link href={route('customer.profile')} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <User className="w-4 h-4" /> Профіль
                                                </Link>
                                                {(auth.user.role === 'admin' || auth.user.role === 'technician') && (
                                                    <Link
                                                        href={auth.user.role === 'admin' ? route('admin.dashboard') : route('tech.dashboard')}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        <Star className="w-4 h-4" />
                                                        {auth.user.role === 'admin' ? 'Адміністрування' : 'Кабінет майстра'}
                                                    </Link>
                                                )}
                                                <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                                                    <Link
                                                        href={route('logout')}
                                                        method="post"
                                                        as="button"
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                    >
                                                        <LogOut className="w-4 h-4" /> Вийти
                                                    </Link>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Link href={route('login')} className="btn-ghost btn-sm text-sm">Вхід</Link>
                                    <Link href={route('register')} className="btn-primary btn-sm text-sm">Реєстрація</Link>
                                </div>
                            )}

                            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden btn-ghost btn-sm p-2 rounded-xl">
                                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* моб. меню */}
                {menuOpen && (
                    <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-2">
                        {navLinks.map(l => (
                            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                                className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                                {l.label}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                            <Link href={route('order.create')} className="btn-primary btn-sm text-sm flex-1 text-center">Нове замовлення</Link>
                            {!auth.user && (
                                <>
                                    <Link href={route('login')} className="btn-ghost btn-sm text-sm flex-1 text-center">Вхід</Link>
                                    <Link href={route('register')} className="btn-secondary btn-sm text-sm flex-1 text-center">Реєстрація</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* головний блок */}
            <main className="flex-1">
                {children}
                
                {/* CTA банер для неавторизованих юзерів */}
                {!auth.user && (
                    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <Gift className="w-12 h-12 mx-auto mb-4 text-blue-200" />
                            <h2 className="text-3xl font-bold mb-4">Приєднуйся до нашої програми лояльності</h2>
                            <p className="text-blue-100 max-w-xl mx-auto mb-8">Реєструйся і отримуй бонуси за кожне замовлення</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href={route('register')} className="btn-primary bg-white text-blue-700 hover:bg-blue-50 text-base px-8">
                                    Створити аккаунт
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* футер */}
            <footer className="bg-gray-900 dark:bg-black text-gray-300 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
                                {app.name}
                            </div>
                            <p className="text-sm text-gray-400 max-w-xs">{app.description}</p>
                            <div className="flex gap-4 mt-5 text-3xl text-gray-400">
                                <i class="fa fa-brands fa-cc-visa"></i>
                                <i class="fa fa-brands fa-cc-mastercard"></i>
							    <i class="fa fa-brands fa-apple-pay"></i>
                                <i class="fa fa-brands fa-google-pay"></i>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-3">Сервіс</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href={route('services')} className="hover:text-blue-400 transition-colors">Наші послуги</Link></li>
                                <li><Link href={route('pricing')} className="hover:text-blue-400 transition-colors">Наші ціни</Link></li>
                                <li><Link href={route('order.create')} className="hover:text-blue-400 transition-colors">Створити замовлення</Link></li>
                                <li><Link href={route('track.order')} className="hover:text-blue-400 transition-colors">Відстежити</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-3">Компанія</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href={route('about')} className="hover:text-blue-400 transition-colors">Про компанію</Link></li>
                                <li><Link href={route('reviews')} className="hover:text-blue-400 transition-colors">Відгуки клієнтів</Link></li>
                                <li><Link href={route('blog')} className="hover:text-blue-400 transition-colors">Наш блог</Link></li>
                                <li><Link href={route('contact')} className="hover:text-blue-400 transition-colors">Контакти</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
                        <p>&copy; {new Date().getFullYear()} {app.name}</p>
                        <div className="flex items-center gap-4">
                            <Link href={route('track.order')} className="hover:text-gray-300">Відстежити замовлення</Link>
                        </div>
                    </div>
                </div>
            </footer>

            <FlashMessages />
        </div>
    );
}
