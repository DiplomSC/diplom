<?php

use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\LoyaltyController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Customer\BonusController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboard;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\OrderTrackController;
use App\Http\Controllers\Technician\DashboardController as TechDashboard;
use App\Http\Controllers\Technician\OrderController as TechOrderController;
use App\Http\Controllers\TelegramWebhookController;
use Illuminate\Support\Facades\Route;

// ─── публічні сторінки ──────────────────────────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [HomeController::class, 'about'])->name('about');
Route::get('/services', [HomeController::class, 'services'])->name('services');
Route::get('/pricing', [HomeController::class, 'pricing'])->name('pricing');
Route::get('/reviews', [HomeController::class, 'reviews'])->name('reviews');
Route::get('/contact', [HomeController::class, 'contact'])->name('contact');
Route::post('/contact', [HomeController::class, 'contactSubmit'])->name('contact.submit');
Route::get('/faq', [HomeController::class, 'faq'])->name('faq');
Route::get('/blog', [HomeController::class, 'blog'])->name('blog');
Route::get('/blog/{slug}', [HomeController::class, 'blogPost'])->name('blog.post');

Route::get('/track', [OrderTrackController::class, 'trackForm'])->name('track.order');
Route::post('/track', [OrderTrackController::class, 'track'])->name('track.order.search');
Route::get('/repair/new', [OrderTrackController::class, 'createForm'])->name('order.create');
Route::post('/repair/new', [OrderTrackController::class, 'store'])->name('order.store');
Route::post('/ai/diagnose', [OrderTrackController::class, 'aiDiagnose'])->name('ai.diagnose');

// ─── авторизація ─────────────────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'show'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');
    Route::get('/register', [RegisterController::class, 'show'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->name('register.store');
    Route::get('/forgot-password', [PasswordResetController::class, 'showForgotForm'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'reset'])->name('password.update');
    Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])->name('auth.social.redirect');
    Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])->name('auth.social.callback');
});

Route::middleware('auth')->post('/logout', [LoginController::class, 'destroy'])->name('logout');

