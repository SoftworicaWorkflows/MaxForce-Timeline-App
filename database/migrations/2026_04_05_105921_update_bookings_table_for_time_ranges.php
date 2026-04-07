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
        Schema::table('bookings', function (Blueprint $table) {
            // Drop unique constraint on date and time
            $table->dropUnique(['booking_date', 'booking_time']);
            
            // Re-name booking_time to start_time
            $table->renameColumn('booking_time', 'start_time');
            
            // Add end_time
            $table->time('end_time')->after('booking_time')->nullable();
        });

        // Add the end_time as 30 minutes after start_time for existing bookings
        $bookings = \DB::table('bookings')->get();
        foreach ($bookings as $booking) {
            $endTime = \Carbon\Carbon::parse($booking->start_time)->addMinutes(30)->format('H:i');
            \DB::table('bookings')->where('id', $booking->id)->update(['end_time' => $endTime]);
        }

        Schema::table('bookings', function (Blueprint $table) {
            // Re-add index since we use these for lookup
            $table->index(['booking_date', 'start_time', 'end_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['booking_date', 'start_time', 'end_time']);
            $table->renameColumn('start_time', 'booking_time');
            $table->dropColumn('end_time');
            $table->unique(['booking_date', 'booking_time']);
        });
    }
};
