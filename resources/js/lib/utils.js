export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '—';
    return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount);
}

export function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateTime(date) {
    if (!date) return '—';
    return new Date(date).toLocaleString('uk-UA', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export const ORDER_STATUS_COLORS = {
    new:           'badge-gray',
    accepted:      'badge-blue',
    diagnosing:    'badge-purple',
    waiting_parts: 'badge-yellow',
    in_repair:     'badge-orange',
    ready:         'badge-green',
    completed:     'badge-green',
    cancelled:     'badge-red',
    rejected:      'badge-red',
};

export const ORDER_STATUS_LABELS = {
    new:           'Нове',
    accepted:      'Прийняте',
    diagnosing:    'Діагностика',
    waiting_parts: 'Очікує деталі',
    in_repair:     'Ремонтується',
    ready:         'Готове',
    completed:     'Завершене',
    cancelled:     'Скасовано',
    rejected:      'Відхилено',
};

export const PRIORITY_COLORS = {
    low:    'badge-gray',
    normal: 'badge-blue',
    high:   'badge-yellow',
    urgent: 'badge-red',
};

export const PRIORITY_LABELS = {
    low:    'Низький',
    normal: 'Звичайний',
    high:   'Високий',
    urgent: 'Терміново',
};

export const USER_ROLES = {
    user:          'Клієнт',
    admin:         'Адмін',
    technician:    'Майстер',
};
