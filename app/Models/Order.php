<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'number', 'user_id', 'technician_id', 'device_category_id', 'service_id',
        'customer_name', 'customer_phone', 'customer_email',
        'device_brand', 'device_model', 'device_serial',
        'issue_description', 'ai_diagnosis',
        'status', 'priority',
        'estimated_cost', 'final_cost', 'bonus_used', 'discount', 'promo_code', 'total_paid',
        'accepted_at', 'completed_at', 'deadline_at',
        'admin_notes', 'notified_ready',
    ];

    protected function casts(): array
    {
        return [
            'accepted_at'    => 'datetime',
            'completed_at'   => 'datetime',
            'deadline_at'    => 'datetime',
            'estimated_cost' => 'decimal:2',
            'final_cost'     => 'decimal:2',
            'discount'       => 'decimal:2',
            'total_paid'     => 'decimal:2',
            'notified_ready' => 'boolean',
        ];
    }

    public static array $statuses = [
        'new'           => 'Нове',
        'accepted'      => 'Прийняте',
        'diagnosing'    => 'Діагностика',
        'waiting_parts' => 'Очікує деталі',
        'in_repair'     => 'Ремонтується',
        'ready'         => 'Готове',
        'completed'     => 'Завершене',
        'cancelled'     => 'Скасоване',
        'rejected'      => 'Відхилене',
    ];

    public static array $statusColors = [
        'new'           => 'gray',
        'accepted'      => 'blue',
        'diagnosing'    => 'purple',
        'waiting_parts' => 'yellow',
        'in_repair'     => 'orange',
        'ready'         => 'green',
        'completed'     => 'green',
        'cancelled'     => 'red',
        'rejected'      => 'red',
    ];

    public function getStatusLabelAttribute(): string
    {
        return self::$statuses[$this->status] ?? $this->status;
    }

    public function getStatusColorAttribute(): string
    {
        return self::$statusColors[$this->status] ?? 'gray';
    }

    // зв'язки
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function deviceCategory(): BelongsTo
    {
        return $this->belongsTo(DeviceCategory::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(OrderImage::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(OrderComment::class)->orderBy('created_at');
    }

    public function clientComments(): HasMany
    {
        return $this->hasMany(OrderComment::class)->where('is_internal', false)->orderBy('created_at');
    }

    public function parts(): BelongsToMany
    {
        return $this->belongsToMany(Part::class, 'order_parts')
            ->withPivot(['quantity', 'unit_price', 'total_price'])
            ->withTimestamps();
    }

    public function orderParts(): HasMany
    {
        return $this->hasMany(OrderPart::class);
    }

    public function bonusTransactions(): HasMany
    {
        return $this->hasMany(BonusTransaction::class);
    }

    public function review(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['completed', 'cancelled', 'rejected']);
    }

    public function scopeForTechnician($query, int $techId)
    {
        return $query->where('technician_id', $techId);
    }
}
