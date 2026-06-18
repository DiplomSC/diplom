<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'device_category_id', 'name', 'slug', 'description',
        'price_from', 'price_to', 'duration_minutes', 'bonus_earn',
        'icon', 'is_popular', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_popular' => 'boolean',
            'is_active'  => 'boolean',
            'price_from' => 'decimal:2',
            'price_to'   => 'decimal:2',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(DeviceCategory::class, 'device_category_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
