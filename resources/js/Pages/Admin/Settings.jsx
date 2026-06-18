import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Save, Eye, EyeOff, Upload } from 'lucide-react';
import { useState, useRef } from 'react';

const groupLabels = {
    general: 'Загальні налаштування',
    oauth: 'OAuth провайдери',
    integrations: 'Інтеграції',
    loyalty: 'Програма лояльності',
    notifications: 'Повідомлення',
};

function LogoField({ value, name }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(value ?? null);

    const handleFile = (file) => {
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setUploading(true);
        router.post(route('admin.settings.logo'), { logo: file, key: name }, {
            forceFormData: true,
            onFinish: () => setUploading(false),
        });
    };

    const removeLogo = () => {
        if (!confirm('Видалити лого?')) return;
        setPreview(null);
        router.post(route('admin.settings.update'), {
            settings: [{ key: name, value: null }],
        });
    };

    return (
        <div className="flex items-center gap-3">
            {preview ? (
                <img src={preview} alt="Logo" className="h-12 w-auto rounded-lg border border-gray-200 dark:border-gray-700 object-contain bg-white p-1" />
            ) : (
                <div className="h-12 w-24 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 text-xs">Немає лого</div>
            )}
            <input ref={inputRef} type="file" accept="image/*,image/svg+xml" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            <button type="button" onClick={() => inputRef.current.click()} className="btn-secondary btn-sm" disabled={uploading}>
                <Upload className="w-4 h-4" /> {uploading ? 'Завантаження...' : 'Обрати зображення'}
            </button>
            {preview && (
                <button type="button" onClick={removeLogo} className="btn-ghost btn-sm text-red-500 hover:text-red-600">
                    Видалити
                </button>
            )}
        </div>
    );
}

function SettingField({ setting, value, onChange }) {
    const [show, setShow] = useState(false);
    const isSecret = ['api_key', 'secret', 'token', 'password'].some(k => setting.key.toLowerCase().includes(k));

    if (setting.type === 'file') {
        return <LogoField value={value} name={setting.key} />;
    }

    if (setting.type === 'boolean') {
        return (
            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={value === 'true' || value === true}
                    onChange={e => onChange(e.target.checked ? 'true' : 'false')}
                    className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{setting.label ?? setting.key}</span>
            </label>
        );
    }

    if (setting.type === 'textarea') {
        return <textarea className="input h-24 resize-none text-sm font-mono" value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    }

    return (
        <div className="relative">
            <input
                className="input pr-10 text-sm"
                type={isSecret && !show ? 'password' : 'text'}
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
            />
            {isSecret && (
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            )}
        </div>
    );
}

export default function AdminSettings({ settings }) {
    const allSettings = Object.values(settings).flat();
    const [values, setValues] = useState(
        Object.fromEntries(allSettings.map(s => [s.key, s.value]))
    );

    const [processing, setProcessing] = useState(false);

    const saveAll = (e) => {
        e.preventDefault();
        setProcessing(true);
        const fileKeys = new Set(allSettings.filter(s => s.type === 'file').map(s => s.key));
        router.post(route('admin.settings.update'), {
            settings: Object.entries(values)
                .filter(([key]) => !fileKeys.has(key))
                .map(([key, value]) => ({ key, value })),
        }, { onFinish: () => setProcessing(false) });
    };

    const groups = Object.entries(settings);

    return (
        <AdminLayout title="Налаштування">
            <Head title="Налаштування" />

            <form onSubmit={saveAll} className="space-y-6 max-w-3xl">
                {groups.map(([group, groupSettings]) => (
                    <div key={group} className="card p-6">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-5">
                            {groupLabels[group] ?? group.charAt(0).toUpperCase() + group.slice(1)}
                        </h2>
                        <div className="space-y-4">
                            {groupSettings.map(setting => (
                                <div key={setting.key} className="form-group">
                                    <label className="label">{setting.label ?? setting.key}</label>
                                    {setting.description && (
                                        <p className="text-xs text-gray-400 mb-1">{setting.description}</p>
                                    )}
                                    <SettingField
                                        setting={setting}
                                        value={values[setting.key]}
                                        onChange={(v) => setValues(prev => ({ ...prev, [setting.key]: v }))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>
                        <Save className="w-4 h-4" />
                        {processing ? 'Збереження...' : 'Зберегти налаштування'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
