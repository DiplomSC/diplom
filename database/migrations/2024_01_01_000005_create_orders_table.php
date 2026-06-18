<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('number', 20)->unique(); // SC-2024-00001
            $table->unsignedBigInteger('user_id')->nullable(); // null for guest
            $table->unsignedBigInteger('technician_id')->nullable();
            $table->unsignedBigInteger('device_category_id');
            $table->unsignedBigInteger('service_id')->nullable();

            // Customer info (for guests or cache)
            $table->string('customer_name');
            $table->string('customer_phone', 20);
            $table->string('customer_email')->nullable();

            // Device info
            $table->string('device_brand')->nullable();
            $table->string('device_model')->nullable();
            $table->string('device_serial')->nullable();

            // Issue
            $table->text('issue_description');
            $table->text('ai_diagnosis')->nullable();

            // Status
            $table->enum('status', [
                'new',
                'accepted',
                'diagnosing',
                'waiting_parts',
                'in_repair',
                'ready',
                'completed',
                'cancelled',
                'rejected',
            ])->default('new');

            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');

            // Pricing
            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->decimal('final_cost', 10, 2)->nullable();
            $table->integer('bonus_used')->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->string('promo_code')->nullable();
            $table->decimal('total_paid', 10, 2)->nullable();

            // Dates
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('deadline_at')->nullable();

            // Internal
            $table->text('admin_notes')->nullable();
            $table->boolean('notified_ready')->default(false);

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('technician_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('device_category_id')->references('id')->on('device_categories');
            $table->foreign('service_id')->references('id')->on('services')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
            $table->index(['technician_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
