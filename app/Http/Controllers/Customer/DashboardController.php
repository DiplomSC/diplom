<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user()->load(['loyaltyLevel', 'bonusTransactions' => fn($q) => $q->latest()->take(5)]);

        $activeOrders = $user->orders()
            ->with(['deviceCategory', 'service'])
            ->whereNotIn('status', ['completed', 'cancelled', 'rejected'])
            ->latest()
            ->take(5)
            ->get();

        $totalOrders    = $user->orders()->count();
        $completedCount = $user->orders()->where('status', 'completed')->count();

        $nextLevel = LoyaltyLevel::where('min_points', '>', $user->bonus_balance)
            ->orderBy('min_points')
            ->first();

        return Inertia::render('Customer/Dashboard', [
            'activeOrders'   => $activeOrders,
            'stats'          => [
                'totalOrders'    => $totalOrders,
                'completedOrders' => $completedCount,
                'bonusBalance'   => $user->bonus_balance,
                'loyaltyLevel'   => $user->loyaltyLevel?->name ?? 'Bronze',
                'loyaltyColor'   => $user->loyaltyLevel?->color ?? '#CD7F32',
            ],
            'recentBonuses'  => $user->bonusTransactions,
            'nextLevel'      => $nextLevel,
        ]);
    }
}