// ─── користувач ─────────────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:user|admin|technician'])->prefix('account')->name('customer.')->group(function () {
    Route::get('/dashboard', [CustomerDashboard::class, 'index'])->name('dashboard');
    Route::get('/orders', [CustomerOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [CustomerOrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/review', [CustomerOrderController::class, 'submitReview'])->name('orders.review');
    Route::get('/bonuses', [BonusController::class, 'index'])->name('bonuses');
    Route::post('/bonuses/validate-promo', [BonusController::class, 'validatePromo'])->name('bonuses.validate-promo');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::get('/profile/telegram', [ProfileController::class, 'connectTelegram'])->name('profile.telegram');
});

// ─── майстер ───────────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:technician|admin'])->prefix('tech')->name('tech.')->group(function () {
    Route::get('/dashboard', [TechDashboard::class, 'index'])->name('dashboard');
    Route::get('/orders', [TechOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [TechOrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/accept', [TechOrderController::class, 'accept'])->name('orders.accept');
    Route::patch('/orders/{order}/status', [TechOrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/{order}/comments', [TechOrderController::class, 'addComment'])->name('orders.comment');
    Route::post('/orders/{order}/parts', [TechOrderController::class, 'addPart'])->name('orders.parts.add');
    Route::delete('/orders/{order}/parts/{part}', [TechOrderController::class, 'removePart'])->name('orders.parts.remove');
});

// ─── адмін ────────────────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');

    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/new', [AdminOrderController::class, 'createOrder'])->name('orders.new'); //NEW
    Route::post('/orders/store', [AdminOrderController::class, 'store'])->name('orders.store'); //NEW
    Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}', [AdminOrderController::class, 'update'])->name('orders.update');
    Route::delete('/orders/{order}', [AdminOrderController::class, 'destroy'])->name('orders.destroy');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::post('/users/{user}/bonus', [UserController::class, 'addBonus'])->name('users.bonus');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
    Route::post('/services/categories', [ServiceController::class, 'storeCategory'])->name('services.categories.store');
    Route::patch('/services/categories/{category}', [ServiceController::class, 'updateCategory'])->name('services.categories.update');
    Route::delete('/services/categories/{category}', [ServiceController::class, 'destroyCategory'])->name('services.categories.destroy');
    Route::post('/services/categories/reorder', [ServiceController::class, 'reorderCategories'])->name('services.categories.reorder');
    Route::post('/services', [ServiceController::class, 'storeService'])->name('services.store');
    Route::patch('/services/{service}', [ServiceController::class, 'updateService'])->name('services.update');
    Route::delete('/services/{service}', [ServiceController::class, 'destroyService'])->name('services.destroy');
    Route::post('/services/reorder', [ServiceController::class, 'reorderServices'])->name('services.reorder');

    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::patch('/inventory/{part}', [InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('/inventory/{part}', [InventoryController::class, 'destroy'])->name('inventory.destroy');
    Route::post('/inventory/{part}/adjust', [InventoryController::class, 'adjustStock'])->name('inventory.adjust');

    Route::get('/loyalty', [LoyaltyController::class, 'index'])->name('loyalty.index');
    Route::post('/loyalty/levels', [LoyaltyController::class, 'storeLevel'])->name('loyalty.levels.store');
    Route::patch('/loyalty/levels/{loyaltyLevel}', [LoyaltyController::class, 'updateLevel'])->name('loyalty.levels.update');
    Route::delete('/loyalty/levels/{loyaltyLevel}', [LoyaltyController::class, 'destroyLevel'])->name('loyalty.levels.destroy');
    Route::post('/loyalty/promo-codes', [LoyaltyController::class, 'storePromoCode'])->name('loyalty.promo.store');
    Route::patch('/loyalty/promo-codes/{promoCode}', [LoyaltyController::class, 'updatePromoCode'])->name('loyalty.promo.update');
    Route::delete('/loyalty/promo-codes/{promoCode}', [LoyaltyController::class, 'destroyPromoCode'])->name('loyalty.promo.destroy');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::put('/notifications/{notificationTemplate}', [NotificationController::class, 'update'])->name('notifications.update');
    Route::post('/notifications/broadcast', [NotificationController::class, 'broadcast'])->name('notifications.broadcast');

    Route::get('/content/pages', [ContentController::class, 'pages'])->name('content.pages');
    Route::get('/content/pages/{page}/edit', [ContentController::class, 'editPage'])->name('content.pages.edit');
    Route::patch('/content/pages/{page}', [ContentController::class, 'updatePage'])->name('content.pages.update');
    Route::post('/content/pages/{page}/media', [ContentController::class, 'uploadPageMedia'])->name('content.pages.media');
    Route::get('/content/faqs', [ContentController::class, 'faqs'])->name('content.faqs');
    Route::post('/content/faqs', [ContentController::class, 'storeFaq'])->name('content.faqs.store');
    Route::post('/content/faqs/reorder', [ContentController::class, 'reorderFaqs'])->name('content.faqs.reorder');
    Route::patch('/content/faqs/{faq}', [ContentController::class, 'updateFaq'])->name('content.faqs.update');
    Route::delete('/content/faqs/{faq}', [ContentController::class, 'destroyFaq'])->name('content.faqs.destroy');
    Route::post('/content/faq-categories', [ContentController::class, 'storeFaqCategory'])->name('content.faq-categories.store');
    Route::patch('/content/faq-categories/{faqCategory}', [ContentController::class, 'updateFaqCategory'])->name('content.faq-categories.update');
    Route::delete('/content/faq-categories/{faqCategory}', [ContentController::class, 'destroyFaqCategory'])->name('content.faq-categories.destroy');
    Route::post('/content/faq-categories/reorder', [ContentController::class, 'reorderFaqCategories'])->name('content.faq-categories.reorder');
    Route::get('/content/reviews', [ContentController::class, 'reviews'])->name('content.reviews');
    Route::post('/content/reviews', [ContentController::class, 'storeReview'])->name('content.reviews.store');
    Route::patch('/content/reviews/{review}', [ContentController::class, 'updateReview'])->name('content.reviews.update');
    Route::patch('/content/reviews/{review}/approve', [ContentController::class, 'approveReview'])->name('content.reviews.approve');
    Route::patch('/content/reviews/{review}/feature', [ContentController::class, 'featureReview'])->name('content.reviews.feature');
    Route::delete('/content/reviews/{review}', [ContentController::class, 'destroyReview'])->name('content.reviews.destroy');
    Route::get('/content/blog', [ContentController::class, 'blog'])->name('content.blog');
    Route::get('/content/blog/create', [ContentController::class, 'createPost'])->name('content.blog.create');
    Route::post('/content/blog', [ContentController::class, 'storePost'])->name('content.blog.store');
    Route::post('/content/blog/cover', [ContentController::class, 'uploadPostCover'])->name('content.blog.cover');
    Route::get('/content/blog/{post}/edit', [ContentController::class, 'editPost'])->name('content.blog.edit');
    Route::patch('/content/blog/{post}', [ContentController::class, 'updatePost'])->name('content.blog.update');
    Route::delete('/content/blog/{post}', [ContentController::class, 'destroyPost'])->name('content.blog.destroy');

    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/logo', [SettingsController::class, 'updateLogo'])->name('settings.logo');
});

// ─── tg webhook ─────────────────────────────────────────────────────────
Route::post('/telegram/webhook', [TelegramWebhookController::class, 'handle'])
    ->name('telegram.webhook')
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
