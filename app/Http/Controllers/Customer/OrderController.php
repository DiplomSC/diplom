<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = $request->user()
            ->orders()
            ->with(['deviceCategory', 'service'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Customer/Orders/Index', ['orders' => $orders]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_if($order->user_id !== $request->user()->id, 403);

        $order->load([
            'deviceCategory',
            'service',
            'images',
            'statusHistory' => fn($q) => $q->where('is_client_visible', true)->with('changedBy'),
            'clientComments.author',
            'orderParts.part',
            'technician',
            'review',
        ]);

        return Inertia::render('Customer/Orders/Show', ['order' => $order]);
    }

    public function submitReview(Request $request, Order $order): RedirectResponse
    {
        abort_if($order->user_id !== $request->user()->id, 403);

        if ($order->status !== 'completed') {
            return back()->with('error', 'Відгук можна залишити тільки до завершених замовлень.');
        }

        if ($order->review) {
            return back()->with('error', 'Ви вже залишили відгук до цього замовлення.');
        }

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body'   => ['required', 'string', 'min:10', 'max:1000'],
        ]);

        Review::create([
            'user_id'     => $request->user()->id,
            'order_id'    => $order->id,
            'author_name' => $request->user()->name,
            'rating'      => $data['rating'],
            'body'        => $data['body'],
            'is_approved' => false,
        ]);

        return back()->with('success', 'Дякуємо за відгук! Він буде опублікований після перевірки.');
    }
}
