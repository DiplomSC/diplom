<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderStatusHistory extends Model
{
    protected $table = 'order_status_history';

    public $timestamps = false;

    protected $fillable = [
        'order_id', 'changed_by', 'status_from', 'status_to', 'comment', 'is_client_visible', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at'       => 'datetime',
            'is_client_visible' => 'boolean',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    public function getStatusFromLabelAttribute(): string
    {
        return Order::$statuses[$this->status_from] ?? $this->status_from ?? '';
    }

    public function getStatusToLabelAttribute(): string
    {
        return Order::$statuses[$this->status_to] ?? $this->status_to;
    }
}
