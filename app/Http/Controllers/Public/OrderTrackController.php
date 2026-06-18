<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\DeviceCategory;
use App\Models\Order;
use App\Models\Service;
use App\Services\AIService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly AIService $aiService,
    ) {}

    public function trackForm(): Response
    {
        return Inertia::render('Public/TrackOrder');
    }

    public function createForm(): Response
    {
        $categories = DeviceCategory::where('is_active', true)->orderBy('sort_order')->get();
        $services   = Service::where('is_active', true)->with('category')->get();

        return Inertia::render('Public/CreateOrder', [
            'categories' => $categories,
            'services'   => $services,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'customer_name'      => ['required', 'string', 'max:255'],
            'customer_phone'     => ['required', 'string', 'max:20'],
            'customer_email'     => ['nullable', 'email'],
            'device_category_id' => ['required', 'exists:device_categories,id'],
            'service_id'         => ['nullable', 'exists:services,id'],
            'device_brand'       => ['nullable', 'string', 'max:100'],
            'device_model'       => ['nullable', 'string', 'max:100'],
            'issue_description'  => ['required', 'string', 'min:10'],
            'images'             => ['nullable', 'array', 'max:5'],
            'images.*'           => ['image', 'max:5120'],
            'promo_code'         => ['nullable', 'string'],
            'bonus_used'         => ['nullable', 'integer', 'min:0'],
        ]);

        $user = auth()->user();

        // ШІ-діагностика
        $imageUrls = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $img) {
                $path = $img->store('orders/' . date('Y/m'), 'public');
                $imageUrls[] = Storage::disk('public')->url($path);
                $data['image_paths'][] = $path;
            }
        }

        $category = DeviceCategory::find($data['device_category_id']);
        $aiResult = $this->aiService->diagnose(
            $category?->name ?? '',
            trim(($data['device_brand'] ?? '') . ' ' . ($data['device_model'] ?? '')),
            $data['issue_description'],
            $imageUrls,
        );

        $data['ai_diagnosis'] = $aiResult['diagnosis'] . "\n\nПриблизна вартість: " . $aiResult['estimated_cost'];

        $order = $this->orderService->createOrder($data, $user);

        // зберігаємо зображення
        foreach ($data['image_paths'] ?? [] as $path) {
            $order->images()->create(['path' => $path, 'disk' => 'public']);
        }

        $message = "Замовлення №{$order->number} успішно створене! ";
        $message .= $user ? 'Ви можете відстежувати його прогрес у своєму кабінеті.' : "Відстежуйте своє замовлення за номером: {$order->number}";

        if ($user) {
            return redirect()->route('customer.orders.show', $order->id)->with('success', $message);
        } 

        return redirect()->route('track.order', [
            'order' => $order->number,
            'phone' => $order->customer_phone,
        ])->with('success', $message);
    }

    public function aiDiagnose(Request $request): JsonResponse
    {
        $data = $request->validate([
            'device_type'  => ['required', 'string'],
            'device_model' => ['nullable', 'string'],
            'description'  => ['required', 'string', 'min:10'],
        ]);

        $result = $this->aiService->diagnose(
            $data['device_type'],
            $data['device_model'] ?? '',
            $data['description'],
        );

        return response()->json($result);
    }

    public function track(Request $request): Response|RedirectResponse
    {
        $data = $request->validate([
            'number' => ['required', 'string'],
            'phone'  => ['required', 'string'],
        ]);

        $inputPhone = preg_replace('/\D/', '', $data['phone']);

        $order = Order::where('number', strtoupper($data['number']))
            ->with(['statusHistory' => fn($q) => $q->where('is_client_visible', true), 'deviceCategory', 'service', 'user'])
            ->first();

        if ($order) {
            $storedPhone = preg_replace('/\D/', '', $order->customer_phone ?? '');
            $phoneMatch  = str_ends_with($storedPhone, $inputPhone) || str_ends_with($inputPhone, $storedPhone);

            if (! $phoneMatch) {
                // перевірити телефон з профіля юзера (на випадок зміни телефону після створення замовлення)
                $userPhone  = preg_replace('/\D/', '', $order->user?->phone ?? '');
                $phoneMatch = $userPhone !== '' && (str_ends_with($userPhone, $inputPhone) || str_ends_with($inputPhone, $userPhone));
            }

            if (! $phoneMatch) {
                $order = null;
            }
        }

        if (! $order) {
            return back()->withErrors(['number' => 'Замовлення не знайдено. Перевірте номер замовлення та номер телефону.']);
        }

        return Inertia::render('Public/TrackOrder', [
            'order'  => $order,
            'found'  => true,
        ]);
    }
}
