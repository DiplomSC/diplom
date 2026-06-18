<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Customer/Profile', [
            'user' => $request->user()->load('loyaltyLevel'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
        ]);

        $user->update($data);

        return back()->with('success', 'Профіль оновлено.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'min:8', 'confirmed'],
        ]);

        $user->update(['password' => $request->password]);

        return back()->with('success', 'Пароль змінено.');
    }

    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate(['avatar' => ['required', 'image', 'max:2048']]);

        $path = $request->file('avatar')->store('avatars', 'public');
        $request->user()->update(['avatar' => '/storage/' . $path]);

        return back()->with('success', 'Аватар оновлено.');
    }

    public function connectTelegram(Request $request): Response
    {
        $botUsername = config('services.telegram.bot_username');
        $user = $request->user();

        return Inertia::render('Customer/ConnectTelegram', [
            'botUsername' => $botUsername,
            'userId'      => $user->id,
        ]);
    }
}
