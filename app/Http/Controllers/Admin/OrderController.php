<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeviceCategory;
use App\Models\Order;
use App\Models\User;
use App\Models\Service;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService) {}

    public function index(Request $request): Response
    {
        $query = Order::with(['user', 'technician', 'deviceCategory', 'service'])->withCount('comments');

        if ($s = $request->get('status')) $query->where('status', $s);
        if ($t = $request->get('technician_id')) $query->where('technician_id', $t);
        if ($cat = $request->get('category_id')) $query->where('device_category_id', $cat);
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $orders = $query->latest()->paginate(20)->withQueryString();

        $technicians = User::role('technician')->get(['id', 'name']);
        $categories  = DeviceCategory::all(['id', 'name']);

        return Inertia::render('Admin/Orders/Index', [
            'orders'      => $orders,
            'filters'     => $request->only(['status', 'technician_id', 'category_id', 'search']),
            'statuses'    => Order::$statuses,
            'technicians' => $technicians,
            'categories'  => $categories,
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'user', 'technician', 'deviceCategory', 'service',
            'images', 'statusHistory.changedBy', 'comments.author',
            'orderParts.part',
        ]);

        $technicians = User::role('technician')->get(['id', 'name']);

        return Inertia::render('Admin/Orders/Show', [
            'order'       => $order,
            'technicians' => $technicians,
            'statuses'    => Order::$statuses,
        ]);
    }

    public function createOrder(Request $request): Response
    {   
        $customers = User::role('user')->where('is_blocked', 0)->get(['id', 'name', 'email', 'phone', 'bonus_balance']);
        $categories = DeviceCategory::where('is_active', true)->orderBy('sort_order')->get();
        $services  = Service::where('is_active', true)->with('category')->get();

        return Inertia::render('Admin/Orders/New', [
            'categories'  => $categories,
            'services'    => $services,
            'customers'   => $customers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'customer_id'        => ['nullable', 'integer'],
            'customer_name'      => ['required', 'string', 'max:255'],
            'customer_phone'     => ['required', 'string', 'max:20'],
            'customer_email'     => ['nullable', 'email'],
            'device_category_id' => ['required', 'exists:device_categories,id'],
            'service_id'         => ['nullable', 'exists:services,id'],
            'device_brand'       => ['nullable', 'string', 'max:100'],
            'device_model'       => ['nullable', 'string', 'max:100'],
            'issue_description'  => ['required', 'string', 'min:10'],
            'promo_code'         => ['nullable', 'string'],
            'bonus_used'         => ['nullable', 'integer', 'min:0'],
        ]);

        $user = null;
        if($data['customer_id'] != ''){
            $user = User::find($data['customer_id']);
        }

        $order = $this->orderService->createOrder($data, $user);
        $message = "Замовлення №{$order->number} успішно створене!";

        return redirect()->route('admin.orders.index')->with('success', $message);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'status'         => ['nullable', 'in:' . implode(',', array_keys(Order::$statuses))],
            'technician_id'  => ['nullable', 'exists:users,id'],
            'priority'       => ['nullable', 'in:low,normal,high,urgent'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'final_cost'     => ['nullable', 'numeric', 'min:0'],
            'admin_notes'    => ['nullable', 'string'],
            'deadline_at'    => ['nullable', 'date'],
            'comment'        => ['nullable', 'string'],
        ]);

        if (isset($data['status']) && $data['status'] !== $order->status) {
            $this->orderService->updateStatus($order, $data['status'], $request->user(), $data['comment'] ?? null);
        }

        if (isset($data['technician_id'])) {
            $this->orderService->assignTechnician($order, $data['technician_id']);
        }

        if (isset($data['final_cost'])) {
            $this->orderService->setFinalCost($order, (float) $data['final_cost']);
        }

        $order->update(array_filter(array_intersect_key($data, array_flip([
            'priority', 'estimated_cost', 'admin_notes', 'deadline_at',
        ])), fn($v) => $v !== null));

        return back()->with('success', 'Замовлення оновлено.');
    }

    public function destroy(Order $order): RedirectResponse
    {
        $order->delete();
        return redirect()->route('admin.orders.index')->with('success', 'Замовлення видалено.');
    }
}
