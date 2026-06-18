<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\FaqCategory;
use App\Models\Page;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    // CMS (інформаційні сторінки)
    public function pages(): Response
    {
        $pages = Page::all();
        return Inertia::render('Admin/Content/Pages', ['pages' => $pages]);
    }

    public function editPage(Page $page): Response
    {
        return Inertia::render('Admin/Content/PageEdit', ['page' => $page]);
    }

    public function updatePage(Request $request, Page $page): RedirectResponse
    {
        $data = $request->validate([
            'title'            => ['required', 'string'],
            'meta_description' => ['nullable', 'string'],
            'is_published'     => ['boolean'],
            'content'          => ['nullable', 'array'],
        ]);

        $page->update($data);
        return back()->with('success', 'Сторінка оновлена.');
    }

    public function uploadPageMedia(Request $request, Page $page): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'file'  => ['required', 'file', 'mimes:jpg,jpeg,png,gif,webp,svg,mp4,webm,ogg', 'max:51200'],
            'field' => ['required', 'string', 'alpha_dash'],
        ]);

        $ext  = $request->file('file')->getClientOriginalExtension();
        $path = $request->file('file')->storeAs(
            "pages/{$page->slug}",
            "{$request->field}_{$page->slug}.{$ext}",
            'public'
        );

        return response()->json(['url' => '/storage/' . $path]);
    }

    // FAQ
    public function faqs(): Response
    {
        $faqs       = Faq::orderBy('sort_order')->get();
        $categories = FaqCategory::orderBy('sort_order')->get();
        return Inertia::render('Admin/Content/Faqs', [
            'faqs'       => $faqs,
            'categories' => $categories,
        ]);
    }

    public function storeFaqCategory(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ]);
        $data['slug']       = Str::slug($data['name']);
        $data['sort_order'] = FaqCategory::max('sort_order') + 1;
        FaqCategory::create($data);
        return back()->with('success', 'Категорія створена.');
    }

    public function updateFaqCategory(Request $request, FaqCategory $faqCategory): RedirectResponse
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ]);
        $data['slug'] = Str::slug($data['name']);
        $faqCategory->update($data);
        return back()->with('success', 'Категорія оновлена.');
    }

    public function destroyFaqCategory(FaqCategory $faqCategory): RedirectResponse
    {
        $faqCategory->delete();
        return back()->with('success', 'Category deleted.');
    }

    public function reorderFaqCategories(Request $request): RedirectResponse
    {
        foreach ($request->input('order', []) as $index => $id) {
            FaqCategory::where('id', $id)->update(['sort_order' => $index]);
        }
        return back();
    }

    public function reorderFaqs(Request $request): RedirectResponse
    {
        foreach ($request->input('order', []) as $index => $id) {
            Faq::where('id', $id)->update(['sort_order' => $index]);
        }
        return back();
    }

    public function storeFaq(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'question'   => ['required', 'string'],
            'answer'     => ['required', 'string'],
            'category'   => ['nullable', 'string'],
            'sort_order' => ['integer'],
        ]);

        Faq::create($data);
        return back()->with('success', 'Питання додане.');
    }

    public function updateFaq(Request $request, Faq $faq): RedirectResponse
    {
        $data = $request->validate([
            'question'   => ['required', 'string'],
            'answer'     => ['required', 'string'],
            'category'   => ['nullable', 'string'],
            'sort_order' => ['integer'],
            'is_active'  => ['boolean'],
        ]);

        $faq->update($data);
        return back()->with('success', 'Питання оновлене.');
    }

    public function destroyFaq(Faq $faq): RedirectResponse
    {
        $faq->delete();
        return back()->with('success', 'Питання видалене.');
    }

    // відгуки
    public function reviews(): Response
    {
        $reviews = Review::with(['user', 'order'])->latest()->paginate(20);
        return Inertia::render('Admin/Content/Reviews', ['reviews' => $reviews]);
    }

    public function storeReview(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'author_name' => ['required', 'string', 'max:255'],
            'rating'      => ['required', 'integer', 'min:1', 'max:5'],
            'body'        => ['required', 'string'],
            'is_approved' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        Review::create($data);
        return back()->with('success', 'Відгук доданий.');
    }

    public function updateReview(Request $request, Review $review): RedirectResponse
    {
        $data = $request->validate([
            'author_name' => ['required', 'string', 'max:255'],
            'rating'      => ['required', 'integer', 'min:1', 'max:5'],
            'body'        => ['required', 'string'],
            'is_approved' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        $review->update($data);
        return back()->with('success', 'Видгук оновлено.');
    }

    public function approveReview(Review $review): RedirectResponse
    {
        $review->update(['is_approved' => true]);
        return back()->with('success', 'Відгук підтверджено.');
    }

    public function featureReview(Review $review): RedirectResponse
    {
        $review->update(['is_featured' => ! $review->is_featured]);
        return back()->with('success', 'Видгук оновлено.');
    }

    public function destroyReview(Review $review): RedirectResponse
    {
        $review->delete();
        return back()->with('success', 'Відгук видалений.');
    }

    // блог
    public function blog(): Response
    {
        $posts = BlogPost::with('author')->orderByDesc('published_at')->orderByDesc('created_at')->paginate(20);
        return Inertia::render('Admin/Content/Blog', ['posts' => $posts]);
    }

    public function createPost(): Response
    {
        return Inertia::render('Admin/Content/BlogForm', ['post' => null]);
    }

    public function storePost(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title'        => ['required', 'string'],
            'excerpt'      => ['nullable', 'string'],
            'body'         => ['required', 'string'],
            'cover_image'  => ['nullable', 'string'],
            'category'     => ['nullable', 'string'],
            'is_published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
        ]);

        $data['author_id']    = $request->user()->id;
        $data['slug']         = Str::slug($data['title']) . '-' . time();
        $data['published_at'] = $data['is_published'] ? ($data['published_at'] ?? now()) : null;

        BlogPost::create($data);
        return redirect()->route('admin.content.blog')->with('success', 'Пост створений.');
    }

    public function uploadPostCover(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'mimes:jpg,jpeg,png,gif,webp', 'max:4096']]);

        $path = $request->file('file')->store('blog', 'public');
        return response()->json(['url' => '/storage/' . $path]);
    }

    public function editPost(BlogPost $post): Response
    {
        return Inertia::render('Admin/Content/BlogForm', ['post' => $post]);
    }

    public function updatePost(Request $request, BlogPost $post): RedirectResponse
    {
        $data = $request->validate([
            'title'        => ['required', 'string'],
            'excerpt'      => ['nullable', 'string'],
            'body'         => ['required', 'string'],
            'cover_image'  => ['nullable', 'string'],
            'category'     => ['nullable', 'string'],
            'is_published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
        ]);

        $data['published_at'] = $data['is_published'] ? ($data['published_at'] ?? $post->published_at ?? now()) : null;

        $post->update($data);
        return back()->with('success', 'Пост оновлений.');
    }

    public function destroyPost(BlogPost $post): RedirectResponse
    {
        $post->delete();
        return redirect()->route('admin.content.blog')->with('success', 'Пост видалений.');
    }
}
