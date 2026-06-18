<?php

namespace App\Http\Controllers;

use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TelegramWebhookController extends Controller
{
    public function __construct(private readonly TelegramService $telegram) {}

    public function handle(Request $request): Response
    {
        $update = $request->all();
        $this->telegram->handleWebhook($update);
        return response('OK', 200);
    }
}
