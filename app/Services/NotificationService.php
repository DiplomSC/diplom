<?php

namespace App\Services;

use App\Models\NotificationTemplate;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function __construct(
        private readonly TelegramService $telegram,
    ) {}

    public function orderCreated(Order $order): void
    {
        $this->send('order_created', $order, $order->user);
    }

    public function statusChanged(Order $order, string $oldStatus, string $newStatus): void
    {
        $this->send('status_changed', $order, $order->user, [
            'old_status' => Order::$statuses[$oldStatus] ?? $oldStatus,
            'new_status' => Order::$statuses[$newStatus] ?? $newStatus,
        ]);
    }

    public function bonusEarned(User $user, int $amount, Order $order): void
    {
        $this->sendToUser('bonus_earned', $user, [
            'amount'       => $amount,
            'order_number' => $order->number,
            'new_balance'  => $user->bonus_balance,
        ]);
    }

    private function send(string $key, Order $order, ?User $user, array $extra = []): void
    {
        $template = NotificationTemplate::forKey($key);
        if (! $template) return;

        $vars = array_merge([
            'order_number'   => $order->number,
            'customer_name'  => $order->customer_name,
            'device'         => trim("{$order->device_brand} {$order->device_model}"),
            'status'         => Order::$statuses[$order->status] ?? $order->status,
            'issue'          => $order->issue_description,
            'app_name'       => config('app.name'),
            'app_url'        => config('app.url'),
        ], $extra);

        // Email
        if ($template->email_enabled && $order->customer_email) {
            $this->sendEmail(
                $order->customer_email,
                $this->interpolate($template->subject ?? '', $vars),
                $this->interpolate($template->email_body ?? '', $vars),
            );
        }

        // Telegram
        if ($template->telegram_enabled && $user?->telegram_chat_id) {
            $this->telegram->sendMessage(
                $user->telegram_chat_id,
                $this->interpolate($template->telegram_body ?? '', $vars),
            );
        }
    }

    private function sendToUser(string $key, User $user, array $vars = []): void
    {
        $template = NotificationTemplate::forKey($key);
        if (! $template) return;

        $vars = array_merge(['app_name' => config('app.name'), 'user_name' => $user->name], $vars);

        if ($template->email_enabled && $user->email) {
            $this->sendEmail(
                $user->email,
                $this->interpolate($template->subject ?? '', $vars),
                $this->interpolate($template->email_body ?? '', $vars),
            );
        }

        if ($template->telegram_enabled && $user->telegram_chat_id) {
            $this->telegram->sendMessage(
                $user->telegram_chat_id,
                $this->interpolate($template->telegram_body ?? '', $vars),
            );
        }
    }

    private function sendEmail(string $to, string $subject, string $body): void
    {
        try {
            Mail::html($this->wrapHtml($subject, $body), function ($message) use ($to, $subject) {
                $message->to($to)->subject($subject);
            });
        } catch (\Exception $e) {
            Log::error("Email send failed: {$e->getMessage()}");
        }
    }

    private function interpolate(string $template, array $vars): string
    {
        foreach ($vars as $key => $value) {
            $template = str_replace("{{{$key}}}", (string) $value, $template);
        }
        return $template;
    }

    public function sendRaw(User $user, string $channel, string $subject, string $message): void
    {
        if ($channel === 'email' && $user->email) {
            $this->sendEmail($user->email, $subject, nl2br(htmlspecialchars($message)));
        } elseif ($channel === 'telegram' && $user->telegram_chat_id) {
            $this->telegram->sendMessage($user->telegram_chat_id, $message);
        }
    }

    private function wrapHtml(string $subject, string $body): string
    {
        $appName = config('app.name');
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>{$subject}</title></head>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <div style="background:#2563eb;padding:20px;border-radius:8px 8px 0 0">
                <h1 style="color:white;margin:0;font-size:20px">{$appName}</h1>
            </div>
            <div style="background:#f9fafb;padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
                {$body}
            </div>
            <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:20px">
                &copy; {$appName}. Це автоматизоване повідомлення.
            </p>
        </body>
        </html>
        HTML;
    }
}
