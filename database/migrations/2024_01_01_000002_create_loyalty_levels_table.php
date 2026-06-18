<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_levels', function (Blueprint $table) {
            $table->id();
            $table->string('name');               // Bronze, Silver, Gold
            $table->string('slug')->unique();
            $table->integer('min_points')->default(0);
            $table->integer('max_points')->nullable();
            $table->decimal('bonus_multiplier', 4, 2)->default(1.00); // earn multiplier
            $table->integer('max_spend_percent')->default(30); // max % of order paid by bonuses
            $table->string('color')->default('#CD7F32'); // badge color
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_levels');
    }
};
