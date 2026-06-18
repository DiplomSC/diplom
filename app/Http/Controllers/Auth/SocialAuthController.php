<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\BonusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function __construct(private readonly BonusService $bonusService) {}

    public function redirect(string $provider): RedirectResponse
    {
        $this->validateProvider($provider);
        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        $this->validateProvider($provider);

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Невдала авторизація. Спробуйте ще раз.');
        }

        $field = "{$provider}_id";
        $user  = User::where($field, $socialUser->getId())->first()
                ?? User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            // прів'язка social ID до  існуючого аккаунту, якщо реєстрація через OAuth 
            // і вказаний вже зареєстрований email
            if (! $user->$field) {
                $user->update([
                    $field     => $socialUser->getId(),
                    'provider' => $provider,
                    'avatar'   => $user->avatar ?: $socialUser->getAvatar(),
                ]);
            }
        } else {
            // створюємо нового юзера
            $user = User::create([
                'name'           => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                'email'          => $socialUser->getEmail(),
                'avatar'         => $socialUser->getAvatar(),
                $field           => $socialUser->getId(),
                'provider'       => $provider,
                'referral_code'  => strtoupper(Str::random(8)),
                'email_verified_at' => now(),
            ]);

            $user->assignRole('user');
            $this->bonusService->earn($user, 100, null, 'Бонус +100 балів за реєстрацію!', 'manual');
        }

        if ($user->is_blocked) {
            return redirect()->route('login')->with('error', 'Ваш аккаунт заблокований.');
        }

        Auth::login($user, true);

        return $this->redirectByRole($user);
    }

    private function validateProvider(string $provider): void
    {
        if (! in_array($provider, ['google', 'facebook'])) {
            abort(404);
        }
    }

    private function redirectByRole(User $user): RedirectResponse
    {
        if ($user->hasRole('admin'))      return redirect()->route('admin.dashboard');
        if ($user->hasRole('technician')) return redirect()->route('tech.dashboard');
        return redirect()->route('customer.dashboard');
    }
}
