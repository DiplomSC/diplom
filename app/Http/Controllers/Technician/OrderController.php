<?php

namespace App\Http\Controllers\Technician;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Part;
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
        $techId = $request->user()->id;
        $status = $request->input('status', 'all');

        $query = Order::forTechnician($techId)->with(['deviceCategory', 'service', 'user'])->withCount('comments');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $orders = $query->latest()->paginate(15);

        return Inertia::render('Technician/Orders/Index', [
            'orders'   => $orders,
            'status'   => $status,
            'statuses' => Order::$statuses,
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        // майстрер може бачити свої замовлення і замовлення які ще нікому не призначені
        if ($order->technician_id && $order->technician_id !== $request->user()->id) {
            abort(403);
        }

        $order->load([
            'deviceCategory', 'service', 'user',
            'images',
            'statusHistory.changedBy',
            'comments.author',
            'orderParts.part',
        ]);

        $parts = Part::where('is_active', true)->where('stock_quantity', '>', 0)->get();

        return Inertia::render('Technician/Orders/Show', [
            'order'    => $order,
            'parts'    => $parts,
            'statuses' => Order::$statuses,
        ]);
    }

    public function accept(Request $request, Order $order): RedirectResponse
    {
        if ($order->status !== 'new') {
            return back()->with('error', 'Це замовлення не може бути прийняте.');
        }

        $this->orderService->assignTechnician($order, $request->user()->id);
        $this->orderService->updateStatus($order, 'accepted', $request->user(), 'Замовлення прийняте майстром');

        return back()->with('success', 'Замовленя прийнято!');
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        // майстер може змінювати тільки свої замовлення
        if ($order->technician_id !== $request->user()->id) abort(403);

        $data = $request->validate([
            'status'        => ['required', 'in:' . implode(',', array_keys(Order::$statuses))],
            'comment'       => ['nullable', 'string', 'max:2000'],
            'is_internal'   => ['nullable', 'boolean'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'final_cost'    => ['nullable', 'numeric', 'min:0'],
        ]);

        if (isset($data['estimated_cost'])) {
            $order->update(['estimated_cost' => $data['estimated_cost']]);
        }

        if (isset($data['final_cost'])) {
            $this->orderService->setFinalCost($order, (float) $data['final_cost']);
        }

        $this->orderService->updateStatus(
            $order,
            $data['status'],
            $request->user(),
            $data['comment'] ?? null,
            ! ($data['is_internal'] ?? false),
        );

        return back()->with('success', 'Статус змінено.');
    }

    public function addComment(Request $request, Order $order): RedirectResponse
    {
        // майстер може змінювати тільки свої замовлення
        if ($order->technician_id !== $request->user()->id) abort(403);

        $data = $request->validate([
            'body'        => ['required', 'string', 'max:2000'],
            'is_internal' => ['boolean'],
        ]);

        $order->comments()->create([
            'user_id'          => $request->user()->id,
            'body'             => $data['body'],
            'is_internal'      => $data['is_internal'] ?? false,
            'is_client_visible' => ! ($data['is_internal'] ?? false),
        ]);

        return back()->with('success', 'Коментар додано.');
    }

    public function addPart(Request $request, Order $order): RedirectResponse
    {
        // майстер може змінювати тільки свої замовлення
        if ($order->technician_id !== $request->user()->id) abort(403);

        $data = $request->validate([
            'part_id'  => ['required', 'exists:parts,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        try {
            $this->orderService->addPart($order, $data['part_id'], $data['quantity']);
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Запчастина додана до замовлення.');
    }

    public function removePart(Request $request, Order $order, int $partId): RedirectResponse
    {
        // майстер може змінювати тільки свої замовлення
        if ($order->technician_id !== $request->user()->id) abort(403);

        $this->orderService->removePart($order, $partId);
        return back()->with('success', 'Запчастина видалена.');
    }
}
