<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CustomerController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Customer routes
Route::prefix('customers')->group(function () {
    Route::get('/', [CustomerController::class, 'index']);
    Route::post('/', [CustomerController::class, 'store']);
    Route::put('/{id}', [CustomerController::class, 'update']);
    Route::get('/{id}/stats', [CustomerController::class, 'getStats']);
});

// Booking routes
Route::prefix('bookings')->group(function () {
    Route::get('/schedule', [BookingController::class, 'getSchedule']);
    Route::get('/', [BookingController::class, 'getBookings']);
    Route::post('/', [BookingController::class, 'createBooking']);
    Route::get('/suggestions', [BookingController::class, 'getSuggestions']);
    Route::put('/{id}', [BookingController::class, 'updateBooking']);
    Route::delete('/{id}', [BookingController::class, 'deleteBooking']);
    Route::post('/block', [BookingController::class, 'blockTimeSlot']);
});
