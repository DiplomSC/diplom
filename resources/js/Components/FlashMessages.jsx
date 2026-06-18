import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error:   <XCircle className="w-5 h-5 text-red-500" />,
    info:    <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
};

const styles = {
    success: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    error:   'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    info:    'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    warning: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
};

function Toast({ type, message, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 5000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-sm animate-in fade-in slide-in-from-top-2 ${styles[type]}`}>
            {icons[type]}
            <span className="text-sm font-medium flex-1">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function FlashMessages() {
    const { flash } = usePage().props;
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const newToasts = [];
        for (const [type, message] of Object.entries(flash)) {
            if (message) newToasts.push({ id: Date.now() + Math.random(), type, message });
        }
        if (newToasts.length) setToasts(prev => [...prev, ...newToasts]);
    }, [flash]);

    const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    if (!toasts.length) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
            {toasts.map(t => (
                <Toast key={t.id} type={t.type} message={t.message} onClose={() => remove(t.id)} />
            ))}
        </div>
    );
}
