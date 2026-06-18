<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\BonusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private readonly BonusService $bonusService) {}

    public function index(Request $request): Response
    {
        $query = User::with('roles', 'loyaltyLevel');

        if ($role = $request->get('role')) {
            $query->role($role);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users'   => $users,
            'filters' => $request->only(['role', 'search']),
            'roles'   => ['user', 'technician', 'admin'],
        ]);
    }

    public function show(User $user): Response
    {
        $user->load(['roles', 'loyaltyLevel', 'technicianProfile']);

        $orders = $user->orders()->with('deviceCategory')->latest()->take(10)->get();
        $bonusTx = $user->bonusTransactions()->latest()->take(20)->get();

        return Inertia::render('Admin/Users/Show', [
            'user'             => $user,
            'orders'           => $orders,
            'bonusTransactions' => $bonusTx,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone'          => ['nullable', 'string', 'max:20'],
            'role'           => ['required', 'in:user,technician,admin'],
            'is_blocked'     => ['boolean'],
            'blocked_reason' => ['nullable', 'string'],
        ]);

        // заборона блокування/видалення аккаунта адміна
        if ($user->hasRole('admin') && ($data['is_blocked'] ?? false)) {
            return back()->with('error', 'Admin не може бути заблокованим.');
        }

        $user->update(array_intersect_key($data, array_flip(['name', 'email', 'phone', 'is_blocked', 'blocked_reason'])));

        // оновити роль
        $user->syncRoles([$data['role']]);

        return back()->with('success', 'Користувач оновлений.');
    }

    public function addBonus(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'amount'      => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
        ]);

        $this->bonusService->addManual($user, $data['amount'], $data['description'] ?? 'Нарахування бонусів адміністрацією СЦ');

        return back()->with('success', "Додано {$data['amount']} бонусних балів.");
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->hasRole('admin')) {
            return back()->with('error', 'Admin не може бути видалений.');
        }

        if ($request->user()->id === $user->id) {
            return back()->with('error', 'Ви не можете видалити власний аккаунт.');
        }

        $user->delete();
        return redirect()->route('admin.users.index')->with('success', 'Користувач видалений.');
    }
}
