<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bonus_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->enum('type', ['earn', 'spend', 'expire', 'refund', 'manual', 'referral', 'promo']);
            $table->integer('amount'); // positive = earn, negative = spend
            $table->integer('balance_after');
            $table->string('description')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_expired')->default(false);
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();
            $table->index(['user_id', 'type']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bonus_transactions');
    }
};
