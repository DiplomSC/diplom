import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, maxWidth = 'md', overlayClose = 1 }) {
    useEffect(() => {
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!open) return null;

    const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl' };
    const onOverlayClick = parseInt(overlayClose) == 1 ? onClose : null;

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto' }}
            onClick={onOverlayClick}
        >
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <div style={{ display: 'flex', minHeight: '100%', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div
                    className={`relative w-full ${widths[maxWidth]} bg-white dark:bg-gray-800 rounded-2xl shadow-2xl`}
                    style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 rounded-t-2xl bg-white dark:bg-gray-800"
                        style={{ flexShrink: 0 }}>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{title}</h3>
                        <button onClick={onClose} className="btn-ghost btn-sm p-1.5">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-6" style={{ overflowY: 'auto' }}>{children}</div>
                </div>
            </div>
        </div>
    );
}
