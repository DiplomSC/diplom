<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->enum('type', ['percent', 'fixed', 'bonus_points']);
            $table->decimal('value', 10, 2); // % or fixed amount or points
            $table->integer('max_uses')->nullable();
            $table->integer('used_count')->default(0);
            $table->unsignedBigInteger('user_id')->nullable(); // specific user only
            $table->decimal('min_order_amount', 10, 2)->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promo_codes');
    }
};
