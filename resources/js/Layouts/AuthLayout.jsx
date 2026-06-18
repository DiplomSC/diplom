import { Link, usePage } from '@inertiajs/react';
import { useDarkMode } from '@/hooks/useDarkMode';
import FlashMessages from '@/Components/FlashMessages';
import { Wrench, Sun, Moon } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
    const { app } = usePage().props;
    const [dark, setDark] = useDarkMode();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4">
                <Link href={route('home')} className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 text-lg">
                    {app.logo ? (
                        <>
                            {app.logo_dark ? (
                                    <>
                                        <img src={app.logo} alt={app.name} className="h-10 w-auto dark:hidden" />
                                        <img src={app.logo_dark} alt={app.name} className="h-10 w-auto hidden dark:block" />
                                    </>
                                ) : (
                                    <img src={app.logo} alt={app.name} className="h-10 w-auto" />
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
                <button onClick={() => setDark(!dark)} className="btn-ghost p-2 rounded-xl">
                    {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-lg">
                    <div className="card p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-950 rounded-2xl mb-4">
                                <Wrench className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                            {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">{subtitle}</p>}
                        </div>
                        {children}
                    </div>
                </div>
            </div>

            <FlashMessages />
        </div>
    );
}
