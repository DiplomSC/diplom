<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        $settings = cache()->remember('app_settings', 3600, function () {
            try {
                return Setting::pluck('value', 'key')->toArray();
            } catch (\Exception $e) {
                return [];
            }
        });

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id'            => $user->id,
                    'name'          => $user->name,
                    'email'         => $user->email,
                    'avatar'        => $user->avatar,
                    'role'          => $user->roles->first()?->name ?? 'user',
                    'bonus_balance' => $user->bonus_balance ?? 0,
                    'loyalty_level' => $user->loyaltyLevel?->name ?? 'Bronze',
                ] : null,
            ],
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
                'info'    => session('info'),
                'warning' => session('warning'),
            ],
            'app' => [
                'name'        => $settings['app_name'] ?? config('app.name'),
                'logo'        => $settings['app_logo'] ?? null,
                'logo_dark'   => $settings['app_logo_dark'] ?? null,
                'description' => $settings['app_description'] ?? '',
            ],
            'loyalty' => [
                'points_per_10uah'      => $settings['bonus_points_per_10uah'] ?? 1,
                'max_bonus_spend_pct'   => $settings['max_bonus_spend_pct'] ?? 20,
                'welcome_bonus'         => $settings['welcome_bonus'] ?? 100,
                'bonus_expiry_months'   => $settings['bonus_expiry_months'] ?? 6,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
