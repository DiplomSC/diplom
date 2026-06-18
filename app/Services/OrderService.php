<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Part;
use App\Models\OrderPart;
use App\Models\PromoCode;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        private readonly BonusService $bonusService,
        private readonly NotificationService $notificationService,
    ) {}

    public function createOrder(array $data, ?User $user = null): Order
    {
        return DB::transaction(function () use ($data, $user) {
            $number = $this->generateOrderNumber();

            $bonusUsed = 0;
            $discount  = 0;
            $promoCode = null;

            // обробка промокоду
            if (! empty($data['promo_code'])) {
                $promo = PromoCode::where('code', strtoupper($data['promo_code']))->first();
                if ($promo && $promo->isValid()) {
                    $promoCode = $promo->code;

                    if ($promo->type === 'percent') {
                        $discount = ($data['estimated_cost'] ?? 0) * ($promo->value / 100);
                    } elseif ($promo->type === 'fixed') {
                        $discount = min($promo->value, $data['estimated_cost'] ?? 0);
                    }
                    
                    $promo->increment('used_count');
                }
            }

            // обробка використання бонусів
            if (! empty($data['bonus_used']) && $user) {
                $bonusUsed = min((int) $data['bonus_used'], $user->bonus_balance);
                $maxSpend  = ($data['estimated_cost'] ?? 0) * 0.30;
                $bonusUsed = min($bonusUsed, (int) $maxSpend);
            }

            $order = Order::create([
                'number'              => $number,
                'user_id'             => $user?->id,
                'device_category_id'  => $data['device_category_id'],
                'service_id'          => $data['service_id'] ?? null,
                'customer_name'       => $data['customer_name'],
                'customer_phone'      => $data['customer_phone'],
                'customer_email'      => $data['customer_email'] ?? $user?->email,
                'device_brand'        => $data['device_brand'] ?? null,
                'device_model'        => $data['device_model'] ?? null,
                'device_serial'       => $data['device_serial'] ?? null,
                'issue_description'   => $data['issue_description'],
                'ai_diagnosis'        => $data['ai_diagnosis'] ?? null,
                'status'              => 'new',
                'priority'            => $data['priority'] ?? 'normal',
                'estimated_cost'      => $data['estimated_cost'] ?? null,
                'discount'            => $discount,
                'bonus_used'          => $bonusUsed,
                'promo_code'          => $promoCode,
            ]);

            // списання бонусів
            if ($bonusUsed > 0 && $user) {
                $this->bonusService->spend($user, $bonusUsed, $order, 'Бонуси використані в замовленні ' . $number);
            }

            // статус замовлення
            OrderStatusHistory::create([
                'order_id'         => $order->id,
                'changed_by'       => $user?->id,
                'status_from'      => null,
                'status_to'        => 'new',
                'comment'          => 'Замовлення створене',
                'is_client_visible' => true,
                'created_at'       => now(),
            ]);

            // відправка нотифікації про нове замовлення
            $this->notificationService->orderCreated($order);

            return $order;
        });
    }

    public function updateStatus(Order $order, string $newStatus, ?User $changedBy = null, ?string $comment = null, bool $clientVisible = true): Order
    {
        $oldStatus = $order->status;

        if ($oldStatus === $newStatus) return $order;

        return DB::transaction(function () use ($order, $newStatus, $oldStatus, $changedBy, $comment, $clientVisible) {
            $order->update([
                'status'       => $newStatus,
                'accepted_at'  => $newStatus === 'accepted' ? now() : $order->accepted_at,
                'completed_at' => in_array($newStatus, ['completed']) ? now() : $order->completed_at,
            ]);

            OrderStatusHistory::create([
                'order_id'          => $order->id,
                'changed_by'        => $changedBy?->id,
                'status_from'       => $oldStatus,
                'status_to'         => $newStatus,
                'comment'           => $comment,
                'is_client_visible' => $clientVisible,
                'created_at'        => now(),
            ]);

            // проінформувати клієнта про зміну статусу замовлення
            $this->notificationService->statusChanged($order, $oldStatus, $newStatus);

            // нарахування бонусних балів після завершення замовлення
            if ($newStatus === 'completed' && $order->user_id && $order->final_cost) {
                $this->bonusService->awardForOrder($order);
            }

            return $order->fresh();
        });
    }

    public function assignTechnician(Order $order, int $technicianId): Order
    {
        $order->update(['technician_id' => $technicianId]);
        return $order;
    }

    public function setFinalCost(Order $order, float $cost): Order
    {
        $total = max(0, $cost - $order->discount - $order->bonus_used);
        $order->update([
            'final_cost' => $cost,
            'total_paid' => $total,
        ]);
        return $order;
    }

    public function addPart(Order $order, int $partId, int $qty): OrderPart
    {
        $part = Part::findOrFail($partId);

        if ($part->stock_quantity < $qty) {
            throw new \RuntimeException("Low stock for part: {$part->name}");
        }

        $total = $part->sell_price * $qty;

        $pivot = OrderPart::updateOrCreate(
            ['order_id' => $order->id, 'part_id' => $partId],
            ['quantity' => $qty, 'unit_price' => $part->sell_price, 'total_price' => $total]
        );

        // списати зі скалду
        $part->decrement('stock_quantity', $qty);

        return $pivot;
    }

    public function removePart(Order $order, int $partId): void
    {
        $pivot = OrderPart::where('order_id', $order->id)->where('part_id', $partId)->first();
        if ($pivot) {
            // повернути на склад
            Part::find($partId)?->increment('stock_quantity', $pivot->quantity);
            $pivot->delete();
        }
    }

    private function generateOrderNumber(): string
    {
        $year    = date('Y');
        $prefix  = "SC-{$year}-";
        $last    = Order::withTrashed()->where('number', 'like', "{$prefix}%")->orderByDesc('id')->first();
        $seq     = $last ? ((int) substr($last->number, -5)) + 1 : 1;
        return $prefix . str_pad($seq, 5, '0', STR_PAD_LEFT);
    }
}
