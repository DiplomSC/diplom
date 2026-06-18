<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Part extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'sku', 'device_category_id', 'description',
        'cost_price', 'sell_price', 'stock_quantity', 'min_stock_alert',
        'supplier', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active'   => 'boolean',
            'cost_price'  => 'decimal:2',
            'sell_price'  => 'decimal:2',
        ];
    }

    public function deviceCategory(): BelongsTo
    {
        return $this->belongsTo(DeviceCategory::class);
    }

    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_parts')
            ->withPivot(['quantity', 'unit_price', 'total_price'])
            ->withTimestamps();
    }

    public function orderParts(): HasMany
    {
        return $this->hasMany(OrderPart::class);
    }

    public function isLowStock(): bool
    {
        return $this->stock_quantity <= $this->min_stock_alert;
    }
}
