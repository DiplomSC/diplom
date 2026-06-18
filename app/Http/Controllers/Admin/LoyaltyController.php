<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyLevel;
use App\Models\PromoCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoyaltyController extends Controller
{
    public function index(): Response
    {
        $levels     = LoyaltyLevel::orderBy('min_points')->get();
        $promoCodes = PromoCode::latest()->get();

        return Inertia::render('Admin/Loyalty/Index', [
            'levels'     => $levels,
            'promoCodes' => $promoCodes,
        ]);
    }

    // рівні лояльності
    public function storeLevel(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'              => ['required', 'string', 'max:100'],
            'min_points'        => ['required', 'integer', 'min:0'],
            'max_points'        => ['nullable', 'integer'],
            'bonus_multiplier'  => ['required', 'numeric', 'min:1', 'max:9999'],
            'max_spend_percent' => ['required', 'integer', 'min:0', 'max:100'],
            'color'             => ['required', 'string'],
            'description'       => ['nullable', 'string'],
        ]);

        $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        LoyaltyLevel::create($data);
        return back()->with('success', 'Рівень лояльності додано.');
    }

    public function updateLevel(Request $request, LoyaltyLevel $loyaltyLevel): RedirectResponse
    {
        $data = $request->validate([
            'name'              => ['required', 'string'],
            'min_points'        => ['required', 'integer', 'min:0'],
            'max_points'        => ['nullable', 'integer'],
            'bonus_multiplier'  => ['required', 'numeric', 'min:1', 'max:9999'],
            'max_spend_percent' => ['required', 'integer', 'min:0', 'max:100'],
            'color'             => ['required', 'string'],
            'description'       => ['nullable', 'string'],
        ]);

        $loyaltyLevel->update($data);
        return back()->with('success', 'Рівень лояльності змінено.');
    }

    public function destroyLevel(LoyaltyLevel $loyaltyLevel): RedirectResponse
    {
        $loyaltyLevel->delete();
        return back()->with('success', 'Рівень лояльності видалений.');
    }

    // промокоди
    public function storePromoCode(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code'             => ['required', 'string', 'max:50', 'unique:promo_codes,code'],
            'type'             => ['required', 'in:percent,fixed,bonus_points'],
            'value'            => ['required', 'numeric', 'min:0'],
            'max_uses'         => ['nullable', 'integer', 'min:1'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'starts_at'        => ['nullable', 'date'],
            'expires_at'       => ['nullable', 'date', 'after_or_equal:starts_at'],
            'description'      => ['nullable', 'string'],
        ]);

        $data['code'] = strtoupper($data['code']);
        PromoCode::create($data);

        return back()->with('success', 'Промокод додано.');
    }

    public function updatePromoCode(Request $request, PromoCode $promoCode): RedirectResponse
    {
        $data = $request->validate([
            'max_uses'    => ['nullable', 'integer', 'min:1'],
            'expires_at'  => ['nullable', 'date'],
            'is_active'   => ['boolean'],
            'description' => ['nullable', 'string'],
        ]);

        $promoCode->update($data);
        return back()->with('success', 'Промокод оновлено.');
    }

    public function destroyPromoCode(PromoCode $promoCode): RedirectResponse
    {
        $promoCode->delete();
        return back()->with('success', 'Промокод видалений.');
    }
}
