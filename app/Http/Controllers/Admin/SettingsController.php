<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $settings = Setting::orderBy('group')->orderBy('key')->get()->groupBy('group');

        return Inertia::render('Admin/Settings', ['settings' => $settings]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'settings'         => ['required', 'array'],
            'settings.*.key'   => ['required', 'string'],
            'settings.*.value' => ['nullable'],
        ]);

        foreach ($data['settings'] as $item) {
            Setting::set($item['key'], $item['value']);
        }

        cache()->forget('app_settings');

        return back()->with('success', 'Налаштування збережені.');
    }
    
    // збереження/зміна логотипа (light & dark)
    public function updateLogo(Request $request): RedirectResponse
    {
        $request->validate(['logo' => ['required', 'file', 'mimes:jpg,jpeg,png,gif,webp,svg', 'max:2048']]);

        $field_key = $request->get('key');

        $path = $request->file('logo')->store('branding', 'public');
        Setting::set($field_key, '/storage/' . $path);

        cache()->forget('app_settings');

        return back()->with('success', 'Лого завантажено.');
    }
}
