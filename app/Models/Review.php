<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    protected $fillable = [
        'user_id', 'order_id', 'author_name', 'author_avatar',
        'rating', 'body', 'is_approved', 'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'is_approved' => 'boolean',
            'is_featured' => 'boolean',
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
