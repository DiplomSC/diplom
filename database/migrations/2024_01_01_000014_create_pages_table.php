<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // CMS pages for editable content
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // home, about, services, pricing, contact, faq
            $table->string('title');
            $table->text('meta_description')->nullable();
            $table->json('content')->nullable(); // flexible JSON content blocks
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        // FAQ
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->text('answer');
            $table->string('category')->default('general');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Reviews/Testimonials
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->string('author_name');
            $table->string('author_avatar')->nullable();
            $table->tinyInteger('rating')->default(5); // 1-5
            $table->text('body');
            $table->boolean('is_approved')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();
        });

        // Blog
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('excerpt')->nullable();
            $table->longText('body');
            $table->string('cover_image')->nullable();
            $table->unsignedBigInteger('author_id')->nullable();
            $table->string('category')->default('general');
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('author_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('pages');
    }
};
