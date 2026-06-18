<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\BonusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function __construct(private readonly BonusService $bonusService) {}

    public function show(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'email', 'unique:users,email'],
            'phone'                 => ['required', 'string', 'max:20'],
            'password'              => ['required', 'min:8', 'confirmed'],
            'referral_code'         => ['nullable', 'string', 'exists:users,referral_code'],
        ]);

        $referrer = null;
        if (! empty($data['referral_code'])) {
            $referrer = User::where('referral_code', $data['referral_code'])->first();
        }

        $user = User::create([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'phone'         => $data['phone'] ?? null,
            'password'      => $data['password'],
            'referral_code' => strtoupper(Str::random(8)),
            'referred_by'   => $referrer?->id,
        ]);

        $user->assignRole('user');

        // бонус за реєстрацію
        $this->bonusService->earn($user, 100, null, 'Вам нараховані бонусні бали за реєстрацію!', 'manual');

        // реферальні бонуси
        if ($referrer) {
            $this->bonusService->earn($referrer, 200, null, "Реферальний бонус +200 балів: {$user->name} приєднався!", 'referral');
            $this->bonusService->earn($user, 50, null, 'Бонус +50 балів за реєстрацію по запрошенню!', 'referral');
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('customer.dashboard')->with('success', 'Вітаємо! Ви отримали 100 бонусних балів.');
    }
}
