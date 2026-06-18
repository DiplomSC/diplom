<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class OrderImage extends Model
{
    protected $fillable = ['order_id', 'path', 'disk', 'original_name', 'size'];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }
}
