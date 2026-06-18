<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    private string $token;
    private string $apiBase;

    public function __construct()
    {
        $this->token   = config('services.telegram.bot_token', '');
        $this->apiBase = "https://api.telegram.org/bot{$this->token}";
    }

    public function sendMessage(string|int $chatId, string $text, string $parseMode = 'HTML'): bool
    {
        if (empty($this->token)) {
            Log::debug("Telegram not configured. Would send to {$chatId}: {$text}");
            return false;
        }

        try {
            $response = Http::post("{$this->apiBase}/sendMessage", [
                'chat_id'    => $chatId,
                'text'       => $text,
                'parse_mode' => $parseMode,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Telegram send failed: {$e->getMessage()}");
            return false;
        }
    }

    public function handleWebhook(array $update): void
    {
        $message = $update['message'] ?? $update['callback_query']['message'] ?? null;
        if (! $message) return;

        $chatId = $message['chat']['id'];
        $text   = $message['text'] ?? '';

        match (true) {
            str_starts_with($text, '/start')  => $this->handleStart($chatId, $text),
            str_starts_with($text, '/status') => $this->handleStatus($chatId, $text),
            str_starts_with($text, '/help')   => $this->handleHelp($chatId),
            default                            => $this->sendMessage($chatId, "Не розумію. Відправ /help щоб дізнатися про доступні команди."),
        };
    }

    private function handleStart(string|int $chatId, string $text): void
    {
        $parts = explode(' ', $text);
        $appName = config('app.name');

        $this->sendMessage($chatId, "👋 Вітаємо в боті <b>{$appName}</b>!\n\nВідправте /help щоб дізнатися про доступні команди.");
    }

    private function handleStatus(string|int $chatId, string $text): void
    {
        $parts = explode(' ', trim($text));
        if (count($parts) < 2) {
            $this->sendMessage($chatId, "Як користуватися: /status НОМЕР_ЗАМОВЛЕННЯ\Наприклад: /status SC-2024-00001");
            return;
        }

        $orderNumber = strtoupper($parts[1]);
        $order = \App\Models\Order::where('number', $orderNumber)->first();

        if (! $order) {
            $this->sendMessage($chatId, "❌ Замовлення <b>{$orderNumber}</b> не знайдене.");
            return;
        }

        $status = $order->status_label;
        $device = trim("{$order->device_brand} {$order->device_model}") ?: 'N/A';
        $cost   = $order->final_cost ? "$$order->final_cost" : 'TBD';

        $this->sendMessage($chatId, "📋 <b>Замовлення {$orderNumber}</b>\n\n🔧 Пристрій: {$device}\n📊 Статус: <b>{$status}</b>\n💰 Вартість: {$cost}\n📅 Дата: {$order->created_at->format('j M, Y')}");
    }

    private function handleHelp(string|int $chatId): void
    {
        $appName = config('app.name');
        $this->sendMessage($chatId, "🤖 <b>{$appName} оберіть команду:</b>\n\n/start — Заупск бота\n/status НОМЕР_ЗАМОВЛЕННЯ — перевірити статус замовлення\n/help — Допомога (це повідомлення)");
    }

    public function setWebhook(string $url): array
    {
        if (empty($this->token)) {
            return ['error' => 'Telegram bot token not configured'];
        }

        $response = Http::post("{$this->apiBase}/setWebhook", ['url' => $url]);
        return $response->json();
    }
}
