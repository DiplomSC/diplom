<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('part_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2); // price at time of use
            $table->decimal('total_price', 10, 2);
            $table->timestamps();

            $table->unique(['order_id', 'part_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_parts');
    }
};
