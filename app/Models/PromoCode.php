<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromoCode extends Model
{
    protected $fillable = [
        'code', 'type', 'value', 'max_uses', 'used_count', 'user_id',
        'min_order_amount', 'starts_at', 'expires_at', 'is_active', 'description',
    ];

    protected function casts(): array
    {
        return [
            'starts_at'        => 'datetime',
            'expires_at'       => 'datetime',
            'is_active'        => 'boolean',
            'value'            => 'decimal:2',
            'min_order_amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isValid(): bool
    {
        if (! $this->is_active) return false;
        if ($this->max_uses && $this->used_count >= $this->max_uses) return false;
        if ($this->starts_at && $this->starts_at->isFuture()) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        return true;
    }
}
