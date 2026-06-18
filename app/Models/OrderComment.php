<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderComment extends Model
{
    protected $fillable = ['order_id', 'user_id', 'body', 'is_internal', 'is_client_visible'];

    protected function casts(): array
    {
        return [
            'is_internal'       => 'boolean',
            'is_client_visible' => 'boolean',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
