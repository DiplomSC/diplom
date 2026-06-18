<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'avatar',
        'password',
        'google_id',
        'facebook_id',
        'provider',
        'bonus_balance',
        'loyalty_level_id',
        'referral_code',
        'referred_by',
        'telegram_chat_id',
        'is_blocked',
        'blocked_reason',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
        'facebook_id',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_blocked'        => 'boolean',
        ];
    }

    // зв'язки
    public function loyaltyLevel(): BelongsTo
    {
        return $this->belongsTo(LoyaltyLevel::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function assignedOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'technician_id');
    }

    public function bonusTransactions(): HasMany
    {
        return $this->hasMany(BonusTransaction::class);
    }

    public function technicianProfile(): HasOne
    {
        return $this->hasOne(TechnicianProfile::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    // кастомна імплементація методу sendPasswordResetNotification
    public function sendPasswordResetNotification($token): void 
    {
        $resetUrl = url(route('password.reset', ['token' => $token, 'email' => $this->email], false));
        $appName  = config('app.name');
        $to       = $this->email;
        $subject  = "Запит на зміну пароля для {$appName}";

        $body = <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#111">
            <h2 style="color:#2563eb">{$appName}</h2>
            <p>Ви запросили зкидання паролю вашого аккаунту. Натисніть на кнопку щоб обрати новий пароль:</p>
            <p style="margin:24px 0">
                <a href="{$resetUrl}"
                   style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
                    Змінити пароль
                </a>
            </p>
            <p style="color:#555;font-size:13px">або скопіюйте і вставте це посилання у ваш браузер:<br>
                <a href="{$resetUrl}" style="color:#2563eb;word-break:break-all">{$resetUrl}</a>
            </p>
            <p style="color:#888;font-size:12px">Це посилання буде активним упродовж 60 хвилин. Якщо ви не замовляли зміну пароля, просто проігноруйте це повідомлення.</p>
        </body>
        </html>
        HTML;

        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: {$appName} <" . config('mail.from.address', 'noreply@servicecenter.local') . ">\r\n";

        mail($to, $subject, $body, $headers);
    }

    // допоміжні методи
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isTechnician(): bool
    {
        return $this->hasRole('technician');
    }

    public function isCustomer(): bool
    {
        return $this->hasRole('user');
    }
}
