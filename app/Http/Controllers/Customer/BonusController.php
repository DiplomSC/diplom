<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyLevel;
use App\Models\PromoCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BonusController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user()->load('loyaltyLevel');

        $transactions = $user->bonusTransactions()
            ->with('order')
            ->latest()
            ->paginate(20);

        $levels = LoyaltyLevel::orderBy('min_points')->get();

        $totalEarned = $user->bonusTransactions()
            ->where('type', 'earn')
            ->sum('amount');

        //$totalEarned = $totalEarned ? $totalEarned : $user->bonus_balance;

        $currentLevelIndex = $levels->search(fn($l) => $l->id === $user->loyalty_level_id);
        $nextLevel = $currentLevelIndex !== false ? $levels->get($currentLevelIndex + 1) : null;
        $progress  = 0;
        if ($nextLevel && $user->loyaltyLevel) {
            $range    = $nextLevel->min_points - $user->loyaltyLevel->min_points;
            $earned   = $totalEarned - $user->loyaltyLevel->min_points;
            $progress = $range > 0 ? min(100, (int) ($earned / $range * 100)) : 100;
        }

        return Inertia::render('Customer/Bonuses', [
            'balance'      => $user->bonus_balance,
            'transactions' => $transactions,
            'levels'       => $levels,
            'currentLevel' => $user->loyaltyLevel,
            'nextLevel'    => $nextLevel,
            'progress'     => $progress,
            'totalEarned'  => $totalEarned,
        ]);
    }

    public function validatePromo(Request $request): JsonResponse
    {
        $request->validate(['code' => ['required', 'string']]);

        $promo = PromoCode::where('code', strtoupper($request->code))->first();

        if (! $promo || ! $promo->isValid()) {
            return response()->json(['valid' => false, 'message' => 'Невірний або протермінований промокод.'], 422);
        }

        return response()->json([
            'valid'       => true,
            'type'        => $promo->type,
            'value'       => $promo->value,
            'description' => $promo->description,
        ]);
    }
}
