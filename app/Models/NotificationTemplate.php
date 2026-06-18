<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    protected $fillable = [
        'key', 'name', 'subject', 'email_body', 'telegram_body',
        'email_enabled', 'telegram_enabled', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'email_enabled'    => 'boolean',
            'telegram_enabled' => 'boolean',
            'is_active'        => 'boolean',
        ];
    }

    public static function forKey(string $key): ?self
    {
        return static::where('key', $key)->where('is_active', true)->first();
    }
}
