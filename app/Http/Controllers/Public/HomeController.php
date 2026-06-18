<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\DeviceCategory;
use App\Models\Faq;
use App\Models\Page;
use App\Models\Review;
use App\Models\Setting;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    private function pageMeta(string $slug): array
    {
        $page = Page::where('slug', $slug)->first();
        return [
            'pageContent' => $page?->content,
            'pageMeta'    => [
                'title'       => $page?->title,
                'description' => $page?->meta_description,
            ],
        ];
    }

    public function index(): Response
    {
        $popularServices = Service::with('category')
            ->where('is_popular', true)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->take(6)
            ->get();

        $reviews = Review::where('is_approved', true)
            ->where('is_featured', true)
            ->latest()
            ->take(6)
            ->get();

        return Inertia::render('Public/Home', array_merge($this->pageMeta('home'), [
            'popularServices' => $popularServices,
            'reviews'         => $reviews,
        ]));
    }

    public function about(): Response
    {
        return Inertia::render('Public/About', $this->pageMeta('about'));
    }

    public function services(): Response
    {
        $categories = DeviceCategory::with(['services' => function ($q) {
            $q->where('is_active', true)->orderBy('sort_order');
        }])
        ->whereHas('services', fn($q) => $q->where('is_active', true))
        ->where('is_active', true)
        ->where('slug', '!=', 'uncategorized')
        ->orderBy('sort_order')
        ->get();

        return Inertia::render('Public/Services', array_merge($this->pageMeta('services'), [
            'categories' => $categories,
        ]));
    }

    public function pricing(): Response
    {
        $categories = DeviceCategory::with(['services' => function ($q) {
            $q->where('is_active', true)->orderBy('price_from');
        }])
        ->whereHas('services', fn($q) => $q->where('is_active', true))
        ->where('is_active', true)
        ->where('slug', '!=', 'uncategorized')
        ->orderBy('sort_order')
        ->get();

        return Inertia::render('Public/Pricing', array_merge($this->pageMeta('pricing'), [
            'categories' => $categories,
        ]));
    }

    public function reviews(): Response
    {
        $reviews = Review::where('is_approved', true)
            ->latest()
            ->paginate(12);

        return Inertia::render('Public/Reviews', [
            'reviews' => $reviews,
        ]);
    }

    public function contact(): Response
    {
        $settings = cache()->remember('app_settings', 3600, fn () => Setting::pluck('value', 'key')->toArray());

        return Inertia::render('Public/Contact', array_merge($this->pageMeta('contact'), [
            'googleMapsUrl' => $settings['google_maps_url'] ?? null,
            'contactInfo'   => [
                'address' => $settings['contact_address'] ?? null,
                'phone'   => $settings['contact_phone'] ?? null,
                'email'   => $settings['contact_email'] ?? null,
                'hours'   => $settings['working_hours'] ?? null,
            ],
        ]));
    }

    public function contactSubmit(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'    => ['required', 'string', 'max:100'],
            'email'   => ['required', 'email'],
            'subject' => ['nullable', 'string', 'max:200'],
            'message' => ['required', 'string', 'min:10'],
        ]);

        $to      = config('mail.from.address', 'noreply@servicecenter.local');
        $appName = config('app.name');
        $subject = '[Контакт форма] ' . ($data['subject'] ?: 'Нове повідомлення від ' . $data['name']);

        $body = <<<HTML
        <!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#111">
            <h2 style="color:#2563eb">{$appName} - Контакт форма</h2>
            <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:6px 0;color:#555;width:80px">Від:</td><td style="padding:6px 0"><strong>{$data['name']}</strong> &lt;{$data['email']}&gt;</td></tr>
                <tr><td style="padding:6px 0;color:#555">Тема:</td><td style="padding:6px 0">{$subject}</td></tr>
            </table>
            <hr style="margin:16px 0;border:none;border-top:1px solid #eee">
            <p style="white-space:pre-wrap">{$data['message']}</p>
        </body></html>
        HTML;

        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: {$appName} <{$to}>\r\n";
        $headers .= "Reply-To: {$data['name']} <{$data['email']}>\r\n";

        mail($to, $subject, $body, $headers);

        return back()->with('success', 'Ми отримали ваше повідомлення і надішлемо вам відповідь найближчим часом!');
    }

    public function faq(): Response
    {
        $categoryOrder = \App\Models\FaqCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->pluck('slug');

        $grouped = Faq::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->groupBy('category');

        $ordered = $categoryOrder
            ->filter(fn($slug) => $grouped->has($slug))
            ->mapWithKeys(fn($slug) => [$slug => $grouped[$slug]]);

        $remaining = $grouped->filter(fn($items, $slug) => !$categoryOrder->contains($slug));

        $faqs = $ordered->merge($remaining);

        $categoryNames = \App\Models\FaqCategory::orderBy('sort_order')
            ->pluck('name', 'slug');

        return Inertia::render('Public/Faq', array_merge($this->pageMeta('faq'), [
            'faqs'          => $faqs,
            'categoryNames' => $categoryNames,
        ]));
    }

    public function blog(): Response
    {
        $posts = BlogPost::published()->with('author')->latest('published_at')->paginate(9);
        return Inertia::render('Public/Blog', ['posts' => $posts]);
    }

    public function blogPost(string $slug): Response
    {
        $post = BlogPost::published()->where('slug', $slug)->with('author')->firstOrFail();
        $related = BlogPost::published()->where('id', '!=', $post->id)->latest('published_at')->take(3)->get();
        return Inertia::render('Public/BlogPost', ['post' => $post, 'related' => $related]);
    }
}
