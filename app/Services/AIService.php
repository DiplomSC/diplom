<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    private string $apiKey;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.openai.key', '');
        $this->model  = 'gpt-4o-mini';
    }

    public function diagnose(string $deviceType, string $deviceModel, string $issueDescription, array $imageUrls = []): array
    {
        if (empty($this->apiKey)) {
            return $this->mockDiagnosis($deviceType, $issueDescription);
        }

        try {
            $messages = [
                [
                    'role'    => 'system',
                    'content' => $this->buildSystemPrompt(),
                ],
                [
                    'role'    => 'user',
                    'content' => $this->buildUserPrompt($deviceType, $deviceModel, $issueDescription, $imageUrls),
                ],
            ];

            $payload = [
                'model'       => $this->model,
                'messages'    => $messages,
                'temperature' => 0.3,
                'max_tokens'  => 600,
                'response_format' => ['type' => 'json_object'],
            ];

            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post('https://api.openai.com/v1/chat/completions', $payload);

            if ($response->failed()) {
                Log::error('OpenAI API error: ' . $response->body());
                return $this->mockDiagnosis($deviceType, $issueDescription);
            }

            $content = $response->json('choices.0.message.content', '{}');
            $data    = json_decode($content, true);

            return [
                'diagnosis'       => $data['diagnosis'] ?? 'Не можу визначити',
                'likely_cause'    => $data['likely_cause'] ?? '',
                'estimated_cost'  => $data['estimated_cost'] ?? '',
                'recommendations' => $data['recommendations'] ?? [],
                'urgency'         => $data['urgency'] ?? 'normal',
            ];
        } catch (\Exception $e) {
            Log::error("AI Service error: {$e->getMessage()}");
            return $this->mockDiagnosis($deviceType, $issueDescription);
        }
    }

    private function buildSystemPrompt(): string
    {
        return <<<PROMPT
You are a professional device repair technician AI assistant. Analyze the device issue and provide a JSON response with the following structure:
{
  "diagnosis": "Brief diagnosis of the issue",
  "likely_cause": "Most likely cause of the problem",
  "estimated_cost": "Price range estimate e.g. 500-1200 UAH",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "urgency": "low|normal|high|urgent"
}
Be specific, professional, and helpful. Base estimates on common repair industry pricing.
Answer in Ukrainian only. All estimates provide in UAH currency only.
PROMPT;
    }

    private function buildUserPrompt(string $deviceType, string $deviceModel, string $issue, array $imageUrls): array|string
    {
        $text = "Device type: {$deviceType}\nDevice model: {$deviceModel}\nIssue description: {$issue}";

        if (empty($imageUrls)) {
            return $text;
        }

        $content = [['type' => 'text', 'text' => $text]];
        foreach (array_slice($imageUrls, 0, 3) as $url) {
            $content[] = ['type' => 'image_url', 'image_url' => ['url' => $url, 'detail' => 'low']];
        }
        return $content;
    }

    private function mockDiagnosis(string $deviceType, string $issue): array
    {
        return [
            'diagnosis'      => 'Виходячи з опису, це одна з типових проблем.',
            'likely_cause'   => 'Потрібна професійна діагностика нашим майстром.',
            'estimated_cost' => 'Від 300 грн.',
            'recommendations' => [
                'Принесіть пристрій в наш сервісний центр для повної діагностики',
                'За можливісю зробіть бекап даних з пристрою',
                'Надайте максимально детальну інформацію про цю проблему нашим спеціалістам',
            ],
            'urgency' => 'normal',
        ];
    }
}
