<?php

namespace App\Services;

use App\Models\BonusTransaction;
use App\Models\LoyaltyLevel;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BonusService
{
    public function earn(User $user, int $amount, ?Order $order = null, string $description = '', string $type = 'earn'): BonusTransaction
    {
        return DB::transaction(function () use ($user, $amount, $order, $description, $type) {
            $newBalance = $user->bonus_balance + $amount;

            $user->update(['bonus_balance' => $newBalance]);

            $tx = BonusTransaction::create([
                'user_id'       => $user->id,
                'order_id'      => $order?->id,
                'type'          => $type,
                'amount'        => $amount,
                'balance_after' => $newBalance,
                'description'   => $description,
                'expires_at'    => now()->addMonths(6),
            ]);

            $this->updateLoyaltyLevel($user);

            return $tx;
        });
    }

    public function spend(User $user, int $amount, ?Order $order = null, string $description = ''): BonusTransaction
    {
        if ($user->bonus_balance < $amount) {
            throw new \RuntimeException('Insufficient bonus balance.');
        }

        return DB::transaction(function () use ($user, $amount, $order, $description) {
            $newBalance = $user->bonus_balance - $amount;

            $user->update(['bonus_balance' => $newBalance]);

            return BonusTransaction::create([
                'user_id'       => $user->id,
                'order_id'      => $order?->id,
                'type'          => 'spend',
                'amount'        => -$amount,
                'balance_after' => $newBalance,
                'description'   => $description,
            ]);
        });
    }

    public function awardForOrder(Order $order): ?BonusTransaction
    {
        if (! $order->user_id || ! $order->final_cost) return null;

        $user  = $order->user;
        $level = $user->loyaltyLevel;
        $base  = (int) ($order->final_cost / 10); // 1 бонус за кожні 10 грн

        if ($level) {
            $base = (int) ($base * $level->bonus_multiplier);
        }

        if ($base <= 0) return null;

        return $this->earn($user, $base, $order, "Нараховані бонуси за замовлення {$order->number}");
    }

    public function addManual(User $user, int $amount, string $description = ''): BonusTransaction
    {
        return $this->earn($user, $amount, null, $description, 'manual');
    }

    public function expireOldBonuses(): int
    {
        $expired = BonusTransaction::where('type', 'earn')
            ->where('is_expired', false)
            ->where('expires_at', '<', now())
            ->get();

        $count = 0;
        foreach ($expired as $tx) {
            $tx->update(['is_expired' => true]);

            // списання з балансу
            $user = $tx->user;
            if ($user && $user->bonus_balance > 0) {
                $deduct = min($tx->amount, $user->bonus_balance);
                $this->spend($user, $deduct, null, 'Bonus points expired');
                
                // позначити я прострочені
                BonusTransaction::where('user_id', $user->id)
                    ->where('type', 'spend')
                    ->latest()
                    ->first()
                    ?->update(['type' => 'expire']);
            }
            $count++;
        }

        return $count;
    }

    public function updateLoyaltyLevel(User $user): void
    {
        $totalEarned = BonusTransaction::where('user_id', $user->id)
            ->where('type', 'earn')
            ->sum('amount');

        $level = LoyaltyLevel::where('min_points', '<=', $totalEarned)
            ->orderByDesc('min_points')
            ->first();

        if ($level && $level->id !== $user->loyalty_level_id) {
            $user->update(['loyalty_level_id' => $level->id]);
        }
    }
}
