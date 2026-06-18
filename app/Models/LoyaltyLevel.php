<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoyaltyLevel extends Model
{
    protected $fillable = [
        'name', 'slug', 'min_points', 'max_points',
        'bonus_multiplier', 'max_spend_percent', 'color', 'icon', 'description', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'bonus_multiplier' => 'decimal:2',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
