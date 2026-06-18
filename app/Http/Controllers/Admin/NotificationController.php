<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationTemplate;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $templates = NotificationTemplate::orderBy('key')->get();

        return Inertia::render('Admin/Notifications/Index', [
            'templates'           => $templates,
            'recentNotifications' => [],
        ]);
    }

    public function update(Request $request, NotificationTemplate $notificationTemplate): RedirectResponse
    {
        $data = $request->validate([
            'subject'          => ['nullable', 'string'],
            'email_body'       => ['nullable', 'string'],
            'telegram_body'    => ['nullable', 'string'],
            'email_enabled'    => ['boolean'],
            'telegram_enabled' => ['boolean'],
            'is_active'        => ['boolean'],
        ]);

        $notificationTemplate->update($data);
        return back()->with('success', 'Шаблон оновлено.');
    }

    public function broadcast(Request $request, NotificationService $notificationService): RedirectResponse
    {
        $data = $request->validate([
            'subject'  => ['nullable', 'string'],
            'message'  => ['required', 'string'],
            'channel'  => ['required', 'in:email,telegram'],
            'audience' => ['required', 'in:all,gold,silver'],
        ]);

        $users = User::role('user')
            ->when($data['audience'] !== 'all', function ($q) use ($data) {
                $q->whereHas('loyaltyLevel', fn($lq) => $lq->where('name', ucfirst($data['audience'])));
            })
            ->get();

        foreach ($users as $user) {
            $notificationService->sendRaw($user, $data['channel'], $data['subject'] ?? 'ServiceCenter', $data['message']);
        }

        return back()->with('success', "Broadcast sent to {$users->count()} users.");
    }
}
