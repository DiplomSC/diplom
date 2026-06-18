<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Email або пароль не вірний.',
            ]);
        }

        $user = Auth::user();

        if ($user->is_blocked) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => 'Ваш аккаунт заблокований. Будь ласка, зверніться в підтримку, якщо у вас є питання.',
            ]);
        }

        $request->session()->regenerate();

        return $this->redirectByRole($user);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }

    private function redirectByRole($user): RedirectResponse
    {
        if ($user->hasRole('admin')) return redirect()->route('admin.dashboard');
        if ($user->hasRole('technician')) return redirect()->route('tech.dashboard');
        return redirect()->route('customer.dashboard');
    }
}
