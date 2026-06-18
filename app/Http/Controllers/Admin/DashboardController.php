<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Part;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $recentOrders = Order::with(['user', 'technician', 'deviceCategory'])
            ->latest()
            ->take(5)
            ->get();

        $totalRevenue    = Order::where('status', 'completed')->sum('final_cost');
        $totalOrders     = Order::count();
        $activeOrders    = Order::active()->count();
        $avgCheck        = Order::where('status', 'completed')->whereNotNull('final_cost')->avg('final_cost') ?? 0;

        $totalUsers     = User::role('user')->count();
        $returningUsers = User::role('user')->has('orders', '>=', 2)->count();
        $returningPct   = $totalUsers > 0 ? round($returningUsers / $totalUsers * 100, 1) : 0;

        // виручка (за останні 6 міс.)
        $revenueChart = Order::where('status', 'completed')
            ->where('completed_at', '>=', now()->subMonths(6))
            ->select(
                DB::raw('MONTH(completed_at) as month'),
                DB::raw('YEAR(completed_at) as year'),
                DB::raw('SUM(final_cost) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        // замовлення за статусами
        $statusChart = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        // закінчуються на складі (запчастини)
        $lowStockParts = Part::where('is_active', true)
            ->whereColumn('stock_quantity', '<=', 'min_stock_alert')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalRevenue'    => round($totalRevenue, 2),
                'totalOrders'     => $totalOrders,
                'activeOrders'    => $activeOrders,
                'avgCheck'        => round($avgCheck, 2),
                'totalUsers'      => $totalUsers,
                'returningPct'    => $returningPct,
            ],
            'recentOrders'  => $recentOrders,
            'revenueChart'  => $revenueChart,
            'statusChart'   => $statusChart,
            'lowStockParts' => $lowStockParts,
        ]);
    }
}
