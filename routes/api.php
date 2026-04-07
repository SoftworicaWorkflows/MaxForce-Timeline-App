<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Notifications routes
Route::prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
});

// Customer routes
Route::prefix('customers')->group(function () {
    Route::get('/', [CustomerController::class, 'index']);
    Route::post('/', [CustomerController::class, 'store']);
    Route::get('/{id}', [CustomerController::class, 'show']);
    Route::put('/{id}', [CustomerController::class, 'update']);
    Route::delete('/{id}', [CustomerController::class, 'destroy']);
    Route::get('/{id}/stats', [CustomerController::class, 'getStats']);
});

// Booking routes
Route::prefix('bookings')->group(function () {
    Route::get('/schedule', [BookingController::class, 'getSchedule']);
    Route::get('/', [BookingController::class, 'getBookings']);
    Route::post('/', [BookingController::class, 'createBooking']);
    Route::get('/suggestions', [BookingController::class, 'getSuggestions']);
    Route::get('/check-availability', [BookingController::class, 'checkAvailability']);
    Route::put('/{id}', [BookingController::class, 'updateBooking']);
    Route::delete('/{id}', [BookingController::class, 'deleteBooking']);
    Route::post('/block', [BookingController::class, 'blockTimeSlot']);
});

// Settings routes
Route::post('/settings/password', [UserController::class, 'updatePassword']);
