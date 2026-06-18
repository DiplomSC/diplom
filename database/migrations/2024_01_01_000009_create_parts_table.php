<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->nullable()->unique();
            $table->foreignId('device_category_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->decimal('cost_price', 10, 2)->default(0);  // purchase price
            $table->decimal('sell_price', 10, 2)->default(0);  // sell price
            $table->integer('stock_quantity')->default(0);
            $table->integer('min_stock_alert')->default(2); // alert when below this
            $table->string('supplier')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('stock_quantity');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parts');
    }
};
