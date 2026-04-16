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
        Schema::table('customers', function (Blueprint $table) {
            $table->integer('service_interval')->nullable()->comment('Months: 1, 3, 9, 12');
            $table->date('next_service_date')->nullable();
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->string('category')->default('general')->after('message'); // general, service
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['service_interval', 'next_service_date']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
