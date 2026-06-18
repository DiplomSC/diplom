<?php

namespace App\Http\Controllers\Technician;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $techId = $request->user()->id;

        $activeOrders = Order::forTechnician($techId)
            ->whereNotIn('status', ['completed', 'cancelled', 'rejected'])
            ->with(['deviceCategory', 'service', 'user'])
            ->latest()
            ->get();

        $newOrders = Order::where('status', 'new')
            ->whereNull('technician_id')
            ->with(['deviceCategory', 'service'])
            ->latest()
            ->take(10)
            ->get();

        $priorityOrders = Order::forTechnician($techId)
            ->whereIn('priority', ['high', 'urgent'])
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->with(['deviceCategory', 'service'])
            ->get();

        $stats = [
            'active'    => $activeOrders->count(),
            'today'     => Order::forTechnician($techId)->whereDate('created_at', today())->count(),
            'completed' => Order::forTechnician($techId)->where('status', 'completed')->count(),
            'total'     => Order::forTechnician($techId)->count(),
        ];

        return Inertia::render('Technician/Dashboard', [
            'activeOrders'   => $activeOrders,
            'newOrders'      => $newOrders,
            'priorityOrders' => $priorityOrders,
            'stats'          => $stats,
        ]);
    }
}
