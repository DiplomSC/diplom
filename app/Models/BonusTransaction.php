<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BonusTransaction extends Model
{
    protected $fillable = [
        'user_id', 'order_id', 'type', 'amount', 'balance_after',
        'description', 'expires_at', 'is_expired',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'is_expired' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
