<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->date('booking_date');
            $table->time('booking_time');
            $table->string('customer_name');
            $table->string('phone_number');
            $table->string('email');
            $table->string('address')->nullable();
            $table->text('service_notes')->nullable();
            $table->enum('status', ['available', 'booked', 'blocked'])->default('available');
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('set null');
            
            // Index for efficient querying
            $table->index('booking_date');
            $table->index('booking_time');
            $table->unique(['booking_date', 'booking_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
