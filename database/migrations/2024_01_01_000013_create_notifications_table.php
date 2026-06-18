<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // order_created, status_changed, bonus_earned
            $table->string('name');
            $table->string('subject')->nullable(); // email subject
            $table->text('email_body')->nullable();
            $table->text('telegram_body')->nullable();
            $table->boolean('email_enabled')->default(true);
            $table->boolean('telegram_enabled')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('notification_templates');
    }
};
