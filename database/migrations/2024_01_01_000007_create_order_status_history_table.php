<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('changed_by')->nullable(); // user_id
            $table->string('status_from')->nullable();
            $table->string('status_to');
            $table->text('comment')->nullable();
            $table->boolean('is_client_visible')->default(true);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('changed_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['order_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
    }
};
