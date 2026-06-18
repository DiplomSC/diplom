<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TechnicianProfile extends Model
{
    protected $fillable = [
        'user_id', 'bio', 'specializations', 'experience_years',
        'rating', 'total_repairs', 'is_available',
    ];

    protected function casts(): array
    {
        return [
            'specializations' => 'array',
            'is_available'    => 'boolean',
            'rating'          => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
